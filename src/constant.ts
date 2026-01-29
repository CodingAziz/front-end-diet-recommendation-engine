import { ActivityLevel } from "./types";

export const WEIGHT_LOSS_PLANS = [
  { name: "Maintain weight", multiplier: 1, loss: "0 kg/week" },
  { name: "Mild weight loss", multiplier: 0.9, loss: "0.25 kg/week" },
  { name: "Weight loss", multiplier: 0.8, loss: "0.5 kg/week" },
  { name: "Extreme weight loss", multiplier: 0.6, loss: "1 kg/week" },
];

export const ACTIVITY_MULTIPLIERS: Record<ActivityLevel, number> = {
  [ActivityLevel.Sedentary]: 1.2,
  [ActivityLevel.Light]: 1.375,
  [ActivityLevel.Moderate]: 1.55,
  [ActivityLevel.Active]: 1.725,
  [ActivityLevel.ExtraActive]: 1.9,
};

export const NUTRITION_KEYS = [
  "Calories",
  "FatContent",
  "SaturatedFatContent",
  "CholesterolContent",
  "SodiumContent",
  "CarbohydrateContent",
  "FiberContent",
  "SugarContent",
  "ProteinContent",
];
