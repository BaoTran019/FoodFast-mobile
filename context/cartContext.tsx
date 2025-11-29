import { addToCart, CartItem, clearCart, getCart, removeCartItem, updateQty } from "@/api/cart";
import { getUser } from "@/storage/user-storage";
import React, { createContext, useContext, useEffect, useState } from "react";

interface CartContextType {
  cartItems: CartItem[];
  totalQty: number;
  refreshCart: () => Promise<void>;
  addItem: (product: any, restaurantId: string, restaurantName: string) => Promise<void>;
  updateItemQty: (productId: string, delta: number) => Promise<void>;
  removeItem: (productId: string) => Promise<void>;
  clearAll: () => Promise<void>;
}

const CartContext = createContext<CartContextType | null>(null);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [totalQty, setTotalQty] = useState(0);

  const refreshCart = async () => {
    const stored = await getUser();
    if (!stored) {
      setCartItems([]);
      setTotalQty(0);
      return;
    }
    const res = await getCart(stored.user.uid);
    if (res.success && res.items) {
      setCartItems(res.items);
      setTotalQty(res.items.reduce((sum, item) => sum + (item.quantity || 0), 0));
    } else {
      setCartItems([]);
      setTotalQty(0);
    }
  };

  const addItem = async (product: any, restaurantId: string, restaurantName: string) => {
    const stored = await getUser();
    if (!stored) return;

    // Cập nhật state nhanh
    setCartItems((prev) => {
      const exist = prev.find((i) => i.id === product.id);
      if (exist) {
        setTotalQty((t) => t + 1);
        return prev.map((i) =>
          i.id === product.id ? { ...i, quantity: (i.quantity || 0) + 1 } : i
        );
      } else {
        setTotalQty((t) => t + 1);
        return [...prev, { ...product, quantity: 1, restaurantId, restaurantName }];
      }
    });

    // Gửi request lên server
    try {
      const res = await addToCart(stored.user.uid, product, restaurantId, restaurantName);
      if (!res.success) await refreshCart(); // rollback nếu server fail
    } catch {
      await refreshCart();
    }
  };



  const updateItemQty = async (productId: string, delta: number) => {
    const stored = await getUser();
    if (!stored) return;

    // **Optimistic update**
    setCartItems((prev) => {
      return prev
        .map((i) =>
          i.id === productId ? { ...i, quantity: (i.quantity || 0) + delta } : i
        )
        .filter((i) => i.quantity > 0); // loại bỏ nếu <=0
    });
    setTotalQty((prev) => prev + delta);

    try {
      const res = await updateQty(stored.user.uid, productId, delta);
      if (!res.success) await refreshCart(); // rollback
    } catch {
      await refreshCart();
    }
  };

  const removeItem = async (productId: string) => {
    const stored = await getUser();
    if (!stored) return;

    // **Optimistic update**
    setCartItems((prev) => prev.filter((i) => i.id !== productId));
    setTotalQty((prev) =>
      cartItems.find((i) => i.id === productId)?.quantity
        ? prev - cartItems.find((i) => i.id === productId)!.quantity
        : prev
    );

    try {
      const res = await removeCartItem(stored.user.uid, productId);
      if (!res.success) await refreshCart();
    } catch {
      await refreshCart();
    }
  };

  const clearAll = async () => {
    const stored = await getUser();
    if (!stored) return;

    // **Optimistic update**
    setCartItems([]);
    setTotalQty(0);

    try {
      const res = await clearCart(stored.user.uid);
      if (!res.success) await refreshCart();
    } catch {
      await refreshCart();
    }
  };


  // **Không fetch cart ngay khi mount** nếu user chưa login
  useEffect(() => {
    const init = async () => {
      const stored = await getUser();
      if (stored) await refreshCart();
    };
    init();
  }, []);

  return (
    <CartContext.Provider value={{ cartItems, totalQty, refreshCart, addItem, updateItemQty, removeItem, clearAll }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used within CartProvider");
  return context;
};
