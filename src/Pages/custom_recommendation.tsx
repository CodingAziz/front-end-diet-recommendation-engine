import React, { useState } from "react";
import { NutritionValues, Recipe } from "../types";
import { getCustomRecommendations } from "../services/gem";
import RecipeCard from "../components/recipe_card";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";

const CustomRecommendation: React.FC = () => {
  const [nutrition, setNutrition] = useState<NutritionValues>({
    Calories: 500,
    FatContent: 50,
    SaturatedFatContent: 5,
    CholesterolContent: 50,
    SodiumContent: 400,
    CarbohydrateContent: 100,
    FiberContent: 10,
    SugarContent: 10,
    ProteinContent: 20,
  });

  const [nbRecommendations, setNbRecommendations] = useState(5);
  const [ingredients, setIngredients] = useState("");
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    const results = await getCustomRecommendations(
      nutrition,
      nbRecommendations,
      ingredients,
    );
    setRecipes(results);
    if (results.length > 0) setSelectedRecipe(results[0]);
    setIsLoading(false);
  };

  const getPieData = (r: Recipe) => [
    { name: "Protein", value: r.ProteinContent },
    { name: "Carbs", value: r.CarbohydrateContent },
    { name: "Fat", value: r.FatContent },
  ];

  return (
    <div className="space-y-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">
          Custom Food Finder
        </h1>
        <p className="text-slate-500">
          Fine-tune your targets to find the perfect recipe for your needs.
        </p>
      </header>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <form
            onSubmit={handleSearch}
            className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-6"
          >
            <h3 className="font-bold text-slate-800 border-b pb-2">
              Nutritional Targets
            </h3>

            <div className="space-y-4">
              {[
                { label: "Calories", key: "Calories", min: 0, max: 2000 },
                { label: "Fat (g)", key: "FatContent", min: 0, max: 100 },
                {
                  label: "Protein (g)",
                  key: "ProteinContent",
                  min: 0,
                  max: 100,
                },
                {
                  label: "Carbs (g)",
                  key: "CarbohydrateContent",
                  min: 0,
                  max: 200,
                },
              ].map((target) => (
                <div key={target.key}>
                  <div className="flex justify-between text-xs font-bold mb-1">
                    <label className="text-gray-500 uppercase">
                      {target.label}
                    </label>
                    <span className="text-emerald-600">
                      {(nutrition as any)[target.key]}
                    </span>
                  </div>
                  <input
                    type="range"
                    min={target.min}
                    max={target.max}
                    step="5"
                    value={(nutrition as any)[target.key]}
                    onChange={(e) =>
                      setNutrition({
                        ...nutrition,
                        [target.key]: Number(e.target.value),
                      })
                    }
                    className="w-full accent-emerald-500"
                  />
                </div>
              ))}
            </div>

            <div className="space-y-4 pt-4 border-t border-gray-100">
              <h3 className="font-bold text-slate-800">Options</h3>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">
                  Number of recommendations ({nbRecommendations})
                </label>
                <input
                  type="range"
                  min="3"
                  max="15"
                  step="3"
                  value={nbRecommendations}
                  onChange={(e) => setNbRecommendations(Number(e.target.value))}
                  className="w-full accent-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">
                  Included Ingredients
                </label>
                <input
                  type="text"
                  placeholder="Chicken, Spinach, Tomato..."
                  value={ingredients}
                  onChange={(e) => setIngredients(e.target.value)}
                  className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                />
                <p className="text-[10px] text-gray-400 mt-1">
                  Separate ingredients with commas.
                </p>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition-colors disabled:opacity-50"
            >
              {isLoading ? "Searching Recipes..." : "Generate Recipes"}
            </button>
          </form>
        </div>

        <div className="lg:col-span-2 space-y-8">
          {recipes.length > 0 ? (
            <>
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
                  <h2 className="text-xl font-bold text-slate-800">
                    Search Overview
                  </h2>
                  <select
                    className="border rounded-lg px-3 py-1 text-sm outline-none focus:ring-2 focus:ring-emerald-500"
                    onChange={(e) => {
                      const r = recipes.find(
                        (rec) => rec.Name === e.target.value,
                      );
                      if (r) setSelectedRecipe(r);
                    }}
                    value={selectedRecipe?.Name}
                  >
                    {recipes.map((r) => (
                      <option key={r.Name} value={r.Name}>
                        {r.Name}
                      </option>
                    ))}
                  </select>
                </div>

                {selectedRecipe && (
                  <div className="grid md:grid-cols-2 gap-8 items-center">
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={getPieData(selectedRecipe)}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={90}
                            paddingAngle={5}
                            dataKey="value"
                            label
                          >
                            <Cell fill="#10b981" />
                            <Cell fill="#3b82f6" />
                            <Cell fill="#f59e0b" />
                          </Pie>
                          <Tooltip />
                          <Legend verticalAlign="bottom" />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="space-y-3">
                      <h4 className="font-bold text-slate-700">
                        {selectedRecipe.Name} Highlights
                      </h4>
                      <div className="flex items-center justify-between p-3 bg-emerald-50 rounded-xl text-emerald-800">
                        <span className="text-sm font-semibold">
                          Total Calories
                        </span>
                        <span className="text-xl font-black">
                          {selectedRecipe.Calories} kcal
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="p-3 bg-gray-50 rounded-xl">
                          <p className="text-[10px] text-gray-500 uppercase font-bold">
                            Fiber
                          </p>
                          <p className="text-sm font-bold text-slate-800">
                            {selectedRecipe.FiberContent}g
                          </p>
                        </div>
                        <div className="p-3 bg-gray-50 rounded-xl">
                          <p className="text-[10px] text-gray-500 uppercase font-bold">
                            Sugar
                          </p>
                          <p className="text-sm font-bold text-slate-800">
                            {selectedRecipe.SugarContent}g
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                {recipes.map((recipe, idx) => (
                  <RecipeCard key={idx} recipe={recipe} />
                ))}
              </div>
            </>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center p-12 bg-white rounded-3xl border-2 border-dashed border-gray-200 opacity-60">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-xl font-bold text-gray-600">
                No Recipes Found
              </h3>
              <p className="text-gray-400 max-w-sm">
                Adjust your sliders and target ingredients to find recipes
                tailored to your nutrition goals.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CustomRecommendation;
