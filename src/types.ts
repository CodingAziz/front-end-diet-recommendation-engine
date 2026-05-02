/* eslint-disable @typescript-eslint/no-explicit-any */
export interface PredictParams {
  n_neighbors: number;
  return_distance: boolean;
  metric?: MetricOption;
}

export interface PredictRequest {
  nutrition_input: number[];
  ingredients: string[];
  bmi?: number;
  goal?: GoalOption;
  metric?: MetricOption;
  params?: PredictParams;
}

export interface PredictResponse {
  output?: Recipe[] | null;
  metadata?: object
}

export interface NutritionValues {
  Calories: string;
  FatContent: string;
  SaturatedFatContent: string;
  CholesterolContent: string;
  SodiumContent: string;
  CarbohydrateContent: string;
  FiberContent: string;
  SugarContent: string;
  ProteinContent: string;
}

export interface Recipe {
  Name: string;
  image_link: string;
  CookTime: string;
  PrepTime: string;
  TotalTime: string;
  RecipeIngredientParts: string;
  RecipeInstructions: string;
  Calories: number;
  FatContent: number;
  SaturatedFatContent: number;
  CholesterolContent: number;
  SodiumContent: number;
  CarbohydrateContent: number;
  FiberContent: number;
  SugarContent: number;
  ProteinContent: number;
  model_used?: string;
  explanation?: Record<string, number | string>;
}

export interface RecipeCardProps {
  recipe: Recipe;
  onView?: (recipe: Recipe) => void;
}

export enum Gender {
  Male = "Male",
  Female = "Female",
}

export enum ActivityLevel {
  Sedentary = "Little/no exercise",
  Light = "Light exercise",
  Moderate = "Moderate exercise (3-5 days/wk)",
  Active = "Very active (6-7 days/wk)",
  ExtraActive = "Extra active (very active & physical job)",
}

export enum GoalOption {
  WeightLoss = "weight_loss",
  MuscleGain = "muscle_gain",
  Maintenance = "maintenance",
}

export enum MetricOption {
  NutritionalMae = "nutritional_mae",
  DiversityScore = "diversity_score",
}

export const NUTRITION_LABELS: Record<string, string> = {
  Calories: "Calories",
  FatContent: "Fat",
  SaturatedFatContent: "Saturated fat",
  CholesterolContent: "Cholesterol",
  SodiumContent: "Sodium",
  CarbohydrateContent: "Carbs",
  FiberContent: "Fiber",
  SugarContent: "Sugar",
  ProteinContent: "Protein",
};

export const initialNutrition: NutritionValues = {
  Calories: "",
  FatContent: "",
  SaturatedFatContent: "",
  CholesterolContent: "",
  SodiumContent: "",
  CarbohydrateContent: "",
  FiberContent: "",
  SugarContent: "",
  ProteinContent: "",
};