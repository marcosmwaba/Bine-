package com.bine.app;

import android.content.Context;
import android.content.Intent;
import android.net.Uri;
import android.os.Build;
import android.os.Environment;
import androidx.core.content.FileProvider;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

import java.io.BufferedInputStream;
import java.io.File;
import java.io.FileOutputStream;
import java.io.InputStream;
import java.net.HttpURLConnection;
import java.net.URL;

@CapacitorPlugin(name = "ApkUpdater")
public class ApkUpdaterPlugin extends Plugin {

    @PluginMethod
    public void installApk(PluginCall call) {
        String urlString = call.getString("url");
        if (urlString == null) {
            call.reject("URL is required");
            return;
        }

        // Run download and install on a background thread
        Thread thread = new Thread(new Runnable() {
            @Override
            public void run() {
                try {
                    Context context = getContext();
                    
                    URL url = new URL(urlString);
                    HttpURLConnection connection = (HttpURLConnection) url.openConnection();
                    connection.setConnectTimeout(15000);
                    connection.setReadTimeout(15000);
                    connection.connect();

                    if (connection.getResponseCode() != HttpURLConnection.HTTP_OK) {
                        call.reject("Server returned HTTP " + connection.getResponseCode() + " " + connection.getResponseMessage());
                        return;
                    }

                    // Store in external downloads dir so it can be installed, or internal files if none
                    File directory = context.getExternalFilesDir(Environment.DIRECTORY_DOWNLOADS);
                    if (directory == null) {
                        directory = context.getCacheDir();
                    }
                    if (!directory.exists()) {
                        directory.mkdirs();
                    }

                    File apkFile = new File(directory, "update.apk");
                    if (apkFile.exists()) {
                        apkFile.delete();
                    }

                    InputStream input = new BufferedInputStream(url.openStream(), 8192);
                    FileOutputStream output = new FileOutputStream(apkFile);

                    byte[] data = new byte[4096];
                    int count;
                    while ((count = input.read(data)) != -1) {
                        output.write(data, 0, count);
                    }

                    output.flush();
                    output.close();
                    input.close();

                    Intent intent = new Intent(Intent.ACTION_VIEW);
                    Uri apkUri;
                    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.N) {
                        String authority = context.getPackageName() + ".fileprovider";
                        apkUri = FileProvider.getUriForFile(context, authority, apkFile);
                        intent.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION);
                    } else {
                        apkUri = Uri.fromFile(apkFile);
                    }

                    intent.setDataAndType(apkUri, "application/vnd.android.package-archive");
                    intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                    context.startActivity(intent);

                    JSObject ret = new JSObject();
                    ret.put("success", true);
                    call.resolve(ret);

                } catch (Exception e) {
                    call.reject("Failed to download or install APK: " + e.getMessage(), e);
                }
            }
        });
        thread.start();
    }
}
