import {
  FeedbackRequest,
  FeedbackResponse,
  ExplainResponse,
  FeatureImportanceRequest,
  FeatureImportanceResponse,
  HealthStatus,
  ModelInfoResponse,
  ModelPerformance,
  PredictRequest,
  PredictResponse,
  RecommendationStatsRequest,
  RecommendationStatsResponse,
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

  // Build request body with exact format expected by backend
  const requestBody = {
    nutrition_input: payload.nutrition_input,
    bmi: payload.bmi,
    goal: payload.goal,
    metric: payload.metric,
    ingredients: payload.ingredients ?? [],
  };

  console.log("Sending predict request:", requestBody);

  const response = await buildRequest<PredictResponse>("/predict/", {
    method: "POST",
    body: JSON.stringify(requestBody),
  });

  console.log("Received predict response:", response);
  return response;
}

export async function healthCheck(): Promise<HealthStatus> {
  return buildRequest<HealthStatus>("/health");
}

export async function getModelsInfo(): Promise<ModelInfoResponse> {
  return buildRequest<ModelInfoResponse>("/models/info");
}

export async function getModelsPerformance(): Promise<ModelPerformance[]> {
  const response = await buildRequest<any>("/models/performance");

  if (Array.isArray(response)) {
    return response;
  }

  if (response.models && typeof response.models === "object") {
    return Object.entries(response.models).map(([model, stats]) => {
      const typedStats = stats as Record<string, any>;
      return {
        model,
        nutritional_mae: typedStats.nutritional_mae,
        diversity_score: typedStats.diversity_score,
        latency_ms: typedStats.latency_ms,
        coverage: typedStats.coverage,
      } as ModelPerformance;
    });
  }

  throw new Error("Unexpected models performance response format");
}

export async function submitFeedback(
  payload: FeedbackRequest
): Promise<FeedbackResponse> {
  return buildRequest<FeedbackResponse>("/feedback/", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function explainRecipe(recipeId: string): Promise<ExplainResponse> {
  const requestBody = { recipe_id: recipeId };

  try {
    return await buildRequest<ExplainResponse>("/explain/", {
      method: "POST",
      body: JSON.stringify(requestBody),
    });
  } catch (error) {
    console.warn("POST /explain/ failed, falling back to GET /explain/{id}", error);
    return buildRequest<ExplainResponse>(`/explain/${encodeURIComponent(recipeId)}`);
  }
}

export async function submitRecommendationStats(
  payload: RecommendationStatsRequest
): Promise<RecommendationStatsResponse> {
  return buildRequest<RecommendationStatsResponse>("/analytics/recommendation-stats", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function getFeatureImportance(
  payload: FeatureImportanceRequest
): Promise<FeatureImportanceResponse> {
  return buildRequest<FeatureImportanceResponse>("/models/feature-importance", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}
