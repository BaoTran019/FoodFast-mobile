import { MenuItem } from "@/types";
import { BASE_URL } from "./config";

// Lấy menu theo restaurantId
export async function fetchMenu(restaurantId: string): Promise<MenuItem[]> {
  try {
    const res = await fetch(`${BASE_URL}/menu/${restaurantId}`);
    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }
    const json = await res.json();

    // Chuyển dữ liệu từ API về kiểu MenuItem
    const items: MenuItem[] = (json.items || []).map((m: any) => ({
      id: m.id,
      name: m.name,
      price: m.price,
      description: m.description,
    }));

    return items;
  } catch (error) {
    console.error("fetchMenu error:", error);
    return [];
  }
}
