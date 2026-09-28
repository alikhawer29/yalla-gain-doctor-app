import { FlatList, Modal, RefreshControl, TouchableWithoutFeedback, View } from "react-native"
import images from "../../assets/images"
import ServiceCard from "../../components/Cards/ServiceCard"
import Empty from "../../components/Empty"
import Icon from "../../components/Icon"
import Input from "../../components/Input"
import Row from "../../components/Row"
import Seperator from "../../components/Seperator"
import Text from "../../components/Text"
import Touchable from "../../components/Touchable"
import Wrapper from "../../components/Wrapper"
import Button from "../../components/Button"
import colors from "../../utils/colors"
import { REQUEST_STATUSES } from "../../utils/data"
import { heightPixel, widthPixel } from "../../utils/helper"
import globalStyles from "../../utils/styles"
import useAppointmentRequests from "./useAppointmentRequests"
import styles from "./styles"

const AppointmentRequests = () => {

    const {
        values: {
            data,
            isLoading,
            search,
            selected,
            filterModalVisible,
            fromDate,
            toDate,
        },
        functions: {
            onReload,
            onPressCard,
            onSearch,
            onChangeStatus,
            toggleFilterModal,
            setFromDate,
            setToDate,
            onApplyFilters,
            onClearFilters,
        }
    } = useAppointmentRequests()

    return (
        <Wrapper>
            <View style={{ gap: heightPixel(10) }}>
                <Row align="center" gap={10}>
                    <View style={{ width: "85%" }}>
                        <Input
                            placeholder="Search Appointment"
                            height={40}
                            icon={images.search}
                            value={search}
                            onChangeText={onSearch}
                        />
                    </View>
                    <View style={{ width: "15%" }}>
                        <Icon source={images.filters} size={40} rounded less_rounded border={colors.white} onPress={toggleFilterModal} />
                    </View>
                </Row>
                <View>
                    <FlatList
                        horizontal
                        data={REQUEST_STATUSES}
                        ItemSeparatorComponent={() => <Seperator horizontal />}
                        showsHorizontalScrollIndicator={false}
                        renderItem={({ item }) => (
                            <Touchable onPress={() => onChangeStatus(item?.value)} style={{ borderRadius: heightPixel(4), borderWidth: 1, borderColor: item?.value === selected ? colors.primary : colors.dark_gray, backgroundColor: item?.value === selected ? colors.primary : colors.transparent, justifyContent: "center", alignItems: "center", paddingHorizontal: widthPixel(20), paddingVertical: heightPixel(5) }}>
                                <Text size={10} color={item?.value === selected ? colors.white : colors.dark_gray}>{item?.label}</Text>
                            </Touchable>
                        )}
                    />
                </View>
            </View>
            <FlatList
                data={data}
                keyExtractor={item => item?.id?.toString()}
                showsVerticalScrollIndicator={false}
                ItemSeparatorComponent={() => <Seperator />}
                refreshControl={<RefreshControl refreshing={isLoading} onRefresh={onReload} />}
                contentContainerStyle={globalStyles.bottom_scrollable_space}
                ListEmptyComponent={() =>
                    isLoading ? null : <Empty message="No Request Found" />
                }
                renderItem={({ item }) => (<ServiceCard data={item} onPress={() => onPressCard(item?.id)} />)}
                style={{ marginTop: heightPixel(15) }}
            />

            {/* Filter Modal */}
            <Modal
                visible={filterModalVisible}
                transparent
                animationType="slide"
                onRequestClose={toggleFilterModal}
            >
                <TouchableWithoutFeedback onPress={toggleFilterModal}>
                    <View style={styles.modal_overlay}>
                        <TouchableWithoutFeedback>
                            <View style={styles.modal_content}>
                                <Row align="center" gap={10} style={{ marginBottom: heightPixel(20) }}>
                                    <Icon source={images.back} size={24} onPress={toggleFilterModal} />
                                    <Text size={18} weight="semibold">Filter By</Text>
                                </Row>

                                <Text weight="semibold" style={{ marginBottom: heightPixel(10) }}>Filter By Date</Text>
                                <Input
                                    label="From"
                                    placeholder="MM/DD/YYYY"
                                    type="date"
                                    value={fromDate}
                                    onChangeText={setFromDate}
                                />
                                <View style={{ marginTop: heightPixel(15) }}>
                                    <Input
                                        label="To"
                                        placeholder="MM/DD/YYYY"
                                        type="date"
                                        value={toDate}
                                        onChangeText={setToDate}
                                    />
                                </View>

                                <Row gap={15} style={{ marginTop: heightPixel(30) }}>
                                    <View style={{ flex: 1 }}>
                                        <Button text="APPLY" onPress={onApplyFilters} />
                                    </View>
                                    <View style={{ flex: 1 }}>
                                        <Button text="CLEAR" type="outlined" onPress={onClearFilters} />
                                    </View>
                                </Row>
                            </View>
                        </TouchableWithoutFeedback>
                    </View>
                </TouchableWithoutFeedback>
            </Modal>
        </Wrapper>
    )
}

export default AppointmentRequests