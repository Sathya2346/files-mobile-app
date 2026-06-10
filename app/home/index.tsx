import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { 
  Dimensions, 
  ScrollView, 
  StyleSheet, 
  Text, 
  TextInput,
  TouchableOpacity, 
  View,
  Image,
  ImageSourcePropType
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Header from "../../components/Navbar";
import Footer from "../../components/Footer";

type Tool = {
  name: string;
  icon: keyof typeof Ionicons.glyphMap | ImageSourcePropType; // <-- vector icon or local image
  color: string;
  page: string;
};

const { width } = Dimensions.get("window");

export default function Home() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");

  const tools: Tool[] = [
    { name: "Merge PDFs", icon: require("../../assets/images/merge.png"), color: "#e2dbd9ff", page: "MergePdfScreen" },
    { name: "Compress PDF", icon: require("../../assets/images/compress.png"), color: "#e2dbd9ff", page: "CompressPdfScreen" },
    { name: "Split PDF", icon: require("../../assets/images/split.png"), color: "#e2dbd9ff", page: "SplitPdfScreen" },
    { name: "PDF → Word", icon: require("../../assets/images/pdf_word.png"), color: "#e2dbd9ff", page: "PdfToWordScreen" },
    { name: "Word → PDF", icon: require("../../assets/images/word_pdf.png"), color: "#e2dbd9ff", page: "WordToPdfScreen" },
    { name: "Image → PDF", icon: require("../../assets/images/img_pdf.png"), color: "#e2dbd9ff", page: "ImageToPdfScreen" },
    { name: "PDF → Image", icon: require("../../assets/images/pdf_img.png"), color: "#e2dbd9ff", page: "PdfToImagesScreen" },
    { name: "Image Compress", icon: require("../../assets/images/img_compress.jpg"), color: "#e2dbd9ff", page: "ImageCompressScreen" },
    { name: "Protect PDF", icon: require("../../assets/images/protect.png"), color: "#e2dbd9ff", page: "ProtectPdfScreen" },
    { name: "Unlock PDF", icon: require("../../assets/images/unlock.png"), color: "#e2dbd9ff", page: "UnlockPdfScreen" },
    { name: "PDF → PPT", icon: require("../../assets/images/pdf_ppt.png"), color: "#e2dbd9ff", page: "PdfToPptScreen" },
    { name: "PPT → PDF", icon: require("../../assets/images/ppt_pdf.png"), color: "#e2dbd9ff", page: "PptToPdfScreen" },
    { name: "Add WaterMark", icon: require("../../assets/images/watermark.png"), color: "#e2dbd9ff", page: "PdfWatermarkScreen" },
    { name: "PDF → Excel", icon: require("../../assets/images/pdf_excel.png"), color: "#e2dbd9ff", page: "PdfToExcelScreen" },
    { name: "Excel → PDF", icon: require("../../assets/images/excel_pdf.png"), color: "#e2dbd9ff", page: "ExcelToPdfScreen" },
    { name: "Sign PDF", icon: require("../../assets/images/sign.png"), color: "#e2dbd9ff", page: "PdfSignScreen" },
  ];

  const filteredTools = tools.filter(tool =>
    tool.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header />

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <View style={styles.searchBar}>
            <Ionicons name="search" size={20} color="#999" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search Your Tool Sets"
              placeholderTextColor="#999"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            <TouchableOpacity>
              {/* <Ionicons name="mic-outline" size={20} color="#999" /> */}
            </TouchableOpacity>
          </View>
        </View>

        {/* Banner Card */}
        <View style={styles.bannerCard}>
          <Text style={styles.bannerText}>
            Merge, split, compress, convert, rotate, unlock, and watermark your files with ease.
          </Text>
          <View style={styles.ratingRow}>
            <Ionicons name="star" size={16} color="#FFD700" />
            <Text style={styles.ratingText}>4.8</Text>
            <Text style={styles.ratingSubText}>(2k+ Reviews)</Text>
          </View>
          <TouchableOpacity 
            style={styles.exploreButton} 
            onPress={() => router.push("/Explore")} // navigate to Explore page
          >
            <Text style={styles.exploreButtonText}>Explore Now</Text>
            <Ionicons name="arrow-forward" size={16} color="#000" />
          </TouchableOpacity>
        </View>

        {/* Description Section */}
        <View style={styles.descriptionSection}>
          <Text style={styles.sectionTitle}>All-in-One PDF Toolset for Seamless Workflows</Text>
          <Text style={styles.descriptionText}>
            Our tools are 100% FREE, user-friendly, and designed to make your tasks simpler and faster.
          </Text>
        </View>

        {/* Tools Grid */}
        <View style={styles.toolsSection}>
          <Text style={styles.toolsTitle}>Explore Tool sets</Text>
          <View style={styles.toolsGrid}>
            {filteredTools.map((tool, index) => (
              <TouchableOpacity
                key={index}
                style={styles.toolCard}
                activeOpacity={0.7}
                onPress={() => router.push(`/${tool.page}`)}
              >
                <View style={[styles.toolIconCircle, { backgroundColor: tool.color }]}>
                  {typeof tool.icon === "string" ? (
                    <Ionicons name={tool.icon} size={28} color="#fff" />
                  ) : (
                    <Image source={tool.icon} style={styles.icon} />
                  )}
                </View>
                <Text style={styles.toolName}>{tool.name}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>

      <Footer />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#F5F5F5" },
  scrollView: { flex: 1 },
  scrollContent: { paddingBottom: 100 },

  searchContainer: { paddingHorizontal: 20, paddingTop: 15, paddingBottom: 10 },
  searchBar: { flexDirection: "row", alignItems: "center", backgroundColor: "#FFF", borderRadius: 25, paddingHorizontal: 15, paddingVertical: 12, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
  searchIcon: { marginRight: 10 },
  searchInput: { flex: 1, fontSize: 14, color: "#333" },

  bannerCard: { marginHorizontal: 20, marginTop: 10, marginBottom: 20, backgroundColor: "#1E88E5", borderRadius: 20, padding: 20, shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 5 },
  bannerText: { color: "#FFF", fontSize: 14, lineHeight: 20, marginBottom: 12 },
  ratingRow: { flexDirection: "row", alignItems: "center", marginBottom: 15 },
  ratingText: { color: "#FFF", fontSize: 14, fontWeight: "bold", marginLeft: 5 },
  ratingSubText: { color: "#FFF", fontSize: 12, marginLeft: 5, opacity: 0.9 },
  exploreButton: { flexDirection: "row", alignItems: "center", backgroundColor: "#FFF", alignSelf: "flex-start", paddingHorizontal: 20, paddingVertical: 10, borderRadius: 20, gap: 8 },
  exploreButtonText: { color: "#000", fontSize: 14, fontWeight: "bold" },

  descriptionSection: { paddingHorizontal: 20, marginBottom: 20 },
  sectionTitle: { fontSize: 16, fontWeight: "bold", color: "#333", marginBottom: 8 },
  descriptionText: { fontSize: 13, color: "#666", lineHeight: 20 },

  toolsSection: { paddingHorizontal: 20, marginBottom: 20 },
  toolsTitle: { fontSize: 18, fontWeight: "bold", color: "#333", marginBottom: 15 },
  toolsGrid: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between" },
  toolCard: { width: (width - 60) / 4, alignItems: "center", marginBottom: 20 },
  toolIconCircle: { width: 60, height: 60, borderRadius: 30, justifyContent: "center", alignItems: "center", marginBottom: 8, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.15, shadowRadius: 4, elevation: 4 },
  icon: { width: 28, height: 28, resizeMode: "contain" },
  toolName: { fontSize: 11, color: "#333", textAlign: "center", fontWeight: "500" },
});
