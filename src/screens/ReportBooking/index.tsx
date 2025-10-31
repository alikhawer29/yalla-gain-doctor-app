import { View } from "react-native"
import Button from "../../components/Button"
import Input from "../../components/Input"
import Row from "../../components/Row"
import Wrapper from "../../components/Wrapper"
import { heightPixel } from "../../utils/helper"
import useReportBookingController from "./useReportBookingController"
import KeyboardAvoidingWrapper from "../../components/KeyboardAvoidingWrapper"
import { Formik } from "formik"
import Upload from "../../components/Upload"

const ReportBooking = () => {

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
    } = useReportBookingController()

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
                            type="textarea"
                            label="Report Reason"
                            placeholder="Write Here"
                            required
                            value={data?.reason}
                            onChangeText={e => setFieldValue("reason", e)}
                            error={errors?.reason}
                        />
                        <Upload text="Upload Files" />
                        <Button text="Submit" style={{ marginTop: heightPixel(40) }} onPress={handleSubmit} loading={isLoading} />
                    </KeyboardAvoidingWrapper>
                )}
            </Formik>
        </Wrapper>
    )
}

export default ReportBooking