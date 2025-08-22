'use client';
import { useState } from "react";
import { useRouter } from "next/navigation";
export default function Onboarding(){
  const [form,setForm]=useState({name:"",standard:"10th",interest:"",level:"beginner",goal:""});
  const router=useRouter();
  function saveProfile(){localStorage.setItem("ai360_profile",JSON.stringify(form));router.push("/dashboard");}
  return(<main className="container-max"><div className="card p-8 mt-8">
    <h2 className="text-2xl font-semibold">Tell us about you</h2>
    <div className="grid md:grid-cols-2 gap-4 mt-4">
      <label className="flex flex-col gap-1"><span className="text-sm text-gray-600">Name</span>
        <input className="border rounded-xl px-3 py-2" value={form.name} onChange={e=>setForm({...form,name:e.target.value})}/></label>
      <label className="flex flex-col gap-1"><span className="text-sm text-gray-600">Standard</span>
        <select className="border rounded-xl px-3 py-2" value={form.standard} onChange={e=>setForm({...form,standard:e.target.value})}>
          <option>10th</option><option>12th</option><option>Undergraduate</option><option>Early Professional</option>
        </select></label>
      <label className="flex flex-col gap-1 md:col-span-2"><span className="text-sm text-gray-600">Area of interest</span>
        <input className="border rounded-xl px-3 py-2" value={form.interest} onChange={e=>setForm({...form,interest:e.target.value})}/></label>
      <label className="flex flex-col gap-1"><span className="text-sm text-gray-600">Current level</span>
        <select className="border rounded-xl px-3 py-2" value={form.level} onChange={e=>setForm({...form,level:e.target.value})}>
          <option>beginner</option><option>intermediate</option><option>advanced</option>
        </select></label>
      <label className="flex flex-col gap-1 md:col-span-2"><span className="text-sm text-gray-600">Your goal</span>
        <input className="border rounded-xl px-3 py-2" placeholder="e.g., Become a Data Analyst in 12 months" value={form.goal} onChange={e=>setForm({...form,goal:e.target.value})}/></label>
    </div>
    <div className="mt-6"><button onClick={saveProfile} className="px-4 py-2 rounded-xl bg-indigo-600 text-white">Continue</button></div>
  </div></main>);
}