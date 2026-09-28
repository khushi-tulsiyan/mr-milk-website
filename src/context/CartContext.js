import React, { createContext, useContext, useEffect, useMemo, useReducer, useState } from 'react';
import { cartReducer, cartSummary } from '../utils/cart';

const STORAGE_KEY = 'jfam-ghee-cart';
const CartContext = createContext(null);

function loadCart() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    return Array.isArray(saved) ? saved : [];
  } catch {
    return [];
  }
}

export function CartProvider({ children }) {
  const [items, dispatch] = useReducer(cartReducer, undefined, loadCart);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      // Storage unavailable (private mode); the cart still works for this visit.
    }
  }, [items]);

  const value = useMemo(() => ({
    items,
    summary: cartSummary(items),
    isOpen,
    openCart: () => setIsOpen(true),
    closeCart: () => setIsOpen(false),
    addItem: (productId, variantId) => {
      dispatch({ type: 'add', productId, variantId });
      setIsOpen(true);
    },
    setQuantity: (productId, variantId, quantity) =>
      dispatch({ type: 'setQuantity', productId, variantId, quantity }),
    removeItem: (productId, variantId) => dispatch({ type: 'remove', productId, variantId }),
    clearCart: () => dispatch({ type: 'clear' }),
  }), [items, isOpen]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used inside CartProvider');
  return ctx;
}
