'use client';
import Link from "next/link";
import { Sparkles, Bot, Target, LineChart, Users, Zap, Search } from "lucide-react"; // Using lucide-react for icons

// A helper component for feature cards to keep the main component clean
const FeatureCard = ({ icon, title, children }) => (
  <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm transition-shadow hover:shadow-md">
    <div className="mb-4 text-blue-600">
      {icon}
    </div>
    <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
    <p className="text-gray-600 text-sm">{children}</p>
  </div>
);

export default function HomePage() {
  // Data for the feature cards
  const features = [
    {
      icon: <Bot size={28} />,
      title: "AI-Powered Guidance",
      description: "Get personalized career advice using advanced RAG technology with LangChain and Pinecone."
    },
    {
      icon: <Target size={28} />,
      title: "Goal-Oriented Planning",
      description: "Set and track your career milestones with intelligent recommendations and progress insights."
    },
    {
      icon: <LineChart size={28} />,
      title: "Market Analytics",
      description: "Access real-time job market trends and salary insights for informed career decisions."
    },
    {
      icon: <Users size={28} />,
      title: "Networking Simulator",
      description: "Practice professional conversations and build networking skills with AI scenarios."
    },
    {
      icon: <Zap size={28} />,
      title: "Skill Gap Analysis",
      description: "Identify skill gaps and get personalized learning paths for your target roles."
    },
    {
      icon: <Search size={28} />,
      title: "Deep Research Mode",
      description: "Leverage advanced AI research capabilities for comprehensive career insights."
    }
  ];

  return (
    <div className="w-full bg-white">
      {/* Header/Navbar */}
      <header className="container mx-auto px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="bg-blue-600 p-2 rounded-md">
            <Bot size={24} className="text-white" />
          </div>
          <span className="font-semibold text-lg text-gray-800">AI 360 Career Mentor</span>
        </div>
        <nav className="flex items-center gap-4">
          <Link href="/login" className="text-gray-600 hover:text-blue-600 transition-colors">
            Login
          </Link>
          <Link href="/chat" className="px-4 py-2 rounded-md bg-blue-600 text-white font-semibold shadow-sm hover:bg-blue-700 transition-colors">
            Get Started
          </Link>
        </nav>
      </header>

      <main className="container mx-auto px-6">
        {/* Hero Section */}
        <section className="text-center py-20 lg:py-32">
          <div className="bg-blue-50 border border-blue-200 text-blue-700 rounded-full px-4 py-1.5 inline-flex items-center gap-2 mb-6">
            <Sparkles size={16} />
            <span className="font-semibold text-sm">AI-Powered Career Guidance Platform</span>
          </div>

          <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 max-w-4xl mx-auto leading-tight">
            Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-teal-400">AI Career Coach</span> for Success
          </h1>

          <p className="text-lg text-gray-600 max-w-2xl mx-auto mt-6">
            Transform your career journey with personalized AI guidance, market insights, and intelligent recommendations powered by cutting-edge RAG technology.
          </p>

          <div className="mt-10 flex justify-center gap-4">
            <Link href="/onboarding" className="px-6 py-3 rounded-lg bg-blue-600 text-white font-semibold shadow-md hover:bg-blue-700 transition-all transform hover:scale-105">
              Start Your Journey
            </Link>
            <Link href="/chat" className="px-6 py-3 rounded-lg bg-white text-gray-700 font-semibold border border-gray-300 shadow-sm hover:bg-gray-50 transition-all transform hover:scale-105">
              Watch Demo
            </Link>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 lg:py-24">
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900">Advanced Features for Your Success</h2>
            <p className="text-md text-gray-600 mt-4">
              Discover powerful AI-driven tools designed to accelerate your career growth.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mt-12">
            {features.map((feature) => (
              <FeatureCard key={feature.title} icon={feature.icon} title={feature.title}>
                {feature.description}
              </FeatureCard>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
















// 'use client';
// import Link from "next/link";
// import { motion } from "framer-motion";
// export default function HomePage(){
//   return(<main className="container-max">
//   <section className="grid md:grid-cols-2 gap-6 items-center mt-8">
//     <motion.div initial={{opacity:0,y:12}} animate={{opacity:1,y:0}} transition={{duration:0.4}} className="card p-8">
//       <h2 className="text-2xl font-semibold mb-3">Your Career Copilot</h2>
//       <p className="text-gray-600">Explore paths, learn in-demand skills, and chat with a context-aware assistant trained on curated Indian career datasets.</p>
//       <ul className="mt-4 space-y-2 text-gray-700">
//         <li>• Profile-aware guidance</li><li>• RAG over skill trends & career paths</li><li>• Instant roadmaps & certifications</li><li>• Optional Gemini 1.5 Pro integration</li>
//       </ul>
//       <div className="mt-6 flex gap-3">
//         <Link href="/onboarding" className="px-4 py-2 rounded-xl bg-indigo-600 text-white">Start</Link>
//         <Link href="/chat" className="px-4 py-2 rounded-xl bg-white border">Try the bot</Link>
//       </div>
//     </motion.div>
//     <motion.div initial={{opacity:0,y:12}} animate={{opacity:1,y:0}} transition={{duration:0.4,delay:0.1}} className="card p-8">
//       <h3 className="text-xl font-semibold mb-3">How the demo works</h3>
//       <ol className="list-decimal pl-6 space-y-2 text-gray-700">
//         <li>Fill onboarding (name, standard, interests, level, goals).</li>
//         <li>Get a personalized roadmap.</li>
//         <li>Open the chatbot for follow-up Q&A.</li>
//       </ol>
//       <p className="text-gray-600 mt-4 text-sm">No external DB required. Local mode generates answers from the bundled datasets. Set <code>GEMINI_API_KEY</code> to upgrade responses.</p>
//     </motion.div>
//   </section></main>);
// }