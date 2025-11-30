import { BASE_URL } from "./config";

export interface OrderItem {
  productId?: string;
  id?: string; // một số item backend trả id thay vì productId
  name: string;
  price?: number;
  quantity: number;
  image?: string;
}

export interface Order {
  id?: string;
  userId: string;
  restaurantId: string;
  restaurantName: string;
  items: OrderItem[];
  totalPrice: number;
  status: "pending" | "processing" | "delivering" | "completed";
  recipientName: string;
  recipientPhone: string;       // sửa lại cho đúng backend
  shipping_address: string;     // sửa lại cho đúng backend
  createdAt?: any;
}

export interface ApiResponse<T = any> {
  success: boolean;
  orders?: T;
  error?: string;
  [key: string]: any;
}

// ----------------------
// ⚠️ GIỮ NGUYÊN createOrder
// ----------------------
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

// ----------------------
// ✅ Lấy đơn hàng theo user (đã sửa chính xác)
// ----------------------
export const fetchOrdersByUser = async (uid: string): Promise<ApiResponse<Order[]>> => {
  try {
    const res = await fetch(`${BASE_URL}/orders/user/${uid}`);
    const json = await res.json();

    return {
      success: json.success,
      orders: json.orders || [],
    };
  } catch (err: any) {
    console.error("fetchOrdersByUser error:", err);
    return { success: false, error: err.message || "Network error", orders: [] };
  }
};

// ----------------------
// ✅ Cập nhật trạng thái đơn hàng (giữ nguyên logic backend)
// ----------------------
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

// ----------------------
// ✅ Xóa đơn
// ----------------------
export const deleteOrder = async (orderId: string): Promise<ApiResponse> => {
  try {
    const res = await fetch(`${BASE_URL}/orders/${orderId}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
    });
    return res.json();
  } catch (err: any) {
    console.error("deleteOrder error:", err);
    return { success: false, error: err.message || "Network error" };
  }
};

