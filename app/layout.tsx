import "./globals.css";
import { Analytics } from "@vercel/analytics/react";
export const metadata={title:"AI 360 Career Chatbot — Demo",description:"RAG + Roadmaps + Profile-aware guidance"};
export default function RootLayout({children}:{children:React.ReactNode}){
  return(<html lang="en"><body className="min-h-screen bg-gray-50">
  {children}
  <Analytics />
  </body></html>);
}