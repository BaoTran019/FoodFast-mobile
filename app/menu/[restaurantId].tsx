import { fetchMenu } from "@/api/menu";
import { fetchRestaurantById } from "@/api/restaurants";
import FloatingCartButton from "@/components/FloatingCartButton";
import { useCart } from "@/context/cartContext";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, FlatList, Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";

type MenuItem = { id: string; name: string; price?: number; description?: string };
type RestaurantInfo = { id: string; name: string; address?: string; rating: number; active: boolean; image?: string };

const formatVND = (value: number) => value.toLocaleString("vi-VN") + " vnđ";

export default function MenuPage() {
  const { restaurantId } = useLocalSearchParams<{ restaurantId: string }>();
  const { addItem } = useCart();
  const [menu, setMenu] = useState<MenuItem[]>([]);
  const [restaurant, setRestaurant] = useState<RestaurantInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [addingId, setAddingId] = useState<string | null>(null); // item đang add
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  useEffect(() => {
    setLoading(true);
    Promise.all([fetchMenu(restaurantId), fetchRestaurantById(restaurantId)])
      .then(([menuData, restaurantData]) => {
        setMenu(menuData);
        setRestaurant(restaurantData);
      })
      .finally(() => setLoading(false));
  }, [restaurantId]);

  const handleAddToCart = async (item: MenuItem) => {
    setAddingId(item.id);
    try {
      await addItem(item, restaurantId!, restaurant?.name || "");
    } finally {
      setAddingId(null);
    }
  };

  if (loading)
    return (
      <ActivityIndicator
        style={{ flex: 1 }}
        size="large"
        color={isDark ? "#fff" : "#FF6347"}
      />
    );

  return (
    <View style={[styles.container, { backgroundColor: isDark ? "#111" : "#F8F8F8" }]}>
      <FloatingCartButton />
      <FlatList
        data={menu}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 30 }}
        ListHeaderComponent={
          restaurant ? (
            <View style={[styles.restaurantHeader, { backgroundColor: isDark ? "#FF6347" : "#FFB86C" }]}>
              <Image
                source={require("../../assets/restaurant.png")}
                style={styles.restaurantImage}
                resizeMode="cover"
              />
              <View style={styles.restaurantInfo}>
                <Text style={[styles.restaurantName, { color: isDark ? "#FFF" : "#222" }]}>
                  {restaurant.name}
                </Text>
                {restaurant.address && (
                  <Text style={[styles.restaurantAddress, { color: isDark ? "#EEE" : "#555" }]}>
                    {restaurant.address}
                  </Text>
                )}
                <Text style={[styles.restaurantMeta, { color: isDark ? "#FFD700" : "#FFF" }]}>
                  ⭐ {restaurant.rating.toFixed(1)} | {restaurant.active ? "Open" : "Closed"}
                </Text>
              </View>
            </View>
          ) : null
        }
        renderItem={({ item }) => (
          <View style={[styles.card, { backgroundColor: isDark ? "#1F1F1F" : "#FFF", shadowColor: isDark ? "#000" : "#AAA" }]}>
            <Text style={[styles.name, { color: isDark ? "#FFF" : "#222" }]}>{item.name}</Text>
            {item.description && (
              <Text style={[styles.description, { color: isDark ? "#CCC" : "#555" }]}>{item.description}</Text>
            )}
            {item.price !== undefined && (
              <Text style={[styles.price, { color: isDark ? "#FFD700" : "#FF6347" }]}>
                {formatVND(item.price)}
              </Text>
            )}
            <TouchableOpacity
              style={[styles.addBtn, { backgroundColor: isDark ? "#FFD700" : "#FF6347" }]}
              onPress={() => handleAddToCart(item)}
              disabled={addingId === item.id}
            >
              <Text style={styles.addText}>
                {addingId === item.id ? "Đang thêm..." : "Thêm vào giỏ"}
              </Text>
            </TouchableOpacity>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  restaurantHeader: { width: "100%", borderRadius: 20, marginBottom: 15, shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.2, shadowRadius: 6, elevation: 6 },
  restaurantImage: { width: "100%", height: 180 },
  restaurantInfo: { padding: 12, backgroundColor: "rgba(0,0,0,0.3)" },
  restaurantName: { fontSize: 20, fontWeight: "700", marginBottom: 4 },
  restaurantAddress: { fontSize: 14, marginBottom: 2 },
  restaurantMeta: { fontSize: 14, fontWeight: "600" },
  card: { padding: 16, borderRadius: 12, marginBottom: 12, shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.15, shadowRadius: 6, elevation: 5 },
  name: { fontSize: 18, fontWeight: "700", marginBottom: 6 },
  description: { fontSize: 14, marginBottom: 4 },
  price: { fontSize: 16, fontWeight: "600" },
  addBtn: { marginTop: 8, padding: 12, borderRadius: 8, alignItems: "center" },
  addText: { color: "#fff", fontWeight: "700" },
});
