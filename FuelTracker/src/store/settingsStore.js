import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export const UNIT = {
  DIST_KM: "km",
  DIST_MI: "mi",
  VOL_L: "L",
  VOL_GAL: "gal",
};
export const EFF = { L_PER_100KM: "l_per_100km", MPG: "mpg" };

export const useSettings = create(
  persist(
    (set, get) => ({
      displayName: "",
      currency: "INR", // user's preferred display currency
      distanceUnit: UNIT.DIST_KM,
      volumeUnit: UNIT.VOL_L,
      efficiencyUnit: EFF.L_PER_100KM,
      priceDecimals: 2,

      // NEW: FX table (base + rates). Optional but enables conversion.
      fx: { base: "INR", asOf: "static", rates: { INR: 1 } },

      setProfile: (p) => set(p),
      setUnits: (p) => set(p),

      // NEW
      setFx: (fx) => set({ fx }),
      setCurrency: (code) => set({ currency: code }),
    }),
    {
      name: "fueltracker-settings",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
