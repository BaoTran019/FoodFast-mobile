import { BASE_URL } from "./config";

export interface Drone {
  id?: string;
  orderId?: string;
  lat?: number;
  lng?: number;
  status?: "idle" | "delivering" | string;
  [key: string]: any;
}

export interface ApiResponse<T = any> {
  success: boolean;
  drones?: T;
  message?: string;
  error?: string;
  [key: string]: any;
}

// ----------------------
// Lấy drone theo orderId
// GET /drones/order/:orderId
// ----------------------
export const fetchDroneByOrderId = async (orderId: string): Promise<ApiResponse<Drone[]>> => {
  try {
    const res = await fetch(`${BASE_URL}/drones/order/${orderId}`);
    const json = await res.json();
    return {
      success: json.success,
      drones: json.drones || [],
      error: json.error,
    };
  } catch (err: any) {
    console.error("fetchDroneByOrderId error:", err);
    return { success: false, drones: [], error: err.message || "Network error" };
  }
};

// ----------------------
// Hoàn thành chuyến bay của drone
// POST /drones/:droneId/complete
// ----------------------
export const completeDroneFlight = async (droneId: string): Promise<ApiResponse> => {
  try {
    const res = await fetch(`${BASE_URL}/drones/${droneId}/complete`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    });
    return res.json();
  } catch (err: any) {
    console.error("completeDroneFlight error:", err);
    return { success: false, error: err.message || "Network error" };
  }
};
