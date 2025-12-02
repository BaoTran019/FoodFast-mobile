import { CartItem } from "@/api/cart";
import { createOrder } from "@/api/orders";
import { getCoordinatesFromText } from "@/api/ors";
import { useCart } from "@/context/cartContext";
import { getUser } from "@/storage/user-storage";
import { useNavigation, useRoute } from "@react-navigation/native";
import React, { useEffect, useMemo, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    FlatList,
    Platform,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
    useColorScheme,
} from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";


interface RouteParams {
    restaurantId: string;
    restaurantName: string;
    items: CartItem[];
}

export default function PlaceOrderScreen() {
    const scheme = useColorScheme(); // ⭐ detect dark/light
    const isDark = scheme === "dark";

    const { removeItem } = useCart();
    const navigation = useNavigation();
    const route = useRoute();
    const { restaurantId, restaurantName, items } = route.params as RouteParams;

    const filteredItems = useMemo(() => items, [items]);
    const totalPrice = filteredItems.reduce(
        (sum, i) => sum + (i.price || 0) * (i.quantity || 0),
        0
    );

    const [recipientName, setRecipientName] = useState("");
    const [phone, setPhone] = useState("");
    const [address, setAddress] = useState("");

    const [loading, setLoading] = useState(false)

    const [lat, setLat] = useState<number | null>(null);
    const [lng, setLng] = useState<number | null>(null);
    const [geoLoading, setGeoLoading] = useState(false);


    useEffect(() => {
        const loadUser = async () => {
            const stored = await getUser();
            if (stored) {
                setRecipientName(stored.user.name || "");
                setPhone(stored.user.phone || "");
                setAddress(stored.user.address || "");
            }
        };
        loadUser();
    }, []);

    // Gọi ORS mỗi khi address thay đổi (debounce 600ms)
    useEffect(() => {
        if (!address || address.length < 5) return;

        const timeout = setTimeout(async () => {
            setGeoLoading(true);

            const res = await getCoordinatesFromText(address);

            if (res.success) {
                setLat(res.lat!);
                setLng(res.lng!);
            }

            setGeoLoading(false);
        }, 600); // tránh spam API

        return () => clearTimeout(timeout);
    }, [address]);


    const handlePlaceOrder = async () => {
        const stored = await getUser();
        if (!stored) return;

        if (filteredItems.length === 0) {
            Alert.alert("Giỏ hàng", "Không có món nào để đặt.");
            return;
        }

        if (!recipientName || !phone || !address) {
            Alert.alert("Thông tin chưa đầy đủ", "Vui lòng nhập đầy đủ thông tin.");
            return;
        }

        const order = {
            userId: stored.user.uid,
            restaurantId,
            restaurantName,
            items: filteredItems.map((i) => ({
                productId: i.id,
                name: i.name,
                price: i.price,
                quantity: i.quantity,
            })),
            totalPrice,
            status: "pending" as const,
            recipientName,
            recipientPhone: phone,
            shipping_address: address,
            createdAt: new Date().toISOString(),
            lat: lat ?? 10.76143,
            lng: lng ?? 106.68191,
        };

        try {
            setLoading(true)
            const data = await createOrder(order);
            if (data.success) {
                Alert.alert("Thành công", "Đặt hàng thành công!");
                await Promise.all(filteredItems.map((item) => removeItem(item.id)));
                navigation.goBack();
            } else {
                Alert.alert("Thất bại", data.error || "Đặt hàng thất bại");
            }
        } catch (err) {
            console.error("PlaceOrder error:", err);
            Alert.alert("Lỗi", "Có lỗi xảy ra khi đặt hàng");
        } finally {
            setLoading(false)
        }
    };

    const renderItem = ({ item }: any) => (
        <View style={[styles.item, { borderColor: isDark ? "#333" : "#eee" }]}>
            <Text style={[styles.name, { color: isDark ? "#fff" : "#000" }]}>
                {item.name}
            </Text>
            <Text style={[styles.price, { color: isDark ? "#bbb" : "#333" }]}>
                {item.price?.toLocaleString("vi-VN")} đ
            </Text>
            <Text style={[styles.qty, { color: isDark ? "#bbb" : "#333" }]}>
                Số lượng: {item.quantity}
            </Text>
        </View>
    );

    return (
        <View
            style={{
                flex: 1,
                backgroundColor: isDark ? "#000" : "#fff",
            }}
        >
            <KeyboardAwareScrollView
                style={{ flex: 1 }}
                contentContainerStyle={{ padding: 16, paddingBottom: 120 }}
                enableOnAndroid={true}
                extraScrollHeight={Platform.OS === "android" ? 80 : 40}
                keyboardShouldPersistTaps="handled"
            >
                <Text
                    style={[
                        styles.header,
                        { color: isDark ? "#fff" : "#000" },
                    ]}
                >
                    {restaurantName}
                </Text>

                <FlatList
                    data={filteredItems}
                    keyExtractor={(item) => item.id}
                    renderItem={renderItem}
                    ListEmptyComponent={
                        <Text style={{ color: isDark ? "#fff" : "#000" }}>
                            Giỏ hàng trống
                        </Text>
                    }
                    scrollEnabled={false}
                />

                {/* --- ĐƯỜNG KẺ NGANG --- */}
                <View
                    style={{
                        height: 1,
                        backgroundColor: isDark ? "#444" : "#ccc",
                        marginVertical: 22,
                    }}
                />

                {/* Input Section */}
                <View style={styles.inputContainer}>
                    <Text style={[
                        styles.header,
                        { color: isDark ? "#fff" : "#000" },
                    ]}>Thông tin nhận hàng</Text>
                    <Text style={[styles.label, { color: isDark ? "#fff" : "#000" }]}>
                        Người nhận
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
                        value={recipientName}
                        onChangeText={setRecipientName}
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
                        placeholder="Địa chỉ nhận hàng"
                        placeholderTextColor={isDark ? "#666" : "#999"}
                    />
                    {geoLoading ? (
                        <Text style={{ color: isDark ? "#aaa" : "#666", marginBottom: 10 }}>
                            Đang tìm tọa độ...
                        </Text>
                    ) : (
                        lat &&
                        lng && (
                            <Text style={{ color: isDark ? "#0f0" : "#090", marginBottom: 10 }}>
                                Lat: {lat} — Lng: {lng}
                            </Text>
                        )
                    )}

                </View>

                {filteredItems.length > 0 && (
                    <View style={styles.footerSpacer} />
                )}
            </KeyboardAwareScrollView>

            {/* Fixed Footer */}
            {filteredItems.length > 0 && (
                <View
                    style={[
                        styles.footer,
                        { backgroundColor: isDark ? "#111" : "#fafafa" },
                    ]}
                >
                    <Text
                        style={[
                            styles.total,
                            { color: isDark ? "#fff" : "#000" },
                        ]}
                    >
                        Tổng: {totalPrice.toLocaleString("vi-VN")} đ
                    </Text>

                    <TouchableOpacity
                        style={styles.placeBtn}
                        onPress={handlePlaceOrder}
                    >
                        <TouchableOpacity
                            style={[
                                styles.placeBtn,
                                loading && { opacity: 0.6 } // mờ khi disable
                            ]}
                            onPress={handlePlaceOrder}
                            disabled={loading}
                        >
                            {loading ? (
                                <ActivityIndicator size="small" color="#fff" />
                            ) : (
                                <Text style={styles.placeText}>Đặt hàng</Text>
                            )}
                        </TouchableOpacity>
                    </TouchableOpacity>
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    header: { fontSize: 22, fontWeight: "700", marginBottom: 12 },
    item: {
        padding: 12,
        borderWidth: 1,
        borderRadius: 8,
        marginBottom: 10,
    },
    name: { fontSize: 16, fontWeight: "600" },
    price: { marginTop: 4, fontSize: 14 },
    qty: { marginTop: 2, fontSize: 14 },

    inputContainer: { marginTop: 0 },

    label: { marginBottom: 4, fontSize: 14 },

    input: {
        borderWidth: 1,
        borderRadius: 8,
        padding: 10,
        marginBottom: 14,
        fontSize: 15,
    },

    footerSpacer: { height: 140 },

    footer: {
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        padding: 16,
        borderTopWidth: 1,
        borderColor: "#333",
    },
    total: { fontSize: 18, fontWeight: "700", marginBottom: 12 },

    placeBtn: {
        backgroundColor: "#4caf50",
        padding: 8,
        borderRadius: 10,
        alignItems: "center",
    },
    placeText: { color: "#fff", fontWeight: "700", fontSize: 17 },
});
