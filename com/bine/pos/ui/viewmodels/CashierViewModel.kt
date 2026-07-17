package com.bine.pos.ui.viewmodels

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.bine.pos.data.local.ProductEntity
import com.bine.pos.data.local.SaleEntity
import com.bine.pos.data.local.SaleItemEntity
import com.bine.pos.data.local.CustomerDebtEntity
import com.bine.pos.data.local.TransactionDao
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext

/**
 * Model representation of an active shopping cart item.
 */
data class CartItem(
    val product: ProductEntity,
    val quantity: Int
)

/**
 * UI State container for the Cashier Terminal screen.
 */
data class CashierUiState(
    val cartItems: List<CartItem> = emptyList(),
    val manualAmountString: String = "0",
    val selectedCategory: String = "Groceries",
    val checkoutSuccess: Boolean = false,
    val isProcessing: Boolean = false,
    val errorMessage: String? = null
)

/**
 * CashierViewModel coordinates cashier inputs (numpad values and product selections)
 * with the Room SQLite transactional database layer. Fully offline and thread-safe.
 */
class CashierViewModel(
    private val transactionDao: TransactionDao
) : ViewModel() {

    private val _uiState = MutableStateFlow(CashierUiState())
    val uiState: StateFlow<CashierUiState> = _uiState.asStateFlow()

    // --- 1. Manual Numpad Input Operations ---
    
    fun pressNumpadKey(key: String) {
        _uiState.update { currentState ->
            val currentAmount = currentState.manualAmountString
            val newAmount = if (currentAmount == "0") key else {
                if (currentAmount.length >= 10) currentAmount else currentAmount + key
            }
            currentState.copy(manualAmountString = newAmount, errorMessage = null)
        }
    }

    fun deleteNumpadDigit() {
        _uiState.update { currentState ->
            val currentAmount = currentState.manualAmountString
            val newAmount = if (currentAmount.length <= 1) "0" else currentAmount.dropLast(1)
            currentState.copy(manualAmountString = newAmount)
        }
    }

    fun clearNumpadAmount() {
        _uiState.update { currentState ->
            currentState.copy(manualAmountString = "0")
        }
    }

    // --- 2. Shopping Cart Operations ---

    fun addProductToCart(product: ProductEntity) {
        if (product.remaining <= 0) {
            _uiState.update { it.copy(errorMessage = "Product is currently out of stock") }
            return
        }

        _uiState.update { currentState ->
            val existingItem = currentState.cartItems.find { it.product.id == product.id }
            val updatedItems = if (existingItem != null) {
                if (existingItem.quantity >= product.remaining) {
                    return@update currentState.copy(errorMessage = "Cannot exceed available stock limit")
                }
                currentState.cartItems.map {
                    if (it.product.id == product.id) it.copy(quantity = it.quantity + 1) else it
                }
            } else {
                currentState.cartItems + CartItem(product, 1)
            }
            currentState.copy(cartItems = updatedItems, errorMessage = null)
        }
    }

    fun removeProductFromCart(productId: String) {
        _uiState.update { currentState ->
            val updatedItems = currentState.cartItems.filter { it.product.id != productId }
            currentState.copy(cartItems = updatedItems)
        }
    }

    fun clearCart() {
        _uiState.update { currentState ->
            currentState.copy(cartItems = emptyList())
        }
    }

    fun selectCategory(category: String) {
        _uiState.update { currentState ->
            currentState.copy(selectedCategory = category)
        }
    }

    // --- 3. Financial Helper Methods ---

    fun getCartTotal(): Double {
        val state = _uiState.value
        return if (state.cartItems.isNotEmpty()) {
            state.cartItems.sumOf { it.product.sellingPrice * it.quantity }
        } else {
            state.manualAmountString.toDoubleOrNull() ?: 0.0
        }
    }

    fun getCartTotalCost(): Double {
        val state = _uiState.value
        return if (state.cartItems.isNotEmpty()) {
            state.cartItems.sumOf { it.product.costPrice * it.quantity }
        } else {
            // Apply standard local merchant margin fallback of 15% (cost = 85% of total retail price)
            val total = state.manualAmountString.toDoubleOrNull() ?: 0.0
            total * 0.85
        }
    }

    // --- 4. Transaction Checkout Operations ---

    /**
     * Executes transaction checkout asynchronously on Dispatchers.IO.
     * Integrates with Room atomic Transactions to update sales logs, debt tables, and product stock counts.
     */
    fun processCheckout(
        paymentMethod: String, // E.g. "Cash", "Airtel Money", "MTN MoMo", "Nkongole (Debt)"
        debtorId: String? = null
    ) {
        val total = getCartTotal()
        if (total <= 0.0) {
            _uiState.update { it.copy(errorMessage = "Sale total must be greater than zero kwacha") }
            return
        }

        if (paymentMethod == "Nkongole (Debt)" && debtorId == null) {
            _uiState.update { it.copy(errorMessage = "Debtor must be specified for credit checkouts") }
            return
        }

        _uiState.update { it.copy(isProcessing = true, errorMessage = null) }

        viewModelScope.launch {
            try {
                withContext(Dispatchers.IO) {
                    val timestamp = System.currentTimeMillis()
                    val invoiceNumber = "INV-${(1000..9999).random()}"
                    val totalCost = getCartTotalCost()
                    val totalProfit = total - totalCost

                    // A. Setup local Sale entity record
                    val sale = SaleEntity(
                        id = "s_$timestamp",
                        invoiceNumber = invoiceNumber,
                        totalAmount = total,
                        totalProfit = totalProfit,
                        date = java.text.SimpleDateFormat("dd MMM yyyy", java.util.Locale.getDefault()).format(java.util.Date()),
                        time = java.text.SimpleDateFormat("hh:mm a", java.util.Locale.getDefault()).format(java.util.Date()),
                        paymentMethod = paymentMethod,
                        debtorId = debtorId
                    )

                    // B. Setup item structures
                    val currentCart = _uiState.value.cartItems
                    val saleItems = if (currentCart.isNotEmpty()) {
                        currentCart.map { item ->
                            SaleItemEntity(
                                id = "si_${timestamp}_${item.product.id}",
                                saleId = sale.id,
                                productId = item.product.id,
                                productName = item.product.name,
                                quantity = item.quantity,
                                sellingPrice = item.product.sellingPrice,
                                costPrice = item.product.costPrice
                            )
                        }
                    } else {
                        // Create standard custom entry when selling via manual amount keypad
                        listOf(
                            SaleItemEntity(
                                id = "si_${timestamp}_quick",
                                saleId = sale.id,
                                productId = "quick-sale",
                                productName = "Quick Sale / Custom",
                                quantity = 1,
                                sellingPrice = total,
                                costPrice = totalCost
                            )
                        )
                    }

                    // C. Formulate debt adjustments if credit checkout
                    val debtUpdate = if (paymentMethod == "Nkongole (Debt)" && debtorId != null) {
                        CustomerDebtEntity(
                            id = debtorId,
                            outstandingAmount = total, // Handled as delta increment inside TransactionDao layer
                            lastTransactionDate = java.text.SimpleDateFormat("dd MMM yyyy", java.util.Locale.getDefault()).format(java.util.Date())
                        )
                    } else null

                    // D. Calculate inventory modifications
                    val productStockUpdates = currentCart.map { item ->
                        item.product.copy(
                            remaining = kotlin.math.max(0, item.product.remaining - item.quantity)
                        )
                    }

                    // E. Perform single atomic database transaction on database threadpool
                    transactionDao.executeCheckoutTransaction(
                        sale = sale,
                        items = saleItems,
                        debtUpdate = debtUpdate,
                        productStockUpdates = productStockUpdates
                    )
                }

                // Sale committed and completed successfully - clear states on primary execution thread
                _uiState.update { currentState ->
                    currentState.copy(
                        cartItems = emptyList(),
                        manualAmountString = "0",
                        checkoutSuccess = true,
                        isProcessing = false,
                        errorMessage = null
                    )
                }
            } catch (e: Exception) {
                _uiState.update { currentState ->
                    currentState.copy(
                        isProcessing = false,
                        errorMessage = "Checkout failed: ${e.localizedMessage ?: e.message}"
                    )
                }
            }
        }
    }

    fun resetCheckoutSuccess() {
        _uiState.update { it.copy(checkoutSuccess = false) }
    }
}
