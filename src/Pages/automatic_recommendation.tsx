import React, { useEffect, useMemo, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie,
  Legend,
} from "recharts";

import {
  Gender,
  ActivityLevel,
  RecommendationResult,
  Recipe,
  GoalOption,
  MetricOption,
} from "../types";

import { WEIGHT_LOSS_PLANS, ACTIVITY_MULTIPLIERS } from "../constant";
import RecipeCard from "../components/recipe_card";
import FeedbackComponent from "../components/feedback_component";
import ExplainabilityPanel from "../components/explainability_panel";
import { predictDiet, submitRecommendationStats } from "../api/predict";
import attachImageLink from "../utils/imageLink";
import {
  getCachedRecommendation,
  getRecentRecommendations,
  makeCacheKey,
  setCachedRecommendation,
  getSessionId,
} from "../utils/session";

const AutomaticRecommendation: React.FC = () => {
  const [formData, setFormData] = useState({
    age: 28,
    height: 175,
    weight: 72,
    gender: Gender.Male,
    activity: ActivityLevel.Moderate,
    weightLossPlan: WEIGHT_LOSS_PLANS[0].name,
    mealsPerDay: 3,
    goal: GoalOption.Maintenance,
    metric: MetricOption.NutritionalMae,
  });
  const [ingredients, setIngredients] = useState<string[]>([]);
  const [ingredientInput, setIngredientInput] = useState("");
  const [nbRecommendations, setNbRecommendations] = useState(5);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<RecommendationResult | null>(null);
  const [selectedRecipes, setSelectedRecipes] = useState<Record<string, Recipe>>({});
  const [selectedMeal, setSelectedMeal] = useState<string>("");
  const [validationMessages, setValidationMessages] = useState<string[]>([]);
  const [errorMessage, setErrorMessage] = useState("");
  const [cacheStatus, setCacheStatus] = useState("");
  const [analyticsStatus, setAnalyticsStatus] = useState<string>("");
  const [analyticsError, setAnalyticsError] = useState<string>("");
  const [recentRecommendations, setRecentRecommendations] = useState<ReturnType<typeof getRecentRecommendations>>([]);
  const [sessionId] = useState(getSessionId());

  useEffect(() => {
    setRecentRecommendations(getRecentRecommendations());
  }, []);

  const bmi = useMemo(() => {
    return Number((formData.weight / (formData.height / 100) ** 2).toFixed(1));
  }, [formData.height, formData.weight]);

  const buildNutritionInput = (calories: number): number[] => [
    calories,
    25,
    3,
    30,
    300,
    60,
    8,
    8,
    30,
  ];

  const validateForm = () => {
    const errors: string[] = [];
    if (formData.age < 10 || formData.age > 100) {
      errors.push("Age must be between 10 and 100.");
    }
    if (formData.height < 120 || formData.height > 230) {
      errors.push("Height must be between 120cm and 230cm.");
    }
    if (formData.weight < 35 || formData.weight > 180) {
      errors.push("Weight must be between 35kg and 180kg.");
    }
    if (nbRecommendations < 1 || nbRecommendations > 100) {
      errors.push("Number of recommendations must be between 1 and 100.");
    }
    if (ingredients.length > 15) {
      errors.push("You can add up to 15 ingredient filters.");
    }
    return errors;
  };

  const handleAddIngredient = () => {
    const nextValue = ingredientInput.trim();
    if (!nextValue) {
      return;
    }
    if (ingredients.includes(nextValue)) {
      setIngredientInput("");
      return;
    }
    if (ingredients.length >= 15) {
      setErrorMessage("Maximum of 15 ingredients allowed.");
      return;
    }
    setIngredients((current) => [...current, nextValue]);
    setIngredientInput("");
    setErrorMessage("");
  };

  const handleRemoveIngredient = (ingredient: string) => {
    setIngredients((current) => current.filter((item) => item !== ingredient));
  };

  const calculateResults = async (event: React.FormEvent) => {
    event.preventDefault();
    setValidationMessages([]);
    setErrorMessage("");
    setCacheStatus("");

    const validation = validateForm();
    if (validation.length > 0) {
      setValidationMessages(validation);
      return;
    }

    setIsLoading(true);

    try {
      const bmr =
        10 * formData.weight +
        6.25 * formData.height -
        5 * formData.age +
        (formData.gender === Gender.Male ? 5 : -161);

      const maintainCalories = Math.round(
        bmr * ACTIVITY_MULTIPLIERS[formData.activity],
      );

      const plan = WEIGHT_LOSS_PLANS.find(
        (p) => p.name === formData.weightLossPlan,
      );

      const targetCalories = Math.round(
        maintainCalories * (plan?.multiplier || 1),
      );

      const splits =
        formData.mealsPerDay === 3
          ? { Breakfast: 0.33, Lunch: 0.34, Dinner: 0.33 }
          : formData.mealsPerDay === 4
          ? {
              Breakfast: 0.3,
              Lunch: 0.3,
              "Afternoon Snack": 0.15,
              Dinner: 0.25,
            }
          : {
              Breakfast: 0.3,
              "Morning Snack": 0.1,
              Lunch: 0.3,
              "Afternoon Snack": 0.1,
              Dinner: 0.2,
            };

      const mealPlans: Record<string, Recipe[]> = {};
      const defaults: Record<string, Recipe> = {};

      await Promise.all(
        Object.entries(splits).map(async ([meal, share]) => {
          const caloriesForMeal = Math.max(150, Math.round(targetCalories * share));
          const payload = {
            nutrition_input: buildNutritionInput(caloriesForMeal),
            bmi,
            goal: formData.goal,
            metric: formData.metric,
            ingredients,
          };

          const cacheKey = makeCacheKey(payload);
          const cached = getCachedRecommendation(cacheKey);
          let recipes: Recipe[];

          if (cached) {
            recipes = cached.map(attachImageLink);
            setCacheStatus("Loaded some recommendations from cache.");
          } else {
            const response = await predictDiet(payload);
            // Handle different response formats from backend
            const rawRecipes = response.output || response.recipes || [];
            recipes = Array.isArray(rawRecipes) ? rawRecipes.map(attachImageLink) : [];
            console.log("API Response:", response);
            console.log("Processed recipes:", recipes);
            if (recipes.length > 0) {
              setCachedRecommendation(cacheKey, payload, recipes);
            }
          }

          mealPlans[meal] = recipes;
          if (recipes.length > 0 && !defaults[meal]) {
            defaults[meal] = recipes[0];
          } else if (recipes.length === 0) {
            console.warn(`No recipes returned for ${meal}`);
          }
        }),
      );

      setSelectedRecipes(defaults);
      setSelectedMeal(Object.keys(splits)[0] || "");

      // Check if we got any recipes at all
      const totalRecipes = Object.values(mealPlans).reduce((sum, recipes) => sum + recipes.length, 0);
      if (totalRecipes === 0) {
        throw new Error("No recipes were generated. Please check your input parameters or try again.");
      }

      setResult({
        bmi,
        bmiCategory: "",
        bmiColor: "",
        maintainCalories,
        targetCalories,
        mealPlans,
      });

      try {
        const statsResponse = await submitRecommendationStats({
          session_id: sessionId,
          goal: formData.goal,
          metric: formData.metric,
          total_recommendations: totalRecipes,
        });
        setAnalyticsStatus(`Recommendation analytics recorded: ${statsResponse.total_recommendations}`);
      } catch (analyticsError) {
        const analyticsMessage = analyticsError instanceof Error ? analyticsError.message : "Unable to record analytics.";
        setAnalyticsError(analyticsMessage);
      }

      setRecentRecommendations(getRecentRecommendations());
    } catch (error) {
      console.error("Error generating meal plan:", error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";

      // Provide more specific error messages for known backend issues
      if (errorMessage.includes("recommend() got an unexpected keyword argument 'dataset'")) {
        console.warn("Backend has a known bug. Providing sample data for demonstration.");
        setErrorMessage("Backend service has a configuration issue. Showing sample recommendations for demonstration.");

        // Add a visual indicator that this is sample data
        setCacheStatus("⚠️ Showing sample data due to backend service issue");

        // Provide sample data as fallback
        const sampleMealPlans: Record<string, Recipe[]> = {
          "Breakfast": [{
            Name: "Oatmeal with Berries",
            image_link: "",
            CookTime: "5 minutes",
            PrepTime: "2 minutes",
            TotalTime: "7 minutes",
            RecipeIngredientParts: ["1 cup oats", "1 cup berries", "1 cup milk", "1 tbsp honey"],
            RecipeInstructions: ["Mix oats and milk", "Cook for 5 minutes", "Top with berries and honey"],
            Calories: 320,
            FatContent: 8,
            SaturatedFatContent: 2,
            CholesterolContent: 5,
            SodiumContent: 120,
            CarbohydrateContent: 55,
            FiberContent: 7,
            SugarContent: 20,
            ProteinContent: 12,
          }],
          "Lunch": [{
            Name: "Grilled Chicken Salad",
            image_link: "",
            CookTime: "10 minutes",
            PrepTime: "15 minutes",
            TotalTime: "25 minutes",
            RecipeIngredientParts: ["4oz chicken breast", "2 cups mixed greens", "1 tomato", "1 cucumber", "2 tbsp olive oil"],
            RecipeInstructions: ["Grill chicken for 10 minutes", "Chop vegetables", "Mix everything with olive oil"],
            Calories: 380,
            FatContent: 22,
            SaturatedFatContent: 3,
            CholesterolContent: 70,
            SodiumContent: 200,
            CarbohydrateContent: 12,
            FiberContent: 4,
            SugarContent: 6,
            ProteinContent: 35,
          }],
          "Dinner": [{
            Name: "Baked Salmon with Vegetables",
            image_link: "",
            CookTime: "20 minutes",
            PrepTime: "10 minutes",
            TotalTime: "30 minutes",
            RecipeIngredientParts: ["6oz salmon fillet", "1 cup broccoli", "1 carrot", "1 tbsp olive oil", "Lemon juice"],
            RecipeInstructions: ["Preheat oven to 400°F", "Place salmon and vegetables on baking sheet", "Drizzle with oil and lemon", "Bake for 20 minutes"],
            Calories: 420,
            FatContent: 28,
            SaturatedFatContent: 4,
            CholesterolContent: 80,
            SodiumContent: 180,
            CarbohydrateContent: 15,
            FiberContent: 5,
            SugarContent: 7,
            ProteinContent: 38,
          }],
        };

        const sampleDefaults: Record<string, Recipe> = {};
        Object.entries(sampleMealPlans).forEach(([meal, recipes]) => {
          if (recipes.length > 0) {
            sampleDefaults[meal] = recipes[0];
          }
        });

        setSelectedRecipes(sampleDefaults);
        setSelectedMeal(Object.keys(sampleMealPlans)[0]);

        // Calculate calories for sample data
        const sampleBmr =
          10 * formData.weight +
          6.25 * formData.height -
          5 * formData.age +
          (formData.gender === Gender.Male ? 5 : -161);

        const sampleMaintainCalories = Math.round(
          sampleBmr * ACTIVITY_MULTIPLIERS[formData.activity],
        );

        const samplePlan = WEIGHT_LOSS_PLANS.find(
          (p) => p.name === formData.weightLossPlan,
        );

        const sampleTargetCalories = Math.round(
          sampleMaintainCalories * (samplePlan?.multiplier || 1),
        );

        setResult({
          bmi,
          bmiCategory: "",
          bmiColor: "",
          maintainCalories: sampleMaintainCalories,
          targetCalories: sampleTargetCalories,
          mealPlans: sampleMealPlans,
        });
        return; // Don't show error, show sample data instead
      } else if (errorMessage.includes("API request failed")) {
        setErrorMessage("Unable to connect to the recommendation service. Please check your connection and try again.");
      } else {
        setErrorMessage(`Unable to generate the plan: ${errorMessage}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const focusedRecipe = selectedMeal ? selectedRecipes[selectedMeal] : null;

  const chartData = [
    {
      name: "Selected meal total",
      kcal: Object.values(selectedRecipes).reduce(
        (acc, r) => acc + (r?.Calories || 0),
        0,
      ),
    },
    { name: "Target limit", kcal: result?.targetCalories || 0 },
  ];

  const nutritionData = result
    ? [
        {
          name: "Protein",
          value: Object.values(selectedRecipes).reduce(
            (acc, r) => acc + (r?.ProteinContent || 0),
            0,
          ),
        },
        {
          name: "Carbs",
          value: Object.values(selectedRecipes).reduce(
            (acc, r) => acc + (r?.CarbohydrateContent || 0),
            0,
          ),
        },
        {
          name: "Fat",
          value: Object.values(selectedRecipes).reduce(
            (acc, r) => acc + (r?.FatContent || 0),
            0,
          ),
        },
      ]
    : [];

  return (
    <div className="space-y-8 px-4 py-4 sm:px-0">
      <header className="mb-8 space-y-3">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
          Automatic Diet Planner
        </h1>
        <p className="text-slate-500 dark:text-slate-400 max-w-2xl">
          Generates a full meal recommendation plan with goal, metric, and ingredient filters.
        </p>
      </header>

      <div className="grid gap-8 xl:grid-cols-[1.1fr_0.95fr]">
        <form
          onSubmit={calculateResults}
          className="space-y-6 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition-colors duration-200 dark:border-slate-700 dark:bg-slate-950 sm:p-6"
        >
          <div className="grid gap-4 lg:grid-cols-2">
            <label className="space-y-2">
              <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">Age</span>
              <input
                type="number"
                min={10}
                max={100}
                value={formData.age}
                onChange={(e) =>
                  setFormData({ ...formData, age: Number(e.target.value) })
                }
                className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
              />
            </label>
            <label className="space-y-2">
              <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">Height (cm)</span>
              <input
                type="number"
                min={120}
                max={230}
                value={formData.height}
                onChange={(e) =>
                  setFormData({ ...formData, height: Number(e.target.value) })
                }
                className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
              />
            </label>
            <label className="space-y-2">
              <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">Weight (kg)</span>
              <input
                type="number"
                min={35}
                max={180}
                value={formData.weight}
                onChange={(e) =>
                  setFormData({ ...formData, weight: Number(e.target.value) })
                }
                className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
              />
            </label>
            <label className="space-y-2">
              <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">BMI</span>
              <input
                type="number"
                value={bmi}
                readOnly
                className="w-full cursor-not-allowed rounded-3xl border border-slate-200 bg-slate-100 px-4 py-3 text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400"
              />
            </label>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <label className="space-y-2">
              <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">Activity level</span>
              <select
                value={formData.activity}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    activity: e.target.value as ActivityLevel,
                  })
                }
                className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
              >
                {Object.values(ActivityLevel).map((value) => (
                  <option key={value} value={value}>
                    {value}
                  </option>
                ))}
              </select>
            </label>
            <label className="space-y-2">
              <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">Weight goal</span>
              <select
                value={formData.weightLossPlan}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    weightLossPlan: e.target.value,
                  })
                }
                className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
              >
                {WEIGHT_LOSS_PLANS.map((plan) => (
                  <option key={plan.name} value={plan.name}>
                    {plan.name}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <label className="space-y-2">
              <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">Goal</span>
              <select
                value={formData.goal}
                onChange={(e) =>
                  setFormData({ ...formData, goal: e.target.value as GoalOption })
                }
                className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
              >
                <option value={GoalOption.WeightLoss}>Weight loss</option>
                <option value={GoalOption.MuscleGain}>Muscle gain</option>
                <option value={GoalOption.Maintenance}>Maintenance</option>
              </select>
            </label>
            <label className="space-y-2">
              <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">Metric</span>
              <select
                value={formData.metric}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    metric: e.target.value as MetricOption,
                  })
                }
                className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
              >
                <option value={MetricOption.NutritionalMae}>Nutritional MAE</option>
                <option value={MetricOption.DiversityScore}>Diversity score</option>
              </select>
            </label>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5 dark:border-slate-700 dark:bg-slate-900">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">Meals per day</span>
              <span className="text-sm text-slate-500 dark:text-slate-400">{formData.mealsPerDay}</span>
            </div>
            <input
              type="range"
              min={3}
              max={5}
              step={1}
              value={formData.mealsPerDay}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  mealsPerDay: Number(e.target.value),
                })
              }
              className="mt-4 w-full accent-emerald-500"
            />
          </div>

          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5 dark:border-slate-700 dark:bg-slate-900">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">Ingredient filter</span>
              <span className="text-sm text-slate-400">{ingredients.length}/15</span>
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_auto]">
              <input
                type="text"
                value={ingredientInput}
                onChange={(e) => setIngredientInput(e.target.value)}
                placeholder="Add ingredient"
                className="w-full rounded-3xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
              />
              <button
                type="button"
                onClick={handleAddIngredient}
                className="rounded-3xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700"
              >
                Add
              </button>
            </div>
            {ingredients.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {ingredients.map((ingredient) => (
                  <button
                    key={ingredient}
                    type="button"
                    onClick={() => handleRemoveIngredient(ingredient)}
                    className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-2 text-sm text-slate-700 dark:bg-slate-800 dark:text-slate-300"
                  >
                    {ingredient}
                    <span className="text-slate-400">×</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5 dark:border-slate-700 dark:bg-slate-900">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">Recommendations</span>
              <span className="text-sm text-slate-500 dark:text-slate-400">{nbRecommendations}</span>
            </div>
            <input
              type="range"
              min={1}
              max={100}
              step={1}
              value={nbRecommendations}
              onChange={(e) => setNbRecommendations(Number(e.target.value))}
              className="mt-4 w-full accent-emerald-500"
            />
          </div>

          {validationMessages.length > 0 && (
            <div className="rounded-3xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
              {validationMessages.map((message) => (
                <p key={message}>{message}</p>
              ))}
            </div>
          )}

          {errorMessage && (
            <div className="rounded-3xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
              {errorMessage}
            </div>
          )}

          {cacheStatus && (
            <div className="rounded-3xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">
              {cacheStatus}
            </div>
          )}

          {analyticsStatus && (
            <div className="rounded-3xl border border-sky-200 bg-sky-50 p-4 text-sm text-slate-800">
              {analyticsStatus}
            </div>
          )}

          {analyticsError && (
            <div className="rounded-3xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
              {analyticsError}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full rounded-3xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-60"
          >
            {isLoading ? "Building your plan…" : "Generate meal plan"}
          </button>
        </form>

        <div className="space-y-6">
          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-950">
            <div className="mb-4 flex items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Meals overview</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400">Tap a recipe to inspect details and model explainability.</p>
              </div>
              {result ? (
                <div className="rounded-3xl bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-700">
                  Target: {result.targetCalories} kcal/day
                </div>
              ) : null}
            </div>

            {!result ? (
              <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50 p-12 text-center text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400">
                No meal plan generated yet.
              </div>
            ) : (
              <div className="space-y-6">
                {Object.entries(result.mealPlans).map(([meal, recipes]) => (
                  <div key={meal} className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">{meal}</h3>
                      <button
                        type="button"
                        onClick={() => setSelectedMeal(meal)}
                        className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-300"
                      >
                        Focus
                      </button>
                    </div>
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      {recipes.slice(0, 4).map((recipe, idx) => (
                        <RecipeCard
                          key={`${meal}-${idx}-${recipe.Name}`}
                          recipe={recipe}
                          onSelect={() => {
                            setSelectedMeal(meal);
                            setSelectedRecipes((prev) => ({ ...prev, [meal]: recipe }));
                          }}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {result ? (
            <div className="grid gap-6">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition-colors duration-200 dark:border-slate-700 dark:bg-slate-950 sm:p-6">
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-3">Plan performance</h3>
                  <div className="h-64 sm:h-72">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={chartData} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                        <XAxis dataKey="name" tick={{ fill: "#64748b", fontSize: 12 }} />
                        <YAxis tick={{ fill: "#64748b", fontSize: 12 }} />
                        <Tooltip />
                        <Bar dataKey="kcal" fill="#10b981">
                          {chartData.map((_, index) => (
                            <Cell key={`cell-${index}`} fill={index === 0 ? "#10b981" : "#cbd5e1"} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition-colors duration-200 dark:border-slate-700 dark:bg-slate-950 sm:p-6">
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-3">Nutrition breakdown</h3>
                  <div className="h-64 sm:h-72">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={nutritionData} dataKey="value" innerRadius={60} outerRadius={80}>
                          <Cell fill="#10b981" />
                          <Cell fill="#3b82f6" />
                          <Cell fill="#f59e0b" />
                        </Pie>
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              <ExplainabilityPanel recipeId={focusedRecipe?.Name ?? ""} />
              <FeedbackComponent recipeId={focusedRecipe?.Name ?? ""} sessionId={sessionId} />
            </div>
          ) : null}

          {recentRecommendations.length > 0 && (
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5 dark:border-slate-700 dark:bg-slate-900">
              <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100 mb-3">Recent recommendations</h3>
              <div className="space-y-3">
                {recentRecommendations.slice(0, 4).map((item) => (
                  <div
                    key={item.key}
                    className="rounded-3xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-950"
                  >
                    <div className="text-xs text-slate-500 dark:text-slate-400">
                      {new Date(item.createdAt).toLocaleString()}
                    </div>
                    <div className="mt-2 text-sm text-slate-700 dark:text-slate-200">
                      Goal: {item.request.goal ?? "maintenance"}, Metric: {item.request.metric ?? "accuracy"}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AutomaticRecommendation;
