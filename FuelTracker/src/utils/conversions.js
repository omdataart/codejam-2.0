export const KM_PER_MILE = 1.60934;
export const L_PER_GAL = 3.78541;

// distance
export const kmToMi = (km) => km / KM_PER_MILE;
export const miToKm = (mi) => mi * KM_PER_MILE;

// volume
export const lToGal = (l) => l / L_PER_GAL;
export const galToL = (g) => g * L_PER_GAL;

// efficiency conversions
// canonical is L/100km
export const lPer100kmToMpg = (l100) => {
  if (!(l100 > 0)) return null;
  // 235.214583 is exact conversion between L/100km and MPG (US)
  return 235.214583 / l100;
};
export const mpgToLPer100km = (mpg) => {
  if (!(mpg > 0)) return null;
  return 235.214583 / mpg;
};

// labels
export const distanceLabel = (unit) => (unit === "mi" ? "mi" : "km");
export const volumeLabel = (unit) => (unit === "gal" ? "gal" : "L");
export const effLabel = (effUnit) => (effUnit === "mpg" ? "MPG" : "L/100km");
