import { useState } from "react"
import { FlatList, RefreshControl, View } from "react-native"
import images from "../../assets/images"
import Button from "../../components/Button"
import CardWrapper from "../../components/CardWrapper"
import Image from "../../components/Image"
import Input from "../../components/Input"
import Seperator from "../../components/Seperator"
import Text from "../../components/Text"
import Wrapper from "../../components/Wrapper"
import colors from "../../utils/colors"
import { heightPixel, widthPixel } from "../../utils/helper"
import { navigate } from "../../utils/navigation"
import { ROUTES } from "../../utils/routes"
import useCategoriesController from "./useCategoriesController"

const Categories = () => {

    const {
        values: {
            data,
            isLoading
        },
        functions: {
            onReload
        }
    } = useCategoriesController()

    const [selected, setSelected] = useState<number | null>(null)

    const onPressCard = (id: number) => {
        setSelected(id)
    }

    const onPressNext = () => {
        if (selected) {
            navigate(ROUTES.ADD_SERVICE, { id: selected })
        }
    }

    return (
        <Wrapper>
            <View style={{ width: "100%", marginBottom: heightPixel(10 + 7.5), gap: heightPixel(10) }}>
                <Input
                    placeholder="Search Service"
                    height={40}
                    icon={images.search}
                // value={search}
                // onChangeText={onSearch}
                />
                <Text size={20} weight="semibold">Choose Service Category</Text>
            </View>
            <FlatList
                data={data}
                numColumns={2}
                columnWrapperStyle={{ justifyContent: "space-between" }}
                ItemSeparatorComponent={() => <Seperator />}
                refreshControl={<RefreshControl refreshing={isLoading} onRefresh={onReload} />}
                renderItem={({ item }) => (
                    <CardWrapper onPress={() => onPressCard(item.id)} height={179} width={"48.7%"} color={colors.grayish_black} border_radius={5} padding={8} border border_color={selected === item.id ? colors.white : colors.transparent} >
                        <View style={{ flex: 0.8 }}>
                            <Image source={{ uri: item?.image }} resize="cover" style={{ borderRadius: heightPixel(5) }} />
                        </View>
                        <View style={{ flex: 0.2, justifyContent: "center", paddingLeft: widthPixel(5) }}>
                            <Text size={16} weight="semibold" lines={1}>{item?.title}</Text>
                        </View>
                    </CardWrapper>
                )}
            />
            <Button text="Next" onPress={onPressNext} />
        </Wrapper>
    )
}

export default Categories