package com.rnreel

import com.facebook.react.uimanager.SimpleViewManager
import com.facebook.react.uimanager.ThemedReactContext
import com.facebook.react.uimanager.annotations.ReactProp
import androidx.lifecycle.LifecycleOwner

class CustomVideoPlayerManager : SimpleViewManager<CustomVideoPlayerAndroid>() {

    override fun getName(): String {
        return "CustomVideoPlayerAndroid"
    }

    override fun createViewInstance(reactContext: ThemedReactContext): CustomVideoPlayerAndroid {
        val player = CustomVideoPlayerAndroid(reactContext)
        val activity = reactContext.currentActivity as? LifecycleOwner
        activity?.lifecycle?.addObserver(player)

        // No custom event emitters for now; we'll handle basic React Native props
        return player
    }

    override fun onDropViewInstance(view: CustomVideoPlayerAndroid) {
        val activity = view.context as? LifecycleOwner
        activity?.lifecycle?.removeObserver(view)
        super.onDropViewInstance(view)
    }

    @ReactProp(name = "videoUrl")
    fun setVideoUrl(view: CustomVideoPlayerAndroid, videoUrl: String?) {
        view.setVideoUrl(videoUrl ?: "")
    }

    @ReactProp(name = "paused")
    fun setPaused(view: CustomVideoPlayerAndroid, paused: Boolean) {
        view.setPaused(paused)
    }

    @ReactProp(name = "muted")
    fun setMuted(view: CustomVideoPlayerAndroid, muted: Boolean) {
        view.setMuted(muted)
    }
}
