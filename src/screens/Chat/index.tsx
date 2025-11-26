import { useCallback, useEffect, useMemo, useState } from "react"
import { FlatList, View } from "react-native"
import { useNavigation } from "@react-navigation/native"
import { StackNavigationProp } from "@react-navigation/stack"
import images from "../../assets/images"
import ChatCard from "../../components/Cards/ChatCard"
import Input from "../../components/Input"
import Row from "../../components/Row"
import Seperator from "../../components/Seperator"
import Wrapper from "../../components/Wrapper"
import Text from "../../components/Text"
import Dropdown from "../../components/Dropdown"
import Empty from "../../components/Empty"
import ScreenLoader from "../../components/ScreenLoader"
import { useGetChatListQuery, useCreateAdminChatMutation } from "../../redux/Apis/Chat"
import { IChatCard, RootStackParamList } from "../../interfaces"
import { ROUTES } from "../../utils/routes"
import styles from "./style"

type ChatNavigationProp = StackNavigationProp<RootStackParamList>

const FILTER_OPTIONS = [
    { label: "All", value: "all" },
    { label: "Admin", value: "admin" },
    { label: "User", value: "user" },
]

const Chat = () => {
    const navigation = useNavigation<ChatNavigationProp>()
    const [searchQuery, setSearchQuery] = useState("")
    const [filterValue, setFilterValue] = useState("all")

    const { data: chatListData, isLoading, refetch, isSuccess } = useGetChatListQuery(undefined)
    const [createAdminChat] = useCreateAdminChatMutation()

    // Create admin chat only if it doesn't exist in the list
    useEffect(() => {
        if (isSuccess && chatListData?.data) {
            const hasAdminChat = chatListData.data.some(
                (chat: IChatCard) => chat.user_role === 'admin'
            )
            if (!hasAdminChat) {
                createAdminChat(undefined).unwrap().then(() => {
                    refetch()
                }).catch(() => {
                    // Ignore error if admin chat creation fails
                })
            }
        }
    }, [isSuccess, chatListData, createAdminChat, refetch])

    const chatList = useMemo(() => {
        let list: IChatCard[] = chatListData?.data || []

        // Sort to put admin chat on top
        list = [...list].sort((a, b) => {
            if (a.user_role === 'admin' && b.user_role !== 'admin') return -1
            if (a.user_role !== 'admin' && b.user_role === 'admin') return 1
            return 0
        })

        // Filter by type
        if (filterValue !== "all") {
            list = list.filter(chat => chat.user_role === filterValue)
        }

        // Filter by search query
        if (searchQuery.trim()) {
            list = list.filter(chat =>
                chat.name.toLowerCase().includes(searchQuery.toLowerCase())
            )
        }

        return list
    }, [chatListData, filterValue, searchQuery])

    const handleChatPress = useCallback((chat: IChatCard) => {
        navigation.navigate(ROUTES.CHAT_DETAIL as any, {
            chatId: chat.id,
            name: chat.name,
            image: chat.image,
            user_role: chat.user_role,
        })
    }, [navigation])

    if (isLoading) {
        return <ScreenLoader />
    }

    return (
        <Wrapper bottom_bar>
            {/* Header outside FlatList so dropdown can overlap */}
            <View style={styles.header_container}>
                <View style={styles.search_container}>
                    <Input
                        placeholder="Search Here"
                        icon={images.search}
                        height={40}
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                </View>
                <Row style={styles.filter_container} align="center">
                    <Text style={styles.filter_label}>Showing:</Text>
                    <View style={styles.dropdown_container}>
                        <Dropdown
                            options={FILTER_OPTIONS}
                            value={filterValue}
                            onChangeText={(item: any) => setFilterValue(item.value)}
                            height={35}
                        />
                    </View>
                </Row>
            </View>
            <FlatList
                data={chatList}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => (
                    <ChatCard {...item} onPress={() => handleChatPress(item)} />
                )}
                ItemSeparatorComponent={() => <Seperator size={15} />}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.list_content}
                ListEmptyComponent={
                    <View style={styles.empty_container}>
                        <Empty message="No chats found" />
                    </View>
                }
                refreshing={isLoading}
                onRefresh={refetch}
            />
        </Wrapper>
    )
}

export default Chat