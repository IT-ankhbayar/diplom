import { create } from "zustand";
import type { StateCreator } from "zustand";

export type CartItem = {
  id: string;
  price: number;
  startDate: string;
  endDate: string;
  totalPrice: number;
  title?: string;
  image?: string;
};

export type CartStore = {
  items: CartItem[];
  addItem: (item: CartItem) => void;

  removeItem: (id: string) => void;

  removeByKey: (key: string) => void;

  clear: () => void;
  grandTotal: () => number;
};

const makeKey = (it: CartItem) => `${it.id}-${it.startDate}-${it.endDate}`;

const creator: StateCreator<CartStore> = (set, get) => ({
  items: [],

  addItem: (item) =>
    set((s) => ({
      items: [...s.items, item],
    })),

  removeItem: (id) =>
    set((s) => ({
      items: s.items.filter((it) => it.id !== id),
    })),

  removeByKey: (key) =>
    set((s) => ({
      items: s.items.filter((it) => makeKey(it) !== key),
    })),

  clear: () => set({ items: [] }),

  grandTotal: () => get().items.reduce((sum, it) => sum + (it.totalPrice || 0), 0),
});

const useCartStore = create<CartStore>()(creator);

export default useCartStore;
