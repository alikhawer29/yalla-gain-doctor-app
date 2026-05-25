import React, { memo, useCallback } from "react"
import { StyleSheet, View } from "react-native"
import { DrawerActions } from "@react-navigation/drawer"
import { RouteProp } from "@react-navigation/native"
import { StackNavigationOptions, StackNavigationProp } from "@react-navigation/stack"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import images from "../../assets/images"
import Icon from "../../components/Icon"
import Image from "../../components/Image"
import Text from "../../components/Text"
import Touchable from "../../components/Touchable"
import colors from "../../utils/colors"
import { heightPixel, widthPixel } from "../../utils/helper"
import { goBack, navigate, navigateToMyServicesTab, navigationRef } from "../../utils/navigation"
import { ROUTES, ROUTES_OPTIONS } from "../../utils/routes"
import NotificationHeaderIcon from "./NotificationHeaderIcon"

interface OptionsProps {
  route?: RouteProp<any, any> | {
    name?: string
    params?: {
      title?: string
    }
  }
  navigation?: StackNavigationProp<any, any> | {
    openDrawer?: () => void
  }
}

type StackHeaderProps = {
  route: OptionsProps["route"]
  navigation: OptionsProps["navigation"]
  transparent: boolean
}

const StackHeader = memo(({ route, navigation, transparent }: StackHeaderProps) => {
  const insets = useSafeAreaInsets()
  const routeName = (route as any)?.name
  const routeParams = (route as any)?.params
  const routeConfig = ROUTES_OPTIONS.find(item => item.route_name === routeName)

  const handleLeftPress = useCallback(() => {
    if (routeConfig?.left === "back") {
      if (
        routeName === ROUTES.SERVICE_DETAILS &&
        routeParams?.fromMyServices
      ) {
        navigateToMyServicesTab()
        return
      }
      goBack()
    } else if (routeConfig?.left === "drawer") {
      const nav = navigation as { openDrawer?: () => void; getParent?: () => { openDrawer?: () => void } }
      if (typeof nav?.openDrawer === "function") {
        nav.openDrawer()
        return
      }
      const parent = nav?.getParent?.()
      if (typeof parent?.openDrawer === "function") {
        parent.openDrawer()
        return
      }
      if (navigationRef.isReady()) {
        navigationRef.dispatch(DrawerActions.openDrawer())
      }
    }
  }, [routeConfig?.left, routeName, routeParams?.fromMyServices, navigation])

  const handleRightPress = useCallback(() => {
    if (routeConfig?.right === "notifications") {
      navigate(ROUTES.NOTIFICATION)
    }
  }, [routeConfig?.right])

  const leftKey = routeConfig?.left
  const leftIcon = leftKey && leftKey !== null ? images[leftKey as keyof typeof images] : null

  const rightKey = routeConfig?.right
  const rightIcon = rightKey && rightKey !== null ? images[rightKey as keyof typeof images] : null

  const title =
    (routeConfig && "title" in routeConfig ? routeConfig.title : undefined) ||
    (route as any)?.params?.title ||
    ""

  return (
    <View
      style={[
        styles.safeArea,
        {
          paddingTop: insets.top,
          backgroundColor: transparent ? colors.transparent : colors.black,
        },
      ]}
    >
      <View style={styles.container}>
        {leftIcon ? (
          <Touchable onPress={handleLeftPress} style={styles.sideSpace}>
            <Icon
              source={leftIcon}
              border={colors.white}
              size={40}
              rounded
              less_rounded
              less_padding
            />
          </Touchable>
        ) : (
          <View style={styles.sideSpace} />
        )}
        <View style={styles.center}>
          {routeConfig?.logo ? (
            <Image style={styles.logo} source={images.logo} />
          ) : (
            <View style={styles.titleWrap}>
              <Text
                lines={2}
                line_height={28}
                style={styles.title}
                color={colors.white}
                weight="semibold"
                size={22}
                position="center"
              >
                {title}
              </Text>
            </View>
          )}
        </View>
        {rightKey === "notifications" ? (
          <NotificationHeaderIcon onPress={handleRightPress} />
        ) : rightIcon ? (
          <Touchable onPress={handleRightPress} style={styles.sideSpace}>
            <Icon
              source={rightIcon}
              border={colors.white}
              size={40}
              rounded
              less_rounded
              less_padding
            />
          </Touchable>
        ) : (
          <View style={styles.sideSpace} />
        )}
      </View>
    </View>
  )
})

const Options = (props: OptionsProps): StackNavigationOptions => {
  const routeName = (props?.route as any)?.name
  const route = ROUTES_OPTIONS.find(item => item.route_name === routeName)
  const isTransparent = (route && "transparent" in route ? route.transparent : false) || false

  return {
    headerShown: true,
    headerTransparent: isTransparent,
    header: () => (
      <StackHeader
        route={props.route}
        navigation={props.navigation}
        transparent={isTransparent}
      />
    ),
  }
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: colors.transparent,
  },
  container: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.transparent,
    paddingHorizontal: widthPixel(20),
    paddingVertical: 8,
    minHeight: heightPixel(62),
  },
  sideSpace: {
    width: widthPixel(40),
    justifyContent: "center",
    alignItems: "center",
    zIndex: 99,
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    zIndex: 99,
    textAlign: "center",
    maxWidth: "80%",
  },
  logo: {
    width: heightPixel(62),
    height: heightPixel(62),
    resizeMode: "contain",
    zIndex: 99,
  },
  titleWrap: {
    zIndex: 99,
    maxWidth: "80%",
    height: heightPixel(62),
    justifyContent: "center",
    alignItems: "center",
  },
})

export default Options
