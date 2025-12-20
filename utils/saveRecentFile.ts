import AsyncStorage from "@react-native-async-storage/async-storage";

export interface RecentFileItem {
  id: number;
  tool_name: string;
  file_name: string;
  file_uri: string;   // ⭐ REQUIRED
  timestamp: string;
  userId: number;     // ⭐ NEW — important
}

export const saveRecentFile = async (
  toolName: string,
  fileName: string,
  fileUri: string
): Promise<void> => {
  try {
    // ⭐ 1. Get logged-in user ID
    const userId = await AsyncStorage.getItem("userId");
    if (!userId) {
      console.log("⚠ Cannot save file — No user logged in.");
      return;
    }

    // ⭐ 2. Create file item
    const item: RecentFileItem = {
      id: Date.now(),
      tool_name: toolName,
      file_name: fileName,
      file_uri: fileUri,
      timestamp: new Date().toLocaleString(),
      userId: Number(userId),
    };

    // ⭐ 3. Load existing user-specific list
    const key = `recent_files_user_${userId}`;
    const existing = await AsyncStorage.getItem(key);
    const list = existing ? JSON.parse(existing) : [];

    // ⭐ 4. Add to beginning
    const updated = [item, ...list];

    // ⭐ 5. Save back to storage
    await AsyncStorage.setItem(key, JSON.stringify(updated));

    console.log("✅ File saved for user:", userId);
  } catch (error) {
    console.log("Error saving recent file:", error);
  }
};
