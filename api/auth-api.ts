import { BASE_URL } from "./config";

// Kiểu dữ liệu User trả về
export interface User {
  uid: string;
  email: string;
  name?: string;
  phone?: string;
  address?: string;
}

// Kiểu dữ liệu response chung
interface ApiResponse<T> {
  success: boolean;
  user?: T;
  idToken?: string;
  error?: string;
}

/**
 * Login user
 * @param email 
 * @param password 
 * @returns User + idToken
 */
export async function login(email: string, password: string): Promise<ApiResponse<User>> {
  try {
    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    const json: ApiResponse<User> = await res.json();
    return json;

  } catch (error) {
    console.error("Login API error:", error);
    return { success: false, error: "Network error" };
  }
}

/**
 * Register user
 * @param name 
 * @param email 
 * @param password 
 * @param phone
 * @param address
 * @returns User + idToken
 */
export async function register(
  name: string,
  email: string,
  password: string,
  phone: string,
  address: string
): Promise<ApiResponse<User>> {
  try {
    const res = await fetch(`${BASE_URL}/auth/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name, email, password, phone, address }),
    });

    const json: ApiResponse<User> = await res.json();
    return json;

  } catch (error) {
    console.error("Register API error:", error);
    return { success: false, error: "Network error" };
  }
}
