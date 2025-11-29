import { getUser, removeUser } from "@/storage/user-storage";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { useRouter } from 'expo-router';
import React from "react";
import {
    Alert,
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    useColorScheme,
    View,
} from "react-native";

export default function ProfileScreen() {
    const scheme = useColorScheme();
    const isDark = scheme === "dark";
    const navigation = useNavigation();
    const [user, setUser] = React.useState<{ name: string; email: string } | null>(null);
    const router = useRouter();


    useFocusEffect(
        React.useCallback(() => {
            const loadUser = async () => {
                const stored = await getUser();
                if (stored) {
                    setUser({
                        name: stored.user.name || "",
                        email: stored.user.email || "",
                    });
                }
            };
            loadUser();
        }, [])
    );

    const handleLogout = async () => {
        Alert.alert("Đăng xuất", "Bạn có chắc muốn đăng xuất?", [
            { text: "Hủy", style: "cancel" },
            {
                text: "Đăng xuất",
                style: "destructive",
                onPress: async () => {
                    await removeUser();
                    router.push('../auth');
                },
            },
        ]);
    };

    const handleChangeInfo = () => {
        router.push('../profile/changeInfo');
    };

    const handleChangePassword = () => {
        router.push('../profile/changePassword');
    };

    return (
        <ScrollView style={[styles.container, { backgroundColor: isDark ? "#000" : "#fff" }]}>
            {/* Avatar */}
            <View style={styles.avatarContainer}>
                <Image
                    source={require("@/assets/chic_ava.jpg")} // avatar tượng trưng
                    style={styles.avatar}
                />
                <Text style={[styles.name, { color: isDark ? "#fff" : "#000" }]}>
                    {user?.name || "Người dùng"}
                </Text>
                <Text style={[styles.email, { color: isDark ? "#ccc" : "#555" }]}>
                    {user?.email || "user@example.com"}
                </Text>
            </View>

            {/* Options */}
            <View style={styles.optionsContainer}>
                <TouchableOpacity
                    style={[styles.optionBtn, { backgroundColor: isDark ? "#1a1a1a" : "#f2f2f2" }]}
                    onPress={handleChangeInfo}
                >
                    <Text style={{ color: isDark ? "#fff" : "#000" }}>Thay đổi thông tin</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.optionBtn, { backgroundColor: isDark ? "#1a1a1a" : "#f2f2f2" }]}
                    onPress={handleChangePassword}
                >
                    <Text style={{ color: isDark ? "#fff" : "#000" }}>Đổi mật khẩu</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.optionBtn, { backgroundColor: isDark ? "#1a1a1a" : "#f2f2f2" }]}
                    onPress={handleLogout}
                >
                    <Text style={{ color: "red", fontWeight: "600" }}>Đăng xuất</Text>
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 16 },
    avatarContainer: {
        alignItems: "center",
        marginBottom: 30,
    },
    avatar: {
        width: 100,
        height: 100,
        borderRadius: 50,
        marginBottom: 12,
    },
    name: { fontSize: 20, fontWeight: "700" },
    email: { fontSize: 14, marginTop: 4 },
    optionsContainer: {
        marginTop: 20,
    },
    optionBtn: {
        padding: 16,
        borderRadius: 10,
        marginBottom: 12,
    },
});
