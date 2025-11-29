import { CartProvider } from '@/context/cartContext';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import * as ScreenOrientation from "expo-screen-orientation";
import { StatusBar } from 'expo-status-bar';
import { useEffect } from "react";
import { View } from 'react-native';
import 'react-native-reanimated';
import { useSafeAreaInsets } from "react-native-safe-area-context";


export default function RootLayout() {

  const insets = useSafeAreaInsets();

  useEffect(() => {
    // Cho phép xoay ngang và dọc
    ScreenOrientation.unlockAsync();
  }, []);

  const colorScheme = useColorScheme();

  return (
    <CartProvider>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <View
          style={{
            flex: 1,
            paddingTop: insets.top,
            paddingBottom: insets.bottom,
            paddingLeft: insets.left,
            paddingRight: insets.right,
            backgroundColor: colorScheme === "dark" ? "#111" : "#fff",
          }}
        >
        <Stack>

          <Stack.Screen name="auth" options={{ headerShown: false }} />

          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />

          <Stack.Screen
            name="menu/[restaurantId]"
            options={{
              headerShown: false,
            }}
          />

          <Stack.Screen name="placeOrder" options={{ headerShown: false }} />

          <Stack.Screen name="profile/changeInfo" options={{ headerShown: false }} />
          <Stack.Screen name="profile/changePassword" options={{ headerShown: false }} />

        </Stack>
      </View>
      <StatusBar style="auto" />
    </ThemeProvider>
    </CartProvider >
  );
}
