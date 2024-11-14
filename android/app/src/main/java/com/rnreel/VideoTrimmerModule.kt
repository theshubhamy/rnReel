package com.rnreel

import android.app.Activity
import android.content.Intent
import com.facebook.react.bridge.ActivityEventListener
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.rnreel.VideoTrimmingActivity

class VideoTrimmerModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext),
    ActivityEventListener {

    private var promise: Promise? = null

    override fun getName(): String {
        return "VideoTrimmer"
    }

    @ReactMethod
    fun openTrimView(videoUri: String, promise: Promise) {
        this.promise = promise
        val intent = Intent(reactApplicationContext, VideoTrimmingActivity::class.java)
        intent.putExtra("VIDEO_URI", videoUri)
        currentActivity?.startActivityForResult(intent, TRIM_VIDEO_REQUEST_CODE)
    }

    override fun onActivityResult(p0: Activity?, requestCode: Int, resultCode: Int, data: Intent?) {
        if (requestCode == TRIM_VIDEO_REQUEST_CODE && resultCode == Activity.RESULT_OK) {
            val newVideoUri = data?.getStringExtra("TRIMMED_VIDEO_URI") ?: ""
            promise?.resolve(newVideoUri)
        } else {
            promise?.reject("TRIM_FAILED", "Video trimming was not successful.")
        }
    }
    override fun onNewIntent(intent: Intent?) {}

    companion object {
        private const val TRIM_VIDEO_REQUEST_CODE = 1
    }
}
