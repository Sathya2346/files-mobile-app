import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import * as FileSystem from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";
import Footer from "../components/Footer";

export interface RecentFileItem {
  id: number;
  file_name: string;
  file_uri: string;
  tool_name: string;
  timestamp: string;
  userId: number;
}

export default function RecentFiles() {
  const [files, setFiles] = useState<RecentFileItem[]>([]);
  const [userId, setUserId] = useState<string | null>(null);

  // ✅ Load User ID first
  const loadUserId = async () => {
    const uid = await AsyncStorage.getItem("userId");
    setUserId(uid);
    return uid;
  };

  // ✅ Load files for specific user only
  const loadFiles = async () => {
    try {
      const uid = await loadUserId();
      if (!uid) return;

      const key = `recent_files_user_${uid}`;
      const data = await AsyncStorage.getItem(key);
      if (!data) {
        setFiles([]);
        return;
      }

      const parsed = JSON.parse(data);

      const valid = parsed.filter(
        (x: any) =>
          x &&
          typeof x.file_name === "string" &&
          typeof x.file_uri === "string" &&
          typeof x.tool_name === "string" &&
          typeof x.timestamp === "string"
      );

      setFiles(valid);
    } catch (err) {
      console.log("Error loading recent files:", err);
    }
  };

  // ❌ Delete file only for this specific user
  const deleteItem = async (id: number) => {
    if (!userId) return;

    const key = `recent_files_user_${userId}`;
    const updated = files.filter((item) => item.id !== id);

    setFiles(updated);
    await AsyncStorage.setItem(key, JSON.stringify(updated));
  };

  const confirmDelete = (id: number) => {
    Alert.alert("Delete File?", "Are you sure want to remove this?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => deleteItem(id),
      },
    ]);
  };

  // 🔹 Open file safely
  const openFile = async (item: RecentFileItem) => {
    try {
      const exist = await FileSystem.getInfoAsync(item.file_uri);

      if (!exist.exists) {
        Alert.alert(
          "File Not Found",
          "This file is no longer available in storage."
        );
        return;
      }

      await Sharing.shareAsync(item.file_uri);
    } catch (error) {
      console.log("File open error:", error);
      Alert.alert("Error", "Unable to open file.");
    }
  };

  useEffect(() => {
    loadFiles();
  }, []);

  // 🔹 Render each card
  const renderItem = ({ item }: { item: RecentFileItem }) => {
    if (!item || typeof item !== "object") return null;

    return (
      <View style={styles.card}>
        <View style={{ flex: 1 }}>
          <Text style={styles.fileName}>{item.file_name || "Unknown File"}</Text>
          <Text style={styles.toolName}>{item.tool_name || "Unknown Tool"}</Text>
          <Text style={styles.time}>{item.timestamp || "--"}</Text>

          <TouchableOpacity
            style={styles.openButton}
            onPress={() => openFile(item)}
          >
            <Text style={styles.openButtonText}>Open / Download</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity onPress={() => confirmDelete(item.id)}>
          <Ionicons name="trash-outline" size={24} color="red" />
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Recent Files</Text>
      </View>

      {files.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No recent files found</Text>
        </View>
      ) : (
        <FlatList
          data={files}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          contentContainerStyle={{ padding: 15 }}
        />
      )}

      <Footer />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F7F7F7" },

  header: {
    backgroundColor: "#2979FF",
    paddingVertical: 18,
    paddingHorizontal: 20,
  },
  headerTitle: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "700",
  },

  card: {
    backgroundColor: "#fff",
    padding: 15,
    marginBottom: 12,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    elevation: 3,
  },

  fileName: { fontSize: 16, fontWeight: "700" },
  toolName: { fontSize: 13, color: "#555", marginTop: 2 },
  time: { fontSize: 12, color: "#888", marginTop: 3 },

  openButton: {
    marginTop: 10,
    backgroundColor: "#007AFF",
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 6,
    alignSelf: "flex-start",
  },
  openButtonText: { color: "white", fontWeight: "600" },

  emptyContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  emptyText: { color: "#777", fontSize: 16 },
});
