import React from "react"
import { RefreshControl, View } from "react-native"
import Wrapper from "../../components/Wrapper"
import Image from "../../components/Image"
import Text from "../../components/Text"
import Button from "../../components/Button"
import images from "../../assets/images"
import styles from "./styles"
import colors from "../../utils/colors"
import useWalletController from "./useWalletController"

const Wallet = () => {
    const {
        walletData,
        availableAed,
        balanceCurrency,
        isWalletLoading,
        refreshing,
        onRefreshWallet,
        handleWithdraw,
        handleManageBeneficiaries,
        handleTransactionLogs,
    } = useWalletController()

    const pending =
        walletData?.pending_balance != null && walletData.pending_balance !== ""
            ? Number(walletData.pending_balance)
            : null
    const pendingLabel =
        pending != null && Number.isFinite(pending)
            ? `${balanceCurrency} ${pending.toFixed(2)}`
            : null

    return (
        <Wrapper
            bottom_bar
            scrollable
            loading={isWalletLoading}
            refreshControl={
                <RefreshControl
                    refreshing={refreshing}
                    onRefresh={onRefreshWallet}
                    tintColor={colors.primary}
                />
            }
        >
            <View style={styles.container}>
                <Image source={images.coin} style={styles.coinImage} resize="contain" />

                <Text size={22} weight="bold" color={colors.white} style={styles.title}>
                    Available balance
                </Text>
                <Text size={26} weight="bold" color={colors.white} style={styles.subtitle}>
                    {balanceCurrency} {availableAed.toFixed(2)}
                </Text>

                {pendingLabel != null ? (
                    <Text size={14} color={colors.icon_gray} style={styles.pendingLine}>
                        Pending: {pendingLabel}
                    </Text>
                ) : null}

                <Text size={18} weight="semibold" color={colors.white} style={styles.coinsLine}>
                    Coins balance: {walletData?.my_coins != null ? String(walletData.my_coins) : "0"}{" "}
                    <Text color={colors.white} weight="regular" size={14}>
                        (Yalla Coins)
                    </Text>
                </Text>

                <View style={styles.rateBox}>
                    <Text size={15} color={colors.white}>
                        1 Yalla Coin = {String(walletData?.coin_amount ?? "1")} {balanceCurrency}
                    </Text>
                </View>

                <Button text="Withdraw" onPress={handleWithdraw} style={styles.button} />
                <Button
                    text="View Transactions"
                    onPress={handleTransactionLogs}
                    type="outlined"
                    style={styles.buttonOutlined}
                />
                <Button
                    text="Manage Beneficiaries"
                    onPress={handleManageBeneficiaries}
                    type="outlined"
                    style={styles.buttonOutlined}
                />
            </View>
        </Wrapper>
    )
}

export default Wallet
