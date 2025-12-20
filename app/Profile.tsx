import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
  ActivityIndicator,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import EditProfileModal from "../components/EditProfileModal";
import { endpoints } from "../constants/apiConfig";
import Footer from "../components/Footer";


interface UserProfile {
  id: number;
  name: string;
  email: string;
  phone: string;
  bio?: string;
  location?: string;
  photo?: string;
  created_at: string;
}

export default function ProfileScreen() {
  const router = useRouter();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [editModalVisible, setEditModalVisible] = useState(false);

  useEffect(() => {
    loadUserProfile();
  }, []);

  const loadUserProfile = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem("authToken");
      const userId = await AsyncStorage.getItem("userId");

      console.log("=== PROFILE DEBUG ===");
      console.log("Token:", token);
      console.log("UserId:", userId);
      console.log("API URL:", `${endpoints.getUserProfile}/${userId}/`);

      if (!token || !userId) {
        Alert.alert("Error", "Please login again");
        router.replace("/auth/login");
        return;
      }

      const apiUrl = `${endpoints.getUserProfile}/${userId}/`;
      console.log("Fetching from:", apiUrl);

      const response = await fetch(apiUrl, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      console.log("Response Status:", response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error("API Error Response:", errorText);
        throw new Error(`Failed to load profile: ${response.status}`);
      }

      const data = await response.json();
      console.log("Profile Data:", data);
      setUser(data);
    } catch (error) {
      console.error("Load profile error:", error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      Alert.alert("Profile Error", errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        style: "destructive",
        onPress: async () => {
          await AsyncStorage.multiRemove(["authToken", "userId", "userEmail", "userName"]);
          router.replace("/auth/login");
        },
      },
    ]);
  };

  const handleSaveProfile = async (updatedData: Partial<UserProfile>) => {
    try {
      const token = await AsyncStorage.getItem("authToken");
      const userId = await AsyncStorage.getItem("userId");

      // Add trailing slash for Django - CRITICAL FIX
      const apiUrl = `${endpoints.updateProfile}/${userId}/`;
      console.log("=== UPDATE PROFILE DEBUG ===");
      console.log("API URL:", apiUrl);
      console.log("Update Data:", updatedData);

      const response = await fetch(apiUrl, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updatedData),
      });

      console.log("Response Status:", response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Update Error:", errorText);
        throw new Error(`Failed to update profile: ${response.status}`);
      }

      const updatedUser = await response.json();
      console.log("Updated User:", updatedUser);
      setUser(updatedUser);
      setEditModalVisible(false);
      Alert.alert("Success", "Profile updated successfully!");
    } catch (error) {
      console.error("Update profile error:", error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      Alert.alert("Update Error", errorMessage);
    }
  };

  const menuItems = [
    {
      id: "edit",
      title: "Edit Profile",
      icon: "person-outline",
      onPress: () => setEditModalVisible(true),
    },
    {
      id: "tools",
      title: "Tool Sets",
      icon: "construct-outline",
      onPress: () => router.push("/Explore"),
    },
    {
      id: "help",
      title: "Help & Support",
      icon: "help-circle-outline",
      onPress: () => router.push("/HelpSupport"),
    },
    {
      id: "terms",
      title: "Terms & Conditions",
      icon: "document-text-outline",
      onPress: () => router.push("/TermsCondition"),
    },
    {
      id: "downloads",
      title: "Downloaded Files",
      icon: "download-outline",
      onPress: () => router.push("/RecentFiles"),
    },
  ];

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2563EB" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={["#1e3a8a", "#3b82f6"]}
        style={styles.headerGradient}
      >
        <View style={styles.profileHeader}>
          <View style={styles.avatarContainer}>
            {user?.photo ? (
              <Image source={{ uri: user.photo }} style={styles.avatar} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Text style={styles.avatarText}>
                  {user?.name?.charAt(0).toUpperCase() || "U"}
                </Text>
              </View>
            )}
          </View>
          <Text style={styles.userName}>{user?.name || "User"}</Text>
          <Text style={styles.memberSince}>
            Member Since {new Date(user?.created_at || "").getFullYear()}
          </Text>
          <Text style={styles.userEmail}>{user?.email}</Text>
          <TouchableOpacity
            style={styles.editButton}
            onPress={() => setEditModalVisible(true)}
          >
            <Text style={styles.editButtonText}>Edit Profile</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <ScrollView style={styles.contentContainer}>
        <Text style={styles.sectionTitle}>Accounts Managements</Text>

        {menuItems.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={styles.menuItem}
            onPress={item.onPress}
          >
            <Text style={styles.menuText}>{item.title}</Text>
            <Ionicons name="chevron-forward" size={22} color="#2563EB" />
          </TouchableOpacity>
        ))}

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutText}>LOGOUT</Text>
        </TouchableOpacity>
      </ScrollView>

      {user && (
        <EditProfileModal
          visible={editModalVisible}
          user={user}
          onClose={() => setEditModalVisible(false)}
          onSave={handleSaveProfile}
        />
      )}
    <Footer />
    </View>
    
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  headerGradient: {
    paddingTop: 50,
    paddingBottom: 30,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  profileHeader: {
    alignItems: "center",
  },
  avatarContainer: {
    marginBottom: 15,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 4,
    borderColor: "#fff",
  },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 4,
    borderColor: "#fff",
  },
  avatarText: {
    fontSize: 40,
    fontWeight: "700",
    color: "#2563EB",
  },
  userName: {
    fontSize: 24,
    fontWeight: "700",
    color: "#fff",
    marginBottom: 5,
  },
  memberSince: {
    fontSize: 14,
    color: "#e0e7ff",
    marginBottom: 5,
  },
  userEmail: {
    fontSize: 14,
    color: "#e0e7ff",
    marginBottom: 15,
  },
  editButton: {
    backgroundColor: "#fff",
    paddingHorizontal: 25,
    paddingVertical: 10,
    borderRadius: 20,
  },
  editButtonText: {
    color: "#2563EB",
    fontWeight: "600",
    fontSize: 14,
  },
  contentContainer: {
    flex: 1,
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1f2937",
    marginBottom: 15,
  },
  menuItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 18,
    borderRadius: 12,
    marginBottom: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  menuText: {
    fontSize: 16,
    color: "#1f2937",
    fontWeight: "500",
  },
  logoutButton: {
    backgroundColor: "#2563EB",
    padding: 18,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 20,
    marginBottom: 30,
  },
  logoutText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 1,
  },
});