import { PublishSnapshot } from '../types';

export interface PublishResult {
  success: boolean;
  message: string;
  publishedAt?: string;
  version?: number;
  error?: string;
}

/**
 * Service handling cloud data publishing and retrieval
 */
export async function publishStoreData(payload: Omit<PublishSnapshot, 'version' | 'uninitialized'>): Promise<PublishResult> {
  try {
    const res = await fetch('/api/publish', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const errorText = await res.text();
      return {
        success: false,
        message: 'Failed to publish to server',
        error: errorText || `HTTP status ${res.status}`,
      };
    }

    const data = await res.json();
    return {
      success: true,
      message: data.message || 'Published successfully',
      publishedAt: data.publishedAt,
      version: data.version,
    };
  } catch (err: any) {
    return {
      success: false,
      message: 'Network error publishing store data',
      error: err?.message || 'Connection failed',
    };
  }
}

/**
 * Fetch the latest store snapshot published to the cloud API
 */
export async function fetchPublishedStoreData(): Promise<PublishSnapshot | null> {
  try {
    const res = await fetch('/api/store-data');
    if (!res.ok) {
      throw new Error(`HTTP error ${res.status}`);
    }
    const data = await res.json();
    return data;
  } catch (err) {
    console.error('Failed to fetch published store data:', err);
    return null;
  }
}

/**
 * Check cloud API server connection
 */
export async function checkServerHealth(): Promise<boolean> {
  try {
    const res = await fetch('/api/health');
    return res.ok;
  } catch {
    return false;
  }
}
