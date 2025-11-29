import { changeUserInfo, UserInfo } from "@/api/user";
import { getUser, saveUser } from "@/storage/user-storage";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  useColorScheme,
} from "react-native";

export default function EditProfileScreen() {
  const scheme = useColorScheme();
  const isDark = scheme === "dark";

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [loading, setLoading] = useState(false);

  const [uid, setUid] = useState<string | null>(null);

  useEffect(() => {
    const loadUser = async () => {
      const stored = await getUser();
      if (stored) {
        setName(stored.user.name || "");
        setPhone(stored.user.phone || "");
        setAddress(stored.user.address || "");
        setUid(stored.user.uid);
      }
    };
    loadUser();
  }, []);

  const handleSave = async () => {
  if (!name || !phone || !address) {
    Alert.alert("Thông tin chưa đầy đủ", "Vui lòng nhập đầy đủ thông tin.");
    return;
  }

  if (!uid) {
    Alert.alert("Lỗi", "Không xác định được người dùng.");
    return;
  }

  const info: UserInfo = { name, phone, address };
  setLoading(true);

  try {
    // Gọi API changeUserInfo
    const res = await changeUserInfo(uid, info);

    // Nếu server trả về HTML (ví dụ lỗi 404), res.success sẽ undefined
    if (res.success === undefined) {
      Alert.alert("Lỗi server", "Server trả về dữ liệu không hợp lệ.");
      console.log("Server response:", res);
    } else if (res.success) {
      // Cập nhật local storage giữ nguyên token
      const stored = await getUser();
      if (stored) {
        await saveUser(
          { ...stored.user, name, phone, address },
          stored.token
        );
      }
      Alert.alert("Thành công", "Cập nhật thông tin thành công!");
    } else {
      Alert.alert("Thất bại", res.error || "Cập nhật thất bại");
    }
  } catch (err) {
    console.error("EditProfileScreen error:", err);
    Alert.alert("Lỗi", "Có lỗi xảy ra khi cập nhật thông tin");
  } finally {
    setLoading(false);
  }
};



  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: isDark ? "#000" : "#fff" }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerStyle={{ padding: 16 }}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={[styles.label, { color: isDark ? "#fff" : "#000" }]}>
          Tên
        </Text>
        <TextInput
          style={[
            styles.input,
            {
              backgroundColor: isDark ? "#1a1a1a" : "#fff",
              color: isDark ? "#fff" : "#000",
              borderColor: isDark ? "#444" : "#ccc",
            },
          ]}
          value={name}
          onChangeText={setName}
          placeholder="Họ tên"
          placeholderTextColor={isDark ? "#666" : "#999"}
        />

        <Text style={[styles.label, { color: isDark ? "#fff" : "#000" }]}>
          Số điện thoại
        </Text>
        <TextInput
          style={[
            styles.input,
            {
              backgroundColor: isDark ? "#1a1a1a" : "#fff",
              color: isDark ? "#fff" : "#000",
              borderColor: isDark ? "#444" : "#ccc",
            },
          ]}
          value={phone}
          onChangeText={setPhone}
          keyboardType="phone-pad"
          placeholder="Số điện thoại"
          placeholderTextColor={isDark ? "#666" : "#999"}
        />

        <Text style={[styles.label, { color: isDark ? "#fff" : "#000" }]}>
          Địa chỉ
        </Text>
        <TextInput
          style={[
            styles.input,
            {
              backgroundColor: isDark ? "#1a1a1a" : "#fff",
              color: isDark ? "#fff" : "#000",
              borderColor: isDark ? "#444" : "#ccc",
            },
          ]}
          value={address}
          onChangeText={setAddress}
          placeholder="Địa chỉ"
          placeholderTextColor={isDark ? "#666" : "#999"}
        />

        <TouchableOpacity
          style={[styles.button, { opacity: loading ? 0.6 : 1 }]}
          onPress={handleSave}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Lưu</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  label: { fontSize: 14, marginBottom: 6 },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    marginBottom: 16,
    fontSize: 15,
  },
  button: {
    backgroundColor: "#4caf50",
    padding: 14,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 10,
  },
  buttonText: { color: "#fff", fontWeight: "700", fontSize: 16 },
});
