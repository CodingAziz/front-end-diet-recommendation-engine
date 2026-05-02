/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  PredictRequest,
  PredictResponse,
} from "../types";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "";

const buildRequest = async <T>(path: string, options: RequestInit = {}) => {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
    },
    ...options,
  });

  if (!response.ok) {
    const errorText = await response.text();

    try {
      const parsed = JSON.parse(errorText);
      const detail = parsed.detail || parsed.message || errorText;
      throw new Error(`API request failed (${response.status}): ${JSON.stringify(detail)}`);
    } catch {
      throw new Error(`API request failed (${response.status}): ${errorText}`);
    }
  }

  return (await response.json()) as T;
};

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

  const requestBody = {
    nutrition_input: payload.nutrition_input,
    bmi: payload.bmi,
    goal: payload.goal,
    metric: payload.metric,
    ingredients: payload.ingredients ?? [],
  };

  console.log("Sending predict request:", requestBody);

  const response = await buildRequest<PredictResponse>("/predictions/predict", {
    method: "POST",
    body: JSON.stringify(requestBody),
  });

  console.log("Received predict response:", response);
  return response;
}
