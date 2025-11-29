import { CartItem } from "@/api/cart";
import { useCart } from "@/context/cartContext";
import { useNavigation } from "@react-navigation/native";
import React from "react";
import {
  Alert,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function CartScreen() {
  const { cartItems, updateItemQty, removeItem, clearAll } = useCart();
  const navigation = useNavigation<any>();

  // Nhóm cartItems theo restaurantId
  const groupedCart: Record<string, CartItem[]> = cartItems.reduce(
    (acc, item) => {
      if (!acc[item.restaurantId]) acc[item.restaurantId] = [];
      acc[item.restaurantId].push(item);
      return acc;
    },
    {} as Record<string, CartItem[]>
  );

  const handleClearCart = () => {
    Alert.alert("Xác nhận", "Bạn có chắc muốn xóa toàn bộ giỏ hàng?", [
      { text: "Hủy", style: "cancel" },
      { text: "Xóa", style: "destructive", onPress: clearAll },
    ]);
  };

  const handlePlaceOrder = (restaurantId: string, restaurantName: string) => {
    const itemsToOrder = groupedCart[restaurantId];
    if (!itemsToOrder || itemsToOrder.length === 0) {
      Alert.alert("Giỏ hàng trống", "Chưa có món nào để đặt");
      return;
    }

    // Chuyển trang và truyền params
    navigation.navigate("placeOrder", {
      restaurantId,
      restaurantName,
      items: itemsToOrder,
    });
  };

  const renderCartItem = (item: CartItem) => (
    <View style={styles.item} key={item.id}>
      <Text style={styles.name}>{item.name}</Text>
      <Text style={styles.price}>{item.price?.toLocaleString("vi-VN")} đ</Text>
      <View style={styles.qtyContainer}>
        <TouchableOpacity
          onPress={() => {
            if (item.quantity > 1) updateItemQty(item.id, -1);
          }}
        >
          <Text style={styles.qtyBtn}>-</Text>
        </TouchableOpacity>
        <Text style={styles.qty}>{item.quantity}</Text>
        <TouchableOpacity onPress={() => updateItemQty(item.id, 1)}>
          <Text style={styles.qtyBtn}>+</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => removeItem(item.id)}>
          <Text style={styles.remove}>Xóa</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {cartItems.length === 0 ? (
        <Text style={styles.empty}>Giỏ hàng của bạn đang trống.</Text>
      ) : (
        <FlatList
          data={Object.entries(groupedCart)}
          keyExtractor={([restaurantId]) => restaurantId}
          renderItem={({ item }) => {
            const [restaurantId, items] = item; // items: CartItem[]
            const totalQty = items.reduce(
              (sum, i) => sum + (i.quantity || 0),
              0
            );
            const totalPrice = items.reduce(
              (sum, i) => sum + (i.price || 0) * (i.quantity || 0),
              0
            );

            return (
              <View style={styles.restaurantGroup}>
                <Text style={styles.restaurantName}>{items[0].restaurantName}</Text>

                {items.map(renderCartItem)}

                <Text style={styles.groupTotal}>
                  Tổng ({totalQty} món): {totalPrice.toLocaleString("vi-VN")} đ
                </Text>

                <TouchableOpacity
                  style={styles.checkoutBtn}
                  onPress={() =>
                    handlePlaceOrder(
                      restaurantId,
                      items[0].restaurantName
                    )
                  }
                >
                  <Text style={styles.checkoutText}>Đặt hàng</Text>
                </TouchableOpacity>
              </View>
            );
          }}
        />
      )}

      {cartItems.length > 0 && (
        <TouchableOpacity style={styles.clearBtn} onPress={handleClearCart}>
          <Text style={styles.clearText}>Xóa tất cả</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#fff" },

  // Item
  item: {
    marginBottom: 16,
    padding: 14,
    backgroundColor: "#f6f6f6",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#eee",
  },
  name: { fontSize: 16, fontWeight: "600" },
  price: { marginTop: 4, fontSize: 14, color: "#444" },
  qtyContainer: { flexDirection: "row", alignItems: "center", marginTop: 10 },
  qtyBtn: {
    fontSize: 22,
    width: 34,
    height: 34,
    textAlign: "center",
    textAlignVertical: "center",
    backgroundColor: "#ddd",
    borderRadius: 6,
  },
  qty: { fontSize: 16, marginHorizontal: 10 },
  remove: { marginLeft: 12, color: "red", fontSize: 15, fontWeight: "600" },

  // Restaurant Group
  restaurantGroup: {
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 12,
    borderRadius: 10,
  },
  restaurantName: { fontSize: 18, fontWeight: "700", marginBottom: 12 },
  groupTotal: { fontSize: 16, fontWeight: "700", marginVertical: 8 },

  // Footer
  clearBtn: {
    padding: 12,
    borderRadius: 8,
    backgroundColor: "#ff6b6b",
    alignItems: "center",
  },
  clearText: { color: "#fff", fontWeight: "700" },
  checkoutBtn: {
    padding: 12,
    borderRadius: 8,
    backgroundColor: "#4caf50",
    alignItems: "center",
  },
  checkoutText: { color: "#fff", fontWeight: "700" },
  empty: { marginTop: 40, textAlign: "center", fontSize: 16, color: "#888" },
});
