import { memo } from "react"
import { View } from "react-native"
import dayjs from 'dayjs'
import customParseFormat from "dayjs/plugin/customParseFormat"
import images from "../../../assets/images"
import colors from "../../../utils/colors"
import CardWrapper from "../../CardWrapper"
import Icon from "../../Icon"
import Row from "../../Row"
import StatusBadge from "../../StatusBadge"
import Text from "../../Text"

dayjs.extend(customParseFormat)

const ServiceCard = ({ data, onPress }) => {
    return (
        <CardWrapper height={108} color={colors.blackish_gray} border_radius={10} padding={15} onPress={onPress}>
            <View style={{ justifyContent: "space-between", height: "100%", width: "100%" }}>
                <Row justify="space-between">
                    <Row align="center" gap={10}>
                        <Icon source={images.calendar} size={14} />
                        <Text size={13}>{dayjs(data?.rescheduled_appointment_date || data?.appointment_date, "DD/MM/YYYY").format("MMM DD, YYYY")}</Text>
                    </Row>
                    <StatusBadge status={data?.status} />
                </Row>
                <Text weight="semibold">Booking Id :<Text weight="semibold" color={colors.icon_gray}> {data?.booking_id}</Text></Text>
                <Row>
                    <Row style={{ flex: 0.5 }} align="center" gap={5}>
                        <Text weight="semibold">Charges :<Text weight="semibold" color={colors.icon_gray}> {data?.amount_paid}</Text><Text size={12} weight="semibold" color={colors.icon_gray}> Coins</Text></Text>
                        <Icon source={images.coin} size={14} />
                    </Row>
                    <Row style={{ flex: 0.5 }} align="center" gap={5}>
                        <Text weight="semibold">Commission :<Text weight="semibold" color={colors.icon_gray}> {data?.commission}</Text><Text size={12} weight="semibold" color={colors.icon_gray}> Coins</Text></Text>
                        <Icon source={images.coin} size={14} />
                    </Row>
                </Row>
            </View>
        </CardWrapper>
    )
}

export default memo(ServiceCard)