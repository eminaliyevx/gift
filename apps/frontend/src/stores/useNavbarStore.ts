import { create } from "zustand";

interface NavbarState {
  categories: string[];
  setCategories: (categories: string[]) => void;
}

const useNavbarStore = create<NavbarState>()((set) => ({
  categories: [],
  setCategories: (categories) => set({ categories }),
}));

export default useNavbarStore;
