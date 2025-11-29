import { useColorScheme } from "@/hooks/use-color-scheme";
import { LinearGradient } from "expo-linear-gradient";
import { ReactNode } from "react";

type Props = {
  children: ReactNode;
};

export function LinearBackground({ children }: Props) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  return (
    <LinearGradient
      colors={
        isDark
          ? ['#1E1E2F', '#2C2C3D']   // dark: vừa phải, dịu mắt
          : ['#FFF7F0', '#FFE5D9']   // light: pastel, hiện đại
      }
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
      style={{ flex: 1 }}
    >
      {children}
    </LinearGradient>
  );
}
