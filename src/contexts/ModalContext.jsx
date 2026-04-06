import React, { createContext, useContext, useState, useEffect } from 'react';
import { Image, Modal, StyleSheet, TouchableWithoutFeedback, View, TextInput } from 'react-native';
import images from '../assets/images';
import Button from '../components/Button';
import Icon from '../components/Icon';
import Row from '../components/Row';
import Text from '../components/Text';
import colors from '../utils/colors';
import { font, heightPixel } from '../utils/helper';
import { BlurView } from '@react-native-community/blur';

const ModalContext = createContext();

export const useModal = () => useContext(ModalContext);

export const ModalProvider = ({ children }) => {

    const [isVisible, setIsVisible] = useState(false);
    const [modalType, setModalType] = useState(null);

    const [modalContent, setModalContent] = useState({
        type: 'success',
        message: '',
        onConfirm: () => { },
        onCancel: () => { },
        inputValue: '',
        placeholder: '',
        rating: 0,
    });

    useEffect(() => {
        console.log("Modal state changed:", { isVisible, modalType });
    }, [isVisible, modalType]);

    const showOkModal = (data, onConfirm, onCancel) => {
        setModalType('ok');
        setModalContent({
            ...data,
            onConfirm: onConfirm ? onConfirm : () => setIsVisible(false),
            onCancel: () => {
                setIsVisible(false)
                if (onCancel) {
                    onCancel()
                }
            },
        });
        setIsVisible(true);
    };

    const showYesNoModal = (data, onConfirm, onCancel) => {
        setModalType('yesNo');
        setModalContent({
            ...data,
            onConfirm,
            onCancel: onCancel ? onCancel : () => setIsVisible(false),
        });
        setIsVisible(true);
    };

    const showInformativeModal = (data, onConfirm, onCancel) => {
        setModalType('info');
        setModalContent({
            ...data,
            onConfirm,
            onCancel,
        });
        setIsVisible(true);
    };

    const showInputModal = (data, onConfirm, onCancel) => {
        console.log("showInputModal called with data:", data);
        setModalType('input');
        setModalContent({
            ...data,
            inputValue: data.inputValue || '',
            placeholder: data.placeholder || 'Enter reason...',
            onConfirm: onConfirm ? onConfirm : () => setIsVisible(false),
            onCancel: () => {
                setIsVisible(false)
                if (onCancel) {
                    onCancel()
                }
            },
        });
        setIsVisible(true);
    };

    const showRatingModal = (data, onConfirm) => {
        setModalType('rating');
        setModalContent({
            ...data,
            rating: 0,
            onConfirm: onConfirm ? onConfirm : () => setIsVisible(false),
            onCancel: () => setIsVisible(false),
        });
        setIsVisible(true);
    };

    const hideModal = () => {
        if (modalContent.onCancel) {
            modalContent.onCancel()
        }
        setIsVisible(false)
    }

    return (
        <ModalContext.Provider
            value={{
                showOkModal,
                showYesNoModal,
                showInformativeModal,
                showInputModal,
                showRatingModal,
                hideModal,
            }}
        >
            {children}
            {isVisible && (
                <Modal
                    transparent
                    visible={isVisible}
                    animationType="fade"
                    onRequestClose={hideModal}
                    statusBarTranslucent
                >
                    <BlurView style={StyleSheet.absoluteFill} blurType='dark' blurRadius={2} />
                    <TouchableWithoutFeedback onPress={hideModal} accessible={false}>
                        <View style={styles.modalContainer}>
                            <TouchableWithoutFeedback>
                                <View style={styles.modalContent}>
                                    {
                                        modalContent.type !== "info" && (
                                            <View style={{ width: "100%", alignItems: "flex-end" }}>
                                                <Icon rounded source={images.cross} size={30} onPress={hideModal} border={colors.white} />
                                            </View>
                                        )
                                    }
                                    {
                                        modalType !== 'input' && modalContent.type !== "info" && (
                                            <Image source={modalContent.type === "success" ? images.modal_check : modalContent.type === "warning" ? images.warning : images.modal_cross} style={{ height: heightPixel(78), resizeMode: "contain", marginBottom: heightPixel(20) }} />
                                        )
                                    }
                                    
                                    {modalType === 'input' ? (
                                        <View style={{ width: '100%', alignItems: 'flex-start' }}>
                                            <Row align="center" style={{ marginBottom: heightPixel(10) }}>
                                                <Text size={20} weight="bold" color={colors.white}>
                                                    {modalContent?.title}
                                                </Text>
                                                {modalContent?.required && (
                                                    <Text size={20} weight="bold" color={colors.danger}>*</Text>
                                                )}
                                                <Text size={20} weight="bold" color={colors.white}> :</Text>
                                            </Row>
                                            <View style={styles.inputContainer}>
                                                <TextInput
                                                    style={styles.textInput}
                                                    value={modalContent.inputValue}
                                                    onChangeText={(text) => setModalContent(prev => ({ ...prev, inputValue: text }))}
                                                    placeholder={modalContent.placeholder}
                                                    placeholderTextColor={colors.gray}
                                                    multiline
                                                    numberOfLines={5}
                                                    textAlignVertical="top"
                                                />
                                                <Button text="Submit" onPress={() => {
                                                    if (modalContent.inputValue.trim()) {
                                                        modalContent.onConfirm(modalContent.inputValue.trim());
                                                        hideModal();
                                                    }
                                                }} />
                                            </View>
                                        </View>
                                    ) : (
                                        <>
                                            <Text style={[styles.title, modalContent.type == "info" ? { width: "100%" } : {}]} color={colors.white} position="center" size={24} weight='bold' line_height={40}>{modalContent?.title}</Text>
                                            <Text style={[styles.message, modalContent.type == "info" ? { width: "100%" } : {}]} color={colors.white} position="center">{modalContent?.message}</Text>
                                        </>
                                    )}
                                    {modalType === 'ok' ? (
                                        <Button text="Ok" onPress={() => {
                                            modalContent.onConfirm();
                                            hideModal();
                                        }} />
                                    ) : modalType === 'info' ? null : modalType === 'rating' ? (
                                        <View style={{ width: '100%', alignItems: 'center' }}>
                                            <Row justify="center" gap={10} style={{ marginVertical: 20 }}>
                                                {[1, 2, 3, 4, 5].map((star) => (
                                                    <Icon
                                                        key={star}
                                                        source={images.star}
                                                        size={30}
                                                        tint_color={modalContent.rating >= star ? colors.primary : colors.gray}
                                                        onPress={() => setModalContent(prev => ({ ...prev, rating: star }))}
                                                    />
                                                ))}
                                            </Row>
                                            <Button
                                                text="Submit"
                                                onPress={() => {
                                                    if (modalContent.rating > 0) {
                                                        modalContent.onConfirm(modalContent.rating);
                                                        hideModal();
                                                    }
                                                }}
                                            />
                                        </View>
                                    ) : modalType === 'input' ? null : (
                                        <Row justify='space-between' align='center' gap={10} style={styles.buttonContainer}>
                                            <Button text="Yes" style={{ width: "50%", minWidth: 'auto' }} onPress={() => {
                                                // If onConfirm returns false, keep the overlay open (e.g. chain to input modal).
                                                // Do not use hideModal() here — it runs onCancel and would close before a nested modal opens.
                                                const suppressClose = modalContent.onConfirm?.() === false;
                                                if (!suppressClose) {
                                                    setIsVisible(false);
                                                }
                                            }} />
                                            <Button text="No" type='outlined' style={{ width: "50%", minWidth: 'auto' }} onPress={() => {
                                                if (modalContent?.onCancel) {
                                                    modalContent.onCancel();
                                                }
                                                hideModal();
                                            }} />
                                        </Row>
                                    )}
                                </View>
                            </TouchableWithoutFeedback>
                        </View>
                    </TouchableWithoutFeedback>
                </Modal>
            )}
        </ModalContext.Provider>
    );
};

const styles = StyleSheet.create({
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContent: {
        width: '75%',
        padding: 20,
        // paddingBottom: heightPixel(40),
        backgroundColor: colors.blackish_gray,
        borderRadius: heightPixel(10),
        alignItems: 'center',
        borderWidth: font(2),
        borderColor: colors.gray
    },
    title: {
        width: "80%",
        marginBottom: heightPixel(10),
    },
    message: {
        marginBottom: heightPixel(30),
        width: "90%"
    },
    buttonContainer: {
        width: '90%',
    },
    inputContainer: {
        width: '90%',
    },
    textInput: {
        width: '100%',
        height: heightPixel(80),
        backgroundColor: colors.white,
        borderRadius: heightPixel(8),
        padding: heightPixel(10),
        color: colors.white,
        marginBottom: heightPixel(20),
        textAlignVertical: 'top',
        borderWidth: 1,
        borderColor: colors.gray,
        backgroundColor: 'transparent'
    },
});
