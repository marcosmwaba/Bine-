package com.bine.pos.data.local

import android.content.Context
import android.content.Intent
import android.net.Uri
import androidx.core.content.FileProvider
import java.io.File
import java.io.FileInputStream
import java.io.FileOutputStream
import java.util.zip.ZipEntry
import java.util.zip.ZipOutputStream

/**
 * LocalBackupManager handles the secure local-first archiving of SQLite database files
 * without cloud dependencies. Flushes pending writes and checkpoints WAL files to ensure
 * backup consistency before packing into a single zip file for merchant export.
 */
class LocalBackupManager(
    private val context: Context,
    private val dbInstance: BineDatabase
) {

    /**
     * Safely shuts down the database instance, aggregates database components
     * (.db, .db-shm, .db-wal), packages them in a ZIP inside secure cache storage,
     * and returns a sharing Intent for the merchant to send via WhatsApp or other services.
     *
     * @return Intent? Share intent, or null if database fails to backup.
     */
    fun createBackupAndGetShareIntent(): Intent? {
        return try {
            // 1. Safely close database to guarantee all logs are checkpointed/flushed
            if (dbInstance.isOpen) {
                dbInstance.close()
            }

            // 2. Identify database files inside local app directory
            val dbName = "bine_pos.db"
            val dbFile = context.getDatabasePath(dbName)
            val shmFile = File(dbFile.absolutePath + "-shm")
            val walFile = File(dbFile.absolutePath + "-wal")

            val filesToArchive = mutableListOf<File>()
            if (dbFile.exists()) filesToArchive.add(dbFile)
            if (shmFile.exists()) filesToArchive.add(shmFile)
            if (walFile.exists()) filesToArchive.add(walFile)

            if (filesToArchive.isEmpty()) {
                return null
            }

            // 3. Create a isolated backups directory inside App Cache
            val backupDir = File(context.cacheDir, "bine_backups")
            if (!backupDir.exists()) {
                backupDir.mkdirs()
            }

            val timestamp = System.currentTimeMillis()
            val zipFileName = "bine_pos_backup_$timestamp.zip"
            val zipFile = File(backupDir, zipFileName)

            // 4. Archive database files into a single zip entry
            archiveFilesToZip(filesToArchive, zipFile)

            // 5. Generate secure share URI using FileProvider
            val authority = "${context.packageName}.fileprovider"
            val contentUri: Uri = FileProvider.getUriForFile(context, authority, zipFile)

            // 6. Build the sharing Intent
            Intent(Intent.ACTION_SEND).apply {
                type = "application/zip"
                putExtra(Intent.EXTRA_STREAM, contentUri)
                putExtra(Intent.EXTRA_SUBJECT, "Bine POS Offline Backup")
                putExtra(
                    Intent.EXTRA_TEXT, 
                    "Attached is the secure local-first SQLite offline database backup for Bine POS.\n" +
                    "Generated on: ${java.text.DateFormat.getDateTimeInstance().format(java.util.Date())}"
                )
                addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION)
            }
        } catch (e: Exception) {
            e.printStackTrace()
            null
        }
    }

    /**
     * Helper utility to compress SQLite files into a ZIP wrapper.
     */
    private fun archiveFilesToZip(files: List<File>, zipFile: File) {
        ZipOutputStream(FileOutputStream(zipFile)).use { zos ->
            val buffer = ByteArray(4096)
            for (file in files) {
                if (!file.exists()) continue
                FileInputStream(file).use { fis ->
                    val entry = ZipEntry(file.name)
                    zos.putNextEntry(entry)
                    var length: Int
                    while (fis.read(buffer).also { length = it } > 0) {
                        zos.write(buffer, 0, length)
                    }
                    zos.closeEntry()
                }
            }
        }
    }
}
