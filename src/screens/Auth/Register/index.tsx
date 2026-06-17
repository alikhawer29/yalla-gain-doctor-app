import { FieldArray, Formik } from "formik"
import { useEffect, useState } from "react"
import { ActivityIndicator, InteractionManager, View } from "react-native"
import { useNavigation } from "@react-navigation/native"
import images from "../../../assets/images"
import AuthWrapper from "../../../components/AuthWrapper"
import Button from "../../../components/Button"
import Dropdown from "../../../components/Dropdown"
import Icon from "../../../components/Icon"
import Input from "../../../components/Input"
import Row from "../../../components/Row"
import Tabs from "../../../components/Tabs"
import Text from "../../../components/Text"
import Upload from "../../../components/Upload"
import colors from "../../../utils/colors"
import { GENDERS, LANGUAGES } from "../../../utils/data"
import { heightPixel, normalizeDialingCode } from "../../../utils/helper"
import { getPhoneRules } from "../../../utils/phoneRules"
import { navigateAndSimpleReset } from "../../../utils/navigation"
import { ROUTES } from "../../../utils/routes"
import auth_styles from "../styles"
import styles from "./styles"
import useRegisterController from "./useRegisterController"

/** Heavy form (Formik, Yup, state/city lists) — mounted after transition so navigation isn’t blocked. */
const RegisterForm = () => {
    const navigation = useNavigation()
    const [profileImageBump, setProfileImageBump] = useState(0)
    const [certImageBumps, setCertImageBumps] = useState<Record<number, number>>({})

    const {
        schema,
        refs: {
            formik_ref
        },
        values: {
            initial,
            isLoading,
            states,
            cities,
            tabs
        },
        functions: {
            onSubmit,
            openGallery
        }
    } = useRegisterController()

    return (
        <AuthWrapper>

            <View style={styles.tab_wrapper}>
                <Tabs tabs={tabs} selected={"register"} setSelected={() => { }} type="basic" />
            </View>
            <Formik
                innerRef={formik_ref}
                initialValues={initial}
                validationSchema={schema}
                onSubmit={onSubmit}
            >
                {({ values: data, handleSubmit, handleChange, errors, touched, setFieldValue, setFieldTouched, submitCount }) => (
                    <>
                        <Input label="First Name" maxLength={20} placeholder="Enter First Name" required value={data?.first_name} onChangeText={handleChange("first_name")} error={touched?.first_name ? errors?.first_name : ""} />
                        <Input label="Last Name" maxLength={20} placeholder="Enter Last Name" required value={data?.last_name} onChangeText={handleChange("last_name")} error={touched?.last_name ? errors?.last_name : ""} />
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
                            maxLength={getPhoneRules(data?.country_code).max}
                            onChangeCountry={e => {
                                setFieldValue("country_code", e?.cca2)
                                setFieldValue("dialing_code", normalizeDialingCode(e?.callingCode?.[0]))
                                setFieldValue("phone", "")
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
                                            {data?.certificates?.[index]?.certificate_picture?.uri ? (
                                                <View style={styles.cert_preview_wrap}>
                                                    <Icon
                                                        key={`reg-cert-${index}-${certImageBumps[index] ?? 0}`}
                                                        source={{ uri: data.certificates[index].certificate_picture.uri }}
                                                        size={100}
                                                        rounded
                                                        no_padding
                                                        border={colors.white}
                                                        resize="cover"
                                                    />
                                                    <Text size={12} color={colors.gray} style={{ marginTop: 4 }}>Tap below to replace</Text>
                                                </View>
                                            ) : null}
                                            <Upload error={touched?.certificates?.[index]?.certificate_picture ? errors?.certificates?.[index]?.certificate_picture : ""} required text={data?.certificates?.[index]?.certificate_picture ? (data?.certificates?.[index]?.certificate_picture?.name || data?.certificates?.[index]?.certificate_picture?.fileName || 'Certificate') : "Certificate Picture"} style={styles.upload_margin} onPress={async () => {
                                                const img = await openGallery()
                                                if (img) {
                                                    setFieldValue(`certificates[${index}].certificate_picture`, img)
                                                    setCertImageBumps(prev => ({ ...prev, [index]: (prev[index] ?? 0) + 1 }))
                                                }
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
                        <Input label="Email Address" placeholder="Enter Email Address" type="email" required value={data?.email} onChangeText={handleChange("email")} error={touched?.email ? errors?.email : ""} />
                        <Input label="Password" placeholder="Enter Password" type="password" required value={data?.password} onChangeText={handleChange("password")} error={touched?.password ? errors?.password : ""} />
                        <Input label="Confirm Password" placeholder="Confirm Password" type="password" required value={data?.password_confirmation} onChangeText={handleChange("password_confirmation")} error={touched?.password_confirmation ? errors?.password_confirmation : ""} />
                        <Text size={16} weight="semibold" style={{ marginTop: heightPixel(8), marginBottom: heightPixel(4) }}>Profile Picture</Text>
                        {data?.photo?.uri ? (
                            <View style={styles.profile_preview_wrap}>
                                <Icon
                                    key={`reg-profile-${profileImageBump}`}
                                    source={{ uri: data.photo.uri }}
                                    size={120}
                                    rounded
                                    no_padding
                                    border={colors.white}
                                    resize="cover"
                                />
                                <Text size={12} color={colors.gray} style={{ marginTop: 6 }}>Tap below to change photo</Text>
                            </View>
                        ) : null}
                        <Upload
                            required
                            error={(touched?.photo || submitCount > 0) ? errors?.photo : ""}
                            text={data?.photo ? (data?.photo?.name || data?.photo?.fileName || 'Change profile picture') : "Upload Profile Picture"}
                            style={styles.upload_margin}
                            onPress={async () => {
                                const img = await openGallery()
                                if (img) {
                                    setFieldValue(`photo`, img)
                                    setFieldTouched('photo', true, false)
                                    setProfileImageBump(b => b + 1)
                                }
                            }}
                        />
                        <Button text={"Register"} style={auth_styles.button} onPress={handleSubmit} loading={isLoading} />
                    </>
                )}
            </Formik>
            <Text position="center" size={16} weight="semibold" style={styles.bottom_text_alt}>
                Already a User?
                <Text underline color={colors.primary} size={16} weight="semibold" onPress={() => navigateAndSimpleReset(ROUTES.USER_ENTRY)}>
                    {" Login "}
                </Text>
                Now
            </Text>
            <Row style={styles.back_button_wrapper} onPress={() => navigation.goBack()}>
                <Icon source={images.back} size={12} color={colors.primary} />
                <Text size={14} color={colors.primary}>Back</Text>
            </Row>

        </AuthWrapper>
    )
}

const Register = () => {
    const [formReady, setFormReady] = useState(false)

    useEffect(() => {
        const task = InteractionManager.runAfterInteractions(() => {
            setFormReady(true)
        })
        return () => task.cancel()
    }, [])

    if (!formReady) {
        return (
            <AuthWrapper>
                <View
                    style={{
                        flex: 1,
                        minHeight: 200,
                        justifyContent: "center",
                        alignItems: "center",
                        paddingTop: heightPixel(40),
                    }}
                >
                    <ActivityIndicator size="large" color={colors.primary} />
                </View>
            </AuthWrapper>
        )
    }

    return <RegisterForm />
}

export default Register