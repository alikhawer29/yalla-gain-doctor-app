import React, { memo, useEffect, useState } from 'react';
import { LayoutAnimation, View } from 'react-native';
import DropDownPicker from 'react-native-dropdown-picker';
import colors from '../../utils/colors';
import Text from '../Text';
import styles from './styles';
import { heightPixel } from '../../utils/helper';

const Dropdown = props => {

  const {
    label,
    placeholder = 'Select',
    error,
    value,
    options = [],
    onChangeText,
    multiple = false,
    direction = 'AUTO',
    disabled = false,
    zIndex,
    zIndexInverse,
    height = 54,
    required = false,
    isLoading = false,
    listMode = 'SCROLLVIEW',
    textStyle: textStyleOverride,
    labelProps: labelPropsOverride,
  } = props;

  useEffect(() => {
    if (error) {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    }
  }, [error]);

  const [open, setOpen] = useState(false);

  return (
    <View style={styles.container}>
      {label && (
        <Text
          size={16}
          weight="semibold"
          color={colors.white}
          style={styles.label}
        >
          {label}
          {
            required &&
            <Text
              size={12}
              weight="semibold"
              color={colors.danger}
              style={styles.label}
            >
              {" *"}
            </Text>
          }
        </Text>
      )}
      <DropDownPicker
        open={open}
        setOpen={setOpen}
        items={options}
        style={[styles.inputContainer, { height: heightPixel(height) }]}
        placeholder={placeholder}
        value={value}
        placeholderStyle={styles.placeholder}
        onSelectItem={onChangeText}
        dropDownContainerStyle={styles.dropdown}
        textStyle={[styles.text, textStyleOverride]}
        listMode={listMode}
        multiple={multiple}
        mode="BADGE"
        dropDownDirection={direction}
        disabled={disabled}
        zIndex={zIndex}
        zIndexInverse={zIndexInverse}
        labelProps={{ allowFontScaling: false, numberOfLines: 1, ...labelPropsOverride }}
        arrowIconStyle={{ tintColor: colors.white }}
        loading={isLoading}
        listItemLabelStyle={styles.listItemLabel}
        tickIconStyle={{ tintColor: colors.white }}
      />
      {error && (
        <Text size={12} color={colors.danger} style={styles.error}>
          {error}
        </Text>
      )}
    </View>
  );
};

export default memo(Dropdown);
