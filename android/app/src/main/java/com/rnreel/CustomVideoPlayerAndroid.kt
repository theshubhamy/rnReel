package com.rnreel

import android.content.Context
import android.net.Uri
import android.util.AttributeSet
import android.widget.FrameLayout
import androidx.lifecycle.DefaultLifecycleObserver
import androidx.lifecycle.LifecycleOwner
import androidx.media3.common.C
import androidx.media3.common.MediaItem
import androidx.media3.common.Player
import androidx.media3.datasource.DefaultHttpDataSource
import androidx.media3.datasource.cache.CacheDataSource
import androidx.media3.datasource.cache.LeastRecentlyUsedCacheEvictor
import androidx.media3.datasource.cache.SimpleCache
import androidx.media3.database.StandaloneDatabaseProvider
import androidx.media3.exoplayer.DefaultLoadControl
import androidx.media3.exoplayer.ExoPlayer
import androidx.media3.exoplayer.source.ProgressiveMediaSource
import androidx.media3.ui.AspectRatioFrameLayout
import androidx.media3.ui.PlayerView
import java.io.File
import androidx.media3.common.PlaybackException

class CustomVideoPlayerAndroid @JvmOverloads constructor(
    context: Context,
    attrs: AttributeSet? = null,
    defStyleAttr: Int = 0
) : FrameLayout(context, attrs, defStyleAttr), DefaultLifecycleObserver {

    private val playerView: PlayerView
    private var exoPlayer: ExoPlayer? = null
    private var simpleCache: SimpleCache? = null
    private var callback: VideoPlayerCallback? = null
    private var isPreloaded: Boolean = false // Track preload status

    init {
        playerView = PlayerView(context).apply {
            layoutParams = LayoutParams(LayoutParams.MATCH_PARENT, LayoutParams.MATCH_PARENT)
            useController = false
            resizeMode = AspectRatioFrameLayout.RESIZE_MODE_FIT
        }
        addView(playerView)
        setupCache(context)
        setupPlayer()
    }

    private fun setupCache(context: Context) {
        simpleCache = CacheManager.getCache(context)
    }

    private fun setupPlayer() {
        val loadControl = DefaultLoadControl.Builder()
            .setBufferDurationsMs(
                500,    // Minimum buffer before playback starts
                1500,   // Maximum buffer during playback
                500,    // Minimum buffer for playback after rebuffer
                500     // Back buffer
            )
            .build()

        exoPlayer = ExoPlayer.Builder(context)
            .setLoadControl(loadControl)
            .build()
            .apply {
                videoScalingMode = C.VIDEO_SCALING_MODE_SCALE_TO_FIT
                repeatMode = Player.REPEAT_MODE_ONE
                addListener(object : Player.Listener {
                    override fun onPlaybackStateChanged(playbackState: Int) {
                        when (playbackState) {
                            Player.STATE_READY -> callback?.onLoad()
                            Player.STATE_BUFFERING -> callback?.onBuffering()
                            Player.STATE_ENDED -> callback?.onEnded()
                            Player.STATE_IDLE -> callback?.onError("Player went idle")
                        }
                    }

                    override fun onPlayerError(error: PlaybackException) {
                        callback?.onError(error.message ?: "Unknown error")
                    }
                })
                playerView.player = this
            }
    }

    fun setVideoUrl(url: String) {
        if (isPreloaded) {
            // If preloaded, the media source is already prepared
            exoPlayer?.playWhenReady = true
            isPreloaded = false // Reset preload flag
        } else {
            // Normal playback
            val cacheDataSourceFactory = CacheDataSource.Factory()
                .setCache(simpleCache!!)
                .setUpstreamDataSourceFactory(DefaultHttpDataSource.Factory())
            val mediaSource = ProgressiveMediaSource.Factory(cacheDataSourceFactory)
                .createMediaSource(MediaItem.fromUri(Uri.parse(url)))

            exoPlayer?.setMediaSource(mediaSource)
            exoPlayer?.playWhenReady = true // Start immediately
            exoPlayer?.prepare()
        }
    }

    fun preloadVideo(url: String) {
        // Preload the next video
        val cacheDataSourceFactory = CacheDataSource.Factory()
            .setCache(simpleCache!!)
            .setUpstreamDataSourceFactory(DefaultHttpDataSource.Factory())
        val mediaSource = ProgressiveMediaSource.Factory(cacheDataSourceFactory)
            .createMediaSource(MediaItem.fromUri(Uri.parse(url)))

        exoPlayer?.setMediaSource(mediaSource, false) // Prepare without playback
        exoPlayer?.prepare()
        isPreloaded = true
    }

    fun setPaused(paused: Boolean) {
        exoPlayer?.playWhenReady = !paused
    }

    fun setMuted(muted: Boolean) {
        exoPlayer?.volume = if (muted) 0f else 1f
    }

    fun setCallback(callback: VideoPlayerCallback) {
        this.callback = callback
    }

    override fun onResume(owner: LifecycleOwner) {
        exoPlayer?.playWhenReady = true
    }

    override fun onPause(owner: LifecycleOwner) {
        exoPlayer?.playWhenReady = false
    }

    override fun onDestroy(owner: LifecycleOwner) {
        exoPlayer?.release()
        exoPlayer = null
    }

    object CacheManager {
        private var simpleCache: SimpleCache? = null
        fun getCache(context: Context): SimpleCache {
            if (simpleCache == null) {
                val cacheDir = File(context.cacheDir, "media_cache")
                val cacheEvictor = LeastRecentlyUsedCacheEvictor(100 * 1024 * 1024) // 100 MB
                simpleCache = SimpleCache(cacheDir, cacheEvictor, StandaloneDatabaseProvider(context))
            }
            return simpleCache!!
        }
    }
}

interface VideoPlayerCallback {
    fun onLoad()
    fun onBuffering()
    fun onEnded()
    fun onError(errorMessage: String)
}