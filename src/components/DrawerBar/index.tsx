import { DrawerContentScrollView } from "@react-navigation/drawer"
import { View } from "react-native"
import images from "../../assets/images"
import { useModal } from "../../contexts/ModalContext"
import { useAppDispatch, useAppSelector } from "../../hooks"
import { useGetWalletQuery } from "../../redux/Apis/User"
import { logout, selectUser } from "../../redux/Slices/AuthSlice"
import colors from "../../utils/colors"
import { heightPixel } from "../../utils/helper"
import { navigateToAddServiceCategories, navigateToHomeTab } from "../../utils/navigation"
import { NAVIGATORS, ROUTES } from "../../utils/routes"
import Button from "../Button"
import Icon from "../Icon"
import Row from "../Row"
import Text from "../Text"
import styles from "./styles"

const DRAWER_ROUTES: any[] = [
    {
        title: "Home",
        action: "home" as const,
        icon: images.drawer_icons.home
    },
    {
        title: "Dashboard",
        route: NAVIGATORS.DASHBOARD_STACK,
        icon: images.drawer_icons.home // Dashboard icon if available
    },
    {
        title: "Add New Service",
        action: "add_service" as const,
        icon: images.drawer_icons.consult_trainer
    },
    {
        title: "Service Logs",
        route: NAVIGATORS.BOOKING_STACK as any,
        icon: images.drawer_icons.my_bookings
    },
    {
        title: "Payment Logs",
        route: NAVIGATORS.PAYMENT_LOGS_STACK as any,
        icon: images.helpdesk.wallet
    },
    {
        title: "Reviews & Ratings",
        route: NAVIGATORS.REVIEWS_STACK as any,
        icon: images.star
    },
    {
        title: "Help Desk",
        route: NAVIGATORS.HELP_DESK_STACK as any,
        icon: images.drawer_icons.help_center
    },
    {
        title: "Wallet",
        route: NAVIGATORS.WALLET_STACK as any,
        icon: images.helpdesk.wallet
    }
]

const DrawerBar = (props: any) => {

    const user = useAppSelector(selectUser)
    const dispatch = useAppDispatch()
    const { showYesNoModal } = useModal()
    const { data: walletData } = useGetWalletQuery(undefined, { skip: !user })
    const walletPayload = walletData && typeof walletData === "object" && "data" in walletData && (walletData as any).data
        ? (walletData as any).data
        : walletData
    const coinsDisplay =
        walletPayload?.my_coins != null && walletPayload?.my_coins !== ""
            ? String(walletPayload.my_coins)
            : (user?.coins ?? user?.total_coin ?? "0")

    const onPressLogout = () => {
        showYesNoModal({
            type: "warning",
            title: "Logout",
            message: "Are you sure you want to logout?"
        }, () => dispatch(logout()))
    }

    return (
        <DrawerContentScrollView {...props} contentContainerStyle={{ paddingTop: 0 }} showsVerticalScrollIndicator={false}>
            <Row gap={10} align="center" style={{ marginVertical: heightPixel(24) }}>
                <View>
                    <Icon source={{ uri: user?.photo }} size={50} rounded no_padding border={colors.white} resize="cover" />
                </View>
                <View>
                    <Text size={18} weight="bold" color={colors.white}>{user?.first_name} {user?.last_name}</Text>
                    <Row align="center" gap={3}>
                        <Text size={14} color={colors.white}>{coinsDisplay} Yalla Coins</Text>
                        <Icon source={images.coin} size={14} />
                    </Row>
                </View>
            </Row>
            {
                DRAWER_ROUTES.map((item) => (
                    <Row
                        key={item.title}
                        gap={8}
                        align="center"
                        style={[styles.drawer_item, { backgroundColor: item?.title === "Home" ? colors.primary : colors.transparent }]}
                        onPress={() => {
                            if (item.action === "home") {
                                navigateToHomeTab(props.navigation);
                                props.navigation.closeDrawer();
                                return;
                            }
                            if (item.action === "add_service") {
                                navigateToAddServiceCategories(props.navigation);
                                props.navigation.closeDrawer();
                                return;
                            }
                            props.navigation.closeDrawer();
                            if (item.useParentNav) {
                                props.navigation.getParent()?.navigate(item.route as never, (item?.child ? { screen: item?.child } : undefined) as never);
                            } else {
                                const nested =
                                    item.nestedParams ??
                                    (item?.child ? { screen: item.child } : undefined);
                                props.navigation.navigate(item.route, nested);
                            }
                        }}
                    >
                        {item?.icon && <Icon source={item?.icon} size={24} tint_color={colors.white} />}
                        <Text size={15} weight="semibold" color={colors.white}>{item.title}</Text>
                    </Row>
                ))
            }
            <Button text="Logout" type="custom" icon={images.drawer_icons.logout} style={styles.logout_button} onPress={onPressLogout} />
        </DrawerContentScrollView>
    )
}

export default DrawerBar