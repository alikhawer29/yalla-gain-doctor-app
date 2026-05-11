package com.reactnativezoom.sdk;

import android.app.Service;
import android.util.DisplayMetrics;
import android.util.Log;
import android.view.Display;
import android.view.WindowManager;
import java.util.Locale;

import androidx.annotation.Nullable;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.LifecycleEventListener;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.modules.core.DeviceEventManagerModule;
import com.reactnativezoom.sdk.convert.RNZoomSDKEnumConvert;

import java.util.List;

import us.zoom.sdk.InMeetingServiceListener.VideoStatus;
import us.zoom.sdk.InMeetingServiceListener.AudioStatus;
import us.zoom.sdk.VideoQuality;
import us.zoom.sdk.InMeetingServiceListener.UVCCameraStatus;
import us.zoom.sdk.InMeetingAudioController.MobileRTCMicrophoneError;
import us.zoom.sdk.ZoomSDKChatMessageType;
import us.zoom.sdk.ChatMessageDeleteType;
import us.zoom.sdk.InMeetingChatController;
import us.zoom.sdk.InMeetingAudioController;
import us.zoom.sdk.InMeetingChatController.MobileRTCWebinarPanelistChatPrivilege;
import us.zoom.sdk.FreeMeetingNeedUpgradeType;
import us.zoom.sdk.InMeetingServiceListener.RecordingStatus;
import us.zoom.sdk.LocalRecordingRequestPrivilegeStatus;
import us.zoom.sdk.MobileRTCFocusModeShareType;
import us.zoom.sdk.CameraControlRequestType;
//import us.zoom.sdk.CameraControlRequestResult;
import us.zoom.sdk.InMeetingShareController;

import us.zoom.sdk.MeetingViewsOptions;
import us.zoom.sdk.JoinMeetingOptions;
import us.zoom.sdk.MeetingService;
import us.zoom.sdk.ZoomSDK;
import us.zoom.sdk.MeetingSettingsHelper;
import us.zoom.sdk.ZoomSDKInitParams;
import us.zoom.sdk.MeetingViewsOptions;
import us.zoom.sdk.ZoomSDKInitializeListener;
import us.zoom.sdk.InMeetingServiceListener;
import us.zoom.sdk.MeetingServiceListener;
import us.zoom.sdk.MeetingError;
import us.zoom.sdk.InMeetingShareController.InMeetingShareListener;
import us.zoom.sdk.ICameraControlRequestHandler;
import us.zoom.sdk.JoinMeetingParam4WithoutLogin;
import us.zoom.sdk.IMeetingArchiveConfirmHandler;
import us.zoom.sdk.IRequestLocalRecordingPrivilegeHandler;
import us.zoom.sdk.InMeetingEventHandler;
import us.zoom.sdk.IMeetingInputUserInfoHandler;
import us.zoom.sdk.InMeetingChatMessage;
import us.zoom.sdk.MeetingStatus;
import us.zoom.sdk.MeetingParameter;
import us.zoom.sdk.SharingStatus;
import us.zoom.sdk.ShareSettingType;
import us.zoom.sdk.StartMeetingOptions;
import us.zoom.sdk.StartMeetingParamsWithoutLogin;

public class RNZoomSDKModule extends ReactContextBaseJavaModule implements ZoomSDKInitializeListener, LifecycleEventListener, MeetingServiceListener {

  private final String DEBUG_TAG = "ZoomSDKDebug";
  private final ReactApplicationContext reactContext;
  private boolean meetingServiceListenerRegistered = false;

  protected Display display;
  protected DisplayMetrics displayMetrics;

  RNZoomSDKModule(ReactApplicationContext reactContext) {
    super(reactContext);
    this.reactContext = reactContext;
    reactContext.addLifecycleEventListener(this);

    display = ((WindowManager) reactContext.getSystemService(Service.WINDOW_SERVICE)).getDefaultDisplay();
    displayMetrics = new DisplayMetrics();
    display.getMetrics(displayMetrics);
  }

  @Override
  public String getName() {
    return "RNZoomSDK";
  }

  /** Required for RN 0.65+ when using NativeEventEmitter with this module from JS. */
  @ReactMethod
  public void addListener(String eventName) {
    // Events are emitted via RCTDeviceEventEmitter; no-op keeps RN happy.
  }

  /** Required for RN 0.65+ when using NativeEventEmitter with this module from JS. */
  @ReactMethod
  public void removeListeners(double count) {
    // Keep in sync with addListener — required for new architecture / LogBox checks.
  }

  public String[] supportedEvents() {
    return new String[] {
    };
  }

  @ReactMethod
  public void isInitialized(Promise promise) {
    if (Utils.checkRNActivity(reactContext, promise)) {
      return;
    }
    reactContext.getCurrentActivity().runOnUiThread(new Runnable() {
      @Override
      public void run() {
        try {
          ZoomSDK zoomSDK = ZoomSDK.getInstance();
          promise.resolve(zoomSDK.isInitialized());
        } catch (Exception e) {
          promise.reject("SDK_UNEXPECTED_EXCEPTION", e);
        }
      }
    });
  }

  @ReactMethod
  public void initSDK(ReadableMap config, Promise promise) {
    if (Utils.checkRNActivity(reactContext, promise)) {
      return;
    }
    reactContext.getCurrentActivity().runOnUiThread(new Runnable() {
      @Override
      public void run() {
        ZoomSDK zoomSDK = ZoomSDK.getInstance();
        ZoomSDKInitParams initParams = new ZoomSDKInitParams();
        if (config.hasKey("jwtToken")) {
          initParams.jwtToken = config.getString("jwtToken");
        }
        if (config.hasKey("domain")) {
          initParams.domain = config.getString("domain");
        }
        if (config.hasKey("enableLog")) {
          initParams.enableLog = config.getBoolean("enableLog");
        }
        if (config.hasKey("logSize")) {
          initParams.logSize = config.getInt("logSize");
        } else {
          initParams.logSize = 5;
        }
        initParams.enableGenerateDump =true;
        initParams.wrapperType = 2;

        zoomSDK.initialize(reactContext.getCurrentActivity(), RNZoomSDKModule.this, initParams);

        Log.d(DEBUG_TAG, "SDK initialized successfully");

        promise.resolve(true);
      }
    });
  }

  @ReactMethod
  public void updateMeetingSetting(ReadableMap config, Promise promise) {
    if (Utils.checkRNActivity(reactContext, promise)) {
      return;
    }
    reactContext.getCurrentActivity().runOnUiThread(new Runnable() {
      @Override
      public void run() {
        ZoomSDK zoomSDK = ZoomSDK.getInstance();
        if (zoomSDK.isInitialized()) {
          MeetingSettingsHelper meetingSettingsHelper = ZoomSDK.getInstance().getMeetingSettingsHelper();
          if (config.hasKey("disableVideoPreview")) {
            meetingSettingsHelper.disableShowVideoPreviewWhenJoinMeeting(config.getBoolean("disableVideoPreview"));
          }
          if (config.hasKey("disableClearWebKitCache")) {
            meetingSettingsHelper.disableClearWebKitCache(config.getBoolean("disableClearWebKitCache"));
          }
        }
        String[] parts = config.getString("language").split("-");
        Locale locale = parts.length == 1
                ? new Locale(parts[0])
                : new Locale(parts[0], parts[1]);
        zoomSDK.setSdkLocale(reactContext, locale);
      }
    });
  }

  @ReactMethod
  public void joinMeeting(ReadableMap config, Promise promise) {
    if (Utils.checkRNActivity(reactContext, promise)) {
      return;
    }
    reactContext.getCurrentActivity().runOnUiThread(new Runnable() {
      @Override
      public void run() {
        try {
          MeetingService meetingService = ZoomSDK.getInstance().getMeetingService();

          JoinMeetingOptions joinOptions = new JoinMeetingOptions();
          if(config.hasKey("noDrivingMode")) joinOptions.no_driving_mode = config.getBoolean("noDrivingMode");
          if(config.hasKey("noInvite")) joinOptions.no_invite = config.getBoolean("noInvite");
          if(config.hasKey("noMeetingEndMessage")) joinOptions.no_meeting_end_message = config.getBoolean("noMeetingEndMessage");
          if(config.hasKey("noMeetingErrorMessage")) joinOptions.no_meeting_error_message = config.getBoolean("noMeetingErrorMessage");
          if(config.hasKey("noTitleBar")) joinOptions.no_titlebar = config.getBoolean("noTitleBar");
          if(config.hasKey("noBottomToolbar")) joinOptions.no_bottom_toolbar = config.getBoolean("noBottomToolbar");
          if(config.hasKey("noPhoneDialIn")) joinOptions.no_dial_in_via_phone = config.getBoolean("noPhoneDialIn");
          if(config.hasKey("noPhoneDialOut")) joinOptions.no_dial_out_to_phone = config.getBoolean("noPhoneDialOut");
          if(config.hasKey("noDisconnectAudio")) joinOptions.no_disconnect_audio = config.getBoolean("noDisconnectAudio");
          if(config.hasKey("noRecord")) joinOptions.no_record = config.getBoolean("noRecord");
          if(config.hasKey("noShare")) joinOptions.no_share = config.getBoolean("noShare");
          if(config.hasKey("noVideo")) joinOptions.no_video = config.getBoolean("noVideo");
          if(config.hasKey("inviteOptions")) joinOptions.invite_options = RNZoomSDKEnumConvert.getInviteOptions(config.getString("inviteOptions"));
          if(config.hasKey("customerKey")) joinOptions.customer_key = config.getString("customerKey");
          if(config.hasKey("customMeetingId")) joinOptions.custom_meeting_id = config.getString("customMeetingId");
          if(config.hasKey("noUnmuteConfirmDialog")) joinOptions.no_unmute_confirm_dialog = config.getBoolean("noUnmuteConfirmDialog");
          if(config.hasKey("noWebinarRegisterDialog")) joinOptions.no_webinar_register_dialog = config.getBoolean("noWebinarRegisterDialog");
          if(config.hasKey("noChatMsgToast")) joinOptions.no_chat_msg_toast = config.getBoolean("noChatMsgToast");
          if(config.hasKey("noAudio")) joinOptions.no_audio = config.getBoolean("noAudio");
          if(config.hasKey("webinarToken")) joinOptions.webinar_token = config.getString("webinarToken");
          if(config.hasKey("meetingViewsOptions")) joinOptions.meeting_views_options = RNZoomSDKEnumConvert.getMeetingViewsOptions(config.getString("meetingViewsOptions"));

          JoinMeetingParam4WithoutLogin params = new JoinMeetingParam4WithoutLogin();
          params.displayName = config.getString("userName");
          params.meetingNo = config.getString("meetingNumber");
          if (config.hasKey("userType")) params.userType = config.getInt("userType");
          if (config.hasKey("password")) params.password = config.getString("password");
          if (config.hasKey("zoomAccessToken")) params.zoomAccessToken = config.getString("zoomAccessToken");
          if (config.hasKey("vanityID")) params.vanityID = config.getString("vanityID");
          if (config.hasKey("webinarToken")) params.webinarToken = config.getString("webinarToken");
          if (config.hasKey("joinToken")) params.join_token = config.getString("joinToken");
          if (config.hasKey("appPrivilegeToken")) params.appPrivilegeToken = config.getString("appPrivilegeToken");
          if (config.hasKey("isMyVoiceInMix")) params.isMyVoiceInMix = config.getBoolean("isMyVoiceInMix");
          if (config.hasKey("isAudioRawDataStereo")) params.isAudioRawDataStereo = config.getBoolean("isAudioRawDataStereo");

          int joinMeetingResult = meetingService.joinMeetingWithParams(reactContext.getCurrentActivity(), params, joinOptions);

          promise.resolve(joinMeetingResult);

          if (joinMeetingResult == 0) {
            Log.d(DEBUG_TAG, "Join meeting success");
          } else {
            Log.d(DEBUG_TAG, "Join meeting failed, error code = " + joinMeetingResult);
          }

        } catch(Exception e) {
          Log.d(DEBUG_TAG, "Join meeting failed");

          promise.reject("joinMeeting_failure", "Join meeting failed", (WritableMap) null);
        }
      }
    });
  }

  @ReactMethod
  public void startMeeting(ReadableMap config, Promise promise) {
    if (Utils.checkRNActivity(reactContext, promise)) {
      return;
    }
    reactContext.getCurrentActivity().runOnUiThread(new Runnable() {
      @Override
      public void run() {
        try {
          MeetingService meetingService = ZoomSDK.getInstance().getMeetingService();

          StartMeetingOptions joinOptions = new StartMeetingOptions();
          if(config.hasKey("noDrivingMode")) joinOptions.no_driving_mode = config.getBoolean("noDrivingMode");
          if(config.hasKey("noInvite")) joinOptions.no_invite = config.getBoolean("noInvite");
          if(config.hasKey("noMeetingEndMessage")) joinOptions.no_meeting_end_message = config.getBoolean("noMeetingEndMessage");
          if(config.hasKey("noMeetingErrorMessage")) joinOptions.no_meeting_error_message = config.getBoolean("noMeetingErrorMessage");
          if(config.hasKey("noTitleBar")) joinOptions.no_titlebar = config.getBoolean("noTitleBar");
          if(config.hasKey("noBottomToolbar")) joinOptions.no_bottom_toolbar = config.getBoolean("noBottomToolbar");
          if(config.hasKey("noPhoneDialIn")) joinOptions.no_dial_in_via_phone = config.getBoolean("noPhoneDialIn");
          if(config.hasKey("noPhoneDialOut")) joinOptions.no_dial_out_to_phone = config.getBoolean("noPhoneDialOut");
          if(config.hasKey("noDisconnectAudio")) joinOptions.no_disconnect_audio = config.getBoolean("noDisconnectAudio");
          if(config.hasKey("noRecord")) joinOptions.no_record = config.getBoolean("noRecord");
          if(config.hasKey("noShare")) joinOptions.no_share = config.getBoolean("noShare");
          if(config.hasKey("noVideo")) joinOptions.no_video = config.getBoolean("noVideo");
          if(config.hasKey("inviteOptions")) joinOptions.invite_options = RNZoomSDKEnumConvert.getInviteOptions(config.getString("inviteOptions"));
          if(config.hasKey("customerKey")) joinOptions.customer_key = config.getString("customerKey");
          if(config.hasKey("customMeetingId")) joinOptions.custom_meeting_id = config.getString("customMeetingId");
          if(config.hasKey("noUnmuteConfirmDialog")) joinOptions.no_unmute_confirm_dialog = config.getBoolean("noUnmuteConfirmDialog");
          if(config.hasKey("noWebinarRegisterDialog")) joinOptions.no_webinar_register_dialog = config.getBoolean("noWebinarRegisterDialog");
          if(config.hasKey("noChatMsgToast")) joinOptions.no_chat_msg_toast = config.getBoolean("noChatMsgToast");
          if(config.hasKey("noAudio")) joinOptions.no_audio = config.getBoolean("noAudio");
          if(config.hasKey("meetingViewsOptions")) joinOptions.meeting_views_options = RNZoomSDKEnumConvert.getMeetingViewsOptions(config.getString("meetingViewsOptions"));

          StartMeetingParamsWithoutLogin params = new StartMeetingParamsWithoutLogin();
          params.displayName = config.getString("userName");
          params.meetingNo = config.getString("meetingNumber");
          if (config.hasKey("userType")) params.userType = config.getInt("userType");
          if (config.hasKey("zoomAccessToken")) params.zoomAccessToken = config.getString("zoomAccessToken");
          if (config.hasKey("vanityID")) params.vanityID = config.getString("vanityID");
          if (config.hasKey("isMyVoiceInMix")) params.isMyVoiceInMix = config.getBoolean("isMyVoiceInMix");
          if (config.hasKey("inviteContactId")) params.inviteContactId = config.getString("inviteContactId");
          if (config.hasKey("isAudioRawDataStereo")) params.isAudioRawDataStereo = config.getBoolean("isAudioRawDataStereo");

          int startMeetingResult = meetingService.startMeetingWithParams(reactContext.getCurrentActivity(), params, joinOptions);
          promise.resolve(startMeetingResult);

        } catch(Exception e) {
          promise.reject("startMeeting_failure", "Start meeting failed", (WritableMap) null);
        }
      }
    });
  }

  @ReactMethod
  public void cleanup(Promise promise) {
    if (Utils.checkRNActivity(reactContext, promise)) {
      return;
    }
    reactContext.getCurrentActivity().runOnUiThread(new Runnable() {
      @Override
      public void run() {
        ZoomSDK zoomSDK = ZoomSDK.getInstance();
        zoomSDK.uninitialize();
      }
    });
  }

  // -----------------------------------------------------------------------------------------------
  // region ZoomSDKInitializeListener
  // -----------------------------------------------------------------------------------------------

  @Override
  public void onZoomSDKInitializeResult(int errorCode, int internalErrorCode) {
    Log.d(DEBUG_TAG, "onZoomSDKInitializeResult, errorCode = " + errorCode + ", internalErrorCode = " + internalErrorCode);
    // Mirror iOS patched RNZoomSDK: register meeting status listener so JS receives onMeetingStateChange.
    if (errorCode != 0 || meetingServiceListenerRegistered) {
      return;
    }
    try {
      MeetingService meetingService = ZoomSDK.getInstance().getMeetingService();
      if (meetingService != null) {
        meetingService.addListener(this);
        meetingServiceListenerRegistered = true;
        Log.d(DEBUG_TAG, "MeetingServiceListener registered");
      }
    } catch (Exception e) {
      Log.e(DEBUG_TAG, "Failed to register MeetingServiceListener", e);
    }
  }

  @Override
  public void onZoomAuthIdentityExpired() {
    Log.d(DEBUG_TAG, "onZoomAuthIdentityExpired");
  }

  // -----------------------------------------------------------------------------------------------
  // endregion
  // -----------------------------------------------------------------------------------------------

  // -----------------------------------------------------------------------------------------------
  // region LifecycleEventListener
  // -----------------------------------------------------------------------------------------------

  @Override
  public void onHostResume() {
    Log.d(DEBUG_TAG, "onHostResume");
  }

  @Override
  public void onHostPause() {
    Log.d(DEBUG_TAG, "onHostPause");
  }

  @Override
  public void onHostDestroy() {
    Log.d(DEBUG_TAG, "onHostDestroy");
    try {
      if (meetingServiceListenerRegistered && ZoomSDK.getInstance().isInitialized()) {
        MeetingService ms = ZoomSDK.getInstance().getMeetingService();
        if (ms != null) {
          ms.removeListener(this);
        }
      }
    } catch (Exception e) {
      Log.e(DEBUG_TAG, "onHostDestroy removeListener", e);
    } finally {
      meetingServiceListenerRegistered = false;
    }
  }



  // -----------------------------------------------------------------------------------------------
  // endregion
  // -----------------------------------------------------------------------------------------------

  // -----------------------------------------------------------------------------------------------
  // region MeetingServiceListener (Android meeting status → same numeric states as iOS MobileRTCMeetingState)
  // -----------------------------------------------------------------------------------------------

  @Override
  public void onMeetingStatusChanged(MeetingStatus meetingStatus, int errorCode, int internalErrorCode) {
    Log.d(DEBUG_TAG, "onMeetingStatusChanged: " + meetingStatus + " errorCode=" + errorCode);
    WritableMap params = Arguments.createMap();
    params.putInt("state", mapMeetingStatusToIosState(meetingStatus));
    sendEvent(reactContext, "onMeetingStateChange", params);
  }

  // onMeetingParameterNotification is required in SDK 6.7.x+; kept as a plain method
  // (no @Override) so the same patch compiles cleanly against both 6.6.x and 6.7.x.
  public void onMeetingParameterNotification(MeetingParameter meetingParameter) {
    // no-op
  }

  /**
   * Maps Android {@link MeetingStatus} to the same integer values as iOS
   * MobileRTCMeetingState (see ZoomMeeting/index.tsx MEETING_STATE).
   */
  private static int mapMeetingStatusToIosState(MeetingStatus status) {
    if (status == null) {
      return 0;
    }
    switch (status) {
      case MEETING_STATUS_IDLE:
        return 0;
      case MEETING_STATUS_CONNECTING:
        return 1;
      case MEETING_STATUS_WAITINGFORHOST:
        return 2;
      case MEETING_STATUS_INMEETING:
        return 3;
      case MEETING_STATUS_DISCONNECTING:
        return 4;
      case MEETING_STATUS_RECONNECTING:
        return 5;
      case MEETING_STATUS_FAILED:
        return 6;
      case MEETING_STATUS_ENDED:
        return 7;
      default:
        return 3;
    }
  }

  // -----------------------------------------------------------------------------------------------
  // endregion
  // -----------------------------------------------------------------------------------------------

  // -----------------------------------------------------------------------------------------------
  // region Helper Methods
  // -----------------------------------------------------------------------------------------------

  private void sendEvent(ReactContext reactContext, String eventName, @Nullable WritableMap params) {
    reactContext
            .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
            .emit(eventName, params);
  }

  // -----------------------------------------------------------------------------------------------
  // endregion
  // -----------------------------------------------------------------------------------------------

}
