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
import { endpoints } from "../constants/apiConfig";
import ProtectedScreen from "../components/ProtectedScreen";
import { saveRecentFile } from "../utils/saveRecentFile";
import { useNavigation } from "@react-navigation/native"; 
import Footer from "@/components/Footer";

type PickedFile = {
  uri: string;
  name: string;
  size?: number;
  mimeType?: string;
};

export default function WordToPdfScreen() {
  const navigation = useNavigation()
  const [file, setFile] = useState<PickedFile | null>(null);
  const [loading, setLoading] = useState(false);
  const [backendUrl] = useState(endpoints.wordToPdf);

  const pickFile = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: [
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
          "application/msword",
        ],
        copyToCacheDirectory: true,
      });

      if (result.assets && result.assets.length > 0) {
        const p = result.assets[0];
        setFile({
          uri: p.uri,
          name: p.name ?? "document.docx",
          size: p.size,
          mimeType: p.mimeType,
        });
      } else {
        Alert.alert("No file selected");
      }
    } catch (err) {
      console.error(err);
      Alert.alert("Error", "Failed to pick file");
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

  const convertWordToPdf = async () => {
    if (!file) return Alert.alert("Please choose a Word file first");
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
          name: file.name || "document.docx",
          type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        } as any);
      }

      const res = await fetch(backendUrl, {
        method: "POST",
        body: formData,
        headers: { Accept: "application/pdf" },
      });

      if (!res.ok) {
        const txt = await res.text();
        throw new Error(`Server error ${res.status}: ${txt}`);
      }

      const pdfBlob = await res.blob();
      const outName =
        (file.name || "converted.docx").replace(/\.(docx|doc)$/i, ".pdf");

      if (Platform.OS === "web") {
        const url = window.URL.createObjectURL(pdfBlob);
        const a = document.createElement("a");
        a.href = url;
        a.download = outName;
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
        setLoading(false);
        Alert.alert("Success", "PDF downloaded in browser!");
        return;
      }

      const base64 = await blobToBase64(pdfBlob);
      const outUri = FileSystem.cacheDirectory + outName;

      await FileSystem.writeAsStringAsync(outUri, base64, {
        encoding: FileSystem.EncodingType.Base64,
      });

      await saveRecentFile("Word to PDF", outName, outUri);

      await Sharing.shareAsync(outUri);

      setLoading(false);
      Alert.alert("✅ PDF ready! Use share options to save/open it.");
    } catch (err: any) {
      console.error("Conversion error:", err);
      Alert.alert("Error", err.message || "Conversion failed");
      setLoading(false);
    }
  };

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
              <Text style={styles.title}>Word to PDF Converter</Text>
            </View>

            {/* Dotted Border File Picker Section */}
            <View style={styles.dottedContainer}>
              <Text style={styles.selectText}>Select a Word File (.doc or .docx)</Text>
              
              <View style={styles.dropZone}>
                <Ionicons name="cloud-upload-outline" size={40} color="#999" />
                <Text style={styles.dropText}>Drop your file here ↓</Text>
                
                <TouchableOpacity style={styles.chooseButton} onPress={pickFile}>
                  <Text style={styles.chooseButtonText}>Choose Files</Text>
                </TouchableOpacity>
                
                <Text style={styles.fileStatus}>
                  {file ? file.name : "No file chosen"}
                </Text>
              </View>
            </View>

            {/* Info Section */}
            <View style={styles.infoSection}>
              <View style={styles.infoItem}>
                <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
                <Text style={styles.infoText}>Supports .doc and .docx files</Text>
              </View>
              <View style={styles.infoItem}>
                <Ionicons name="shield-checkmark" size={20} color="#4CAF50" />
                <Text style={styles.infoText}>Files not stored on server</Text>
              </View>
              <View style={styles.infoItem}>
                <Ionicons name="document" size={20} color="#4CAF50" />
                <Text style={styles.infoText}>High quality PDF output</Text>
              </View>
            </View>

            {/* Convert Button */}
            <TouchableOpacity 
              style={[styles.uploadButton, (loading || !file) && styles.uploadButtonDisabled]} 
              onPress={convertWordToPdf} 
              disabled={loading || !file}
            >
              {loading ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator color="#fff" size="small" />
                  <Text style={styles.uploadButtonText}>Converting...</Text>
                </View>
              ) : (
                <>
                  <Ionicons name="download" size={20} color="#fff" />
                  <Text style={styles.uploadButtonText}>Convert & Share</Text>
                </>
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
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
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