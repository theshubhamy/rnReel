//
//  CustomVideoPlayerBridge.m
//  rnReel
//
//  Created by shubham kumar on 09/11/24.
//

#import <Foundation/Foundation.h>
#import <React/RCTViewManager.h>

@interface RCT_EXTERN_MODULE(CustomVideoPlayerManager, RCTViewManager)
RCT_EXPORT_VIEW_PROPERTY(videoUrl, NSString)
RCT_EXPORT_VIEW_PROPERTY(paused, BOOL)
RCT_EXPORT_VIEW_PROPERTY(muted, BOOL)
@end
