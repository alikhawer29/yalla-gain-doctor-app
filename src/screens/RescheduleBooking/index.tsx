import { View } from "react-native"
import Button from "../../components/Button"
import Input from "../../components/Input"
import Row from "../../components/Row"
import Wrapper from "../../components/Wrapper"
import { heightPixel } from "../../utils/helper"
import useRescheduleBookingController from "./useRescheduleBookingController"
import KeyboardAvoidingWrapper from "../../components/KeyboardAvoidingWrapper"
import { Formik } from "formik"

const RescheduleBooking = () => {

    const {
        schema,
        refs: {
            formik_ref
        },
        values: {
            initial,
            isLoading
        },
        functions: {
            onSubmit
        }
    } = useRescheduleBookingController()

    return (
        <Wrapper>
            <Formik
                innerRef={formik_ref}
                initialValues={initial}
                validationSchema={schema}
                onSubmit={onSubmit}
                enableReinitialize
            >
                {({ values: data, handleSubmit, errors, setFieldValue }) => (
                    <KeyboardAvoidingWrapper>
                        <Input
                            type="date"
                            label="Date"
                            placeholder="Select Date"
                            required
                            value={data?.rescheduled_appointment_date}
                            onChangeText={e => setFieldValue("rescheduled_appointment_date", e)}
                            error={errors?.rescheduled_appointment_date}
                        />
                        <Row gap={10}>
                            <View style={{ flex: 0.5 }}>
                                <Input
                                    type="time"
                                    label="From Time"
                                    placeholder="Select From Time"
                                    required
                                    value={data?.rescheduled_appointment_start_time}
                                    onChangeText={e => setFieldValue("rescheduled_appointment_start_time", e)}
                                    error={errors?.rescheduled_appointment_start_time}
                                />
                            </View>
                            <View style={{ flex: 0.5 }}>
                                <Input
                                    type="time"
                                    label="To Time"
                                    placeholder="Select To Time"
                                    required
                                    value={data?.rescheduled_appointment_end_time}
                                    onChangeText={e => setFieldValue("rescheduled_appointment_end_time", e)}
                                    error={errors?.rescheduled_appointment_end_time}
                                />
                            </View>
                        </Row>
                        <Button text="Save" style={{ marginTop: heightPixel(40) }} onPress={handleSubmit} loading={isLoading} />
                    </KeyboardAvoidingWrapper>
                )}
            </Formik>
        </Wrapper>
    )
}

export default RescheduleBooking