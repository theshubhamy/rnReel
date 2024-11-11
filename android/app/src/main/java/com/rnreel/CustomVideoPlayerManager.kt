package com.loveroom

import android.content.Context
import android.net.Uri
import android.util.Log
import android.view.Gravity
import android.view.ViewGroup
import android.widget.FrameLayout
import androidx.lifecycle.LifecycleOwner
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.ReactContext
import com.facebook.react.uimanager.SimpleViewManager
import com.facebook.react.uimanager.ThemedReactContext
import com.facebook.react.uimanager.annotations.ReactProp
import com.facebook.react.uimanager.events.RCTEventEmitter
import androidx.media3.common.MediaItem
import androidx.media3.common.Player
import androidx.media3.common.AudioAttributes
import androidx.media3.exoplayer.ExoPlayer
import androidx.media3.ui.PlayerView

class CustomVideoPlayerManager : SimpleViewManager<FrameLayout>() {
    private var exoPlayer: ExoPlayer? = null
    private var playerView: PlayerView? = null

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

        playerView = PlayerView(reactContext).apply {
            layoutParams = FrameLayout.LayoutParams(
                FrameLayout.LayoutParams.MATCH_PARENT,
                FrameLayout.LayoutParams.MATCH_PARENT,
                Gravity.CENTER
            )
            setShowBuffering(PlayerView.SHOW_BUFFERING_WHEN_PLAYING)
        }

        frameLayout.addView(playerView)
        return frameLayout
    }

    @ReactProp(name = "sourceUrl")
    fun setSourceUrl(view: FrameLayout, url: String?) {
        if (url == null) {
            Log.w(TAG, "Received null URL")
            return
        }

        try {
            Log.d(TAG, "Loading video from URL: $url")
            val uri = Uri.parse(url)

            exoPlayer?.release()

            exoPlayer = ExoPlayer.Builder(view.context).build().apply {
                setMediaItem(MediaItem.fromUri(uri))
                prepare()
                playWhenReady = true
            }

            playerView?.player = exoPlayer

            exoPlayer?.addListener(object : Player.Listener {
                override fun onPlaybackStateChanged(state: Int) {
                    when (state) {
                        Player.STATE_READY -> sendEvent(view.context as ReactContext, view.id, "onReady", Arguments.createMap())
                        Player.STATE_ENDED -> sendEvent(view.context as ReactContext, view.id, "onEnd", Arguments.createMap())
                        Player.STATE_IDLE -> sendEvent(view.context as ReactContext, view.id, "onError", Arguments.createMap().apply {
                            putString("error", "Error loading video")
                        })
                    }
                }
            })
        } catch (e: Exception) {
            Log.e(TAG, "Error setting video source", e)
            sendEvent(view.context as ReactContext, view.id, "onError", Arguments.createMap().apply {
                putString("error", "Error loading video: ${e.message}")
            })
        }
    }

    @ReactProp(name = "paused")
    fun setPaused(view: FrameLayout, paused: Boolean) {
        exoPlayer?.playWhenReady = !paused
    }

    @ReactProp(name = "muted")
    fun setMuted(view: FrameLayout, muted: Boolean) {
        exoPlayer?.volume = if (muted) 0f else 1f
    }

    private fun sendEvent(context: ReactContext, viewId: Int, eventName: String, params: com.facebook.react.bridge.WritableMap) {
        context.getJSModule(RCTEventEmitter::class.java)?.receiveEvent(viewId, eventName, params)
    }

    override fun getExportedCustomDirectEventTypeConstants(): Map<String, Any> {
        return mapOf(
            "onReady" to mapOf("registrationName" to "onReady"),
            "onError" to mapOf("registrationName" to "onError"),
            "onEnd" to mapOf("registrationName" to "onEnd")
        )
    }

    companion object {
        private const val TAG = "CustomVideoPlayerAndroid"
    }
}
