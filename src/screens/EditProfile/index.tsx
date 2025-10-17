import { FieldArray, Formik } from "formik"
import { View } from "react-native"
import images from "../../assets/images"
import Button from "../../components/Button"
import Dropdown from "../../components/Dropdown"
import Icon from "../../components/Icon"
import Input from "../../components/Input"
import KeyboardAvoidingWrapper from "../../components/KeyboardAvoidingWrapper"
import Wrapper from "../../components/Wrapper"
import colors from "../../utils/colors"
import { GENDERS, LANGUAGES } from "../../utils/data"
import styles from "./styles"
import useEditProfileController from "./useEditProfileController"
import Row from "../../components/Row"
import Text from "../../components/Text"
import { heightPixel } from "../../utils/helper"
import Upload from "../../components/Upload"

const EditProfile = () => {

    const {
        schema,
        refs: {
            formik_ref
        },
        values: {
            initial,
            isLoading,
            user_image,
            image,
            states,

        },
        functions: {
            onSubmit,
            onPressUpload,
            cities
        }
    } = useEditProfileController()

    return (
        <Wrapper scrollable bottom_bar>
            <KeyboardAvoidingWrapper>
                <Formik
                    innerRef={formik_ref}
                    initialValues={initial}
                    validationSchema={schema}
                    onSubmit={onSubmit}
                    enableReinitialize
                >
                    {({ values: data, handleChange, handleSubmit, touched, errors, setFieldValue }) => (
                        <>
                            <View style={styles.icon_container}>
                                <View>
                                    <Icon source={image ? image : { uri: user_image }} size={100} rounded no_padding border={colors.white} resize="cover" />
                                    <View style={styles.upload_container}>
                                        <Icon color={colors.primary} source={images.camera} rounded size={29} less_padding border={colors.white} onPress={onPressUpload} />
                                    </View>
                                </View>
                            </View>
                            <Input label="First Name" placeholder="Enter First Name" required value={data?.first_name} onChangeText={handleChange("first_name")} error={touched?.first_name ? errors?.first_name : null} />
                            <Input label="Last Name" placeholder="Enter Last Name" required value={data?.last_name} onChangeText={handleChange("last_name")} error={touched?.last_name ? errors?.last_name : null} />
                            <Dropdown
                                required
                                label="Gender"
                                options={GENDERS}
                                value={data?.gender}
                                onChangeText={(e) => setFieldValue("gender", e?.value)}
                                error={touched?.gender ? errors?.gender : ""}
                            />
                            <Input
                                label="Mobile Number"
                                placeholder="Enter Your Phone Number"
                                type="phone"
                                required
                                value={data?.phone}
                                onChangeText={handleChange("phone")}
                                error={touched?.phone ? errors?.phone : ""}
                                country={data?.country_code}
                                onChangeCountry={e => {
                                    setFieldValue("country_code", e?.cca2)
                                    setFieldValue("dialing_code", e?.callingCode?.[0])
                                }}
                            />
                            <Dropdown
                                required
                                label="State"
                                options={states}
                                value={data?.state}
                                onChangeText={(e) => setFieldValue("state", e?.value)}
                                zIndex={2000}
                                zIndexInverse={1000}
                                error={touched?.state ? errors?.state : ""}
                            />
                            <Dropdown
                                required
                                label="City"
                                options={cities(data?.state)}
                                value={data?.city}
                                onChangeText={(e) => setFieldValue("city", e?.value)}
                                zIndex={1000}
                                zIndexInverse={2000}
                                error={touched?.city ? errors?.city : ""}
                            />
                            <Input label="Bio" placeholder="Write Here" type="textarea" required value={data?.bio} onChangeText={handleChange("bio")} error={touched?.bio ? errors?.bio : ""} />
                            <FieldArray name="experience">
                                {({ push, remove, form }) => (
                                    <>
                                        {form?.values?.experience?.map((_: any, index: number) => (
                                            <View style={{ marginBottom: heightPixel(7.5) }} key={index}>
                                                <Input type="number" label="Experience" placeholder="Enter Experience" required value={data?.experience?.[index]?.experience} onChangeText={text => setFieldValue(`experience[${index}].experience`, text)} error={touched?.experience?.[index]?.experience ? errors?.experience?.[index]?.experience : ""} />
                                                <Input label="Specialization" placeholder="Enter Specialization" required value={data?.experience?.[index]?.specialization} onChangeText={text => setFieldValue(`experience[${index}].specialization`, text)} error={touched?.experience?.[index]?.specialization ? errors?.experience?.[index]?.specialization : ""} />
                                                {form?.values?.experience?.length > 1 && <Text size={14} color={colors.danger} onPress={() => remove(index)} position="right" weight="semibold">Delete</Text>}
                                            </View>
                                        ))}
                                        <Row gap={5} align="center" style={{ marginVertical: heightPixel(7.5) }} onPress={() => push({ specialization: "", experience: "" })}>
                                            <Icon color={colors.primary} size={18} rounded source={images.plus} />
                                            <Text size={12}>Add More</Text>
                                        </Row>
                                    </>
                                )}
                            </FieldArray>
                            <Dropdown
                                required
                                label="Language you speak"
                                options={LANGUAGES}
                                value={data?.language}
                                onChangeText={(e) => setFieldValue("language", e?.value)}
                                error={touched?.language ? errors?.language : ""}
                            />
                            <Text size={24} weight="semibold" style={{ marginVertical: heightPixel(7.5) }}>Certificate Details</Text>
                            <FieldArray name="certificates">
                                {({ push, remove, form }) => (
                                    <>
                                        {form?.values?.certificates?.map((_: any, index: number) => (
                                            <View style={{ marginBottom: heightPixel(7.5) }} key={index}>
                                                <Input label="Institute Name" placeholder="Enter Institute Name" required value={data?.certificates?.[index]?.institute_name} onChangeText={text => setFieldValue(`certificates[${index}].institute_name`, text)} error={touched?.certificates?.[index]?.institute_name ? errors?.certificates?.[index]?.institute_name : ""} />
                                                <Input label="Certificate Title" placeholder="Enter Certificate Title" required value={data?.certificates?.[index]?.certificate_title} onChangeText={text => setFieldValue(`certificates[${index}].certificate_title`, text)} error={touched?.certificates?.[index]?.certificate_title ? errors?.certificates?.[index]?.certificate_title : ""} />
                                                <Upload error={touched?.certificates?.[index]?.certificate_picture ? errors?.certificates?.[index]?.certificate_picture : ""} required text={data?.certificates?.[index]?.certificate_picture ? data?.certificates?.[index]?.certificate_picture?.name : "Certificate Picture"} style={{ marginVertical: heightPixel(7.5) }} onPress={async () => {
                                                    // const img = await openGallery()
                                                    // if (img) {
                                                    //     setFieldValue(`certificates[${index}].certificate_picture`, img)
                                                    // }
                                                }} />
                                                {form?.values?.certificates?.length > 1 && <Text size={14} color={colors.danger} onPress={() => remove(index)} position="right" weight="semibold">Delete</Text>}
                                            </View>
                                        ))}
                                        <Row gap={5} align="center" style={{ marginVertical: heightPixel(7.5) }} onPress={() => push({ institute_name: "", certificate_title: "" })}>
                                            <Icon color={colors.primary} size={18} rounded source={images.plus} />
                                            <Text size={12}>Add More</Text>
                                        </Row>
                                    </>
                                )}
                            </FieldArray>
                            <Button text="Update" onPress={handleSubmit} loading={isLoading} style={styles.button} />
                        </>
                    )}
                </Formik>
            </KeyboardAvoidingWrapper>
        </Wrapper>
    )
}

export default EditProfile