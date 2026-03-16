import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { FlatList, View } from "react-native"
import { useNavigation } from "@react-navigation/native"
import { StackNavigationProp } from "@react-navigation/stack"
import { useSelector } from "react-redux"
import { RootState } from "../../redux/Store"
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
    const user = useSelector((state: RootState) => state.auth.user)

    const [searchQuery, setSearchQuery] = useState("")
    const [filterValue, setFilterValue] = useState("all")

    // ⭐ IMPORTANT — useRef guard to stop infinite API calls
    const adminChatCreatedRef = useRef(false)

    const userId = user?.id || user?.user_id || user?.user?.id

    const {
        data: chatListData,
        isLoading,
        refetch,
        isSuccess,
    } = useGetChatListQuery(
        { user_id: userId },
        { skip: !userId }
    )

    const [createAdminChat] = useCreateAdminChatMutation()

    // ⭐ Create admin chat ONLY once if not exists
    useEffect(() => {
        if (!isSuccess || !chatListData?.data || adminChatCreatedRef.current) return

        const hasAdminChat = chatListData.data.some(
            (chat: IChatCard) => chat.user_role === "admin"
        )

        if (!hasAdminChat) {
            adminChatCreatedRef.current = true

            createAdminChat({ user_id: userId })
                .unwrap()
                .then(() => {
                    refetch()
                })
                .catch(() => {
                    // allow retry if failed
                    adminChatCreatedRef.current = false
                })
        }
    }, [isSuccess, chatListData, userId])

    const chatList = useMemo(() => {
        let list: IChatCard[] = chatListData?.data || []

        // Put admin chat on top
        list = [...list].sort((a, b) => {
            if (a.user_role === "admin" && b.user_role !== "admin") return -1
            if (a.user_role !== "admin" && b.user_role === "admin") return 1
            return 0
        })

        // Filter by dropdown
        if (filterValue !== "all") {
            list = list.filter(chat => chat.user_role === filterValue)
        }

        // Filter by search
        if (searchQuery.trim()) {
            list = list.filter(chat =>
                chat.name?.toLowerCase().includes(searchQuery.toLowerCase())
            )
        }

        return list
    }, [chatListData, filterValue, searchQuery])

    const handleChatPress = useCallback((chat: IChatCard) => {
        navigation.navigate(ROUTES.CHAT_DETAIL as never, {
            chatId: chat.id,
            name: chat.name,
            image: chat.image,
            user_role: chat.user_role,
        } as never)
    }, [navigation])

    if (isLoading) {
        return <ScreenLoader />
    }

    return (
        <Wrapper bottom_bar>
            {/* Header */}
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
                            onChangeText={(item: any) =>
                                setFilterValue(item.value)
                            }
                            height={35}
                        />
                    </View>
                </Row>
            </View>

            {/* List */}
            <FlatList
                data={chatList}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => (
                    <ChatCard
                        {...item}
                        onPress={() => handleChatPress(item)}
                    />
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