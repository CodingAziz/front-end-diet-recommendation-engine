/* eslint-disable @typescript-eslint/no-explicit-any */
export const RecipeModal = ({ recipe, onClose }: any) => {
  if (!recipe) return null;

  const ingredients = recipe.RecipeIngredientParts.split(",").map((i: string) => i.trim());
  const instructions = recipe.RecipeInstructions.split(/,\s*(?=[A-Z])/);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl p-6">

        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">{recipe.Name}</h2>
          <button onClick={onClose} className="text-gray-500">✕</button>
        </div>

        {/* Nutrition */}
        <div className="grid grid-cols-2 gap-2 text-sm mb-4">
          <p>Calories: {recipe.Calories}</p>
          <p>Protein: {recipe.ProteinContent}g</p>
          <p>Fat: {recipe.FatContent}g</p>
          <p>Carbs: {recipe.CarbohydrateContent}g</p>
        </div>

        {/* Ingredients */}
        <div className="mb-4">
          <h3 className="font-semibold mb-2">Ingredients</h3>
          <ul className="list-disc list-inside text-sm">
            {ingredients.map((i: string, idx: number) => (
              <li key={idx}>{i}</li>
            ))}
          </ul>
        </div>

        {/* Instructions */}
        <div>
          <h3 className="font-semibold mb-2">Instructions</h3>
          <ol className="list-decimal list-inside text-sm">
            {instructions.map((i: string, idx: number) => (
              <li key={idx}>{i}</li>
            ))}
          </ol>
        </div>

      </div>
    </div>
  );
};