import React, { useMemo, useState } from "react"
import { FlatList, TouchableOpacity, View } from "react-native"
import { useDispatch } from "react-redux"
import { NOTIFICATIONS_FIRST_PAGE } from "../../constants/notificationsQuery"
import { userApi } from "../../redux/Apis/User"
import images from "../../assets/images"
import Icon from "../../components/Icon"
import Text from "../../components/Text"
import Wrapper from "../../components/Wrapper"
import { useGetNotificationsQuery, useReadNotificationMutation, useUnreadNotificationMutation } from "../../redux/Apis/User"
import { navigateFromNotificationData } from "../../services/push/notificationDeepLink"
import colors from "../../utils/colors"
import styles from "./styles"

type NotificationFilter = "all" | "read" | "unread"

const FILTER_OPTIONS: { key: NotificationFilter; label: string }[] = [
    { key: "all", label: "All" },
    { key: "read", label: "Read" },
    { key: "unread", label: "Unread" },
]

const Notification = () => {
    const dispatch = useDispatch()
    const [page, setPage] = useState(1)
    const [filter, setFilter] = useState<NotificationFilter>("all")
    const { data, isFetching, refetch } = useGetNotificationsQuery(
        page === 1 ? NOTIFICATIONS_FIRST_PAGE : { page, per_page: 20 },
    )

    const list = data?.data ?? []

    const filteredList = useMemo(() => {
        if (filter === "all") return list
        return list.filter((item: { read?: boolean }) =>
            filter === "read" ? !!item.read : !item.read,
        )
    }, [list, filter])
    const [read] = useReadNotificationMutation()
    const [unread] = useUnreadNotificationMutation()

    const handleMark = async (uuid: string, isRead: boolean) => {
        try {
            if (isRead) {
                await unread({ uuid }).unwrap()
            } else {
                await read({ uuid }).unwrap()
            }
            dispatch(userApi.util.invalidateTags(["Notifications"]))
            refetch()
        } catch (error) {
            console.error(error)
        }
    }

    const openNotification = (item: any) => {
        if (!item?.read) {
            void handleMark(item.id, false)
        }
        navigateFromNotificationData({
            type: item?.type,
            target_type: item?.target_type,
            target_id: item?.target_id,
            content_id: item?.content_id,
            id: item?.content_id ?? item?.target_id,
        })
    }

    const renderItem = ({ item }: any) => {
        const isRead = !!item.read
        return (
            <TouchableOpacity
                activeOpacity={0.85}
                onPress={() => openNotification(item)}
                style={[styles.card, !isRead && { backgroundColor: colors.primary + "20", borderColor: colors.primary }]}
            >
                {item?.title ? (
                    <Text style={styles.title} color={colors.white} size={14} weight="semibold">
                        {item.title}
                    </Text>
                ) : null}
                <Text style={styles.title} color={colors.white} size={14}>
                    {item.message}
                </Text>

                <View style={styles.footer}>
                    <View style={styles.dateRow}>
                        <Icon source={images.calendar} size={12} tint_color={colors.white + "80"} />
                        <Text color={colors.white + "80"} size={12}>{item.date}</Text>
                        <Icon source={images.clock} size={12} tint_color={colors.white + "80"} style={{ marginLeft: 10 }} />
                        <Text color={colors.white + "80"} size={12}>{item.time}</Text>
                    </View>

                    <TouchableOpacity onPress={() => handleMark(item.id, isRead)}>
                        <Text color={colors.primary} size={14} weight="semibold" style={styles.markText}>
                            {isRead ? "Mark As Unread" : "Mark As Read"}
                        </Text>
                    </TouchableOpacity>
                </View>
            </TouchableOpacity>
        )
    }

    const emptyMessage =
        list.length === 0
            ? "No notifications"
            : filter === "read"
              ? "No read notifications"
              : filter === "unread"
                ? "No unread notifications"
                : "No notifications"

    return (
        <Wrapper>
            <View style={styles.container}>
                <View style={styles.chipRow}>
                    {FILTER_OPTIONS.map((o) => {
                        const isActive = filter === o.key
                        return (
                            <TouchableOpacity
                                key={o.key}
                                style={[styles.chip, isActive && styles.chipActive]}
                                onPress={() => setFilter(o.key)}
                                activeOpacity={0.85}
                            >
                                <Text
                                    color={isActive ? colors.white : colors.icon_gray}
                                    size={13}
                                    weight={isActive ? "semibold" : "regular"}
                                >
                                    {o.label}
                                </Text>
                            </TouchableOpacity>
                        )
                    })}
                </View>

                <FlatList
                    data={filteredList}
                    renderItem={renderItem}
                    keyExtractor={(item) => item.id}
                    onRefresh={refetch}
                    refreshing={isFetching}
                    showsVerticalScrollIndicator={false}
                    ListEmptyComponent={
                        !isFetching ? (
                            <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
                                <Text color={colors.white}>{emptyMessage}</Text>
                            </View>
                        ) : null
                    }
                />
            </View>
        </Wrapper>
    )
}

export default Notification
