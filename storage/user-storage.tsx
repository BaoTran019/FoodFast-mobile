import AsyncStorage from "@react-native-async-storage/async-storage";
import { User } from "../api/auth-api";

export const saveUser = async (user: User, token: string) => {
  try {
    await AsyncStorage.setItem("user", JSON.stringify(user));
    await AsyncStorage.setItem("idToken", token);
  } catch (err) {
    console.error("Error saving user", err);
  }
};

export const getUser = async (): Promise<{ user: User; token: string } | null> => {
  try {
    const userJson = await AsyncStorage.getItem("user");
    const token = await AsyncStorage.getItem("idToken");
    if (!userJson || !token) return null;
    return { user: JSON.parse(userJson), token };
  } catch (err) {
    console.error("Error getting user", err);
    return null;
  }
};

export const removeUser = async () => {
  await AsyncStorage.removeItem("user");
  await AsyncStorage.removeItem("idToken");
};
