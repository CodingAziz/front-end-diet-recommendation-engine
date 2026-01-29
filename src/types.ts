export interface NutritionValues {
  Calories: number;
  FatContent: number;
  SaturatedFatContent: number;
  CholesterolContent: number;
  SodiumContent: number;
  CarbohydrateContent: number;
  FiberContent: number;
  SugarContent: number;
  ProteinContent: number;
}

export interface Recipe {
  Name: string;
  image_link: string;
  CookTime: string;
  PrepTime: string;
  TotalTime: string;
  RecipeIngredientParts: string[];
  RecipeInstructions: string[];
  Calories: number;
  FatContent: number;
  SaturatedFatContent: number;
  CholesterolContent: number;
  SodiumContent: number;
  CarbohydrateContent: number;
  FiberContent: number;
  SugarContent: number;
  ProteinContent: number;
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

export interface UserData {
  age: number;
  height: number;
  weight: number;
  gender: Gender;
  activity: ActivityLevel;
  weightLossPlan: string;
  mealsPerDay: number;
}

export interface RecommendationResult {
  bmi: number;
  bmiCategory: string;
  bmiColor: string;
  maintainCalories: number;
  targetCalories: number;
  mealPlans: { [key: string]: Recipe[] };
}
