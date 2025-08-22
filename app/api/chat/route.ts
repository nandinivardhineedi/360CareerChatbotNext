// app/api/chat/route.ts
import { NextRequest, NextResponse } from "next/server";
import { retrieve, synthesizeAnswer } from "@/lib/rag";

async function tryGeminiPolish(localText: string) {
  // Only attempt if key present
  const key = process.env.GOOGLE_API_KEY;
  if (!key) return null;
  try {
    const { GoogleGenerativeAI } = await import("@google/generative-ai");
    const genAI = new GoogleGenerativeAI(key);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
    // ask the model to rewrite the Answer section to be concise & friendly
    // const resp = await model.generateContent({
    //   prompt: `Polish the following career guidance into a crisp, friendly reply. Preserve sections (Summary, Recommended skills, Next Steps, Sample Projects, (if present) 12-week plan). Keep bullets.\n\n${localText}`,
    //   // using general generateContent call; the SDK may vary slightly — this is best-effort.
    // });

    // const resp = await model.generateContent([
    //   {
    //     role: "user",
    //     parts: [
    //       { text: `Polish the following career guidance into a crisp, friendly reply. Preserve sections (Summary, Recommended skills, Next Steps, Sample Projects, (if present) 12-week plan). Keep bullets.\n\n${localText}` }
    //     ]
    //   }
    // ]);

    const resp = await model.generateContent(
      `Polish the following career guidance into a crisp, friendly reply. Preserve sections (Summary, Recommended skills, Next Steps, Sample Projects, (if present) 12-week plan). Keep bullets.\n\n${localText}`
    );
    
    
    const text = resp?.response?.text?.() || resp?.response || null;
    return typeof text === "string" && text.length ? text : null;
  } catch (e) {
    console.warn("Gemini polish failed:", e?.message || e);
    return null;
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const messages = body?.messages || [];
    const profile = body?.profile || null;
    const last = messages?.[messages.length - 1]?.content || "";

    // Retrieve top hits from local seeds
    const hits = retrieve(last, 6); // returns array of {id, text}

    // Local deterministic answer
    const local = synthesizeAnswer(last, profile, hits);

    // Try to polish with Gemini if key present (non-blocking)
    const polished = await tryGeminiPolish(local);
    const answer = polished || local;

    return NextResponse.json({ answer });
  } catch (err) {
    console.error("Chat API error:", err);
    return NextResponse.json({ answer: "Sorry — something went wrong generating the answer." }, { status: 500 });
  }
}



















// import { NextResponse } from "next/server";
// import { retrieve, synthesizeAnswer } from "@/lib/rag";

// export async function POST(req: Request) {
//   try {
//     const { question } = await req.json();
//     const docs = await retrieve(question);
//     const answer = await synthesizeAnswer(question, docs);
//     return NextResponse.json({ answer });
//   } catch (err) {
//     console.error(err);
//     return NextResponse.json({ error: "Failed to generate response" }, { status: 500 });
//   }
// }
















// import { NextRequest, NextResponse } from "next/server";
// import { retrieve, synthesizeAnswer } from "@/lib/rag";
// async function tryGemini(prompt:string){ const key=process.env.GEMINI_API_KEY; if(!key) return null;
//   try{ const { GoogleGenerativeAI } = await import("@google/generative-ai"); const genAI=new GoogleGenerativeAI(key);
//     const model=genAI.getGenerativeModel({model:"gemini-1.5-pro"}); const resp=await model.generateContent(prompt); return resp.response.text();
//   }catch(e){ console.error("Gemini error",e); return null; } }
// export async function POST(req:NextRequest){ const body=await req.json(); const { messages, profile } = body||{};
//   const last = messages?.[messages.length-1]?.content || "";
//   const top = retrieve(last, 6); const local = synthesizeAnswer(last, profile, top);
//   const geminiPrompt = `${local}\n\nRewrite the 'Answer' section only as a crisp, friendly response. Keep bullets. Personalize to the profile. Avoid repeating the 'Context' text.`;
//   const upgraded = await tryGemini(geminiPrompt);
//   return NextResponse.json({ answer: upgraded || local });
// }