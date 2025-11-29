import { BASE_URL } from "./config";

export interface CartItem {
  id: string;
  productId: string;
  restaurantId: string;
  restaurantName: string;
  name: string;
  price: number;
  image?: string;
  quantity: number;
}

interface CartResponse {
  success: boolean;
  items?: CartItem[];
  error?: string;
}

/**
 * Lấy giỏ hàng theo UID
 */
export async function getCart(uid: string): Promise<CartResponse> {
  try {
    const res = await fetch(`${BASE_URL}/cart/${uid}`);
    return await res.json();
  } catch (err) {
    console.error("getCart error:", err);
    return { success: false, error: "Network error" };
  }
}

/**
 * Thêm sản phẩm vào giỏ
 */
export async function addToCart(
  uid: string,
  product: any,
  restaurantId: string,
  restaurantName: string
) {
  try {
    const res = await fetch(`${BASE_URL}/cart/add`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ uid, product, restaurantId, restaurantName }),
    });

    return await res.json();
  } catch (err) {
    console.error("addToCart error:", err);
    return { success: false, error: "Network error" };
  }
}

/**
 * Cập nhật số lượng (delta = +1 hoặc -1)
 */
export async function updateQty(
  uid: string,
  productId: string,
  delta: number
) {
  try {
    const res = await fetch(`${BASE_URL}/cart/update`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ uid, productId, delta }),
    });

    return await res.json();
  } catch (err) {
    console.error("updateQty error:", err);
    return { success: false, error: "Network error" };
  }
}

/**
 * Xóa 1 item khỏi giỏ
 */
export async function removeCartItem(uid: string, productId: string) {
  try {
    const res = await fetch(`${BASE_URL}/cart/item`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ uid, productId }),
    });

    return await res.json();
  } catch (err) {
    console.error("removeCartItem error:", err);
    return { success: false, error: "Network error" };
  }
}

/**
 * Xóa toàn bộ giỏ hàng
 */
export async function clearCart(uid: string) {
  try {
    const res = await fetch(`${BASE_URL}/cart/clear/${uid}`, {
      method: "DELETE",
    });

    return await res.json();
  } catch (err) {
    console.error("clearCart error:", err);
    return { success: false, error: "Network error" };
  }
}
