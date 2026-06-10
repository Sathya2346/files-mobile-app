import { router } from "expo-router";
import { useState } from "react";
import { Dimensions, FlatList, Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";

const { width } = Dimensions.get("window");

const slides = [
  {
    id: "1",
    title: "Welcome to Vetri Files",
    desc: "Your smart way to convert, manage, and share PDF files easily.",
    image: require("../../assets/images/1.png"),
  },
  {
    id: "2",
    title: "Convert with One Tap",
    desc: "Turn images, Word, Excel, or text files into high-quality PDFs instantly.",
    image: require("../../assets/images/2.png"),
  },
  {
    id: "3",
    title: "Organize Your Documents",
    desc: "Rename, merge, split, and compress your PDFs — all in one place.",
    image: require("../../assets/images/3.png"),
  },
  {
    id: "4",
    title: "Safe and Seamless Sharing",
    desc: "Keep your files private and share securely across devices.",
    image: require("../../assets/images/4.png"),
  },
];

export default function Onboarding() {
  const [index, setIndex] = useState(0);

  const onSkip = () => {
    router.replace("/home");
  };

  return (
    <View style={styles.container}>
      {/* Skip Button */}
      <TouchableOpacity style={styles.skipBtn} onPress={onSkip}>
        <Text style={styles.skipText}>Skip</Text>
      </TouchableOpacity>

      {/* Onboarding Slides */}
      <FlatList
        data={slides}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        snapToAlignment="center"
        showsHorizontalScrollIndicator={false}
        getItemLayout={(data, index) => ({
          length: width,
          offset: width * index,
          index,
        })}
        onScroll={(e) => {
          let slideIndex = Math.round(
            e.nativeEvent.contentOffset.x / width
          );
          setIndex(slideIndex);
        }}
        renderItem={({ item }) => (
          <View style={[styles.slide, { width }]}>
            <Image source={item.image} style={styles.image} resizeMode="contain" />
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.desc}>{item.desc}</Text>
          </View>
        )}
      />

      {/* Dots */}
      <View style={styles.dotsContainer}>
        {slides.map((_, i) => (
          <View key={i} style={[styles.dot, index === i && styles.activeDot]} />
        ))}
      </View>

      {/* Get Started */}
      {index === slides.length - 1 && (
        <TouchableOpacity style={styles.startBtn} onPress={onSkip}>
          <Text style={styles.startText}>Get Started</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },

  skipBtn: { position: "absolute", top: 50, right: 20, zIndex: 1 },
  skipText: { fontSize: 16, color: "#007AFF", borderColor: "#007AFF", borderWidth: 2, padding: 5, },

  slide: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
  },

  image: { width: "85%", height: 250, marginBottom: 40 },

  title: { fontSize: 22, fontWeight: "700", textAlign: "center" },
  desc: { fontSize: 15, color: "#444", textAlign: "center", marginTop: 10 },

  dotsContainer: { flexDirection: "row", justifyContent: "center", marginVertical: 20 },
  dot: { width: 10, height: 10, borderRadius: 50, backgroundColor: "#ccc", marginHorizontal: 4 },
  activeDot: { backgroundColor: "#007AFF", width: 12 },

  startBtn: {
    backgroundColor: "#2979FF",
    marginHorizontal: 40,
    marginBottom: 40,
    paddingVertical: 15,
    borderRadius: 10,
  },
  startText: {
    textAlign: "center",
    fontSize: 18,
    color: "white",
    fontWeight: "700",
  },
});
