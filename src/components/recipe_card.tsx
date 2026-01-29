import React, { useState } from "react";
import { Recipe } from "../types";

interface RecipeCardProps {
  recipe: Recipe;
}

const RecipeCard: React.FC<RecipeCardProps> = ({ recipe }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
      <img
        src={recipe.image_link}
        alt={recipe.Name}
        className="w-full h-48 object-cover"
      />
      <div className="p-4">
        <h3 className="font-bold text-lg mb-2 text-slate-800 line-clamp-1">
          {recipe.Name}
        </h3>
        <div className="flex flex-wrap gap-2 mb-4">
          <span className="px-2 py-1 bg-emerald-50 text-emerald-700 text-xs rounded-full font-semibold">
            {recipe.Calories} kcal
          </span>
          <span className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-full font-semibold">
            {recipe.ProteinContent}g protein
          </span>
        </div>

        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full py-2 px-4 border border-emerald-500 text-emerald-600 rounded-lg hover:bg-emerald-50 transition-colors text-sm font-semibold"
        >
          {isOpen ? "Close Details" : "View Recipe"}
        </button>

        {isOpen && (
          <div className="mt-4 pt-4 border-t border-gray-100 space-y-4">
            <div>
              <h4 className="font-bold text-sm text-slate-700 mb-2">
                Nutritional Values (g)
              </h4>
              <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
                <p>Fat: {recipe.FatContent}g</p>
                <p>Sat Fat: {recipe.SaturatedFatContent}g</p>
                <p>Carbs: {recipe.CarbohydrateContent}g</p>
                <p>Sugar: {recipe.SugarContent}g</p>
                <p>Fiber: {recipe.FiberContent}g</p>
                <p>Protein: {recipe.ProteinContent}g</p>
              </div>
            </div>

            <div>
              <h4 className="font-bold text-sm text-slate-700 mb-2">
                Ingredients
              </h4>
              <ul className="list-disc list-inside text-xs text-gray-600 space-y-1">
                {recipe.RecipeIngredientParts.map((ing, i) => (
                  <li key={i}>{ing}</li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-sm text-slate-700 mb-2">
                Instructions
              </h4>
              <ol className="list-decimal list-inside text-xs text-gray-600 space-y-1">
                {recipe.RecipeInstructions.map((ins, i) => (
                  <li key={i}>{ins}</li>
                ))}
              </ol>
            </div>

            <div className="bg-gray-50 p-3 rounded-lg flex justify-around text-[10px] text-gray-500 font-mono">
              <span>Cook: {recipe.CookTime}</span>
              <span>Prep: {recipe.PrepTime}</span>
              <span>Total: {recipe.TotalTime}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RecipeCard;
