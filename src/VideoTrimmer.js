import {NativeModules, Platform, processColor} from 'react-native';

const {VideoTrimmer, VideoTrim} = NativeModules;
const config = {
  saveToPhoto: true,
  removeAfterSavedToPhoto: true,
  enableCancelDialog: true,
  cancelDialogTitle: 'Warning!',
  cancelDialogMessage: 'Are you sure want to cancel?',
  cancelDialogCancelText: 'Close',
  cancelDialogConfirmText: 'Proceed',
  enableSaveDialog: true,
  saveDialogTitle: 'Confirmation!',
  saveDialogMessage: 'Are you sure want to save?',
  saveDialogCancelText: 'Close',
  saveDialogConfirmText: 'Proceed',
  fullScreenModalIOS: false,
  cancelButtonText: 'Cancel',
  saveButtonText: 'Save',
  openDocumentsOnFinish: false,
  openShareSheetOnFinish: false,
  closeWhenFinish: true,
  enableCancelTrimming: true,
  cancelTrimmingButtonText: 'Cancel',
  enableCancelTrimmingDialog: true,
  cancelTrimmingDialogTitle: 'Warning!',
  cancelTrimmingDialogMessage: 'Are you sure want to cancel trimming?',
  cancelTrimmingDialogCancelText: 'Close',
  cancelTrimmingDialogConfirmText: 'Proceed',
  alertOnFailToLoad: true,
  alertOnFailTitle: 'Error',
  alertOnFailMessage:
    'Fail to load media. Possibly invalid file or no network connection',
  alertOnFailCloseText: 'Close',
};
export const openVideoTrimmer = async videoUri => {
  try {
    let trimmedVideoUri = '';

    if (Platform.OS === 'ios') {
      console.log('IOS');
      const headerTextColor = '#ffffff';
      const color = processColor(headerTextColor);

      trimmedVideoUri = await VideoTrim.showEditor(videoUri, {
        ...config,
        headerTextColor: color,
      });
    } else if (Platform.OS === 'android') {
      trimmedVideoUri = await VideoTrimmer.openTrimView(videoUri);
    }

    console.log('Trimmed video saved at:', trimmedVideoUri);
  } catch (error) {
    console.error('Error trimming video:', error);
  }
};
