import { RouteProp, useFocusEffect, useRoute } from "@react-navigation/native";
import React, { useCallback, useEffect, useRef, useState } from "react";
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
import { getDeviceTimezone } from "../../utils/device";
import {
    formatTime,
    heightPixel,
    slotUtcToPickerValue,
    wallClockToPickerValue,
    widthPixel,
} from "../../utils/helper";
import { AppStackParamList } from "../../interfaces";
import { goBack, navigateBackToServiceDetails } from "../../utils/navigation";

type SlotEntry = { start_time: string; end_time: string };
type DayEntry = { day: string; enabled: boolean; slots: SlotEntry[] };
type SlotError = { start?: boolean; end?: boolean; message?: string };

const INITIAL_SLOTS: DayEntry[] = [
    { day: "Monday", enabled: false, slots: [{ start_time: "", end_time: "" }] },
    { day: "Tuesday", enabled: false, slots: [{ start_time: "", end_time: "" }] },
    { day: "Wednesday", enabled: false, slots: [{ start_time: "", end_time: "" }] },
    { day: "Thursday", enabled: false, slots: [{ start_time: "", end_time: "" }] },
    { day: "Friday", enabled: false, slots: [{ start_time: "", end_time: "" }] },
    { day: "Saturday", enabled: false, slots: [{ start_time: "", end_time: "" }] },
    { day: "Sunday", enabled: false, slots: [{ start_time: "", end_time: "" }] },
];

const cloneInitialSlots = (): DayEntry[] =>
    INITIAL_SLOTS.map((day) => ({
        ...day,
        slots: day.slots.map((slot) => ({ ...slot })),
    }));

const parseTimeToMinutes = (time: string) => {
    if (!time) return 0;

    if (time.includes("T")) {
        const date = new Date(time);
        return date.getHours() * 60 + date.getMinutes();
    }

    const [hours, minutes] = time.split(":").map(Number);
    return hours * 60 + minutes;
};

const doSlotsOverlap = (
    a: { start: number; end: number },
    b: { start: number; end: number },
) => a.start < b.end && b.start < a.end;

const validateSlot = (start: string, end: string): string | null => {
    const startMin = parseTimeToMinutes(start);
    const endMin = parseTimeToMinutes(end);

    if (!start || !end) return null;
    if (endMin <= startMin) return "End time must be after start time.";
    if (endMin - startMin < 30) return "Slot must be at least 30 minutes long.";
    return null;
};

const getDayErrors = (slots: SlotEntry[]): SlotError[] =>
    slots.map((slot, slotIndex) => {
        const basicError = validateSlot(slot.start_time, slot.end_time);
        if (basicError) return { message: basicError };
        if (!slot.start_time || !slot.end_time) return {};

        const startMin = parseTimeToMinutes(slot.start_time);
        const endMin = parseTimeToMinutes(slot.end_time);

        const overlaps = slots.some((other, otherIndex) => {
            if (otherIndex === slotIndex || !other.start_time || !other.end_time) return false;
            const otherStart = parseTimeToMinutes(other.start_time);
            const otherEnd = parseTimeToMinutes(other.end_time);
            return doSlotsOverlap(
                { start: startMin, end: endMin },
                { start: otherStart, end: otherEnd },
            );
        });

        return overlaps ? { message: "This time overlaps another slot." } : {};
    });

const validateAllDays = (days: DayEntry[]) => {
    const allErrors: Record<number, SlotError[]> = {};
    let hasError = false;

    days.forEach((day, dayIndex) => {
        if (!day.enabled) return;

        const dayErrors = getDayErrors(day.slots);
        if (dayErrors.some((e) => e?.message)) {
            allErrors[dayIndex] = dayErrors;
            hasError = true;
        }
    });

    return { hasError, allErrors };
};

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

    const slotTimezone = getDeviceTimezone();

    const [slotsData, setSlotsData] = useState<DayEntry[]>(() => cloneInitialSlots());
    const [errors, setErrors] = useState<Record<number, SlotError[]>>({});
    const [autoFillForWeek, setAutoFillForWeek] = useState(false);

    const handleToggleDay = (dayIndex: number) => {
        setSlotsData((prev) => {
            const newState = !prev[dayIndex].enabled;

            if (autoFillForWeek && dayIndex === 0) {
                return prev.map((item) => ({ ...item, enabled: newState }));
            }

            if (autoFillForWeek && dayIndex !== 0) {
                setAutoFillForWeek(false);
            }

            return prev.map((item, i) =>
                i === dayIndex ? { ...item, enabled: newState } : item
            );
        });
    };

    const handleChangeSlot = (
        dayIndex: number,
        slotIndex: number,
        key: "start_time" | "end_time",
        value: string,
    ) => {
        if (autoFillForWeek && dayIndex !== 0) {
            setAutoFillForWeek(false);
        }

        setSlotsData((prev) => {
            let updated = prev.map((day, i) => {
                if (i !== dayIndex) return day;
                return {
                    ...day,
                    enabled: true,
                    slots: day.slots.map((slot, si) =>
                        si === slotIndex ? { ...slot, [key]: value } : { ...slot },
                    ),
                };
            });

            if (autoFillForWeek && dayIndex === 0) {
                const mondaySlots = updated[0].slots.map((s) => ({ ...s }));
                updated = updated.map((day, i) =>
                    i === 0
                        ? day
                        : { ...day, enabled: true, slots: mondaySlots.map((s) => ({ ...s })) },
                );
            }

            const activeDayIndices =
                autoFillForWeek && dayIndex === 0 ? [0, 1, 2, 3, 4, 5, 6] : [dayIndex];

            setErrors((prevErr) => {
                const updatedErr = { ...prevErr };
                activeDayIndices.forEach((dIdx) => {
                    updatedErr[dIdx] = getDayErrors(updated[dIdx].slots);
                });
                return updatedErr;
            });

            return updated;
        });
    };

    const handleAddSlot = (dayIndex: number) => {
        if (autoFillForWeek && dayIndex !== 0) {
            setAutoFillForWeek(false);
        }

        setSlotsData((prev) => {
            const applyToAll = autoFillForWeek && dayIndex === 0;
            return prev.map((day, i) => {
                const shouldAdd = applyToAll || i === dayIndex;
                if (!shouldAdd) return day;
                return {
                    ...day,
                    slots: [...day.slots, { start_time: "", end_time: "" }],
                };
            });
        });
    };

    const handleRemoveSlot = (dayIndex: number, slotIndex: number) => {
        const applyToAll = autoFillForWeek && dayIndex === 0;
        const applyToIndices = applyToAll ? [0, 1, 2, 3, 4, 5, 6] : [dayIndex];

        if (autoFillForWeek && dayIndex !== 0) {
            setAutoFillForWeek(false);
        }

        setSlotsData((prev) => {
            const updated = prev.map((day, i) => {
                if (!applyToIndices.includes(i)) return day;

                if (day.slots.length > 1) {
                    return {
                        ...day,
                        slots: day.slots.filter((_, si) => si !== slotIndex),
                    };
                }

                return {
                    ...day,
                    enabled: false,
                    slots: [{ start_time: "", end_time: "" }],
                };
            });

            setErrors((prevErr) => {
                const updatedErr = { ...prevErr };
                applyToIndices.forEach((dIdx) => {
                    updatedErr[dIdx] = getDayErrors(updated[dIdx].slots);
                });
                return updatedErr;
            });

            return updated;
        });
    };

    const handleAutoFillToggle = () => {
        setAutoFillForWeek((prev) => {
            const newValue = !prev;
            if (newValue) {
                setSlotsData((prevSlots) => {
                    const mondayData = prevSlots[0];
                    return prevSlots.map((day, i) =>
                        i === 0
                            ? day
                            : {
                                ...day,
                                enabled: mondayData.enabled,
                                slots: mondayData.slots.map((s) => ({ ...s })),
                            },
                    );
                });

                setErrors((prevErr) => {
                    const updatedErr = { ...prevErr };
                    const mondayErrors = prevErr[0] || [];
                    [1, 2, 3, 4, 5, 6].forEach((i) => {
                        updatedErr[i] = mondayErrors.map((e) => ({ ...e }));
                    });
                    return updatedErr;
                });
            }
            return newValue;
        });
    };

    const { params } = useRoute<RouteProp<AppStackParamList, 'Slots'>>();
    const isAddServiceFlow = Boolean(params?.onAdd);

    const { showOkModal } = useModal();
    const { data, isLoading: isGettingSlotsLoading } = useGetServiceSlotsQuery(params?.id, {
        skip: !params?.id || isAddServiceFlow,
    });
    const [submit, { isLoading, isSuccess, reset: resetSubmit }] = useUpdateServiceSlotsMutation();
    const slotsSuccessShownRef = useRef(false);

    useFocusEffect(
        useCallback(() => {
            if (isAddServiceFlow) {
                setSlotsData(cloneInitialSlots());
                setErrors({});
                setAutoFillForWeek(false);
            }
        }, [isAddServiceFlow]),
    );

    useEffect(() => {
        if (isAddServiceFlow) return;
        if (data && data?.data?.length) {
            const apiSlots = data.data;

            const mappedSlots = cloneInitialSlots().map((dayItem) => {
                const daySlots = apiSlots.filter(
                    (slot) => slot.day.toLowerCase() === dayItem.day.toLowerCase(),
                );

                if (daySlots.length) {
                    return {
                        ...dayItem,
                        enabled: true,
                        slots: daySlots.map((item) => ({
                            start_time: item?.start_at_utc
                                ? slotUtcToPickerValue(item.start_at_utc, slotTimezone)
                                : item?.start_time
                                  ? wallClockToPickerValue(item.start_time)
                                  : "",
                            end_time: item?.end_at_utc
                                ? slotUtcToPickerValue(item.end_at_utc, slotTimezone)
                                : item?.end_time
                                  ? wallClockToPickerValue(item.end_time)
                                  : "",
                        })),
                    };
                }

                return dayItem;
            });

            setSlotsData(mappedSlots);
        }
    }, [data, isAddServiceFlow, slotTimezone]);

    const afterSlotsSaved = useCallback(() => {
        if (params?.id && !isAddServiceFlow) {
            navigateBackToServiceDetails(
                params.id,
                params.title ?? 'Service Details',
                params.fromMyServices,
            );
            return;
        }
        goBack();
    }, [params?.id, params?.title, params?.fromMyServices, isAddServiceFlow]);

    useEffect(() => {
        if (!isSuccess || slotsSuccessShownRef.current) return;
        slotsSuccessShownRef.current = true;
        showOkModal(
            { type: "success", title: "Successfully", message: "Slots Has Been Saved Successfully!" },
            () => {
                slotsSuccessShownRef.current = false;
                resetSubmit();
                afterSlotsSaved();
            },
        );
    }, [isSuccess, afterSlotsSaved, showOkModal, resetSubmit]);

    const handleSubmit = () => {
        const { hasError, allErrors } = validateAllDays(slotsData);
        if (hasError) {
            setErrors((prev) => ({ ...prev, ...allErrors }));
            showOkModal({
                type: 'warning',
                title: 'Invalid Slots',
                message: 'Please fix overlapping or invalid time slots before saving.',
            });
            return;
        }

        const formData = new FormData();
        formData.append("timezone", slotTimezone);
        let count = 0;

        slotsData.forEach((day) => {
            if (!day.enabled) return;

            day.slots.forEach((slot) => {
                if (!slot.start_time || !slot.end_time) return;

                formData.append(`slots[${count}][day]`, day.day.toLowerCase());
                formData.append(`slots[${count}][start_time]`, formatTime(slot.start_time));
                formData.append(`slots[${count}][end_time]`, formatTime(slot.end_time));

                count++;
            });
        });

        if (count === 0) {
            showOkModal({
                type: 'warning',
                title: 'Slots Required',
                message: 'Enable at least one day and set start and end times for your service.',
            });
            return;
        }

        if (params?.onAdd) {
            params.onAdd?.(formData);
            goBack();
        } else {
            submit({
                id: params?.id,
                body: formData,
            });
        }

        setSlotsData(cloneInitialSlots());
    };

    return (
        <Wrapper loading={isGettingSlotsLoading}>
            <FlatList
                data={slotsData}
                extraData={{ slotsData, errors }}
                showsVerticalScrollIndicator={false}
                ItemSeparatorComponent={() => <Seperator />}
                keyExtractor={(item) => item.day}
                renderItem={({ item, index }) => (
                    <>
                        <SlotCard
                            data={item}
                            index={index}
                            onToggleDay={handleToggleDay}
                            onChangeSlot={handleChangeSlot}
                            onAddSlot={handleAddSlot}
                            onRemoveSlot={handleRemoveSlot}
                            errors={errors}
                        />
                        {index === 0 && (
                            <Row align="center" style={{ marginVertical: heightPixel(15), marginLeft: widthPixel(5) }}>
                                <Checkbox checked={autoFillForWeek} onPress={handleAutoFillToggle} />
                                <Text style={{ marginLeft: widthPixel(12) }} weight="semibold">Auto-Fill For The Week</Text>
                            </Row>
                        )}
                    </>
                )}
                ListFooterComponent={() => <Button text="Save Slots" onPress={handleSubmit} loading={isLoading} />}
                ListFooterComponentStyle={{ marginVertical: heightPixel(30) }}
            />
        </Wrapper>
    );
};

export default Slots;
