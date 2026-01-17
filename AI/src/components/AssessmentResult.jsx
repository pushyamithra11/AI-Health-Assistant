// import React from 'react';

// const AssessmentResult = ({ result, activeTab, latency }) => {
//   if (!result) return null;

//   return (
//     <div className="mt-10 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
//       {/* Urgency Alert */}
//       {(result.urgency === 'High' || result.emergency) && (
//         <div className="bg-orange-100 border-2 border-orange-200 text-orange-700 p-5 rounded-3xl font-black text-center flex items-center justify-center gap-3 animate-pulse">
//           <span className="text-2xl">⚠️</span> URGENT CARE RECOMMENDED
//         </div>
//       )}

//       {/* Summary Box */}
//       <section className={`p-6 rounded-[2.5rem] border-2 relative ${activeTab === 'health' ? 'bg-blue-50/50 border-blue-100' : 'bg-purple-50/50 border-purple-100'}`}>
//         <h3 className="font-black text-gray-400 text-[10px] uppercase tracking-widest mb-3">AI Clinical Summary</h3>
//         <p className="text-gray-800 font-medium text-lg leading-snug italic">"{result.summary}"</p>
        
//         {latency !== null && (
//           <div className="mt-4 flex items-center gap-2">
//             <span className="text-[10px] font-black text-gray-400 uppercase tracking-tighter">
//               ⚡ {latency > 1000 ? `Analyzed in ${(latency / 1000).toFixed(2)}s` : `Analyzed in ${latency.toFixed(0)}ms`}
//             </span>
//             {latency < 100 && (
//               <span className="text-[9px] font-black text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded-lg uppercase tracking-widest">Cached</span>
//             )}
//           </div>
//         )}
//       </section>

//       {/* Grid: Conditions & Specialist */}
//       <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
//         <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
//           <h4 className="font-bold text-gray-400 text-[10px] uppercase tracking-widest mb-4">Possible Conditions</h4>
//           <div className="flex flex-wrap gap-2">
//             {result.possible_conditions?.map((item, i) => (
//               <span key={i} className="text-[10px] bg-gray-50 border border-gray-100 px-3 py-1.5 rounded-full text-gray-700 font-black">{item}</span>
//             ))}
//           </div>
//         </div>

//         <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex flex-col items-center text-center">
//           <h4 className="font-bold text-gray-400 text-[10px] uppercase tracking-widest mb-2">Primary Specialist</h4>
//           <p className="text-2xl font-black text-gray-800 tracking-tighter">{result.specialist}</p>
//           <div className={`mt-2 text-[9px] font-black px-2 py-1 rounded-lg border ${result.urgency === 'High' ? 'text-red-500 border-red-100 bg-red-50' : 'text-yellow-600 border-yellow-100 bg-yellow-50'}`}>
//             {result.urgency.toUpperCase()} PRIORITY
//           </div>
//         </div>
//       </div>

//       {/* Advice Section */}
//       {result.advice && result.advice.length > 0 && (
//         <div className="bg-emerald-50/50 border-2 border-emerald-100 p-6 rounded-3xl">
//           <h4 className="text-emerald-800 font-black text-xs uppercase tracking-widest mb-3">Advice & Next Steps</h4>
//           <ul className="space-y-2">
//             {result.advice.map((a, i) => (
//               <li key={i} className="text-emerald-900 text-sm font-medium flex gap-2">
//                 <span className="text-emerald-400 font-bold">✓</span> {a}
//               </li>
//             ))}
//           </ul>
//         </div>
//       )}
//     </div>
//   );
// };

// export default AssessmentResult;

import React from 'react';

const AssessmentResult = ({ result, activeTab, latency }) => {
  if (!result) return null;

  return (
    <div className="mt-8 space-y-6 animate-in fade-in duration-500">
      {/* Urgency Alert - Minimalist Style */}
      {(result.urgency === 'High' || result.emergency) && (
        <div className="border border-red-200 bg-red-50/30 text-red-600 p-4 text-xs font-bold text-center tracking-widest uppercase">
          ⚠️ Priority: Urgent Medical Attention Required
        </div>
      )}

      {/* Clinical Summary */}
      <section className="border-l-2 border-black pl-4 py-2">
        <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Clinical Summary</h3>
        <p className="text-gray-800 text-base leading-relaxed italic">"{result.summary}"</p>
        
        {latency !== null && (
          <div className="mt-2 text-[9px] font-bold text-gray-500 uppercase tracking-tighter">
            Processed in {latency.toFixed(0)}ms {latency < 100 && "• (Cached)"}
          </div>
        )}
      </section>

      {/* Detail Grid */}
      <div className="grid grid-cols-2 gap-4">
        <div className="border border-gray-200 p-4">
          <h4 className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-3">Conditions</h4>
          <div className="flex flex-wrap gap-1">
            {result.possible_conditions?.map((item, i) => (
              <span key={i} className="text-[10px] font-bold text-gray-700 bg-gray-100 px-2 py-0.5 rounded-sm">{item}</span>
            ))}
          </div>
        </div>

        <div className="border border-gray-200 p-4 flex flex-col justify-center items-center">
          <h4 className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Recommended</h4>
          <p className="text-lg font-black text-gray-900 tracking-tighter">{result.specialist}</p>
        </div>
      </div>

      {/* Advice List */}
      {result.advice && (
        <div className="bg-gray-50 border border-gray-200 p-4">
          <h4 className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2">Next Steps</h4>
          <ul className="space-y-1">
            {result.advice.map((a, i) => (
              <li key={i} className="text-xs text-gray-600 flex gap-2">
                <span className="text-black font-bold">/</span> {a}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default AssessmentResult;