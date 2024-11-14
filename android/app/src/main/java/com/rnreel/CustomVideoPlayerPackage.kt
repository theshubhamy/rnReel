package com.rnreel

import com.facebook.react.ReactPackage
import com.facebook.react.bridge.NativeModule
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.uimanager.ViewManager

class CustomVideoPlayerPackage : ReactPackage {

    // This method returns the native modules that will be exposed to JavaScript.
    override fun createNativeModules(reactContext: ReactApplicationContext): List<NativeModule> {
        return emptyList()
    }

    // This method returns the view managers for custom views, like `CustomVideoPlayerManager`.
    override fun createViewManagers(reactContext: ReactApplicationContext): List<ViewManager<*, *>> {
        return listOf(CustomVideoPlayerManager())
    }
}