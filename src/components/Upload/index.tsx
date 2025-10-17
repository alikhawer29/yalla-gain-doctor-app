import { FC, memo } from "react";
import images from "../../assets/images";
import { IUpload } from "../../interfaces";
import Icon from "../Icon";
import Row from "../Row";
import Text from "../Text";
import colors from "../../utils/colors";
import styles from "./styles";

const Upload: FC<IUpload> = ({ text = "Upload", style, onPress, error }) => {
    return (
        <>
            <Row align="center" gap={10} style={style} onPress={onPress}>
                <Icon source={images.upload} size={24} />
                <Text size={16} weight="semibold">{text}</Text>
            </Row>
            {error && (
                <Text size={12} color={colors.danger} style={styles.error}>
                    {error}
                </Text>
            )}
        </>
    )
}

export default memo(Upload)