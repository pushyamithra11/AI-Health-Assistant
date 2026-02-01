



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
            Processed in {latency.toFixed(0)}ms {latency < 100 && "• (Cached)" }
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

