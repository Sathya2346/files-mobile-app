import React, { useRef, useState } from "react";
import {
    ActivityIndicator,
    Image,
    PanResponder,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { endpoints } from "../constants/apiConfig";
import Slider from "@react-native-community/slider";
import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system/legacy";
import * as ImagePicker from "expo-image-picker";
import * as Sharing from "expo-sharing";
import SignatureScreen from "react-native-signature-canvas";
import Svg, { Text as SvgText } from "react-native-svg";
import { captureRef } from "react-native-view-shot";
import ProtectedScreen from "../components/ProtectedScreen";
import { saveRecentFile } from "../utils/saveRecentFile";
import Footer from "../components/Footer";


export default function PdfSignScreen() {
    const navigation = useNavigation();
    const [pdfFile, setPdfFile] = useState<any>(null);
    const [pdfImagePreview, setPdfImagePreview] = useState<string | null>(null);

    const [renderedWidth, setRenderedWidth] = useState(0);
    const [renderedHeight, setRenderedHeight] = useState(0);

    const [pdfPixmapW, setPdfPixmapW] = useState(0);
    const [pdfPixmapH, setPdfPixmapH] = useState(0);

    const [signatureDraw, setSignatureDraw] = useState<string | null>(null);
    const [textSignature, setTextSignature] = useState("");
    const [imageSignature, setImageSignature] = useState<string | null>(null);

    const [sigScale, setSigScale] = useState(1);
    const [loading, setLoading] = useState(false);
    const [scrollEnabled, setScrollEnabled] = useState(true);

    const signatureRef = useRef<any>(null);
    const textToImageRef = useRef<View>(null);

    const [sigX, setSigX] = useState(50);
    const [sigY, setSigY] = useState(50);
    const dragStart = useRef({ x: 0, y: 0, sigX: 50, sigY: 50 });

    const panResponder = useRef(
        PanResponder.create({
            onStartShouldSetPanResponder: () => true,
            onMoveShouldSetPanResponder: () => true,
            onPanResponderGrant: (_e, gesture) => {
                dragStart.current = { x: gesture.x0, y: gesture.y0, sigX, sigY };
            },
            onPanResponderMove: (_e, gesture) => {
                const dx = gesture.moveX - dragStart.current.x;
                const dy = gesture.moveY - dragStart.current.y;
                setSigX(Math.max(0, dragStart.current.sigX + dx));
                setSigY(Math.max(0, dragStart.current.sigY + dy));
            },
        })
    ).current;

    const pickPdf = async () => {
        try {
            const result = await DocumentPicker.getDocumentAsync({ type: "application/pdf" });
            if (result.canceled) return;

            const asset = result.assets?.[0];
            if (!asset) return;

            setPdfFile(asset);

            const form = new FormData();
            form.append("file", {
                uri: asset.uri,
                name: asset.name || "file.pdf",
                type: asset.mimeType || "application/pdf",
            } as any);

            const backendResponse = await fetch(endpoints.pdfToImage, {
                method: "POST",
                body: form,
            });

            const json = await backendResponse.json();

            setPdfImagePreview(json.preview);
            setPdfPixmapW(json.width);
            setPdfPixmapH(json.height);
        } catch (e) {
            console.log("PICK PDF ERROR:", e);
        }
    };

    const pickImageSignature = async () => {
        try {
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                base64: true,
                quality: 1,
            });
            if (result.canceled) return;
            const asset = result.assets?.[0];
            if (asset?.base64) setImageSignature(`data:image/png;base64,${asset.base64}`);
        } catch (e) {
            console.log("Image pick ERROR:", e);
        }
    };

    const handleSignature = (sig: string) => {
        setSignatureDraw(sig);

        if (renderedWidth && renderedHeight) {
            setSigX(renderedWidth / 2 - 75);
            setSigY(renderedHeight / 2 - 30);
        }
    };

    const convertTextToImageRN = async () => {
        if (!textSignature.trim()) return null;
        if (!textToImageRef.current) return null;
        try {
            const uri = await captureRef(textToImageRef.current, { format: "png", quality: 1 });
            return uri;
        } catch (e) {
            return null;
        }
    };

    const handleClear = () => {
        signatureRef.current?.clearSignature();
        setSignatureDraw(null);
        setTextSignature("");
        setImageSignature(null);
        setSigX(50);
        setSigY(50);
        setSigScale(1);
    };

    const handleSignPdf = async () => {
        if (!pdfFile) return;
        setLoading(true);

        try {
            let finalSignature: string | null = null;

            if (signatureDraw) finalSignature = signatureDraw;
            else if (imageSignature) finalSignature = imageSignature;
            else if (textSignature) {
                const uri = await convertTextToImageRN();
                const b64 = await FileSystem.readAsStringAsync(uri!, {
                    encoding: FileSystem.EncodingType.Base64,
                });
                finalSignature = `data:image/png;base64,${b64}`;
            }

            if (!finalSignature) return;

            const scaledX = (sigX / renderedWidth) * pdfPixmapW;
            const scaledY = (sigY / renderedHeight) * pdfPixmapH;

            const form = new FormData();
            form.append("file", {
                uri: pdfFile.uri,
                type: "application/pdf",
                name: pdfFile.name,
            } as any);
            form.append("signature", finalSignature);
            form.append("x", String(scaledX));
            form.append("y", String(scaledY));
            form.append("scale", String(sigScale));

            const response = await fetch(endpoints.signPdf, {
                method: "POST",
                body: form,
            });

            if (!response.ok) {
                throw new Error("Backend failed while signing the PDF");
            }

            const buf = await response.arrayBuffer();
            const base64Pdf = btoa(
                Array.from(new Uint8Array(buf))
                    .map((b) => String.fromCharCode(b))
                    .join("")
            );

            const outName = `signed_${Date.now()}.pdf`;
            const localPath = FileSystem.documentDirectory + outName;

            await FileSystem.writeAsStringAsync(localPath, base64Pdf, {
                encoding: FileSystem.EncodingType.Base64,
            });

            await saveRecentFile("Sign PDF", outName, localPath);

            await Sharing.shareAsync(localPath);
        } catch (e) {
            console.log("SIGN ERROR:", e);
        }

        setLoading(false);
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
                <ScrollView 
                    contentContainerStyle={styles.scrollContent} 
                    scrollEnabled={scrollEnabled}
                >
                    <View style={styles.card}>
                        {/* TITLE WITH LOGO */}
                        <View style={styles.titleRow}>
                            <View style={styles.logoContainer}>
                                <Ionicons name="create" size={32} color="#6366f1" />
                            </View>
                            <Text style={styles.title}>PDF Signature Tool</Text>
                        </View>

                        {/* SUBTITLE */}
                        <Text style={styles.subtitle}>
                            Select a PDF file and add your signature
                        </Text>

                        {/* SELECT PDF BUTTON */}
                        <TouchableOpacity style={styles.selectBtn} onPress={pickPdf}>
                            <Ionicons name="document-outline" size={20} color="#2563eb" />
                            <Text style={styles.selectBtnText}>
                                {pdfFile ? pdfFile.name : "Select PDF File"}
                            </Text>
                        </TouchableOpacity>

                        {/* PDF PREVIEW */}
                        {pdfImagePreview && (
                            <View style={styles.previewSection}>
                                <Text style={styles.sectionTitle}>PDF Preview</Text>
                                <View
                                    style={styles.previewContainer}
                                    onLayout={(e) => {
                                        setRenderedWidth(e.nativeEvent.layout.width);
                                        setRenderedHeight(e.nativeEvent.layout.height);
                                    }}
                                >
                                    <Image
                                        source={{ uri: pdfImagePreview }}
                                        resizeMode="contain"
                                        style={styles.pdfImage}
                                    />

                                    {(signatureDraw || imageSignature || textSignature) && (
                                        <View
                                            {...panResponder.panHandlers}
                                            style={[
                                                styles.draggableSignature,
                                                {
                                                    left: sigX,
                                                    top: sigY,
                                                    transform: [{ scale: sigScale }],
                                                },
                                            ]}
                                        >
                                            {signatureDraw && (
                                                <Image
                                                    source={{ uri: signatureDraw }}
                                                    style={styles.signaturePreview}
                                                />
                                            )}
                                            {imageSignature && (
                                                <Image
                                                    source={{ uri: imageSignature }}
                                                    style={styles.signaturePreview}
                                                />
                                            )}
                                            {textSignature !== "" && (
                                                <Text style={styles.textSignaturePreview}>
                                                    {textSignature}
                                                </Text>
                                            )}
                                        </View>
                                    )}
                                </View>

                                {/* SIGNATURE SIZE SLIDER */}
                                <View style={styles.sliderSection}>
                                    <Text style={styles.sliderLabel}>
                                        Signature Size: {Math.round(sigScale * 100)}%
                                    </Text>
                                    <Slider
                                        minimumValue={0.3}
                                        maximumValue={2}
                                        value={sigScale}
                                        onValueChange={setSigScale}
                                        style={styles.slider}
                                        minimumTrackTintColor="#2563eb"
                                        maximumTrackTintColor="#d1d5db"
                                    />
                                </View>
                            </View>
                        )}

                        {/* SIGNATURE OPTIONS */}
                        <Text style={styles.sectionTitle}>Add Signature</Text>

                        {/* DRAW SIGNATURE */}
                        <View style={styles.signatureOption}>
                            <Text style={styles.optionLabel}>
                                <Ionicons name="brush" size={16} color="#6b7280" /> Draw Signature
                            </Text>
                            <View style={styles.signaturePad}>
                                <SignatureScreen
                                    ref={signatureRef}
                                    onOK={handleSignature}
                                    onBegin={() => setScrollEnabled(false)}
                                    onEnd={() => {
                                        signatureRef.current?.readSignature();
                                        setTimeout(() => setScrollEnabled(true), 100);
                                    }}
                                    descriptionText="Sign here"
                                    webStyle={`
                                        .m-signature-pad--footer {display:none;}
                                        .m-signature-pad {box-shadow:none; border:1px solid #e5e7eb; border-radius:8px; width:100%; height:100%;}
                                        body, html {margin:0; padding:0; width:100%; height:100%;}
                                    `}
                                />
                            </View>
                        </View>

                        {/* TYPE SIGNATURE */}
                        <View style={styles.signatureOption}>
                            <Text style={styles.optionLabel}>
                                <Ionicons name="text" size={16} color="#6b7280" /> Type Signature
                            </Text>
                            <TextInput
                                placeholder="Type your signature here"
                                style={styles.input}
                                value={textSignature}
                                onChangeText={setTextSignature}
                            />
                        </View>

                        {/* UPLOAD SIGNATURE */}
                        <View style={styles.signatureOption}>
                            <Text style={styles.optionLabel}>
                                <Ionicons name="image" size={16} color="#6b7280" /> Upload Signature
                            </Text>
                            <TouchableOpacity
                                style={styles.uploadBtn}
                                onPress={pickImageSignature}
                            >
                                <Ionicons name="cloud-upload-outline" size={20} color="#374151" />
                                <Text style={styles.uploadBtnText}>
                                    {imageSignature ? "Signature Selected ✓" : "Choose Image"}
                                </Text>
                            </TouchableOpacity>
                        </View>

                        {/* Hidden SVG for text */}
                        <View
                            ref={textToImageRef}
                            collapsable={false}
                            style={{ position: "absolute", left: -5000, top: -5000 }}
                        >
                            <Svg width="500" height="120">
                                <SvgText x="20" y="70" fill="black" fontSize="40" fontWeight="normal">
                                    {textSignature || " "}
                                </SvgText>
                            </Svg>
                        </View>

                        {/* ACTION BUTTONS */}
                        <View style={styles.actionButtons}>
                            <TouchableOpacity
                                style={styles.clearBtn}
                                onPress={handleClear}
                            >
                                <Ionicons name="trash-outline" size={18} color="#ef4444" />
                                <Text style={styles.clearBtnText}>Clear All</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[
                                    styles.signBtn,
                                    { opacity: pdfFile ? 1 : 0.5 },
                                ]}
                                onPress={handleSignPdf}
                                disabled={!pdfFile || loading}
                            >
                                {loading ? (
                                    <ActivityIndicator color="#fff" />
                                ) : (
                                    <>
                                        <Ionicons name="checkmark-circle" size={20} color="#fff" />
                                        <Text style={styles.signBtnText}>Sign PDF</Text>
                                    </>
                                )}
                            </TouchableOpacity>
                        </View>
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

    scrollContent: {
        padding: 20,
    },

    card: {
        backgroundColor: "#fff",
        borderRadius: 16,
        padding: 24,
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
        backgroundColor: "#eef2ff",
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

    selectBtn: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        backgroundColor: "#eff6ff",
        paddingVertical: 14,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: "#2563eb",
        marginBottom: 20,
    },

    selectBtnText: {
        fontSize: 15,
        color: "#2563eb",
        fontWeight: "600",
    },

    previewSection: {
        marginBottom: 20,
    },

    sectionTitle: {
        fontSize: 16,
        fontWeight: "700",
        color: "#374151",
        marginBottom: 12,
    },

    previewContainer: {
        width: "100%",
        height: 400,
        backgroundColor: "#f9fafb",
        borderRadius: 12,
        borderWidth: 1,
        borderColor: "#e5e7eb",
        overflow: "hidden",
        position: "relative",
    },

    pdfImage: {
        width: "100%",
        height: "100%",
    },

    draggableSignature: {
        position: "absolute",
        zIndex: 10,
    },

    signaturePreview: {
        width: 150,
        height: 60,
        resizeMode: "contain",
    },

    textSignaturePreview: {
        fontSize: 26,
        fontWeight: "normal",
        backgroundColor: "white",
        padding: 5,
    },

    sliderSection: {
        marginTop: 12,
    },

    sliderLabel: {
        fontSize: 14,
        color: "#6b7280",
        marginBottom: 8,
    },

    slider: {
        width: "100%",
        height: 40,
    },

    signatureOption: {
        marginBottom: 20,
    },

    optionLabel: {
        fontSize: 14,
        fontWeight: "600",
        color: "#374151",
        marginBottom: 8,
    },

    signaturePad: {
        height: 200,
        borderWidth: 1,
        borderColor: "#d1d5db",
        borderRadius: 8,
        overflow: "hidden",
        backgroundColor: "#fff",
    },

    input: {
        backgroundColor: "#f9fafb",
        padding: 12,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: "#d1d5db",
        fontSize: 15,
    },

    uploadBtn: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        backgroundColor: "#fff",
        paddingVertical: 12,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: "#d1d5db",
    },

    uploadBtnText: {
        fontSize: 15,
        color: "#374151",
        fontWeight: "500",
    },

    actionButtons: {
        flexDirection: "row",
        gap: 12,
        marginTop: 20,
    },

    clearBtn: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        backgroundColor: "#fef2f2",
        paddingVertical: 14,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: "#fecaca",
    },

    clearBtnText: {
        fontSize: 15,
        color: "#ef4444",
        fontWeight: "600",
    },

    signBtn: {
        flex: 2,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        backgroundColor: "#16a34a",
        paddingVertical: 14,
        borderRadius: 10,
    },

    signBtnText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "700",
    },
});