

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
        return player
    }

    override fun onDropViewInstance(view: CustomVideoPlayerAndroid) {
        view.savePlaybackPosition()
        val activity = view.context as? LifecycleOwner
        activity?.lifecycle?.removeObserver(view)
        super.onDropViewInstance(view)
    }

    @ReactProp(name = "videoUrl")
    fun setVideoUrl(view: CustomVideoPlayerAndroid, videoUrl: String?) {
        view.setVideoUrl(videoUrl ?: "")
    }

    @ReactProp(name = "paused", defaultBoolean = true)
    fun setPaused(view: CustomVideoPlayerAndroid, paused: Boolean) {
        view.setPaused(paused)
    }

    @ReactProp(name = "muted", defaultBoolean = false)
    fun setMuted(view: CustomVideoPlayerAndroid, muted: Boolean) {
        view.setMuted(muted)
    }
}

