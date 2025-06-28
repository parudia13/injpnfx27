import { useState, useEffect, useCallback } from 'react';
import { CartItem, Product } from '@/types';
import { 
  getCartFromStorage, 
  addToCart as addToCartUtil, 
  removeFromCart as removeFromCartUtil,
  updateCartItemQuantity as updateCartItemQuantityUtil,
  clearCart as clearCartUtil,
  getCartTotal 
} from '@/utils/cart';

export const useCart = () => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Load cart from storage only once on mount
  useEffect(() => {
    setCart(getCartFromStorage());
    setLoading(false);
  }, []);

  const addToCart = useCallback((product: Product, quantity: number = 1) => {
    const updatedCart = addToCartUtil(product, quantity);
    setCart(updatedCart);
  }, []);

  const removeFromCart = useCallback((itemId: string) => {
    const updatedCart = removeFromCartUtil(itemId);
    setCart(updatedCart);
  }, []);

  const updateQuantity = useCallback((itemId: string, quantity: number) => {
    const updatedCart = updateCartItemQuantityUtil(itemId, quantity);
    setCart(updatedCart);
  }, []);

  const clearCart = useCallback(() => {
    clearCartUtil();
    setCart([]);
  }, []);

  const total = getCartTotal(cart);
  const itemCount = cart.reduce((count, item) => count + item.quantity, 0);

  return {
    cart,
    loading,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    total,
    itemCount,
    // For backward compatibility
    items: cart,
    getTotalPrice: () => total
  };
};