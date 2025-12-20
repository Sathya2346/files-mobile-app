// app/splash.tsx
import { useEffect } from "react";
import { View, Image, StyleSheet, Text } from "react-native";
import { router } from "expo-router";

export default function Splash() {
  useEffect(() => {
    const timer = setTimeout(() => {
      router.replace("/onboarding");
    }, 2000); // 2 seconds

    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.container}>
      {/* 🔵 Blue Background */}
      <View style={styles.blueBox}>
        {/* Logo Image (Replace later) */}
        <View style={styles.logoContainer}>
          <Image
            source={require("../assets/images/logo.png")} // Replace later
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={styles.title}>VETRI{"\n"}FILES</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  blueBox: {
    flex: 1,
    backgroundColor: "#2979FF",
    justifyContent: "center",
    alignItems: "center",
  },
  logoContainer: { justifyContent: "center", alignItems: "center" },
  logo: { width: 120, height: 120, backgroundColor: "white", padding: 10, borderRadius: 5, },
  title: {
    marginTop: 10,
    color: "white",
    fontSize: 30,
    textAlign: "center",
    letterSpacing: 2,
    fontWeight: "600",
  },
});
