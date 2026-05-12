package com.safenest.mobile;

import android.Manifest;
import android.webkit.PermissionRequest;
import android.webkit.WebChromeClient;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {

  @Override
  public void onStart() {
    super.onStart();

    // Grant camera access to the WebView when it requests getUserMedia
    this.bridge.getWebView().setWebChromeClient(new WebChromeClient() {
      @Override
      public void onPermissionRequest(final PermissionRequest request) {
        runOnUiThread(() -> {
          request.grant(request.getResources());
        });
      }
    });
  }
}
