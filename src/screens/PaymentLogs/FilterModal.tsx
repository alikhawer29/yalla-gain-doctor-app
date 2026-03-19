import React from "react"
import { View, StyleSheet, TouchableOpacity, Modal, TouchableWithoutFeedback } from "react-native"
import Text from "../../components/Text"
import Input from "../../components/Input"
import Button from "../../components/Button"
import Icon from "../../components/Icon"
import images from "../../assets/images"
import colors from "../../utils/colors"
import { heightPixel, widthPixel } from "../../utils/helper"

const FilterModal = ({ isVisible, onClose }: { isVisible: boolean, onClose: () => void }) => {
    return (
        <Modal transparent visible={isVisible} animationType="slide">
            <TouchableWithoutFeedback onPress={onClose}>
                <View style={styles.overlay}>
                    <TouchableWithoutFeedback>
                        <View style={styles.content}>
                            <View style={styles.header}>
                                <TouchableOpacity onPress={onClose} style={styles.backBtn}>
                                    <Icon source={images.back} size={20} tint_color={colors.white} />
                                    <Text color={colors.white} size={18} weight="semibold">Filter By</Text>
                                </TouchableOpacity>
                            </View>

                            <View style={styles.separator} />

                            <Text color={colors.white} size={16} weight="semibold" style={{ marginVertical: 15 }}>Filter By Date</Text>
                            
                            <Text color={colors.white} size={14} style={{ marginBottom: 10 }}>From</Text>
                            <Input placeholder="Mm/Dd/Yyyy" icon={images.calendar_icon} />

                            <View style={{ height: 20 }} />

                            <Text color={colors.white} size={14} style={{ marginBottom: 10 }}>To</Text>
                            <Input placeholder="Mm/Dd/Yyyy" icon={images.calendar_icon} />

                            <View style={styles.footer}>
                                <Button text="APPLY" onPress={onClose} style={{ flex: 1 }} />
                                <Button text="CLEAR" type="outlined" onPress={onClose} style={{ flex: 1 }} />
                            </View>
                        </View>
                    </TouchableWithoutFeedback>
                </View>
            </TouchableWithoutFeedback>
        </Modal>
    )
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.5)",
        justifyContent: "flex-end",
    },
    content: {
        backgroundColor: colors.blackish_gray,
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
        padding: 20,
        paddingBottom: 40,
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 10,
    },
    backBtn: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
    },
    separator: {
        height: 1,
        backgroundColor: colors.white + "20",
        marginVertical: 10,
    },
    footer: {
        flexDirection: "row",
        gap: 15,
        marginTop: 30,
    }
})

export default FilterModal
