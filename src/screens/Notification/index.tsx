import React, { useState } from "react"
import { View, FlatList, TouchableOpacity, ActivityIndicator } from "react-native"
import Wrapper from "../../components/Wrapper"
import Text from "../../components/Text"
import Row from "../../components/Row"
import Icon from "../../components/Icon"
import images from "../../assets/images"
import styles from "./styles"
import colors from "../../utils/colors"
import { useGetNotificationsQuery, useReadNotificationMutation, useUnreadNotificationMutation } from "../../redux/Apis/User"

const Notification = () => {
    const [page, setPage] = useState(1)
    const { data, isFetching, refetch } = useGetNotificationsQuery({ page, per_page: 20 })
    const [read] = useReadNotificationMutation()
    const [unread] = useUnreadNotificationMutation()

    const handleMark = async (uuid: string, isRead: boolean) => {
        try {
            if (isRead) {
                await unread({ uuid }).unwrap()
            } else {
                await read({ uuid }).unwrap()
            }
            refetch()
        } catch (error) {
            console.error(error)
        }
    }

    const renderItem = ({ item }: any) => {
        const isRead = !!item.read
        return (
            <View style={[styles.card, !isRead && { backgroundColor: colors.primary + "20", borderColor: colors.primary }]}>
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
            </View>
        )
    }

    return (
        <Wrapper>
            <View style={styles.container}>
                <FlatList
                    data={data?.data || []}
                    renderItem={renderItem}
                    keyExtractor={(item) => item.id}
                    onRefresh={refetch}
                    refreshing={isFetching}
                    showsVerticalScrollIndicator={false}
                    ListEmptyComponent={
                        !isFetching ? (
                            <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
                                <Text color={colors.white}>No Notifications</Text>
                            </View>
                        ) : null
                    }
                />
            </View>
        </Wrapper>
    )
}

export default Notification
