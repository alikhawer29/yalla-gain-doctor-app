/**
 * Zoom Video SDK service (@zoom/react-native-videosdk).
 * Bind the SDK instance from a screen via bindZoom() before calling join/leave.
 */
import { Platform } from 'react-native';
import { EventType, ZoomVideoSdkUser } from '@zoom/react-native-videosdk';

let zoomInstance = null;
let storedSessionToken = null;
let listenerSubscriptions = [];
/** When true, session audio setup must not unmute the local mic. */
let userPrefersMicMuted = false;
/** iOS getSpeakerStatus() often lags after setSpeaker; track route locally. */
let speakerRouteOn = true;

const sessionInfo = {
  sessionName: null,
  userName: null,
  role: null,
  inSession: false,
  remoteUserCount: 0,
};

const eventHandlers = {
  onSessionJoin: null,
  onSessionLeave: null,
  onUserJoin: null,
  onUserLeave: null,
  onSessionError: null,
};

/** Attach useZoom() instance (call from VideoSessionScreen on mount). */
export function bindZoom(zoom) {
  console.log('[ZoomVideoService] bindZoom');
  zoomInstance = zoom;
}

export function unbindZoom() {
  console.log('[ZoomVideoService] unbindZoom');
  try {
    zoomInstance?.audioHelper?.cleanAudioSession?.();
  } catch (e) {
    console.log('[ZoomVideoService] cleanAudioSession', e);
  }
  removeAllListeners();
  zoomInstance = null;
  storedSessionToken = null;
  userPrefersMicMuted = false;
  speakerRouteOn = true;
  sessionInfo.sessionName = null;
  sessionInfo.userName = null;
  sessionInfo.role = null;
  sessionInfo.inSession = false;
  sessionInfo.remoteUserCount = 0;
}

/**
 * Store JWT and verify SDK is bound. Native init runs via ZoomVideoSdkProvider in App.tsx.
 */
export async function initializeSDK(sessionToken) {
  if (!sessionToken) {
    throw new Error('session_token is required');
  }
  if (!zoomInstance) {
    throw new Error('Zoom Video SDK is not ready');
  }
  storedSessionToken = sessionToken;
  console.log('[ZoomVideoService] initializeSDK — token stored');
  return true;
}

/**
 * Register session event callbacks (pass handlers from the screen).
 */
export function setSessionEventHandlers(handlers = {}) {
  eventHandlers.onSessionJoin = handlers.onSessionJoin ?? null;
  eventHandlers.onSessionLeave = handlers.onSessionLeave ?? null;
  eventHandlers.onUserJoin = handlers.onUserJoin ?? null;
  eventHandlers.onUserLeave = handlers.onUserLeave ?? null;
  eventHandlers.onSessionError = handlers.onSessionError ?? null;
  attachListeners();
}

function attachListeners() {
  removeAllListeners();
  if (!zoomInstance) return;

  listenerSubscriptions.push(
    zoomInstance.addListener(EventType.onSessionJoin, async () => {
      console.log('[ZoomVideoService] onSessionJoin');
      sessionInfo.inSession = true;
      await refreshRemoteUserCount();
      eventHandlers.onSessionJoin?.();
    }),
  );

  listenerSubscriptions.push(
    zoomInstance.addListener(EventType.onSessionLeave, reason => {
      console.log('[ZoomVideoService] onSessionLeave', reason);
      sessionInfo.inSession = false;
      sessionInfo.remoteUserCount = 0;
      eventHandlers.onSessionLeave?.(reason);
    }),
  );

  listenerSubscriptions.push(
    zoomInstance.addListener(EventType.onUserJoin, async event => {
      console.log('[ZoomVideoService] onUserJoin', event);
      await refreshRemoteUserCount();
      eventHandlers.onUserJoin?.(event);
    }),
  );

  listenerSubscriptions.push(
    zoomInstance.addListener(EventType.onUserLeave, async event => {
      console.log('[ZoomVideoService] onUserLeave', event);
      await refreshRemoteUserCount();
      eventHandlers.onUserLeave?.(event);
    }),
  );

  listenerSubscriptions.push(
    zoomInstance.addListener(EventType.onError, error => {
      console.log('[ZoomVideoService] onError', error);
      eventHandlers.onSessionError?.(error);
    }),
  );
}

function removeAllListeners() {
  listenerSubscriptions.forEach(sub => sub?.remove?.());
  listenerSubscriptions = [];
}

async function refreshRemoteUserCount() {
  if (!zoomInstance?.session) return;
  try {
    const remoteUsers = await zoomInstance.session.getRemoteUsers();
    sessionInfo.remoteUserCount = Array.isArray(remoteUsers)
      ? remoteUsers.length
      : 0;
  } catch (e) {
    console.log('[ZoomVideoService] refreshRemoteUserCount error', e);
  }
}

async function getMySelf() {
  const raw = await zoomInstance.session.getMySelf();
  return new ZoomVideoSdkUser(raw);
}

/**
 * Join a Video SDK session.
 */
export async function joinSession({
  sessionName,
  userName,
  sessionToken,
}) {
  if (!zoomInstance) {
    throw new Error('Zoom Video SDK is not bound');
  }
  const token = sessionToken || storedSessionToken;
  if (!token) {
    throw new Error('session_token is required to join');
  }
  if (!sessionName || !userName) {
    throw new Error('session_name and user_name are required');
  }

  sessionInfo.sessionName = sessionName;
  sessionInfo.userName = userName;

  console.log('[ZoomVideoService] joinSession', sessionName, userName);

  await zoomInstance.joinSession({
    sessionName: String(sessionName),
    userName: String(userName),
    token,
    sessionIdleTimeoutMins: 40,
    audioOptions: {
      connect: true,
      mute: false,
      autoAdjustSpeakerVolume: true,
    },
    videoOptions: {
      localVideoOn: true,
    },
  });

  return getSessionInfo();
}

/**
 * Poll until native session is active (join is async).
 */
export async function waitUntilInSession(timeoutMs = 20000) {
  if (!zoomInstance?.isInSession) return false;
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    try {
      if (await zoomInstance.isInSession()) {
        return true;
      }
    } catch (e) {
      console.log('[ZoomVideoService] isInSession poll', e);
    }
    await new Promise(resolve => setTimeout(resolve, 250));
  }
  try {
    return !!(await zoomInstance.isInSession());
  } catch {
    return false;
  }
}

/**
 * Start VOIP audio and route to speaker. Does not change mic mute unless the
 * user explicitly muted via toggleAudio (userPrefersMicMuted).
 */
export async function configureSessionAudio({ preferSpeaker = true } = {}) {
  if (!zoomInstance?.audioHelper) {
    return preferSpeaker;
  }

  const { audioHelper } = zoomInstance;

  if (Platform.OS === 'ios') {
    try {
      await audioHelper.setSDKAudioSessionEnv();
    } catch (e) {
      console.log('[ZoomVideoService] setSDKAudioSessionEnv', e);
    }
  }

  try {
    await audioHelper.startAudio();
  } catch (e) {
    console.log('[ZoomVideoService] startAudio', e);
  }

  if (userPrefersMicMuted) {
    try {
      const user = await getMySelf();
      await audioHelper.muteAudio(user.userId);
    } catch (e) {
      console.log('[ZoomVideoService] re-apply user mute', e);
    }
  }

  if (preferSpeaker) {
    try {
      const canSwitch = await audioHelper.canSwitchSpeaker();
      if (canSwitch !== false) {
        await audioHelper.setSpeaker(true);
        speakerRouteOn = true;
      }
    } catch (e) {
      console.log('[ZoomVideoService] setSpeaker on', e);
    }
  }

  return getSpeakerOn();
}

export async function getSpeakerOn() {
  if (Platform.OS === 'ios') {
    return speakerRouteOn;
  }
  if (!zoomInstance?.audioHelper) {
    return speakerRouteOn;
  }
  try {
    speakerRouteOn = !!(await zoomInstance.audioHelper.getSpeakerStatus());
    return speakerRouteOn;
  } catch (e) {
    console.log('[ZoomVideoService] getSpeakerStatus', e);
    return speakerRouteOn;
  }
}

/**
 * Leave session. Host (role === 1) ends for all when isHost is true.
 */
export function leaveSession(isHost = false) {
  if (!zoomInstance) return;
  console.log('[ZoomVideoService] leaveSession', { isHost });
  zoomInstance.leaveSession(!!isHost);
  sessionInfo.inSession = false;
  sessionInfo.remoteUserCount = 0;
}

function pickCameraDeviceId(cameras, preferBack) {
  if (!Array.isArray(cameras) || cameras.length === 0) {
    return undefined;
  }
  const norm = value => String(value || '').toLowerCase();
  const isBack = c =>
    /back|rear|environment|wide|traseir/i.test(
      `${norm(c.deviceName)} ${norm(c.deviceId)}`,
    );
  const isFront = c =>
    /front|user|selfie|facetime|true.?depth/i.test(
      `${norm(c.deviceName)} ${norm(c.deviceId)}`,
    );

  if (preferBack) {
    const back = cameras.find(isBack);
    if (back?.deviceId) return back.deviceId;
    const nonFront = cameras.find(c => !isFront(c));
    if (nonFront?.deviceId) return nonFront.deviceId;
    if (cameras.length > 1) return cameras[1].deviceId;
    return undefined;
  }

  const front = cameras.find(isFront);
  if (front?.deviceId) return front.deviceId;
  return cameras[0]?.deviceId;
}

/**
 * Portrait app: reset preview rotation + mirror after camera switch.
 * Android rotateMyVideo expects display rotation index 0–3 (portrait = 0), not degrees.
 */
async function isZoomSessionActive() {
  if (!zoomInstance?.isInSession) {
    return false;
  }
  try {
    return !!(await zoomInstance.isInSession());
  } catch (e) {
    return false;
  }
}

export async function applyCameraFacing(isBack) {
  if (!zoomInstance?.videoHelper) {
    return;
  }
  if (!(await isZoomSessionActive())) {
    return;
  }
  const helper = zoomInstance.videoHelper;
  const rotation = 0;

  try {
    await helper.rotateMyVideo(rotation);
  } catch (e) {
    console.log('[ZoomVideoService] rotateMyVideo', e);
  }

  try {
    await helper.mirrorMyVideo(!isBack);
  } catch (e) {
    console.log('[ZoomVideoService] mirrorMyVideo', e);
  }
}

/**
 * Switch local camera — preferBack true targets rear camera when available.
 */
export async function switchCamera(preferBack = true) {
  if (!zoomInstance?.videoHelper) {
    throw new Error('videoHelper unavailable');
  }
  const helper = zoomInstance.videoHelper;
  try {
    const list = await helper.getCameraList();
    const deviceId = pickCameraDeviceId(list, preferBack);
    if (deviceId) {
      await helper.switchCamera(deviceId);
    } else {
      await helper.switchCamera();
    }
  } catch (e) {
    console.log('[ZoomVideoService] switchCamera fallback', e);
    await helper.switchCamera();
  }

  await new Promise(resolve => setTimeout(resolve, 120));
  await applyCameraFacing(preferBack);
  return preferBack;
}

/** Toggle local camera on/off. */
export async function toggleVideo() {
  if (!zoomInstance?.videoHelper) {
    throw new Error('videoHelper unavailable');
  }
  const user = await getMySelf();
  const isOn = await user.videoStatus.isOn();
  console.log('[ZoomVideoService] toggleVideo', { isOn });
  if (isOn) {
    await zoomInstance.videoHelper.stopVideo();
    return false;
  }
  await zoomInstance.videoHelper.startVideo();
  await applyCameraFacing(false);
  return true;
}

/** Toggle local mic mute. */
export async function toggleAudio() {
  if (!zoomInstance?.audioHelper) {
    throw new Error('audioHelper unavailable');
  }
  const user = await getMySelf();
  const myId = user.userId;
  const muted = await user.audioStatus.isMuted();
  console.log('[ZoomVideoService] toggleAudio', { muted });
  if (muted) {
    await zoomInstance.audioHelper.unmuteAudio(myId);
    userPrefersMicMuted = false;
    return true;
  }
  await zoomInstance.audioHelper.muteAudio(myId);
  userPrefersMicMuted = true;
  return false;
}

/** Toggle speaker (earpiece vs speaker). */
export async function toggleSpeaker(enableSpeaker) {
  if (!zoomInstance?.audioHelper) return false;

  let next = enableSpeaker;
  if (typeof next !== 'boolean') {
    next = !(await getSpeakerOn());
  }

  console.log('[ZoomVideoService] toggleSpeaker', next);
  speakerRouteOn = next;

  if (Platform.OS === 'ios') {
    try {
      await zoomInstance.audioHelper.setSDKAudioSessionEnv();
    } catch (e) {
      console.log('[ZoomVideoService] setSDKAudioSessionEnv before speaker', e);
    }
  }

  try {
    await zoomInstance.audioHelper.setSpeaker(next);
  } catch (e) {
    console.log('[ZoomVideoService] setSpeaker', e);
  }

  if (Platform.OS === 'ios') {
    try {
      await zoomInstance.audioHelper.resetAudioSession();
      await zoomInstance.audioHelper.setSDKAudioSessionEnv();
      await zoomInstance.audioHelper.setSpeaker(next);
    } catch (e) {
      console.log('[ZoomVideoService] iOS speaker route refresh', e);
    }
  }

  if (Platform.OS === 'ios') {
    return speakerRouteOn;
  }

  return getSpeakerOn();
}

export async function getRemoteUsers() {
  if (!zoomInstance?.session) return [];
  const remote = await zoomInstance.session.getRemoteUsers();
  return (remote || []).map(u => new ZoomVideoSdkUser(u));
}

export async function getMySelfUser() {
  if (!zoomInstance?.session) return null;
  const raw = await zoomInstance.session.getMySelf();
  return new ZoomVideoSdkUser(raw);
}

export function getSessionInfo() {
  return { ...sessionInfo, sessionToken: storedSessionToken };
}

export function cleanup() {
  console.log('[ZoomVideoService] cleanup');
  removeAllListeners();
  try {
    const result = zoomInstance?.cleanup?.();
    if (result && typeof result.catch === 'function') {
      result.catch(e => console.log('[ZoomVideoService] cleanup error', e));
    }
  } catch (e) {
    console.log('[ZoomVideoService] cleanup error', e);
  }
}
