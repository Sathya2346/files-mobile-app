import React, { useEffect, useState } from "react";
import { View, Text, Image, StyleSheet, StatusBar, TouchableOpacity } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";

export default function Header() {
  const [userName, setUserName] = useState("User");
  const [userImage, setUserImage] = useState<string | null>(null);

  useEffect(() => {
    loadHeaderData();
  }, []);

  const loadHeaderData = async () => {
    const name = await AsyncStorage.getItem("userName");
    const image = await AsyncStorage.getItem("userImage");

    if (name) setUserName(name);
    if (image) setUserImage(image);
  };

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor="#1E88E5" />
      <View style={styles.headerContainer}>

        {/* Logo */}
        <View style={styles.logoSection}>
          <View style={styles.logoCircle}>
            <Image
              source={require("../assets/images/logo.png")}
              style={styles.logoImage}
              resizeMode="contain"
            />
          </View>
          <Text style={styles.welcomeText}>Welcome to The Vetri Files</Text>
        </View>

        {/* PROFILE IMAGE */}
        <View style={styles.profileSection}>
          <TouchableOpacity onPress={() => router.push("/Profile")}>
            {userImage ? (
              <Image source={{ uri: userImage }} style={styles.profileImage} />
            ) : (
              <View style={styles.profileImagePlaceholder}>
                <Text style={styles.profileInitial}>
                  {userName.charAt(0).toUpperCase()}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </>
  );
}


const styles = StyleSheet.create({
  headerContainer: {
    backgroundColor: "#1E88E5",
    paddingTop: 10,
    paddingBottom: 20,
    paddingHorizontal: 15,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  logoSection: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  logoCircle: {
    backgroundColor: "#FFF",
    borderRadius: 25,
    width: 80,
    height: 50,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
    overflow: "hidden",
  },
  logoImage: {
    width: 70,
    height: 70,
  },
  welcomeText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "600",
    flex: 1,
  },
  profileSection: {
    marginLeft: 10,
  },
  profileImage: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    borderWidth: 2,
    borderColor: "#FFF",
  },
  profileImagePlaceholder: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    backgroundColor: "#FFF",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#FFF",
  },
  profileInitial: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1E88E5",
  },
});
