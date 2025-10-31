import { memo } from "react"
import { View } from "react-native"
import Row from "../Row"
import Text from "../Text"
import styles from "./styles"

const RatingBreakdown = ({ data }) => {
    return (
        <View style={styles.container}>
            {[
                { label: "5 star", percent: data?.fiveStarPercent, flex: 0.85 },
                { label: "4 star", percent: data?.fourStarPercent, flex: 0.75 },
                { label: "3 star", percent: data?.threeStarPercent, flex: 0.65 },
                { label: "2 star", percent: data?.twoStarPercent, flex: 0.55 },
                { label: "1 star", percent: data?.oneStarPercent, flex: 0.45 },
            ].map((item, index) => (
                <Row key={index} align="center">
                    <View style={styles.label_wrapper}>
                        <Text>{item.label}</Text>
                    </View>
                    <View style={[styles.bar_wrapper, { flex: item.flex }]}>
                        <View style={styles.bar_background}>
                            <View
                                style={[
                                    styles.bar_fill,
                                    { width: `${item.percent || 0}%` },
                                ]}
                            />
                        </View>
                    </View>
                </Row>
            ))}

            <View style={styles.rating_summary}>
                <Text size={35} line_height={36}>
                    {data?.averageRating}
                    <Text size={20}>
                        {" "}
                        / 5{" "}
                        <Text size={16}>({data?.totalCount || 0})</Text>
                    </Text>
                </Text>
            </View>
        </View>
    )
}

export default memo(RatingBreakdown)