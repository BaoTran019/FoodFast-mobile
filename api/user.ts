import { BASE_URL } from "./config";

// api/user.ts
export interface UserInfo {
  name?: string;
  phone?: string;
  address?: string;
}

export interface ApiResponse {
  success: boolean;
  message?: string;
  error?: string;
  data?: any;
}

// Lấy thông tin user (có thể dùng để get thông tin user hiện tại)
export async function getUserInfo(uid: string): Promise<ApiResponse> {
  try {
    const res = await fetch(`${BASE_URL}/user/${uid}`);
    const data: ApiResponse = await res.json();
    return data;
  } catch (err) {
    console.error("getUserInfo error:", err);
    return { success: false, error: "Network error" };
  }
}

// Thay đổi thông tin user (name, phone, address,...)
export async function changeUserInfo(
  uid: string,
  info: UserInfo
): Promise<ApiResponse> {
  try {
    const res = await fetch(`${BASE_URL}/user/${uid}/changeinfo`, {
      method: "PUT", // backend có thể dùng PATCH hoặc PUT
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(info),
    });
    const data: ApiResponse = await res.json();
    return data;
  } catch (err) {
    console.error("changeUserInfo error:", err);
    return { success: false, error: "Network error" };
  }
}

// Đổi mật khẩu
export async function changeUserPassword(
  uid: string,
  newPassword: string
): Promise<ApiResponse> {
  try {
    const res = await fetch(`${BASE_URL}/user/${uid}/changepassword`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ newPassword }),
    });
    const data: ApiResponse = await res.json();
    return data;
  } catch (err) {
    console.error("changeUserPassword error:", err);
    return { success: false, error: "Network error" };
  }
}
