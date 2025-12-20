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
import * as DocumentPicker from "expo-document-picker";
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

export default function PdfToWordScreen() {
  const navigation = useNavigation();
  const [file, setFile] = useState<PickedFile | null>(null);
  const [loading, setLoading] = useState(false);

  const pickFile = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: "application/pdf",
        copyToCacheDirectory: true,
      });

      if (result.assets && result.assets.length > 0) {
        const picked = result.assets[0];
        setFile({
          uri: picked.uri,
          name: picked.name ?? "document.pdf",
          size: picked.size,
          mimeType: picked.mimeType,
        });
      } else if (result.canceled) {
        Alert.alert("Cancelled", "File selection cancelled");
      }
    } catch (err) {
      console.error("❌ File pick error:", err);
      Alert.alert("Error", "Failed to pick a PDF file");
    }
  };

  const convertPdfToWord = async () => {
    if (!file) return Alert.alert("Please choose a PDF first");
    setLoading(true);

    try {
      const formData = new FormData();

      if (Platform.OS === "web") {
        const response = await fetch(file.uri);
        const blob = await response.blob();
        formData.append("file", blob, file.name);
      } else {
        formData.append("file", {
          uri: file.uri,
          name: file.name || "input.pdf",
          type: "application/pdf",
        } as any);
      }

      const res = await fetch(endpoints.pdfToWord, {
        method: "POST",
        body: formData,
        headers: { Accept: "application/octet-stream" },
      });

      if (!res.ok) {
        const errText = await res.text();
        throw new Error(`Server error: ${res.status} ${errText}`);
      }

      const blob = await res.blob();
      const outName =
        file.name.replace(/\.pdf$/i, ".docx") || `converted_${Date.now()}.docx`;

      if (Platform.OS === "web") {
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = outName;
        a.click();
        URL.revokeObjectURL(url);

        setLoading(false);
        Alert.alert("Success", "Downloaded");
        return;
      }

      const filePath = `${FileSystem.documentDirectory}${outName}`;
      const base64 = await blobToBase64(blob);

      await FileSystem.writeAsStringAsync(filePath, base64, {
        encoding: FileSystem.EncodingType.Base64,
      });

      await saveRecentFile("PDF to Word", outName, filePath);

      setLoading(false);
      Alert.alert("Converted", "PDF converted to Word successfully");

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(filePath, {
          mimeType:
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
          dialogTitle: "Share converted Word",
        });
      } else {
        Alert.alert("Saved at:", filePath);
      }
    } catch (err: any) {
      console.error("Conversion error:", err);
      Alert.alert("Error", err.message || "Conversion failed");
      setLoading(false);
    }
  };

  const blobToBase64 = (blob: Blob): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () =>
        resolve((reader.result as string).split(",")[1]);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });

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
                <Ionicons name="document-text" size={32} color="#2563eb" />
              </View>
              <Text style={styles.title}>PDF to Word Converter</Text>
            </View>

            {/* SUBTITLE */}
            <Text style={styles.subtitle}>
              Convert PDF to Microsoft Word Document (.docx)
            </Text>

            {/* DROP ZONE */}
            <View style={styles.dropZone}>
              <Text style={styles.dropText}>Drop your PDF file here ↓</Text>

              <TouchableOpacity style={styles.chooseBtn} onPress={pickFile}>
                <Text style={styles.chooseBtnText}>Choose Files</Text>
              </TouchableOpacity>

              <Text style={styles.fileName}>
                {file ? file.name : "No file chosen"}
              </Text>
            </View>

            {/* INFO BOX */}
            <View style={styles.infoBox}>
              <Ionicons name="information-circle" size={20} color="#2563eb" />
              <Text style={styles.infoText}>
                Your PDF will be converted to an editable Word document. Files are not stored permanently.
              </Text>
            </View>

            {/* CONVERT BUTTON */}
            {loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#2563eb" />
                <Text style={styles.loadingText}>
                  Converting to Word, please wait…
                </Text>
              </View>
            ) : (
              <TouchableOpacity
                style={[
                  styles.uploadBtn,
                  { opacity: file ? 1 : 0.5 },
                ]}
                onPress={convertPdfToWord}
                disabled={!file}
              >
                <Ionicons name="swap-vertical" size={20} color="#fff" />
                <Text style={styles.uploadBtnText}>Convert to Word</Text>
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