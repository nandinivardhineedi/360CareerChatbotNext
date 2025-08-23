'use client';
import { useState } from "react";
import { useRouter } from "next/navigation";
import { User, GraduationCap, Sparkles, BarChart3, Target, ChevronLeft, ChevronRight, SkipForward } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// Helper component for a single onboarding step
const OnboardingStep = ({ children }) => (
  <motion.div
    initial={{ opacity: 0, x: 50 }}
    animate={{ opacity: 1, x: 0 }}
    exit={{ opacity: 0, x: -50 }}
    transition={{ duration: 0.3, ease: "easeInOut" }}
    className="w-full"
  >
    {children}
  </motion.div>
);

export default function Onboarding() {
  const [currentStep, setCurrentStep] = useState(1);
  const [form, setForm] = useState({
    name: "",
    standard: "Undergraduate", // Default value
    interest: "",
    level: "beginner", // Default value
    goal: ""
  });
  const router = useRouter();
  const totalSteps = 5;

  const saveProfile = () => {
    localStorage.setItem("ai360_profile", JSON.stringify(form));
    router.push("/dashboard");
  };

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    } else {
      saveProfile();
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const progressPercentage = ((currentStep - 1) / (totalSteps - 1)) * 100;

  const stepsContent = [
    // Step 1: Name
    {
      icon: <User className="mx-auto text-blue-500" size={32} />,
      title: "What's your name?",
      subtitle: "Let's personalize your experience",
      content: (
        <input
          className="w-full mt-8 border-2 border-gray-300 focus:border-blue-500 rounded-lg px-4 py-3 text-lg outline-none transition-colors"
          placeholder="Enter your full name"
          value={form.name}
          onChange={e => setForm({ ...form, name: e.target.value })}
        />
      )
    },
    // Step 2: Standard
    {
      icon: <GraduationCap className="mx-auto text-blue-500" size={32} />,
      title: "What's your current status?",
      subtitle: "This helps us tailor content to your educational stage.",
      content: (
        <div className="grid grid-cols-2 gap-4 mt-8">
          {["10th", "12th", "Undergraduate", "Early Professional"].map(option => (
            <button key={option} onClick={() => setForm({ ...form, standard: option })} className={`p-4 border-2 rounded-lg font-semibold transition-all ${form.standard === option ? 'border-blue-500 bg-blue-50 text-blue-600' : 'border-gray-300 hover:border-blue-400'}`}>
              {option}
            </button>
          ))}
        </div>
      )
    },
    // Step 3: Area of Interest
    {
      icon: <Sparkles className="mx-auto text-blue-500" size={32} />,
      title: "What's your area of interest?",
      subtitle: "Tell us what fields excite you the most.",
      content: (
        <input
          className="w-full mt-8 border-2 border-gray-300 focus:border-blue-500 rounded-lg px-4 py-3 text-lg outline-none transition-colors"
          placeholder="e.g., Software Development, AI, Marketing"
          value={form.interest}
          onChange={e => setForm({ ...form, interest: e.target.value })}
        />
      )
    },
    // Step 4: Current Level
    {
      icon: <BarChart3 className="mx-auto text-blue-500" size={32} />,
      title: "What's your current skill level?",
      subtitle: "Be honest! This helps us find the right starting point for you.",
      content: (
        <div className="grid grid-cols-3 gap-4 mt-8">
          {["beginner", "intermediate", "advanced"].map(option => (
            <button key={option} onClick={() => setForm({ ...form, level: option })} className={`p-4 border-2 rounded-lg font-semibold transition-all capitalize ${form.level === option ? 'border-blue-500 bg-blue-50 text-blue-600' : 'border-gray-300 hover:border-blue-400'}`}>
              {option}
            </button>
          ))}
        </div>
      )
    },
    // Step 5: Goal
    {
      icon: <Target className="mx-auto text-blue-500" size={32} />,
      title: "What's your ultimate goal?",
      subtitle: "Describe what you hope to achieve on your career journey.",
      content: (
        <input
          className="w-full mt-8 border-2 border-gray-300 focus:border-blue-500 rounded-lg px-4 py-3 text-lg outline-none transition-colors"
          placeholder="e.g., Become a Data Analyst in 12 months"
          value={form.goal}
          onChange={e => setForm({ ...form, goal: e.target.value })}
        />
      )
    }
  ];

  const currentStepData = stepsContent[currentStep - 1];

  return (
    <main className="bg-gradient-to-br from-blue-50 via-white to-teal-50 min-h-screen flex flex-col items-center justify-center p-4 font-sans">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="px-2">
          <div className="flex justify-between items-center mb-2">
            <h1 className="text-xl font-bold text-gray-800">Getting to know you</h1>
            <span className="text-sm font-medium text-gray-500">{currentStep} of {totalSteps}</span>
          </div>
          {/* Progress Bar */}
          <div className="w-full bg-gray-200 rounded-full h-1.5 mb-8">
            <div className="bg-gradient-to-r from-blue-500 to-teal-400 h-1.5 rounded-full transition-all duration-500 ease-out" style={{ width: `${progressPercentage}%` }}></div>
          </div>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12 text-center min-h-[320px] flex flex-col justify-center items-center">
          <AnimatePresence mode="wait">
            <OnboardingStep key={currentStep}>
              {currentStepData.icon}
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mt-4">{currentStepData.title}</h2>
              <p className="text-gray-500 mt-2">{currentStepData.subtitle}</p>
              {currentStepData.content}
            </OnboardingStep>
          </AnimatePresence>
        </div>

        {/* Footer Navigation */}
        <div className="flex justify-between items-center mt-8 px-2">
          <button
            onClick={handleBack}
            className={`flex items-center gap-1 text-gray-600 font-semibold transition-opacity duration-300 ${currentStep === 1 ? 'opacity-0 cursor-default' : 'opacity-100 hover:text-gray-900'}`}
            disabled={currentStep === 1}
          >
            <ChevronLeft size={16} /> Back
          </button>
          <div className="flex items-center gap-4">
            <button onClick={handleNext} className="flex items-center gap-2 text-gray-600 font-semibold hover:text-gray-900 transition-colors">
              <SkipForward size={16} /> Skip
            </button>
            <button
              onClick={handleNext}
              className="bg-gradient-to-r from-blue-600 to-teal-500 text-white font-semibold px-6 py-3 rounded-lg shadow-md hover:opacity-90 transition-all transform hover:scale-105 flex items-center gap-2"
            >
              {currentStep === totalSteps ? 'Finish' : 'Continue'}
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
















// 'use client';
// import { useState } from "react";
// import { useRouter } from "next/navigation";
// export default function Onboarding(){
//   const [form,setForm]=useState({name:"",standard:"10th",interest:"",level:"beginner",goal:""});
//   const router=useRouter();
//   function saveProfile(){localStorage.setItem("ai360_profile",JSON.stringify(form));router.push("/dashboard");}
//   return(<main className="container-max"><div className="card p-8 mt-8">
//     <h2 className="text-2xl font-semibold">Tell us about you</h2>
//     <div className="grid md:grid-cols-2 gap-4 mt-4">
//       <label className="flex flex-col gap-1"><span className="text-sm text-gray-600">Name</span>
//         <input className="border rounded-xl px-3 py-2" value={form.name} onChange={e=>setForm({...form,name:e.target.value})}/></label>
//       <label className="flex flex-col gap-1"><span className="text-sm text-gray-600">Standard</span>
//         <select className="border rounded-xl px-3 py-2" value={form.standard} onChange={e=>setForm({...form,standard:e.target.value})}>
//           <option>10th</option><option>12th</option><option>Undergraduate</option><option>Early Professional</option>
//         </select></label>
//       <label className="flex flex-col gap-1 md:col-span-2"><span className="text-sm text-gray-600">Area of interest</span>
//         <input className="border rounded-xl px-3 py-2" value={form.interest} onChange={e=>setForm({...form,interest:e.target.value})}/></label>
//       <label className="flex flex-col gap-1"><span className="text-sm text-gray-600">Current level</span>
//         <select className="border rounded-xl px-3 py-2" value={form.level} onChange={e=>setForm({...form,level:e.target.value})}>
//           <option>beginner</option><option>intermediate</option><option>advanced</option>
//         </select></label>
//       <label className="flex flex-col gap-1 md:col-span-2"><span className="text-sm text-gray-600">Your goal</span>
//         <input className="border rounded-xl px-3 py-2" placeholder="e.g., Become a Data Analyst in 12 months" value={form.goal} onChange={e=>setForm({...form,goal:e.target.value})}/></label>
//     </div>
//     <div className="mt-6"><button onClick={saveProfile} className="px-4 py-2 rounded-xl bg-indigo-600 text-white">Continue</button></div>
//   </div></main>);
// }