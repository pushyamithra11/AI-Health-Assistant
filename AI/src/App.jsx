
// import { useState } from "react";
// import axios from "axios";
// import AuthPage from "./components/AuthPage";
// import Navbar from "./components/Navbar";
// import TriageForm from "./components/TriageForm";
// import AssessmentResult from "./components/AssessmentResult";
// import HospitalCard from "./components/HospitalCard";

// const API_BASE_URL = "http://127.0.0.1:8000/api";

// const App = () => {
//   const [user, setUser] = useState(null);
//   const [activeTab, setActiveTab] = useState("health");
//   const [symptoms, setSymptoms] = useState("");
//   const [result, setResult] = useState(null);
//   const [hospitals, setHospitals] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [searchLoading, setSearchLoading] = useState(false);
//   const [error, setError] = useState("");
//   const [locError, setLocError] = useState("");
//   const [latency, setLatency] = useState(null);

//   const switchTab = (tab) => {
//     setActiveTab(tab);
//     setResult(null);
//     setHospitals([]);
//     setSymptoms("");
//     setError("");
//     setLocError("");
//     setLatency(null);
//   };

//  // --- UPDATED LOGIC: Capture GPS BEFORE the AI call ---
//   const getAiAssessment = async () => {
//     if (!symptoms.trim()) {
//       setError("Please describe your symptoms first.");
//       return;
//     }

//     setLoading(true);
//     setError("");
//     setResult(null);
//     setHospitals([]);

//     // Check if browser supports Geolocation
//     if (navigator.geolocation) {
//       navigator.geolocation.getCurrentPosition(
//         (pos) => {
//           // Success: Call backend with real GPS
//           performAiRequest(pos.coords.latitude, pos.coords.longitude);
//         },
//         () => {
//           // User denied or error: Call backend with 0,0 (IP fallback)
//           performAiRequest(0, 0);
//         },
//         { timeout: 5000 }
//       );
//     } else {
//       // No browser support
//       performAiRequest(0, 0);
//     }
//   };

//   const performAiRequest = async (lat, lon) => {
//     const endpoint = activeTab === "mental" 
//       ? `${API_BASE_URL}/mental-health/analyze` 
//       : `${API_BASE_URL}/hospitals/nearby`;

//     try {
//       const response = await axios.post(endpoint, {
//         latitude: parseFloat(lat),
//         longitude: parseFloat(lon),
//         symptoms: symptoms
//       });
      
//       setResult(response.data.triage);
//       setLatency(response.data.latency_ms);
      
//       // OPTIONAL: Automatically show the closest hospitals immediately
//       if (response.data.hospitals) {
//         setHospitals(response.data.hospitals);
//       }
//     } catch (err) {
//       setError("AI Engine is unavailable. Please try again later.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   // --- LOGIC FIX: CAPTURES REAL GPS BEFORE CALLING BACKEND ---
//   const locateSpecialist = () => {
//     if (!navigator.geolocation) {
//       setLocError("GPS is not supported by your browser.");
//       return;
//     }

//     setSearchLoading(true);
//     setLocError("");

//     navigator.geolocation.getCurrentPosition(
//       async (pos) => {
//         // Success: Use actual GPS coordinates
//         await fetchNearbyFacilities(pos.coords.latitude, pos.coords.longitude);
//       },
//       async (err) => {
//         // Fallback: Use 0,0 (Backend will try IP-based location)
//         console.warn("Location denied, falling back to IP tracking");
//         await fetchNearbyFacilities(0, 0);
//       },
//       { enableHighAccuracy: true, timeout: 10000 }
//     );
//   };

//   const fetchNearbyFacilities = async (lat, lon) => {
//     const endpoint = activeTab === "mental" 
//       ? `${API_BASE_URL}/mental-health/analyze` 
//       : `${API_BASE_URL}/hospitals/nearby`;

//     try {
//       const response = await axios.post(endpoint, {
//         latitude: parseFloat(lat),
//         longitude: parseFloat(lon),
//         symptoms: symptoms // Keeps context of the previous AI analysis
//       });
      
//       // The backend now returns sorted hospitals with distance_km calculated
//       setHospitals(response.data.hospitals || []);
//     } catch (err) {
//       setLocError("Could not retrieve nearby facilities.");
//     } finally {
//       setSearchLoading(false);
//     }
//   };

//   if (!user) return <AuthPage onLoginSuccess={(username) => setUser(username)} />;

//   return (
//     <div className="min-h-screen bg-[#fafafa] font-sans selection:bg-blue-100">
//       <Navbar user={user} onLogout={() => setUser(null)} />
      
//       <main className="py-10 px-4 flex justify-center">
//         <div className="w-full max-w-[600px] bg-white border border-gray-300 rounded-sm p-8 shadow-sm">
//           <header className="text-center mb-8">
//             <h1 className="text-4xl font-serif italic text-gray-800 tracking-tighter">SmartHealth</h1>
//           </header>

//           <nav className="flex border-b border-gray-200 mb-8">
//             <button 
//               onClick={() => switchTab("health")} 
//               className={`flex-1 py-3 text-[10px] font-black uppercase tracking-[0.2em] transition-all ${activeTab === "health" ? "border-b-2 border-black text-black" : "text-gray-400"}`}
//             >
//               Physical Health
//             </button>
//             <button 
//               onClick={() => switchTab("mental")} 
//               className={`flex-1 py-3 text-[10px] font-black uppercase tracking-[0.2em] transition-all ${activeTab === "mental" ? "border-b-2 border-black text-black" : "text-gray-400"}`}
//             >
//               Mental Wellness
//             </button>
//           </nav>

//           <TriageForm 
//             symptoms={symptoms} 
//             setSymptoms={setSymptoms} 
//             activeTab={activeTab} 
//             loading={loading} 
//             onAnalyze={getAiAssessment} 
//           />

//           {error && <div className="mt-4 text-red-500 text-[10px] font-bold uppercase text-center">{error}</div>}

//           {result && (
//             <div className="animate-in fade-in duration-700">
//               <AssessmentResult result={result} activeTab={activeTab} latency={latency} />
              
//               <div className="mt-10 pt-8 border-t border-gray-100">
//                 <button 
//                   onClick={locateSpecialist} 
//                   disabled={searchLoading} 
//                   className="w-full bg-[#0095f6] hover:bg-[#1877f2] text-white py-3 rounded-lg font-bold text-sm transition-all disabled:bg-blue-200 active:scale-95 shadow-md"
//                 >
//                   {searchLoading ? "Scanning Local Area..." : `Find Nearby ${result.specialist}s`}
//                 </button>
//                 {locError && <p className="text-red-400 text-[10px] font-bold text-center mt-2">{locError}</p>}
//               </div>

//               <div className="mt-6 space-y-2">
//                 {hospitals.map((h, i) => (
//                   <HospitalCard key={i} hospital={h} />
//                 ))}
//               </div>
//             </div>
//           )}
//         </div>
//       </main>
//     </div>
//   );
// };

// export default App;

import { useState } from "react";
import axios from "axios";
import AuthPage from "./components/AuthPage";
import Navbar from "./components/Navbar";
import TriageForm from "./components/TriageForm";
import AssessmentResult from "./components/AssessmentResult";
import HospitalCard from "./components/HospitalCard";

const API_BASE_URL = "http://127.0.0.1:8000/api";

const App = () => {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState("health");
  const [symptoms, setSymptoms] = useState("");
  const [result, setResult] = useState(null);
  const [hospitals, setHospitals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [error, setError] = useState("");
  const [locError, setLocError] = useState("");
  const [latency, setLatency] = useState(null);

  // --- NEW HELPER: Format Latency for Display ---
  const formatLatency = (ms) => {
    if (!ms) return "";
    if (ms < 1000) return `${Math.round(ms)}ms`;
    return `${(ms / 1000).toFixed(2)}s`;
  };

  const switchTab = (tab) => {
    setActiveTab(tab);
    setResult(null);
    setHospitals([]);
    setSymptoms("");
    setError("");
    setLocError("");
    setLatency(null);
  };

  // --- UPDATED LOGIC: Capture GPS BEFORE the AI call ---
  const getAiAssessment = async () => {
    if (!symptoms.trim()) {
      setError("Please describe your symptoms first.");
      return;
    }

    setLoading(true);
    setError("");
    setResult(null);
    setHospitals([]);

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          performAiRequest(pos.coords.latitude, pos.coords.longitude);
        },
        () => {
          performAiRequest(0, 0);
        },
        { timeout: 5000 }
      );
    } else {
      performAiRequest(0, 0);
    }
  };

  const performAiRequest = async (lat, lon) => {
    const endpoint = activeTab === "mental" 
      ? `${API_BASE_URL}/mental-health/analyze` 
      : `${API_BASE_URL}/hospitals/nearby`;

    try {
      const response = await axios.post(endpoint, {
        latitude: parseFloat(lat),
        longitude: parseFloat(lon),
        symptoms: symptoms
      });
      
      setResult(response.data.triage);
      setLatency(response.data.latency_ms);
      
      if (response.data.hospitals) {
        setHospitals(response.data.hospitals);
      }
    } catch (err) {
      setError("AI Engine is unavailable. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const locateSpecialist = () => {
    if (!navigator.geolocation) {
      setLocError("GPS is not supported by your browser.");
      return;
    }

    setSearchLoading(true);
    setLocError("");

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        await fetchNearbyFacilities(pos.coords.latitude, pos.coords.longitude);
      },
      async (err) => {
        console.warn("Location denied, falling back to IP tracking");
        await fetchNearbyFacilities(0, 0);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const fetchNearbyFacilities = async (lat, lon) => {
    const endpoint = activeTab === "mental" 
      ? `${API_BASE_URL}/mental-health/analyze` 
      : `${API_BASE_URL}/hospitals/nearby`;

    try {
      const response = await axios.post(endpoint, {
        latitude: parseFloat(lat),
        longitude: parseFloat(lon),
        symptoms: symptoms 
      });
      
      setHospitals(response.data.hospitals || []);
    } catch (err) {
      setLocError("Could not retrieve nearby facilities.");
    } finally {
      setSearchLoading(false);
    }
  };

  if (!user) return <AuthPage onLoginSuccess={(username) => setUser(username)} />;

  return (
    <div className="min-h-screen bg-[#fafafa] font-sans selection:bg-blue-100">
      <Navbar user={user} onLogout={() => setUser(null)} />
      
      <main className="py-10 px-4 flex justify-center">
        <div className="w-full max-w-[600px] bg-white border border-gray-300 rounded-sm p-8 shadow-sm">
          <header className="text-center mb-8">
            <h1 className="text-4xl font-serif italic text-gray-800 tracking-tighter">SmartHealth</h1>
          </header>

          <nav className="flex border-b border-gray-200 mb-8">
            <button 
              onClick={() => switchTab("health")} 
              className={`flex-1 py-3 text-[10px] font-black uppercase tracking-[0.2em] transition-all ${activeTab === "health" ? "border-b-2 border-black text-black" : "text-gray-400"}`}
            >
              Physical Health
            </button>
            <button 
              onClick={() => switchTab("mental")} 
              className={`flex-1 py-3 text-[10px] font-black uppercase tracking-[0.2em] transition-all ${activeTab === "mental" ? "border-b-2 border-black text-black" : "text-gray-400"}`}
            >
              Mental Wellness
            </button>
          </nav>

          <TriageForm 
            symptoms={symptoms} 
            setSymptoms={setSymptoms} 
            activeTab={activeTab} 
            loading={loading} 
            onAnalyze={getAiAssessment} 
          />

          {error && <div className="mt-4 text-red-500 text-[10px] font-bold uppercase text-center">{error}</div>}

          {result && (
            <div className="animate-in fade-in duration-700">
              {/* --- LATENCY DISPLAY INTEGRATED BELOW --- */}
              <div className="relative">
                <AssessmentResult result={result} activeTab={activeTab} latency={latency} />
                {latency && (
                  <div className="absolute top-2 right-2 flex items-center gap-1.5">
                    <span className={`w-1.5 h-1.5 rounded-full ${latency < 500 ? 'bg-green-500 animate-pulse' : 'bg-blue-400'}`}></span>
                    <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">
                      {latency < 500 ? 'Cached' : 'Generated'} in {formatLatency(latency)}
                    </span>
                  </div>
                )}
              </div>
              
              <div className="mt-10 pt-8 border-t border-gray-100">
                <button 
                  onClick={locateSpecialist} 
                  disabled={searchLoading} 
                  className="w-full bg-[#0095f6] hover:bg-[#1877f2] text-white py-3 rounded-lg font-bold text-sm transition-all disabled:bg-blue-200 active:scale-95 shadow-md"
                >
                  {searchLoading ? "Scanning Local Area..." : `Find Nearby ${result.specialist}s`}
                </button>
                {locError && <p className="text-red-400 text-[10px] font-bold text-center mt-2">{locError}</p>}
              </div>

              <div className="mt-6 space-y-2">
                {hospitals.map((h, i) => (
                  <HospitalCard key={i} hospital={h} />
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default App;