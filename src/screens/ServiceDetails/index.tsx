import { View } from "react-native";
import images from "../../assets/images";
import Button from "../../components/Button";
import Icon from "../../components/Icon";
import Image from "../../components/Image";
import Row from "../../components/Row";
import Text from "../../components/Text";
import Wrapper from "../../components/Wrapper";
import colors from "../../utils/colors";
import { heightPixel } from "../../utils/helper";
import useServiceDetailsController from "./useServiceDetailsController";

const ServiceDetails = () => {

    const {
        values: {
            data,
            isLoading,
            isDeleteLoading
        },
        functions: {
            onRemove,
            onEdit,
            onEditSlots
        }
    } = useServiceDetailsController()

    return (
        <Wrapper loading={isLoading} scrollable>
            <View style={{ gap: heightPixel(20) }}>
                <Image source={{ uri: data?.image }} style={{ height: heightPixel(190), borderRadius: heightPixel(10) }} resize="cover" />
                <Row align="center" justify="space-between">
                    <Text size={22} weight="semibold">{data?.title}</Text>
                    <Row>
                        <Text weight="semibold">Category: </Text>
                        <Text>{data?.service_category?.title}</Text>
                    </Row>
                </Row>
                <View>
                    <Text weight="bold" size={16}>Amount:</Text>
                    <Row align="center" gap={5}>
                        <Text weight="semibold">{data?.charges}</Text>
                        <Icon source={images.coin} size={12} />
                        <Text size={12}>Yalla Coins</Text>
                    </Row>
                </View>
                <View>
                    <Text weight="bold" size={16}>Description:</Text>
                    <Text>{data?.description}</Text>
                </View>
                <View style={{ gap: 10 }}>
                    <Button text="Edit Service" onPress={onEdit} />
                    <Button text="Edit Slots For This Service" type="outlined" onPress={onEditSlots} />
                    <Button text="Remove" type="custom" loading={isDeleteLoading} style={{ borderColor: colors.danger, backgroundColor: colors.light_transparent_danger }} onPress={onRemove} />
                </View>
            </View>
        </Wrapper>
    )
}

export default ServiceDetails