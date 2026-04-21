import { FC, memo } from "react"
import { IButton } from "../../interfaces"
import colors from "../../utils/colors"
import Icon from "../Icon"
import Loader from "../Loader"
import Row from "../Row"
import Text from "../Text"
import styles from "./styles"

const Button: FC<IButton> = ({ text, style, onPress, type = "primary", font_size = 16, icon = null, loading = false, rowJustify = "center" }) => {

    const button_default_style = {
        ...(type === "outlined" ? { backgroundColor: colors.light_primary } : type === "secondary" ? { backgroundColor: colors.white } : {})
    }

    const textPosition = rowJustify === "flex-start" ? "left" : rowJustify === "flex-end" ? "right" : "center"

    return (
        <Row gap={6} onPress={onPress} style={[styles.container, style, button_default_style]} align="center" justify={rowJustify}>
            {
                loading ? <Loader /> :
                    (
                        <>
                            {icon && <Icon source={icon} size={24} />}
                            <Text
                                size={font_size}
                                weight="semibold"
                                position={textPosition}
                                color={(type === "outlined" || type === "secondary") ? colors.primary : colors.white}
                                style={{ flex: 1, minWidth: 0 }}
                            >
                                {text}
                            </Text>
                        </>
                    )
            }
        </Row>
    )
}

export default memo(Button)