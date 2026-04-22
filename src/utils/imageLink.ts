import { Recipe } from "../types";
// maps backend recipe → frontend recipe
const attachImageLink = (recipe: any): Recipe => {
  console.log("Processing recipe:", recipe);
  if (!recipe || typeof recipe !== 'object') {
    console.error("Invalid recipe data:", recipe);
    throw new Error("Invalid recipe data received from backend");
  }

  const processedRecipe: Recipe = {
    ...recipe,
    image_link: recipe.image_link ?? recipe.image ?? "", // handle different image field names
    Name: recipe.Name ?? recipe.name ?? recipe.title ?? "", // handle different name fields
    CookTime: recipe.CookTime ?? recipe.cook_time ?? "",
    PrepTime: recipe.PrepTime ?? recipe.prep_time ?? "",
    TotalTime: recipe.TotalTime ?? recipe.total_time ?? "",
    RecipeIngredientParts: recipe.RecipeIngredientParts ?? recipe.ingredients ?? [],
    RecipeInstructions: recipe.RecipeInstructions ?? recipe.instructions ?? [],
    Calories: recipe.Calories ?? recipe.calories ?? 0,
    FatContent: recipe.FatContent ?? recipe.fat ?? 0,
    SaturatedFatContent: recipe.SaturatedFatContent ?? recipe.saturated_fat ?? 0,
    CholesterolContent: recipe.CholesterolContent ?? recipe.cholesterol ?? 0,
    SodiumContent: recipe.SodiumContent ?? recipe.sodium ?? 0,
    CarbohydrateContent: recipe.CarbohydrateContent ?? recipe.carbs ?? recipe.carbohydrates ?? 0,
    FiberContent: recipe.FiberContent ?? recipe.fiber ?? 0,
    SugarContent: recipe.SugarContent ?? recipe.sugar ?? 0,
    ProteinContent: recipe.ProteinContent ?? recipe.protein ?? 0,
  };

  console.log("Processed recipe:", processedRecipe);
  return processedRecipe;
};

export default attachImageLink;