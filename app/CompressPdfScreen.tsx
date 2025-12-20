// app/CompressPdfScreen.tsx
import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  ScrollView,
} from "react-native";
import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { endpoints } from "../constants/apiConfig";
import ProtectedScreen from "../components/ProtectedScreen";
import { saveRecentFile } from "../utils/saveRecentFile";
import Footer from "../components/Footer";

export default function CompressPdfScreen() {
  const navigation = useNavigation();
  const [file, setFile] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [quality, setQuality] = useState<number>(60);

  // Pick PDF
  const pickFile = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: "application/pdf",
        copyToCacheDirectory: true,
        multiple: false,
      });

      const selectedFile = result.assets ? result.assets[0] : null;

      if (selectedFile?.uri) {
        setFile(selectedFile);
      } else {
        Alert.alert("No file selected");
      }
    } catch (err) {
      console.error("Picker error", err);
      Alert.alert("Error", "Could not pick file");
    }
  };

  const compressPDF = async () => {
    if (!file) return Alert.alert("Select a PDF first");

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("file", {
        uri: file.uri,
        name: file.name || "upload.pdf",
        type: "application/pdf",
      } as any);

      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 10 * 60 * 1000);

      const res = await fetch(endpoints.compressPdf, {
        method: "POST",
        body: formData,
        signal: controller.signal,
      });

      clearTimeout(timeout);
      
      if (!res.ok) {
        throw new Error(`Server failed: ${res.status}`);
      }

      const blob = await res.blob();
      const destUri = `${FileSystem.documentDirectory}compressed_${file.name}`;
      const reader = new FileReader();

      reader.onload = async () => {
        const base64 = (reader.result as string).split(",")[1];

        await FileSystem.writeAsStringAsync(destUri, base64, {
          encoding: "base64",
        });

        // Save recent file
        await saveRecentFile(
          "Compress PDF",
          `compressed_${file.name}`,
          destUri
        );

        setLoading(false);

        if (await Sharing.isAvailableAsync()) {
          await Sharing.shareAsync(destUri);
        } else {
          Alert.alert("Success", "File saved to: " + destUri);
        }
      };

      reader.onerror = () => {
        setLoading(false);
        Alert.alert("Error", "Failed to process file");
      };

      reader.readAsDataURL(blob);
    } catch (err: any) {
      console.error("Compress Error:", err);
      Alert.alert("Error", err.message || "Something went wrong");
      setLoading(false);
    }
  };

  return (
    <ProtectedScreen>
      <View style={styles.container}>
        {/* HEADER */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="#fff" />
            <Text style={styles.backText}>Back</Text>
          </TouchableOpacity>
        </View>

        {/* MAIN CONTENT */}
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
        >
          {/* CARD */}
          <View style={styles.card}>
            {/* TITLE WITH LOGO */}
            <View style={styles.titleRow}>
              <View style={styles.logoContainer}>
                <Ionicons name="document-text" size={32} color="#2563eb" />
              </View>
              <Text style={styles.title}>Compress PDF Converter</Text>
            </View>

            {/* SUBTITLE */}
            <Text style={styles.subtitle}>
              Select a PDF File (.pdf)
            </Text>

            {/* DROP ZONE */}
            <View style={styles.dropZone}>
              <Ionicons 
                name="cloud-upload-outline" 
                size={40} 
                color="#9ca3af" 
                style={{ marginBottom: 12 }}
              />
              <Text style={styles.dropText}>Drop your file here ↓</Text>

              <TouchableOpacity 
                style={styles.chooseBtn} 
                onPress={pickFile}
                activeOpacity={0.7}
              >
                <Text style={styles.chooseBtnText}>Choose Files</Text>
              </TouchableOpacity>

              <Text style={styles.fileName}>
                {file ? file.name : "No file chosen"}
              </Text>
            </View>

            {/* QUALITY SECTION */}
            <View style={styles.qualityRow}>
              <Text style={styles.qualityLabel}>Quality: {quality}%</Text>

              <View style={styles.qualityButtons}>
                <TouchableOpacity
                  onPress={() => setQuality(Math.max(10, quality - 10))}
                  style={styles.qBtn}
                  activeOpacity={0.7}
                >
                  <Text style={styles.qBtnText}>−</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => setQuality(Math.min(100, quality + 10))}
                  style={styles.qBtn}
                  activeOpacity={0.7}
                >
                  <Text style={styles.qBtnText}>+</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* UPLOAD BUTTON */}
            {loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#2563eb" />
                <Text style={styles.loadingText}>
                  Compressing, please wait…
                </Text>
              </View>
            ) : (
              <TouchableOpacity
                style={[
                  styles.uploadBtn,
                  { opacity: file ? 1 : 0.5 },
                ]}
                onPress={compressPDF}
                disabled={!file || loading}
                activeOpacity={0.8}
              >
                <Text style={styles.uploadBtnText}>Upload</Text>
              </TouchableOpacity>
            )}
          </View>
        </ScrollView>
      </View>
      <Footer/>
    </ProtectedScreen>
  );
}

// ================================
// STYLES
// ================================
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },

  header: {
    backgroundColor: "#2563eb",
    paddingTop: 50,
    paddingBottom: 15,
    paddingHorizontal: 20,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4,
  },

  backButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  backText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },

  scrollView: {
    flex: 1,
  },

  contentContainer: {
    padding: 20,
    alignItems: "center",
    paddingBottom: 40,
  },

  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 24,
    width: "100%",
    maxWidth: 500,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 5,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },

  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 8,
  },

  logoContainer: {
    width: 50,
    height: 50,
    backgroundColor: "#dbeafe",
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },

  title: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1f2937",
    flex: 1,
  },

  subtitle: {
    fontSize: 14,
    color: "#6b7280",
    marginBottom: 20,
  },

  dropZone: {
    borderWidth: 2,
    borderColor: "#d1d5db",
    borderStyle: "dashed",
    borderRadius: 12,
    padding: 40,
    alignItems: "center",
    backgroundColor: "#fafafa",
    marginBottom: 24,
  },

  dropText: {
    fontSize: 15,
    color: "#6b7280",
    marginBottom: 16,
  },

  chooseBtn: {
    backgroundColor: "#fff",
    paddingVertical: 12,
    paddingHorizontal: 28,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#d1d5db",
    marginBottom: 12,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 2,
    shadowOffset: { width: 0, height: 1 },
    elevation: 2,
  },

  chooseBtnText: {
    fontSize: 15,
    color: "#374151",
    fontWeight: "500",
  },

  fileName: {
    fontSize: 14,
    color: "#6b7280",
    textAlign: "center",
  },

  qualityRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
    paddingVertical: 12,
  },

  qualityLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1f2937",
  },

  qualityButtons: {
    flexDirection: "row",
    gap: 10,
  },

  qBtn: {
    backgroundColor: "#f3f4f6",
    width: 40,
    height: 40,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#d1d5db",
  },

  qBtnText: {
    fontSize: 22,
    fontWeight: "700",
    color: "#374151",
  },

  uploadBtn: {
    backgroundColor: "#2563eb",
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
    shadowColor: "#2563eb",
    shadowOpacity: 0.3,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },

  uploadBtnText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },

  loadingContainer: {
    alignItems: "center",
    paddingVertical: 20,
  },

  loadingText: {
    color: "#6b7280",
    marginTop: 12,
    fontSize: 15,
  },
});