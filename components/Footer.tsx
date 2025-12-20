import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useRouter, usePathname } from "expo-router";

export default function Footer() {
  const router = useRouter();
  const pathname = usePathname();

  const isActive = (path: string) => {
    return pathname === path;
  };

  const navItems = [
    { path: "/home", label: "Home", icon: "🏠" },
    { path: "/Explore", label: "Explore", icon: "🔍" },
    { path: "/RecentFiles", label: "My Files", icon: "📁" },
    { path: "/Profile", label: "Profile", icon: "👤" },
  ];

  return (
    <View style={styles.footerContainer}>
      {/* Navigation Items */}
      <View style={styles.navContainer}>
        {navItems.map((item) => (
          <TouchableOpacity
            key={item.path}
            style={styles.navItem}
            onPress={() => router.push(item.path)}
            activeOpacity={0.7}
          >
            {isActive(item.path) ? (
              // Active state - White circle with icon inside, positioned above
              <View style={styles.activeWrapper}>
                <View style={styles.activeIconContainer}>
                  <Text style={styles.activeIcon}>{item.icon}</Text>
                </View>
                <Text style={styles.navLabelActive}>{item.label}</Text>
              </View>
            ) : (
              // Inactive state - Normal icon and label
              <View style={styles.inactiveWrapper}>
                <Text style={styles.icon}>{item.icon}</Text>
                <Text style={styles.navLabel}>{item.label}</Text>
              </View>
            )}
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  footerContainer: {
    position: "relative",
    backgroundColor: "transparent",
  },
  navContainer: {
    flexDirection: "row",
    backgroundColor: "#1E88E5",
    paddingBottom: 10,
    paddingTop: 10,
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 8,
  },
  navItem: {
    flex: 1,
    alignItems: "center",
    justifyContent: "flex-end",
  },
  // Active state wrapper
  activeWrapper: {
    alignItems: "center",
    marginTop: -35, // Move up to show circle above nav bar
  },
  activeIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#FFF",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 20,
    marginBottom: 10,
  },
  activeIcon: {
    fontSize: 28,
  },
  navLabelActive: {
    fontSize: 11,
    color: "#FFF",
    fontWeight: "bold",
  },
  // Inactive state wrapper
  inactiveWrapper: {
    alignItems: "center",
    paddingVertical: 8,
  },
  icon: {
    fontSize: 24,
    marginBottom: 4,
  },
  navLabel: {
    fontSize: 11,
    color: "#FFF",
    fontWeight: "500",
  },
});