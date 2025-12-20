import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  TextInput,
  ScrollView,
} from "react-native";
import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";
import { Ionicons } from "@expo/vector-icons";
import Slider from '@react-native-community/slider';
import { endpoints } from "../constants/apiConfig";
import ProtectedScreen from "../components/ProtectedScreen";
import { saveRecentFile } from "../utils/saveRecentFile";
import { useNavigation } from "@react-navigation/native"; 
import Footer from "../components/Footer";


export default function PdfWatermarkScreen() {
  const navigation = useNavigation();
  const [file, setFile] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [text, setText] = useState("CONFIDENTIAL");
  const [position, setPosition] = useState("middle");
  const [align, setAlign] = useState("horizontal");
  const [opacity, setOpacity] = useState(0.2);

  const pickFile = async () => {
    const result = await DocumentPicker.getDocumentAsync({ type: "application/pdf" });
    if (result.assets?.length) setFile(result.assets[0]);
  };

  const handleConvert = async () => {
    if (!file) return Alert.alert("Please select a PDF file first.");
    try {
      setLoading(true);

      const formData = new FormData();
      formData.append("file", {
        uri: file.uri,
        name: file.name,
        type: "application/pdf",
      } as any);
      formData.append("text", text);
      formData.append("position", position);
      formData.append("align", align);
      formData.append("opacity", opacity.toString());

      const response = await fetch(endpoints.addWatermark, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) throw new Error("Watermarking failed");

      const blob = await response.blob();
      const base64 = await blobToBase64(blob);
      const filePath = `${FileSystem.documentDirectory}watermarked.pdf`;

      await FileSystem.writeAsStringAsync(filePath, base64, {
        encoding: FileSystem.EncodingType.Base64,
      });

      await saveRecentFile(
        "Add Watermark",
        "watermarked.pdf",
        filePath
      );

      Alert.alert("✅ Done!", "Watermark added successfully.");

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(filePath);
      }

    } catch (err) {
      console.error(err);
      Alert.alert("❌ Error", "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const blobToBase64 = (blob: Blob) =>
    new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result?.toString().split(",")[1] || "");
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
                <Ionicons name="water" size={28} color="#fff" />
              </View>
              <Text style={styles.title}>PDF Watermark Tool</Text>
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

            {/* Watermark Text Input */}
            <View style={styles.section}>
              <Text style={styles.label}>Watermark Text</Text>
              <TextInput
                value={text}
                onChangeText={setText}
                placeholder="Enter watermark text"
                style={styles.input}
              />
            </View>

            {/* Position Selection */}
            <View style={styles.section}>
              <Text style={styles.label}>Position</Text>
              <View style={styles.row}>
                <TouchableOpacity
                  style={[styles.option, position === "top" && styles.active]}
                  onPress={() => setPosition("top")}
                >
                  <Text style={[styles.optionText, position === "top" && styles.activeText]}>
                    Top
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.option, position === "middle" && styles.active]}
                  onPress={() => setPosition("middle")}
                >
                  <Text style={[styles.optionText, position === "middle" && styles.activeText]}>
                    Middle
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.option, position === "bottom" && styles.active]}
                  onPress={() => setPosition("bottom")}
                >
                  <Text style={[styles.optionText, position === "bottom" && styles.activeText]}>
                    Bottom
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Alignment Selection */}
            <View style={styles.section}>
              <Text style={styles.label}>Alignment</Text>
              <View style={styles.row}>
                <TouchableOpacity
                  style={[styles.option, align === "horizontal" && styles.active]}
                  onPress={() => setAlign("horizontal")}
                >
                  <Text style={[styles.optionText, align === "horizontal" && styles.activeText]}>
                    Horizontal
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.option, align === "vertical" && styles.active]}
                  onPress={() => setAlign("vertical")}
                >
                  <Text style={[styles.optionText, align === "vertical" && styles.activeText]}>
                    Vertical
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Opacity Slider */}
            <View style={styles.section}>
              <Text style={styles.label}>Opacity: {opacity.toFixed(2)}</Text>
              <Slider
                style={styles.slider}
                minimumValue={0.1}
                maximumValue={1}
                value={opacity}
                onValueChange={setOpacity}
                minimumTrackTintColor="#2196F3"
                maximumTrackTintColor="#ddd"
                thumbTintColor="#2196F3"
              />
            </View>

            {/* Upload/Convert Button */}
            <TouchableOpacity 
              style={styles.uploadButton} 
              onPress={handleConvert} 
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.uploadButtonText}>Add Watermark</Text>
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
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    padding: 12,
    fontSize: 15,
    backgroundColor: "#fafafa",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
  },
  option: {
    flex: 1,
    padding: 12,
    borderWidth: 1,
    borderRadius: 10,
    borderColor: "#ddd",
    backgroundColor: "#fff",
    alignItems: "center",
  },
  active: {
    backgroundColor: "#2196F3",
    borderColor: "#2196F3",
  },
  optionText: {
    fontSize: 14,
    color: "#666",
    fontWeight: "500",
  },
  activeText: {
    color: "#fff",
  },
  slider: {
    width: "100%",
    height: 40,
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
  uploadButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});