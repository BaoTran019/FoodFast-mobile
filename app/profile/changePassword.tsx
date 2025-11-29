import { changeUserPassword } from "@/api/user";
import { getUser, saveUser } from "@/storage/user-storage";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
    useColorScheme,
    useWindowDimensions,
} from "react-native";

export default function ChangePasswordScreen() {
    const router = useRouter();
    const scheme = useColorScheme();
    const isDark = scheme === "dark";
    const { width, height } = useWindowDimensions();
    const isLandscape = width > height;

    const [oldPassword, setOldPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [storedPassword, setStoredPassword] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const loadUser = async () => {
            const stored = await getUser();
            if (stored) setStoredPassword(stored.user.password || null);
        };
        loadUser();
    }, []);

    const handleSubmit = async () => {
        if (!oldPassword || !newPassword || !confirmPassword) {
            Alert.alert("Thông báo", "Vui lòng nhập đầy đủ thông tin.");
            return;
        }

        if (oldPassword !== storedPassword) {
            Alert.alert("Lỗi", "Mật khẩu cũ không đúng!");
            return;
        }

        if (newPassword !== confirmPassword) {
            Alert.alert("Lỗi", "Mật khẩu mới không trùng khớp!");
            return;
        }

        setLoading(true);

        const stored = await getUser();
        if (!stored || !stored.user.uid) {
            setLoading(false);
            Alert.alert("Lỗi", "Không tìm thấy thông tin người dùng.");
            return;
        }

        try {
            const res = await changeUserPassword(stored.user.uid, newPassword);
            setLoading(false);

            if (!res.success) {
                Alert.alert("Lỗi", res.error || res.message || "Đổi mật khẩu thất bại");
                return;
            }

            await saveUser({ ...stored.user, password: newPassword }, stored.token);
            Alert.alert("Thành công", "Đổi mật khẩu thành công!", [
                { text: "OK", onPress: () => router.back() },
            ]);
        } catch (err) {
            setLoading(false);
            console.error("ChangePasswordScreen error:", err);
            Alert.alert("Lỗi", "Có lỗi xảy ra khi đổi mật khẩu");
        }
    };

    // Giao diện input khi ngang
    const renderInputs = () => {
        if (!isLandscape) {
            // portrait: hiển thị 1 cột
            return (
                <>
                    <Text style={[styles.label, { color: isDark ? "#ccc" : "#333" }]}>Mật khẩu cũ</Text>
                    <TextInput
                        style={[styles.input, { backgroundColor: isDark ? "#1a1a1a" : "#fff", color: isDark ? "#fff" : "#000", borderColor: isDark ? "#444" : "#ccc" }]}
                        secureTextEntry
                        value={oldPassword}
                        onChangeText={setOldPassword}
                        placeholder="Nhập mật khẩu cũ"
                        placeholderTextColor={isDark ? "#666" : "#999"}
                    />

                    <Text style={[styles.label, { color: isDark ? "#ccc" : "#333" }]}>Mật khẩu mới</Text>
                    <TextInput
                        style={[styles.input, { backgroundColor: isDark ? "#1a1a1a" : "#fff", color: isDark ? "#fff" : "#000", borderColor: isDark ? "#444" : "#ccc" }]}
                        secureTextEntry
                        value={newPassword}
                        onChangeText={setNewPassword}
                        placeholder="Nhập mật khẩu mới"
                        placeholderTextColor={isDark ? "#666" : "#999"}
                    />

                    <Text style={[styles.label, { color: isDark ? "#ccc" : "#333" }]}>Nhập lại mật khẩu mới</Text>
                    <TextInput
                        style={[styles.input, { backgroundColor: isDark ? "#1a1a1a" : "#fff", color: isDark ? "#fff" : "#000", borderColor: isDark ? "#444" : "#ccc" }]}
                        secureTextEntry
                        value={confirmPassword}
                        onChangeText={setConfirmPassword}
                        placeholder="Nhập lại mật khẩu mới"
                        placeholderTextColor={isDark ? "#666" : "#999"}
                    />
                </>
            );
        } else {
            // landscape: chia 2 cột
            return (
                <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                    <View style={{ flex: 1, marginRight: 10 }}>
                        <Text style={[styles.label, { color: isDark ? "#ccc" : "#333" }]}>Mật khẩu cũ</Text>
                        <TextInput
                            style={[styles.input, { backgroundColor: isDark ? "#1a1a1a" : "#fff", color: isDark ? "#fff" : "#000", borderColor: isDark ? "#444" : "#ccc" }]}
                            secureTextEntry
                            value={oldPassword}
                            onChangeText={setOldPassword}
                            placeholder="Nhập mật khẩu cũ"
                            placeholderTextColor={isDark ? "#666" : "#999"}
                        />

                        <Text style={[styles.label, { color: isDark ? "#ccc" : "#333" }]}>Mật khẩu mới</Text>
                        <TextInput
                            style={[styles.input, { backgroundColor: isDark ? "#1a1a1a" : "#fff", color: isDark ? "#fff" : "#000", borderColor: isDark ? "#444" : "#ccc" }]}
                            secureTextEntry
                            value={newPassword}
                            onChangeText={setNewPassword}
                            placeholder="Nhập mật khẩu mới"
                            placeholderTextColor={isDark ? "#666" : "#999"}
                        />
                    </View>

                    <View style={{ flex: 1, marginLeft: 10 }}>
                        <Text style={[styles.label, { color: isDark ? "#ccc" : "#333" }]}>Nhập lại mật khẩu mới</Text>
                        <TextInput
                            style={[styles.input, { backgroundColor: isDark ? "#1a1a1a" : "#fff", color: isDark ? "#fff" : "#000", borderColor: isDark ? "#444" : "#ccc" }]}
                            secureTextEntry
                            value={confirmPassword}
                            onChangeText={setConfirmPassword}
                            placeholder="Nhập lại mật khẩu mới"
                            placeholderTextColor={isDark ? "#666" : "#999"}
                        />

                        <TouchableOpacity
                            style={[styles.button, loading && { opacity: 0.6, marginTop: 20 }]}
                            onPress={handleSubmit}
                            disabled={loading}
                        >
                            <Text style={styles.buttonText}>{loading ? "Đang xử lý..." : "Đổi mật khẩu"}</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            );
        }
    };

    return (
        <ScrollView
            contentContainerStyle={{ flexGrow: 1, padding: 20, justifyContent: "center" }}
        >
            <Text style={[styles.title, { color: isDark ? "#fff" : "#000" }]}>Đổi mật khẩu</Text>
            {renderInputs()}
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    title: {
        fontSize: 20,
        fontWeight: "700",
        textAlign: "center",
        marginBottom: 30,
    },
    label: {
        fontSize: 14,
        fontWeight: "500",
        marginTop: 10,
    },
    input: {
        padding: 12,
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 8,
        marginTop: 8,
    },
    button: {
        backgroundColor: "#007aff",
        padding: 16,
        borderRadius: 10,
        alignItems: "center",
        marginTop: 30,
    },
    buttonText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "600",
    },
});
