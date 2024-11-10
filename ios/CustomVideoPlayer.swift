//
//  CustomVideoPlayer.swift
//  rnReel
//
//  Created by shubham kumar on 09/11/24.
//

import Foundation
import AVKit
import React

@objc(CustomVideoPlayerManager)
class CustomVideoPlayerManager: RCTViewManager {
    override func view() -> UIView! {
        return CustomVideoPlayerView()
    }

    override static func requiresMainQueueSetup() -> Bool {
        return true
    }
}

class CustomVideoPlayerView: UIView {
    private var player: AVPlayer?
    private var playerController: AVPlayerViewController?

    @objc var videoUrl: NSString = "" {
        didSet {
            guard let url = URL(string: videoUrl as String) else { return }
            player = AVPlayer(url: url)
            playerController?.player = player
            player?.play()
        }
    }

    @objc var paused: Bool = false {
        didSet {
            if paused {
                player?.pause()
            } else {
                player?.play()
            }
        }
    }

    @objc var muted: Bool = false {
        didSet {
            player?.isMuted = muted
        }
    }

    override init(frame: CGRect) {
        super.init(frame: frame)
        setupPlayerController()
    }

    required init?(coder: NSCoder) {
        fatalError("init(coder:) has not been implemented")
    }

    private func setupPlayerController() {
        playerController = AVPlayerViewController()
        playerController?.showsPlaybackControls = false
        playerController?.videoGravity = .resizeAspectFill
        if let playerController = playerController {
            playerController.view.frame = bounds
            addSubview(playerController.view)
        }
    }

    override func layoutSubviews() {
        super.layoutSubviews()
        playerController?.view.frame = bounds
    }

    deinit {
        player?.pause()
        player = nil
    }
}
