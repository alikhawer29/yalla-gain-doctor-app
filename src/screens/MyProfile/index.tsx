import { View } from "react-native"
import Button from "../../components/Button"
import Icon from "../../components/Icon"
import Row from "../../components/Row"
import Text from "../../components/Text"
import Wrapper from "../../components/Wrapper"
import { useAppSelector } from "../../hooks"
import { selectUser } from "../../redux/Slices/AuthSlice"
import colors from "../../utils/colors"
import { navigate } from "../../utils/navigation"
import { ROUTES } from "../../utils/routes"
import styles from "./styles"
import Image from "../../components/Image"
import { heightPixel } from "../../utils/helper"
import useMyProfileController from "./useMyProfileController"

const MyProfile = () => {

    const user = useAppSelector(selectUser)

    const {
        values: {
            isProfileDeleteLoading
        },
        functions: {
            onPressDeleteAccount
        }
    } = useMyProfileController()

    return (
        <Wrapper bottom_bar scrollable>
            <View style={styles.icon_container}>
                <Icon source={{ uri: user?.photo }} size={100} rounded no_padding resize="cover" />
            </View>
            <Row style={styles.item_container}>
                <View style={[styles.item, styles.item_width]}>
                    <Text color={colors.icon_gray}>First Name</Text>
                    <Text weight="bold">{user?.first_name}</Text>
                </View>
                <View style={[styles.item, styles.item_width]}>
                    <Text color={colors.icon_gray}>Last Name</Text>
                    <Text weight="bold">{user?.last_name}</Text>
                </View>
                <View style={[styles.item, styles.item_width]}>
                    <Text color={colors.icon_gray}>Phone Number</Text>
                    <Text weight="bold">({user?.dialing_code}) {user?.phone}</Text>
                </View>
                <View style={[styles.item, styles.item_width]}>
                    <Text color={colors.icon_gray} lines={1}>Email Address</Text>
                    <Text weight="bold">{user?.email}</Text>
                </View>
                <View style={[styles.item, styles.item_width]}>
                    <Text color={colors.icon_gray}>Gender</Text>
                    <Text weight="bold" capitalize>{user?.gender}</Text>
                </View>
                <View style={[styles.item, styles.item_width]}>
                    <Text color={colors.icon_gray}>Language</Text>
                    <Text weight="bold" capitalize>{user?.language}</Text>
                </View>
                <View style={[styles.item, styles.item_width]}>
                    <Text color={colors.icon_gray} lines={1}>State</Text>
                    <Text weight="bold">{user?.state}</Text>
                </View>
                <View style={[styles.item, styles.item_width]}>
                    <Text color={colors.icon_gray} lines={1}>City</Text>
                    <Text weight="bold">{user?.city}</Text>
                </View>
                {
                    user?.experience?.map((item) => (
                        <>
                            <View style={[styles.item, styles.item_width]}>
                                <Text color={colors.icon_gray} lines={1}>Specialization</Text>
                                <Text weight="bold">{item?.specialization}</Text>
                            </View>
                            <View style={[styles.item, styles.item_width]}>
                                <Text color={colors.icon_gray} lines={1}>Experience</Text>
                                <Text weight="bold">{item?.experience || "0"} years</Text>
                            </View>
                        </>
                    ))
                }
                <View style={[styles.item, styles.item_full_width]}>
                    <Text color={colors.icon_gray} lines={1}>Bio</Text>
                    <Text weight="bold">{user?.bio}</Text>
                </View>
            </Row>
            <View style={[styles.item_container, styles.border_top_container]}>
                <View style={[styles.item, styles.item_full_width]}>
                    <Text size={20} weight="bold">Educational Details</Text>
                </View>
                {
                    user?.certifications?.map((item, index) => (
                        <>
                            <Row key={index} style={[styles.item, styles.item_full_width]}>
                                <View style={[styles.item, styles.item_width]}>
                                    <Text color={colors.icon_gray} lines={1}>Institution Name</Text>
                                    <Text weight="bold">{item?.institute_name}</Text>
                                </View>
                                <View style={[styles.item, styles.item_width]}>
                                    <Text color={colors.icon_gray} lines={1}>Certificate Title</Text>
                                    <Text weight="bold">{item?.certificate_title}</Text>
                                </View>
                            </Row>
                            <View style={[styles.item, styles.item_full_width]}>
                                <Image source={{ uri: item?.certificate_picture }} style={{ height: heightPixel(200), width: "80%", borderRadius: heightPixel(10) }} resize="cover" />
                            </View>
                        </>
                    ))
                }

            </View>
            <Button text="Edit Profile" style={styles.item} onPress={() => navigate(ROUTES.EDIT_PROFILE)} />
            <Row justify="space-between">
                <Button font_size={14} text="Change Password" type="outlined" style={styles.button} onPress={() => navigate(ROUTES.CHANGE_PASSWORD)} />
                <Button font_size={14} loading={isProfileDeleteLoading} text="Delete Account" type="custom" style={[styles.button, styles.danger_button]} onPress={onPressDeleteAccount} />
            </Row>
        </Wrapper>
    )
}

export default MyProfile