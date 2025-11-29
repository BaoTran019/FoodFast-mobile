import { useCart } from "@/context/cartContext";
import { useRouter } from "expo-router";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function FloatingCartButton() {
  const { totalQty } = useCart();
  const router = useRouter();

  if (totalQty === 0) return null; // không hiện nếu giỏ trống

  return (
    <TouchableOpacity
      style={styles.button}
      onPress={() => router.push("/cart")} // điều hướng tới trang cart
      activeOpacity={0.8}
    >
      <Text style={styles.icon}>🛒</Text>
      <View style={styles.badge}>
        <Text style={styles.badgeText}>{totalQty}</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    position: "absolute",
    bottom: 30,
    right: 20,
    backgroundColor: "#FF6347",
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 20,
    zIndex: 1000,
  },
  icon: {
    fontSize: 28,
    color: "#fff",
  },
  badge: {
    position: "absolute",
    top: 5,
    right: 5,
    backgroundColor: "#FFD700",
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  badgeText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#000",
  },
});
