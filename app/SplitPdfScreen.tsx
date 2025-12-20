import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  TextInput,
  Platform,
  ScrollView,
} from "react-native";

import * as DocumentPicker from "expo-document-picker";
import * as Sharing from "expo-sharing";
import { Ionicons } from "@expo/vector-icons";
import * as FileSystem from "expo-file-system/legacy";
import { endpoints } from "../constants/apiConfig";
import ProtectedScreen from "../components/ProtectedScreen";
import { saveRecentFile } from "../utils/saveRecentFile";
import { useNavigation } from "@react-navigation/native"; 
import Footer from "../components/Footer";

type PickedFile = {
  type: "success";
  uri: string;
  name: string;
  size?: number;
};

export default function SplitPdfScreen() {
  const navigation = useNavigation()
  const [file, setFile] = useState<PickedFile | null>(null);
  const [pageRange, setPageRange] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  const pickFile = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: "application/pdf",
        copyToCacheDirectory: true,
      });

      if (result.canceled) {
        Alert.alert("Cancelled", "You did not select a PDF file.");
        return;
      }

      const pickedFile = result.assets[0];

      setFile({
        type: "success",
        uri: pickedFile.uri,
        name: pickedFile.name,
        size: pickedFile.size,
      });
    } catch (err) {
      Alert.alert("Error", "Failed to pick a PDF file.");
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

  const splitPDF = async () => {
    if (!file) return Alert.alert("Please select a PDF");
    if (!pageRange.trim())
      return Alert.alert("Enter page range (e.g. 1-1, 4-6)");

    const validFormat = /^(\d+-\d+)(\s*,\s*\d+-\d+)*$/;
    if (!validFormat.test(pageRange.trim())) {
      return Alert.alert(
        "Invalid Input",
        "Use format like: 1-1, 4-6"
      );
    }

    setLoading(true);

    try {
      const formData = new FormData();

      if (Platform.OS === "web") {
        const res = await fetch(file.uri);
        const blob = await res.blob();
        const webFile = new File([blob], file.name, {
          type: "application/pdf",
        });
        formData.append("file", webFile);
      } else {
        formData.append("file", {
          uri: file.uri,
          name: file.name,
          type: "application/pdf",
        } as any);
      }

      formData.append("range", pageRange.trim());

      const res = await fetch(endpoints.splitPdf, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(`Split failed: ${text}`);
      }

      const blob = await res.blob();

      const isZip = res.headers
        .get("Content-Type")
        ?.includes("application/zip");

      const outputName = isZip
        ? `split_files_${Date.now()}.zip`
        : `split_${Date.now()}.pdf`;

      const outputPath =
        FileSystem.documentDirectory + outputName;

      const base64 = await blobToBase64(blob);

      await FileSystem.writeAsStringAsync(outputPath, base64, {
        encoding: "base64",
      });

      await saveRecentFile(
        "Split PDF",
        outputName,
        outputPath
      );

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(outputPath);
      } else {
        Alert.alert("Saved", `File saved to: ${outputPath}`);
      }
    } catch (err: any) {
      Alert.alert(
        "Error",
        err.message || "Split failed. Check backend or range input."
      );
    } finally {
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
                <Ionicons name="cut" size={28} color="#fff" />
              </View>
              <Text style={styles.title}>Split PDF</Text>
            </View>

            {/* Dotted Border File Picker Section */}
            <View style={styles.dottedContainer}>
              <Text style={styles.selectText}>Select a PDF File</Text>
              
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

            {/* Page Range Input Section */}
            <View style={styles.section}>
              <Text style={styles.label}>Page Range</Text>
              <View style={styles.inputContainer}>
                <Ionicons name="albums-outline" size={20} color="#666" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Enter page ranges (Ex: 1-1, 4-6)"
                  placeholderTextColor="#999"
                  value={pageRange}
                  onChangeText={setPageRange}
                />
              </View>
              <Text style={styles.helperText}>
                Format: 1-1, 4-6 (comma-separated ranges)
              </Text>
            </View>

            {/* Info Section */}
            <View style={styles.infoSection}>
              <View style={styles.infoItem}>
                <Ionicons name="document-text" size={20} color="#4CAF50" />
                <Text style={styles.infoText}>Split by specific page ranges</Text>
              </View>
              <View style={styles.infoItem}>
                <Ionicons name="archive" size={20} color="#4CAF50" />
                <Text style={styles.infoText}>Multiple files in ZIP format</Text>
              </View>
              <View style={styles.infoItem}>
                <Ionicons name="flash" size={20} color="#4CAF50" />
                <Text style={styles.infoText}>Fast and efficient splitting</Text>
              </View>
            </View>

            {/* Split Button */}
            <TouchableOpacity 
              style={[styles.uploadButton, loading && styles.uploadButtonDisabled]} 
              onPress={splitPDF} 
              disabled={loading || !file}
            >
              {loading ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator color="#fff" size="small" />
                  <Text style={styles.uploadButtonText}>Splitting...</Text>
                </View>
              ) : (
                <>
                  <Ionicons name="cut" size={20} color="#fff" />
                  <Text style={styles.uploadButtonText}>Split PDF</Text>
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
  section: {
    marginBottom: 20,
    width: "100%",
  },
  label: {
    fontSize: 15,
    fontWeight: "600",
    color: "#333",
    marginBottom: 10,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    backgroundColor: "#fafafa",
    paddingHorizontal: 12,
  },
  inputIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    padding: 12,
    fontSize: 15,
    color: "#333",
  },
  helperText: {
    fontSize: 12,
    color: "#999",
    marginTop: 6,
    fontStyle: "italic",
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