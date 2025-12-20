import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  TextInput,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import Footer from "../components/Footer";

export default function Explore() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");

  const tools = [
    { name: "Merge PDF", desc: "Combine multiple PDF files into one with a single click—fast, secure, and easy.", icon: require("../assets/images/merge.png"), page: "/MergePdfScreen" },
    { name: "Split PDF", desc: "Easily split your PDF into multiple files by selecting specific pages or ranges.", icon: require("../assets/images/split.png"), page: "/SplitPdfScreen" },
    { name: "Compress PDF", desc: "Reduce the size of your PDF without losing quality—quick and efficient.", icon: require("../assets/images/compress.png"), page: "/CompressPdfScreen" },
    { name: "PDF to Word", desc: "Convert your PDF documents to editable Word files effortlessly.", icon: require("../assets/images/pdf_word.png"), page: "/PdfToWordScreen" },
    { name: "Word to PDF", desc: "Convert your Word documents to PDF format quickly and easily.", icon: require("../assets/images/word_pdf.png"), page: "/WordToPdfScreen" },
    { name: "Image to PDF", desc: "Convert your JPG images into a single PDF file quickly and easily.", icon: require("../assets/images/img_pdf.png"), page: "/ImageToPdfScreen" },
    { name: "PDF to Image", desc: "Convert your PDF Files into Image format effortlessly.", icon: require("../assets/images/pdf_img.png"), page: "/PdfToImageScreen" },
    { name: "Image Compress", desc: "Reduce the size of your Images without losing quality—quick and efficient", icon: require("../assets/images/img_compress.jpg"), page: "/ImageCompressScreen" },
    { name: "Protect PDF", desc: "Secure your PDF with a password to protect your documents from unauthorized access.", icon: require("../assets/images/protect.png"), page: "/ProtectPdfScreen" },
    { name: "Unlock PDF", desc: "Unlock password-protected PDFs and access your content with ease.", icon: require("../assets/images/unlock.png"), page: "/UnlockPdfScreen" },
    { name: "Add Watermark", desc: "Add custom watermarks to your PDFs for branding or protection with ease.", icon: require("../assets/images/watermark.png"), page: "/WatermarkPdfScreen" },
    { name: "PPT to PDF", desc: "Convert your PowerPoint presentations to PDF format in just a few clicks.", icon: require("../assets/images/ppt_pdf.png"), page: "/PptToPdfScreen" },
    { name: "PDF to PPT", desc: "Transform your PDF into a fully editable PowerPoint presentation in seconds.", icon: require("../assets/images/pdf_ppt.png"), page: "/PdfToPptScreen" },
    { name: "PDF to Excel", desc: "Convert your PDF data into an editable Excel spreadsheet with ease.", icon: require("../assets/images/pdf_excel.png"), page: "/PdfToExcelScreen" },
    { name: "Excel to PDF", desc: "Convert your Excel files to PDF format in just a few clicks.", icon: require("../assets/images/excel_pdf.png"), page: "/ExcelToPdfScreen" },
    { name: "Sign PDF", desc: "Add your signature to PDF documents securely and effortlessly.", icon: require("../assets/images/sign.png"), page: "/SignPdfScreen" },
  ];

  // Filter tools based on searchQuery
  const filteredTools = tools.filter(tool =>
    tool.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#ffffff" }}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={26} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Explore Tool Sets</Text>
      </View>

      {/* Search Bar */}
      <View style={styles.searchBox}>
        <Ionicons name="search" size={20} color="#999" style={{ marginRight: 8 }} />
        <TextInput
          placeholder="Search Your Tool Sets"
          placeholderTextColor="#888"
          style={{ flex: 1, fontSize: 16 }}
          value={searchQuery} // bind state
          onChangeText={setSearchQuery} // update state
        />
        <Ionicons name="mic-outline" size={22} color="#777" />
      </View>

      {/* Tools List */}
      <ScrollView style={{ paddingHorizontal: 15, marginTop: 10 }} showsVerticalScrollIndicator={false}>
        {filteredTools.length > 0 ? (
          filteredTools.map((tool, index) => (
            <TouchableOpacity
              key={index}
              style={styles.card}
              onPress={() => router.push(tool.page)}
            >
              <Image source={tool.icon} style={styles.icon} />
              <View style={{ flex: 1 }}>
                <Text style={styles.cardTitle}>{tool.name}</Text>
                <Text style={styles.cardDesc}>{tool.desc}</Text>
              </View>
              <Ionicons style={styles.arrow} name="chevron-forward" size={22} />
            </TouchableOpacity>
          ))
        ) : (
          <Text style={{ textAlign: "center", marginTop: 50, color: "#555" }}>
            No tools found.
          </Text>
        )}
      </ScrollView>

      <Footer />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: "#2979FF",
    height: 80,
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
    gap: 15,
  },
  headerTitle: { fontSize: 20, color: "#fff", fontWeight: "700" },

  searchBox: {
    backgroundColor: "#fff",
    marginTop: 20,
    marginHorizontal: 25,
    marginBottom: 20,
    height: 50,
    borderRadius: 12,
    paddingHorizontal: 15,
    flexDirection: "row",
    alignItems: "center",
    elevation: 4,
  },

  card: {
    flexDirection: "row",
    backgroundColor: "#fff",
    padding: 25,
    borderRadius: 14,
    alignItems: "center",
    marginBottom: 25,
    elevation: 3,
    shadowColor: "#000",
  },

  icon: { width: 55, height: 55, marginRight: 12 },

  cardTitle: { fontSize: 17, fontWeight: "700", marginBottom: 3 },

  cardDesc: { fontSize: 15, color: "#555", width: "90%" },

  arrow: { backgroundColor: "#2979FF", padding: 2, borderWidth: 1, color: "white", borderRadius: 10 },
});
