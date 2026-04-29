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

// export interface UserData {
//   age: number;
//   height: number;
//   weight: number;
//   gender: Gender;
//   activity: ActivityLevel;
//   weightLossPlan: string;
//   mealsPerDay: number;
// }

// export interface RecommendationResult {
//   bmi: number;
//   bmiCategory: string;
//   bmiColor: string;
//   maintainCalories: number;
//   targetCalories: number;
//   mealPlans: { [key: string]: Recipe[] };
// }

// export interface HealthStatus {
//   status: string;
//   version?: string;
//   timestamp?: string;
// }

// export interface ModelInfoResponse {
//   models?: string[];
//   available_models?: string[];
//   available_metrics?: string[];
//   default_metric?: string;
//   model_details?: Record<string, { description: string; best_for: string }>;
// }

// export interface ModelPerformance {
//   model: string;
//   nutritional_mae: number;
//   diversity_score: number;
//   latency_ms: number;
//   coverage: number;
// }

// export interface FeedbackRequest {
//   user_id: string;
//   recipe_id: string;
//   rating: number;
//   was_helpful: boolean;
//   comments: string;
//   session_id: string;
// }

// export interface FeedbackResponse {
//   feedback_id: string;
//   status: string;
// }

// export interface ExplainResponse {
//   explanation: Record<string, number | string>;
//   model_used: string;
//   confidence_score: number;
// }

// export interface RecommendationStatsRequest {
//   session_id?: string;
//   recipe_id?: string;
//   model?: string;
//   goal?: GoalOption;
//   metric?: MetricOption;
//   rating?: number;
//   was_helpful?: boolean;
//   [key: string]: any;
// }

// export interface RecommendationStatsResponse {
//   total_recommendations: number;
//   average_rating: number;
//   helpful_rate: number;
//   top_models: string[];
//   recent_goals?: Record<string, number>;
//   [key: string]: any;
// }

// export interface FeatureImportanceRequest {
//   model?: string;
//   metric?: MetricOption;
// }

// export interface FeatureImportanceResponse {
//   features: Array<{ name: string; importance: number }>;
//   methodology: string;
// }

// export interface CachedRecommendation {
//   key: string;
//   request: PredictRequest;
//   recipes: Recipe[];
//   createdAt: string;
// }
