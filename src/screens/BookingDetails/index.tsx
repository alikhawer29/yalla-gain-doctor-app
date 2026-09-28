import type { ReactNode } from "react"
import { useState } from "react"
import { View, RefreshControl } from "react-native"
import Button from "../../components/Button"
import Image from "../../components/Image"
import Loader from "../../components/Loader"
import Row from "../../components/Row"
import ScreenLoader from "../../components/ScreenLoader"
import StatusBadge from "../../components/StatusBadge"
import Text from "../../components/Text"
import Touchable from "../../components/Touchable"
import Wrapper from "../../components/Wrapper"
import {
    formatBookingLocalDate,
    formatLongDate,
    formatUtcToLocalDate,
    formatPhoneDisplay,
    formatUtcToLocalTimeRange12h,
    heightPixel,
    widthPixel,
} from "../../utils/helper"
import styles from "./styles"
import useBookingDetailsController from "./useBookingDetailsController"
import Input from "../../components/Input"
import colors from "../../utils/colors"
import { Rating } from "react-native-ratings"
import images from "../../assets/images"
import type { BookingVideoSession } from "../../types/videoSession"
import { getPrescriptionFileDisplay } from "../../utils/prescriptionFile"
import { downloadRemoteFile } from "../../utils/remoteFileDownload"

const BookingDetails = () => {
    const [isDownloadingPrescription, setIsDownloadingPrescription] = useState(false)

    const {
        values: {
            data,
            isUpdateLoading,
            isLoading,
            isRefreshing,
            editMode,
            prescription,
            prescriptionFile,
            existingPrescriptionFileUrl,
            videoSession,
        },
        functions: {
            onApprove,
            onReject,
            onReschedule,
            onEdit,
            onSavePrescription,
            onChangePrescription,
            onStartSession,
            onEndSession,
            onReport,
            onBookingHistory,
            onPickPrescriptionFile,
            onUserProgress,
            onRefreshBooking,
        }
    } = useBookingDetailsController()

    if (isLoading) {
        return <Loader mode="secondary" />
    }

    const serverPrescriptionFile = data?.prescription_file
        ? getPrescriptionFileDisplay({
            fileName: data?.prescription_file_name,
            fileType: data?.prescription_file_type,
            fileUrl: data?.prescription_file,
        })
        : null

    const existingPrescriptionFile = existingPrescriptionFileUrl
        ? getPrescriptionFileDisplay({
            fileName: data?.prescription_file_name,
            fileType: data?.prescription_file_type,
            fileUrl: existingPrescriptionFileUrl,
        })
        : null

    const newPrescriptionFile = prescriptionFile
        ? getPrescriptionFileDisplay({
            fileName: prescriptionFile.name,
            fileType: prescriptionFile.type,
        })
        : null

    const onDownloadPrescriptionFile = async (
        fileUrl?: string | null,
        fileName?: string,
    ) => {
        if (!fileUrl || isDownloadingPrescription) return
        setIsDownloadingPrescription(true)
        try {
            await downloadRemoteFile(fileUrl, fileName || 'prescription', {
                description: 'Prescription file',
            })
        } finally {
            setIsDownloadingPrescription(false)
        }
    }

    const renderVideoActions = (handler: {
        videoSession?: BookingVideoSession | null;
        onStartSession?: () => void;
        onEndSession?: () => void;
        isStartingSession?: boolean;
        startType?: "primary" | "outlined";
    }) => {
        const vs = handler?.videoSession;
        if (!vs) return null;

        const startLabel =
            vs.status === "started" ? "Rejoin Session" : "Start Session";
        const buttons: ReactNode[] = [];

        if (vs.can_start) {
            buttons.push(
                <Button
                    key="start"
                    text={startLabel}
                    onPress={handler?.onStartSession}
                    type={handler?.startType ?? "primary"}
                    loading={handler?.isStartingSession || false}
                />,
            );
        }
        if (vs.can_end) {
            buttons.push(
                <Button
                    key="end"
                    text="End Session"
                    onPress={handler?.onEndSession}
                    type="outlined"
                />,
            );
        }

        if (buttons.length === 0) return null;
        return <View style={{ gap: heightPixel(10) }}>{buttons}</View>;
    };

    const getButtonsByStatus = (status: "pending" | "upcoming" | "in-progress" | "past" | "rejected" | "approved", handler: {
        editMode?: boolean;
        onApprove?: () => void;
        onReject?: () => void;
        onReschedule?: () => void;
        onEdit?: () => void;
        onSavePrescription?: () => void | Promise<void>;
        onStartSession?: () => void;
        onEndSession?: () => void;
        onReport?: () => void;
        isStartingSession?: boolean;
        videoSession?: BookingVideoSession | null;
    }) => {
        switch (status) {
            case "pending":
                return (
                    <View style={{ gap: heightPixel(10) }}>
                        <Row justify="space-between">
                            <Button
                                text="Approve"
                                onPress={handler?.onApprove}
                                style={{ width: "48.5%" }}
                            />
                            <Button
                                text="Reject"
                                onPress={handler?.onReject}
                                type="outlined"
                                style={{ width: "48.5%" }}
                            />
                        </Row>
                        <Button
                            text="Reschedule"
                            onPress={handler?.onReschedule}
                            type="outlined"
                        />
                    </View>
                )

            case "upcoming":
            case "approved":
                return renderVideoActions({
                    ...handler,
                    startType: "primary",
                });

            case "in-progress":
                return renderVideoActions({
                    ...handler,
                    startType: "outlined",
                });

            case "past":
                return (
                    <View style={{ gap: heightPixel(10) }}>
                        {
                            handler?.editMode ? (
                                <>
                                    <Button
                                        text="Save"
                                        onPress={handler?.onSavePrescription}
                                    />
                                    <Button
                                        text="Cancel"
                                        type="outlined"
                                        onPress={handler?.onEdit}
                                    />
                                </>
                            ) : (
                                <>
                                    <Button
                                        text={prescription ? "Edit" : "Upload Prescription"}
                                        onPress={handler?.onEdit}
                                    />
                                    {Number(data?.is_reported) !== 1 ? (
                                        <Button
                                            text="Report Booking"
                                            onPress={handler?.onReport}
                                            type="outlined"
                                        />
                                    ) : null}
                                </>
                            )
                        }
                    </View>
                )
            default:
                return null
        }
    }

    return (
        <>
            {isUpdateLoading || isDownloadingPrescription ? <ScreenLoader /> : null}
            <Wrapper
                scrollable
                refreshControl={
                    <RefreshControl
                        refreshing={isRefreshing}
                        onRefresh={onRefreshBooking}
                        colors={[colors.primary]}
                        tintColor={colors.primary}
                    />
                }
            >
                <Image style={styles.image} source={{ uri: data?.service?.image }} resize="cover" />
                <View style={{ gap: heightPixel(15) }}>
                    <Row justify="space-between">
                        <View style={styles.half_width_box}>
                            <Text weight="semibold">Service Category:</Text>
                            <Text style={styles.value_text} color={colors.icon_gray}>{data?.service?.title}</Text>
                        </View>
                        <StatusBadge status={data?.status === 'completed' ? 'Past' : data?.status} />
                    </Row>
                    <Row>
                        <View style={styles.half_width_box}>
                            <Text weight="semibold">Appointment Time:</Text>
                            <Text style={styles.value_text} color={colors.icon_gray}>
                                {formatUtcToLocalTimeRange12h(
                                    data?.scheduled_start_at,
                                    data?.scheduled_end_at,
                                )}
                            </Text>
                        </View>
                        <View style={styles.half_width_box}>
                            <Text weight="semibold">Service Charges:</Text>
                            <Text style={styles.value_text} color={colors.icon_gray}>{data?.amount_paid} Yalla Coins</Text>
                        </View>
                    </Row>
                    <Row>
                        <View style={styles.half_width_box}>
                            <Button onPress={onBookingHistory}
                                type="outlined"
                                text="User Booking History"
                                font_size={11} style={{
                                    height: heightPixel(30),
                                    marginRight: widthPixel(30),
                                    paddingHorizontal: widthPixel(5)

                                }} />
                        </View>
                        <View style={styles.half_width_box}>
                            <Button
                                type="outlined"
                                text="User Progress"
                                font_size={11}
                                onPress={onUserProgress}
                                style={{ marginRight: widthPixel(30), paddingHorizontal: widthPixel(5) }}
                            />
                        </View>
                    </Row>
                    <Text size={20} weight="semibold" style={{ marginVertical: heightPixel(5), }}>Booking Details</Text>
                    <Row>
                        <View style={styles.half_width_box}>
                            <Text weight="semibold">Booking Id:</Text>
                            <Text style={styles.value_text} color={colors.icon_gray}>#{data?.id}</Text>
                        </View>
                        <View style={styles.half_width_box}>
                            <Text weight="semibold">Booking Date:</Text>
                            <Text style={styles.value_text} color={colors.icon_gray}>{formatLongDate(data?.created_at ?? '')}</Text>
                        </View>
                    </Row>
                    <Row>
                        <View style={styles.half_width_box}>
                            <Text weight="semibold">User Name:</Text>
                            <Text style={styles.value_text} color={colors.icon_gray}>{data?.first_name} {data?.last_name}</Text>
                        </View>
                        <View style={styles.half_width_box}>
                            <Text weight="semibold">Contact No:</Text>
                            <Text style={styles.value_text} color={colors.icon_gray}>
                                {formatPhoneDisplay(data?.dialing_code, data?.phone, data?.country_code)}
                            </Text>
                        </View>
                    </Row>
                    <Row>

                        <View style={styles.half_width_box}>
                            <Text weight="semibold">Appointment Date:</Text>
                            <Text style={styles.value_text} color={colors.icon_gray}>{formatBookingLocalDate(data)}</Text>
                        </View>
                    </Row>
                    <Row>
                        <View style={styles.full_width_box}>
                            <Text weight="semibold">Email Address:</Text>
                            <Text style={styles.value_text} lines={1} color={colors.icon_gray}>{data?.email}</Text>
                        </View>

                    </Row>
                    <Row>
                        {
                            data?.rejection_reason &&
                            <View style={styles.full_width_box}>
                                <Text weight="semibold">Rejected Reason:</Text>
                                <Text style={styles.value_text} color={colors.icon_gray}>{data?.rejection_reason}</Text>
                            </View>
                        }
                    </Row>
                    {
                        data?.is_rated && (
                            <>
                                <Row>
                                    <View style={styles.full_width_box}>
                                        <Text weight="semibold">Rating:</Text>
                                        <Rating
                                            tintColor='#000'
                                            ratingCount={5}
                                            readonly
                                            startingValue={data?.rating?.rating}
                                            imageSize={12}
                                            style={{ justifyContent: "flex-start", alignItems: "flex-start" }}
                                        />
                                    </View>
                                </Row>
                                <Row>
                                    <View style={styles.full_width_box}>
                                        <Text weight="semibold">Reviews:</Text>
                                        <Text style={styles.value_text} color={colors.icon_gray}>{data?.rating?.review}</Text>
                                    </View>
                                </Row>
                            </>
                        )
                    }
                    {(data?.scheduled_start_at && data?.is_rescheduled) ||
                    (data?.rescheduled_appointment_date &&
                        data?.rescheduled_appointment_start_time &&
                        data?.rescheduled_appointment_end_time) ? (
                        <>
                            <Text size={20} weight="semibold" style={{ marginVertical: heightPixel(5) }}>
                                Rescheduled Time And Date
                            </Text>
                            <Row>
                                <View style={styles.half_width_box}>
                                    <Text weight="semibold">Session Date:</Text>
                                    <Text style={styles.value_text} color={colors.icon_gray}>
                                        {formatUtcToLocalDate(data?.scheduled_start_at) ||
                                            formatLongDate(data?.rescheduled_appointment_date ?? '')}
                                    </Text>
                                </View>
                                <View style={styles.half_width_box}>
                                    <Text weight="semibold">Session Time:</Text>
                                    <Text style={styles.value_text} color={colors.icon_gray}>
                                        {formatUtcToLocalTimeRange12h(
                                            data?.scheduled_start_at,
                                            data?.scheduled_end_at,
                                        )}
                                    </Text>
                                </View>
                            </Row>
                        </>
                    ) : null}
                    {(data?.prescription_text || data?.prescription_file) && !editMode && (
                        <>
                            <Text
                                size={20}
                                weight="semibold"
                                style={{ marginTop: heightPixel(10) }}
                            >
                                Prescription
                            </Text>
                            {!!data?.prescription_text && (
                                <Row>
                                    <View style={styles.full_width_box}>
                                        <Text
                                            style={styles.value_text}
                                            color={colors.icon_gray}
                                        >
                                            {data?.prescription_text}
                                        </Text>
                                    </View>
                                </Row>
                            )}

                            {data?.prescription_file && serverPrescriptionFile && (
                                <Touchable
                                    onPress={() =>
                                        onDownloadPrescriptionFile(
                                            data.prescription_file,
                                            serverPrescriptionFile.fileName,
                                        )
                                    }
                                >
                                    <Row style={{ marginTop: heightPixel(10) }} align="center" gap={10}>
                                        <Image
                                            source={serverPrescriptionFile.icon}
                                            style={{ width: widthPixel(50), height: widthPixel(50) }}
                                            resize="contain"
                                        />
                                        <View style={{ flex: 1 }}>
                                            <Text
                                                style={styles.value_text}
                                                color={colors.icon_gray}
                                                lines={1}
                                            >
                                                {serverPrescriptionFile.fileName}
                                            </Text>
                                            <Text size={11} color={colors.primary}>
                                                Tap to download
                                            </Text>
                                        </View>
                                    </Row>
                                </Touchable>
                            )}
                        </>
                    )}
                    {
                        editMode &&
                        <>
                            <Input
                                label="Prescription"
                                type="textarea"
                                placeholder="Write Prescription ..."
                                onChangeText={onChangePrescription}
                                value={prescription}
                            />
                            <View style={{ marginTop: heightPixel(10) }}>
                                {existingPrescriptionFile && !prescriptionFile ? (
                                    <Touchable
                                        onPress={() =>
                                            onDownloadPrescriptionFile(
                                                existingPrescriptionFileUrl,
                                                existingPrescriptionFile.fileName,
                                            )
                                        }
                                    >
                                        <Row
                                            style={{ marginBottom: heightPixel(8) }}
                                            align="center"
                                            gap={8}
                                        >
                                            <Image
                                                source={existingPrescriptionFile.icon}
                                                style={{
                                                    width: widthPixel(28),
                                                    height: widthPixel(28),
                                                }}
                                                resize="contain"
                                            />
                                            <View style={{ flex: 1 }}>
                                                <Text color={colors.icon_gray} size={12} lines={1}>
                                                    Current file: {existingPrescriptionFile.fileName}
                                                </Text>
                                                <Text size={11} color={colors.primary}>
                                                    Tap to download
                                                </Text>
                                            </View>
                                        </Row>
                                    </Touchable>
                                ) : null}
                                <Button
                                    text={
                                        prescriptionFile || existingPrescriptionFileUrl
                                            ? 'Change File'
                                            : 'Upload File'
                                    }
                                    onPress={onPickPrescriptionFile}
                                    type="outlined"
                                />
                                {!!prescriptionFile && newPrescriptionFile && (
                                    <Row
                                        style={{ marginTop: heightPixel(5) }}
                                        align="center"
                                        gap={8}
                                    >
                                        <Image
                                            source={newPrescriptionFile.icon}
                                            style={{
                                                width: widthPixel(28),
                                                height: widthPixel(28),
                                            }}
                                            resize="contain"
                                        />
                                        <Text color={colors.icon_gray} size={12} lines={1}>
                                            New file: {newPrescriptionFile.fileName}
                                        </Text>
                                    </Row>
                                )}
                            </View>
                        </>
                    }
                </View>
                <View style={{ marginVertical: heightPixel(30) }}>
                    {getButtonsByStatus(data?.status, {
                        editMode,
                        onApprove,
                        onReject,
                        onReschedule,
                        onEdit,
                        onSavePrescription,
                        onStartSession,
                        onEndSession,
                        onReport,
                        isStartingSession: isUpdateLoading,
                        videoSession,
                    })}
                </View>
            </Wrapper>
        </>
    )
}

export default BookingDetails