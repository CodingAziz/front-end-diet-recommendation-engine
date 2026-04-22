import React, { useState } from "react";
import { Recipe } from "../types";

interface RecipeCardProps {
  recipe: Recipe;
  onSelect?: (recipe: Recipe) => void;
}

const RecipeCard: React.FC<RecipeCardProps> = ({ recipe, onSelect }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="group flex h-full flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition-shadow duration-200 hover:shadow-md dark:border-slate-700 dark:bg-slate-950">
      <img
        src={recipe.image_link}
        alt={recipe.Name}
        className="w-full object-cover h-56 sm:h-48"
      />
      <div className="flex flex-1 flex-col p-4">
        <div>
          <h3 className="font-bold text-lg mb-2 text-slate-900 dark:text-slate-100 line-clamp-2">
            {recipe.Name}
          </h3>
          <div className="grid grid-cols-2 gap-2 mb-4 text-xs text-slate-600 dark:text-slate-300">
            <span className="inline-flex items-center rounded-full bg-emerald-50 px-2 py-1 font-semibold text-emerald-700 dark:bg-emerald-500/10">
              {recipe.Calories} kcal
            </span>
            <span className="inline-flex items-center rounded-full bg-blue-50 px-2 py-1 font-semibold text-blue-700 dark:bg-blue-500/10">
              {recipe.ProteinContent}g protein
            </span>
          </div>
        </div>

        <div className="grid gap-3 flex-1">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="w-full rounded-2xl border border-emerald-500 bg-white px-4 py-3 text-sm font-semibold text-emerald-600 transition-colors duration-200 hover:bg-emerald-50 dark:bg-slate-950"
          >
            {isOpen ? "Close Details" : "View Recipe"}
          </button>
          {onSelect ? (
            <button
              type="button"
              onClick={() => onSelect(recipe)}
              className="w-full rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition-colors duration-200 hover:bg-slate-800"
            >
              Select Recipe
            </button>
          ) : null}
        </div>

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
