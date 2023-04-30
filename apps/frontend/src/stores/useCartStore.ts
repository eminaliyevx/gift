import { CartItem } from "local-types";
import { create } from "zustand";

interface CartState {
  items: CartItem[];
  setItems: (items: CartItem[]) => void;
}

const useCartStore = create<CartState>()((set) => ({
  items: [],
  setItems: (items) => set({ items }),
}));

export default useCartStore;
