import "./globals.css";
import { Analytics } from "@vercel/analytics/react";
export const metadata={title:"AI 360 Career Chatbot — Demo",description:"RAG + Roadmaps + Profile-aware guidance"};
export default function RootLayout({children}:{children:React.ReactNode}){
  return(<html lang="en"><body className="min-h-screen bg-gray-50">
  <div className="container-max py-4">
    <header className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-xl bg-indigo-600" />
        <h1 className="text-xl font-semibold">AI 360 Career</h1>
      </div>
      <a href="/onboarding" className="text-sm text-indigo-700 hover:underline">Get Started</a>
    </header>
  </div>
  {children}
  <Analytics />
  </body></html>);
}