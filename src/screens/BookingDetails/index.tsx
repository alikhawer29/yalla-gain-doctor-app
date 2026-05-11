import { View, RefreshControl } from "react-native"
import Button from "../../components/Button"
import Image from "../../components/Image"
import Loader from "../../components/Loader"
import Row from "../../components/Row"
import ScreenLoader from "../../components/ScreenLoader"
import StatusBadge from "../../components/StatusBadge"
import Text from "../../components/Text"
import Wrapper from "../../components/Wrapper"
import {
    formatLongDate,
    formatTimeRange12h,
    heightPixel,
    widthPixel,
} from "../../utils/helper"
import styles from "./styles"
import useBookingDetailsController from "./useBookingDetailsController"
import Input from "../../components/Input"
import colors from "../../utils/colors"
import { Rating } from "react-native-ratings"
import images from "../../assets/images"

const BookingDetails = () => {

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
        },
        functions: {
            onApprove,
            onReject,
            onReschedule,
            onEdit,
            onSavePrescription,
            onChangePrescription,
            onStartSession,
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

    const getButtonsByStatus = (status: "pending" | "upcoming" | "in-progress" | "past" | "rejected", handler: {
        editMode?: boolean;
        onApprove?: () => void;
        onReject?: () => void;
        onReschedule?: () => void;
        onEdit?: () => void;
        onSavePrescription?: () => void | Promise<void>;
        onStartSession?: () => void;
        onReport?: () => void;
        isStartingSession?: boolean;
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
                return (
                    <Button
                        text="Start Session"
                        onPress={handler?.onStartSession}
                        loading={handler?.isStartingSession || false}
                    />
                )

            case "in-progress":
                return (
                    <View style={{ gap: heightPixel(10) }}>
                        {
                            <Button
                                text="Start Session"
                                onPress={handler?.onStartSession}
                                type="outlined"
                                loading={handler?.isStartingSession || false}
                            />
                        }
                    </View >
                )

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
                                    <Button
                                        text="Report Booking"
                                        onPress={handler?.onReport}
                                        type="outlined"
                                    />
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
            {isUpdateLoading && <ScreenLoader />}
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
                                {formatTimeRange12h(
                                    data?.appointment_start_time,
                                    data?.appointment_end_time,
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
                            <Text style={styles.value_text} color={colors.icon_gray}>({data?.dialing_code}) {data?.phone}</Text>
                        </View>
                    </Row>
                    <Row>

                        <View style={styles.half_width_box}>
                            <Text weight="semibold">Appointment Date:</Text>
                            <Text style={styles.value_text} color={colors.icon_gray}>{formatLongDate(data?.appointment_date ?? '')}</Text>
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
                    {data?.rescheduled_appointment_date && data?.rescheduled_appointment_start_time && data?.rescheduled_appointment_end_time && (
                        <>
                            <Text size={20} weight="semibold" style={{ marginVertical: heightPixel(5) }}>
                                Rescheduled Time And Date
                            </Text>
                            <Row>
                                <View style={styles.half_width_box}>
                                    <Text weight="semibold">Session Date:</Text>
                                    <Text style={styles.value_text} color={colors.icon_gray}>{formatLongDate(data?.rescheduled_appointment_date ?? '')}</Text>
                                </View>
                                <View style={styles.half_width_box}>
                                    <Text weight="semibold">Session Time:</Text>
                                    <Text style={styles.value_text} color={colors.icon_gray}>
                                        {formatTimeRange12h(
                                            data?.rescheduled_appointment_start_time,
                                            data?.rescheduled_appointment_end_time,
                                        )}
                                    </Text>
                                </View>
                            </Row>
                        </>
                    )}
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

                            {data?.prescription_file && (
                                <Row style={{ marginTop: heightPixel(10) }} align="center" gap={10}>
                                    <Image
                                        source={images.file}
                                        style={{ width: widthPixel(50), height: widthPixel(50) }}
                                        resize="contain"
                                    />
                                    <Text
                                        style={styles.value_text}
                                        color={colors.icon_gray}
                                        lines={1}
                                    >
                                        {String(data?.prescription_file).split("/").pop()}
                                    </Text>
                                </Row>
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
                                {existingPrescriptionFileUrl && !prescriptionFile ? (
                                    <Text
                                        style={{ marginBottom: heightPixel(8) }}
                                        color={colors.icon_gray}
                                        size={12}
                                    >
                                        Current file:{' '}
                                        {String(existingPrescriptionFileUrl).split('/').pop()}
                                    </Text>
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
                                {!!prescriptionFile && (
                                    <Text
                                        style={{ marginTop: heightPixel(5) }}
                                        color={colors.icon_gray}
                                        size={12}
                                    >
                                        New file: {prescriptionFile.name}
                                    </Text>
                                )}
                            </View>
                        </>
                    }
                </View>
                <View style={{ marginVertical: heightPixel(30) }}>
                    {getButtonsByStatus(data?.status, { editMode, onApprove, onReject, onReschedule, onEdit, onSavePrescription, onStartSession, onReport, isStartingSession: isUpdateLoading })}
                </View>
            </Wrapper>
        </>
    )
}

export default BookingDetails