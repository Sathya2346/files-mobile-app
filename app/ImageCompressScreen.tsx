// app/ImageCompressScreen.tsx
import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import ProtectedScreen from "../components/ProtectedScreen";
import { endpoints } from "../constants/apiConfig";
import { saveRecentFile } from "../utils/saveRecentFile";
import Footer from "../components/Footer";

const BACKEND_URL = endpoints.compressImage;

export default function ImageCompressScreen() {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(false);
  const [origPreview, setOrigPreview] = useState<string | null>(null);
  const [resultPreview, setResultPreview] = useState<string | null>(null);
  const [origSize, setOrigSize] = useState<number | null>(null);
  const [compressedSize, setCompressedSize] = useState<number | null>(null);
  const [maxWidth, setMaxWidth] = useState<string>("1200");
  const [quality, setQuality] = useState<string>("75");

  const pickAndCompress = async () => {
    try {
      const res = await DocumentPicker.getDocumentAsync({
        type: "image/*",
        copyToCacheDirectory: true,
      });

      if (res.canceled || !res.assets || res.assets.length === 0) {
        return;
      }

      setLoading(true);
      setOrigPreview(null);
      setResultPreview(null);
      setOrigSize(null);
      setCompressedSize(null);

      const picked = res.assets[0];
      setOrigPreview(picked.uri);

      let fileToUpload: any;
      if (Platform.OS === "web") {
        const blob = await fetch(picked.uri).then((r) => r.blob());
        fileToUpload = new File([blob], picked.name ?? "image.jpg", {
          type: picked.mimeType ?? "image/jpeg",
        });
      } else {
        fileToUpload = {
          uri: picked.uri,
          name: picked.name ?? "image.jpg",
          type: picked.mimeType ?? "image/jpeg",
        };
      }

      const fd = new FormData();
      fd.append("image", fileToUpload);
      if (maxWidth) fd.append("max_width", String(Math.max(100, parseInt(maxWidth))));
      if (quality) fd.append("quality", String(Math.max(5, Math.min(95, parseInt(quality)))));

      const response = await fetch(BACKEND_URL, {
        method: "POST",
        body: fd,
      });

      if (!response.ok) {
        const txt = await response.text();
        throw new Error(txt || "Server error");
      }

      const data = await response.json();

      if (!data.image) throw new Error("Invalid response");

      setResultPreview(data.image);
      setOrigSize(data.orig_bytes ?? null);
      setCompressedSize(data.compressed_bytes ?? null);

      const base64 = data.image.split(",")[1];
      const filenameOnly = `compressed_${Date.now()}.jpg`;
      const localFilePath = FileSystem.documentDirectory + filenameOnly;

      await FileSystem.writeAsStringAsync(localFilePath, base64, {
        encoding: FileSystem.EncodingType.Base64,
      });

      await saveRecentFile("Image Compress", filenameOnly, localFilePath);

    } catch (err: any) {
      Alert.alert("Error", err.message || "Compression failed");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const downloadMobile = async () => {
    try {
      if (!resultPreview) return;

      const base64 = resultPreview.split(",")[1];
      const filename = FileSystem.cacheDirectory + `compressed_${Date.now()}.jpg`;

      await FileSystem.writeAsStringAsync(filename, base64, {
        encoding: FileSystem.EncodingType.Base64,
      });

      await Sharing.shareAsync(filename);
    } catch (err: any) {
      Alert.alert("Download error", err.message || "Failed to share image");
    }
  };

  const downloadWeb = () => {
    if (!resultPreview) return;
    const link = document.createElement("a");
    link.href = resultPreview;
    link.download = `compressed_${Date.now()}.jpg`;
    link.click();
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
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.card}>
            {/* TITLE WITH LOGO */}
            <View style={styles.titleRow}>
              <View style={styles.logoContainer}>
                <Ionicons name="image" size={32} color="#8b5cf6" />
              </View>
              <Text style={styles.title}>Image Compressor</Text>
            </View>

            {/* SUBTITLE */}
            <Text style={styles.subtitle}>
              Select an Image File (.jpg, .png, .webp)
            </Text>

            {/* SETTINGS ROW */}
            <View style={styles.settingsRow}>
              <View style={styles.inputCol}>
                <Text style={styles.label}>Max Width (px)</Text>
                <TextInput
                  value={maxWidth}
                  onChangeText={setMaxWidth}
                  keyboardType="numeric"
                  style={styles.input}
                  placeholder="1200"
                />
              </View>

              <View style={styles.inputCol}>
                <Text style={styles.label}>Quality (1–95)</Text>
                <TextInput
                  value={quality}
                  onChangeText={setQuality}
                  keyboardType="numeric"
                  style={styles.input}
                  placeholder="75"
                />
              </View>
            </View>

            {/* DROP ZONE */}
            <View style={styles.dropZone}>
              <Text style={styles.dropText}>Drop your image here ↓</Text>

              <TouchableOpacity 
                style={styles.chooseBtn} 
                onPress={pickAndCompress}
                disabled={loading}
              >
                <Text style={styles.chooseBtnText}>
                  {loading ? "Processing..." : "Choose & Compress"}
                </Text>
              </TouchableOpacity>

              <Text style={styles.fileName}>
                {origPreview ? "Image selected" : "No file chosen"}
              </Text>
            </View>

            {/* LOADING */}
            {loading && (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#2563eb" />
                <Text style={styles.loadingText}>Compressing image...</Text>
              </View>
            )}

            {/* PREVIEW SECTION */}
            {(origPreview || resultPreview) && (
              <>
                <View style={styles.previewRow}>
                  <View style={styles.previewBox}>
                    <Text style={styles.previewTitle}>Original</Text>
                    {origPreview ? (
                      <Image 
                        source={{ uri: origPreview }} 
                        style={styles.previewImage} 
                      />
                    ) : (
                      <View style={styles.placeholderBox}>
                        <Text style={styles.placeholder}>No image</Text>
                      </View>
                    )}
                    <Text style={styles.sizeText}>
                      {origSize ? `${(origSize / 1024).toFixed(1)} KB` : "—"}
                    </Text>
                  </View>

                  <View style={styles.previewBox}>
                    <Text style={styles.previewTitle}>Compressed</Text>
                    {resultPreview ? (
                      <Image 
                        source={{ uri: resultPreview }} 
                        style={styles.previewImage} 
                      />
                    ) : (
                      <View style={styles.placeholderBox}>
                        <Text style={styles.placeholder}>Processing...</Text>
                      </View>
                    )}
                    <Text style={styles.sizeText}>
                      {compressedSize ? `${(compressedSize / 1024).toFixed(1)} KB` : "—"}
                    </Text>
                  </View>
                </View>

                {/* DOWNLOAD BUTTON */}
                {resultPreview && (
                  <TouchableOpacity
                    style={styles.downloadBtn}
                    onPress={Platform.OS === "web" ? downloadWeb : downloadMobile}
                  >
                    <Ionicons name="download-outline" size={20} color="#fff" />
                    <Text style={styles.downloadBtnText}>Download / Share</Text>
                  </TouchableOpacity>
                )}
              </>
            )}
          </View>
        </ScrollView>
      </View>
      <Footer/>
    </ProtectedScreen>
  );
}

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

  scrollContent: {
    padding: 20,
    alignItems: "center",
  },

  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 24,
    width: "100%",
    maxWidth: 800,
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
    backgroundColor: "#f3e8ff",
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

  settingsRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 20,
  },

  inputCol: {
    flex: 1,
  },

  label: {
    fontSize: 13,
    color: "#374151",
    marginBottom: 6,
    fontWeight: "600",
  },

  input: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    padding: 12,
    backgroundColor: "#fff",
    fontSize: 15,
  },

  dropZone: {
    borderWidth: 2,
    borderColor: "#d1d5db",
    borderStyle: "dashed",
    borderRadius: 12,
    padding: 32,
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
  },

  chooseBtnText: {
    fontSize: 15,
    color: "#374151",
    fontWeight: "500",
  },

  fileName: {
    fontSize: 14,
    color: "#6b7280",
  },

  loadingContainer: {
    alignItems: "center",
    paddingVertical: 20,
    marginBottom: 20,
  },

  loadingText: {
    color: "#6b7280",
    marginTop: 12,
    fontSize: 15,
  },

  previewRow: {
    flexDirection: "row",
    gap: 16,
    marginBottom: 20,
  },

  previewBox: {
    flex: 1,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    padding: 12,
    backgroundColor: "#fafafa",
  },

  previewTitle: {
    fontWeight: "700",
    fontSize: 14,
    color: "#374151",
    marginBottom: 10,
    textAlign: "center",
  },

  previewImage: {
    width: "100%",
    height: 200,
    resizeMode: "contain",
    borderRadius: 8,
    backgroundColor: "#fff",
  },

  placeholderBox: {
    width: "100%",
    height: 200,
    borderRadius: 8,
    backgroundColor: "#f3f4f6",
    alignItems: "center",
    justifyContent: "center",
  },

  placeholder: {
    color: "#9ca3af",
    fontSize: 14,
  },

  sizeText: {
    fontSize: 12,
    color: "#6b7280",
    textAlign: "center",
    marginTop: 8,
  },

  downloadBtn: {
    backgroundColor: "#16a34a",
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
  },

  downloadBtnText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
});