import { NextRequest, NextResponse } from "next/server";
import { retrieve } from "@/lib/rag";

function makeRoadmap(profile: any) {
  const interest = profile?.interest || "General";
  const level = (profile?.level || "beginner").toLowerCase();
  const baseQuery = `roadmap ${interest} ${profile?.standard || ""} ${level}`;
  const hits = retrieve(baseQuery, 4);

  const phases = [
    { name: "Phase 0 — Foundations (2–4 weeks)", focus: "Core concepts & terminology, quick wins" },
    { name: "Phase 1 — Skills & Tools (4–8 weeks)", focus: "Hands-on practice + 1 capstone" },
    { name: "Phase 2 — Portfolio & Cert (4–6 weeks)", focus: "Publish work + one credible certificate" },
    { name: "Phase 3 — Internships & Applications (4–8 weeks)", focus: "Networking + projects to internships" }
  ];

  const bullets = hits.map((h: any, i: number) => `• Context ${i+1}: ${h.text.replace(/\n+/g, ' ').slice(0,220)}...`).join("\n");
  return [
    `Goal: ${profile?.goal || "Explore and secure an entry opportunity"}`,
    ``,
    ...phases.map(p => `### ${p.name}\nFocus: ${p.focus}`),
    ``,
    `Based on our knowledge base:`,
    bullets,
    ``,
    `Tip: Keep a weekly log (skills learned, projects, outcomes).`
  ].join("\n");
}

export async function POST(req: NextRequest) {
  const { profile } = await req.json();
  return NextResponse.json({ roadmap: makeRoadmap(profile) });
}
