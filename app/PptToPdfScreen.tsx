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
import { endpoints } from "../constants/apiConfig";
import { saveRecentFile } from "../utils/saveRecentFile";
import ProtectedScreen from "../components/ProtectedScreen";
import { useNavigation } from "@react-navigation/native"; 
import Footer from "../components/Footer";


export default function PptToPdfScreen() {
  const navigation = useNavigation()
  const [loading, setLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);

  const handleConvert = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: [
          "application/vnd.ms-powerpoint",
          "application/vnd.openxmlformats-officedocument.presentationml.presentation",
          "*/*",
        ],
        copyToCacheDirectory: true,
      });

      if (!result || !result.assets || result.assets.length === 0) {
        Alert.alert("No file selected");
        return;
      }

      const p = result.assets[0];
      const fileUri = p.uri ?? "";
      const fileName = p.name ?? "presentation.pptx";

      if (!fileUri) {
        Alert.alert("Invalid file", "File URI is missing");
        return;
      }

      setSelectedFile(fileName);
      setLoading(true);

      const formData = new FormData();
      formData.append("file", {
        uri: fileUri,
        name: fileName,
        type:
          "application/vnd.openxmlformats-officedocument.presentationml.presentation",
      } as any);

      const response = await fetch(endpoints.pptToPdf, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) throw new Error("Conversion failed!");

      const blob = await response.blob();
      const base64 = await blobToBase64(blob);

      const outFileName = fileName.replace(/\.(ppt|pptx)$/i, ".pdf");
      const filePath = FileSystem.cacheDirectory + outFileName;

      await FileSystem.writeAsStringAsync(filePath, base64, {
        encoding: FileSystem.EncodingType.Base64,
      });

      await saveRecentFile("PPT to PDF", outFileName, filePath);

      Alert.alert("✅ Success", "PPT converted to PDF successfully!");

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(filePath);
      } else {
        Alert.alert("Done", `File stored temporarily at:\n${filePath}`);
      }

      setSelectedFile(null);
    } catch (error: any) {
      console.error("Conversion error:", error);
      Alert.alert(
        "❌ Error",
        typeof error === "string" ? error : error?.message ?? "Something went wrong"
      );
    } finally {
      setLoading(false);
    }
  };

  const blobToBase64 = (blob: Blob): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () =>
        resolve(reader.result?.toString().split(",")[1] ?? "");
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });

  return (
    <ProtectedScreen>
      <View style={styles.container}>
        {/* Blue Header with Back Button */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="#fff" />
            <Text style={styles.backText}>Back</Text>
          </TouchableOpacity>
        </View>

        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Card Container */}
          <View style={styles.card}>
            {/* Title with Icon */}
            <View style={styles.titleContainer}>
              <View style={styles.iconWrapper}>
                <Ionicons name="document-text" size={28} color="#fff" />
              </View>
              <Text style={styles.title}>PPT to PDF Converter</Text>
            </View>

            {/* Dotted Border File Picker Section */}
            <View style={styles.dottedContainer}>
              <Text style={styles.selectText}>Select a PPT File (.ppt or .pptx)</Text>
              
              <View style={styles.dropZone}>
                <Ionicons name="cloud-upload-outline" size={40} color="#999" />
                <Text style={styles.dropText}>Drop your file here ↓</Text>
                
                <TouchableOpacity style={styles.chooseButton} onPress={handleConvert}>
                  <Text style={styles.chooseButtonText}>Choose Files</Text>
                </TouchableOpacity>
                
                <Text style={styles.fileStatus}>
                  {selectedFile || "No file chosen"}
                </Text>
              </View>
            </View>

            {/* Info Section */}
            <View style={styles.infoSection}>
              <View style={styles.infoItem}>
                <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
                <Text style={styles.infoText}>Supports .ppt and .pptx files</Text>
              </View>
              <View style={styles.infoItem}>
                <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
                <Text style={styles.infoText}>High quality PDF output</Text>
              </View>
              <View style={styles.infoItem}>
                <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
                <Text style={styles.infoText}>Fast conversion process</Text>
              </View>
            </View>

            {/* Upload/Convert Button */}
            <TouchableOpacity 
              style={[styles.uploadButton, loading && styles.uploadButtonDisabled]} 
              onPress={handleConvert} 
              disabled={loading}
            >
              {loading ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator color="#fff" size="small" />
                  <Text style={styles.uploadButtonText}>Converting...</Text>
                </View>
              ) : (
                <Text style={styles.uploadButtonText}>Convert to PDF</Text>
              )}
            </TouchableOpacity>
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
    backgroundColor: "#2196F3",
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
  },
  backText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
    marginLeft: 8,
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
    maxWidth: 400,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
  },
  iconWrapper: {
    width: 50,
    height: 50,
    borderRadius: 12,
    backgroundColor: "#2196F3",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    flex: 1,
  },
  dottedContainer: {
    borderWidth: 2,
    borderStyle: "dashed",
    borderColor: "#ccc",
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    alignItems: "center",
  },
  selectText: {
    fontSize: 14,
    color: "#666",
    marginBottom: 16,
  },
  dropZone: {
    alignItems: "center",
    width: "100%",
  },
  dropText: {
    fontSize: 14,
    color: "#999",
    marginTop: 8,
    marginBottom: 16,
  },
  chooseButton: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 24,
    paddingVertical: 10,
    paddingHorizontal: 24,
    marginBottom: 12,
  },
  chooseButtonText: {
    color: "#333",
    fontSize: 14,
    fontWeight: "500",
  },
  fileStatus: {
    fontSize: 13,
    color: "#666",
    textAlign: "center",
  },
  infoSection: {
    marginBottom: 20,
  },
  infoItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  infoText: {
    fontSize: 14,
    color: "#666",
    marginLeft: 10,
  },
  uploadButton: {
    backgroundColor: "#2196F3",
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 10,
    shadowColor: "#2196F3",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  uploadButtonDisabled: {
    backgroundColor: "#90CAF9",
  },
  uploadButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  loadingContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
});