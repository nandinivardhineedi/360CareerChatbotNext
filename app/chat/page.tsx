"use client";

import React, { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Send, Loader2, Map, Briefcase, MessageSquare, Compass } from "lucide-react"; 

// 1. DEFINE THE MESSAGE TYPE EXPLICITLY
interface MessageType {
  role: "user" | "assistant";
  content: string;
}

export default function Chat() {
  // 2. USE THE DEFINED TYPE FOR STATE
  const [messages, setMessages] = useState<MessageType[]>([
    { 
      role: "assistant", 
      content: "✨ **Career Navigator Online.** Focused on clear, concise insights to drive your professional development. What career area should we explore today?" 
    }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const send = async () => {
    if (!input.trim() || loading) return;

    // Create user message respecting the defined MessageType structure
    const userMessage: MessageType = { role: "user", content: input }; 
    setMessages((m) => [...m, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: input, userContext: { history: messages } }),
      });
      const data = await res.json();
      
      if (data.reply) {
        // Ensure new message structure is respected when adding assistant reply
        setMessages((m) => [...m, { role: "assistant", content: data.reply }]); 
      } else if (data.error) {
        setMessages((m) => [...m, { role: "assistant", content: `❌ System Error: ${data.error}` }]);
      }
    } catch (e) {
      setMessages((m) => [...m, { role: "assistant", content: "💔 Connectivity lost. Please check the server." }]);
    }
    setLoading(false);
  };

  const getIconForMessage = (content: string, role: 'user' | 'assistant') => {
    if (role === 'user') return null; 
    const lowerContent = content.toLowerCase();
    if (lowerContent.includes('roadmap')) return <Compass className="w-4 h-4 text-lime-500 mr-2" />;
    if (lowerContent.includes('job') || lowerContent.includes('opening')) return <Briefcase className="w-4 h-4 text-amber-500 mr-2" />; 
    return <MessageSquare className="w-4 h-4 text-indigo-500 mr-2" />; // Default AI/RAG icon
  };

  const MessageBubble = ({ role, content }: { role: 'user' | 'assistant', content: string }) => (
    <div
      className={`flex mb-5 ${role === "user" ? "justify-end" : "justify-start"}`}
    >
      <div className={`flex items-start max-w-[90%]`}>
        
        {/* Assistant Icon - Cleaner Look */}
        {role === 'assistant' && (
            <div className="flex-shrink-0 mr-3 mt-1 p-2 bg-indigo-100 rounded-xl border border-indigo-300/50">
                {getIconForMessage(content, role)}
            </div>
        )}
        
        <div
          className={`p-4 rounded-3xl shadow-lg transition-all duration-300 border
            ${role === "user" 
              ? "bg-indigo-500 text-white rounded-br-lg" 
              : "bg-white text-gray-800 rounded-tl-lg border-gray-200" 
            }`}
        >
          <ReactMarkdown 
            remarkPlugins={[remarkGfm]} // CORRECTED: This must be 'remarkPlugins'
            components={{
              p: ({node, ...props}) => <p {...props} style={{ margin: '0 0 0.5rem 0', lineHeight: '1.5' }} />,
              li: ({node, ...props}) => <li {...props} style={{ paddingLeft: '0.25rem', margin: '0.25rem 0' }} />,
              ul: ({node, ...props}) => <ul {...props} style={{ paddingLeft: '1.5rem', margin: '0.5rem 0' }} />,
              ol: ({node, ...props}) => <ol {...props} style={{ paddingLeft: '1.5rem', margin: '0.5rem 0' }} />,
              strong: ({node, ...props}) => <strong {...props} style={{ color: role === 'user' ? '#c7d2fe' : '#0369a1' }} />, 
            }}
          >
            {content}
          </ReactMarkdown>
        </div>
      </div>
    </div>
  );

  return (
    // MAIN LAYOUT: White background
    <div className="flex flex-col h-screen bg-white p-4 sm:p-6 text-gray-900">
      <header className="pt-2 pb-5 mb-4 border-b border-gray-200">
        <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-700 to-cyan-500 text-center drop-shadow-sm">
            CAREER ASSISTANT
        </h1>
        <p className="text-center text-xs text-gray-500 mt-1">Intelligent Guidance System (RAG Enabled)</p>
      </header>
      
      {/* Chat window - Main focus area */}
      <div className="flex-1 overflow-y-auto mb-4 p-5 rounded-2xl bg-gray-50 shadow-inner border border-gray-200">
        {messages.map((msg, idx) => (
          <MessageBubble key={idx} role={msg.role} content={msg.content} />
        ))}
        {loading && (
          <div className="flex justify-start mb-5">
            <div className="bg-indigo-50 text-indigo-700 p-3 rounded-2xl shadow-md border border-indigo-200 rounded-tl-lg">
              <Loader2 className="w-5 h-5 animate-spin inline mr-2 text-indigo-500" /> Processing...
            </div>
          </div>
        )}
        <div ref={endRef} />
      </div>

      {/* Input area - Clean, pill-shaped bar */}
      <div className="flex gap-3 p-2 bg-white rounded-full shadow-xl border border-indigo-200/50">
        <textarea
          rows={1}
          style={{ minHeight: '40px', maxHeight: '150px' }}
          className="flex-1 resize-none p-2 bg-white border-none focus:ring-0 outline-none text-gray-800 placeholder-gray-400 rounded-full"
          placeholder="Type your question here..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && send()}
          disabled={loading}
        />
        <button
          onClick={() => send()}
          disabled={loading || !input.trim()}
          className={`p-3 rounded-full transition-all duration-300 flex items-center justify-center w-10 h-10 flex-shrink-0 ml-1
            ${loading || !input.trim() 
              ? "bg-gray-200 text-gray-500 cursor-not-allowed" 
              : "bg-cyan-500 hover:bg-cyan-600 text-white shadow-md shadow-cyan-500/50 transform hover:scale-105"
            }`}
        >
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
        </button>
      </div>
    </div>
  );
}