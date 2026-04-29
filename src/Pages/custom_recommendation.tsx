/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useMemo, useState } from "react";
import { initialNutrition, NUTRITION_LABELS, NutritionValues, Recipe, GoalOption, MetricOption } from "../types";
import RecipeCard from "../components/recipe_card";
import { RecipeModal } from "../components/recipe_modal";
import { predictDiet } from "../api/predict";

import { NUTRITION_KEYS } from "../constant";

const CustomRecommendation: React.FC = () => {
  const [nutrition, setNutrition] = useState<NutritionValues>(initialNutrition);

  const [ingredients, setIngredients] = useState<string[]>([]);
  const [ingredientInput, setIngredientInput] = useState("");

  const [bmi, setBmi] = useState(22);
  const [goal, setGoal] = useState<GoalOption>(GoalOption.Maintenance);
  const [metric, setMetric] = useState<MetricOption>(MetricOption.NutritionalMae);

  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");


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
    Number(nutrition.Calories),
    Number(nutrition.FatContent),
    Number(nutrition.SaturatedFatContent),
    Number(nutrition.CholesterolContent),
    Number(nutrition.SodiumContent),
    Number(nutrition.CarbohydrateContent),
    Number(nutrition.FiberContent),
    Number(nutrition.SugarContent),
    Number(nutrition.ProteinContent),
  ];

  const validateRequest = () => {
    const errors: string[] = [];

    if (ingredients.length > 15) {
      errors.push("Maximum 15 ingredients allowed.");
    }

    NUTRITION_KEYS.forEach((key) => {
      const value = (nutrition as any)[key];
      if (typeof value !== "number" || value < 0) {
        errors.push(`${NUTRITION_LABELS[key]} must be a positive number.`);
      }
    });

    if (bmi <= 10 || bmi >= 60) {
      errors.push("BMI must be between 10 and 60.");
    }

    return errors;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    setErrorMessage("");

    const errors = validateRequest();
    if (errors.length > 0) {
      setErrorMessage(errors.join(", "));
      return;
    }

    try {
      setIsLoading(true);

      const payload = {
        nutrition_input: buildNutritionInput(),
        ingredients: ingredientInput
          .split(",")
          .map(i => i.trim())
          .filter(Boolean),
        bmi,
        goal,
        metric,
      };

      const response = await predictDiet(payload);
      const recipesData = response.output ?? [];

      setRecipes(recipesData);
      setSelectedRecipe(null);
    } catch (error) {
      console.error(error);
      setErrorMessage("Failed to fetch recommendations.");
      setRecipes([]);
      setSelectedRecipe(null);
    } finally {
      setIsLoading(false);
    }
  };

  return (
  <div className="p-4 max-w-4xl mx-auto">
      <h2 className="text-xl font-semibold mb-4">
        Custom Diet Recommendation
      </h2>

      {/* Nutrition Inputs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {nutritionInputs.map(({ key, label, min, max }) => (
          <div key={key} className="flex flex-col">
            <label className="text-sm mb-1">{label}</label>
            <input
              type="number"
              value={(nutrition as any)[key] ?? ""}
              min={min}
              max={max}
              onChange={(e) => {
                const val = e.target.value;
                setNutrition({
                  ...nutrition,
                  [key]: val === "" ? "" : Number(val),
                });
              }}
              className="border p-2 rounded"
            />
          </div>
        ))}
      </div>
      
      <label>BMI</label>
      <input
        type="number"
        value={bmi}
        onChange={(e) => setBmi(Number(e.target.value) || 0)}
        placeholder="BMI"
        className="border p-2 rounded mt-4 w-full"
      />

      {/* Ingredient Input */}
      <label>Ingredients</label>
      <input
        type="text"
        value={ingredientInput}
        onChange={(e) => setIngredientInput(e.target.value)}
        placeholder="Add ingredients (comma separated)"
        className="border p-2 rounded w-full mt-4"
      />

      {/* Goal */}
      <label>Goal</label>
      <select
        value={goal}
        onChange={(e) => setGoal(e.target.value as GoalOption)}
        className="border p-2 rounded mt-4 w-full"
      >
        <option value={GoalOption.Maintenance}>Maintenance</option>
        <option value={GoalOption.WeightLoss}>Weight Loss</option>
        <option value={GoalOption.MuscleGain}>Muscle Gain</option>
      </select>
      
      {/* Metric */}
      <label>Metric</label>
      <select
        value={metric}
        onChange={(e) => setMetric(e.target.value as MetricOption)}
        className="border p-2 rounded mt-4 w-full"
      >
        <option value={MetricOption.NutritionalMae}>Nutritional Accuracy</option>
        <option value={MetricOption.DiversityScore}>Diversity</option>
      </select>

      {/* Submit */}
      <button
        onClick={handleSubmit}
        disabled={isLoading}
        className="mt-4 w-full bg-blue-600 text-white py-2 rounded disabled:opacity-50"
      >
        {isLoading ? "Generating..." : "Generate Recipes"}
      </button>

      {/* Error */}
      {errorMessage && (
        <p className="text-red-500 mt-2 text-sm">{errorMessage}</p>
      )}

      {/* Recipes */}
      {recipes.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6 items-start">
          {recipes.map((recipe, index) => (
            <RecipeCard
              key={`${recipe.Name}-${index}`}
              recipe={recipe}
              onView={(r) => setSelectedRecipe(r)}
            />
          ))}
        </div>
      )}

      {/* Modal */}
      {selectedRecipe && (
        <RecipeModal
          recipe={selectedRecipe}
          onClose={() => setSelectedRecipe(null)}
        />
      )}
    </div>
  );
};

export default CustomRecommendation;
