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
import { getRecommendationsForMeal } from "../services/gem";
import RecipeCard from "../components/recipe_card";

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

  const calculateResults = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // BMI
    const bmi = Number(
      (formData.weight / (formData.height / 100) ** 2).toFixed(2),
    );
    let bmiCategory = "Normal";
    let bmiColor = "#10b981"; // emerald-500
    if (bmi < 18.5) {
      bmiCategory = "Underweight";
      bmiColor = "#ef4444";
    } else if (bmi >= 25 && bmi < 30) {
      bmiCategory = "Overweight";
      bmiColor = "#f59e0b";
    } else if (bmi >= 30) {
      bmiCategory = "Obesity";
      bmiColor = "#ef4444";
    }

    // BMR
    let bmr = 10 * formData.weight + 6.25 * formData.height - 5 * formData.age;
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
    let splits: Record<string, number> = {};
    if (formData.mealsPerDay === 3) {
      splits = { Breakfast: 0.35, Lunch: 0.4, Dinner: 0.25 };
    } else if (formData.mealsPerDay === 4) {
      splits = {
        Breakfast: 0.3,
        "Morning Snack": 0.05,
        Lunch: 0.4,
        Dinner: 0.25,
      };
    } else {
      splits = {
        Breakfast: 0.3,
        "Morning Snack": 0.05,
        Lunch: 0.35,
        "Afternoon Snack": 0.1,
        Dinner: 0.2,
      };
    }

    const mealPlans: Record<string, Recipe[]> = {};
    for (const [meal, perc] of Object.entries(splits)) {
      mealPlans[meal] = await getRecommendationsForMeal(
        meal,
        Math.round(targetCalories * perc),
      );
    }

    setResult({
      bmi,
      bmiCategory,
      bmiColor,
      maintainCalories,
      targetCalories,
      mealPlans,
    });

    // Default selection: pick the first of each
    const defaults: Record<string, Recipe> = {};
    Object.entries(mealPlans).forEach(([meal, recipes]) => {
      if (recipes.length > 0) defaults[meal] = recipes[0];
    });
    setSelectedRecipes(defaults);

    setIsLoading(false);
  };

  const chartData = [
    {
      name: "Selected Meal Plan",
      kcal: Object.values(selectedRecipes).reduce(
        (acc, r) => acc + (r?.Calories || 0),
        0,
      ),
    },
    { name: "Your Target Limit", kcal: result?.targetCalories || 0 },
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
        {/* Form Column */}
        <div className="lg:col-span-1">
          <form
            onSubmit={calculateResults}
            className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-4"
          >
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Age
              </label>
              <input
                type="number"
                value={formData.age}
                onChange={(e) =>
                  setFormData({ ...formData, age: Number(e.target.value) })
                }
                className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                min="1"
                max="120"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Height (cm)
                </label>
                <input
                  type="number"
                  value={formData.height}
                  onChange={(e) =>
                    setFormData({ ...formData, height: Number(e.target.value) })
                  }
                  className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Weight (kg)
                </label>
                <input
                  type="number"
                  value={formData.weight}
                  onChange={(e) =>
                    setFormData({ ...formData, weight: Number(e.target.value) })
                  }
                  className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Gender
              </label>
              <div className="flex gap-4">
                {Object.values(Gender).map((g) => (
                  <label
                    key={g}
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    <input
                      type="radio"
                      name="gender"
                      checked={formData.gender === g}
                      onChange={() => setFormData({ ...formData, gender: g })}
                      className="text-emerald-600 focus:ring-emerald-500"
                    />
                    <span className="text-sm">{g}</span>
                  </label>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
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
                className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none text-sm"
              >
                {Object.values(ActivityLevel).map((a) => (
                  <option key={a} value={a}>
                    {a}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Weight Goal
              </label>
              <select
                value={formData.weightLossPlan}
                onChange={(e) =>
                  setFormData({ ...formData, weightLossPlan: e.target.value })
                }
                className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none text-sm"
              >
                {WEIGHT_LOSS_PLANS.map((p) => (
                  <option key={p.name} value={p.name}>
                    {p.name} ({p.loss})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Meals Per Day ({formData.mealsPerDay})
              </label>
              <input
                type="range"
                min="3"
                max="5"
                step="1"
                value={formData.mealsPerDay}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    mealsPerDay: Number(e.target.value),
                  })
                }
                className="w-full accent-emerald-600"
              />
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition-colors disabled:opacity-50"
            >
              {isLoading ? "Generating Plan..." : "Generate Recommendations"}
            </button>
          </form>
        </div>

        {/* Results Column */}
        <div className="lg:col-span-2 space-y-8">
          {result ? (
            <>
              {/* BMI and Calorie Metrics */}
              <div className="grid md:grid-cols-3 gap-4">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center justify-center">
                  <span className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-1">
                    BMI Score
                  </span>
                  <span className="text-3xl font-black text-slate-800">
                    {result.bmi}
                  </span>
                  <span
                    className="text-sm font-semibold"
                    style={{ color: result.bmiColor }}
                  >
                    {result.bmiCategory}
                  </span>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center justify-center">
                  <span className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-1">
                    Target Intake
                  </span>
                  <span className="text-3xl font-black text-emerald-600">
                    {result.targetCalories}
                  </span>
                  <span className="text-xs font-medium text-slate-500">
                    kcal / day
                  </span>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center justify-center">
                  <span className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-1">
                    Maintain Weight
                  </span>
                  <span className="text-3xl font-black text-slate-400">
                    {result.maintainCalories}
                  </span>
                  <span className="text-xs font-medium text-slate-500">
                    kcal / day
                  </span>
                </div>
              </div>

              {/* Recipe Tabs/Sections */}
              <div className="space-y-6">
                <h2 className="text-xl font-bold text-slate-800">
                  Your Recommended Meals
                </h2>
                {Object.entries(result.mealPlans).map(([meal, recipes]) => (
                  <div key={meal} className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-bold text-emerald-700">
                        {meal} Options
                      </h3>
                      <select
                        className="text-xs border rounded p-1"
                        onChange={(e) => {
                          const r = recipes.find(
                            (rec) => rec.Name === e.target.value,
                          );
                          if (r)
                            setSelectedRecipes((prev) => ({
                              ...prev,
                              [meal]: r,
                            }));
                        }}
                      >
                        {recipes.map((r) => (
                          <option key={r.Name}>{r.Name}</option>
                        ))}
                      </select>
                    </div>
                    <div className="grid md:grid-cols-3 gap-4">
                      {recipes.map((recipe, idx) => (
                        <RecipeCard key={idx} recipe={recipe} />
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* Analysis Charts */}
              <div className="grid md:grid-cols-2 gap-8 pt-8">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-80">
                  <h3 className="text-sm font-bold text-gray-500 mb-4 text-center">
                    Calories vs Target
                  </h3>
                  <ResponsiveContainer width="100%" height="90%">
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="name" fontSize={10} />
                      <YAxis fontSize={10} />
                      <Tooltip />
                      <Bar dataKey="kcal" radius={[10, 10, 0, 0]}>
                        {chartData.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={
                              index === 0
                                ? entry.kcal > chartData[1].kcal
                                  ? "#ef4444"
                                  : "#10b981"
                                : "#cbd5e1"
                            }
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-80">
                  <h3 className="text-sm font-bold text-gray-500 mb-4 text-center">
                    Macros Balance (g)
                  </h3>
                  <ResponsiveContainer width="100%" height="90%">
                    <PieChart>
                      <Pie
                        data={nutritionData}
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        <Cell fill="#10b981" />
                        <Cell fill="#3b82f6" />
                        <Cell fill="#f59e0b" />
                      </Pie>
                      <Tooltip />
                      <Legend verticalAlign="bottom" height={36} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center p-12 bg-white rounded-3xl border-2 border-dashed border-gray-200 opacity-60">
              <div className="text-6xl mb-4">🥗</div>
              <h3 className="text-xl font-bold text-gray-600">
                No Plan Generated Yet
              </h3>
              <p className="text-gray-400 max-w-sm">
                Complete the form on the left to see your personalized diet
                recommendations and calculations.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AutomaticRecommendation;
