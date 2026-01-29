import { GoogleGenAI, Type } from "@google/genai";
import { Recipe, NutritionValues } from "../types";

const ai = new GoogleGenAI({ 
  apiKey: import.meta.env.VITE_GEMINI_API_KEY
});

const recipeSchema = {
  type: Type.OBJECT,
  properties: {
    output: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          Name: { type: Type.STRING },
          image_link: { type: Type.STRING },
          CookTime: { type: Type.STRING },
          PrepTime: { type: Type.STRING },
          TotalTime: { type: Type.STRING },
          RecipeIngredientParts: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
          },
          RecipeInstructions: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
          },
          Calories: { type: Type.NUMBER },
          FatContent: { type: Type.NUMBER },
          SaturatedFatContent: { type: Type.NUMBER },
          CholesterolContent: { type: Type.NUMBER },
          SodiumContent: { type: Type.NUMBER },
          CarbohydrateContent: { type: Type.NUMBER },
          FiberContent: { type: Type.NUMBER },
          SugarContent: { type: Type.NUMBER },
          ProteinContent: { type: Type.NUMBER },
        },
        required: [
          "Name",
          "RecipeIngredientParts",
          "RecipeInstructions",
          "Calories",
        ],
      },
    },
  },
};

export async function generateRecipes(prompt: string): Promise<Recipe[]> {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: recipeSchema,
    },
  });

  try {
    const data = JSON.parse(response.text || '{"output": []}');
    return data.output.map((r: any) => ({
      ...r,
      image_link:
        r.image_link ||
        `https://picsum.photos/seed/${encodeURIComponent(r.Name)}/400/300`,
    }));
  } catch (e) {
    console.error("Failed to parse recipe JSON", e);
    return [];
  }
}

export async function getRecommendationsForMeal(
  mealName: string,
  calories: number,
): Promise<Recipe[]> {
  const prompt = `Generate 3 healthy recipe recommendations for ${mealName} with approximately ${calories} calories each. Include detailed nutritional values and instructions. Provide a placeholder image link using picsum.photos for each.`;
  return generateRecipes(prompt);
}

export async function getCustomRecommendations(
  nutrition: NutritionValues,
  count: number,
  ingredients: string,
): Promise<Recipe[]> {
  const prompt = `Generate ${count} recipe recommendations based on these nutritional targets: 
    Calories: ${nutrition.Calories}, Fat: ${nutrition.FatContent}g, Protein: ${nutrition.ProteinContent}g.
    Include these ingredients if possible: ${ingredients}.
    Provide a placeholder image link using picsum.photos for each.`;
  return generateRecipes(prompt);
}
