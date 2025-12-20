import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  Linking,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { SafeAreaView } from "react-native-safe-area-context";

import { endpoints } from "../constants/apiConfig";
import Footer from "../components/Footer";

interface FAQ {
  id: number;
  question: string;
  answer: string;
  order: number;
}

interface ContactInfo {
  phone: string;
  email: string;
  whatsapp: string;
}

export default function HelpSupportScreen() {
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [contactInfo, setContactInfo] = useState<ContactInfo | null>(null);
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  // Ticket form state
  const [issueType, setIssueType] = useState<"bug" | "other">("bug");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadHelpData();
  }, []);

  const loadHelpData = async () => {
    try {
      setLoading(true);

      // Load FAQs
      const faqResponse = await fetch(endpoints.getFAQs);
      if (faqResponse.ok) {
        const faqData = await faqResponse.json();
        setFaqs(faqData);
      }

      // Load Contact Info
      const contactResponse = await fetch(endpoints.getContactInfo);
      if (contactResponse.ok) {
        const contactData = await contactResponse.json();
        setContactInfo(contactData);
      }
    } catch (error) {
      console.error("Load help data error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitTicket = async () => {
    if (!message.trim()) {
      Alert.alert("Error", "Please enter your message");
      return;
    }

    try {
      setSubmitting(true);
      const token = await AsyncStorage.getItem("authToken");
      const userId = await AsyncStorage.getItem("userId");
      const userEmail = await AsyncStorage.getItem("userEmail");
      const userName = await AsyncStorage.getItem("userName");

      const response = await fetch(endpoints.submitTicket, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          userId,
          userEmail,
          userName,
          issueType,
          message: message.trim(),
        }),
      });

      const data = await response.json();

      if (response.ok) {
        Alert.alert("Success", "Your ticket has been submitted successfully!");
        setMessage("");
        setIssueType("bug");
      } else {
        Alert.alert("Error", data.error || "Failed to submit ticket");
      }
    } catch (error) {
      console.error("Submit ticket error:", error);
      Alert.alert("Error", "Failed to submit ticket");
    } finally {
      setSubmitting(false);
    }
  };

  const handleCall = () => {
    if (contactInfo?.phone) {
      Linking.openURL(`tel:${contactInfo.phone}`);
    }
  };

  const handleEmail = () => {
    if (contactInfo?.email) {
      Linking.openURL(`mailto:${contactInfo.email}`);
    }
  };

  const handleWhatsApp = () => {
    if (contactInfo?.whatsapp) {
      Linking.openURL(`https://wa.me/${contactInfo.whatsapp}`);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2563EB" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <Ionicons name="help-circle" size={40} color="#fff" />
        <Text style={styles.headerTitle}>Help & Support</Text>
        <Text style={styles.headerSubtitle}>
          We're here to help you with any questions, subscriptions, or issues.
        </Text>
      </View>

      {/* FAQs Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>FAQs (Frequently Asked Questions)</Text>
        {faqs.length > 0 ? (
          faqs.map((faq, index) => (
            <TouchableOpacity
              key={faq.id}
              style={styles.faqItem}
              onPress={() => setExpandedFaq(expandedFaq === faq.id ? null : faq.id)}
            >
              <View style={styles.faqHeader}>
                <Text style={styles.faqNumber}>{index + 1}.</Text>
                <Text style={styles.faqQuestion}>{faq.question}</Text>
                <Ionicons
                  name={expandedFaq === faq.id ? "remove-circle" : "add-circle"}
                  size={24}
                  color="#2563EB"
                />
              </View>
              {expandedFaq === faq.id && (
                <Text style={styles.faqAnswer}>{faq.answer}</Text>
              )}
            </TouchableOpacity>
          ))
        ) : (
          <Text style={styles.noData}>No FAQs available</Text>
        )}
      </View>

      {/* Contact Support Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Contact Support</Text>

        {contactInfo && (
          <>
            <TouchableOpacity style={styles.contactItem} onPress={handleCall}>
              <View style={styles.contactIcon}>
                <Ionicons name="call" size={24} color="#2563EB" />
              </View>
              <View style={styles.contactContent}>
                <Text style={styles.contactLabel}>Call Us:</Text>
                <Text style={styles.contactValue}>{contactInfo.phone}</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity style={styles.contactItem} onPress={handleEmail}>
              <View style={styles.contactIcon}>
                <Ionicons name="mail" size={24} color="#2563EB" />
              </View>
              <View style={styles.contactContent}>
                <Text style={styles.contactLabel}>Email:</Text>
                <Text style={styles.contactValue}>{contactInfo.email}</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity style={styles.contactItem} onPress={handleWhatsApp}>
              <View style={styles.contactIcon}>
                <Ionicons name="logo-whatsapp" size={24} color="#25D366" />
              </View>
              <View style={styles.contactContent}>
                <Text style={styles.contactLabel}>WhatsApp:</Text>
                <Text style={styles.contactValue}>{contactInfo.whatsapp}</Text>
              </View>
            </TouchableOpacity>
          </>
        )}
      </View>

      {/* Raise a Ticket Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Raise a Ticket</Text>

        <Text style={styles.label}>Issue Type:</Text>
        <View style={styles.checkboxContainer}>
          <TouchableOpacity
            style={styles.checkboxRow}
            onPress={() => setIssueType("bug")}
          >
            <View style={[styles.checkbox, issueType === "bug" && styles.checkboxChecked]}>
              {issueType === "bug" && <Ionicons name="checkmark" size={16} color="#fff" />}
            </View>
            <Text style={styles.checkboxLabel}>App Bug</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.checkboxRow}
            onPress={() => setIssueType("other")}
          >
            <View style={[styles.checkbox, issueType === "other" && styles.checkboxChecked]}>
              {issueType === "other" && <Ionicons name="checkmark" size={16} color="#fff" />}
            </View>
            <Text style={styles.checkboxLabel}>Other</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.label}>Message:</Text>
        <TextInput
          style={styles.textArea}
          placeholder="Write your issue here..."
          placeholderTextColor="#9CA3AF"
          value={message}
          onChangeText={setMessage}
          multiline
          numberOfLines={6}
          textAlignVertical="top"
        />

        <TouchableOpacity
          style={[styles.submitButton, submitting && styles.submitButtonDisabled]}
          onPress={handleSubmitTicket}
          disabled={submitting}
        >
          {submitting ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.submitButtonText}>Submit Request</Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>

    <Footer/>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F3F4F6",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F3F4F6",
  },
  header: {
    backgroundColor: "#2563EB",
    padding: 30,
    paddingTop: 60,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "700",
    color: "#fff",
    marginTop: 10,
  },
  headerSubtitle: {
    fontSize: 14,
    color: "#E0E7FF",
    textAlign: "center",
    marginTop: 8,
    paddingHorizontal: 20,
  },
  section: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 15,
  },
  faqItem: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  faqHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  faqNumber: {
    fontSize: 16,
    fontWeight: "700",
    color: "#2563EB",
    marginRight: 8,
  },
  faqQuestion: {
    flex: 1,
    fontSize: 16,
    fontWeight: "600",
    color: "#1F2937",
  },
  faqAnswer: {
    fontSize: 14,
    color: "#6B7280",
    marginTop: 12,
    lineHeight: 20,
    paddingLeft: 24,
  },
  contactItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  contactIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#EFF6FF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  contactContent: {
    flex: 1,
  },
  contactLabel: {
    fontSize: 12,
    color: "#6B7280",
    marginBottom: 2,
  },
  contactValue: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1F2937",
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 10,
  },
  checkboxContainer: {
    flexDirection: "row",
    marginBottom: 20,
  },
  checkboxRow: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 30,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: "#D1D5DB",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
  },
  checkboxChecked: {
    backgroundColor: "#2563EB",
    borderColor: "#2563EB",
  },
  checkboxLabel: {
    fontSize: 14,
    color: "#1F2937",
  },
  textArea: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    fontSize: 14,
    color: "#1F2937",
    borderWidth: 1,
    borderColor: "#D1D5DB",
    marginBottom: 20,
    minHeight: 150,
  },
  submitButton: {
    backgroundColor: "#2563EB",
    padding: 18,
    borderRadius: 12,
    alignItems: "center",
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
  noData: {
    textAlign: "center",
    color: "#6B7280",
    fontSize: 14,
    padding: 20,
  },
});