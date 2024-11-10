package com.rnreel

import android.content.Context
import android.media.AudioManager
import android.widget.VideoView
import android.net.Uri
import android.util.Log
import android.media.MediaPlayer
import android.view.ViewGroup
import android.widget.FrameLayout
import android.view.Gravity
import com.facebook.react.uimanager.SimpleViewManager
import com.facebook.react.uimanager.ThemedReactContext
import com.facebook.react.uimanager.annotations.ReactProp
import com.facebook.react.views.view.ReactViewGroup
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.ReactContext
import com.facebook.react.uimanager.events.RCTEventEmitter

class CustomVideoPlayerManager : SimpleViewManager<FrameLayout>() {
    private var mediaPlayer: MediaPlayer? = null

    override fun getName(): String {
        return "CustomVideoPlayerAndroid"
    }

    override fun createViewInstance(reactContext: ThemedReactContext): FrameLayout {
        return FrameLayout(reactContext).apply {
            layoutParams = ViewGroup.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT,
                ViewGroup.LayoutParams.MATCH_PARENT
            )

            // Create and add VideoView
            val videoView = VideoView(reactContext).apply {
                layoutParams = FrameLayout.LayoutParams(
                    FrameLayout.LayoutParams.MATCH_PARENT,
                    FrameLayout.LayoutParams.MATCH_PARENT,
                    Gravity.CENTER
                )

                setOnPreparedListener { mp ->
                    Log.d(TAG, "Video prepared successfully")
                    mediaPlayer = mp

                    // Configure MediaPlayer
                    mp.setVideoScalingMode(MediaPlayer.VIDEO_SCALING_MODE_SCALE_TO_FIT)
                    mp.setOnBufferingUpdateListener { _, percent ->
                        Log.d(TAG, "Buffering: $percent%")
                    }

                    // Get video dimensions
                    val videoWidth = mp.videoWidth
                    val videoHeight = mp.videoHeight
                    Log.d(TAG, "Video dimensions: ${videoWidth}x${videoHeight}")

                    // Start playback
                    start()

                    // Send ready event
                    sendEvent(context as ReactContext, id, "onReady", Arguments.createMap().apply {
                        putInt("width", videoWidth)
                        putInt("height", videoHeight)
                    })
                }

                setOnErrorListener { mp, what, extra ->
                    val errorMsg = when (what) {
                        MediaPlayer.MEDIA_ERROR_UNKNOWN -> "Unknown error occurred"
                        MediaPlayer.MEDIA_ERROR_SERVER_DIED -> "Server died"
                        MediaPlayer.MEDIA_ERROR_NOT_VALID_FOR_PROGRESSIVE_PLAYBACK ->
                            "Not valid for progressive playback"
                        MediaPlayer.MEDIA_ERROR_IO -> "IO error occurred"
                        MediaPlayer.MEDIA_ERROR_MALFORMED -> "Malformed media"
                        MediaPlayer.MEDIA_ERROR_UNSUPPORTED -> "Unsupported media format"
                        MediaPlayer.MEDIA_ERROR_TIMED_OUT -> "Timed out"
                        else -> "Error code: $what"
                    }

                    Log.e(TAG, "PlaybackError: $errorMsg (extra: $extra)")
                    sendEvent(context as ReactContext, id, "onError", Arguments.createMap().apply {
                        putString("error", errorMsg)
                        putInt("what", what)
                        putInt("extra", extra)
                    })
                    true
                }

                setOnInfoListener { mp, what, extra ->
                    val info = when (what) {
                        MediaPlayer.MEDIA_INFO_BUFFERING_START -> "Buffering start"
                        MediaPlayer.MEDIA_INFO_BUFFERING_END -> "Buffering end"
                        MediaPlayer.MEDIA_INFO_VIDEO_RENDERING_START -> "Rendering start"
                        else -> "Info: $what"
                    }
                    Log.d(TAG, "PlaybackInfo: $info (extra: $extra)")
                    true
                }

                setOnCompletionListener {
                    Log.d(TAG, "Playback completed")
                    sendEvent(context as ReactContext, id, "onEnd", Arguments.createMap())
                }
            }

            addView(videoView)
        }
    }

    @ReactProp(name = "sourceUrl")
    fun setSourceUrl(view: FrameLayout, url: String?) {
        if (url == null) {
            Log.w(TAG, "Received null URL")
            return
        }

        val videoView = view.getChildAt(0) as? VideoView
        if (videoView == null) {
            Log.e(TAG, "VideoView not found")
            return
        }

        try {
            Log.d(TAG, "Loading video from URL: $url")

            // Reset previous playback
            videoView.stopPlayback()
            mediaPlayer?.release()
            mediaPlayer = null

            // Set new source
            val uri = Uri.parse(url)
            videoView.setVideoURI(uri)

            // Request audio focus
            val audioManager = view.context.getSystemService(Context.AUDIO_SERVICE) as AudioManager
            val result = audioManager.requestAudioFocus(null,
                AudioManager.STREAM_MUSIC,
                AudioManager.AUDIOFOCUS_GAIN)

            if (result != AudioManager.AUDIOFOCUS_REQUEST_GRANTED) {
                Log.w(TAG, "Audio focus not granted")
            }

            // Start preparing the video
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
        val videoView = view.getChildAt(0) as? VideoView
        if (videoView == null) {
            Log.e(TAG, "VideoView not found")
            return
        }

        try {
            if (paused && videoView.isPlaying) {
                Log.d(TAG, "Pausing video")
                videoView.pause()
            } else if (!paused && !videoView.isPlaying) {
                Log.d(TAG, "Resuming video")
                videoView.start()
            }
        } catch (e: Exception) {
            Log.e(TAG, "Error controlling playback", e)
        }
    }

    @ReactProp(name = "muted")
    fun setMuted(view: FrameLayout, muted: Boolean) {
        try {
            mediaPlayer?.setVolume(if (muted) 0f else 1f, if (muted) 0f else 1f)
            Log.d(TAG, "Set muted: $muted")
        } catch (e: Exception) {
            Log.e(TAG, "Error setting mute state", e)
        }
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
