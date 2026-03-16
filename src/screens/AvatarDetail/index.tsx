import { View, StyleSheet, ActivityIndicator } from "react-native";
import { useRoute } from "@react-navigation/native";
import { useSelector } from "react-redux";
import Wrapper from "../../components/Wrapper";
import Text from "../../components/Text";
import Image from "../../components/Image";
import Row from "../../components/Row";
import colors from "../../utils/colors";
import { heightPixel, widthPixel } from "../../utils/helper";
import { useGetAvatarQuery } from "../../redux/Apis/User";
import { RootState } from "../../redux/Store";
import images from "../../assets/images";

const AvatarDetail = () => {
  const route = useRoute<any>();
  const passedUserId = route?.params?.id;

  const authUser = useSelector((state: RootState) => state.auth.user);
  const fallbackUserId =
    authUser?.id || authUser?.user_id || authUser?.user?.id;

  const userId = passedUserId || fallbackUserId;

  const { data, isLoading, isError } = useGetAvatarQuery(userId, {
    skip: !userId,
  });

  const avatarImageUri = data?.image || data?.image_values;

  return (
    <Wrapper>
      <View style={styles.container}>
        <View style={styles.avatarCard}>
          {isLoading && (
            <ActivityIndicator size="small" color={colors.primary} />
          )}

          {!isLoading && (
            <Image
              source={avatarImageUri ? { uri: avatarImageUri } : images.avatar.slim}
              style={styles.avatar}
              resize="contain"
            />
          )}
        </View>
      </View>
    </Wrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.black,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarCard: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  avatar: {
    width: "100%",
    height: "100%",
  },
});

export default AvatarDetail;

