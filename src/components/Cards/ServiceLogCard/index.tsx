import { StyleSheet, View } from "react-native"
import images from "../../../assets/images"
import Icon from "../../Icon"
import Text from "../../Text"
import Touchable from "../../Touchable"
import colors from "../../../utils/colors"
import { getStatusColor, capitalize, heightPixel, widthPixel } from "../../../utils/helper"

const statusLabel = (status?: string) => {
    const key = status?.toLowerCase();
    if (key === 'upcoming') return 'Upcoming';
    if (key === 'completed' || key === 'past') return 'Past';
    if (key === 'in-progress') return 'In Progress';
    return capitalize(status || '');
};

const statusColorKey = (status?: string) => {
    const key = status?.toLowerCase();
    if (key === 'completed') return 'past';
    return status || 'pending';
};

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
        paddingHorizontal: widthPixel(12),
        paddingVertical: heightPixel(4),
        borderRadius: heightPixel(5),
        alignItems: "center",
        justifyContent: "center",
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
                            <Text size={12} color={colors.white}>{date}</Text>
                        </View>
                        <Text size={12} color={colors.white}>Booking Id : {bookingId}</Text>
                        <View style={styles.amountRow}>
                            <Text size={12} color={colors.white}>Amount : {amount} Yalla Coins</Text>
                            <Icon source={images.coin} size={12} />
                        </View>
                    </View>
                    <View style={styles.rightContent}>
                        <View
                            style={[
                                styles.statusBadge,
                                { backgroundColor: getStatusColor(statusColorKey(status)) },
                            ]}>
                            <Text size={10} color={colors.white} weight="semibold">
                                {statusLabel(status)}
                            </Text>
                        </View>
                    </View>
                </View>
            </View>
        </Touchable>
    )
}

export default ServiceLogCard
