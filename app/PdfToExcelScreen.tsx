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

export default function PdfToExcelScreen() {
  const navigation = useNavigation();
  const [file, setFile] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const pickFile = async () => {
    try {
      const result: any = await DocumentPicker.getDocumentAsync({
        type: "application/pdf",
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets?.length > 0) {
        const asset = result.assets[0];
        if (asset.name.toLowerCase().endsWith(".pdf")) {
          setFile(asset);
        } else {
          Alert.alert("Invalid file", "Please select a PDF file.");
        }
      }
    } catch (err) {
      console.error("File pick error:", err);
      Alert.alert("Error", "Could not pick file.");
    }
  };

  const handleConvert = async () => {
    if (!file) return Alert.alert("Please select a PDF file first.");

    try {
      setLoading(true);

      const formData = new FormData();
      formData.append("file", {
        name: file.name,
        type: "application/pdf",
        uri: Platform.OS === "ios" ? file.uri.replace("file://", "") : file.uri,
      } as any);

      const response = await fetch(endpoints.pdfToExcel, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) throw new Error("Conversion failed");

      const arrayBuffer = await response.arrayBuffer();
      const base64Excel = btoa(
        String.fromCharCode(...new Uint8Array(arrayBuffer))
      );

      const outName = `excel_${Date.now()}.xlsx`;
      const filePath = `${FileSystem.documentDirectory}${outName}`;

      await FileSystem.writeAsStringAsync(filePath, base64Excel, {
        encoding: FileSystem.EncodingType.Base64,
      });

      await saveRecentFile("PDF to Excel", outName, filePath);

      Alert.alert("✅ Success", "PDF converted to Excel!");

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(filePath);
      }
    } catch (err) {
      console.error("Conversion error:", err);
      Alert.alert("❌ Error", "Something went wrong during conversion.");
    } finally {
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
                <Ionicons name="grid" size={32} color="#059669" />
              </View>
              <Text style={styles.title}>PDF to Excel Converter</Text>
            </View>

            {/* SUBTITLE */}
            <Text style={styles.subtitle}>
              Select a PDF File to convert to Excel (.xlsx)
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
                This tool will extract tables and data from your PDF and convert them to Excel format
              </Text>
            </View>

            {/* CONVERT BUTTON */}
            {loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#2563eb" />
                <Text style={styles.loadingText}>
                  Converting to Excel, please wait…
                </Text>
              </View>
            ) : (
              <TouchableOpacity
                style={[
                  styles.uploadBtn,
                  { opacity: file ? 1 : 0.5 },
                ]}
                onPress={handleConvert}
                disabled={!file}
              >
                <Ionicons name="download-outline" size={20} color="#fff" />
                <Text style={styles.uploadBtnText}>Convert to Excel</Text>
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
    backgroundColor: "#d1fae5",
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