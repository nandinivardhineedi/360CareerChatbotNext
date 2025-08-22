'use client';
import { useEffect, useRef, useState } from "react";

type Msg = { role: "user" | "assistant"; content: string };

function parseToElements(text?: string) {
  if (!text || typeof text !== "string") return [<div key="empty" className="text-sm text-gray-500">No structured response received.</div>];

  // Split into lines and group bullets into ul/ol
  const lines = text.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
  // Heuristic: if many lines start with "-" or "•" or digit, render as list
  const elements: any[] = [];
  let listBuffer: string[] = [];
  function flushList() {
    if (listBuffer.length === 0) return;
    elements.push(
      <ul key={`ul-${elements.length}`} className="list-disc list-inside space-y-1 text-gray-800">
        {listBuffer.map((li, i) => <li key={i} dangerouslySetInnerHTML={{ __html: li.replace(/^-+\s*/, "") }} />)}
      </ul>
    );
    listBuffer = [];
  }

  for (const line of lines) {
    if (/^(-|\u2022|\d+\.)\s*/.test(line)) {
      listBuffer.push(line.replace(/^(?:-|\u2022)\s*/, ""));
    } else if (/^#{1,3}\s*/.test(line) || /^Summary:|^Recommended|^Next Steps|^Sample Projects|^12-week plan/i.test(line)) {
      flushList();
      elements.push(<h3 key={`h-${elements.length}`} className="text-sm font-semibold text-indigo-600 mt-2 mb-1">{line}</h3>);
    } else {
      flushList();
      elements.push(<p key={`p-${elements.length}`} className="text-sm text-gray-700 whitespace-pre-line">{line}</p>);
    }
  }
  flushList();
  return elements;
}

export default function Chat() {
  const [messages, setMessages] = useState<Msg[]>([
    { role: "assistant", content: "Hi! I'm your AI 360 Career bot. Ask me anything about careers, skills, colleges, or certifications." }
  ]);
  const [input, setInput] = useState("");
  const scroller = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scroller.current?.scrollTo({ top: scroller.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  async function send() {
    if (!input.trim()) return;
    const userMsg: Msg = { role: "user", content: input.trim() };
    setMessages(m => [...m, userMsg]);
    setInput("");

    try {
      const profileStr = localStorage.getItem("ai360_profile");
      const profile = profileStr ? JSON.parse(profileStr) : null;
      const resp = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: [...messages, userMsg], profile })
      });
      const data = await resp.json();
      const ans = data?.answer || "Sorry — could not generate a response.";
      setMessages(m => [...m, { role: "assistant", content: ans }]);
    } catch (e) {
      setMessages(m => [...m, { role: "assistant", content: "Network error — please try again." }]);
    }
  }

  return (
    <main className="container-max">
      <div className="card mt-8 p-4 h-[70vh] flex flex-col">
        <div ref={scroller} className="flex-1 overflow-y-auto space-y-3 p-2">
          {messages.map((m, i) => (
            <div key={i} className={m.role === "user" ? "text-right" : "text-left"}>
              {m.role === "user" ? (
                <div className="inline-block px-4 py-2 rounded-2xl bg-indigo-600 text-white">{m.content}</div>
              ) : (
                <div className="bg-white shadow-md rounded-lg p-4 my-3 text-left">
                  <div className="text-xs text-gray-500 mb-2">Career Guidance</div>
                  <div className="prose-sm">
                    {parseToElements(m.content)}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="flex gap-2 mt-3">
          <input
            className="flex-1 border rounded-xl px-3 py-2"
            placeholder="Ask about AI/ML vs Data, best certs, colleges..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") send(); }}
          />
          <button className="px-4 py-2 rounded-xl bg-indigo-600 text-white" onClick={send}>Send</button>
        </div>
      </div>
    </main>
  );
}



















// 'use client';
// import { useEffect, useRef, useState } from "react";

// type Msg = { role: "user" | "assistant"; content: string };

// export default function Chat() {
//   const [messages, setMessages] = useState<Msg[]>([
//     {
//       role: "assistant",
//       content:
//         "Hi! I'm your AI 360 Career bot. Ask me anything about careers, skills, colleges, or certifications.",
//     },
//   ]);
//   const [input, setInput] = useState("");
//   const scroller = useRef<HTMLDivElement>(null);

//   useEffect(() => {
//     scroller.current?.scrollTo({
//       top: scroller.current.scrollHeight,
//       behavior: "smooth",
//     });
//   }, [messages]);

//   async function send() {
//     if (!input.trim()) return;
//     const userMsg = { role: "user" as const, content: input.trim() };
//     setMessages((m) => [...m, userMsg]);
//     setInput("");

//     const profile = localStorage.getItem("ai360_profile");
//     const resp = await fetch("/api/chat", {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({
//         messages: [...messages, userMsg],
//         profile: profile ? JSON.parse(profile) : null,
//       }),
//     });
//     const data = await resp.json();
//     setMessages((m) => [...m, { role: "assistant", content: data.answer }]);
//   }

//   // 🔹 Helper to format assistant messages into roadmap-style cards
//   // function renderAssistantMessage(content: string) {
//   //   // Split answer into sections if bot used "-" or numbers
//   //   const lines = content.split("\n").map((l) => l.trim()).filter(Boolean);

//   //   return (
//   //     <div className="bg-white shadow-md rounded-lg p-4 my-3 text-left">
//   //       <h2 className="text-lg font-semibold text-indigo-600 mb-2">
//   //         Career Guidance
//   //       </h2>
//   //       <ul className="list-disc list-inside space-y-1 text-gray-700">
//   //         {lines.map((line, i) => (
//   //           <li key={i} className="whitespace-pre-line">
//   //             {line.replace(/^\d+\.|- /, "").trim()}
//   //           </li>
//   //         ))}
//   //       </ul>
//   //     </div>
//   //   );
//   // }


//   function renderAssistantMessage(content?: string) {
//     if (!content || typeof content !== "string") {
//       return (
//         <div className="bg-red-100 text-red-600 p-3 rounded-lg">
//           (No structured response received)
//         </div>
//       );
//     }
  
//     const lines = content
//       .split("\n")
//       .map((l) => l.trim())
//       .filter(Boolean);
  
//     return (
//       <div className="bg-white shadow-md rounded-lg p-4 my-3 text-left">
//         <h2 className="text-lg font-semibold text-indigo-600 mb-2">
//           Career Guidance
//         </h2>
//         <ul className="list-disc list-inside space-y-1 text-gray-700">
//           {lines.map((line, i) => (
//             <li key={i} className="whitespace-pre-line">
//               {line.replace(/^\d+\.|- /, "").trim()}
//             </li>
//           ))}
//         </ul>
//       </div>
//     );
//   }
  



//   return (
//     <main className="container-max">
//       <div className="card mt-8 p-4 h-[70vh] flex flex-col">
//         <div ref={scroller} className="flex-1 overflow-y-auto space-y-3 p-2">
//           {messages.map((m, i) => (
//             <div key={i} className={m.role === "user" ? "text-right" : "text-left"}>
//               {m.role === "assistant" ? (
//                 renderAssistantMessage(m.content)
//               ) : (
//                 <div className="inline-block px-4 py-2 rounded-2xl bg-indigo-600 text-white">
//                   {m.content}
//                 </div>
//               )}
//             </div>
//           ))}
//         </div>

//         <div className="flex gap-2 mt-3">
//           <input
//             className="flex-1 border rounded-xl px-3 py-2"
//             placeholder="Ask about AI/ML vs Data, best certs, colleges..."
//             value={input}
//             onChange={(e) => setInput(e.target.value)}
//             onKeyDown={(e) => {
//               if (e.key === "Enter") send();
//             }}
//           />
//           <button
//             className="px-4 py-2 rounded-xl bg-indigo-600 text-white"
//             onClick={send}
//           >
//             Send
//           </button>
//         </div>
//       </div>
//     </main>
//   );
// }

















// 'use client';
// import { useEffect, useRef, useState } from "react";
// type Msg={role:"user"|"assistant",content:string};
// export default function Chat(){
//   const [messages,setMessages]=useState<Msg[]>([{role:"assistant",content:"Hi! I'm your AI 360 Career bot. Ask me anything about careers, skills, colleges, or certifications."}]);
//   const [input,setInput]=useState(""); const scroller=useRef<HTMLDivElement>(null);
//   useEffect(()=>{scroller.current?.scrollTo({top:scroller.current.scrollHeight,behavior:"smooth"});},[messages]);
//   async function send(){
//     if(!input.trim())return;
//     const userMsg={role:"user" as const,content:input.trim()}; setMessages(m=>[...m,userMsg]); setInput("");
//     const profile=localStorage.getItem("ai360_profile");
//     const resp=await fetch("/api/chat",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({messages:[...messages,userMsg],profile:profile?JSON.parse(profile):null})});
//     const data=await resp.json(); setMessages(m=>[...m,{role:"assistant",content:data.answer}]);
//   }
//   return(<main className="container-max"><div className="card mt-8 p-4 h-[70vh] flex flex-col">
//     <div ref={scroller} className="flex-1 overflow-y-auto space-y-3 p-2">
//       {messages.map((m,i)=>(<div key={i} className={m.role==="user"?"text-right":"text-left"}>
//         <div className={"inline-block px-4 py-2 rounded-2xl "+(m.role==="user"?"bg-indigo-600 text-white":"bg-gray-100")}>{m.content}</div>
//       </div>))}
//     </div>
//     <div className="flex gap-2 mt-3"><input className="flex-1 border rounded-xl px-3 py-2" placeholder="Ask about AI/ML vs Data, best certs, colleges..." value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>{if(e.key==="Enter")send();}}/>
//     <button className="px-4 py-2 rounded-xl bg-indigo-600 text-white" onClick={send}>Send</button></div>
//   </div></main>);
// }