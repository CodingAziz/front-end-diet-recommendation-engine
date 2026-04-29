// import React, { useEffect, useState } from "react";
// import { healthCheck } from "../api/predict";
// import { HealthStatus } from "../types";
// import ModelPerformanceDashboard from "../components/model_performance";
// import RecommendationStatsPanel from "../components/recommendation_stats";

// const Dashboard: React.FC = () => {
//   const [health, setHealth] = useState<HealthStatus | null>(null);
//   const [error, setError] = useState<string>("");

//   useEffect(() => {
//     healthCheck()
//       .then(setHealth)
//       .catch((err) => {
//         console.error(err);
//         setError("Unable to retrieve system health.");
//       });
//   }, []);

//   return (
//     <div className="space-y-8">
//       <header className="mb-6">
//         <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
//           Diet Recommendation Dashboard
//         </h1>
//         <p className="text-slate-500 dark:text-slate-300">
//           Monitor backend health, compare models, and inspect explainability outputs.
//         </p>
//       </header>

//       <div className="grid lg:grid-cols-3 gap-6">
//         <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm">
//           <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-3">System health</h2>
//           {error ? (
//             <p className="text-sm text-rose-500">{error}</p>
//           ) : health ? (
//             <div className="space-y-3 text-sm text-slate-600 dark:text-slate-300">
//               <div>
//                 <span className="font-semibold text-slate-900 dark:text-slate-100">Status:</span> {health.status}
//               </div>
//               <div>
//                 <span className="font-semibold text-slate-900 dark:text-slate-100">Version:</span> {health.version ?? "unknown"}
//               </div>
//               <div>
//                 <span className="font-semibold text-slate-900 dark:text-slate-100">Timestamp:</span> {health.timestamp ?? "N/A"}
//               </div>
//             </div>
//           ) : (
//             <p className="text-sm text-slate-500 dark:text-slate-400">Checking the API health now…</p>
//           )}
//         </div>

//         <div className="lg:col-span-2 space-y-6">
//           <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm">
//             <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-3">Model performance overview</h2>
//             <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
//               Review predictions from available recommendation models, compare metrics, and see which model is strongest for accuracy or diversity.
//             </p>
//             <ModelPerformanceDashboard />
//           </div>

//           <RecommendationStatsPanel />
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Dashboard;
