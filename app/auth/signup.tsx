import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import { endpoints } from "../../constants/apiConfig";

export default function SignUp() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSignUp = async () => {
    if (!name || !phone || !email || !password || !confirmPassword) {
      Alert.alert("Error", "All fields are required");
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match");
      return;
    }
    if (!agreeToTerms) {
      Alert.alert("Error", "Please agree to terms and conditions");
      return;
    }

    try {
      setLoading(true);
      console.log("🌐 API URL:", endpoints.signup);
      console.log("📤 Signup Request:", { name, email, phone });

      const res = await fetch(endpoints.signup, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, phone, email, password }),
      });

      console.log("📥 Response Status:", res.status);
      const data = await res.json();
      console.log("📥 Response Data:", data);

      if (res.status === 201 || res.status === 200) {
        // ✅ CRITICAL FIX: Save to AsyncStorage
        await AsyncStorage.multiSet([
          ["authToken", data.token || `token_${data.userId}_${data.email}`],
          ["userId", data.userId?.toString() || ""],
          ["userEmail", data.email || email],
          ["userName", data.name || name],
        ]);

        // Verify saved data
        const savedToken = await AsyncStorage.getItem("authToken");
        const savedUserId = await AsyncStorage.getItem("userId");
        console.log("✅ Saved Token:", savedToken);
        console.log("✅ Saved UserId:", savedUserId);

        Alert.alert("Success", data.message || "Account created successfully!");
        router.replace("/home");
      } else {
        Alert.alert("Error", data.error || JSON.stringify(data));
      }
    } catch (err) {
      console.error("❌ Signup Error:", err);
      const errorMessage = err instanceof Error ? err.message : "Server not reachable";
      Alert.alert("Error", errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000" />
      
      {/* Black Header with Wavy Design */}
      <View style={styles.headerContainer}>
        <View style={styles.blackHeader}>
          <Text style={styles.welcomeText}>Welcome Guys !</Text>
          <Text style={styles.signUpText}>Sign Up</Text>
        </View>
        {/* Wavy Blue Section */}
        <View style={styles.wavySection}>
          <View style={styles.wave} />
        </View>
      </View>

      {/* Form Section with Blue Background */}
      <ScrollView 
        style={styles.blueBackground}
        contentContainerStyle={styles.formContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Name Input */}
        <Text style={styles.label}>Name</Text>
        <View style={styles.inputContainer}>
          <Text style={styles.icon}>👤</Text>
          <TextInput
            placeholder="Name"
            placeholderTextColor="#B0B0B0"
            value={name}
            onChangeText={setName}
            style={styles.input}
            editable={!loading}
          />
        </View>

        {/* Email Input */}
        <Text style={styles.label}>Email</Text>
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

        {/* Mobile Number Input */}
        <Text style={styles.label}>Mobile Number</Text>
        <View style={styles.inputContainer}>
          <Text style={styles.icon}>📞</Text>
          <TextInput
            placeholder="+91"
            placeholderTextColor="#B0B0B0"
            value={phone}
            onChangeText={setPhone}
            style={styles.input}
            keyboardType="phone-pad"
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

        {/* Confirm Password Input */}
        <Text style={styles.label}>Confirm Password</Text>
        <View style={styles.inputContainer}>
          <Text style={styles.icon}>🔒</Text>
          <TextInput
            placeholder="Enter your password"
            placeholderTextColor="#B0B0B0"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            style={styles.input}
            secureTextEntry={!showConfirmPassword}
            editable={!loading}
          />
          <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
            <Text style={styles.eyeIcon}>{showConfirmPassword ? "👁️" : "👁️‍🗨️"}</Text>
          </TouchableOpacity>
        </View>

        {/* Terms Checkbox */}
        <TouchableOpacity 
          style={styles.checkboxRow} 
          onPress={() => setAgreeToTerms(!agreeToTerms)}
          disabled={loading}
        >
          <View style={[styles.checkbox, agreeToTerms && styles.checkboxChecked]}>
            {agreeToTerms && <Text style={styles.checkmark}>✓</Text>}
          </View>
          <Text style={styles.checkboxLabel}>I agree the terms & conditions</Text>
        </TouchableOpacity>

        {/* Sign Up Button */}
        <TouchableOpacity 
          style={[styles.signUpButton, loading && styles.signUpButtonDisabled]} 
          onPress={handleSignUp}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#000" />
          ) : (
            <Text style={styles.signUpButtonText}>Sign Up</Text>
          )}
        </TouchableOpacity>

        {/* Terms Text */}
        <Text style={styles.termsText}>
          By signing up, you agree to our{" "}
          <Text style={styles.linkText}>Terms & Conditions</Text> and{" "}
          <Text style={styles.linkText}>Privacy Policy</Text>
        </Text>

        {/* Divider */}
        <View style={styles.dividerContainer}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>You can Connect with</Text>
          <View style={styles.dividerLine} />
        </View>

        {/* Social Buttons */}
        {/* <View style={styles.socialContainer}>
          <TouchableOpacity style={styles.socialButton}>
            <Text style={styles.googleIcon}>G</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.socialButton}>
            <Text style={styles.facebookIcon}>f</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.socialButton}>
            <Text style={styles.appleIcon}>🍎</Text>
          </TouchableOpacity>
        </View> */}

        {/* Footer Link */}
        <Text style={styles.footerText}>
          Already have an account?{" "}
          <Text style={styles.loginLink} onPress={() => router.push("/auth/login")}>
            [Log In]
          </Text>
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1E88E5",
  },
  headerContainer: {
    position: "relative",
  },
  blackHeader: {
    backgroundColor: "#000",
    paddingTop: 50,
    paddingBottom: 30,
    alignItems: "center",
  },
  welcomeText: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#FFF",
    marginBottom: 5,
  },
  signUpText: {
    fontSize: 22,
    fontWeight: "600",
    color: "#FFF",
  },
  wavySection: {
    height: 50,
    backgroundColor: "#1E88E5",
    position: "relative",
  },
  wave: {
    position: "absolute",
    top: -30,
    left: 0,
    right: 0,
    height: 50,
    backgroundColor: "#1E88E5",
    borderTopLeftRadius: 100,
    borderTopRightRadius: 100,
  },
  blueBackground: {
    flex: 1,
    backgroundColor: "#1E88E5",
  },
  formContainer: {
    paddingHorizontal: 24,
    paddingTop: 10,
    paddingBottom: 30,
  },
  label: {
    color: "#FFF",
    fontWeight: "600",
    fontSize: 15,
    marginBottom: 8,
    marginTop: 16,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF",
    borderRadius: 25,
    paddingHorizontal: 16,
    paddingVertical: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
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
  checkboxRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 20,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: "#FFF",
    borderRadius: 4,
    marginRight: 10,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "transparent",
  },
  checkboxChecked: {
    backgroundColor: "#FFF",
    borderColor: "#FFF",
  },
  checkmark: {
    color: "#1E88E5",
    fontSize: 14,
    fontWeight: "bold",
  },
  checkboxLabel: {
    color: "#FFF",
    fontSize: 13,
  },
  signUpButton: {
    backgroundColor: "#C6FF00",
    paddingVertical: 16,
    borderRadius: 25,
    alignItems: "center",
    marginTop: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  signUpButtonDisabled: {
    opacity: 0.6,
  },
  signUpButtonText: {
    color: "#000",
    fontWeight: "bold",
    fontSize: 17,
  },
  termsText: {
    textAlign: "center",
    color: "#FFF",
    fontSize: 11,
    marginTop: 16,
    lineHeight: 16,
    paddingHorizontal: 10,
  },
  linkText: {
    color: "#FFEB3B",
    fontWeight: "600",
  },
  dividerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 24,
    marginBottom: 16,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#FFF",
  },
  dividerText: {
    color: "#FFF",
    fontSize: 13,
    marginHorizontal: 12,
  },
  socialContainer: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 20,
    marginTop: 10,
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
    color: "#FFF",
    marginTop: 24,
    marginBottom: 20,
    fontSize: 14,
  },
  loginLink: {
    color: "#FFEB3B",
    fontWeight: "bold",
  },
});