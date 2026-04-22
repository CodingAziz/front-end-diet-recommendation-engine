import React, { useState } from "react";
import { submitRecommendationStats } from "../api/predict";
import {
  GoalOption,
  MetricOption,
  RecommendationStatsRequest,
  RecommendationStatsResponse,
} from "../types";

const RecommendationStatsPanel: React.FC = () => {
  const [recipeId, setRecipeId] = useState("");
  const [model, setModel] = useState("");
  const [goal, setGoal] = useState<GoalOption>(GoalOption.Maintenance);
  const [metric, setMetric] = useState<MetricOption>(MetricOption.NutritionalMae);
  const [status, setStatus] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState<RecommendationStatsResponse | null>(null);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    setStatus("");

    const payload: RecommendationStatsRequest = {
      recipe_id: recipeId || undefined,
      model: model || undefined,
      goal,
      metric,
    };

    try {
      const response = await submitRecommendationStats(payload);
      setStats(response);
      setStatus("Analytics request succeeded.");
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unexpected error.";
      setError(errorMessage);
      setStats(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-3xl p-6 shadow-sm">
      <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-4">Recommendation analytics</h2>
      <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
        Submit recommendation metadata and surface key stats returned by the backend.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="space-y-2 text-sm text-slate-700 dark:text-slate-200">
            Recipe ID
            <input
              value={recipeId}
              onChange={(event) => setRecipeId(event.target.value)}
              className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
              placeholder="Optional"
            />
          </label>
          <label className="space-y-2 text-sm text-slate-700 dark:text-slate-200">
            Model
            <input
              value={model}
              onChange={(event) => setModel(event.target.value)}
              className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
              placeholder="Optional"
            />
          </label>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="space-y-2 text-sm text-slate-700 dark:text-slate-200">
            Goal
            <select
              value={goal}
              onChange={(event) => setGoal(event.target.value as GoalOption)}
              className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
            >
              <option value={GoalOption.Maintenance}>Maintenance</option>
              <option value={GoalOption.WeightLoss}>Weight loss</option>
              <option value={GoalOption.MuscleGain}>Muscle gain</option>
            </select>
          </label>
          <label className="space-y-2 text-sm text-slate-700 dark:text-slate-200">
            Metric
            <select
              value={metric}
              onChange={(event) => setMetric(event.target.value as MetricOption)}
              className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
            >
              <option value={MetricOption.NutritionalMae}>Nutritional MAE</option>
              <option value={MetricOption.DiversityScore}>Diversity score</option>
            </select>
          </label>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="rounded-3xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-60"
        >
          {loading ? "Requesting analytics…" : "Submit analytics request"}
        </button>
      </form>

      {status && <p className="mt-4 text-sm text-emerald-700">{status}</p>}
      {error && <p className="mt-4 text-sm text-rose-600">{error}</p>}

      {stats ? (
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-950">
            <p className="text-sm text-slate-500">Total recommendations</p>
            <p className="mt-2 text-2xl font-semibold text-slate-900 dark:text-slate-100">{stats.total_recommendations}</p>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-950">
            <p className="text-sm text-slate-500">Average rating</p>
            <p className="mt-2 text-2xl font-semibold text-slate-900 dark:text-slate-100">{stats.average_rating.toFixed(1)}</p>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-950">
            <p className="text-sm text-slate-500">Helpful rate</p>
            <p className="mt-2 text-2xl font-semibold text-slate-900 dark:text-slate-100">{(stats.helpful_rate * 100).toFixed(0)}%</p>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-950">
            <p className="text-sm text-slate-500">Top models</p>
            <p className="mt-2 text-sm font-semibold text-slate-900 dark:text-slate-100">{stats.top_models.join(", ") || "—"}</p>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default RecommendationStatsPanel;
