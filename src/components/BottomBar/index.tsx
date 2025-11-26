import { Pressable, View } from "react-native"
import images from "../../assets/images"
import colors from "../../utils/colors"
import { BOTTOMBAR_HEIGHT, heightPixel, widthPixel } from "../../utils/helper"
import { ROUTES } from "../../utils/routes"
import Icon from "../Icon"
import Row from "../Row"

// Routes where bottom bar should be hidden
const HIDDEN_ROUTES = [ROUTES.CHAT_DETAIL]

const BottomBar = ({ state, descriptors, navigation }) => {
    // Get the current nested route name
    const currentTabState = state.routes[state.index]?.state
    const currentNestedRoute = currentTabState?.routes?.[currentTabState?.index]?.name

    // Hide bottom bar on specific screens
    if (currentNestedRoute && HIDDEN_ROUTES.includes(currentNestedRoute)) {
        return null
    }

    return (
        <View style={{ paddingHorizontal: widthPixel(10), backgroundColor: colors.transparent, paddingVertical: heightPixel(15), position: "absolute", bottom: BOTTOMBAR_HEIGHT, left: widthPixel(10), right: widthPixel(10) }}>
            <Row align="center" justify="space-between" style={{ backgroundColor: colors.blackish_gray, height: heightPixel(70), borderRadius: BOTTOMBAR_HEIGHT, paddingHorizontal: widthPixel(10) }}>
                {state.routes.map((route, index) => {
                    const { options } = descriptors[route.key];
                    const icon =
                        options.tabBarIcon !== undefined
                            ? options.tabBarIcon
                            : images.tab_home;

                    const isFocused = state.index === index;

                    const onPress = () => {
                        const event = navigation.emit({
                            type: 'tabPress',
                            target: route.key,
                            canPreventDefault: true,
                        });

                        if (!isFocused && !event.defaultPrevented) {
                            navigation.navigate(route.name, route.params);
                        }
                    };

                    const onLongPress = () => {
                        navigation.emit({
                            type: 'tabLongPress',
                            target: route.key,
                        });
                    };

                    return (
                        <Pressable
                            accessibilityState={isFocused ? { selected: true } : {}}
                            accessibilityLabel={options.tabBarAccessibilityLabel}
                            testID={options.tabBarButtonTestID}
                            onPress={onPress}
                            onLongPress={onLongPress}
                            style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
                        >
                            <Icon size={50} color={isFocused ? colors.primary : colors.gray} tint_color={isFocused ? colors.white : colors.icon_gray} rounded source={icon} />
                        </Pressable>
                    );
                })}
            </Row>
        </View>
    )
}

export default BottomBar