import { User } from "@/types";
import { create } from "zustand";

interface UserStoreType {
  user: User | null;
  setUser: (user: User) => void;
  clearUser: () => void;
}

export const userStore = create<UserStoreType>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
  clearUser: () => set({ user: null }),
}));
