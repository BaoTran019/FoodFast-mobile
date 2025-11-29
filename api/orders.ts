import { BASE_URL } from "./config";

export interface Order {
  userId: string;
  restaurantId: string;
  restaurantName: string;
  items: {
    productId: string;
    name: string;
    price?: number;
    quantity: number;
  }[];
  totalPrice: number;
  status: string;
  recipientName: string;
  phone: string;
  address: string;
  createdAt?: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  error?: string;
  [key: string]: any;
}

// Tạo đơn hàng
export const createOrder = async (order: Order): Promise<ApiResponse> => {
  try {
    const res = await fetch(`${BASE_URL}/orders`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(order),
    });
    return res.json();
  } catch (err: any) {
    console.error("createOrder error:", err);
    return { success: false, error: err.message || "Network error" };
  }
};

// Lấy đơn hàng của user
export const fetchOrdersByUser = async (uid: string): Promise<ApiResponse> => {
  try {
    const res = await fetch(`${BASE_URL}/orders/user/${uid}`);
    return res.json();
  } catch (err: any) {
    console.error("fetchOrdersByUser error:", err);
    return { success: false, error: err.message || "Network error" };
  }
};

// Cập nhật trạng thái đơn hàng
export const updateOrderStatus = async (
  orderId: string,
  status: string
): Promise<ApiResponse> => {
  try {
    const res = await fetch(`${BASE_URL}/orders/${orderId}/status`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    return res.json();
  } catch (err: any) {
    console.error("updateOrderStatus error:", err);
    return { success: false, error: err.message || "Network error" };
  }
};
