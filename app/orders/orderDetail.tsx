import { deleteOrder, updateOrderStatus } from "@/api/orders";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useState } from "react";
import {
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    useWindowDimensions,
    View,
} from "react-native";

const STATUS_LIST = [
  { key: "pending", label: "Pending", color: "#a29bfe" },     // tím pastel
  { key: "processing", label: "Processing", color: "#fab1a0" }, // cam pastel
  { key: "delivering", label: "Delivering", color: "#74b9ff" }, // xanh dương pastel
  { key: "completed", label: "Completed", color: "#55efc4" },  // xanh lá pastel
];

export default function OrderDetailScreen() {
  const router = useRouter();
  const { order } = useLocalSearchParams();
  const { width, height } = useWindowDimensions();
  const isLandscape = width > height;

  const [orderData, setOrderData] = useState<any>(
    order ? JSON.parse(order as string) : null
  );
  const [loading, setLoading] = useState(false);

  // Xác nhận đã nhận hàng
  const handleConfirmDelivered = async () => {
    if (!orderData?.id) return;
    setLoading(true);
    try {
      const res = await updateOrderStatus(orderData.id, "completed");
      setLoading(false);
      if (res.success) {
        Alert.alert("Thành công", "Đơn hàng đã được xác nhận!");
        setOrderData({ ...orderData, status: "completed" });
      } else {
        Alert.alert("Lỗi", res.error || "Cập nhật trạng thái thất bại");
      }
    } catch (err) {
      setLoading(false);
      console.error(err);
      Alert.alert("Lỗi", "Có lỗi xảy ra khi cập nhật trạng thái");
    }
  };

  // Hủy đơn hàng
  const handleCancelOrder = async () => {
    if (!orderData?.id) return;
    Alert.alert(
      "Xác nhận",
      "Bạn có chắc muốn hủy đơn hàng này?",
      [
        { text: "Không", style: "cancel" },
        {
          text: "Có",
          style: "destructive",
          onPress: async () => {
            setLoading(true);
            try {
              const res = await deleteOrder(orderData.id);
              setLoading(false);
              if (res.success) {
                Alert.alert("Thành công", "Đơn hàng đã bị hủy!");
                router.back(); // quay về danh sách đơn hàng
              } else {
                Alert.alert("Lỗi", res.error || "Hủy đơn thất bại");
              }
            } catch (err) {
              setLoading(false);
              console.error(err);
              Alert.alert("Lỗi", "Có lỗi xảy ra khi hủy đơn hàng");
            }
          },
        },
      ]
    );
  };

  const formatDate = (date: any) => {
    if (!date) return "";
    return date._seconds
      ? new Date(date._seconds * 1000).toLocaleString("vi-VN")
      : new Date(date).toLocaleString("vi-VN");
  };

  const formatPrice = (price: number) =>
    price.toLocaleString("vi-VN") + " vnđ";

  if (!orderData) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Không tìm thấy thông tin đơn hàng.</Text>
      </View>
    );
  }

  const currentStatusIndex = STATUS_LIST.findIndex(
    (s) => s.key === orderData.status
  );

  return (
    <ScrollView style={styles.container}>
      {/* Button quay lại */}
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => router.back()}
      >
        <Text style={styles.backButtonText}>← Quay lại</Text>
      </TouchableOpacity>

      <Text style={styles.title}>Chi tiết đơn hàng #{orderData.id}</Text>

      <View
        style={[
          styles.content,
          isLandscape && { flexDirection: "row", justifyContent: "space-between" },
        ]}
      >
        {/* Thông tin người nhận */}
        <View style={styles.left}>
          <Text style={styles.sectionTitle}>Thông tin người nhận</Text>
          <Text>Tên: {orderData.recipientName}</Text>
          <Text>SĐT: {orderData.recipientPhone}</Text>
          <Text>Địa chỉ: {orderData.shipping_address}</Text>

          <Text style={[styles.sectionTitle, { marginTop: 12 }]}>
            Chi tiết món
          </Text>
          {orderData.items?.map((item: any, idx: number) => (
            <View key={idx} style={styles.itemRow}>
              <Text>{item.name} x{item.quantity}</Text>
              <Text>{formatPrice(item.price * item.quantity)}</Text>
            </View>
          ))}
          <Text style={[styles.total, { marginTop: 10 }]}>
            Tổng: {formatPrice(orderData.totalPrice)}
          </Text>
        </View>

        {/* Timeline ngang */}
        <View style={styles.right}>
          <Text style={styles.sectionTitle}>Trạng thái đơn hàng</Text>
          <View style={styles.timelineContainer}>
            {STATUS_LIST.map((status, idx) => {
              const active = idx <= currentStatusIndex;
              return (
                <React.Fragment key={status.key}>
                  <View style={styles.timelineItem}>
                    <View
                      style={[
                        styles.timelineCircle,
                        { backgroundColor: active ? status.color : "#eee", borderColor: status.color },
                      ]}
                    />
                    <Text
                      style={[
                        styles.timelineText,
                        { color: active ? status.color : "#aaa" },
                      ]}
                    >
                      {status.label}
                    </Text>
                  </View>
                  {idx < STATUS_LIST.length - 1 && (
                    <View
                      style={[
                        styles.timelineBar,
                        { backgroundColor: idx < currentStatusIndex ? STATUS_LIST[idx].color : "#eee" },
                      ]}
                    />
                  )}
                </React.Fragment>
              );
            })}
          </View>

          {/* Button xác nhận đã nhận hàng */}
          {orderData.status === "delivering" && (
            <TouchableOpacity
              style={[styles.button, loading && { opacity: 0.6 }]}
              onPress={handleConfirmDelivered}
              disabled={loading}
            >
              <Text style={styles.buttonText}>
                {loading ? "Đang xử lý..." : "Xác nhận đã nhận hàng"}
              </Text>
            </TouchableOpacity>
          )}

          {/* Button hủy đơn hàng nếu pending */}
          {orderData.status === "pending" && (
            <TouchableOpacity
              style={[styles.cancelButton, loading && { opacity: 0.6 }]}
              onPress={handleCancelOrder}
              disabled={loading}
            >
              <Text style={styles.cancelButtonText}>
                {loading ? "Đang xử lý..." : "Hủy đơn hàng"}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#fff" },

  backButton: {
    marginBottom: 10,
    padding: 6,
    alignSelf: "flex-start",
  },
  backButtonText: { fontSize: 16, color: "#007aff" },

  title: { fontSize: 22, fontWeight: "700", marginBottom: 20, textAlign: "center" },
  content: { flex: 1 },
  left: { flex: 1 },
  right: { flex: 1, marginTop: 20 },

  sectionTitle: { fontWeight: "700", marginBottom: 8, fontSize: 16 },
  itemRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 4 },
  total: { fontWeight: "700", fontSize: 16 },

  timelineContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 16,
  },
  timelineItem: { alignItems: "center", flex: 1 },
  timelineCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    marginBottom: 4,
    zIndex: 1,
  },
  timelineText: { fontSize: 9, textAlign: "center" },
  timelineBar: {
    flex: 1,
    height: 6,
    marginHorizontal: -2,
    marginTop: -12,
    borderRadius: 3,
  },

  button: {
    marginTop: 20,
    backgroundColor: "#007aff",
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
  },
  buttonText: { color: "#fff", fontWeight: "700" },

  cancelButton: {
    marginTop: 12,
    backgroundColor: "#ff7675",
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
  },
  cancelButtonText: { color: "#fff", fontWeight: "700" },

  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
});
