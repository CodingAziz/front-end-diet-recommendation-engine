import { CachedRecommendation, PredictRequest, Recipe } from "../types";

const SESSION_KEY = "diet-recommendation-session";
const CACHE_KEY = "diet-recommendation-cache";
const MAX_CACHE_ITEMS = 8;

export function getSessionId(): string {
  if (typeof window === "undefined") {
    return "browser-session";
  }

  const existing = window.localStorage.getItem(SESSION_KEY);
  if (existing) {
    return existing;
  }

  const newId =
    typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
      ? crypto.randomUUID()
      : `session_${Math.random().toString(36).slice(2)}_${Date.now()}`;

  window.localStorage.setItem(SESSION_KEY, newId);
  return newId;
}

export function makeCacheKey(request: PredictRequest): string {
  return JSON.stringify({
    nutrition_input: request.nutrition_input,
    ingredients: request.ingredients,
    bmi: request.bmi,
    goal: request.goal,
    metric: request.metric,
    params: request.params,
  });
}

export function getCachedRecommendation(key: string): Recipe[] | null {
  try {
    const raw = window.localStorage.getItem(CACHE_KEY);
    if (!raw) {
      return null;
    }

    const parsed: CachedRecommendation[] = JSON.parse(raw);
    const entry = parsed.find((item) => item.key === key);
    return entry?.recipes ?? null;
  } catch {
    return null;
  }
}

export function setCachedRecommendation(
  key: string,
  request: PredictRequest,
  recipes: Recipe[]
): void {
  try {
    const raw = window.localStorage.getItem(CACHE_KEY);
    const existing: CachedRecommendation[] = raw ? JSON.parse(raw) : [];
    const filtered = existing.filter((item) => item.key !== key);
    const next: CachedRecommendation[] = [
      {
        key,
        request,
        recipes,
        createdAt: new Date().toISOString(),
      },
      ...filtered,
    ].slice(0, MAX_CACHE_ITEMS);
    window.localStorage.setItem(CACHE_KEY, JSON.stringify(next));
  } catch {
    // ignore localStorage failures
  }
}

export function getRecentRecommendations(): CachedRecommendation[] {
  try {
    const raw = window.localStorage.getItem(CACHE_KEY);
    return raw ? (JSON.parse(raw) as CachedRecommendation[]) : [];
  } catch {
    return [];
  }
}
