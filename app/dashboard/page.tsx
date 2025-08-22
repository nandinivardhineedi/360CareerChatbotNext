'use client';
import { useEffect, useState } from "react";
import Link from "next/link";
export default function Dashboard(){
  const [profile,setProfile]=useState<any>(null);
  const [roadmap,setRoadmap]=useState<string>("");
  useEffect(()=>{
    const p=localStorage.getItem("ai360_profile");
    if(p){const parsed=JSON.parse(p);setProfile(parsed);
      fetch("/api/roadmap",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({profile:parsed})})
      .then(r=>r.json()).then(d=>setRoadmap(d.roadmap||""));
    }
  },[]);
  return(<main className="container-max"><div className="card p-8 mt-8">
    {profile?<h2 className="text-2xl font-semibold">Welcome, {profile.name} 👋</h2>:<h2 className="text-2xl font-semibold">Welcome 👋</h2>}
    <p className="text-gray-600 mt-2">Here is a personalized starter roadmap. You can refine it in chat.</p>
    <div className="mt-4 whitespace-pre-wrap text-gray-800">{roadmap||"Preparing your roadmap..."}</div>
    <div className="mt-6"><Link href="/chat" className="px-4 py-2 rounded-xl bg-indigo-600 text-white">Open Career Bot</Link></div>
  </div></main>);
}