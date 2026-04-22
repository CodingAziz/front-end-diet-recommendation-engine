import React, { useEffect, useMemo, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import {
  getFeatureImportance,
  getModelsInfo,
  getModelsPerformance,
} from "../api/predict";
import { FeatureImportanceResponse, ModelPerformance, MetricOption } from "../types";

const palette = ["#10b981", "#3b82f6", "#f59e0b", "#8b5cf6", "#ec4899"];

const ModelPerformanceDashboard: React.FC = () => {
  const [models, setModels] = useState<string[]>([]);
  const [performance, setPerformance] = useState<ModelPerformance[]>([]);
  const [selectedModel, setSelectedModel] = useState<string>("");
  const [selectedMetric, setSelectedMetric] = useState<MetricOption>(MetricOption.NutritionalMae);
  const [featureImportance, setFeatureImportance] = useState<FeatureImportanceResponse | null>(null);
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [featureLoading, setFeatureLoading] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError("");

      try {
        const info = await getModelsInfo();
        const perf = await getModelsPerformance();
        const modelList = info.models || info.available_models || perf.map((item) => item.model);
        setModels(modelList);
        setPerformance(perf);
        setSelectedModel(modelList[0] || perf[0]?.model || "");
      } catch (err) {
        console.error("Model performance load failed:", err);
        const errorMessage = err instanceof Error ? err.message : "Unable to load model performance.";
        setError(`Unable to load model performance. ${errorMessage}`);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const bestForAccuracy = useMemo(() => {
    if (performance.length === 0) {
      return null;
    }
    return performance.reduce((best, current) =>
      best.nutritional_mae < current.nutritional_mae ? best : current,
    );
  }, [performance]);

  const bestForDiversity = useMemo(() => {
    if (performance.length === 0) {
      return null;
    }
    return performance.reduce((best, current) =>
      best.diversity_score > current.diversity_score ? best : current,
    );
  }, [performance]);

  useEffect(() => {
    if (!selectedModel) {
      return;
    }

    setFeatureLoading(true);
    setFeatureImportance(null);

    getFeatureImportance({ model: selectedModel, metric: selectedMetric })
      .then(setFeatureImportance)
      .catch((err) => {
        console.error(err);
        setFeatureImportance(null);
      })
      .finally(() => {
        setFeatureLoading(false);
      });
  }, [selectedModel, selectedMetric]);

  if (error) {
    return (
      <div className="bg-rose-50 border border-rose-200 rounded-3xl p-6 text-rose-700">
        {error}
      </div>
    );
  }

  if (loading) {
    return (
      <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-3xl p-6 shadow-sm">
        <p className="text-sm text-slate-500 dark:text-slate-400">Loading model performance…</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-3xl p-6 shadow-sm">
          <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-3">Best for accuracy</h3>
          <p className="text-slate-600 dark:text-slate-300">{bestForAccuracy?.model ?? "—"}</p>
          <p className="text-sm text-slate-500 dark:text-slate-400">MAE: {bestForAccuracy?.nutritional_mae ?? "—"}</p>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-3xl p-6 shadow-sm">
          <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-3">Best for diversity</h3>
          <p className="text-slate-600 dark:text-slate-300">{bestForDiversity?.model ?? "—"}</p>
          <p className="text-sm text-slate-500 dark:text-slate-400">Score: {bestForDiversity?.diversity_score ?? "—"}</p>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-3xl p-6 shadow-sm">
          <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-3">Current selection</h3>
          <div className="space-y-2 text-sm text-slate-500 dark:text-slate-400">
            <div>Model: {selectedModel || "Loading..."}</div>
            <div>Metric: {selectedMetric}</div>
          </div>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-3xl p-6 shadow-sm">
          <div className="flex flex-wrap gap-3 items-center justify-between mb-4">
            <div>
              <p className="font-semibold text-slate-900 dark:text-slate-100">Choose Model</p>
              <p className="text-sm text-slate-500 dark:text-slate-400">Select a backend model to inspect.</p>
            </div>
            <select
              value={selectedModel}
              onChange={(event) => setSelectedModel(event.target.value)}
              className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm text-slate-900 outline-none transition dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
            >
              {models.map((model) => (
                <option key={model} value={model}>
                  {model}
                </option>
              ))}
            </select>
          </div>

          <div className="flex gap-3 items-center">
            <label className="text-sm font-semibold text-slate-900 dark:text-slate-100">Metric</label>
            <select
              value={selectedMetric}
              onChange={(event) => setSelectedMetric(event.target.value as MetricOption)}
              className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm text-slate-900 outline-none transition dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
            >
              <option value={MetricOption.NutritionalMae}>Nutritional MAE</option>
              <option value={MetricOption.DiversityScore}>Diversity score</option>
            </select>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-3xl p-6 shadow-sm">
          <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-4">Model performance</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={performance} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="model" tick={{ fill: "#64748b", fontSize: 12 }} />
                <YAxis tick={{ fill: "#64748b", fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey={selectedMetric === MetricOption.NutritionalMae ? "nutritional_mae" : "diversity_score"} fill="#10b981">
                  {performance.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={palette[index % palette.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-3xl p-6 shadow-sm">
          <h4 className="font-semibold text-slate-900 dark:text-slate-100 mb-3">Model comparison table</h4>
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm text-slate-600 dark:text-slate-300">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-700">
                  <th className="px-3 py-3">Model</th>
                  <th className="px-3 py-3">MAE</th>
                  <th className="px-3 py-3">Diversity</th>
                  <th className="px-3 py-3">Latency</th>
                  <th className="px-3 py-3">Coverage</th>
                </tr>
              </thead>
              <tbody>
                {performance.map((item) => (
                  <tr key={item.model} className="border-b border-slate-100 dark:border-slate-800">
                    <td className="px-3 py-3 font-medium text-slate-900 dark:text-slate-100">{item.model}</td>
                    <td className="px-3 py-3">{item.nutritional_mae.toFixed(2)}</td>
                    <td className="px-3 py-3">{item.diversity_score.toFixed(2)}</td>
                    <td className="px-3 py-3">{item.latency_ms} ms</td>
                    <td className="px-3 py-3">{(item.coverage * 100).toFixed(0)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-3xl p-6 shadow-sm">
          <h4 className="font-semibold text-slate-900 dark:text-slate-100 mb-3">Feature importance</h4>
          {featureLoading ? (
            <p className="text-sm text-slate-500 dark:text-slate-400">Loading feature importance…</p>
          ) : featureImportance ? (
            <div className="space-y-3">
              <p className="text-sm text-slate-500 dark:text-slate-400">{featureImportance.methodology}</p>
              <div className="space-y-2">
                {featureImportance.features.map((feature) => (
                  <div key={feature.name} className="rounded-2xl border border-slate-200 dark:border-slate-700 p-3 bg-slate-50 dark:bg-slate-950">
                    <div className="flex justify-between text-sm text-slate-700 dark:text-slate-200">
                      <span>{feature.name}</span>
                      <span>{(feature.importance * 100).toFixed(0)}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-sm text-slate-500 dark:text-slate-400">Unable to load feature importance for {selectedModel || "..."}.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ModelPerformanceDashboard;
