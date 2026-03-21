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

const { width } = Dimensions.get("window");

const slides = [
  {
    id: "1",
    image: require("../../assets/images/onboard1.jpg"),
    title: "Search Your dream\njob fast and ease",
    subtitle:
      "We help you find your dream job based on your skillset, location, demand.",
  },
  {
    id: "2",
    image: require("../../assets/images/onboard2.png"),
    title: "Apply for jobs\nin one click",
    subtitle:
      "Find thousands of job opportunities and apply instantly with ease.",
  },
  {
    id: "3",
    image: require("../../assets/images/onboard3.jpg"),
    title: "Get hired\nquickly",
    subtitle:
      "Connect with top companies and get hired faster than ever.",
  },
  {
    id: "4",
    image: require("../../assets/images/onboard4.png"),
    title: "Search Your dream\njob fast and ease",
    subtitle:
      "We help you find your dream job based on your skillset, location, demand.",
    isFinal: true,
  },
];

export default function OnboardingScreen() {
  const navigation = useNavigation<any>(); // ✅ CORRECT PLACE
  const flatListRef = useRef<FlatList>(null);
  const [index, setIndex] = useState(0);

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
          <Text style={styles.registerText}>REGISTER</Text>
        </TouchableOpacity>
      ) : (
        <View style={styles.bottomBar}>
          <TouchableOpacity
            onPress={handleSkip}
          >
            <Text style={styles.skipText}>Skip</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.nextButton}
            onPress={handleNext}
          >
            <Text style={styles.nextText}>Next</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}
