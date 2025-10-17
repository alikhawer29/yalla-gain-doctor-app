import { Formik } from "formik"
import Button from "../../components/Button"
import Input from "../../components/Input"
import Upload from "../../components/Upload"
import Wrapper from "../../components/Wrapper"
import useAddServiceController from "./useAddServiceController"
import { heightPixel } from "../../utils/helper"
import { View } from "react-native"
import KeyboardAvoidingWrapper from "../../components/KeyboardAvoidingWrapper"
import Image from "../../components/Image"
import Icon from "../../components/Icon"
import images from "../../assets/images"
import colors from "../../utils/colors"

const AddService = () => {

    const {
        schema,
        refs: {
            formik_ref
        },
        values: {
            initial,
            isLoading,
            is_edit
        },
        functions: {
            onSubmit,
            openGallery,
            onManageSlots
        }
    } = useAddServiceController()

    return (
        <Wrapper>
            <Formik
                innerRef={formik_ref}
                initialValues={initial}
                validationSchema={schema}
                onSubmit={onSubmit}
            >
                {({ values: data, handleSubmit, handleChange, errors, touched, setFieldValue }) => (
                    <KeyboardAvoidingWrapper>
                        <Input
                            label="Title"
                            placeholder="Enter Title"
                            required
                            value={data?.title}
                            onChangeText={handleChange("title")}
                            error={touched.title ? errors.title : undefined}
                        />
                        <Input
                            type="number"
                            label="Service Charges"
                            placeholder="Enter Service Charges"
                            required
                            value={data?.charges}
                            onChangeText={handleChange("charges")}
                            error={touched.charges ? errors.charges : undefined}
                        />
                        <Input
                            label="Description"
                            type="textarea"
                            placeholder="Write Description"
                            required
                            value={data?.description}
                            onChangeText={handleChange("description")}
                            error={touched.description ? errors.description : undefined}
                        />
                        {
                            data?.image &&
                            <View style={{ position: 'relative', alignItems: 'center', justifyContent: 'center' }}>
                                <Image source={{ uri: typeof data?.image === "object" ? data?.image?.uri : data?.image }} style={{ height: heightPixel(180), borderRadius: heightPixel(10), marginVertical: heightPixel(7.5) }} resize="cover" />
                                <View style={{ position: 'absolute', top: heightPixel(20), right: heightPixel(20) }} >
                                    <Icon source={images.cross} tint_color={colors.danger} size={10} onPress={() => setFieldValue("image", null)} />
                                </View>
                            </View>
                        }
                        <Upload required text={data?.image?.name || "Upload Service Image"} onPress={openGallery} style={{ marginVertical: heightPixel(7.5) }} error={touched.image ? errors.image : undefined} />
                        <View style={{ gap: heightPixel(10), marginTop: heightPixel(15) }}>
                            {
                                !is_edit &&
                                <Button text="Manage Slots For This Service" type="outlined" onPress={onManageSlots} />
                            }
                            <Button text={is_edit ? "Update" : "Save"} onPress={handleSubmit} loading={isLoading} />
                        </View>
                    </KeyboardAvoidingWrapper>
                )}
            </Formik>
        </Wrapper>
    )
}

export default AddService