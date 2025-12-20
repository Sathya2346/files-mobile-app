import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import ProtectedScreen from "../components/ProtectedScreen";
import { endpoints } from "../constants/apiConfig";
import { saveRecentFile } from "../utils/saveRecentFile";
import Footer from "../components/Footer";

type DataUrl = string;

export default function PdfToImagesScreen() {
  const navigation = useNavigation();
  const [images, setImages] = useState<DataUrl[]>([]);
  const [selected, setSelected] = useState<boolean[]>([]);
  const [loading, setLoading] = useState(false);

  const pickPdf = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: "application/pdf",
        copyToCacheDirectory: true,
      });

      if (result.canceled || !result.assets?.length) {
        return Alert.alert("No file selected");
      }

      setLoading(true);
      const picked = result.assets[0];

      const formData = new FormData();
      formData.append("pdf", {
        uri: picked.uri,
        type: "application/pdf",
        name: picked.name ?? "file.pdf",
      } as any);

      const res = await fetch(endpoints.pdfToImages, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Failed to convert PDF");

      const json = await res.json();
      setImages(json.images);
      setSelected(json.images.map(() => false));
      setLoading(false);
    } catch (err: any) {
      setLoading(false);
      Alert.alert("Error", err.message || "Conversion failed");
    }
  };

  const toggleSelect = (index: number) => {
    const copy = [...selected];
    copy[index] = !copy[index];
    setSelected(copy);
  };

  const downloadSingleImage = async (dataUrl: DataUrl, index: number) => {
    try {
      const base64 = dataUrl.split(",")[1];
      const fileName = `page_${index + 1}.png`;
      const path = `${FileSystem.documentDirectory}${fileName}`;

      await FileSystem.writeAsStringAsync(path, base64, {
        encoding: FileSystem.EncodingType.Base64,
      });

      await saveRecentFile("PDF to Images", fileName, path);

      await Sharing.shareAsync(path, {
        mimeType: "image/png",
        dialogTitle: "Share Image",
      });
    } catch {
      Alert.alert("Error", "Failed to download image");
    }
  };

  const downloadSelectedZip = async () => {
    const selectedIndexes = selected
      .map((v, i) => (v ? i : -1))
      .filter((i) => i >= 0);

    if (!selectedIndexes.length) return Alert.alert("Select images first");

    try {
      setLoading(true);

      const body = JSON.stringify({ images, indexes: selectedIndexes });

      const res = await fetch(endpoints.zipSelectedImages, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body,
      });

      if (!res.ok) throw new Error("Failed to create ZIP");

      const json = await res.json();
      const zipBase64 = json.zip_base64;

      const outName = `pdf_images_${Date.now()}.zip`;
      const zipPath = `${FileSystem.documentDirectory}${outName}`;

      await FileSystem.writeAsStringAsync(zipPath, zipBase64, {
        encoding: FileSystem.EncodingType.Base64,
      });

      await saveRecentFile("PDF to Images", outName, zipPath);

      await Sharing.shareAsync(zipPath, {
        mimeType: "application/zip",
        dialogTitle: "Download ZIP",
      });

      setLoading(false);
    } catch (err) {
      setLoading(false);
      Alert.alert("Error", "Failed to download ZIP");
    }
  };

  const selectedCount = selected.filter(Boolean).length;

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
                <Ionicons name="images" size={32} color="#0ea5e9" />
              </View>
              <Text style={styles.title}>PDF to Images</Text>
            </View>

            {/* SUBTITLE */}
            <Text style={styles.subtitle}>
              Convert PDF pages to individual images
            </Text>

            {/* DROP ZONE */}
            <View style={styles.dropZone}>
              <Text style={styles.dropText}>Drop your PDF file here ↓</Text>

              <TouchableOpacity style={styles.chooseBtn} onPress={pickPdf}>
                <Text style={styles.chooseBtnText}>Choose PDF File</Text>
              </TouchableOpacity>

              <Text style={styles.fileName}>
                {images.length > 0
                  ? `${images.length} page(s) converted`
                  : "No file chosen"}
              </Text>
            </View>

            {/* LOADING */}
            {loading && (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#2563eb" />
                <Text style={styles.loadingText}>Converting PDF...</Text>
              </View>
            )}

            {/* DOWNLOAD SELECTED ZIP BUTTON */}
            {images.length > 0 && (
              <TouchableOpacity
                style={[
                  styles.zipBtn,
                  { opacity: selectedCount > 0 ? 1 : 0.5 },
                ]}
                onPress={downloadSelectedZip}
                disabled={selectedCount === 0}
              >
                <Ionicons name="folder-open" size={20} color="#fff" />
                <Text style={styles.zipBtnText}>
                  Download Selected as ZIP ({selectedCount})
                </Text>
              </TouchableOpacity>
            )}
          </View>

          {/* IMAGES GRID */}
          {images.length > 0 && (
            <View style={styles.imagesContainer}>
              <Text style={styles.imagesTitle}>
                Converted Images ({images.length})
              </Text>

              {images.map((img, idx) => (
                <View key={idx} style={styles.imageCard}>
                  {/* HEADER WITH CHECKBOX */}
                  <View style={styles.imageCardHeader}>
                    <TouchableOpacity
                      style={styles.checkboxRow}
                      onPress={() => toggleSelect(idx)}
                    >
                      <View
                        style={[
                          styles.checkbox,
                          selected[idx] && styles.checkboxChecked,
                        ]}
                      >
                        {selected[idx] && (
                          <Ionicons name="checkmark" size={16} color="#fff" />
                        )}
                      </View>
                      <Text style={styles.pageLabel}>Page {idx + 1}</Text>
                    </TouchableOpacity>
                  </View>

                  {/* IMAGE PREVIEW */}
                  <View style={styles.imageWrapper}>
                    <Image source={{ uri: img }} style={styles.imagePreview} />
                  </View>

                  {/* DOWNLOAD BUTTON */}
                  <TouchableOpacity
                    style={styles.downloadBtn}
                    onPress={() => downloadSingleImage(img, idx)}
                  >
                    <Ionicons name="download-outline" size={18} color="#fff" />
                    <Text style={styles.downloadBtnText}>Download</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}
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
  },

  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 24,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 5,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    marginBottom: 20,
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
    backgroundColor: "#e0f2fe",
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

  loadingContainer: {
    alignItems: "center",
    paddingVertical: 20,
  },

  loadingText: {
    color: "#6b7280",
    marginTop: 12,
    fontSize: 15,
  },

  zipBtn: {
    backgroundColor: "#16a34a",
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
  },

  zipBtnText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },

  imagesContainer: {
    marginTop: 0,
  },

  imagesTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1f2937",
    marginBottom: 16,
  },

  imageCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },

  imageCardHeader: {
    marginBottom: 12,
  },

  checkboxRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },

  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: "#d1d5db",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
  },

  checkboxChecked: {
    backgroundColor: "#2563eb",
    borderColor: "#2563eb",
  },

  pageLabel: {
    fontSize: 15,
    fontWeight: "600",
    color: "#374151",
  },

  imageWrapper: {
    backgroundColor: "#f9fafb",
    borderRadius: 8,
    overflow: "hidden",
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },

  imagePreview: {
    width: "100%",
    height: 300,
    resizeMode: "contain",
  },

  downloadBtn: {
    backgroundColor: "#2563eb",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
  },

  downloadBtnText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "600",
  },
});