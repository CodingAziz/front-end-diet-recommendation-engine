// import React, { useEffect, useState } from "react";
// import { explainRecipe } from "../api/predict";
// import { ExplainResponse } from "../types";

// interface ExplainabilityPanelProps {
//   recipeId: string;
// }

// const ExplainabilityPanel: React.FC<ExplainabilityPanelProps> = ({ recipeId }) => {
//   const [explanation, setExplanation] = useState<ExplainResponse | null>(null);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState<string>("");

//   useEffect(() => {
//     if (!recipeId) {
//       return;
//     }

//     setLoading(true);
//     setError("");
//     explainRecipe(recipeId)
//       .then((response) => setExplanation(response))
//       .catch((err) => {
//         const errorMessage = err instanceof Error ? err.message : "Unable to load explanation.";
//         console.error(err);
//         setError(errorMessage);
//       })
//       .finally(() => setLoading(false));
//   }, [recipeId]);

//   if (!recipeId) {
//     return (
//       <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-3xl p-6">
//         <p className="text-sm text-slate-600 dark:text-slate-400">Select a recipe to see model explainability.</p>
//       </div>
//     );
//   }

//   return (
//     <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-3xl p-6 shadow-sm">
//       <div className="flex items-center justify-between mb-4">
//         <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">Explainability</h3>
//         {loading ? <span className="text-sm text-slate-500">Loading...</span> : null}
//       </div>

//       {error ? (
//         <p className="text-sm text-rose-500">{error}</p>
//       ) : explanation ? (
//         <div className="space-y-4">
//           <div className="text-sm text-slate-500 dark:text-slate-400">
//             Model: <span className="font-semibold text-slate-900 dark:text-slate-100">{explanation.model_used}</span>
//           </div>
//           <div className="text-sm text-slate-500 dark:text-slate-400">
//             Confidence: <span className="font-semibold text-emerald-600">{(explanation.confidence_score * 100).toFixed(0)}%</span>
//           </div>
//           <div className="space-y-3">
//             <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-200">Top influencing features</h4>
//             <div className="space-y-2">
//               {Object.entries(explanation.explanation || {}).map(([feature, value]) => (
//                 <div key={feature} className="rounded-2xl border border-slate-200 dark:border-slate-700 p-3 bg-slate-50 dark:bg-slate-950">
//                   <div className="flex justify-between text-sm text-slate-700 dark:text-slate-200">
//                     <span>{feature}</span>
//                     <span>{value}</span>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           </div>
//         </div>
//       ) : (
//         <p className="text-sm text-slate-500 dark:text-slate-400">Waiting for the backend explainability model.</p>
//       )}
//     </div>
//   );
// };

// export default ExplainabilityPanel;
