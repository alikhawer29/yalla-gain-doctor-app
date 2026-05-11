import { useNavigation, useRoute } from "@react-navigation/native"
import { useEffect, useState, useRef } from "react"
import { View, StyleSheet, StatusBar, AppState, AppStateStatus, BackHandler, Platform, NativeEventEmitter, NativeModules, EmitterSubscription } from "react-native"
import { ZoomSDKProvider, useZoom } from "@zoom/meetingsdk-react-native"
import Loader from "../../components/Loader"
import Text from "../../components/Text"
import Button from "../../components/Button"
import colors from "../../utils/colors"
import { heightPixel } from "../../utils/helper"
import { goBack } from "../../utils/navigation"
import usePermissions from "../../hooks/usePermissions"
import { RESULTS } from "react-native-permissions"
import { useEndZoomMeetingMutation } from "../../redux/Apis/User"
import { ROUTES } from "../../utils/routes"

// Mirrors iOS `MobileRTCMeetingState` enum exposed by the patched RNZoomSDK module.
// See node_modules/@zoom/meetingsdk-react-native/ios/ZoomHeaders/MobileRTCConstants.h
const MEETING_STATE = {
    IDLE: 0,
    CONNECTING: 1,
    WAITING_FOR_HOST: 2,
    IN_MEETING: 3,
    DISCONNECTING: 4,
    RECONNECTING: 5,
    FAILED: 6,
    ENDED: 7,
} as const

interface ZoomMeetingParams {
    sdk_key: string
    signature: string
    meeting_number: string
    password: string
    join_url?: string
    zak_token?: string // ZAK token required for host to start meeting
    appointment_id?: string | number // Appointment ID to call end API
}

const ZoomMeetingContent = () => {
    const navigation = useNavigation()
    const { params } = useRoute()
    const zoom = useZoom()
    const { ensurePermissions, PERMISSIONS, openAppSettings } = usePermissions()
    const [endZoomMeeting] = useEndZoomMeetingMutation()
    const [isInitializing, setIsInitializing] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [inMeeting, setInMeeting] = useState(false)
    const [isEndingMeeting, setIsEndingMeeting] = useState(false)
    const appStateRef = useRef(AppState.currentState)
    const hasJoinedRef = useRef(false)
    const isLeavingRef = useRef(false)
    const joinTimeRef = useRef<number>(0)
    const hasEndedMeetingRef = useRef(false) // Track if we've already called the end API

    const meetingParams = params as ZoomMeetingParams

    useEffect(() => {
        const errorHandler = (error: Error) => {
            console.error("Zoom Meeting - Unhandled error:", error)
            setError(`An error occurred: ${error.message}`)
            setIsInitializing(false)
        }

        initializeAndJoin().catch(errorHandler)

        // Handle Android back button
        const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
            if (hasJoinedRef.current && !isLeavingRef.current) {
                return true // Block back button during meeting
            }
            return false
        })

        // Listen for app state changes (Android fallback; also iOS in some flows)
        const subscription = AppState.addEventListener('change', handleAppStateChange)

        // Subscribe to RNZoomSDK native events for meeting state changes.
        // Android: addListener/removeListeners stubs are required before creating the emitter.
        // iOS: RNZoomSDK.m is patched to declare these events in supportedEvents and emit
        //      them from the MobileRTCMeetingServiceDelegate callback, so no stubs needed.
        let stateSub: EmitterSubscription | null = null
        let errorSub: EmitterSubscription | null = null
        const zoomNative = (NativeModules as any).RNZoomSDK
        if (zoomNative) {
            try {
                if (Platform.OS === "android") {
                    if (!zoomNative.addListener) {
                        zoomNative.addListener = () => {}
                    }
                    if (!zoomNative.removeListeners) {
                        zoomNative.removeListeners = () => {}
                    }
                }
                const emitter = new NativeEventEmitter(zoomNative)
                stateSub = emitter.addListener('onMeetingStateChange', (payload: { state: number }) => {
                    const state = payload?.state
                    if (
                        state === MEETING_STATE.ENDED ||
                        state === MEETING_STATE.DISCONNECTING ||
                        state === MEETING_STATE.FAILED ||
                        state === MEETING_STATE.IDLE
                    ) {
                        if (hasJoinedRef.current && !isLeavingRef.current) {
                            handleMeetingEnd()
                        }
                    }
                })
                errorSub = emitter.addListener('onMeetingError', (_payload: { error: number; message?: string }) => {})
            } catch (e) {
                console.warn("Zoom Meeting - Failed to subscribe to RNZoomSDK events:", e)
            }
        }

        return () => {
            backHandler.remove()
            subscription.remove()
            stateSub?.remove()
            errorSub?.remove()
            cleanup()
        }
    }, [])

    const handleAppStateChange = (nextAppState: AppStateStatus) => {
        // Android: Zoom launches a separate Activity. Pausing the React Activity fires
        // background → active transitions that are NOT "meeting ended", which incorrectly
        // called handleMeetingEnd() and popped the user home. Native onMeetingStateChange
        // is patched for Android (see RNZoomSDKModule); rely on that instead.
        if (Platform.OS === "android") {
            appStateRef.current = nextAppState
            return
        }

        // Give the native activity a short grace window after joining so the initial
        // "active -> inactive -> active" burst from permission dialogs doesn't trigger
        // the end-meeting flow.
        if (hasJoinedRef.current && !isLeavingRef.current && joinTimeRef.current > 0) {
            const timeSinceJoin = Date.now() - joinTimeRef.current
            if (timeSinceJoin < 3000) {
                appStateRef.current = nextAppState
                return
            }
        }

        // When app comes back to foreground, assume the Zoom meeting is over
        // (host pressed End, participant left, or the native UI was dismissed).
        if (
            appStateRef.current.match(/inactive|background/) &&
            nextAppState === 'active' &&
            hasJoinedRef.current &&
            !isLeavingRef.current
        ) {
            handleMeetingEnd()
        }

        appStateRef.current = nextAppState
    }

    const handleMeetingEnd = async () => {
        if (isLeavingRef.current) {
            return
        }

        isLeavingRef.current = true
        setIsEndingMeeting(true)

        // Call the end meeting API if appointment ID is available and we haven't called it yet
        if (meetingParams?.appointment_id && !hasEndedMeetingRef.current) {
            try {
                hasEndedMeetingRef.current = true
                await endZoomMeeting(meetingParams.appointment_id).unwrap()
            } catch (err: any) {
                console.error("Zoom Meeting - Error calling end meeting API:", err)
                // Don't block navigation if API call fails
            }
        } else {
        }

        cleanup()
        navigateBack()
    }

    const initializeAndJoin = async () => {
        try {
            // Check for required credentials - need meeting_number and either zak_token (for host) or signature
            if (!meetingParams?.meeting_number) {
                setError("Missing meeting number")
                setIsInitializing(false)
                return
            }

            if (!meetingParams?.zak_token && !meetingParams?.signature) {
                setError("Missing Zoom access token (ZAK token or signature)")
                setIsInitializing(false)
                return
            }

            // Wait for SDK to initialize
            let isInitialized = false
            let retries = 0
            const maxRetries = 15

            while (!isInitialized && retries < maxRetries) {
                try {
                    isInitialized = await zoom.isInitialized()
                    if (!isInitialized) {
                        await new Promise<void>(resolve => setTimeout(() => resolve(), 500))
                        retries++
                    }
                } catch (err) {
                    console.error("Zoom Meeting - Error checking initialization:", err)
                    await new Promise<void>(resolve => setTimeout(() => resolve(), 500))
                    retries++
                }
            }

            if (!isInitialized) {
                console.error("Zoom Meeting - SDK initialization timeout")
                setError("Zoom SDK initialization timeout. Please try again.")
                setIsInitializing(false)
                return
            }

            // Request camera and microphone permissions before starting meeting
            const permissionsGranted = await ensurePermissions(
                Platform.OS === 'android'
                    ? [
                        PERMISSIONS.ANDROID.CAMERA,
                        PERMISSIONS.ANDROID.RECORD_AUDIO,
                    ]
                    : [
                        PERMISSIONS.IOS.CAMERA,
                        PERMISSIONS.IOS.MICROPHONE,
                    ]
            )

            if (!permissionsGranted) {
                setError("Camera and microphone permissions are required for Zoom meetings. Please grant permissions in device settings.")
                setIsInitializing(false)
                return
            }

            // Wait to ensure SDK is fully ready
            await new Promise<void>(resolve => setTimeout(() => resolve(), 1000))

            const meetingNumber = String(meetingParams.meeting_number || "")

            if (!meetingNumber) {
                throw new Error("Meeting number is required")
            }

            // ZAK token is required for host to start meeting
            // If zak_token is provided, use it; otherwise fall back to signature
            const zoomAccessToken = meetingParams.zak_token

            if (!zoomAccessToken) {
                throw new Error("Zoom access token (ZAK token or signature) is required to start meeting")
            }

            if (!meetingParams.zak_token) {
                console.warn("Zoom Meeting - WARNING: No ZAK token provided! Meeting may ask for passcode.")
            }

            // Use startMeeting instead of joinMeeting for host
            // The doctor creates the meeting, so they need to START it, not just join
            // ZAK token from zoom_start_url is required for host to start meeting
            let result: number | undefined
            let startMeetingError: Error | null = null
            try {
                result = await Promise.race([
                    zoom.startMeeting({
                        userName: "Doctor",
                        meetingNumber: meetingNumber,
                        zoomAccessToken: zoomAccessToken, // ZAK token (preferred) or signature/JWT token
                        password: meetingParams.password,
                        noVideo: false,
                        noAudio: false,
                    } as any), // Type assertion needed as TypeScript types don't include password but native SDK requires it
                    new Promise<number>((_, reject) =>
                        setTimeout(() => reject(new Error("Start meeting timeout")), 30000)
                    )
                ])
            } catch (err: any) {
                console.error("Zoom Meeting - startMeeting threw an error:", err)
                startMeetingError = err instanceof Error ? err : new Error(String(err))
                result = undefined
            }

            // Check for success: result === 0 means success in Zoom SDK
            // If result is undefined but no error was thrown, it might be iOS-specific behavior
            if (startMeetingError) {
                // An error was thrown, definitely failed
                console.error("Zoom Meeting - Join failed with error:", startMeetingError.message)
                setError(`Failed to join meeting: ${startMeetingError.message}`)
                setIsInitializing(false)
            } else if (result === 0) {
                // Explicit success (result === 0)
                hasJoinedRef.current = true
                setInMeeting(true)
                setIsInitializing(false)
                joinTimeRef.current = Date.now()
            } else if (result === undefined) {
                // Undefined result - could be iOS-specific behavior or an error
                // On iOS, undefined might mean the SDK didn't return a proper response
                // This could happen due to missing permissions, invalid credentials, or SDK issues
                console.warn("Zoom Meeting - Result is undefined. This might indicate an issue.")
                console.warn("Zoom Meeting - Checking if this is iOS-specific behavior...")
                
                // Wait a moment to see if meeting actually started (iOS sometimes doesn't return immediately)
                await new Promise<void>(resolve => setTimeout(() => resolve(), 2000))
                
                // If we have all required params and permissions were granted, 
                // undefined might be acceptable on iOS (SDK quirk)
                // But to be safe, we'll show a helpful error message
                const hasAllParams = meetingNumber && zoomAccessToken && meetingParams.password
                if (hasAllParams && permissionsGranted) {
                    hasJoinedRef.current = true
                    setInMeeting(true)
                    setIsInitializing(false)
                    joinTimeRef.current = Date.now()
                } else {
                    // Missing something, definitely an error
                    console.error("Zoom Meeting - Undefined result with missing params or permissions")
                    setError("Failed to join meeting. Please ensure all meeting credentials are valid and permissions are granted.")
                    setIsInitializing(false)
                }
            } else {
                // Non-zero result means error code
                console.error("Zoom Meeting - Join failed with error code:", result)
                setError(`Failed to join meeting. Error code: ${result}`)
                setIsInitializing(false)
            }
        } catch (err: any) {
            console.error("Zoom meeting error:", err)
            setError(err?.message || "Failed to join meeting")
            setIsInitializing(false)
        }
    }

    const cleanup = () => {
        try {
            // The SDK will handle cleanup when the meeting ends
            // We don't need to explicitly leave since user already left via Zoom UI
        } catch (err) {
            console.error("Zoom cleanup error:", err)
        }
    }

    const navigateBack = () => {
        const appointmentId = meetingParams?.appointment_id

        // Always go to Booking Details when we have an appointment ID so the
        // user lands on the correct screen after the meeting ends (on iOS
        // canGoBack() is true but goBack() would show a black/wrong screen).
        if (appointmentId != null) {
            ;(navigation as any).navigate(ROUTES.BOOKING_DETAILS, { id: appointmentId })
            return
        }

        if (navigation.canGoBack()) {
            navigation.goBack()
            return
        }

        navigation.navigate('Home' as never)
    }

    const onGoBack = () => {
        isLeavingRef.current = true
        cleanup()
        navigateBack()
    }

    // Show loading while initializing
    if (isInitializing) {
        return (
            <View style={styles.container}>
                <StatusBar barStyle="light-content" backgroundColor={colors.black} />
                <Loader mode="secondary" />
                <Text style={styles.loadingText} color={colors.white}>
                    Joining meeting...
                </Text>
            </View>
        )
    }

    // Show a clean loader while we run the end-meeting API and navigate back
    if (isEndingMeeting) {
        return (
            <View style={styles.container}>
                <StatusBar barStyle="light-content" backgroundColor={colors.black} />
                <Loader mode="secondary" />
                <Text style={styles.loadingText} color={colors.white}>
                    Ending meeting...
                </Text>
            </View>
        )
    }

    // Show error if something went wrong
    if (error) {
        const isPermissionError = error.toLowerCase().includes('permission')

        return (
            <View style={styles.container}>
                <StatusBar barStyle="light-content" backgroundColor={colors.black} />
                <Text size={18} weight="semibold" color={colors.danger} style={styles.errorText}>
                    {error}
                </Text>
                {isPermissionError && (
                    <Button
                        text="Open Settings"
                        onPress={async () => {
                            await openAppSettings()
                        }}
                        style={[styles.button, { marginBottom: 10 }]}
                    />
                )}
                <Button
                    text="Go Back"
                    onPress={onGoBack}
                    style={styles.button}
                />
            </View>
        )
    }

    // Once joined, keep a minimal view mounted behind the Zoom native UI.
    // The Zoom SDK will overlay its own UI on top; when the host ends the meeting
    // the patched RNZoomSDK module fires an `onMeetingStateChange` native event
    // which triggers `handleMeetingEnd` and navigates us back automatically.
    if (inMeeting) {
        return (
            <View style={styles.meetingContainer}>
                <StatusBar barStyle="light-content" backgroundColor={colors.black} />
            </View>
        )
    }

    return null
}

const ZoomMeeting = () => {
    const { params } = useRoute()
    const meetingParams = params as ZoomMeetingParams

    // Check for required credentials - need either zak_token (for host) or signature
    if (!meetingParams?.zak_token && !meetingParams?.signature) {
        return (
            <View style={styles.container}>
                <StatusBar barStyle="light-content" backgroundColor={colors.black} />
                <Text size={18} weight="semibold" color={colors.danger} style={styles.errorText}>
                    Missing meeting credentials (ZAK token or signature required)
                </Text>
                <Button
                    text="Go Back"
                    onPress={() => {
                        goBack()
                    }}
                    style={styles.button}
                />
            </View>
        )
    }

    return (
        <ZoomSDKProvider
            config={{
                jwtToken: meetingParams.signature || "", // SDK initialization still needs signature/JWT
                domain: "zoom.us",
                enableLog: true,
                logSize: 5,
            }}
        >
            <ZoomMeetingContent />
        </ZoomSDKProvider>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.black,
        justifyContent: "center",
        alignItems: "center",
        padding: heightPixel(20),
    },
    loadingText: {
        marginTop: heightPixel(20),
    },
    errorText: {
        textAlign: "center",
        marginBottom: heightPixel(20),
    },
    button: {
        marginTop: heightPixel(20),
    },
    meetingContainer: {
        flex: 1,
        backgroundColor: colors.black,
    },
})

export default ZoomMeeting