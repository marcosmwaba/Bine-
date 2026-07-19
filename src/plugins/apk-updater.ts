import { registerPlugin } from '@capacitor/core';

export interface ApkUpdaterPluginType {
  installApk(options: { url: string }): Promise<{ success: boolean }>;
}

export const ApkUpdater = registerPlugin<ApkUpdaterPluginType>('ApkUpdater');
