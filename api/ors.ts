// api/ors.ts
import { BASE_URL } from "./config";

export interface GeocodeResponse {
  success: boolean;
  text?: string;
  lat?: number;
  lng?: number;
  error?: string;
}

/**
 * Gửi địa chỉ lên backend → backend gọi ORS → trả về lat, lng
 */
export async function getCoordinatesFromText(text: string): Promise<GeocodeResponse> {
  try {
    const res = await fetch(`${BASE_URL}/ors/geocode`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ text }),
    });

    const json = await res.json();
    return json;
  } catch (err: any) {
    console.error("getCoordinatesFromText error:", err);

    return {
      success: false,
      error: err.message || "Network error",
    };
  }
}
