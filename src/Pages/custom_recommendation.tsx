import React, { useEffect, useMemo, useState } from "react";
import { NutritionValues, Recipe, GoalOption, MetricOption } from "../types";
import RecipeCard from "../components/recipe_card";
import FeedbackComponent from "../components/feedback_component";
import ExplainabilityPanel from "../components/explainability_panel";
import { predictDiet } from "../api/predict";
import attachImageLink from "../utils/imageLink";
import {
  getCachedRecommendation,
  getRecentRecommendations,
  makeCacheKey,
  setCachedRecommendation,
  getSessionId,
} from "../utils/session";
import { NUTRITION_KEYS } from "../constant";

const NUTRITION_LABELS: Record<string, string> = {
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

const initialNutrition: NutritionValues = {
  Calories: 650,
  FatContent: 35,
  SaturatedFatContent: 8,
  CholesterolContent: 55,
  SodiumContent: 500,
  CarbohydrateContent: 140,
  FiberContent: 16,
  SugarContent: 14,
  ProteinContent: 32,
};

const CustomRecommendation: React.FC = () => {
  const [nutrition, setNutrition] = useState<NutritionValues>(initialNutrition);
  const [ingredients, setIngredients] = useState<string[]>([]);
  const [ingredientInput, setIngredientInput] = useState("");
  const [bmi, setBmi] = useState(22);
  const [goal, setGoal] = useState<GoalOption>(GoalOption.Maintenance);
  const [metric, setMetric] = useState<MetricOption>(MetricOption.NutritionalMae);
  const [nbRecommendations, setNbRecommendations] = useState(7);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [validationMessages, setValidationMessages] = useState<string[]>([]);
  const [recentRecommendations, setRecentRecommendations] = useState<ReturnType<typeof getRecentRecommendations>>([]);
  const [cacheStatus, setCacheStatus] = useState<string>("");
  const [sessionId] = useState(getSessionId());

  useEffect(() => {
    setRecentRecommendations(getRecentRecommendations());
  }, []);

  const nutritionInputs = useMemo(
    () =>
      NUTRITION_KEYS.map((key) => ({
        key,
        label: NUTRITION_LABELS[key] ?? key,
        min: 0,
        max: key === "Calories" ? 2000 : key === "CarbohydrateContent" ? 250 : 120,
      })),
    [],
  );

  const buildNutritionInput = (): number[] => [
    nutrition.Calories,
    nutrition.FatContent,
    nutrition.SaturatedFatContent,
    nutrition.CholesterolContent,
    nutrition.SodiumContent,
    nutrition.CarbohydrateContent,
    nutrition.FiberContent,
    nutrition.SugarContent,
    nutrition.ProteinContent,
  ];

  const validateRequest = () => {
    const errors: string[] = [];
    if (bmi <= 10 || bmi >= 60) {
      errors.push("BMI should be between 10 and 60.");
    }
    if (nbRecommendations < 1 || nbRecommendations > 100) {
      errors.push("Number of recommendations must be between 1 and 100.");
    }
    if (ingredients.length > 15) {
      errors.push("Keep ingredient filters to 15 or fewer items.");
    }
    NUTRITION_KEYS.forEach((key) => {
      const value = (nutrition as any)[key];
      if (typeof value !== "number" || value < 0) {
        errors.push(`${NUTRITION_LABELS[key]} must be a positive number.`);
      }
    });
    return errors;
  };

  const handleAddIngredient = () => {
    const nextIngredient = ingredientInput.trim();
    if (!nextIngredient) {
      return;
    }
    if (!ingredients.includes(nextIngredient) && ingredients.length < 15) {
      setIngredients([...ingredients, nextIngredient]);
    }
    setIngredientInput("");
  };

  const handleRemoveIngredient = (target: string) => {
    setIngredients(ingredients.filter((item) => item !== target));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setValidationMessages([]);
    setErrorMessage("");
    setCacheStatus("");

    const errors = validateRequest();
    if (errors.length > 0) {
      setValidationMessages(errors);
      return;
    }

    const payload = {
      nutrition_input: buildNutritionInput(),
      ingredients,
      bmi,
      goal,
      metric,
      params: {
        n_neighbors: nbRecommendations,
        return_distance: false,
        metric,
      },
    };

    const cacheKey = makeCacheKey(payload);
    const cached = getCachedRecommendation(cacheKey);
    if (cached) {
      const enrichedRecipes = cached.map(attachImageLink);
      setRecipes(enrichedRecipes);
      setSelectedRecipe(enrichedRecipes[0] ?? null);
      setCacheStatus("Loaded from cache.");
      return;
    }

    setIsLoading(true);
    try {
      const response = await predictDiet(payload);
      const rawRecipes = response.output ?? [];
      const enrichedRecipes = rawRecipes.map(attachImageLink);

      setRecipes(enrichedRecipes);
      setSelectedRecipe(enrichedRecipes[0] ?? null);
      if (enrichedRecipes.length > 0) {
        setCachedRecommendation(cacheKey, payload, enrichedRecipes);
        setRecentRecommendations(getRecentRecommendations());
      }
    } catch (error) {
      console.error(error);
      setErrorMessage("Failed to fetch recommendations. Please check the backend and try again.");
      setRecipes([]);
      setSelectedRecipe(null);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <header className="mb-6">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">Custom Recommendation Studio</h1>
        <p className="text-slate-500 dark:text-slate-400 max-w-2xl">
          Build a personalized nutrition request using BMI, ingredient preferences, and metric selection.
        </p>
      </header>

      <div className="grid xl:grid-cols-[1.4fr_0.95fr] gap-8">
        <form onSubmit={handleSubmit} className="space-y-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-950">
          <div className="grid gap-4 lg:grid-cols-2">
            <label className="space-y-2">
              <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">BMI</span>
              <input
                type="number"
                value={bmi}
                min={10}
                max={60}
                step={0.1}
                onChange={(event) => setBmi(Number(event.target.value))}
                className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
              />
            </label>
            <label className="space-y-2">
              <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">Fitness goal</span>
              <select
                value={goal}
                onChange={(event) => setGoal(event.target.value as GoalOption)}
                className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
              >
                <option value={GoalOption.WeightLoss}>Weight loss</option>
                <option value={GoalOption.MuscleGain}>Muscle gain</option>
                <option value={GoalOption.Maintenance}>Maintenance</option>
              </select>
            </label>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5 dark:border-slate-700 dark:bg-slate-900">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">Metric preference</h2>
              <span className="text-sm text-slate-500 dark:text-slate-400">Choose one</span>
            </div>
            <div className="flex flex-wrap gap-3">
              {Object.values(MetricOption).map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setMetric(option)}
                  className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                    metric === option
                      ? "bg-emerald-600 text-white"
                      : "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300"
                  }`}
                >
                  {option.replace("_", " ")}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Nutrition sliders</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400">Adjust 9 nutrition targets for backend recommendation input.</p>
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              {nutritionInputs.map((field) => (
                <div key={field.key} className="space-y-2">
                  <div className="flex items-center justify-between text-xs uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
                    <span>{field.label}</span>
                    <span>{(nutrition as any)[field.key]}</span>
                  </div>
                  <input
                    type="range"
                    min={field.min}
                    max={field.max}
                    step={field.key === "Calories" ? 25 : 1}
                    value={(nutrition as any)[field.key]}
                    onChange={(event) =>
                      setNutrition({
                        ...nutrition,
                        [field.key]: Number(event.target.value),
                      })
                    }
                    className="w-full accent-emerald-500"
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-3 rounded-3xl border border-slate-200 bg-slate-50 p-5 dark:border-slate-700 dark:bg-slate-900">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Ingredients filter</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400">Optionally prioritize ingredients you want in the recommendation.</p>
              </div>
              <span className="text-sm text-slate-400">{ingredients.length}/15</span>
            </div>
            <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
              <input
                value={ingredientInput}
                onChange={(event) => setIngredientInput(event.target.value)}
                placeholder="Add ingredient"
                className="w-full rounded-3xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
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
              <div className="flex flex-wrap gap-2">
                {ingredients.map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => handleRemoveIngredient(item)}
                    className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-2 text-sm text-slate-700 dark:bg-slate-800 dark:text-slate-300"
                  >
                    {item} <span className="text-slate-400">×</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-3 pt-4 border-t border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-between text-sm text-slate-600 dark:text-slate-400">
              <span className="font-semibold">Recommendations</span>
              <span>{nbRecommendations}</span>
            </div>
            <input
              type="range"
              min={1}
              max={100}
              step={1}
              value={nbRecommendations}
              onChange={(event) => setNbRecommendations(Number(event.target.value))}
              className="w-full accent-emerald-500"
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
            <div className="rounded-3xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">{errorMessage}</div>
          )}

          {cacheStatus && (
            <div className="rounded-3xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">{cacheStatus}</div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full rounded-3xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-60"
          >
            {isLoading ? "Loading recommendations…" : "Find recommended recipes"}
          </button>

          {recentRecommendations.length > 0 && (
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-300">
              <div className="font-semibold text-slate-900 dark:text-slate-100 mb-2">Recent request history</div>
              <div className="space-y-2">
                {recentRecommendations.slice(0, 4).map((entry) => (
                  <div key={entry.key} className="rounded-3xl border border-slate-200 bg-white p-3 dark:border-slate-700 dark:bg-slate-900">
                    <div className="text-xs text-slate-500 dark:text-slate-400">
                      {new Date(entry.createdAt).toLocaleString()}
                    </div>
                    <div className="mt-2 text-sm font-medium text-slate-900 dark:text-slate-100">{entry.request.goal || "maintenance"}</div>
                    <div className="text-sm text-slate-500 dark:text-slate-400">{entry.request.params?.n_neighbors} recommendations · {entry.request.metric || "accuracy"}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </form>

        <div className="space-y-6">
          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-950">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Recommendation results</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400">Select a suggestion to inspect the recipe details.</p>
              </div>
              <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                {recipes.length} results
              </span>
            </div>

            {recipes.length > 0 ? (
              <div className="grid gap-4">
                {recipes.map((recipe, index) => (
                  <RecipeCard
                    key={`${recipe.Name}-${index}`}
                    recipe={recipe}
                    onSelect={() => setSelectedRecipe(recipe)}
                  />
                ))}
              </div>
            ) : (
              <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50 p-10 text-center text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400">
                No recipes loaded yet. Submit the form to receive backend recommendations.
              </div>
            )}
          </section>

          <div className="grid gap-6">
            <ExplainabilityPanel recipeId={selectedRecipe?.Name ?? ""} />
            <FeedbackComponent recipeId={selectedRecipe?.Name ?? ""} sessionId={sessionId} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomRecommendation;
