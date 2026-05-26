import React, { useRef, useState } from "react";
import {
  View,
  Text,
  Image,
  FlatList,
  Dimensions,
  TouchableOpacity,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import styles from "../../assets/css/OnboardingScreen";
import { useTranslation } from "react-i18next";

const { width } = Dimensions.get("window");

export default function OnboardingScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation<any>();
  const flatListRef = useRef<FlatList>(null);
  const [index, setIndex] = useState(0);

  const slides = [
    {
      id: "1",
      image: require("../../assets/images/onboard1.jpg"),
      title: t('onboarding.slide1Title'),
      subtitle: t('onboarding.slide1Subtitle'),
    },
    {
      id: "2",
      image: require("../../assets/images/onboard2.png"),
      title: t('onboarding.slide2Title'),
      subtitle: t('onboarding.slide2Subtitle'),
    },
    {
      id: "3",
      image: require("../../assets/images/onboard3.jpg"),
      title: t('onboarding.slide3Title'),
      subtitle: t('onboarding.slide3Subtitle'),
    },
    {
      id: "4",
      image: require("../../assets/images/onboard4.png"),
      title: t('onboarding.slide1Title'),
      subtitle: t('onboarding.slide1Subtitle'),
      isFinal: true,
    },
  ];

  const goToIndex = (i: number) => {
    flatListRef.current?.scrollToIndex({ index: i, animated: true });
    setIndex(i);
  };

  const handleNext = () => {
    if (index < slides.length - 1) {
      goToIndex(index + 1);
    }
  };

  const handleSkip = () => {
    goToIndex(slides.length - 1);
  };

  const handleRegister = () => {
    navigation.replace("Role");
  };

  const renderItem = ({ item }: any) => (
    <View style={[styles.slide, { width }]}>
      <View style={styles.imageWrapper}>
        <Image source={item.image} style={styles.image} />
      </View>

      <Text style={styles.title}>{item.title}</Text>
      <Text style={styles.subtitle}>{item.subtitle}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={slides}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        scrollEnabled={false}
        showsHorizontalScrollIndicator={false}
        renderItem={renderItem}
      />

      {slides[index]?.isFinal ? (
        <TouchableOpacity
          style={styles.registerButton}
          onPress={handleRegister}
        >
          <Text style={styles.registerText}>{t('onboarding.register')}</Text>
        </TouchableOpacity>
      ) : (
        <View style={styles.bottomBar}>
          <TouchableOpacity
            onPress={handleSkip}
          >
            <Text style={styles.skipText}>{t('common.skip')}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.nextButton}
            onPress={handleNext}
          >
            <Text style={styles.nextText}>{t('common.next')}</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}
