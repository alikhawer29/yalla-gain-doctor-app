import React, { FC, useCallback, useState } from 'react';
import {
  View,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import Image from '../../components/Image';
import ImagePreviewModal from '../../components/ImagePreviewModal';
import Text from '../../components/Text';
import Wrapper from '../../components/Wrapper';
import Empty from '../../components/Empty';
import colors from '../../utils/colors';
import { FaqItem, useGetFaqsQuery } from '../../redux/Apis/User';
import FaqVideoPlayer from './FaqVideoPlayer';
import styles from './styles';

const FAQ: FC = () => {
  const { data, isLoading, isFetching, refetch } = useGetFaqsQuery(undefined, {
    refetchOnFocus: true,
    refetchOnReconnect: true,
  });
  const faqs: FaqItem[] = data?.data ?? [];

  const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [refetch]),
  );

  const renderFaqItem = ({ item, index }: { item: FaqItem; index: number }) => {
    const hasImage = !!item.image;
    const hasVideo = !!item.video;

    return (
      <View style={styles.itemContainer}>
        <Text color={colors.white} weight="bold" size={18} style={styles.question}>
          Question {index + 1} :
        </Text>
        <Text color={colors.white} style={styles.question}>
          {item.question}
        </Text>

        <View style={{ marginTop: 10 }}>
          <Text color={colors.white} weight="bold" size={18} style={styles.answer}>
            Response:
          </Text>
          <Text color={colors.white} style={styles.answer}>
            {item.answer}
          </Text>
        </View>

        {hasImage && (
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => setPreviewImageUrl(item.image!)}
          >
            <Image
              source={{ uri: item.image! }}
              style={styles.image}
              resize="cover"
            />
          </TouchableOpacity>
        )}

        {hasVideo && <FaqVideoPlayer videoUrl={item.video!} />}
      </View>
    );
  };

  if (isLoading) {
    return (
      <Wrapper>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </Wrapper>
    );
  }

  return (
    <Wrapper scrollable={false}>
      <View style={styles.container}>
        <FlatList
          data={faqs}
          renderItem={renderFaqItem}
          keyExtractor={item => String(item.id)}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={<Empty message="No FAQs found" />}
          refreshing={isFetching && !isLoading}
          onRefresh={refetch}
        />
      </View>

      <ImagePreviewModal
        visible={!!previewImageUrl}
        imageUrl={previewImageUrl ?? ''}
        onClose={() => setPreviewImageUrl(null)}
      />
    </Wrapper>
  );
};

export default FAQ;
