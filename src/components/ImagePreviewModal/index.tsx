import React, { FC } from 'react';
import {
  Modal,
  View,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
} from 'react-native';
import Image from '../Image';
import Icon from '../Icon';
import images from '../../assets/images';
import colors from '../../utils/colors';
import { heightPixel, widthPixel } from '../../utils/helper';

interface ImagePreviewModalProps {
  visible: boolean;
  imageUrl: string;
  onClose: () => void;
}

const ImagePreviewModal: FC<ImagePreviewModalProps> = ({
  visible,
  imageUrl,
  onClose,
}) => (
  <Modal
    visible={visible}
    transparent
    animationType="fade"
    onRequestClose={onClose}
    statusBarTranslucent
  >
    <StatusBar backgroundColor="rgba(0,0,0,0.95)" barStyle="light-content" />
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.closeButton}
        onPress={onClose}
        activeOpacity={0.7}
      >
        <Icon source={images.cross} size={24} tint_color={colors.white} />
      </TouchableOpacity>

      <View style={styles.mediaContainer}>
        <Image source={{ uri: imageUrl }} resize="contain" style={styles.media} />
      </View>

      <TouchableOpacity
        style={styles.backdrop}
        activeOpacity={1}
        onPress={onClose}
      />
    </View>
  </Modal>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.95)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 0,
  },
  closeButton: {
    position: 'absolute',
    top: heightPixel(50),
    right: widthPixel(20),
    zIndex: 10,
    width: heightPixel(40),
    height: heightPixel(40),
    borderRadius: heightPixel(20),
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  mediaContainer: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  media: {
    width: '100%',
    height: '100%',
  },
});

export default ImagePreviewModal;
