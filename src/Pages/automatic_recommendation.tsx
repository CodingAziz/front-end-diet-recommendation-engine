import React, { useState } from "react";
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
  UserData,
  Gender,
  ActivityLevel,
  RecommendationResult,
  Recipe,
} from "../types";

import { WEIGHT_LOSS_PLANS, ACTIVITY_MULTIPLIERS } from "../constant";
import RecipeCard from "../components/recipe_card";
import { predictDiet } from "../api/predict";
import attachImageLink from "../utils/imageLink";

const AutomaticRecommendation: React.FC = () => {
  const [formData, setFormData] = useState<UserData>({
    age: 25,
    height: 175,
    weight: 70,
    gender: Gender.Male,
    activity: ActivityLevel.Moderate,
    weightLossPlan: WEIGHT_LOSS_PLANS[0].name,
    mealsPerDay: 3,
  });

  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<RecommendationResult | null>(null);
  const [selectedRecipes, setSelectedRecipes] = useState<
    Record<string, Recipe>
  >({});

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

  const calculateResults = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // BMR 
      let bmr =
        10 * formData.weight +
        6.25 * formData.height -
        5 * formData.age;
      bmr += formData.gender === Gender.Male ? 5 : -161;

      const maintainCalories = Math.round(
        bmr * ACTIVITY_MULTIPLIERS[formData.activity],
      );

      const plan = WEIGHT_LOSS_PLANS.find(
        (p) => p.name === formData.weightLossPlan,
      );

      const targetCalories = Math.round(
        maintainCalories * (plan?.multiplier || 1),
      );

      // Meal splits
      const splits =
        formData.mealsPerDay === 3
          ? { Breakfast: 0.35, Lunch: 0.4, Dinner: 0.25 }
          : formData.mealsPerDay === 4
          ? {
              Breakfast: 0.3,
              "Morning Snack": 0.05,
              Lunch: 0.4,
              Dinner: 0.25,
            }
          : {
              Breakfast: 0.3,
              "Morning Snack": 0.05,
              Lunch: 0.35,
              "Afternoon Snack": 0.1,
              Dinner: 0.2,
            };

      const mealPlans: Record<string, Recipe[]> = {};

      // Parallel API calls
      const responses = await Promise.all(
        Object.entries(splits).map(([meal, perc]) =>
          predictDiet({
            nutrition_input: buildNutritionInput(
              Math.round(targetCalories * perc),
            ),
            ingredients: [],
            params: {
              n_neighbors: 5,
              return_distance: false,
            },
          }).then((res) => ({
            meal,
            recipes: (res.output ?? []).map(attachImageLink),
          })),
      )
    );

      responses.forEach(({ meal, recipes }) => {
        mealPlans[meal] = recipes;
      });

      // Default selection
      const defaults: Record<string, Recipe> = {};
      Object.entries(mealPlans).forEach(([meal, recipes]) => {
        if (recipes.length > 0) defaults[meal] = recipes[0];
      });

      setSelectedRecipes(defaults);

      setResult({
        bmi: Number(
          (formData.weight / (formData.height / 100) ** 2).toFixed(2),
        ),
        bmiCategory: "",
        bmiColor: "",
        maintainCalories,
        targetCalories,
        mealPlans,
      });
    } catch (err) {
      console.error(err);
      alert("Failed to generate diet plan. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Charts
  const chartData = [
    {
      name: "Selected Meal Plan",
      kcal: Object.values(selectedRecipes).reduce(
        (acc, r) => acc + (r?.Calories || 0),
        0,
      ),
    },
    { name: "Target Limit", kcal: result?.targetCalories || 0 },
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
    <div className="space-y-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">
          Automatic Diet Planner
        </h1>
        <p className="text-slate-500">
          Let AI tailor your nutrition based on your biological metrics.
        </p>
      </header>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <form
            onSubmit={calculateResults}
            className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-4"
          >
            <div>
              <label className="block text-sm font-semibold">Age</label>
              <input
                type="number"
                value={formData.age}
                min={1}
                max={120}
                onChange={(e) =>
                  setFormData({ ...formData, age: Number(e.target.value) })
                }
                className="w-full input"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold">
                  Height (cm)
                </label>
                <input
                  type="number"
                  value={formData.height}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      height: Number(e.target.value),
                    })
                  }
                  className="w-full input"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold">
                  Weight (kg)
                </label>
                <input
                  type="number"
                  value={formData.weight}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      weight: Number(e.target.value),
                    })
                  }
                  className="w-full input"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold">Gender</label>
              <div className="flex gap-4">
                {Object.values(Gender).map((g) => (
                  <label key={g} className="flex items-center gap-2">
                    <input
                      type="radio"
                      checked={formData.gender === g}
                      onChange={() =>
                        setFormData({ ...formData, gender: g })
                      }
                    />
                    {g}
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold">
                Activity Level
              </label>
              <select
                value={formData.activity}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    activity: e.target.value as ActivityLevel,
                  })
                }
                className="w-full input"
              >
                {Object.values(ActivityLevel).map((a) => (
                  <option key={a}>{a}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold">
                Weight Goal
              </label>
              <select
                value={formData.weightLossPlan}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    weightLossPlan: e.target.value,
                  })
                }
                className="w-full input"
              >
                {WEIGHT_LOSS_PLANS.map((p) => (
                  <option key={p.name} value={p.name}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold">
                Meals Per Day ({formData.mealsPerDay})
              </label>
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
                className="w-full"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-emerald-600 text-white rounded-xl font-bold"
            >
              {isLoading ? "Generating Plan..." : "Generate Recommendations"}
            </button>

            {result && (
              <button
                type="button"
                onClick={() => {
                  setResult(null);
                  setSelectedRecipes({});
                }}
                className="w-full text-xs text-blue-600 underline"
              >
                Generate again
              </button>
            )}
          </form>
        </div>

        {/* RESULTS COLUMN */}
        <div className="lg:col-span-2 space-y-8">
          {!result ? (
            <div className="h-full flex items-center justify-center p-12 bg-white rounded-3xl border-dashed border-2 opacity-60">
              <p>No Plan Generated Yet</p>
            </div>
          ) : (
            <>
              {Object.entries(result.mealPlans).map(([meal, recipes]) => (
                <div key={meal} className="space-y-4">
                  <h3 className="text-lg font-bold text-emerald-700">
                    {meal}
                  </h3>
                  <div className="grid md:grid-cols-3 gap-4">
                    {recipes.map((r, idx) => (
                      <RecipeCard key={idx} recipe={r} />
                    ))}
                  </div>
                </div>
              ))}

              <div className="grid md:grid-cols-2 gap-8 pt-8">
                <div className="bg-white p-6 h-80 rounded-2xl shadow-sm">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData}>
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="kcal">
                        {chartData.map((_, i) => (
                          <Cell
                            key={i}
                            fill={i === 0 ? "#10b981" : "#cbd5e1"}
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                <div className="bg-white p-6 h-80 rounded-2xl shadow-sm">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={nutritionData}
                        innerRadius={60}
                        outerRadius={80}
                        dataKey="value"
                      >
                        <Cell fill="#10b981" />
                        <Cell fill="#3b82f6" />
                        <Cell fill="#f59e0b" />
                      </Pie>
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AutomaticRecommendation;