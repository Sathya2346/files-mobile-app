import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import Footer from "../components/Footer";


const TermsCondition = () => {
  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      {/* <View style={styles.header}>
        <Ionicons name="arrow-back" size={24} color="#fff" />
        <Text style={styles.headerText}>Terms & Conditions</Text>
      </View> */}

      {/* Scrollable Content */}
      <ScrollView
        style={styles.scrollContainer}
        contentContainerStyle={{ paddingBottom: 30 }}
      >
        <Text style={styles.introText}>
          Terms and Conditions – Vetri File App! By using this app, you agree to
          the rules below:
        </Text>

        <Text style={styles.title}>1. Introduction</Text>
        <Text style={styles.content}>
          By downloading, installing, or using this application, you agree to
          follow these Terms and Conditions. Please read them carefully before
          using our services.
        </Text>

        <Text style={styles.title}>2. Use of the Application</Text>
        <Text style={styles.content}>
          • Vetri File App allows you to convert, view, manage, and share PDF
          files.{"\n"}
          • You agree to use the app only for lawful purposes and in compliance
          with all applicable laws.{"\n"}
          • You are responsible for maintaining the confidentiality of your
          files and account information.
        </Text>

        <Text style={styles.title}>3. User Data and Privacy</Text>
        <Text style={styles.content}>
          • We respect your privacy. Any personal data or files you upload are
          secured and not shared with third parties.{"\n"}
          • For more information, please read our Privacy Policy.{"\n"}
          • The app may collect limited technical data (like crash reports or
          device info) to improve performance and user experience.
        </Text>

        <Text style={styles.title}>4. File Management</Text>
        <Text style={styles.content}>
          • All files converted or created using the app remain your property.{"\n"}
          • Vetri File App does not store or keep copies of your files on its
          servers unless explicitly shared by you.{"\n"}
          • You are responsible for backing up important files before deleting
          or uninstalling the app.
        </Text>

        <Text style={styles.subtitle}>Privacy</Text>
        <Text style={styles.content}>
          We respect your privacy. Your info is safe and not shared without
          permission.
        </Text>

        <Text style={styles.subtitle}>Updates</Text>
        <Text style={styles.content}>
          We may update these terms. Keep using the app means you agree to the
          latest rules.
        </Text>

        {/* Help Section */}
        <TouchableOpacity style={styles.helpBox}>
          <Ionicons name="headset" size={24} color="#fff" />
          <View style={{ marginLeft: 10 }}>
            <Text style={styles.helpText}>Need help?</Text>
            <Text style={styles.helpText}>
              Contact: <Text style={styles.helpHighlight}>Vetri Files</Text>
            </Text>
          </View>
        </TouchableOpacity>
      </ScrollView>
      <Footer/>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E90FF',
    padding: 15,
  },
  headerText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  scrollContainer: { paddingHorizontal: 20, paddingTop: 20 },
  introText: { fontSize: 16, marginBottom: 15 },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1E90FF',
    marginTop: 15,
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1E90FF',
    marginTop: 10,
  },
  content: { fontSize: 15, marginBottom: 10, lineHeight: 22 },
  helpBox: {
    flexDirection: 'row',
    backgroundColor: '#1E90FF',
    borderRadius: 10,
    padding: 15,
    marginTop: 20,
    alignItems: 'center',
  },
  helpText: { color: '#fff', fontSize: 15 },
  helpHighlight: { fontWeight: 'bold', color: '#00FF7F' },
});

export default TermsCondition;
