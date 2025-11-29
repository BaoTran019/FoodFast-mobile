import { fetchRestaurants } from "@/api/restaurants";
import FloatingCartButton from "@/components/FloatingCartButton";
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Restaurant } from "@/types";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, FlatList, Image, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";

export default function RestaurantsPage() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [filtered, setFiltered] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const router = useRouter(); // <- thêm đây


  useEffect(() => {
    fetchRestaurants()
      .then(data => {
        setRestaurants(data);
        setFiltered(data);
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  // Lọc theo tìm kiếm
  const handleSearch = (text: string) => {
    setSearch(text);
    const filteredData = restaurants.filter(r =>
      r.name.toLowerCase().includes(text.toLowerCase())
    );
    setFiltered(filteredData);
  };

  if (loading)
    return <ActivityIndicator style={{ flex: 1 }} size="large" color={isDark ? "#fff" : "#FF6347"} />;

  return (
    <View style={[styles.container, { backgroundColor: isDark ? "#111" : "#F8F8F8" }]}>
      <FloatingCartButton />
      {/* Phần đầu: logo + background gợn sóng */}
      <View style={[styles.headerContainer, { backgroundColor: isDark ? '#FF8C42' : '#FFB86C' }]}>
        <Image
          source={require('@/assets/logo.png')} // Thay bằng logo app của bạn
          style={styles.logo}
          resizeMode="contain"
        />
        <TextInput
          style={[styles.searchInput, { backgroundColor: isDark ? '#FFF' : '#FFF' }]}
          placeholder="Tìm cửa hàng..."
          placeholderTextColor="#999"
          value={search}
          onChangeText={handleSearch}
        />
      </View>

      {/* Danh sách nhà hàng */}
      <FlatList
        data={filtered}
        keyExtractor={item => item.id}
        contentContainerStyle={{ padding: 15, paddingTop: 0 }}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[
              styles.card,
              { backgroundColor: isDark ? '#2C2C2E' : '#FFF', shadowColor: isDark ? '#000' : '#AAA' }
            ]}
            onPress={() =>
              router.push({
                pathname: "/menu/[restaurantId]",
                params: { restaurantId: item.id },
              })
            }
          >
            <Text style={[styles.name, { color: isDark ? '#FFF' : '#222' }]}>{item.name}</Text>
            <Text style={[styles.info, { color: isDark ? '#CCC' : '#555' }]}>
              ⭐ {item.rating.toFixed(1)} | {item.active ? 'Open' : 'Closed'}
            </Text>
            {item.address && (
              <Text style={[styles.info, { color: isDark ? '#AAA' : '#777' }]} numberOfLines={1}>
                {item.address}
              </Text>
            )}
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },

  headerContainer: {
    paddingTop: 10,
    paddingBottom: 20,
    paddingHorizontal: 15,
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
    marginBottom: 20
  },
  logo: {
    width: 220,
    height: 80,
    alignSelf: 'center',
    marginBottom: 5,
  },
  searchInput: {
    height: 45,
    borderRadius: 12,
    paddingHorizontal: 15,
    fontSize: 16,
    color: '#000',
  },

  card: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 5,
  },
  name: { fontSize: 18, fontWeight: "700", marginBottom: 6 },
  info: { fontSize: 14 },
});
