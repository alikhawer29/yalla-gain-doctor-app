import React, { useState } from "react"
import { View, FlatList, TouchableOpacity, Image, LayoutAnimation, Platform, UIManager } from "react-native"
import Wrapper from "../../components/Wrapper"
import Text from "../../components/Text"
import Row from "../../components/Row"
import Icon from "../../components/Icon"
import images from "../../assets/images"
import colors from "../../utils/colors"
import { heightPixel, widthPixel } from "../../utils/helper"
import { useGetFaqsQuery } from "../../redux/Apis/User"

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
}

const FAQ = () => {
    const { data, isLoading, refetch } = useGetFaqsQuery(undefined)
    const [expandedIds, setExpandedIds] = useState<number[]>([])

    const toggleExpand = (id: number) => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut)
        setExpandedIds((prev) => 
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        )
    }

    const renderItem = ({ item }: any) => {
        const isExpanded = expandedIds.includes(item.id)
        return (
            <View style={{ marginBottom: 15, borderRadius: 15, backgroundColor: colors.black, borderWidth: 1, borderColor: colors.white + "20" }}>
                <TouchableOpacity onPress={() => toggleExpand(item.id)} activeOpacity={0.7} style={{ padding: 15, flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                    <Text color={colors.white} weight="semibold" style={{ flex: 1 }}>{item.question}</Text>
                    <Icon source={images.right_arrow} size={15} style={{ transform: [{ rotate: isExpanded ? "90deg" : "0deg" }] }} />
                </TouchableOpacity>

                {isExpanded && (
                    <View style={{ padding: 15, paddingTop: 0 }}>
                        {item.image && (
                            <Image
                                source={{ uri: item.image }}
                                style={{ width: "100%", height: heightPixel(150), borderRadius: 10, marginBottom: 10 }}
                                resizeMode="cover"
                            />
                        )}
                        <Text color={colors.white + "80"} size={14} style={{ lineHeight: 20 }}>{item.answer}</Text>
                        <Text color={colors.white + "40"} size={12} style={{ marginTop: 10 }}>{item.created_at}</Text>
                    </View>
                )}
            </View>
        )
    }

    return (
        <Wrapper>
            <View style={{ paddingHorizontal: widthPixel(20), paddingTop: 10, flex: 1 }}>
                <FlatList
                    data={data?.data || []}
                    renderItem={renderItem}
                    keyExtractor={(item) => item.id.toString()}
                    showsVerticalScrollIndicator={false}
                    onRefresh={refetch}
                    refreshing={isLoading}
                    ListEmptyComponent={
                        !isLoading ? (
                            <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
                                <Text color={colors.white}>No FAQs Available</Text>
                            </View>
                        ) : null
                    }
                />
            </View>
        </Wrapper>
    )
}

export default FAQ
