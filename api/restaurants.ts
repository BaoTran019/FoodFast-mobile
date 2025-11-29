import { Restaurant } from "@/types";
import { BASE_URL } from "./config";

export async function fetchRestaurants(): Promise<Restaurant[]> {
  const res = await fetch(`${BASE_URL}/restaurants`);
  const json = await res.json();

  return json.data.map((r: any) => ({
    id: r.id,
    name: r.name,
    rating: Number(r.rating),
    active: r.active,
    address: r.address,
  }));
}

export async function fetchRestaurantById(id: string): Promise<Restaurant | null> {
  try {
    const res = await fetch(`${BASE_URL}/restaurants/${id}`);
    const json = await res.json();

    if (!json.success) return null;

    const r = json.data;
    return {
      id: r.id,
      name: r.name,
      rating: Number(r.rating),
      active: r.active,
      address: r.address,
    };
  } catch (error) {
    console.error("Error fetching restaurant by ID:", error);
    return null;
  }
}

