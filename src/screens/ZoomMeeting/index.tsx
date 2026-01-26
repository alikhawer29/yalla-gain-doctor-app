import { useNavigation, useRoute } from "@react-navigation/native"
import { useEffect, useState, useRef } from "react"
import { View, StyleSheet, StatusBar, AppState, AppStateStatus, BackHandler, Platform } from "react-native"
import { ZoomSDKProvider, useZoom } from "@zoom/meetingsdk-react-native"
import Loader from "../../components/Loader"
import Text from "../../components/Text"
import Button from "../../components/Button"
import colors from "../../utils/colors"
import { heightPixel } from "../../utils/helper"
import { goBack } from "../../utils/navigation"
import usePermissions from "../../hooks/usePermissions"
import { RESULTS } from "react-native-permissions"

interface ZoomMeetingParams {
    sdk_key: string
    signature: string
    meeting_number: string
    password: string
    join_url?: string
    zak_token?: string // ZAK token required for host to start meeting
}

const ZoomMeetingContent = () => {
    const navigation = useNavigation()
    const { params } = useRoute()
    const zoom = useZoom()
    const { ensurePermissions, PERMISSIONS, openAppSettings } = usePermissions()
    const [isInitializing, setIsInitializing] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [inMeeting, setInMeeting] = useState(false)
    const appStateRef = useRef(AppState.currentState)
    const hasJoinedRef = useRef(false)
    const isLeavingRef = useRef(false)
    const joinTimeRef = useRef<number>(0)

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
                console.log("Zoom Meeting - Back button pressed during meeting, blocking")
                return true // Block back button during meeting
            }
            return false
        })

        // Listen for app state changes
        const subscription = AppState.addEventListener('change', handleAppStateChange)

        return () => {
            backHandler.remove()
            subscription.remove()
            cleanup()
        }
    }, [])

    const handleAppStateChange = (nextAppState: AppStateStatus) => {
        // Don't process app state changes immediately after joining - give native activity time to launch
        // Increase delay to 10 seconds to allow Zoom UI to fully load and user to interact
        if (hasJoinedRef.current && !isLeavingRef.current && joinTimeRef.current > 0) {
            const timeSinceJoin = Date.now() - joinTimeRef.current
            if (timeSinceJoin < 10000) {
                // Too soon after join, ignore app state changes to prevent premature navigation
                console.log("Zoom Meeting - Ignoring app state change too soon after join (", timeSinceJoin, "ms)")
                appStateRef.current = nextAppState
                return
            }
        }

        console.log("========================================")
        console.log("Zoom Meeting - App state changed:", appStateRef.current, "->", nextAppState)
        console.log("Zoom Meeting - Has joined:", hasJoinedRef.current)
        console.log("Zoom Meeting - Is leaving:", isLeavingRef.current)
        console.log("Zoom Meeting - Time since join:", joinTimeRef.current > 0 ? Date.now() - joinTimeRef.current : 0, "ms")
        console.log("========================================")

        // When app goes to background (Zoom takes over)
        if (appStateRef.current === 'active' && nextAppState.match(/inactive|background/)) {
            console.log("Zoom Meeting - App went to background, Zoom native UI is now active")
            // Don't do anything here - just let the native activity take over
        }

        // When app comes back to foreground (user left Zoom)
        // Only navigate back if:
        // 1. We've been in the meeting for at least 10 seconds (to avoid false positives during join)
        // 2. The app was in background/inactive and is now active
        // 3. We haven't already started leaving
        if (
            appStateRef.current.match(/inactive|background/) &&
            nextAppState === 'active' &&
            hasJoinedRef.current &&
            !isLeavingRef.current &&
            joinTimeRef.current > 0 &&
            Date.now() - joinTimeRef.current > 10000
        ) {
            console.log("Zoom Meeting - App returned to foreground after meeting - user left the meeting")
            // User left the Zoom meeting, navigate back
            // Add a delay to ensure React Native is ready
            setTimeout(() => {
                handleMeetingEnd()
            }, 1000)
        }

        appStateRef.current = nextAppState
    }

    const handleMeetingEnd = () => {
        if (isLeavingRef.current) {
            console.log("Zoom Meeting - Already leaving, ignoring duplicate call")
            return
        }

        console.log("Zoom Meeting - Handling meeting end")
        isLeavingRef.current = true

        cleanup()

        setTimeout(() => {
            navigateBack()
        }, 500)
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

            console.log("Zoom Meeting - Waiting for SDK initialization...")

            while (!isInitialized && retries < maxRetries) {
                try {
                    isInitialized = await zoom.isInitialized()
                    console.log(`Zoom Meeting - Initialization check ${retries + 1}/${maxRetries}: ${isInitialized ? 'Initialized' : 'Not initialized yet'}`)
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

            console.log("Zoom Meeting - SDK initialized successfully, requesting permissions...")

            // Request camera and microphone permissions before starting meeting
            if (Platform.OS === 'android') {
                const permissionsGranted = await ensurePermissions([
                    PERMISSIONS.ANDROID.CAMERA,
                    PERMISSIONS.ANDROID.RECORD_AUDIO,
                ])

                if (!permissionsGranted) {
                    setError("Camera and microphone permissions are required for Zoom meetings. Please grant permissions in device settings.")
                    setIsInitializing(false)
                    return
                }
            }

            console.log("Zoom Meeting - Permissions granted, starting meeting as host...")

            // Wait to ensure SDK is fully ready
            await new Promise<void>(resolve => setTimeout(() => resolve(), 1000))

            const meetingNumber = String(meetingParams.meeting_number || "")

            if (!meetingNumber) {
                throw new Error("Meeting number is required")
            }

            // ZAK token is required for host to start meeting
            // If zak_token is provided, use it; otherwise fall back to signature
            const zoomAccessToken = meetingParams.zak_token || meetingParams.signature

            console.log("Zoom Meeting - Token check:")
            console.log("  - Has zak_token:", !!meetingParams.zak_token)
            console.log("  - Has signature:", !!meetingParams.signature)
            console.log("  - zak_token length:", meetingParams.zak_token?.length || 0)
            console.log("  - Using token type:", meetingParams.zak_token ? "ZAK" : "signature")

            if (!zoomAccessToken) {
                throw new Error("Zoom access token (ZAK token or signature) is required to start meeting")
            }

            if (!meetingParams.zak_token) {
                console.warn("Zoom Meeting - WARNING: No ZAK token provided! Meeting may ask for passcode.")
            }

            console.log("Zoom Meeting - Calling startMeeting as host...")
            console.log("Zoom Meeting - Meeting number:", meetingNumber)
            console.log("Zoom Meeting - Access token length:", zoomAccessToken.length)

            // Use startMeeting instead of joinMeeting for host
            // The doctor creates the meeting, so they need to START it, not just join
            // ZAK token from zoom_start_url is required for host to start meeting
            const result = await Promise.race([
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

            console.log("Zoom Meeting - startMeeting result:", result)

            if (result === 0) {
                console.log("Zoom Meeting - Successfully started meeting as host")
                // Mark as joined immediately to prevent any rendering
                hasJoinedRef.current = true
                setInMeeting(true)
                setIsInitializing(false)

                // Store join time to prevent app state handler from running too soon
                joinTimeRef.current = Date.now()
            } else {
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
            console.log("Zoom Meeting - Cleaning up")
            // The SDK will handle cleanup when the meeting ends
            // We don't need to explicitly leave since user already left via Zoom UI
        } catch (err) {
            console.error("Zoom cleanup error:", err)
        }
    }

    const navigateBack = () => {
        setTimeout(() => {
            if (navigation.canGoBack()) {
                console.log("Zoom Meeting - Navigating back")
                navigation.goBack()
            } else {
                console.log("Zoom Meeting - Navigating to Home")
                navigation.navigate('Home' as never)
            }
        }, 100)
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

    // Show error if something went wrong
    if (error) {
        const isPermissionError = error.toLowerCase().includes('permission')

        return (
            <View style={styles.container}>
                <StatusBar barStyle="light-content" backgroundColor={colors.black} />
                <Text size={18} weight="semibold" color={colors.danger} style={styles.errorText}>
                    {error}
                </Text>
                {isPermissionError && Platform.OS === 'android' && (
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

    // Once joined, keep a minimal view mounted
    // The Zoom native UI will take over the screen
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

    console.log("Zoom Meeting - Initializing with:", {
        hasSignature: !!meetingParams.signature,
        hasZakToken: !!meetingParams.zak_token,
        hasMeetingNumber: !!meetingParams.meeting_number,
        hasPassword: !!meetingParams.password,
        signatureLength: meetingParams.signature?.length || 0,
        zakTokenLength: meetingParams.zak_token?.length || 0,
        meetingNumber: meetingParams.meeting_number,
    })

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