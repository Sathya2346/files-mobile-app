import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  ActivityIndicator,
  Alert,
  ScrollView,
} from "react-native";
import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";
import { Ionicons } from "@expo/vector-icons";
import ProtectedScreen from "../components/ProtectedScreen";
import { endpoints } from "../constants/apiConfig";
import { saveRecentFile } from "../utils/saveRecentFile";
import { useNavigation } from "@react-navigation/native"; 
import Footer from "../components/Footer";

export default function UnlockPdfScreen() {
  const navigation = useNavigation()
  const [pdfUri, setPdfUri] = useState<string | null>(null);
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null);
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [isUnlocked, setIsUnlocked] = useState(false);

  const pickPdf = async () => {
    try {
      const res = await DocumentPicker.getDocumentAsync({
        type: "application/pdf",
        copyToCacheDirectory: true,
      });

      if (res.canceled || !res.assets?.[0]?.uri) return;

      setPdfUri(res.assets[0].uri);
      setSelectedFileName(res.assets[0].name || "document.pdf");
      setIsUnlocked(false);
      Alert.alert("PDF Selected", "Now enter password and tap Unlock");
    } catch (err) {
      Alert.alert("Error", "Failed to pick PDF");
    }
  };

  const arrayBufferToBase64 = (buffer: ArrayBuffer) => {
    let binary = "";
    const bytes = new Uint8Array(buffer);
    const chunk = 0x8000;

    for (let i = 0; i < bytes.length; i += chunk) {
      binary += String.fromCharCode.apply(null, Array.from(bytes.subarray(i, i + chunk)));
    }

    return btoa(binary);
  };

  const unlockPdf = async () => {
    if (!pdfUri) return Alert.alert("Missing PDF", "Please choose a PDF first");
    if (!password) return Alert.alert("Missing Password", "Enter the password");

    try {
      setLoading(true);

      const form = new FormData();
      form.append("pdf", {
        uri: pdfUri,
        type: "application/pdf",
        name: "locked.pdf",
      } as any);
      form.append("password", password);

      const res = await fetch(endpoints.unlockPdf, { method: "POST", body: form });

      if (!res.ok) {
        let message = "Failed to unlock PDF";
        try {
          const j = await res.json();
          if (j?.detail) message = j.detail;
        } catch {}
        throw new Error(message);
      }

      const arrayBuffer = await res.arrayBuffer();
      const base64 = arrayBufferToBase64(arrayBuffer);

      const outName = `unlocked_${Date.now()}.pdf`;
      const outPath = `${FileSystem.documentDirectory}${outName}`;

      await FileSystem.writeAsStringAsync(outPath, base64, {
        encoding: FileSystem.EncodingType.Base64,
      });

      await saveRecentFile("Unlock PDF", outName, outPath);

      setPdfUri(outPath);
      setIsUnlocked(true);

      Alert.alert("Success", "PDF unlocked! Tap Share to open or send.");
    } catch (err: any) {
      Alert.alert("Error", err?.message || "Unlock failed");
    } finally {
      setLoading(false);
    }
  };

  const sharePdf = async () => {
    if (!pdfUri) return Alert.alert("No unlocked PDF yet");

    try {
      await Sharing.shareAsync(pdfUri, {
        mimeType: "application/pdf",
        dialogTitle: "Share Unlocked PDF",
      });
    } catch {
      Alert.alert("Error", "Failed to share PDF");
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
                <Ionicons name="lock-open" size={28} color="#fff" />
              </View>
              <Text style={styles.title}>Unlock PDF</Text>
            </View>

            {/* Dotted Border File Picker Section */}
            <View style={styles.dottedContainer}>
              <Text style={styles.selectText}>Select a Locked PDF File</Text>
              
              <View style={styles.dropZone}>
                <Ionicons name="cloud-upload-outline" size={40} color="#999" />
                <Text style={styles.dropText}>Drop your file here ↓</Text>
                
                <TouchableOpacity style={styles.chooseButton} onPress={pickPdf}>
                  <Text style={styles.chooseButtonText}>Choose Files</Text>
                </TouchableOpacity>
                
                <Text style={styles.fileStatus}>
                  {selectedFileName || "No file chosen"}
                </Text>
              </View>
            </View>

            {/* Password Input Section */}
            <View style={styles.section}>
              <Text style={styles.label}>PDF Password</Text>
              <View style={styles.passwordContainer}>
                <Ionicons name="key-outline" size={20} color="#666" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Enter PDF password"
                  secureTextEntry
                  value={password}
                  onChangeText={setPassword}
                  placeholderTextColor="#999"
                />
              </View>
            </View>

            {/* Info Section */}
            <View style={styles.infoSection}>
              <View style={styles.infoItem}>
                <Ionicons name="lock-open" size={20} color="#4CAF50" />
                <Text style={styles.infoText}>Remove password protection</Text>
              </View>
              <View style={styles.infoItem}>
                <Ionicons name="shield-checkmark" size={20} color="#4CAF50" />
                <Text style={styles.infoText}>Secure processing</Text>
              </View>
              <View style={styles.infoItem}>
                <Ionicons name="document-text" size={20} color="#4CAF50" />
                <Text style={styles.infoText}>Original content preserved</Text>
              </View>
            </View>

            {/* Unlock Button */}
            <TouchableOpacity 
              style={[styles.uploadButton, loading && styles.uploadButtonDisabled]} 
              onPress={unlockPdf} 
              disabled={loading || !pdfUri}
            >
              {loading ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator color="#fff" size="small" />
                  <Text style={styles.uploadButtonText}>Unlocking...</Text>
                </View>
              ) : (
                <>
                  <Ionicons name="lock-open" size={20} color="#fff" />
                  <Text style={styles.uploadButtonText}>Unlock PDF</Text>
                </>
              )}
            </TouchableOpacity>

            {/* Share Button (shows after unlock) */}
            {isUnlocked && (
              <TouchableOpacity 
                style={styles.downloadButton} 
                onPress={sharePdf}
              >
                <Ionicons name="share-social" size={20} color="#fff" />
                <Text style={styles.downloadButtonText}>Share Unlocked PDF</Text>
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
  passwordContainer: {
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
  downloadButton: {
    backgroundColor: "#4CAF50",
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
    marginTop: 12,
    shadowColor: "#4CAF50",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  downloadButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});