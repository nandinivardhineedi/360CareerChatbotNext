import { NextRequest, NextResponse } from "next/server";
import { retrieve, synthesizeAnswer } from "@/lib/rag";
async function tryGemini(prompt:string){ const key=process.env.GEMINI_API_KEY; if(!key) return null;
  try{ const { GoogleGenerativeAI } = await import("@google/generative-ai"); const genAI=new GoogleGenerativeAI(key);
    const model=genAI.getGenerativeModel({model:"gemini-1.5-pro"}); const resp=await model.generateContent(prompt); return resp.response.text();
  }catch(e){ console.error("Gemini error",e); return null; } }
export async function POST(req:NextRequest){ const body=await req.json(); const { messages, profile } = body||{};
  const last = messages?.[messages.length-1]?.content || "";
  const top = retrieve(last, 6); const local = synthesizeAnswer(last, profile, top);
  const geminiPrompt = `${local}\n\nRewrite the 'Answer' section only as a crisp, friendly response. Keep bullets. Personalize to the profile. Avoid repeating the 'Context' text.`;
  const upgraded = await tryGemini(geminiPrompt);
  return NextResponse.json({ answer: upgraded || local });
}