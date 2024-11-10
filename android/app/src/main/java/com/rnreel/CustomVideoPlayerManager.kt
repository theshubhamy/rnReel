package com.rnreel

import android.content.Context
import android.media.AudioManager
import android.widget.VideoView
import android.net.Uri
import android.util.Log
import android.media.MediaPlayer
import android.view.ViewGroup
import android.widget.FrameLayout
import com.facebook.react.uimanager.SimpleViewManager
import com.facebook.react.uimanager.ThemedReactContext
import com.facebook.react.uimanager.annotations.ReactProp
import com.facebook.react.views.view.ReactViewGroup
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.ReactContext
import com.facebook.react.uimanager.events.RCTEventEmitter

class CustomVideoPlayerManager : SimpleViewManager<ReactViewGroup>() {
    private var videoView: VideoView? = null

    override fun getName(): String {
        return "CustomVideoPlayerAndroid"
    }

    override fun createViewInstance(reactContext: ThemedReactContext): ReactViewGroup {
        val containerView = ReactViewGroup(reactContext)
        containerView.layoutParams = ViewGroup.LayoutParams(
            ViewGroup.LayoutParams.MATCH_PARENT,
            ViewGroup.LayoutParams.MATCH_PARENT
        )

        videoView = VideoView(reactContext).apply {
            layoutParams = FrameLayout.LayoutParams(
                FrameLayout.LayoutParams.MATCH_PARENT,
                FrameLayout.LayoutParams.MATCH_PARENT
            )
        }

        containerView.addView(videoView)
        setupVideoView(reactContext, containerView)
        return containerView
    }

    private fun setupVideoView(reactContext: ThemedReactContext, view: ReactViewGroup) {
        videoView?.apply {
            setOnInfoListener { mp, what, extra ->
                Log.d("VideoPlayer", "Info: what=$what extra=$extra")
                true
            }

            setOnPreparedListener { mediaPlayer ->
                Log.d("VideoPlayer", "Video prepared successfully")
                sendEvent(reactContext, view.id, "onReady", Arguments.createMap())
                mediaPlayer.setOnVideoSizeChangedListener { mp, width, height ->
                    Log.d("VideoPlayer", "Video size changed: width=$width height=$height")
                }
                start()
            }

            setOnCompletionListener {
                Log.d("VideoPlayer", "Playback completed")
                sendEvent(reactContext, view.id, "onEnd", Arguments.createMap())
            }

            setOnErrorListener { mp: MediaPlayer, what: Int, extra: Int ->
                val errorMessage = when (what) {
                    MediaPlayer.MEDIA_ERROR_UNKNOWN -> "Unknown error occurred"
                    MediaPlayer.MEDIA_ERROR_SERVER_DIED -> "Server died"
                    MediaPlayer.MEDIA_ERROR_IO -> "IO error occurred"
                    MediaPlayer.MEDIA_ERROR_MALFORMED -> "Malformed media"
                    MediaPlayer.MEDIA_ERROR_UNSUPPORTED -> "Unsupported media format"
                    MediaPlayer.MEDIA_ERROR_TIMED_OUT -> "Timed out"
                    else -> "Error: $what, $extra"
                }

                Log.e("VideoPlayer", "Error occurred: $errorMessage")
                val event = Arguments.createMap().apply {
                    putString("error", errorMessage)
                    putInt("what", what)
                    putInt("extra", extra)
                }
                sendEvent(reactContext, view.id, "onError", event)
                true
            }
        }
    }

    @ReactProp(name = "sourceUrl")
    fun setSourceUrl(view: ReactViewGroup, url: String?) {
        if (url == null) return

        try {
            Log.d("VideoPlayer", "Setting video source: $url")
            videoView?.let { player ->
                // Reset the player before setting new source
                player.stopPlayback()

                when {
                    url.startsWith("file://") -> {
                        Log.d("VideoPlayer", "Loading local file")
                        player.setVideoPath(url.replace("file://", ""))
                    }
                    url.startsWith("content://") -> {
                        Log.d("VideoPlayer", "Loading content URI")
                        player.setVideoURI(Uri.parse(url))
                    }
                    else -> {
                        Log.d("VideoPlayer", "Loading remote URL")
                        player.setVideoURI(Uri.parse(url))
                    }
                }
            }
        } catch (e: Exception) {
            Log.e("VideoPlayer", "Error setting video source", e)
            val event = Arguments.createMap().apply {
                putString("error", "Error loading video: ${e.message}")
            }
            sendEvent(view.context as ReactContext, view.id, "onError", event)
        }
    }

    @ReactProp(name = "paused")
    fun setPaused(view: ReactViewGroup, paused: Boolean) {
        try {
            videoView?.let { player ->
                if (paused) {
                    if (player.isPlaying) {
                        Log.d("VideoPlayer", "Pausing video")
                        player.pause()
                    }
                } else {
                    Log.d("VideoPlayer", "Starting video")
                    player.start()
                }
            }
        } catch (e: Exception) {
            Log.e("VideoPlayer", "Error controlling playback", e)
        }
    }

    @ReactProp(name = "muted")
    fun setMuted(view: ReactViewGroup, muted: Boolean) {
        try {
            val audioManager = view.context.getSystemService(Context.AUDIO_SERVICE) as AudioManager
            if (muted) {
                Log.d("VideoPlayer", "Muting video")
                audioManager.setStreamVolume(AudioManager.STREAM_MUSIC, 0, 0)
            } else {
                Log.d("VideoPlayer", "Unmuting video")
                // Restore to a reasonable volume level (e.g., 50%)
                val maxVolume = audioManager.getStreamMaxVolume(AudioManager.STREAM_MUSIC)
                audioManager.setStreamVolume(AudioManager.STREAM_MUSIC, maxVolume / 2, 0)
            }
        } catch (e: Exception) {
            Log.e("VideoPlayer", "Error controlling audio", e)
        }
    }

    private fun sendEvent(context: ReactContext, viewId: Int, eventName: String, params: com.facebook.react.bridge.WritableMap) {
        context.getJSModule(RCTEventEmitter::class.java)
            .receiveEvent(viewId, eventName, params)
    }
}
