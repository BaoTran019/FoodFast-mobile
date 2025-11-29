import { login, register } from "@/api/auth-api";
import { useCart } from "@/context/cartContext";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { saveUser } from "@/storage/user-storage";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity
} from "react-native";


export default function AuthScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const router = useRouter();

  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");

  const { refreshCart } = useCart();


  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Lỗi", "Vui lòng nhập đầy đủ email và mật khẩu");
      return;
    }

    setLoading(true);
    const res = await login(email, password);
    setLoading(false);

    if (res.success && res.user && res.idToken) {
      await saveUser(res.user, res.idToken);
      Alert.alert("Thành công", `Chào mừng ${res.user.name}`);
      await refreshCart();

      router.replace("/restaurants"); // ← chuyển trang
    } else {
      Alert.alert("Lỗi", res.error || "Đăng nhập thất bại");
    }
  };

  const handleRegister = async () => {
    if (!name || !email || !password) {
      Alert.alert("Lỗi", "Vui lòng nhập đầy đủ thông tin");
      return;
    }

    setLoading(true);
    const res = await register(name, email, password, phone, address);
    setLoading(false);

    if (res.success) {
      Alert.alert("Thành công", "Đăng ký thành công! Mời bạn đăng nhập");
      setIsLogin(true);
    } else {
      Alert.alert("Lỗi", res.error || "Đăng ký thất bại");
    }
  };

  return (
    <ScrollView
      contentContainerStyle={[
        styles.container,
        { backgroundColor: isDark ? "#111" : "#F8F8F8" },
      ]}
      keyboardShouldPersistTaps="handled"
    >
      <Image
        source={require("@/assets/logo.png")}
        style={styles.logo}
      />

      <Text style={[styles.title, { color: isDark ? "#FFF" : "#222" }]}>
        {isLogin ? "Đăng nhập" : "Đăng ký"}
      </Text>

      {!isLogin && (
        <TextInput
          placeholder="Họ và tên"
          placeholderTextColor={isDark ? "#AAA" : "#888"}
          style={[
            styles.input,
            { color: isDark ? "#FFF" : "#222", borderColor: isDark ? "#555" : "#CCC" },
          ]}
          value={name}
          onChangeText={setName}
        />
      )}

      <TextInput
        placeholder="Email"
        placeholderTextColor={isDark ? "#AAA" : "#888"}
        style={[
          styles.input,
          { color: isDark ? "#FFF" : "#222", borderColor: isDark ? "#555" : "#CCC" },
        ]}
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />

      <TextInput
        placeholder="Mật khẩu"
        placeholderTextColor={isDark ? "#AAA" : "#888"}
        style={[
          styles.input,
          { color: isDark ? "#FFF" : "#222", borderColor: isDark ? "#555" : "#CCC" },
        ]}
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      {!isLogin && (
        <>
          <TextInput
            placeholder="Số điện thoại"
            placeholderTextColor={isDark ? "#AAA" : "#888"}
            style={[
              styles.input,
              { color: isDark ? "#FFF" : "#222", borderColor: isDark ? "#555" : "#CCC" },
            ]}
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
          />

          <TextInput
            placeholder="Địa chỉ"
            placeholderTextColor={isDark ? "#AAA" : "#888"}
            style={[
              styles.input,
              { color: isDark ? "#FFF" : "#222", borderColor: isDark ? "#555" : "#CCC" },
            ]}
            value={address}
            onChangeText={setAddress}
          />
        </>
      )}

      <TouchableOpacity
        style={[styles.button, { backgroundColor: isDark ? "#FF6347" : "#FFB86C" }]}
        onPress={isLogin ? handleLogin : handleRegister}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#FFF" />
        ) : (
          <Text style={styles.buttonText}>{isLogin ? "Đăng nhập" : "Đăng ký"}</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity onPress={() => setIsLogin(!isLogin)}>
        <Text
          style={{
            color: isDark ? "#FFD700" : "#FF6347",
            marginTop: 10,
            textAlign: "center",
          }}
        >
          {isLogin ? "Bạn chưa có tài khoản? Đăng ký ngay" : "Bạn đã có tài khoản? Đăng nhập"}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 20,
  },
  title: { fontSize: 28, fontWeight: "700", marginBottom: 20, textAlign: "center" },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 12,
    marginBottom: 15,
  },
  button: {
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 10,
  },
  buttonText: { color: "#FFF", fontSize: 16, fontWeight: "600" },
  logo: {
    width: 220,
    height: 80,
    alignSelf: "center",
    marginBottom: 20,
    resizeMode: "contain",
  },

});
