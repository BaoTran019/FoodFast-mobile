import { fetchOrdersByUser } from "@/api/orders";
import { getUser } from "@/storage/user-storage";
import { useFocusEffect } from "@react-navigation/native";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    FlatList,
    StyleSheet,
    Text,
    TouchableOpacity,
    useColorScheme,
    useWindowDimensions,
    View,
} from "react-native";

const STATUS_LIST = ["pending", "processing", "delivering", "completed"];

export default function MyOrdersScreen() {
    const router = useRouter();
    const { width, height } = useWindowDimensions();
    const scheme = useColorScheme();

    const isDark = scheme === "dark";
    const isLandscape = width > height; // ⭐ Landscape vẫn nằm ngang

    const themeStyles = isDark ? darkTheme : lightTheme;

    const [orders, setOrders] = useState<any[]>([]);
    const [filteredOrders, setFilteredOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedStatus, setSelectedStatus] = useState("pending");

    useFocusEffect(
        React.useCallback(() => {
            loadOrders();
        }, [])
    );

    useEffect(() => {
        filterOrders(selectedStatus);
    }, [selectedStatus, orders]);


    const loadOrders = async () => {
        try {
            const stored = await getUser();
            if (!stored || !stored.user.uid) return;

            const userId = stored.user.uid;
            const res = await fetchOrdersByUser(userId);

            if (res.success) setOrders(res.orders || []);
            else setOrders([]);

            setLoading(false);
        } catch (err) {
            console.error("Lỗi tải order:", err);
            setLoading(false);
        }
    };

    const filterOrders = (status: string) => {
        const result = orders.filter((order) => order.status === status);
        setFilteredOrders(result);
    };

    // ⭐ Format ngày từ Firestore timestamp và format tiền
    const formatDate = (date: any) => {
        if (!date) return "";
        // Nếu date là object {_seconds, _nanoseconds}
        let d: Date;
        if (date._seconds) {
            d = new Date(date._seconds * 1000);
        } else {
            d = new Date(date);
        }
        return d.toLocaleString("vi-VN");
    };

    const formatPrice = (price: number) => {
        return price.toLocaleString("vi-VN") + " vnđ";
    };

    const sortedOrders = filteredOrders.sort((a, b) => {
        const dateA = a.createdAt?._seconds ? a.createdAt._seconds * 1000 : new Date(a.createdAt).getTime();
        const dateB = b.createdAt?._seconds ? b.createdAt._seconds * 1000 : new Date(b.createdAt).getTime();
        return dateB - dateA; // b - a để mới nhất lên trước
    });

    const handlePressOrder = (item: any) => {
        router.push({
            pathname: "/orders/orderDetail",
            params: { order: JSON.stringify(item) },
        });
    };


    const renderOrderItem = ({ item }: any) => (
        <TouchableOpacity style={[styles.orderCard, themeStyles.card]} onPress={() => handlePressOrder(item)}>
            <Text style={[styles.orderId, themeStyles.text]}>#{item.id}</Text>
            <Text style={[styles.orderText, themeStyles.text]}>
                Tổng tiền: {formatPrice(item.totalPrice)}
            </Text>
            <Text style={[styles.orderText, themeStyles.text]}>
                Số món: {item.items?.length || 0}
            </Text>
            <Text style={[styles.orderTime, themeStyles.subText]}>
                Ngày tạo: {formatDate(item.createdAt)}
            </Text>
        </TouchableOpacity>
    );

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#007aff" />
            </View>
        );
    }

    return (
        <View style={[styles.container, themeStyles.background]}>
            <Text style={[styles.title, themeStyles.text]}>Đơn hàng của tôi</Text>

            {/* ⭐ FILTER BAR luôn nằm ngang kể cả landscape */}
            <View
                style={[
                    styles.filterBar,
                    { flexWrap: "wrap", flexDirection: "row" },
                ]}
            >
                {STATUS_LIST.map((status) => (
                    <TouchableOpacity
                        key={status}
                        style={[
                            styles.filterButton,
                            themeStyles.card,
                            selectedStatus === status && styles.filterButtonActive,
                        ]}
                        onPress={() => setSelectedStatus(status)}
                    >
                        <Text
                            style={[
                                styles.filterText,
                                themeStyles.text,
                                selectedStatus === status && styles.filterTextActive,
                            ]}
                        >
                            {status.toUpperCase()}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            <FlatList
                data={sortedOrders}
                keyExtractor={(item) => item.id}
                renderItem={renderOrderItem}
                ListEmptyComponent={
                    <Text style={[styles.emptyText, themeStyles.subText]}>
                        Không có đơn hàng nào.
                    </Text>
                }
                contentContainerStyle={{ paddingBottom: 40 }}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 16 },

    title: {
        fontSize: 22,
        fontWeight: "700",
        textAlign: "center",
        marginBottom: 20,
    },

    // ⭐ FILTER BAR — luôn nằm ngang và có wrap
    filterBar: {
        justifyContent: "flex-start",
        flexDirection: "row",
        width: "100%",
        marginBottom: 10,
    },

    // ⭐ Nút nhỏ gọn hơn
    filterButton: {
        paddingVertical: 6,
        paddingHorizontal: 10,
        borderRadius: 6,
        backgroundColor: "#e5e5e5",
        marginRight: 6,
        marginBottom: 6,
        borderWidth: 1,
        borderColor: "#ccc",
    },

    filterButtonActive: {
        backgroundColor: "#007aff",
        borderColor: "#007aff",
    },

    filterText: {
        fontSize: 9,
        fontWeight: "600",
        color: "#444",
    },
    filterTextActive: {
        color: "#fff",
    },

    orderCard: {
        padding: 16,
        borderRadius: 10,
        marginBottom: 12,
        borderWidth: 1,
    },

    orderId: { fontSize: 16, fontWeight: "700" },
    orderText: { marginTop: 6, fontSize: 15, fontWeight: "500" },
    orderTime: { marginTop: 4, fontSize: 13 },

    loadingContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },

    emptyText: {
        textAlign: "center",
        marginTop: 20,
        fontSize: 16,
    },
});

// 🌙🌙🌙 Dark / Light theme 🌙🌙🌙
const lightTheme = {
    background: { backgroundColor: "#fff" },
    card: { backgroundColor: "#fafafa", borderColor: "#ddd" },
    text: { color: "#000" },
    subText: { color: "#666" },
};

const darkTheme = {
    background: { backgroundColor: "#000" },
    card: { backgroundColor: "#1c1c1e", borderColor: "#333" },
    text: { color: "#fff" },
    subText: { color: "#aaa" },
};
