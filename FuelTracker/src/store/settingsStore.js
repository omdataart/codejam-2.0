import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export const UNIT = {
  DIST_KM: "km",
  DIST_MI: "mi",
  VOL_L: "L",
  VOL_GAL: "gal",
};

export const EFF = {
  L_PER_100KM: "l_per_100km",
  MPG: "mpg",
};

export const useSettings = create(
  persist(
    (set) => ({
      displayName: "",
      currency: "INR",
      distanceUnit: UNIT.DIST_KM, // "km" | "mi"
      volumeUnit: UNIT.VOL_L, // "L"  | "gal"
      efficiencyUnit: EFF.L_PER_100KM, // "l_per_100km" | "mpg"
      priceDecimals: 2, // 2–3 (doc default 2)

      setProfile: (p) => set(p),
      setUnits: (p) => set(p),
    }),
    {
      name: "fueltracker-settings",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
