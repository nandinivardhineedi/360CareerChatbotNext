'use client';
import { useEffect, useRef, useState } from "react";
type Msg={role:"user"|"assistant",content:string};
export default function Chat(){
  const [messages,setMessages]=useState<Msg[]>([{role:"assistant",content:"Hi! I'm your AI 360 Career bot. Ask me anything about careers, skills, colleges, or certifications."}]);
  const [input,setInput]=useState(""); const scroller=useRef<HTMLDivElement>(null);
  useEffect(()=>{scroller.current?.scrollTo({top:scroller.current.scrollHeight,behavior:"smooth"});},[messages]);
  async function send(){
    if(!input.trim())return;
    const userMsg={role:"user" as const,content:input.trim()}; setMessages(m=>[...m,userMsg]); setInput("");
    const profile=localStorage.getItem("ai360_profile");
    const resp=await fetch("/api/chat",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({messages:[...messages,userMsg],profile:profile?JSON.parse(profile):null})});
    const data=await resp.json(); setMessages(m=>[...m,{role:"assistant",content:data.answer}]);
  }
  return(<main className="container-max"><div className="card mt-8 p-4 h-[70vh] flex flex-col">
    <div ref={scroller} className="flex-1 overflow-y-auto space-y-3 p-2">
      {messages.map((m,i)=>(<div key={i} className={m.role==="user"?"text-right":"text-left"}>
        <div className={"inline-block px-4 py-2 rounded-2xl "+(m.role==="user"?"bg-indigo-600 text-white":"bg-gray-100")}>{m.content}</div>
      </div>))}
    </div>
    <div className="flex gap-2 mt-3"><input className="flex-1 border rounded-xl px-3 py-2" placeholder="Ask about AI/ML vs Data, best certs, colleges..." value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>{if(e.key==="Enter")send();}}/>
    <button className="px-4 py-2 rounded-xl bg-indigo-600 text-white" onClick={send}>Send</button></div>
  </div></main>);
}