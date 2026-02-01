import { PredictRequest, PredictResponse } from "../types";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export async function predictDiet(
  payload: PredictRequest
): Promise<PredictResponse> {
  if (!Array.isArray(payload.nutrition_input)) {
    throw new Error("nutrition_input must be an array");
  }

  if (payload.nutrition_input.length !== 9) {
    throw new Error(
      `nutrition_input must contain exactly 9 numbers, received ${payload.nutrition_input.length}`
    );
  }

  const response = await fetch(`${API_BASE_URL}/predict/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      nutrition_input: payload.nutrition_input,
      ingredients: payload.ingredients ?? [],
      params: payload.params ?? {
        n_neighbors: 5,
        return_distance: false,
      },
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `Prediction API failed (${response.status}): ${errorText}`
    );
  }

  return response.json();
}