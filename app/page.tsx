'use client';
import Link from "next/link";
import { motion } from "framer-motion";
export default function HomePage(){
  return(<main className="container-max">
  <section className="grid md:grid-cols-2 gap-6 items-center mt-8">
    <motion.div initial={{opacity:0,y:12}} animate={{opacity:1,y:0}} transition={{duration:0.4}} className="card p-8">
      <h2 className="text-2xl font-semibold mb-3">Your Career Copilot</h2>
      <p className="text-gray-600">Explore paths, learn in-demand skills, and chat with a context-aware assistant trained on curated Indian career datasets.</p>
      <ul className="mt-4 space-y-2 text-gray-700">
        <li>• Profile-aware guidance</li><li>• RAG over skill trends & career paths</li><li>• Instant roadmaps & certifications</li><li>• Optional Gemini 1.5 Pro integration</li>
      </ul>
      <div className="mt-6 flex gap-3">
        <Link href="/onboarding" className="px-4 py-2 rounded-xl bg-indigo-600 text-white">Start</Link>
        <Link href="/chat" className="px-4 py-2 rounded-xl bg-white border">Try the bot</Link>
      </div>
    </motion.div>
    <motion.div initial={{opacity:0,y:12}} animate={{opacity:1,y:0}} transition={{duration:0.4,delay:0.1}} className="card p-8">
      <h3 className="text-xl font-semibold mb-3">How the demo works</h3>
      <ol className="list-decimal pl-6 space-y-2 text-gray-700">
        <li>Fill onboarding (name, standard, interests, level, goals).</li>
        <li>Get a personalized roadmap.</li>
        <li>Open the chatbot for follow-up Q&A.</li>
      </ol>
      <p className="text-gray-600 mt-4 text-sm">No external DB required. Local mode generates answers from the bundled datasets. Set <code>GEMINI_API_KEY</code> to upgrade responses.</p>
    </motion.div>
  </section></main>);
}