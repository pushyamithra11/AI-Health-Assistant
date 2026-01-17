


// import React from 'react';

// const HospitalCard = ({ hospital }) => {
//   return (
//     <div className="py-4 border-b border-gray-100 flex justify-between items-center group">
//       <div className="flex-1 min-w-0">
//         <div className="flex items-center gap-2 mb-1">
//           <p className="font-bold text-sm text-gray-900 truncate uppercase tracking-tight">
//             {hospital.name}
//           </p>
//           {hospital.rating > 0 && (
//             <span className="text-[10px] font-bold text-orange-400">★{hospital.rating}</span>
//           )}
//         </div>
//         <p className="text-xs text-gray-400 truncate tracking-tight">{hospital.address}</p>
//         <p className="text-[10px] font-black text-blue-500 mt-1 uppercase">
//           {hospital.distance_km > 0 ? `${hospital.distance_km} KM AWAY` : "View on Map"}
//         </p>
//       </div>
//       <a 
//         href={hospital.maps_url} 
//         target="_blank" 
//         rel="noreferrer" 
//         className="ml-4 border border-gray-300 px-4 py-1.5 text-xs font-bold hover:bg-gray-50 transition-colors rounded-sm"
//       >
//         Directions
//       </a>
//     </div>
//   );
// };

// export default HospitalCard;

import React from 'react';

const HospitalCard = ({ hospital }) => {
  return (
    <div className="py-4 px-4 border border-gray-100 rounded-md mb-2 flex justify-between items-center group hover:border-gray-300 transition-all bg-[#fafafa]">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <p className="font-bold text-sm text-gray-900 truncate uppercase tracking-tight">
            {hospital.name}
          </p>
          {hospital.rating > 0 && (
            <div className="flex items-center text-[10px] font-bold text-orange-500">
              <span>★</span>
              <span>{hospital.rating}</span>
            </div>
          )}
        </div>
        
        <p className="text-[11px] text-gray-500 truncate tracking-tight mb-2">
          {hospital.address}
        </p>

        <div className="flex items-center gap-3">
          {/* DISTANCE BADGE */}
          <span className="text-[10px] font-black text-blue-600 bg-blue-50 px-2 py-0.5 rounded uppercase">
            {hospital.distance_km > 0 ? `${hospital.distance_km} KM` : "NEARBY"}
          </span>
          
          {/* SPECIALIST TAG */}
          <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">
            {hospital.available_specialist}
          </span>
        </div>
      </div>

      {/* DIRECTIONS BUTTON */}
      <a 
        href={hospital.maps_url} 
        target="_blank" 
        rel="noreferrer" 
        className="ml-4 bg-white border border-black text-black px-4 py-2 text-[10px] font-black uppercase hover:bg-black hover:text-white transition-all rounded-sm shadow-sm active:scale-95 whitespace-nowrap"
      >
        Get Directions
      </a>
    </div>
  );
};

export default HospitalCard;