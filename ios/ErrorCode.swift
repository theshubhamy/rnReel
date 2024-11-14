//
//  ErrorCode.swift
//  rnReel
//
//  Created by shubham kumar on 13/11/24.
//

import Foundation

enum ErrorCode: String {
    case trimmingFailed = "TRIMMING_FAILED"
    case failToLoadMedia = "FAIL_TO_LOAD_MEDIA"
    case failToSaveToPhoto = "FAIL_TO_SAVE_TO_PHOTO"
    case failToShare = "FAIL_TO_SHARE"
    case noPhotoPermission = "NO_PHOTO_PERMISSION"
}
