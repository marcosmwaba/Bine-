import { useState, useCallback } from 'react';
import { ApkUpdater } from '../plugins/apk-updater';

const REPO = 'marcosmwaba/Bine-';
const GITHUB_API_URL = `https://api.github.com/repos/${REPO}/releases/latest`;

// Injected by Vite
const CURRENT_VERSION = (import.meta as any).env.VITE_APP_VERSION || '1.0.23';

export type UpdateCheckResult =
  | { status: 'up-to-date' }
  | { status: 'update-available'; version: string; notes: string; apkUrl: string }
  | { status: 'error'; message: string }
  | { status: 'rate-limited'; retryAfter?: string };

function isNewerVersion(latest: string, current: string): boolean {
  const l = latest.replace(/^v/, '').split('.').map(Number);
  const c = current.replace(/^v/, '').split('.').map(Number);
  const len = Math.max(l.length, c.length);
  for (let i = 0; i < len; i++) {
    const lv = l[i] || 0;
    const cv = c[i] || 0;
    if (lv > cv) return true;
    if (lv < cv) return false;
  }
  return false;
}

export function useGitHubUpdater() {
  const [isCheckingUpdate, setIsCheckingUpdate] = useState(false);
  const [updateResult, setUpdateResult] = useState<UpdateCheckResult | null>(null);
  const [isApplyingUpdate, setIsApplyingUpdate] = useState(false);

  const checkGitHubUpdates = useCallback(async () => {
    setIsCheckingUpdate(true);
    try {
      const res = await fetch(GITHUB_API_URL, {
        headers: { Accept: 'application/vnd.github+json' },
      });

      if (res.status === 404) {
        setUpdateResult({ status: 'error', message: 'No releases have been published yet.' });
        return;
      }

      if (res.status === 403) {
        const retryAfter = res.headers.get('X-RateLimit-Reset') ?? undefined;
        setUpdateResult({ status: 'rate-limited', retryAfter });
        return;
      }

      if (!res.ok) {
        setUpdateResult({ status: 'error', message: `GitHub API returned ${res.status}` });
        return;
      }

      const data = await res.json();
      const latestVersion: string = data.tag_name;
      const notes: string = data.body ?? '';
      const apkAsset = (data.assets ?? []).find((a: { name: string }) =>
        a.name.endsWith('.apk') && !a.name.includes('debug')
      );

      if (!apkAsset) {
        setUpdateResult({ status: 'error', message: 'Latest release has no APK attached.' });
        return;
      }

      if (isNewerVersion(latestVersion, CURRENT_VERSION)) {
        setUpdateResult({
          status: 'update-available',
          version: latestVersion,
          notes,
          apkUrl: apkAsset.browser_download_url,
        });
      } else {
        setUpdateResult({ status: 'up-to-date' });
      }
    } catch (err) {
      console.error('GitHub update check failed:', err);
      setUpdateResult({
        status: 'error',
        message: err instanceof Error ? err.message : 'Network error while checking for updates.',
      });
    } finally {
      setIsCheckingUpdate(false);
    }
  }, []);

  const handleApplyUpdate = useCallback(async (apkUrl: string) => {
    setIsApplyingUpdate(true);
    try {
      const result = await ApkUpdater.installApk({ url: apkUrl });
      return result;
    } catch (err) {
      console.error('Failed to apply update:', err);
      throw err;
    } finally {
      setIsApplyingUpdate(false);
    }
  }, []);

  return {
    isCheckingUpdate,
    isApplyingUpdate,
    updateResult,
    checkGitHubUpdates,
    handleApplyUpdate,
  };
}
