import { Stack } from "expo-router";
import { CartProvider } from "@/context/CartContext";
import { AuthProvider } from "@/context/AuthContext";
import { WishlistProvider } from "@/context/WishlistContext";

export default function RootLayout() {
  return (
    <AuthProvider>
      <WishlistProvider>
        <CartProvider>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="product/[id]" />
            <Stack.Screen name="(auth)/login" />
            <Stack.Screen name="(auth)/register" />
            <Stack.Screen name="(auth)/verify-email" />
            <Stack.Screen name="(auth)/forgot-password" />
            <Stack.Screen name="(auth)/reset-password" />
            <Stack.Screen
              name="orders"
              options={{ headerShown: true, title: "My Orders" }}
            />
          </Stack>
        </CartProvider>
      </WishlistProvider>
    </AuthProvider>
  );
}
