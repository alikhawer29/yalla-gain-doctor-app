import React from "react"
import { View } from "react-native"
import Wrapper from "../../components/Wrapper"
import Image from "../../components/Image"
import Text from "../../components/Text"
import Button from "../../components/Button"
import images from "../../assets/images"
import styles from "./styles"
import colors from "../../utils/colors"
import useWalletController from "./useWalletController"

const Wallet = () => {
    const { walletData, isWalletLoading, handleWithdraw } = useWalletController()

    return (
        <Wrapper bottom_bar loading={isWalletLoading}>
            <View style={styles.container}>
                <Image source={images.coin} style={styles.coinImage} resize="contain" />
                
                <Text size={22} weight="bold" color={colors.white} style={styles.title}>
                    My Coins : {walletData?.my_coins || "0"} <Text color={colors.white} weight="regular" size={16}>(Yalla Coins)</Text>
                </Text>

                <Text size={18} weight="semibold" color={colors.white} style={styles.subtitle}>
                    Total Amount In Wallet $ {walletData?.my_coins || "0"}
                </Text>

                <View style={{ marginTop: 50 }}>
                    <Text size={16} color={colors.white}>
                        1 Yalla Coin Is Equal To {walletData?.coin_amount || "1"}$
                    </Text>
                </View>

                <Button text="Withdraw Amount" onPress={handleWithdraw} style={styles.button} />
            </View>
        </Wrapper>
    )
}

export default Wallet
