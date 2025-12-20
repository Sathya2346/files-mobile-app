// utils/auth.ts
// ⚠️ This file is now OPTIONAL since we're using AsyncStorage directly in login/signup
// You can delete this file or keep it for backward compatibility

import AsyncStorage from "@react-native-async-storage/async-storage";

export const saveUser = async (userData: { email: string }) => {
  try {
    await AsyncStorage.setItem("userEmail", userData.email);
    console.log("⚠️ Warning: saveUser() only saves email. Use AsyncStorage.multiSet() for complete user data");
  } catch (error) {
    console.error("Error saving user:", error);
  }
};

export const getUser = async () => {
  try {
    const email = await AsyncStorage.getItem("userEmail");
    return email ? { email } : null;
  } catch (error) {
    console.error("Error getting user:", error);
    return null;
  }
};

export const clearUser = async () => {
  try {
    await AsyncStorage.multiRemove(["authToken", "userId", "userEmail", "userName"]);
  } catch (error) {
    console.error("Error clearing user:", error);
  }
};