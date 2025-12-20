import React, { useState } from "react";
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  Alert,
  ImageBackground,
  StatusBar,
  ScrollView,
  ActivityIndicator
} from "react-native";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { endpoints } from "../../constants/apiConfig";

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [keepSignedIn, setKeepSignedIn] = useState(false);
  const [activeTab, setActiveTab] = useState("login");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please enter email and password");
      return;
    }

    try {
      setLoading(true);
      console.log("🌐 API URL:", endpoints.login);
      console.log("📤 Login Request:", { email });

      const res = await fetch(endpoints.login, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      console.log("📥 Response Status:", res.status);
      const data = await res.json();
      console.log("📥 Response Data:", data);

      if (res.status === 200) {
        // ✅ CRITICAL FIX: Save to AsyncStorage
        await AsyncStorage.multiSet([
          ["authToken", data.token || `token_${data.userId}_${data.email}`],
          ["userId", data.userId?.toString() || ""],
          ["userEmail", data.email || email],
          ["userName", data.name || ""],
        ]);

        // Verify saved data
        const savedToken = await AsyncStorage.getItem("authToken");
        const savedUserId = await AsyncStorage.getItem("userId");
        console.log("✅ Saved Token:", savedToken);
        console.log("✅ Saved UserId:", savedUserId);

        Alert.alert("Success", data.message || "Login successful!");
        router.replace("/home");
        
      } else {
        Alert.alert("Error", data.error || "Login failed");
      }
    } catch (err) {
      console.error("❌ Login Error:", err);
      const errorMessage = err instanceof Error ? err.message : "Server not reachable";
      Alert.alert("Error", errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1E88E5" />
      
      {/* Blue Header with Wavy Design */}
      <View style={styles.headerContainer}>
        <View style={styles.blueHeader}>
          {/* Logo */}
          <View style={styles.logoContainer}>
            <Text style={styles.logoText}> Vetri</Text>
            <Text style={styles.logoSubText}>Files</Text>
          </View>
          <Text style={styles.welcomeBackText}>Welcome Back</Text>
        </View>
        {/* Wavy Bottom Edge */}
        <View style={styles.wavyBottom}>
          <View style={styles.waveLeft} />
          <View style={styles.waveCenter} />
          <View style={styles.waveRight} />
        </View>
      </View>

      {/* Background Image Section with Form */}
      <ImageBackground
        source={require('../../assets/images/login-bg.png')}
        style={styles.backgroundImage}
        imageStyle={styles.imageStyle}
      >
        {/* Semi-transparent overlay */}
        <View style={styles.overlay} />
        
        <ScrollView 
          contentContainerStyle={styles.formContainer}
          showsVerticalScrollIndicator={false}
        >
          {/* Login/Sign Up Tabs */}
          <View style={styles.tabContainer}>
            <TouchableOpacity 
              style={[styles.tab, activeTab === 'login' && styles.tabActive]}
              onPress={() => setActiveTab('login')}
            >
              <Text style={[styles.tabText, activeTab === 'login' && styles.tabTextActive]}>
                Login
              </Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.tab, activeTab === 'signup' && styles.tabActive]}
              onPress={() => router.push('/auth/signup')}
            >
              <Text style={[styles.tabText, activeTab === 'signup' && styles.tabTextActive]}>
                Sign Up
              </Text>
            </TouchableOpacity>
          </View>

          {/* Form Card */}
          <View style={styles.formCard}>
            {/* Email Input */}
            <Text style={styles.label}>Email or Mobile Number</Text>
            <View style={styles.inputContainer}>
              <Text style={styles.icon}>📧</Text>
              <TextInput
                placeholder="Enter Your Email"
                placeholderTextColor="#B0B0B0"
                value={email}
                onChangeText={setEmail}
                style={styles.input}
                keyboardType="email-address"
                autoCapitalize="none"
                editable={!loading}
              />
            </View>

            {/* Password Input */}
            <Text style={styles.label}>Password</Text>
            <View style={styles.inputContainer}>
              <Text style={styles.icon}>🔒</Text>
              <TextInput
                placeholder="Enter your password"
                placeholderTextColor="#B0B0B0"
                value={password}
                onChangeText={setPassword}
                style={styles.input}
                secureTextEntry={!showPassword}
                editable={!loading}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                <Text style={styles.eyeIcon}>{showPassword ? "👁️" : "👁️‍🗨️"}</Text>
              </TouchableOpacity>
            </View>

            {/* Keep Signed In & Forgot Password */}
            <View style={styles.optionsRow}>
              <TouchableOpacity 
                style={styles.checkboxRow}
                onPress={() => setKeepSignedIn(!keepSignedIn)}
              >
                <View style={[styles.checkbox, keepSignedIn && styles.checkboxChecked]}>
                  {keepSignedIn && <Text style={styles.checkmark}>✓</Text>}
                </View>
                <Text style={styles.checkboxLabel}>Keep me signed in</Text>
              </TouchableOpacity>
              <TouchableOpacity>
                <Text style={styles.forgotPassword}>Forget your password?</Text>
              </TouchableOpacity>
            </View>

            {/* Login Button */}
            <TouchableOpacity 
              style={[styles.loginButton, loading && styles.loginButtonDisabled]} 
              onPress={handleLogin}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#000" />
              ) : (
                <Text style={styles.loginButtonText}>Login</Text>
              )}
            </TouchableOpacity>

            {/* Privacy Text */}
            <Text style={styles.privacyText}>
              We care about your <Text style={styles.privacyLink}>privacy</Text>. Your info is safe and never shared.
            </Text>
          </View>
        </ScrollView>
      </ImageBackground>

      {/* Bottom White Section - Social Login */}
      {/* <View style={styles.bottomSection}>
        <Text style={styles.connectText}>You can Connect with</Text>
        <View style={styles.socialContainer}>
          <TouchableOpacity style={styles.socialButton}>
            <Text style={styles.googleIcon}>G</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.socialButton}>
            <Text style={styles.facebookIcon}>f</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.socialButton}>
            <Text style={styles.appleIcon}>🍎</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.footerText}>
          Don't have an account?{" "}
          <Text style={styles.signUpLink} onPress={() => router.push("/auth/signup")}>
            Sign Up here
          </Text>
        </Text>
      </View> */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },
  headerContainer: {
    position: "relative",
  },
  blueHeader: {
    backgroundColor: "#1E88E5",
    paddingTop: 50,
    paddingBottom: 50,
    alignItems: "center",
  },
  logoContainer: {
    backgroundColor: "#FFF",
    borderRadius: 35,
    width: 70,
    height: 70,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 15,
  },
  logoText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#4CAF50",
  },
  logoSubText: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#4CAF50",
    marginTop: -2,
  },
  welcomeBackText: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#FFF",
  },
  wavyBottom: {
    height: 30,
    backgroundColor: "#1E88E5",
    flexDirection: "row",
    position: "relative",
  },
  waveLeft: {
    flex: 1,
    backgroundColor: "#E0E0E0",
    borderTopLeftRadius: 50,
    borderTopRightRadius: 50,
    transform: [{ scaleX: 1.5 }],
    marginTop: -10,
  },
  waveCenter: {
    flex: 1,
    backgroundColor: "#1E88E5",
  },
  waveRight: {
    flex: 1,
    backgroundColor: "#E0E0E0",
    borderTopLeftRadius: 50,
    borderTopRightRadius: 50,
    transform: [{ scaleX: 1.5 }],
    marginTop: -10,
  },
  backgroundImage: {
    flex: 1,
    width: "100%",
  },
  imageStyle: {
    opacity: 0.3,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(200, 220, 240, 0.7)",
  },
  formContainer: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 20,
  },
  tabContainer: {
    flexDirection: "row",
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    borderRadius: 25,
    padding: 5,
    marginBottom: 20,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
    borderRadius: 20,
  },
  tabActive: {
    backgroundColor: "#FFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  tabText: {
    color: "#666",
    fontWeight: "600",
    fontSize: 15,
  },
  tabTextActive: {
    color: "#1E88E5",
    fontWeight: "bold",
  },
  formCard: {
    backgroundColor: "rgba(30, 136, 229, 0.85)",
    borderRadius: 20,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  label: {
    color: "#FFF",
    fontWeight: "600",
    fontSize: 14,
    marginBottom: 8,
    marginTop: 10,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF",
    borderRadius: 25,
    paddingHorizontal: 16,
    paddingVertical: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  icon: {
    fontSize: 20,
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 14,
    color: "#333",
    padding: 0,
  },
  eyeIcon: {
    fontSize: 20,
    paddingLeft: 10,
  },
  optionsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 15,
  },
  checkboxRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  checkbox: {
    width: 18,
    height: 18,
    borderWidth: 2,
    borderColor: "#FFF",
    borderRadius: 3,
    marginRight: 8,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "transparent",
  },
  checkboxChecked: {
    backgroundColor: "#FFF",
  },
  checkmark: {
    color: "#1E88E5",
    fontSize: 12,
    fontWeight: "bold",
  },
  checkboxLabel: {
    color: "#FFF",
    fontSize: 12,
  },
  forgotPassword: {
    color: "#FFEB3B",
    fontSize: 12,
    fontWeight: "600",
  },
  loginButton: {
    backgroundColor: "#C6FF00",
    paddingVertical: 16,
    borderRadius: 25,
    alignItems: "center",
    marginTop: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  loginButtonDisabled: {
    opacity: 0.6,
  },
  loginButtonText: {
    color: "#000",
    fontWeight: "bold",
    fontSize: 17,
  },
  privacyText: {
    textAlign: "center",
    color: "#FFF",
    fontSize: 11,
    marginTop: 15,
    lineHeight: 16,
  },
  privacyLink: {
    color: "#FFEB3B",
    fontWeight: "600",
  },
  bottomSection: {
    backgroundColor: "#FFF",
    paddingVertical: 20,
    paddingHorizontal: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  connectText: {
    textAlign: "center",
    color: "#333",
    fontSize: 14,
    marginBottom: 15,
  },
  socialContainer: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 20,
    marginBottom: 15,
  },
  socialButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#FFF",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 3,
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  googleIcon: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#DB4437",
  },
  facebookIcon: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#4267B2",
  },
  appleIcon: {
    fontSize: 28,
  },
  footerText: {
    textAlign: "center",
    color: "#333",
    fontSize: 14,
    marginTop: 10,
  },
  signUpLink: {
    color: "#1E88E5",
    fontWeight: "bold",
  },
});