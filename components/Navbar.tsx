// components/Navbar.tsx
import React, { useEffect, useState } from "react";
import { View } from "react-native";
import Header from "./Header";
import { endpoints } from "../constants/apiConfig";
import * as FileSystem from 'expo-file-system';

export default function Navbar() {
  const [userData, setUserData] = useState<{ name: string; photo?: string }>({
    name: "User",
    photo: undefined,
  });

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const userId = 7; // Replace with logged-in user ID
        const response = await fetch(`${endpoints.getUserProfile}/${userId}/`);
        const data = await response.json();

        setUserData({
          name: data.name,
          photo: data.photo, // This is the local URI from device
        });
      } catch (error) {
        console.log("Load profile error:", error);
      }
    };

    fetchUserProfile();
  }, []);

  return (
    <View>
      <Header userName={userData.name} userImage={userData.photo} />
    </View>
  );
}
