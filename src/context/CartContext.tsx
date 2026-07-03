import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from 'react';
import type { ReactNode } from 'react';
import type { CartItem, Size } from '../types';
import { getStorageItem, setStorageItem } from '../utils/storage';

// ─── Types ───
interface CartContextValue {
  items: CartItem[];
  isDrawerOpen: boolean;
  cartCount: number;
  subtotal: number;
  openDrawer: () => void;
  closeDrawer: () => void;
  toggleDrawer: () => void;
  addItem: (item: Omit<CartItem, 'quantity'>, quantity?: number) => void;
  removeItem: (productId: number, color: string, size: Size) => void;
  updateQuantity: (productId: number, color: string, size: Size, qty: number) => void;
}

const STORAGE_KEY = 'minishop_cart';

// ─── Context ───
const CartContext = createContext<CartContextValue | null>(null);

// ─── Provider ───
export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(() =>
    getStorageItem<CartItem[]>(STORAGE_KEY, []),
  );
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Persist to localStorage on every change
  useEffect(() => {
    setStorageItem(STORAGE_KEY, items);
  }, [items]);

  const openDrawer = useCallback(() => setIsDrawerOpen(true), []);
  const closeDrawer = useCallback(() => setIsDrawerOpen(false), []);
  const toggleDrawer = useCallback(() => setIsDrawerOpen((v) => !v), []);

  const addItem = useCallback(
    (incoming: Omit<CartItem, 'quantity'>, quantity = 1) => {
      setItems((prev) => {
        const idx = prev.findIndex(
          (i) =>
            i.productId === incoming.productId &&
            i.color === incoming.color &&
            i.size === incoming.size,
        );
        if (idx >= 0) {
          const copy = [...prev];
          copy[idx] = { ...copy[idx], quantity: copy[idx].quantity + quantity };
          return copy;
        }
        return [...prev, { ...incoming, quantity }];
      });
      setIsDrawerOpen(true);
    },
    [],
  );

  const removeItem = useCallback(
    (productId: number, color: string, size: Size) => {
      setItems((prev) =>
        prev.filter(
          (i) =>
            !(i.productId === productId && i.color === color && i.size === size),
        ),
      );
    },
    [],
  );

  const updateQuantity = useCallback(
    (productId: number, color: string, size: Size, qty: number) => {
      if (qty <= 0) {
        removeItem(productId, color, size);
        return;
      }
      setItems((prev) =>
        prev.map((i) =>
          i.productId === productId && i.color === color && i.size === size
            ? { ...i, quantity: qty }
            : i,
        ),
      );
    },
    [removeItem],
  );

  const cartCount = useMemo(
    () => items.reduce((sum, i) => sum + i.quantity, 0),
    [items],
  );

  const subtotal = useMemo(
    () => items.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0),
    [items],
  );

  const value = useMemo<CartContextValue>(
    () => ({
      items,
      isDrawerOpen,
      cartCount,
      subtotal,
      openDrawer,
      closeDrawer,
      toggleDrawer,
      addItem,
      removeItem,
      updateQuantity,
    }),
    [
      items, isDrawerOpen, cartCount, subtotal,
      openDrawer, closeDrawer, toggleDrawer,
      addItem, removeItem, updateQuantity,
    ],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

// ─── Hook ───
export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) {
    throw new Error('useCart must be used inside <CartProvider>');
  }
  return ctx;
}
