'use client';
import { useEffect, useRef, useState } from "react";
import { 
  Bot, 
  Plus, 
  MessageSquare, 
  UserCircle, 
  Settings, 
  LogOut, 
  Search, 
  Zap, 
  UploadCloud, 
  Paperclip, 
  Mic, 
  SendHorizontal,
  Image as ImageIcon,
  FileText,
  Files
} from "lucide-react";

// Define the message type
type Msg = { role: "user" | "assistant"; content: string };

// Enhanced parser for better visual formatting
function parseToElements(text?: string) {
  if (!text) return null;

  // Replace markdown-like bolding (**text**) with <strong> tags
  const formattedText = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

  const lines = formattedText.split('\n').filter(line => line.trim() !== '');
  const elements = [];
  let listItems = [];

  const flushList = () => {
    if (listItems.length > 0) {
      elements.push(
        <ul key={`list-${elements.length}`} className="list-disc pl-5 space-y-1 my-2">
          {listItems.map((item, index) => (
            <li key={index} dangerouslySetInnerHTML={{ __html: item }} />
          ))}
        </ul>
      );
      listItems = [];
    }
  };

  lines.forEach((line, index) => {
    if (line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
      listItems.push(line.trim().substring(2));
    } else if (/^#{1,3}\s/.test(line.trim())) {
      flushList();
      const level = line.match(/^#+/)[0].length;
      const content = line.replace(/^#+\s/, '');
      const Tag = `h${level + 3}`; // h4, h5, h6
      elements.push(<Tag key={`header-${index}`} className="font-semibold text-gray-800 my-3">{content}</Tag>);
    } else {
      flushList();
      elements.push(<p key={`p-${index}`} className="my-2" dangerouslySetInnerHTML={{ __html: line }} />);
    }
  });

  flushList();
  return elements;
}


export default function Chat() {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [isDeepResearch, setIsDeepResearch] = useState(false);
  const scroller = useRef<HTMLDivElement>(null);

  // Scroll to the bottom of the chat on new messages
  useEffect(() => {
    scroller.current?.scrollTo({ top: scroller.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  // Function to handle sending a message
  const sendMessage = async (content: string) => {
    if (!content.trim()) return;

    const userMsg: Msg = { role: "user", content: content.trim() };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput("");

    try {
      const profileStr = localStorage.getItem("ai360_profile");
      const profile = profileStr ? JSON.parse(profileStr) : null;
      
      const resp = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: newMessages, profile })
      });

      if (!resp.ok) throw new Error('API request failed');
      
      const data = await resp.json();
      const assistantResponse = data?.answer || "Sorry, I couldn't generate a response.";
      setMessages(m => [...m, { role: "assistant", content: assistantResponse }]);
    } catch (e) {
      console.error(e);
      setMessages(m => [...m, { role: "assistant", content: "Network error. Please check your connection and try again." }]);
    }
  };

  const handleSend = () => sendMessage(input);
  const handlePromptClick = (prompt: string) => sendMessage(prompt);

  return (
    <div className="h-screen w-full flex bg-gray-50 font-sans">
      {/* Sidebar */}
      <aside className="w-72 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 p-2 rounded-md">
              <Bot size={24} className="text-white" />
            </div>
            <div>
              <h1 className="font-semibold text-md text-gray-800">AI Career Mentor</h1>
              <p className="text-xs text-gray-500">Your AI-powered guide</p>
            </div>
          </div>
        </div>

        <div className="p-4 flex-1 flex flex-col gap-4">
          <button className="w-full bg-gradient-to-r from-blue-600 to-teal-500 text-white font-semibold px-4 py-2.5 rounded-lg shadow-md hover:opacity-90 transition-all flex items-center justify-center gap-2">
            <Plus size={18} /> New Conversation
          </button>
          
          {/* Conversation History List */}
          <div className="flex-1 overflow-y-auto">
            <div className="space-y-2">
              {/* Example conversation item */}
              <div className="p-3 rounded-lg bg-blue-50 border border-blue-200 cursor-pointer">
                <h3 className="font-semibold text-sm text-gray-800 truncate">Career Planning Discussion</h3>
                <p className="text-xs text-gray-500 truncate mt-1">How can I transition to data science?</p>
                <p className="text-xs text-gray-400 mt-2">Just now</p>
              </div>
            </div>
          </div>
        </div>

        {/* User Profile Section */}
        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center gap-3 mb-4">
            <UserCircle size={36} className="text-gray-400" />
            <div>
              <h2 className="font-semibold text-sm text-gray-800">Google User</h2>
              <p className="text-xs text-gray-500">user@gmail.com</p>
            </div>
          </div>
          <div className="flex items-center justify-between text-sm text-gray-600">
            <button className="flex items-center gap-1.5 hover:text-blue-600 transition-colors"><Settings size={16} /> Settings</button>
            <button className="flex items-center gap-1.5 text-red-500 hover:text-red-700 transition-colors"><LogOut size={16} /> Logout</button>
          </div>
        </div>
      </aside>

      {/* Main Chat Panel */}
      <main className="flex-1 flex flex-col h-screen">
        <header className="bg-white/80 backdrop-blur-lg border-b border-gray-200 p-4">
          <h2 className="text-lg font-semibold text-gray-800">Career Planning Discussion</h2>
        </header>

        <div ref={scroller} className="flex-1 overflow-y-auto p-6">
          {messages.length === 0 ? (
            // Welcome Screen
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-teal-400 rounded-full flex items-center justify-center mb-6 shadow-lg">
                <Search size={40} className="text-white" />
              </div>
              <h2 className="text-3xl font-bold text-gray-800">How can I help you today?</h2>
              <p className="text-gray-500 mt-2">I'm here to provide personalized career guidance and answer your questions.</p>
              <div className="grid grid-cols-2 gap-4 mt-8 w-full max-w-lg">
                <button onClick={() => handlePromptClick("How do I transition to tech?")} className="bg-white border border-gray-200 p-4 rounded-lg hover:bg-gray-50 transition-colors text-left font-medium">How do I transition to tech?</button>
                <button onClick={() => handlePromptClick("What skills should I develop?")} className="bg-white border border-gray-200 p-4 rounded-lg hover:bg-gray-50 transition-colors text-left font-medium">What skills should I develop?</button>
                <button onClick={() => handlePromptClick("Help me plan my career path")} className="bg-white border border-gray-200 p-4 rounded-lg hover:bg-gray-50 transition-colors text-left font-medium">Help me plan my career path</button>
                <button onClick={() => handlePromptClick("Review my resume strategy")} className="bg-white border border-gray-200 p-4 rounded-lg hover:bg-gray-50 transition-colors text-left font-medium">Review my resume strategy</button>
              </div>
            </div>
          ) : (
            // Chat Messages
            <div className="space-y-6 max-w-4xl mx-auto">
              {messages.map((m, i) => (
                <div key={i} className={`flex gap-4 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  {m.role === 'assistant' && <div className="w-8 h-8 bg-blue-600 rounded-full flex-shrink-0 flex items-center justify-center"><Bot size={20} className="text-white" /></div>}
                  <div className={`max-w-xl p-4 rounded-2xl ${m.role === 'user' ? 'bg-blue-600 text-white rounded-br-none' : 'bg-white border border-gray-200 text-gray-800 rounded-bl-none'}`}>
                    <div className="prose prose-sm max-w-none">{parseToElements(m.content)}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Advanced Input Area */}
        <div className="p-6 bg-white/80 backdrop-blur-lg border-t border-gray-200">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white border border-gray-300 rounded-2xl p-2">
              {/* Top Bar */}
              <div className="flex justify-between items-center px-3 pt-2 pb-1">
                <button onClick={() => setIsDeepResearch(!isDeepResearch)} className={`flex items-center gap-2 text-sm font-semibold px-3 py-1 rounded-md transition-colors ${isDeepResearch ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'}`}>
                  <Zap size={16} /> Deep Research {isDeepResearch ? 'ON' : 'OFF'}
                </button>
              </div>
              
              {/* File Dropzone (Visual Only) */}
              <div className="text-center border-2 border-dashed border-gray-200 rounded-lg py-8 px-4 my-2">
                <UploadCloud size={24} className="mx-auto text-gray-400" />
                <p className="text-sm text-gray-600 mt-2">Drop files here or click to browse</p>
                <p className="text-xs text-gray-400">Supports images, PDFs, and documents</p>
              </div>
              
              <div className="flex items-center gap-2 px-2 py-1">
                <button className="flex items-center gap-1.5 text-sm text-gray-600 px-3 py-1.5 rounded-md hover:bg-gray-100"><ImageIcon size={16} /> Images</button>
                <button className="flex items-center gap-1.5 text-sm text-gray-600 px-3 py-1.5 rounded-md hover:bg-gray-100"><FileText size={16} /> Documents</button>
                <button className="flex items-center gap-1.5 text-sm text-gray-600 px-3 py-1.5 rounded-md hover:bg-gray-100"><Files size={16} /> All Files</button>
              </div>

              {/* Text Input */}
              <div className="flex items-end gap-2 p-2">
                <textarea
                  className="flex-1 bg-transparent resize-none outline-none text-gray-800 placeholder-gray-400"
                  placeholder="Type your message..."
                  rows={1}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                />
                <button className="text-gray-500 hover:text-blue-600 p-2"><Paperclip size={20} /></button>
                <button className="text-gray-500 hover:text-blue-600 p-2"><Mic size={20} /></button>
                <button onClick={handleSend} className="bg-blue-600 text-white rounded-full p-3 hover:bg-blue-700 transition-colors disabled:opacity-50" disabled={!input.trim()}>
                  <SendHorizontal size={20} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
















// 'use client';
// import { useEffect, useRef, useState } from "react";

// type Msg = { role: "user" | "assistant"; content: string };

// function parseToElements(text?: string) {
//   if (!text || typeof text !== "string") return [<div key="empty" className="text-sm text-gray-500">No structured response received.</div>];

//   // Split into lines and group bullets into ul/ol
//   const lines = text.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
//   // Heuristic: if many lines start with "-" or "•" or digit, render as list
//   const elements: any[] = [];
//   let listBuffer: string[] = [];
//   function flushList() {
//     if (listBuffer.length === 0) return;
//     elements.push(
//       <ul key={`ul-${elements.length}`} className="list-disc list-inside space-y-1 text-gray-800">
//         {listBuffer.map((li, i) => <li key={i} dangerouslySetInnerHTML={{ __html: li.replace(/^-+\s*/, "") }} />)}
//       </ul>
//     );
//     listBuffer = [];
//   }

//   for (const line of lines) {
//     if (/^(-|\u2022|\d+\.)\s*/.test(line)) {
//       listBuffer.push(line.replace(/^(?:-|\u2022)\s*/, ""));
//     } else if (/^#{1,3}\s*/.test(line) || /^Summary:|^Recommended|^Next Steps|^Sample Projects|^12-week plan/i.test(line)) {
//       flushList();
//       elements.push(<h3 key={`h-${elements.length}`} className="text-sm font-semibold text-indigo-600 mt-2 mb-1">{line}</h3>);
//     } else {
//       flushList();
//       elements.push(<p key={`p-${elements.length}`} className="text-sm text-gray-700 whitespace-pre-line">{line}</p>);
//     }
//   }
//   flushList();
//   return elements;
// }

// export default function Chat() {
//   const [messages, setMessages] = useState<Msg[]>([
//     { role: "assistant", content: "Hi! I'm your AI 360 Career bot. Ask me anything about careers, skills, colleges, or certifications." }
//   ]);
//   const [input, setInput] = useState("");
//   const scroller = useRef<HTMLDivElement>(null);

//   useEffect(() => {
//     scroller.current?.scrollTo({ top: scroller.current.scrollHeight, behavior: "smooth" });
//   }, [messages]);

//   async function send() {
//     if (!input.trim()) return;
//     const userMsg: Msg = { role: "user", content: input.trim() };
//     setMessages(m => [...m, userMsg]);
//     setInput("");

//     try {
//       const profileStr = localStorage.getItem("ai360_profile");
//       const profile = profileStr ? JSON.parse(profileStr) : null;
//       const resp = await fetch("/api/chat", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ messages: [...messages, userMsg], profile })
//       });
//       const data = await resp.json();
//       const ans = data?.answer || "Sorry — could not generate a response.";
//       setMessages(m => [...m, { role: "assistant", content: ans }]);
//     } catch (e) {
//       setMessages(m => [...m, { role: "assistant", content: "Network error — please try again." }]);
//     }
//   }

//   return (
//     <main className="container-max">
//       <div className="card mt-8 p-4 h-[70vh] flex flex-col">
//         <div ref={scroller} className="flex-1 overflow-y-auto space-y-3 p-2">
//           {messages.map((m, i) => (
//             <div key={i} className={m.role === "user" ? "text-right" : "text-left"}>
//               {m.role === "user" ? (
//                 <div className="inline-block px-4 py-2 rounded-2xl bg-indigo-600 text-white">{m.content}</div>
//               ) : (
//                 <div className="bg-white shadow-md rounded-lg p-4 my-3 text-left">
//                   <div className="text-xs text-gray-500 mb-2">Career Guidance</div>
//                   <div className="prose-sm">
//                     {parseToElements(m.content)}
//                   </div>
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
//             onKeyDown={(e) => { if (e.key === "Enter") send(); }}
//           />
//           <button className="px-4 py-2 rounded-xl bg-indigo-600 text-white" onClick={send}>Send</button>
//         </div>
//       </div>
//     </main>
//   );
// }



















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