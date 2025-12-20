import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  FlatList,
  Alert,
  ScrollView,
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

export default function MergePdfScreen() {
  const navigation = useNavigation();
  const [selectedFiles, setSelectedFiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [mergedFileUri, setMergedFileUri] = useState<string | null>(null);

  const pickFiles = async (append = false) => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: "application/pdf",
        multiple: true,
      });

      if (result.assets && result.assets.length > 0) {
        if (append) {
          setSelectedFiles((prev) => [...prev, ...result.assets]);
        } else {
          setSelectedFiles(result.assets);
          setMergedFileUri(null);
        }
      }
    } catch (err) {
      console.log("❌ File Picker Error:", err);
    }
  };

  const moveUp = (index: number) => {
    if (index === 0) return;
    const newList = [...selectedFiles];
    [newList[index - 1], newList[index]] = [newList[index], newList[index - 1]];
    setSelectedFiles(newList);
  };

  const moveDown = (index: number) => {
    if (index === selectedFiles.length - 1) return;
    const newList = [...selectedFiles];
    [newList[index + 1], newList[index]] = [newList[index], newList[index + 1]];
    setSelectedFiles(newList);
  };

  const removeFile = (index: number) => {
    const newList = selectedFiles.filter((_, i) => i !== index);
    setSelectedFiles(newList);
  };

  const mergePDFs = async () => {
    if (selectedFiles.length < 2) {
      Alert.alert("Select at least 2 PDF files");
      return;
    }

    setLoading(true);
    const formData = new FormData();

    selectedFiles.forEach((file) => {
      formData.append("files", {
        uri: file.uri,
        type: "application/pdf",
        name: file.name,
      } as any);
    });

    try {
      const response = await fetch(endpoints.mergePdf, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) throw new Error("Merge failed");

      const blob = await response.blob();
      const fileUri = `${FileSystem.documentDirectory}merged_${Date.now()}.pdf`;

      const base64 = await blobToBase64(blob);
      await FileSystem.writeAsStringAsync(fileUri, base64, {
        encoding: "base64",
      });

      setMergedFileUri(fileUri);

      await saveRecentFile("Merge PDF", "merged.pdf", fileUri);

      setLoading(false);
      Alert.alert("✅ Merge Complete", "Your merged PDF is ready!");
    } catch (error) {
      console.error("❌ Merge Error:", error);
      Alert.alert("Error", "Merge failed. Check backend.");
      setLoading(false);
    }
  };

  const blobToBase64 = (blob: Blob): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve((reader.result as string).split(",")[1]);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });

  const downloadFile = async () => {
    if (!mergedFileUri) return;

    try {
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(mergedFileUri, {
          mimeType: "application/pdf",
          dialogTitle: "Share or Save Merged PDF",
        });
      } else {
        Alert.alert("File saved at:", mergedFileUri);
      }
    } catch {
      Alert.alert("Error", "Unable to share the merged PDF.");
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
                <Ionicons name="albums" size={32} color="#f59e0b" />
              </View>
              <Text style={styles.title}>Merge PDF Files</Text>
            </View>

            {/* SUBTITLE */}
            <Text style={styles.subtitle}>
              Select multiple PDF files to merge into one
            </Text>

            {/* DROP ZONE */}
            <View style={styles.dropZone}>
              <Text style={styles.dropText}>Drop your PDF files here ↓</Text>

              <TouchableOpacity 
                style={styles.chooseBtn} 
                onPress={() => pickFiles(false)}
              >
                <Text style={styles.chooseBtnText}>Choose PDF Files</Text>
              </TouchableOpacity>

              <Text style={styles.fileName}>
                {selectedFiles.length > 0
                  ? `${selectedFiles.length} file(s) selected`
                  : "No file chosen"}
              </Text>
            </View>

            {/* ADD MORE FILES BUTTON */}
            {selectedFiles.length > 0 && (
              <TouchableOpacity
                style={styles.addMoreBtn}
                onPress={() => pickFiles(true)}
              >
                <Ionicons name="add-circle-outline" size={20} color="#2563eb" />
                <Text style={styles.addMoreText}>Add More Files</Text>
              </TouchableOpacity>
            )}

            {/* FILES LIST */}
            {selectedFiles.length > 0 && (
              <View style={styles.filesList}>
                <Text style={styles.filesListTitle}>
                  Selected Files (Drag to reorder):
                </Text>

                {selectedFiles.map((item, index) => (
                  <View key={index} style={styles.fileRow}>
                    <View style={styles.fileInfo}>
                      <Text style={styles.fileNumber}>{index + 1}</Text>
                      <Ionicons name="document-text" size={18} color="#6b7280" />
                      <Text style={styles.fileNameText} numberOfLines={1}>
                        {item.name}
                      </Text>
                    </View>

                    <View style={styles.actions}>
                      <TouchableOpacity
                        onPress={() => moveUp(index)}
                        disabled={index === 0}
                        style={[
                          styles.actionBtn,
                          index === 0 && styles.actionBtnDisabled,
                        ]}
                      >
                        <Ionicons
                          name="arrow-up"
                          size={16}
                          color={index === 0 ? "#d1d5db" : "#6b7280"}
                        />
                      </TouchableOpacity>

                      <TouchableOpacity
                        onPress={() => moveDown(index)}
                        disabled={index === selectedFiles.length - 1}
                        style={[
                          styles.actionBtn,
                          index === selectedFiles.length - 1 && styles.actionBtnDisabled,
                        ]}
                      >
                        <Ionicons
                          name="arrow-down"
                          size={16}
                          color={
                            index === selectedFiles.length - 1
                              ? "#d1d5db"
                              : "#6b7280"
                          }
                        />
                      </TouchableOpacity>

                      <TouchableOpacity
                        onPress={() => removeFile(index)}
                        style={styles.removeBtn}
                      >
                        <Ionicons name="trash-outline" size={16} color="#ef4444" />
                      </TouchableOpacity>
                    </View>
                  </View>
                ))}
              </View>
            )}

            {/* INFO BOX */}
            {selectedFiles.length > 0 && selectedFiles.length < 2 && (
              <View style={styles.warningBox}>
                <Ionicons name="alert-circle" size={20} color="#f59e0b" />
                <Text style={styles.warningText}>
                  Please select at least 2 PDF files to merge
                </Text>
              </View>
            )}

            {/* MERGE BUTTON */}
            {loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#2563eb" />
                <Text style={styles.loadingText}>Merging PDFs, please wait…</Text>
              </View>
            ) : selectedFiles.length >= 2 ? (
              <TouchableOpacity style={styles.mergeBtn} onPress={mergePDFs}>
                <Ionicons name="git-merge-outline" size={20} color="#fff" />
                <Text style={styles.mergeBtnText}>Merge PDFs</Text>
              </TouchableOpacity>
            ) : null}

            {/* DOWNLOAD BUTTON */}
            {mergedFileUri && !loading && (
              <TouchableOpacity style={styles.downloadBtn} onPress={downloadFile}>
                <Ionicons name="download-outline" size={20} color="#fff" />
                <Text style={styles.downloadBtnText}>Download Merged PDF</Text>
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
    maxWidth: 600,
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
    backgroundColor: "#fef3c7",
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
    marginBottom: 16,
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

  addMoreBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#2563eb",
    backgroundColor: "#eff6ff",
    marginBottom: 20,
  },

  addMoreText: {
    fontSize: 15,
    color: "#2563eb",
    fontWeight: "600",
  },

  filesList: {
    backgroundColor: "#f9fafb",
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },

  filesListTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 12,
  },

  fileRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 10,
    paddingHorizontal: 8,
    backgroundColor: "#fff",
    borderRadius: 6,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },

  fileInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flex: 1,
  },

  fileNumber: {
    fontSize: 12,
    fontWeight: "700",
    color: "#9ca3af",
    minWidth: 20,
  },

  fileNameText: {
    fontSize: 13,
    color: "#374151",
    flex: 1,
  },

  actions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginLeft: 8,
  },

  actionBtn: {
    padding: 6,
    borderRadius: 4,
    backgroundColor: "#f3f4f6",
  },

  actionBtnDisabled: {
    opacity: 0.4,
  },

  removeBtn: {
    padding: 6,
    borderRadius: 4,
    backgroundColor: "#fef2f2",
  },

  warningBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "#fffbeb",
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#fde68a",
    marginBottom: 16,
  },

  warningText: {
    fontSize: 13,
    color: "#92400e",
    flex: 1,
  },

  mergeBtn: {
    backgroundColor: "#16a34a",
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
    marginBottom: 12,
  },

  mergeBtnText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },

  downloadBtn: {
    backgroundColor: "#2563eb",
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