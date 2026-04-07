import React, { useState } from "react"
import { View, FlatList, TouchableOpacity } from "react-native"
import Wrapper from "../../components/Wrapper"
import Text from "../../components/Text"
import Row from "../../components/Row"
import Icon from "../../components/Icon"
import images from "../../assets/images"
import styles from "./styles"
import colors from "../../utils/colors"
import { widthPixel } from "../../utils/helper"
import FilterModal from "./FilterModal"

const DATA = [
    { id: "123456", date: "01/01/2026", amount: "10", commission: "05", payment_date: "01/01/2026", payment_amount: "15", tip: "05" },
    { id: "123457", date: "01/01/2026", amount: "10", commission: "05", payment_date: "01/01/2026", payment_amount: "15", tip: "05" },
    { id: "123458", date: "01/01/2026", amount: "10", commission: "05", payment_date: "01/01/2026", payment_amount: "15", tip: "05" },
    { id: "123459", date: "01/01/2026", amount: "10", commission: "05", payment_date: "01/01/2026", payment_amount: "15", tip: "05" },
]

const PaymentLogs = () => {
    const [filterVisible, setFilterVisible] = useState(false)

    const renderItem = ({ item }: any) => {
        const Coin = ({ label, value }: { label: string, value: string }) => (
            <View style={styles.cardItem}>
                <Text color={colors.white} size={13} weight="regular">{label} : <Text color={colors.white} weight="bold">{value}</Text></Text>
            </View>
        )

        const CoinWithIcon = ({ label, value }: { label: string, value: string }) => (
            <View style={styles.cardItem}>
                <View style={styles.coinRow}>
                    <Text color={colors.white} size={13} weight="regular">{label} : <Text color={colors.white} weight="bold">{value} Coins</Text></Text>
                    <Icon source={images.coin} size={13} />
                </View>
            </View>
        )

        return (
            <View style={styles.card}>
                <View style={styles.cardRow}>
                    <Coin label="Booking Id" value={`#${item.id}`} />
                </View>
                <View style={styles.cardRow}>
                    <Coin label="Booking Date" value={item.date} />
                    <CoinWithIcon label="Booking Amount" value={item.amount} />
                </View>
                <View style={styles.cardRow}>
                    <Coin label="Payment Date" value={item.payment_date} />
                    <CoinWithIcon label="Commission" value={item.commission} />

                </View>
                <View style={styles.cardRow}>
                    <CoinWithIcon label="Tip" value={item.tip} />
                    <CoinWithIcon label="Payment Amount" value={item.payment_amount} />
                </View>
            </View>
        )
    }

    return (
        <Wrapper>
            <View style={styles.container}>
                <View style={styles.headerRow}>
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 5 }}>
                        <Text color={colors.white} size={18}>Total Earnings: <Text color={colors.white} weight="bold">100 Yalla Coins</Text></Text>
                        <Icon source={images.coin} size={18} />
                    </View>
                    <TouchableOpacity style={styles.filterBtn} onPress={() => setFilterVisible(true)}>
                        <Icon source={images.filters} size={20} />
                    </TouchableOpacity>
                </View>

                <FlatList
                    data={DATA}
                    renderItem={renderItem}
                    keyExtractor={(item) => item.id}
                    showsVerticalScrollIndicator={false}
                />
            </View>

            <FilterModal isVisible={filterVisible} onClose={() => setFilterVisible(false)} />
        </Wrapper>
    )
}

export default PaymentLogs
