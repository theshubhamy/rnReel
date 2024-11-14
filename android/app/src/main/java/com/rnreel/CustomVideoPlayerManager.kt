package com.rnreel

import android.content.Context
import android.media.AudioManager
import android.media.MediaPlayer
import android.net.Uri
import android.util.Log
import android.view.Gravity
import android.view.ViewGroup
import android.widget.FrameLayout
import android.widget.VideoView
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.ReactContext
import com.facebook.react.uimanager.SimpleViewManager
import com.facebook.react.uimanager.ThemedReactContext
import com.facebook.react.uimanager.annotations.ReactProp
import com.facebook.react.views.view.ReactViewGroup
import com.facebook.react.uimanager.events.RCTEventEmitter

class CustomVideoPlayerManager : SimpleViewManager<FrameLayout>() {
    private var mediaPlayer: MediaPlayer? = null

    override fun getName(): String {
        return "CustomVideoPlayerAndroid"
    }

    override fun createViewInstance(reactContext: ThemedReactContext): FrameLayout {
        val frameLayout = FrameLayout(reactContext).apply {
            layoutParams = ViewGroup.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT,
                ViewGroup.LayoutParams.MATCH_PARENT
            )
        }

        val videoView = VideoView(reactContext).apply {
            layoutParams = FrameLayout.LayoutParams(
                FrameLayout.LayoutParams.MATCH_PARENT,
                FrameLayout.LayoutParams.MATCH_PARENT,
                Gravity.CENTER
            )
        }

        frameLayout.addView(videoView)
        applyStyles(frameLayout, videoView)
        return frameLayout
    }

    private fun applyStyles(frameLayout: FrameLayout, videoView: VideoView) {
        val context = frameLayout.context

        frameLayout.layoutParams.width = ViewGroup.LayoutParams.MATCH_PARENT
        frameLayout.layoutParams.height = ViewGroup.LayoutParams.MATCH_PARENT

        val videoLayoutParams = videoView.layoutParams as FrameLayout.LayoutParams
        videoLayoutParams.setMargins(10, 10, 10, 10)
        videoView.layoutParams = videoLayoutParams
    }

    @ReactProp(name = "sourceUrl")
    fun setSourceUrl(view: FrameLayout, url: String?) {
        if (url == null) {
            Log.w(TAG, "Received null URL")
            return
        }

        val videoView = view.getChildAt(0) as? VideoView ?: return
        try {
            Log.d(TAG, "Loading video from URL: $url")
            videoView.stopPlayback()
            mediaPlayer?.release()
            mediaPlayer = null

            val uri = Uri.parse(url)
            videoView.setVideoURI(uri)
            val audioManager = view.context.getSystemService(Context.AUDIO_SERVICE) as AudioManager
            audioManager.requestAudioFocus(null, AudioManager.STREAM_MUSIC, AudioManager.AUDIOFOCUS_GAIN)

            videoView.setOnPreparedListener { mp ->
                Log.d(TAG, "Video prepared with duration: ${mp.duration}ms")
                videoView.start()
            }
        } catch (e: Exception) {
            Log.e(TAG, "Error setting video source", e)
            sendEvent(view.context as ReactContext, view.id, "onError", Arguments.createMap().apply {
                putString("error", "Error loading video: ${e.message}")
            })
        }
    }

    @ReactProp(name = "paused")
    fun setPaused(view: FrameLayout, paused: Boolean) {
        val videoView = view.getChildAt(0) as? VideoView ?: return
        if (paused && videoView.isPlaying) {
            videoView.pause()
        } else if (!paused && !videoView.isPlaying) {
            videoView.start()
        }
    }

    @ReactProp(name = "muted")
    fun setMuted(view: FrameLayout, muted: Boolean) {
        mediaPlayer?.setVolume(if (muted) 0f else 1f, if (muted) 0f else 1f)
    }

    override fun getExportedCustomDirectEventTypeConstants(): Map<String, Any> {
        return mapOf(
            "onReady" to mapOf("registrationName" to "onReady"),
            "onError" to mapOf("registrationName" to "onError"),
            "onEnd" to mapOf("registrationName" to "onEnd")
        )
    }

    private fun sendEvent(context: ReactContext, viewId: Int, eventName: String, params: com.facebook.react.bridge.WritableMap) {
        context.getJSModule(RCTEventEmitter::class.java)?.receiveEvent(viewId, eventName, params)
    }

    companion object {
        private const val TAG = "CustomVideoPlayerAndroid"
    }
}