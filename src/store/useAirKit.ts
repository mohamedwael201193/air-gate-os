import { airLogin, getAirService } from "@/air/airkit";
import { create } from "zustand";

interface AirKitUser {
  did?: string;
  email?: string;
  abstractAccountAddress?: string;
  isMFASetup?: boolean;
  [key: string]: any;
}

interface AirKitStore {
  user: AirKitUser | null;
  isLoading: boolean;
  error: string | null;

  login: () => Promise<any>;
  logout: () => void;
  setUser: (user: AirKitUser | null) => void;
  setError: (error: string | null) => void;
  getService: () => Promise<any>;
}

export const useAirKit = create<AirKitStore>((set, get) => ({
  user: null,
  isLoading: false,
  error: null,

  getService: async () => {
    return await getAirService();
  },

  login: async () => {
    try {
      set({ isLoading: true, error: null });

      const result = await airLogin();
      set({ user: result, isLoading: false });

      console.log("✅ Login successful with user:", result);
      console.log("📧 User email:", result?.email || "No email found");
      return result;
    } catch (error: any) {
      console.error("❌ Login failed:", error);
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  logout: () => {
    set({ user: null, error: null });
    localStorage.removeItem("airUser");
    console.log("✅ Logged out successfully");
  },

  setUser: (user) => set({ user }),
  setError: (error) => set({ error }),
}));
