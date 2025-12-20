// app/ImageToPdfScreen.tsx
import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Platform,
  ScrollView,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import * as FileSystem from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { endpoints } from "../constants/apiConfig";
import ProtectedScreen from "../components/ProtectedScreen";
import { saveRecentFile } from "../utils/saveRecentFile";
import Footer from "../components/Footer";

type PickedFile = {
  uri: string;
  name: string;
  size?: number;
  mimeType?: string;
};

export default function ImageToPdfScreen() {
  const navigation = useNavigation();
  const [files, setFiles] = useState<PickedFile[]>([]);
  const [loading, setLoading] = useState(false);

  const pickImages = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsMultipleSelection: true,
        quality: 1,
      });

      if (result.canceled) {
        Alert.alert("Cancelled", "No images selected");
        return;
      }

      const selectedFiles: PickedFile[] = result.assets.map((asset) => ({
        uri: asset.uri,
        name: asset.fileName || asset.uri.split("/").pop() || "image.jpg",
        size: asset.fileSize,
        mimeType: "image/jpeg",
      }));

      setFiles(selectedFiles);
    } catch (err) {
      console.error(err);
      Alert.alert("Error", "Failed to pick images");
    }
  };

  const blobToBase64 = (blob: Blob): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve((reader.result as string).split(",")[1]);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });

  const convertImagesToPdf = async () => {
    if (files.length === 0) return Alert.alert("Please select images first");
    setLoading(true);

    try {
      const formData = new FormData();
      files.forEach((file, index) => {
        formData.append("images", {
          uri: file.uri,
          name: file.name || `image${index}.jpg`,
          type: file.mimeType || "image/jpeg",
        } as any);
      });

      const res = await fetch(endpoints.imageToPdf, {
        method: "POST",
        body: formData,
        headers: { Accept: "application/pdf" },
      });

      if (!res.ok) {
        const txt = await res.text();
        throw new Error(`Server error ${res.status}: ${txt}`);
      }

      const pdfBlob = await res.blob();
      const outName = `image_to_pdf_${Date.now()}.pdf`;

      // 🌐 WEB DOWNLOAD
      if (Platform.OS === "web") {
        const url = URL.createObjectURL(pdfBlob);
        const a = document.createElement("a");
        a.href = url;
        a.download = outName;
        a.click();
        URL.revokeObjectURL(url);

        setLoading(false);
        Alert.alert("Success", "PDF downloaded");
        return;
      }

      // 📱 MOBILE SAVE
      const base64 = await blobToBase64(pdfBlob);
      const localPath = FileSystem.documentDirectory + outName;

      await FileSystem.writeAsStringAsync(localPath, base64, {
        encoding: FileSystem.EncodingType.Base64,
      });

      await saveRecentFile("Image to PDF", outName, localPath);

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(localPath, {
          mimeType: "application/pdf",
          dialogTitle: "Share PDF",
        });
      } else {
        Alert.alert("Saved", localPath);
      }

      setLoading(false);
    } catch (err: any) {
      console.error(err);
      Alert.alert("Error", err.message || "Conversion failed");
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
        <ScrollView contentContainerStyle={styles.contentContainer}>
          <View style={styles.card}>
            {/* TITLE WITH LOGO */}
            <View style={styles.titleRow}>
              <View style={styles.logoContainer}>
                <Ionicons name="images" size={32} color="#ec4899" />
              </View>
              <Text style={styles.title}>Image to PDF Converter</Text>
            </View>

            {/* SUBTITLE */}
            <Text style={styles.subtitle}>
              Select Image Files (.jpg, .png, .webp)
            </Text>

            {/* DROP ZONE */}
            <View style={styles.dropZone}>
              <Text style={styles.dropText}>Drop your images here ↓</Text>

              <TouchableOpacity style={styles.chooseBtn} onPress={pickImages}>
                <Text style={styles.chooseBtnText}>Choose Files</Text>
              </TouchableOpacity>

              <Text style={styles.fileName}>
                {files.length > 0 
                  ? `${files.length} image(s) selected` 
                  : "No file chosen"}
              </Text>
            </View>

            {/* INFO NOTE */}
            <View style={styles.infoBox}>
              <Ionicons name="information-circle" size={20} color="#2563eb" />
              <Text style={styles.infoText}>
                All selected images will be combined into a single PDF file
              </Text>
            </View>

            {/* SELECTED FILES LIST */}
            {files.length > 0 && (
              <View style={styles.filesList}>
                <Text style={styles.filesListTitle}>Selected Images:</Text>
                {files.map((file, index) => (
                  <View key={index} style={styles.fileItem}>
                    <Ionicons name="image-outline" size={18} color="#6b7280" />
                    <Text style={styles.fileItemText} numberOfLines={1}>
                      {file.name}
                    </Text>
                  </View>
                ))}
              </View>
            )}

            {/* CONVERT BUTTON */}
            {loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#2563eb" />
                <Text style={styles.loadingText}>
                  Converting to PDF, please wait…
                </Text>
              </View>
            ) : (
              <TouchableOpacity
                style={[
                  styles.uploadBtn,
                  { opacity: files.length > 0 ? 1 : 0.5 },
                ]}
                onPress={convertImagesToPdf}
                disabled={files.length === 0}
              >
                <Ionicons name="download-outline" size={20} color="#fff" />
                <Text style={styles.uploadBtnText}>Convert & Download</Text>
              </TouchableOpacity>
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

  contentContainer: {
    padding: 20,
    alignItems: "center",
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
    backgroundColor: "#fce7f3",
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
    padding: 32,
    alignItems: "center",
    backgroundColor: "#fafafa",
    marginBottom: 20,
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

  infoBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "#eff6ff",
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#bfdbfe",
    marginBottom: 20,
  },

  infoText: {
    fontSize: 13,
    color: "#1e40af",
    flex: 1,
  },

  filesList: {
    backgroundColor: "#f9fafb",
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
  },

  filesListTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 8,
  },

  fileItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 6,
  },

  fileItemText: {
    fontSize: 13,
    color: "#6b7280",
    flex: 1,
  },

  uploadBtn: {
    backgroundColor: "#2563eb",
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
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