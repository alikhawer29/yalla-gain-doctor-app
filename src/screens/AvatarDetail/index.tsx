import { View, StyleSheet } from "react-native";
import Wrapper from "../../components/Wrapper";
import Text from "../../components/Text";
import Image from "../../components/Image";
import Row from "../../components/Row";
import colors from "../../utils/colors";
import { heightPixel, widthPixel } from "../../utils/helper";
import images from "../../assets/images";

const AvatarDetail = () => {
  return (
    <Wrapper scrollable>
      <View style={styles.container}>
        <Text size={22} weight="semibold" style={styles.title}>
          Body Measurements
        </Text>

        <View style={styles.avatarCard}>
          <Image source={images.avatar.slim} style={styles.avatar} resize="contain" />

          {/* Top measurements */}
          <Row style={styles.row} justify="space-between">
            <Text size={12} color={colors.icon_gray}>
              Height: 14 cm
            </Text>
            <Text size={12} color={colors.icon_gray}>
              Weight: 120 Lbs
            </Text>
          </Row>

          <View style={styles.measurementsContainer}>
            <Text size={12} color={colors.icon_gray}>
              Shoulder Width: 14 cm
            </Text>
            <Text size={12} color={colors.icon_gray}>
              Neck Circumference: 14 cm
            </Text>
            <Text size={12} color={colors.icon_gray}>
              Chest Circumference: 24 cm
            </Text>
            <Text size={12} color={colors.icon_gray}>
              Arm Circumference: 22 cm
            </Text>
            <Text size={12} color={colors.icon_gray}>
              Hip Circumference: 44 cm
            </Text>
            <Text size={12} color={colors.icon_gray}>
              Waist Circumference: 34 cm
            </Text>
            <Text size={12} color={colors.icon_gray}>
              Thigh Circumference: 14 cm
            </Text>
          </View>
        </View>
      </View>
    </Wrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: widthPixel(20),
    paddingVertical: heightPixel(20),
  },
  title: {
    textAlign: "center",
    marginBottom: heightPixel(20),
  },
  avatarCard: {
    backgroundColor: colors.blackish_gray,
    borderRadius: 20,
    padding: heightPixel(20),
    alignItems: "center",
  },
  avatar: {
    width: "70%",
    height: heightPixel(260),
    marginBottom: heightPixel(20),
  },
  row: {
    width: "100%",
    marginBottom: heightPixel(15),
  },
  measurementsContainer: {
    width: "100%",
    gap: heightPixel(6),
  },
});

export default AvatarDetail;

