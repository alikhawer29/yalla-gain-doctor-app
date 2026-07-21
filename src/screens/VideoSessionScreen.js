/**
 * Zoom Video SDK — custom doctor session UI (YallaGain design).
 */
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Alert,
  Modal,
  PanResponder,
  Platform,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Image from '../components/Image';
import images from '../assets/images';
import { useRoute, useNavigation } from '@react-navigation/native';
import {
  EventType,
  useZoom,
  ZoomView,
  VideoAspect,
  ZoomVideoSdkUser,
} from '@zoom/react-native-videosdk';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import usePermissions from '../hooks/usePermissions';
import { useEndZoomMeetingMutation } from '../redux/Apis/User';
import * as ZoomVideoService from '../services/ZoomVideoService';
import {
  formatSessionCountdown,
  getSessionEndMs,
  getSessionRemainingSeconds,
  hasSessionCountdown,
} from '../utils/sessionCountdown';
import styles, {
  LOCAL_H,
  LOCAL_W,
  videoSessionColors,
} from './VideoSession/styles';
import {
  BackChevronIcon,
  CameraIcon,
  FlipCameraIcon,
  MicIcon,
  SpeakerIcon,
} from './VideoSession/VideoSessionIcons';

function initialsFromName(name) {
  if (!name || typeof name !== 'string') return '?';
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

const ParticipantCameraOffView = ({ initials, name }) => (
  <View style={styles.remoteCameraOffLayer}>
    <View style={styles.participantAvatarHero}>
      <View style={styles.participantAvatarGlow} />
      <View style={styles.participantAvatarCircle}>
        <Text style={styles.participantAvatarInitials}>{initials}</Text>
      </View>
    </View>
    {name ? (
      <Text style={styles.participantAvatarName} numberOfLines={2}>
        {name}
      </Text>
    ) : null}
  </View>
);

const ControlItem = ({ label, onPress, children, style }) => (
  <TouchableOpacity
    style={[styles.controlItem, style]}
    onPress={onPress}
    activeOpacity={0.7}
    accessibilityRole="button"
    accessibilityLabel={label}>
    {children}
    <Text style={styles.controlLabel} numberOfLines={1}>
      {label}
    </Text>
  </TouchableOpacity>
);

function getRequiredSessionPermissions(PERMISSIONS) {
  if (Platform.OS === 'ios') {
    return [PERMISSIONS.IOS.CAMERA, PERMISSIONS.IOS.MICROPHONE];
  }
  if (Platform.OS === 'android') {
    return [PERMISSIONS.ANDROID.CAMERA, PERMISSIONS.ANDROID.RECORD_AUDIO];
  }
  return [];
}

const VideoSessionScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const insets = useSafeAreaInsets();
  const zoom = useZoom();
  const { ensurePermissions, requestPermissions, PERMISSIONS } =
    usePermissions();
  const [endZoomSession] = useEndZoomMeetingMutation();

  const {
    session_token,
    session_name,
    user_name,
    role = 1,
    doctor_name,
    patient_name,
    appointment_id,
    session_status,
    duration_minutes,
    started_at,
    scheduled_start_at,
    scheduled_end_at,
  } = route.params || {};

  const sessionTiming = {
    status: session_status,
    duration_minutes,
    started_at,
    scheduled_start_at,
    scheduled_end_at,
  };

  const isHost = Number(role) === 1;

  const mainSizeRef = useRef({ w: 0, h: 0 });
  const pipPlacedRef = useRef(false);
  const [localPos, setLocalPos] = useState({ x: 0, y: 0 });
  const localPosRef = useRef(localPos);
  localPosRef.current = localPos;
  const dragStartRef = useRef(localPos);

  const clampPipPosition = useCallback((x, y) => {
    const { w, h } = mainSizeRef.current;
    if (w <= 0 || h <= 0) {
      return { x, y };
    }
    const pad = 8;
    return {
      x: Math.min(Math.max(pad, x), w - LOCAL_W - pad),
      y: Math.min(Math.max(pad, y), h - LOCAL_H - pad),
    };
  }, []);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gesture) =>
        Math.abs(gesture.dx) > 2 || Math.abs(gesture.dy) > 2,
      onPanResponderGrant: () => {
        dragStartRef.current = { ...localPosRef.current };
      },
      onPanResponderMove: (_, gesture) => {
        setLocalPos(
          clampPipPosition(
            dragStartRef.current.x + gesture.dx,
            dragStartRef.current.y + gesture.dy,
          ),
        );
      },
    }),
  ).current;

  const onMainLayout = useCallback(e => {
    const { width, height } = e.nativeEvent.layout;
    mainSizeRef.current = { w: width, h: height };
    if (!pipPlacedRef.current && width > 0 && height > 0) {
      pipPlacedRef.current = true;
      setLocalPos({
        x: width - LOCAL_W - 16,
        y: height - LOCAL_H - 16,
      });
    }
  }, []);

  const [isConnecting, setIsConnecting] = useState(true);
  const [connectingDots, setConnectingDots] = useState('');
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isBackCamera, setIsBackCamera] = useState(false);
  const [isAudioOn, setIsAudioOn] = useState(true);
  const [isSpeakerOn, setIsSpeakerOn] = useState(true);
  const [remainingSeconds, setRemainingSeconds] = useState(() =>
    getSessionRemainingSeconds(sessionTiming),
  );
  const [remoteUserJoined, setRemoteUserJoined] = useState(false);
  const [sessionEnded, setSessionEnded] = useState(false);
  const [users, setUsers] = useState([]);
  const [remoteVideoOn, setRemoteVideoOn] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  const timerRef = useRef(null);
  const hasEndedApiRef = useRef(false);
  const autoEndedRef = useRef(false);
  const joinStartedRef = useRef(false);
  const voluntaryLeaveRef = useRef(false);

  useEffect(() => {
    if (!isConnecting) {
      setConnectingDots('');
      return undefined;
    }
    let step = 0;
    const tick = () => {
      step = (step + 1) % 4;
      setConnectingDots('.'.repeat(step));
    };
    tick();
    const id = setInterval(tick, 450);
    return () => clearInterval(id);
  }, [isConnecting]);

  useEffect(() => {
    const tick = () => {
      setRemainingSeconds(getSessionRemainingSeconds(sessionTiming));
    };
    tick();
    const id = setInterval(tick, 1000);
    timerRef.current = id;
    return () => {
      clearInterval(id);
      timerRef.current = null;
    };
  }, [
    session_status,
    duration_minutes,
    started_at,
    scheduled_start_at,
    scheduled_end_at,
  ]);

  const syncLocalMediaState = useCallback(async () => {
    try {
      const mySelf = await ZoomVideoService.getMySelfUser();
      if (!mySelf) return;
      const [muted, videoOn, speakerOn] = await Promise.all([
        mySelf.audioStatus.isMuted(),
        mySelf.videoStatus.isOn(),
        ZoomVideoService.getSpeakerOn(),
      ]);
      setIsAudioOn(!muted);
      setIsVideoOn(videoOn);
      setIsSpeakerOn(speakerOn);
    } catch (e) {
      console.log('[VideoSession] syncLocalMediaState', e);
    }
  }, []);

  const syncUsers = useCallback(async () => {
    if (!zoom?.session) return;
    try {
      const myRaw = await zoom.session.getMySelf();
      const mySelf = new ZoomVideoSdkUser(myRaw);
      const remoteRaw = await zoom.session.getRemoteUsers();
      const remote = (remoteRaw || []).map(u => new ZoomVideoSdkUser(u));
      setUsers([mySelf, ...remote]);
      setRemoteUserJoined(remote.length > 0);
      if (remote.length > 0) {
        const on = await remote[0].videoStatus.isOn();
        setRemoteVideoOn(on);
      } else {
        setRemoteVideoOn(false);
      }
      await syncLocalMediaState();
    } catch (e) {
      console.log('[VideoSession] syncUsers error', e);
    }
  }, [zoom, syncLocalMediaState]);

  const ensureSessionAudio = useCallback(async () => {
    try {
      await ZoomVideoService.configureSessionAudio({ preferSpeaker: true });
      await syncLocalMediaState();
    } catch (e) {
      console.log('[VideoSession] ensureSessionAudio', e);
    }
  }, [syncLocalMediaState]);

  const callEndSessionApi = useCallback(async () => {
    if (!appointment_id || hasEndedApiRef.current) return;
    hasEndedApiRef.current = true;
    try {
      await endZoomSession(appointment_id).unwrap();
    } catch (e) {
      console.log('[VideoSession] end session API error', e);
    }
  }, [appointment_id, endZoomSession]);

  const stopTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const finishAndShowEnded = useCallback(() => {
    setSessionEnded(true);
    stopTimer();
  }, [stopTimer]);

  const endSessionForAll = useCallback(() => {
    try {
      ZoomVideoService.leaveSession(!!isHost);
    } catch (e) {
      console.log('[VideoSession] end leave', e);
    }
    callEndSessionApi();
    finishAndShowEnded();
  }, [callEndSessionApi, finishAndShowEnded, isHost]);

  const leaveMeetingOnly = useCallback(() => {
    voluntaryLeaveRef.current = true;
    stopTimer();
    try {
      ZoomVideoService.leaveSession(false);
    } catch (e) {
      console.log('[VideoSession] leave meeting only', e);
    }
    navigation.goBack();
  }, [navigation, stopTimer]);

  const confirmLeaveMeeting = useCallback(() => {
    Alert.alert(
      'Leave Meeting?',
      'You will leave the video call. You can rejoin from booking details.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Leave',
          onPress: leaveMeetingOnly,
        },
      ],
    );
  }, [leaveMeetingOnly]);

  const confirmEndSession = useCallback(() => {
    Alert.alert(
      'End Session',
      'End this session for everyone? The patient will not be able to rejoin.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'End Session',
          style: 'destructive',
          onPress: endSessionForAll,
        },
      ],
    );
  }, [endSessionForAll]);

  useEffect(() => {
    const unsubscribe = navigation.addListener('beforeRemove', e => {
      if (voluntaryLeaveRef.current || sessionEnded || autoEndedRef.current) {
        return;
      }
      e.preventDefault();
      confirmLeaveMeeting();
    });
    return unsubscribe;
  }, [navigation, confirmLeaveMeeting, sessionEnded]);

  useEffect(() => {
    if (!hasSessionCountdown(sessionTiming)) return;
    if (getSessionEndMs(sessionTiming) == null) return;
    if (sessionEnded || autoEndedRef.current) return;
    if (remainingSeconds > 0) return;

    autoEndedRef.current = true;
    endSessionForAll();
  }, [
    remainingSeconds,
    sessionEnded,
    session_status,
    duration_minutes,
    started_at,
    scheduled_start_at,
    scheduled_end_at,
    endSessionForAll,
  ]);

  useEffect(() => {
    ZoomVideoService.bindZoom(zoom);
    ZoomVideoService.setSessionEventHandlers({
      onSessionJoin: async () => {
        setIsConnecting(false);
        await ZoomVideoService.applyCameraFacing(false);
        await ensureSessionAudio();
        await syncUsers();
      },
      onSessionLeave: () => {
        if (voluntaryLeaveRef.current) {
          voluntaryLeaveRef.current = false;
          stopTimer();
          return;
        }
        callEndSessionApi();
        finishAndShowEnded();
      },
      onUserJoin: async () => {
        await new Promise(resolve => setTimeout(resolve, 400));
        await ensureSessionAudio();
        await syncUsers();
      },
      onUserLeave: async () => {
        await syncUsers();
        const remotes = await zoom.session.getRemoteUsers();
        if (!remotes?.length) {
          Alert.alert(
            'Participant left',
            'The other person left the session.',
          );
        }
      },
      onSessionError: err => {
        const msg =
          err?.message || err?.errorDescription || 'Video session error';
        setErrorMessage(msg);
        Alert.alert('Session Error', msg, [
          { text: 'OK', onPress: () => navigation.goBack() },
        ]);
      },
    });

    const extraSubs = [
      zoom.addListener(EventType.onUserVideoStatusChanged, async () => {
        await syncUsers();
      }),
      zoom.addListener(EventType.onUserAudioStatusChanged, async () => {
        await syncLocalMediaState();
      }),
    ];

    const start = async () => {
      if (joinStartedRef.current) return;
      joinStartedRef.current = true;

      try {
        const granted = await ensurePermissions(
          getRequiredSessionPermissions(PERMISSIONS),
        );
        if (
          granted &&
          Platform.OS === 'android' &&
          Number(Platform.Version) >= 31
        ) {
          await requestPermissions([
            PERMISSIONS.ANDROID.BLUETOOTH_CONNECT,
          ]).catch(() => {});
        }
        if (!granted) {
          setErrorMessage('Camera and microphone permissions are required.');
          Alert.alert(
            'Permissions required',
            'Please allow camera and microphone access.',
            [{ text: 'OK', onPress: () => navigation.goBack() }],
          );
          return;
        }

        await ZoomVideoService.initializeSDK(session_token);
        await ZoomVideoService.joinSession({
          sessionName: session_name,
          userName: user_name,
          sessionToken: session_token,
        });
        const inSession = await ZoomVideoService.waitUntilInSession(20000);
        if (!inSession) {
          throw new Error('Session join timed out. Please try again.');
        }
        await ensureSessionAudio();
        ZoomVideoService.getSessionInfo().role = role;
      } catch (e) {
        console.log('[VideoSession] join failed', e);
        const msg = e?.message || 'Failed to join session';
        setErrorMessage(msg);
        setIsConnecting(false);
        Alert.alert('Error', msg, [
          { text: 'OK', onPress: () => navigation.goBack() },
        ]);
      }
    };

    start();

    return () => {
      extraSubs.forEach(s => s.remove());
      stopTimer();
      (async () => {
        try {
          const active = await zoom?.isInSession?.();
          if (active) {
            ZoomVideoService.leaveSession(false);
          }
        } catch (e) {
          console.log('[VideoSession] unmount leave', e);
        }
        ZoomVideoService.unbindZoom();
      })();
    };
  }, [
    zoom,
    session_token,
    session_name,
    user_name,
    role,
    ensurePermissions,
    requestPermissions,
    PERMISSIONS,
    navigation,
    syncUsers,
    ensureSessionAudio,
    callEndSessionApi,
    finishAndShowEnded,
    stopTimer,
  ]);

  const myUser = users[0];
  const remoteUser = users.length > 1 ? users[1] : null;
  const remoteLabel =
    patient_name || remoteUser?.userName || 'Participant';
  const localLabel =
    user_name || doctor_name || 'You';
  const patientInitials = initialsFromName(patient_name || remoteLabel);

  const showWaiting = !isConnecting && !remoteUserJoined;
  const showPatientWaitingAvatar = showWaiting && !isConnecting;
  const showRemoteVideo = remoteUser?.userId && remoteVideoOn;
  const showRemoteAvatar = remoteUserJoined && !showRemoteVideo;

  const onToggleVideo = async () => {
    try {
      const on = await ZoomVideoService.toggleVideo();
      setIsVideoOn(on);
      await syncUsers();
    } catch (e) {
      console.log('[VideoSession] toggleVideo', e);
    }
  };

  const onSwitchCamera = async () => {
    if (!isVideoOn) {
      Alert.alert(
        'Camera',
        'Turn on your camera first to switch between front and back.',
      );
      return;
    }
    try {
      const nextBack = !isBackCamera;
      await ZoomVideoService.switchCamera(nextBack);
      setIsBackCamera(nextBack);
    } catch (e) {
      console.log('[VideoSession] switchCamera', e);
      Alert.alert('Camera', 'Could not switch camera. Please try again.');
    }
  };

  const onToggleAudio = async () => {
    try {
      const on = await ZoomVideoService.toggleAudio();
      setIsAudioOn(on);
    } catch (e) {
      console.log('[VideoSession] toggleAudio', e);
    }
  };

  const onToggleSpeaker = async () => {
    const targetOn = !isSpeakerOn;
    setIsSpeakerOn(targetOn);
    try {
      const on = await ZoomVideoService.toggleSpeaker(targetOn);
      setIsSpeakerOn(on);
    } catch (e) {
      setIsSpeakerOn(!targetOn);
      console.log('[VideoSession] toggleSpeaker', e);
    }
  };

  const remoteUserId = remoteUser?.userId ?? null;
  const localUserId = myUser?.userId ?? null;
  const hasSessionTimer = hasSessionCountdown(sessionTiming);
  const timerDisplay = formatSessionCountdown(remainingSeconds);

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={videoSessionColors.bg} />

      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <View style={styles.headerLeft}>
          <TouchableOpacity
            style={styles.leaveBtn}
            onPress={confirmLeaveMeeting}
            hitSlop={{ top: 12, bottom: 12, left: 8, right: 8 }}
            accessibilityRole="button"
            accessibilityLabel="Go back and leave meeting">
            <BackChevronIcon />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.leaveMeetingBtn}
            onPress={confirmLeaveMeeting}
            activeOpacity={0.85}
            accessibilityRole="button"
            accessibilityLabel="Leave meeting">
            <Text style={styles.leaveMeetingText}>Leave Meeting</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.brandTitle}>YallaGain</Text>

        <View style={styles.timerWrap}>
          {!isConnecting ? <View style={styles.liveDot} /> : null}
          <Text style={styles.timerText}>
            {!hasSessionTimer ? '--:--' : timerDisplay}
          </Text>
        </View>
      </View>

      {/* Main video / waiting */}
      <View style={styles.main} onLayout={onMainLayout}>
        {showRemoteVideo ? (
          <ZoomView
            userId={remoteUserId}
            fullScreen
            videoAspect={VideoAspect.PanAndScan}
            style={styles.remoteVideo}
          />
        ) : null}

        {showRemoteAvatar ? (
          <ParticipantCameraOffView
            initials={initialsFromName(remoteLabel)}
            name={remoteLabel}
          />
        ) : null}

        {(isConnecting || showWaiting) && (
          <View style={styles.waitingLayer}>
            {showPatientWaitingAvatar ? (
              <View style={styles.waitingHero}>
                <View style={styles.participantAvatarGlow} />
                <View style={styles.participantAvatarCircle}>
                  <Text style={styles.participantAvatarInitials}>
                    {patientInitials}
                  </Text>
                </View>
              </View>
            ) : null}
            {isConnecting ? (
              <View style={styles.connectingHero}>
                <Image
                  source={images.logo}
                  style={styles.connectingLogo}
                  resize="contain"
                />
              </View>
            ) : null}
            <Text style={styles.waitingTitle}>
              {isConnecting
                ? `Connecting to session${connectingDots}`
                : 'Waiting for patient to join...'}
            </Text>
            {!isConnecting && patient_name ? (
              <Text style={styles.waitingSubtitle}>
                {`Waiting for ${patient_name}`}
              </Text>
            ) : null}
            {!isConnecting && !patient_name ? (
              <Text style={styles.waitingSubtitle}>
                Share the session with your patient
              </Text>
            ) : null}
          </View>
        )}

        {/* Local PiP */}
        {localUserId ? (
          <View
            style={[
              styles.pip,
              { left: localPos.x, top: localPos.y },
            ]}
            {...panResponder.panHandlers}>
            {isVideoOn ? (
              <ZoomView
                userId={localUserId}
                preview={false}
                isPiPView
                videoAspect={VideoAspect.Original}
                style={styles.pipVideo}
              />
            ) : (
              <View style={styles.pipAvatar}>
                <Text style={styles.pipAvatarText}>
                  {initialsFromName(localLabel)}
                </Text>
              </View>
            )}
            {/* {isVideoOn ? (
              <TouchableOpacity
                style={styles.pipFlipBtn}
                onPress={onSwitchCamera}
                activeOpacity={0.85}
                accessibilityRole="button"
                accessibilityLabel={
                  isBackCamera ? 'Switch to front camera' : 'Switch to back camera'
                }>
                <FlipCameraIcon size={16} />
              </TouchableOpacity>
            ) : null} */}
            <View style={styles.pipLabel}>
              <Text style={styles.pipLabelText} numberOfLines={1}>
                {localLabel}
              </Text>
            </View>
          </View>
        ) : null}
      </View>

      {errorMessage ? (
        <Text style={styles.errorBanner}>{errorMessage}</Text>
      ) : null}

      {/* Bottom controls */}
      <View style={[styles.footer, { paddingBottom: insets.bottom + 14 }]}>
        <View style={styles.controlsRow}>
          <ControlItem
            label={isAudioOn ? 'Mute' : 'Unmute'}
            onPress={onToggleAudio}>
            <MicIcon active={isAudioOn} />
          </ControlItem>

          <ControlItem label="Camera" onPress={onToggleVideo}>
            <CameraIcon active={isVideoOn} />
          </ControlItem>

          <TouchableOpacity
            style={styles.endPill}
            onPress={isHost ? confirmEndSession : confirmLeaveMeeting}
            activeOpacity={0.85}
            accessibilityRole="button"
            accessibilityLabel={isHost ? 'End session for everyone' : 'Leave meeting'}>
            <Text style={styles.endPillText}>
              {isHost ? 'End Session' : 'Leave Meeting'}
            </Text>
          </TouchableOpacity>

          <ControlItem
            label={isSpeakerOn ? 'Speaker' : 'Earpiece'}
            onPress={onToggleSpeaker}
            style={styles.speakerControl}>
            <SpeakerIcon active={isSpeakerOn} />
          </ControlItem>
        </View>
      </View>

      <Modal visible={sessionEnded} transparent animationType="fade">
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Session Ended</Text>
            <Text style={styles.modalBody}>
              The video session has ended.
            </Text>
            <TouchableOpacity
              style={styles.modalBtn}
              onPress={() => navigation.goBack()}>
              <Text style={styles.modalBtnText}>Go Back</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default VideoSessionScreen;
