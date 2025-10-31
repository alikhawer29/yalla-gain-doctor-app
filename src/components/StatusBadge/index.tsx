import { FC, memo } from "react";
import { View } from "react-native";
import { getStatusColor, heightPixel, widthPixel } from "../../utils/helper";
import Text from "../Text";

const StatusBadge: FC = ({ status = "pending" }) => {
    return (
        <View style={{ backgroundColor: getStatusColor(status), paddingHorizontal: widthPixel(10), borderRadius: heightPixel(4) }}>
            <Text capitalize size={12}>{status}</Text>
        </View>
    )
}

export default memo(StatusBadge)