import React from "react";
import { RecipeCardProps } from "../types";

const RecipeCard: React.FC<RecipeCardProps> = ({ recipe, onView }) => {

  return (
    <div className="flex flex-col rounded-3xl border bg-white shadow-sm hover:shadow-md transition">

      <div className="p-4 flex flex-col h-full">

        {/* Title */}
        <h3 className="font-bold text-lg mb-2 line-clamp-2 min-h-[3rem]">
          {recipe.Name}
        </h3>

        {/* Nutrition Tags */}
        <div className="flex gap-2 mb-4 text-xs">
          <span className="px-2 py-1 bg-emerald-100 rounded">
            {recipe.Calories} kcal
          </span>
          <span className="px-2 py-1 bg-blue-100 rounded">
            {recipe.ProteinContent}g protein
          </span>
        </div>

        {/* Push buttons to consistent position */}
        <div className="flex flex-col gap-3 mt-auto">
          <button
            onClick={() => onView?.(recipe)}
            className="w-full rounded-xl border border-emerald-500 px-4 py-2 text-sm font-semibold text-emerald-600 hover:bg-emerald-50"
          >
            View Recipe
          </button>
        </div>
      </div>
    </div>
  )
};

export default RecipeCard;
