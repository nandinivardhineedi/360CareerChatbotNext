'use client';
import { useEffect, useState } from "react";
import Link from "next/link";
import { Bot, Loader2, LayoutDashboard, MessageSquare, UserCircle } from "lucide-react";

export default function Dashboard() {
  const [profile, setProfile] = useState(null);
  const [roadmap, setRoadmap] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedProfile = localStorage.getItem("ai360_profile");

    if (storedProfile) {
      const parsedProfile = JSON.parse(storedProfile);
      setProfile(parsedProfile);

      // Fetch the personalized roadmap from the API
      fetch("/api/roadmap", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profile: parsedProfile }),
      })
      .then(res => res.json())
      .then(data => {
        setRoadmap(data.roadmap || "We couldn't generate a roadmap. Please try refining your goals in the chat.");
        setIsLoading(false);
      })
      .catch(error => {
        console.error("Failed to fetch roadmap:", error);
        setRoadmap("An error occurred while preparing your roadmap. Please try again later.");
        setIsLoading(false);
      });
    } else {
      setIsLoading(false);
    }
  }, []);

  return (
    // Themed background for the entire page
    <div className="bg-gradient-to-br from-blue-50 via-white to-teal-50 min-h-screen font-sans">
      
      {/* Themed Navigation Bar */}
      <header className="bg-white/80 backdrop-blur-lg border-b border-gray-200 sticky top-0 z-50">
        <nav className="container mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 p-2 rounded-md">
              <Bot size={24} className="text-white" />
            </div>
            <span className="font-semibold text-xl text-gray-800">AI 360 Career Mentor</span>
          </div>
          <div className="flex items-center gap-6">
            <Link href="/dashboard" className="flex items-center gap-2 text-blue-600 font-semibold">
              <LayoutDashboard size={20} />
              <span>Dashboard</span>
            </Link>
            <Link href="/chat" className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors font-medium">
              <MessageSquare size={20} />
              <span>Chat</span>
            </Link>
            <UserCircle size={28} className="text-gray-400" />
          </div>
        </nav>
      </header>

      <main className="container mx-auto px-6 py-12">
        {/* Main Content Card */}
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-gray-900">
            Welcome, {profile ? profile.name : 'User'} 👋
          </h1>
          <p className="text-gray-600 mt-2 text-lg">
            Your AI-powered career journey starts now.
          </p>

          {/* Roadmap Display Card */}
          <div className="mt-8 bg-white border border-gray-200 rounded-2xl shadow-xl overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-800">Your Personalized Roadmap</h2>
              <p className="text-sm text-gray-500 mt-1">This is a starting point. Refine it anytime using the Career Bot.</p>
            </div>
            
            <div className="p-8 min-h-[250px]">
              {isLoading ? (
                <div className="flex flex-col items-center justify-center h-full text-gray-500">
                  <Loader2 className="animate-spin text-blue-600 mb-4" size={32} />
                  <span className="font-medium text-lg">Preparing your roadmap...</span>
                </div>
              ) : (
                <div className="prose prose-blue max-w-none text-gray-800">
                  <pre className="font-sans whitespace-pre-wrap bg-transparent p-0">{roadmap}</pre>
                </div>
              )}
            </div>

            <div className="p-6 bg-gray-50/70 border-t border-gray-200 flex justify-end">
              <Link
                href="/chat"
                className="inline-flex items-center gap-2 px-5 py-3 rounded-lg bg-blue-600 text-white font-semibold shadow-md hover:bg-blue-700 transition-all transform hover:scale-105"
              >
                <Bot size={20} />
                Open Career Bot
              </Link>
            </div>
          </div>
        </div>
      </main>

      {/* Call to Action Section */}
      <section className="mt-16 bg-gradient-to-r from-blue-600 to-teal-500 py-20">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-4xl font-bold text-white">
            Ready to Transform Your Career?
          </h2>
          <p className="text-white/80 mt-4 text-lg max-w-2xl mx-auto">
            Join thousands of professionals who are already advancing their careers with AI guidance.
          </p>
          <div className="mt-8">
            <Link
              href="/onboarding"
              className="px-8 py-4 bg-white text-blue-600 font-bold rounded-lg shadow-xl hover:bg-gray-100 transition-all transform hover:scale-105 inline-block"
            >
              Get Started Free
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
















// 'use client';
// import { useEffect, useState } from "react";
// import Link from "next/link";
// import { Bot, Loader2 } from "lucide-react"; // Using icons for a better UI

// export default function Dashboard() {
//   // State to hold the user's profile data
//   const [profile, setProfile] = useState(null);
//   // State for the generated roadmap, with an initial loading state
//   const [roadmap, setRoadmap] = useState("");
//   const [isLoading, setIsLoading] = useState(true);

//   useEffect(() => {
//     // Retrieve the profile from localStorage when the component mounts
//     const storedProfile = localStorage.getItem("ai360_profile");

//     if (storedProfile) {
//       const parsedProfile = JSON.parse(storedProfile);
//       setProfile(parsedProfile);

//       // Fetch the personalized roadmap from the API
//       fetch("/api/roadmap", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ profile: parsedProfile }),
//       })
//       .then(res => res.json())
//       .then(data => {
//         setRoadmap(data.roadmap || "We couldn't generate a roadmap based on your profile. Please try refining your goals in the chat.");
//         setIsLoading(false); // Stop loading once data is fetched
//       })
//       .catch(error => {
//         console.error("Failed to fetch roadmap:", error);
//         setRoadmap("An error occurred while preparing your roadmap. Please try again later.");
//         setIsLoading(false); // Stop loading on error
//       });
//     } else {
//       // Handle case where there is no profile
//       setIsLoading(false);
//     }
//   }, []);

//   return (
//     <div className="w-full bg-gray-50 min-h-screen">
//       <main className="container mx-auto px-6 py-12">
//         {/* Welcome and Roadmap Section */}
//         <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-8">
//           <h1 className="text-3xl font-bold text-gray-900">
//             Welcome, {profile ? profile.name : ''} 👋
//           </h1>
//           <p className="text-gray-600 mt-2">
//             Here is a personalized starter roadmap based on your profile. You can refine it and ask questions in the chat.
//           </p>

//           <div className="mt-6 p-6 bg-gray-50 border border-gray-200 rounded-lg min-h-[200px]">
//             {isLoading ? (
//               <div className="flex items-center justify-center h-full">
//                 <Loader2 className="animate-spin text-blue-600 mr-3" size={24} />
//                 <span className="text-gray-600 font-medium">Preparing your roadmap...</span>
//               </div>
//             ) : (
//               <div className="whitespace-pre-wrap text-gray-800 font-mono text-sm leading-relaxed">
//                 {roadmap}
//               </div>
//             )}
//           </div>

//           <div className="mt-8">
//             <Link
//               href="/chat"
//               className="inline-flex items-center gap-2 px-5 py-3 rounded-lg bg-blue-600 text-white font-semibold shadow-md hover:bg-blue-700 transition-all transform hover:scale-105"
//             >
//               <Bot size={20} />
//               Open Career Bot
//             </Link>
//           </div>
//         </div>
//       </main>

//       {/* Call to Action Section */}
//       <section className="bg-gradient-to-r from-blue-500 to-teal-400 py-20">
//         <div className="container mx-auto px-6 text-center">
//           <h2 className="text-4xl font-bold text-white">
//             Ready to Transform Your Career?
//           </h2>
//           <p className="text-white/80 mt-4 text-lg max-w-2xl mx-auto">
//             Join thousands of professionals who are already advancing their careers with AI guidance
//           </p>
//           <div className="mt-8">
//             <Link
//               href="/onboarding"
//               className="px-8 py-3 bg-white text-blue-600 font-bold rounded-lg shadow-xl hover:bg-gray-100 transition-all transform hover:scale-105 inline-block"
//             >
//               Get Started Free
//             </Link>
//           </div>
//         </div>
//       </section>
//     </div>
//   );
// }
















// 'use client';
// import { useEffect, useState } from "react";
// import Link from "next/link";
// export default function Dashboard(){
//   const [profile,setProfile]=useState<any>(null);
//   const [roadmap,setRoadmap]=useState<string>("");
//   useEffect(()=>{
//     const p=localStorage.getItem("ai360_profile");
//     if(p){const parsed=JSON.parse(p);setProfile(parsed);
//       fetch("/api/roadmap",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({profile:parsed})})
//       .then(r=>r.json()).then(d=>setRoadmap(d.roadmap||""));
//     }
//   },[]);
//   return(<main className="container-max"><div className="card p-8 mt-8">
//     {profile?<h2 className="text-2xl font-semibold">Welcome, {profile.name} 👋</h2>:<h2 className="text-2xl font-semibold">Welcome 👋</h2>}
//     <p className="text-gray-600 mt-2">Here is a personalized starter roadmap. You can refine it in chat.</p>
//     <div className="mt-4 whitespace-pre-wrap text-gray-800">{roadmap||"Preparing your roadmap..."}</div>
//     <div className="mt-6"><Link href="/chat" className="px-4 py-2 rounded-xl bg-indigo-600 text-white">Open Career Bot</Link></div>
//   </div></main>);
// }