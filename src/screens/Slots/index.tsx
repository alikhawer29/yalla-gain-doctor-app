import { useRoute } from "@react-navigation/native";
import React, { useEffect, useState } from "react";
import { FlatList, TouchableOpacity, View } from "react-native";
import images from "../../assets/images";
import Button from "../../components/Button";
import CardWrapper from "../../components/CardWrapper";
import Checkbox from "../../components/Checkbox";
import Icon from "../../components/Icon";
import Input from "../../components/Input";
import Row from "../../components/Row";
import Seperator from "../../components/Seperator";
import Text from "../../components/Text";
import Wrapper from "../../components/Wrapper";
import { useModal } from "../../contexts/ModalContext";
import { useGetServiceSlotsQuery, useUpdateServiceSlotsMutation } from "../../redux/Apis/User";
import colors from "../../utils/colors";
import { heightPixel, timeFormatter, timeToISOString, widthPixel } from "../../utils/helper";
import { goBack } from "../../utils/navigation";

const INITIAL_SLOTS = [
    { day: "Monday", enabled: false, slots: [{ start_time: "", end_time: "" }] },
    { day: "Tuesday", enabled: false, slots: [{ start_time: "", end_time: "" }] },
    { day: "Wednesday", enabled: false, slots: [{ start_time: "", end_time: "" }] },
    { day: "Thursday", enabled: false, slots: [{ start_time: "", end_time: "" }] },
    { day: "Friday", enabled: false, slots: [{ start_time: "", end_time: "" }] },
    { day: "Saturday", enabled: false, slots: [{ start_time: "", end_time: "" }] },
    { day: "Sunday", enabled: false, slots: [{ start_time: "", end_time: "" }] },
];

const parseTimeToMinutes = (time) => {
    if (!time) return 0;

    if (time.includes("T")) {
        const date = new Date(time);
        return date.getHours() * 60 + date.getMinutes();
    }

    const [hours, minutes] = time.split(":").map(Number);
    return hours * 60 + minutes;
}

const SlotCard = ({ data, index, onToggleDay, onChangeSlot, onAddSlot, onRemoveSlot, errors }) => {
    return (
        <CardWrapper color={colors.blackish_gray} padding={20}>
            <View style={{ gap: heightPixel(15) }}>
                <Row align="center" justify="space-between">
                    <Text weight="semibold">{data.day}</Text>
                    <Checkbox checked={data.enabled} onPress={() => onToggleDay(index)} />
                </Row>

                {data.slots.map((slot, slotIndex) => {
                    const slotError = errors[index]?.[slotIndex];
                    return (
                        <View key={slotIndex} style={{ gap: heightPixel(8) }}>
                            <Row justify="space-between" align="center">
                                <View style={{ width: "48%" }}>
                                    <Input
                                        type="time"
                                        placeholder="[Hours]:[Minute]"
                                        value={slot.start_time}
                                        onChangeText={(text) =>
                                            onChangeSlot(index, slotIndex, "start_time", text)
                                        }
                                    />
                                </View>
                                <View style={{ width: "48%" }}>
                                    <Input
                                        type="time"
                                        placeholder="[Hours]:[Minute]"
                                        value={slot.end_time}
                                        onChangeText={(text) =>
                                            onChangeSlot(index, slotIndex, "end_time", text)
                                        }
                                    />
                                </View>
                            </Row>

                            {slotError?.message ? (
                                <Text size={12} color={colors.danger}>
                                    {slotError.message}
                                </Text>
                            ) : null}

                            {slotIndex >= data.slots.length - 1 ? (
                                <Row
                                    style={{
                                        borderColor: colors.gray,
                                        borderWidth: 1,
                                        paddingVertical: heightPixel(8),
                                        paddingHorizontal: widthPixel(15),
                                        borderRadius: heightPixel(200),
                                        width: "30%",
                                        alignSelf: "flex-end",
                                    }}
                                    justify="space-between"
                                    align="center"
                                >
                                    <TouchableOpacity onPress={() => onAddSlot(index)}>
                                        <Icon source={images.plus_green} size={14} />
                                    </TouchableOpacity>
                                    <View style={{ backgroundColor: colors.gray, width: 1, height: "100%" }} />
                                    <TouchableOpacity onPress={() => onRemoveSlot(index, slotIndex)}>
                                        <Icon source={images.trash} size={14} tint_color={colors.danger} />
                                    </TouchableOpacity>
                                </Row>
                            ) : (
                                <TouchableOpacity onPress={() => onRemoveSlot(index, slotIndex)}>
                                    <Icon
                                        source={images.trash}
                                        rounded
                                        less_padding
                                        tint_color={colors.danger}
                                        border={colors.gray}
                                        size={30}
                                    />
                                </TouchableOpacity>
                            )}
                        </View>
                    );
                })}
            </View>
        </CardWrapper>
    );
};

const Slots = () => {

    const [slotsData, setSlotsData] = useState(INITIAL_SLOTS);
    const [errors, setErrors] = useState<any>({});

    const validateSlot = (start: string, end: string) => {


        const startMin = parseTimeToMinutes(start);
        const endMin = parseTimeToMinutes(end);

        if (!start || !end) return null;
        if (endMin <= startMin)
            return "End time must be after start time.";
        if (endMin - startMin < 30)
            return "Slot must be at least 30 minutes long.";
        return null;
    };

    const formatTime = (time: string) => {
        if (!time) return "";

        if (time.includes("T")) {
            const date = new Date(time);
            const hh = String(date.getHours()).padStart(2, "0");
            const mm = String(date.getMinutes()).padStart(2, "0");
            return `${hh}:${mm}:00`;
        }

        const [hh, mm] = time.split(":");
        return `${hh.padStart(2, "0")}:${mm.padStart(2, "0")}:00`;
    };

    const handleToggleDay = (dayIndex) => {
        setSlotsData((prev) =>
            prev.map((item, i) =>
                i === dayIndex ? { ...item, enabled: !item.enabled } : item
            )
        );
    };

    const handleChangeSlot = (dayIndex, slotIndex, key, value) => {
        setSlotsData((prev) => {
            const updated = [...prev];
            updated[dayIndex].slots[slotIndex][key] = value;
            updated[dayIndex].enabled = true;

            const { start_time, end_time } = updated[dayIndex].slots[slotIndex];
            const errorMsg = validateSlot(start_time, end_time);

            setErrors((prevErr) => {
                const updatedErr = { ...prevErr };
                const dayErrors = [...(updatedErr[dayIndex] || [])];

                dayErrors[slotIndex] = errorMsg
                    ? {
                        start: key === "start_time",
                        end: key === "end_time",
                        message: errorMsg,
                    }
                    : {};

                updatedErr[dayIndex] = dayErrors;
                return updatedErr;
            });

            return updated;
        });
    };

    const handleAddSlot = (dayIndex) => {
        setSlotsData((prev) => {
            const updated = [...prev];
            updated[dayIndex].slots.push({ start_time: "", end_time: "" });
            return updated;
        });
    };

    const handleRemoveSlot = (dayIndex, slotIndex) => {
        setSlotsData((prev) => {
            const updated = [...prev];
            if (updated[dayIndex].slots.length > 1) {
                updated[dayIndex].slots.splice(slotIndex, 1);
            } else {
                updated[dayIndex].slots[0] = { start_time: "", end_time: "" };
                updated[dayIndex].enabled = false;
                setErrors((prevErr) => {
                    const updatedErr = { ...prevErr };
                    if (updatedErr[dayIndex]) {
                        updatedErr[dayIndex][0] = {};
                    }
                    return updatedErr;
                });
            }
            return updated;
        });
    };

    const { params } = useRoute()

    const { showOkModal } = useModal()
    const { data, isLoading: isGettingSlotsLoading } = useGetServiceSlotsQuery(params?.id, { skip: !params?.id })
    const [submit, { isLoading, isSuccess }] = useUpdateServiceSlotsMutation()

    useEffect(() => {
        if (data && data?.data?.length) {
            const apiSlots = data.data;

            const mappedSlots = INITIAL_SLOTS.map((dayItem) => {
                const daySlots = apiSlots.filter(
                    (slot) => slot.day.toLowerCase() === dayItem.day.toLowerCase()
                );

                if (daySlots.length) {
                    return {
                        ...dayItem,
                        enabled: true,
                        slots: daySlots.map((item) => ({
                            start_time: item?.start_time ? timeToISOString(item?.start_time) : "",
                            end_time: item?.end_time ? timeToISOString(item?.end_time) : "",
                        })),
                    };
                } else {
                    return dayItem;
                }
            });

            setSlotsData(mappedSlots);
        }
    }, [data]);

    useEffect(() => {
        if (isSuccess) {
            showOkModal({ type: "success", title: "Successfully", message: "Slots Has Been Saved Successfully!" }, () => goBack(), () => goBack())
        }
    }, [isSuccess])

    const handleSubmit = () => {

        const formData = new FormData();
        let count = 0;

        slotsData.forEach((day) => {
            if (!day.enabled) return;

            day.slots.forEach((slot) => {
                if (!slot.start_time || !slot.end_time) return;

                formData.append(`slots[${count}][day]`, day.day.toLowerCase());
                formData.append(`slots[${count}][start_time]`, formatTime(slot.start_time));
                formData.append(`slots[${count}][end_time]`, formatTime(slot.end_time));

                count++;
            })
        })

        if (params?.onAdd) {
            params.onAdd && params.onAdd(formData);
            goBack()
        } else {
            submit({
                id: params?.id,
                body: formData
            });
        }

        setSlotsData(INITIAL_SLOTS)

    };

    return (
        <Wrapper loading={isGettingSlotsLoading}>
            <FlatList
                data={slotsData}
                showsVerticalScrollIndicator={false}
                ItemSeparatorComponent={() => <Seperator />}
                keyExtractor={(item) => item.day}
                renderItem={({ item, index }) => (
                    <SlotCard
                        data={item}
                        index={index}
                        onToggleDay={handleToggleDay}
                        onChangeSlot={handleChangeSlot}
                        onAddSlot={handleAddSlot}
                        onRemoveSlot={handleRemoveSlot}
                        errors={errors}
                    />
                )}
                ListFooterComponent={() => <Button text="Save Slots" onPress={handleSubmit} loading={isLoading} />}
                ListFooterComponentStyle={{ marginVertical: heightPixel(30) }}
            />
        </Wrapper>
    );
};

export default Slots;
