import { StyleSheet, View } from "react-native"
import images from "../../../assets/images"
import Icon from "../../Icon"
import Text from "../../Text"
import Touchable from "../../Touchable"
import colors from "../../../utils/colors"
import { heightPixel, widthPixel } from "../../../utils/helper"

const styles = StyleSheet.create({
    card: {
        backgroundColor: colors.blackish_gray,
        borderRadius: heightPixel(10),
        padding: widthPixel(15),
        borderWidth: 1,
        borderColor: colors.gray,
    },
    content: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-start",
    },
    leftContent: {
        flex: 1,
        gap: heightPixel(5),
    },
    rightContent: {
        alignItems: "flex-end",
    },
    dateRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: widthPixel(5),
    },
    amountRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: widthPixel(5),
    },
    statusBadge: {
        backgroundColor: colors.primary,
        paddingHorizontal: widthPixel(12),
        paddingVertical: heightPixel(4),
        borderRadius: heightPixel(15),
        alignItems: "center",
        justifyContent: "center",
    },
    upcomingBadge: {
        backgroundColor: "#FF6B35", // Orange-red color for upcoming status
    },
})

interface ServiceLogCardProps {
    date?: string
    bookingId?: string
    amount?: number
    status?: string
    onPress?: () => void
}

const ServiceLogCard = ({
    date = "Jan 26, 2025",
    bookingId = "#123456",
    amount = 10,
    status = "upcoming",
    onPress
}: ServiceLogCardProps) => {
    return (
        <Touchable onPress={onPress}>
            <View style={styles.card}>
                <View style={styles.content}>
                    <View style={styles.leftContent}>
                        <View style={styles.dateRow}>
                            <Icon source={images.calendar} size={16} />
                            <Text size={12} color={colors.gray}>{date}</Text>
                        </View>
                        <Text size={12} color={colors.gray}>Booking Id : {bookingId}</Text>
                        <View style={styles.amountRow}>
                            <Text size={12} color={colors.gray}>Amount : {amount} Yalla Coins</Text>
                            <Icon source={images.coin} size={12} />
                        </View>
                    </View>
                    <View style={styles.rightContent}>
                        <View style={[styles.statusBadge, status === "upcoming" && styles.upcomingBadge]}>
                            <Text size={10} color={colors.white} weight="semibold">
                                {status === "upcoming" ? "Upcoming" : status}
                            </Text>
                        </View>
                    </View>
                </View>
            </View>
        </Touchable>
    )
}

export default ServiceLogCard
