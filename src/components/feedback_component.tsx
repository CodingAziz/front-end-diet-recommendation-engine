// import React, { useState } from "react";
// import { submitFeedback } from "../api/predict";
// import { FeedbackRequest } from "../types";

// interface FeedbackComponentProps {
//   recipeId: string;
//   sessionId: string;
//   userId?: string;
// }

// const FeedbackComponent: React.FC<FeedbackComponentProps> = ({
//   recipeId,
//   sessionId,
//   userId = "anonymous",
// }) => {
//   const [rating, setRating] = useState(0);
//   const [wasHelpful, setWasHelpful] = useState<boolean | null>(null);
//   const [comments, setComments] = useState("");
//   const [status, setStatus] = useState<string>("");
//   const [statusType, setStatusType] = useState<"success" | "error" | "" >("");
//   const [submitting, setSubmitting] = useState(false);

//   const handleSubmit = async (event: React.FormEvent) => {
//     event.preventDefault();
//     setSubmitting(true);
//     setStatus("");
//     setStatusType("");

//     const payload: FeedbackRequest = {
//       user_id: userId,
//       recipe_id: recipeId,
//       rating,
//       was_helpful: wasHelpful ?? false,
//       comments,
//       session_id: sessionId,
//     };

//     try {
//       const result = await submitFeedback(payload);
//       setStatus(`Feedback submitted (${result.status}). Thank you!`);
//       setStatusType("success");
//       setComments("");
//       setRating(0);
//       setWasHelpful(null);
//     } catch (error) {
//       const errorMessage = error instanceof Error ? error.message : "Unable to send feedback. Please try again.";
//       setStatus(errorMessage);
//       setStatusType("error");
//       console.error(error);
//     } finally {
//       setSubmitting(false);
//     }
//   };

//   return (
//     <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-3xl p-6 shadow-sm">
//       <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-3">
//         Recipe Feedback
//       </h3>
//       <form onSubmit={handleSubmit} className="space-y-4">
//         <div>
//           <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300 mb-2">
//             <span>Rate this recipe</span>
//             <span className="text-xs text-emerald-600">(1-5)</span>
//           </div>
//           <div className="flex gap-1">
//             {Array.from({ length: 5 }, (_, index) => index + 1).map((value) => (
//               <button
//                 key={value}
//                 type="button"
//                 onClick={() => setRating(value)}
//                 className={`h-10 w-10 rounded-full transition ${
//                   rating >= value
//                     ? "bg-emerald-500 text-white"
//                     : "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400"
//                 }`}
//               >
//                 ★
//               </button>
//             ))}
//           </div>
//         </div>

//         <div className="space-y-2">
//           <div className="flex items-center justify-between text-sm text-slate-500 dark:text-slate-400">
//             <span>Was this helpful?</span>
//             <div className="flex gap-2">
//               {[
//                 { label: "Yes", value: true },
//                 { label: "No", value: false },
//               ].map((option) => (
//                 <button
//                   key={option.label}
//                   type="button"
//                   onClick={() => setWasHelpful(option.value)}
//                   className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
//                     wasHelpful === option.value
//                       ? "bg-emerald-600 text-white"
//                       : "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300"
//                   }`}
//                 >
//                   {option.label}
//                 </button>
//               ))}
//             </div>
//           </div>
//           <textarea
//             rows={4}
//             value={comments}
//             onChange={(event) => setComments(event.target.value)}
//             placeholder="Share what you liked or how we can improve..."
//             className="w-full rounded-3xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
//           />
//         </div>

//         <button
//           type="submit"
//           disabled={submitting}
//           className="w-full rounded-3xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white transition disabled:opacity-60"
//         >
//           {submitting ? "Sending feedback..." : "Submit feedback"}
//         </button>

//         {status ? (
//           <p className={`text-sm ${statusType === "error" ? "text-rose-600" : "text-emerald-700"}`}>
//             {status}
//           </p>
//         ) : null}
//       </form>
//     </div>
//   );
// };

// export default FeedbackComponent;
