import React from "react";
import {
    FlatList,
    KeyboardAvoidingView,
    Platform,
    StyleSheet,
    TextInput,
    View
} from "react-native";
import { useHeaderHeight } from "@react-navigation/elements";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import fonts from "../../assets/fonts";
import images from "../../assets/images";
import ChatItemCard from "../../components/Cards/ChatItemCard";
import Icon from "../../components/Icon";
import Seperator from "../../components/Seperator";
import Wrapper from "../../components/Wrapper";
import useKeyboard from "../../hooks/useKeyboard";
import colors from "../../utils/colors";
import { heightPixel } from "../../utils/helper";
import useChatbotController from "./useChatbotController";

const Chatbot = () => {

    const {
        refs: {
            flatlist_ref
        },
        values: {
            data,
            input
        },
        functions: {
            onChangeInput,
            onSendMessage
        }
    } = useChatbotController()

    const headerHeight = useHeaderHeight();
    const insets = useSafeAreaInsets();
    const keyboardHeight = useKeyboard();
    const isNewAndroid = Platform.OS === "android" && Platform.Version >= 35;

    const renderItem = ({ item }) => (
        <ChatItemCard
            message={item?.text}
            sender={item.sender === "me"}
            created_at={item?.timestamp}
            typing={item?.typing}
            image={item.sender === "me" ? images.dummy : images.chatbot}
        />
    )

    return (
        <Wrapper>
            <KeyboardAvoidingView
                style={[
                    styles.container,
                    isNewAndroid && keyboardHeight > 0
                        ? { marginBottom: keyboardHeight }
                        : null,
                ]}
                behavior={Platform.OS === "ios" ? "padding" : undefined}
                keyboardVerticalOffset={
                    Platform.OS === "ios" ? headerHeight : 0
                }
            >
                <FlatList
                    ref={flatlist_ref}
                    style={styles.list}
                    data={data}
                    renderItem={renderItem}
                    keyExtractor={(item) => item.id}
                    ItemSeparatorComponent={<Seperator />}
                    keyboardShouldPersistTaps="handled"
                    keyboardDismissMode="on-drag"
                    contentContainerStyle={styles.list_content}
                />
                <View
                    style={[
                        styles.input_container,
                        {
                            paddingBottom: Math.max(
                                insets.bottom,
                                heightPixel(12),
                            ),
                        },
                    ]}
                >
                    <TextInput
                        style={styles.input}
                        placeholder="Type a message..."
                        value={input}
                        onChangeText={onChangeInput}
                        placeholderTextColor={colors.icon_gray}
                    />
                    <Icon
                        rounded
                        color={colors.primary}
                        onPress={onSendMessage}
                        source={images.send}
                        size={50}
                    />
                </View>
            </KeyboardAvoidingView>
        </Wrapper>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    list: {
        flex: 1,
    },
    list_content: {
        flexGrow: 1,
        paddingBottom: heightPixel(8),
    },
    input_container: {
        flexDirection: "row",
        alignItems: "flex-end",
        backgroundColor: colors.transparent,
        gap: 10,
        paddingTop: heightPixel(10),
    },
    input: {
        flex: 1,
        borderWidth: 1,
        borderColor: colors.primary,
        borderRadius: heightPixel(10),
        paddingHorizontal: 15,
        backgroundColor: colors.blackish_gray,
        color: colors.white,
        minHeight: heightPixel(50),
        maxHeight: heightPixel(100),
        paddingVertical: heightPixel(12),
        fontFamily: fonts.sfpro.regular,
    },
});

export default Chatbot;
