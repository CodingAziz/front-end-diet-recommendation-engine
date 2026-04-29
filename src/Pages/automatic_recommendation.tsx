/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useMemo, useState } from "react";
import {
  Gender,
  ActivityLevel,
  Recipe,
  GoalOption,
  MetricOption,
} from "../types";
import { WEIGHT_LOSS_PLANS, ACTIVITY_MULTIPLIERS } from "../constant";
import RecipeCard from "../components/recipe_card";
import { predictDiet } from "../api/predict";
import { RecipeModal } from "../components/recipe_modal";

const AutomaticRecommendation: React.FC = () => {
  const [formData, setFormData] = useState({
    age: "",
    height: "",
    weight: "",
    gender: Gender.Male,
    activity: ActivityLevel.Moderate,
    weightLossPlan: WEIGHT_LOSS_PLANS[0].name,
    mealsPerDay: 3,
    goal: GoalOption.Maintenance,
    metric: MetricOption.NutritionalMae,
  });
  const [ingredients, setIngredients] = useState<string[]>([]);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  
  const [recipes, setRecipes] = useState<Recipe[]>([]);

  const bmi = useMemo(() => {
    return Number((Number(formData.weight) / (Number(formData.height) / 100) ** 2).toFixed(1));
  }, [formData.height, formData.weight]);

  const calculateCalories = () => {
    const { weight, height, age, gender, activity, goal, metric } = formData;
    const weight_num = Number(weight)
    const height_num = Number(height)
    const age_num = Number(age)

    const bmr =
      gender === Gender.Male
        ? 10 * weight_num + 6.25 * height_num - 5 * age_num + 5
        : 10 * weight_num + 6.25 * height_num - 5 * age_num - 161;

    const activityFactor = ACTIVITY_MULTIPLIERS[activity] || 1.2;

    let calories = bmr * activityFactor;

    if (goal === GoalOption.WeightLoss) {
      calories -= 500;
    } else if (goal === GoalOption.MuscleGain) {
      calories += 300;
    }

    return Math.round(calories);
  };

  const buildNutritionInput = (): number[] => {
    const calories = calculateCalories();

    return [
      calories,
      calories * 0.25 / 9,  
      calories * 0.07 / 9,   
      300,                
      2300,                
      calories * 0.50 / 4, 
      30,                 
      50,                
      calories * 0.20 / 4,
    ].map(n => Math.round(n));
  };

  const validateForm = () => {
    const errors: string[] = [];

    if (Number(formData.age) <= 0) errors.push("Invalid age");
    if (Number(formData.height) <= 0) errors.push("Invalid height");
    if (Number(formData.weight) <= 0) errors.push("Invalid weight");

    return errors;
  };

  const handleSubmit = async () => {
    const errors = validateForm();
    if (errors.length) {
      setErrorMessage(errors.join(", "));
      return;
    }

    try {
      setIsLoading(true);
      setErrorMessage("");

      const nutrition_input = buildNutritionInput();

      const payload = {
        nutrition_input,
        bmi,
        goal: formData.goal,
        metric: formData.metric,
        ingredients: [],
      };

      const res = await predictDiet(payload);

      setRecipes(res.output ?? []);
    } catch (err: any) {
      setErrorMessage(err.message || "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-4 max-w-3xl mx-auto">
      <h2 className="text-xl font-semibold mb-4">
        Automatic Diet Recommendation
      </h2>

      {/* Form */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <label>Age</label>
        <input
          type="number"
          value={formData.age}
          onChange={(e) =>
            setFormData({ ...formData, age: e.target.value})
          }
          placeholder="Age"
          className="border p-2 rounded"
        />

        <label>Height</label>
        <input
          type="number"
          value={formData.height}
          onChange={(e) =>
            setFormData({ ...formData, height: e.target.value})
          }
          placeholder="Height (cm)"
          className="border p-2 rounded"
        />

        <label>Weight</label>
        <input
          type="number"
          value={formData.weight}
          onChange={(e) =>
            setFormData({ ...formData, weight: e.target.value})
          }
          placeholder="Weight (kg)"
          className="border p-2 rounded"
        />

        <label>Gender</label>
        <select
          value={formData.gender}
          onChange={(e) =>
            setFormData({ ...formData, gender: e.target.value as Gender })
          }
          className="border p-2 rounded"
        >
          <option value={Gender.Male}>Male</option>
          <option value={Gender.Female}>Female</option>
        </select>
        
        <label>Activity</label>
        <select
          value={formData.activity}
          onChange={(e) =>
            setFormData({ ...formData, activity: e.target.value as ActivityLevel })
          }
          className="border p-2 rounded"
        >
          {Object.values(ActivityLevel).map((level) => (
            <option key={level} value={level}>
              {level}
            </option>
          ))}
        </select>

        <label>Goal</label>
        <select
          value={formData.goal}
          onChange={(e) =>
            setFormData({ ...formData, goal: e.target.value as GoalOption })
          }
          className="border p-2 rounded"
        >
          <option value={GoalOption.Maintenance}>Maintenance</option>
          <option value={GoalOption.WeightLoss}>Weight Loss</option>
          <option value={GoalOption.MuscleGain}>Muscle Gain</option>
        </select>

        <label>Metric</label>
        <select
          value={formData.metric}
          onChange={(e) =>
            setFormData({ ...formData, metric: e.target.value as MetricOption })
          }
          className="border p-2 rounded"
        >
          <option value={MetricOption.NutritionalMae}>Nutritional MAE</option>
          <option value={MetricOption.DiversityScore}>Diversity Score</option>
        </select>

      </div>

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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
          {recipes.map((recipe, index) => (
            <RecipeCard 
            key={`${recipe.Name}-${index}`} 
            recipe={recipe}
            onView={(recipe) => setSelectedRecipe(recipe)}
             />
          ))}
        </div>
      )}

      {selectedRecipe && (
        <RecipeModal
          recipe={selectedRecipe}
          onClose={() => setSelectedRecipe(null)}
        />
      )}
    </div>
  );
};

export default AutomaticRecommendation;
