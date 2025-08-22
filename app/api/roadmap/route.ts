// app/api/roadmap/route.ts
import { NextRequest, NextResponse } from "next/server";
import { retrieve } from "@/lib/rag";

async function makeRoadmapText(profile: any) {
  const interest = profile?.interest || "General";
  const level = (profile?.level || "beginner").toLowerCase();
  const baseQuery = `roadmap ${interest} ${profile?.standard || ""} ${level}`;

  const hits = retrieve(baseQuery, 6);
  if (!Array.isArray(hits) || hits.length === 0) {
    // Fallback static roadmap text
    const fallback = [
      `🎯 Goal: ${profile?.goal || "Explore and secure an entry opportunity"}`,
      "",
      "### Phase 0 — Foundations (2–4 weeks)\nFocus: Core concepts & quick wins",
      "### Phase 1 — Skills & Tools (4–8 weeks)\nFocus: Hands-on practice + 1 capstone",
      "### Phase 2 — Portfolio & Cert (4–6 weeks)\nFocus: Publish work + certification",
      "### Phase 3 — Internships & Applications (4–8 weeks)\nFocus: Networking + internships",
      "",
      "💡 Tip: Keep a weekly log and build small public projects."
    ];
    return fallback.join("\n\n");
  }

  const bullets = hits.map((h: any, i: number) => `• ${h.text.replace(/\n+/g, " ").slice(0, 220)}...`);

  const phases = [
    `🎯 Goal: ${profile?.goal || "Explore and secure an entry opportunity"}`,
    "",
    "### Phase 0 — Foundations (2–4 weeks)\nFocus: Core concepts & quick wins",
    "### Phase 1 — Skills & Tools (4–8 weeks)\nFocus: Hands-on practice + 1 capstone",
    "### Phase 2 — Portfolio & Cert (4–6 weeks)\nFocus: Publish work + certification",
    "### Phase 3 — Internships & Applications (4–8 weeks)\nFocus: Networking + internships",
    "",
    "📚 Based on our knowledge base:",
    ...bullets,
    "",
    "💡 Tip: Keep a weekly log (skills learned, projects, outcomes)."
  ];

  return phases.join("\n\n");
}

export async function POST(req: NextRequest) {
  try {
    const { profile } = await req.json();
    const roadmapText = await makeRoadmapText(profile);
    return NextResponse.json({ roadmap: roadmapText });
  } catch (err) {
    console.error("Roadmap API error:", err);
    return NextResponse.json({ roadmap: "Failed to generate roadmap." }, { status: 500 });
  }
}



















// import { NextRequest, NextResponse } from "next/server";
// import { retrieve } from "@/lib/rag";

// async function makeRoadmap(profile: any) {
//   const interest = profile?.interest || "General";
//   const level = (profile?.level || "beginner").toLowerCase();
//   const baseQuery = `roadmap ${interest} ${profile?.standard || ""} ${level}`;

//   // 🔹 Run RAG retrieval
//   const hits = await retrieve(baseQuery);

//   // 🔹 Fallback if retrieve didn't return an array
//   if (!Array.isArray(hits)) {
//     return ["Demo roadmap loaded."];
//   }

//   // 🔹 Extract text from retrieved docs
//   const roadmapPoints = hits.map((h: any) => h.pageContent || h.text || "");

//   // 🔹 Structured roadmap phases
//   const phases = [
//     { name: "Phase 0 — Foundations (2–4 weeks)", focus: "Core concepts & terminology, quick wins" },
//     { name: "Phase 1 — Skills & Tools (4–8 weeks)", focus: "Hands-on practice + 1 capstone" },
//     { name: "Phase 2 — Portfolio & Cert (4–6 weeks)", focus: "Publish work + one credible certificate" },
//     { name: "Phase 3 — Internships & Applications (4–8 weeks)", focus: "Networking + projects to internships" }
//   ];

//   // 🔹 Convert docs into summary bullets
//   const bullets = roadmapPoints
//     .map((point: string, i: number) => `• Context ${i + 1}: ${point.replace(/\n+/g, " ").slice(0, 220)}...`)
//     .join("\n");

//   // 🔹 Final structured text response
//   return [
//     `🎯 Goal: ${profile?.goal || "Explore and secure an entry opportunity"}`,
//     ``,
//     ...phases.map(p => `### ${p.name}\nFocus: ${p.focus}`),
//     ``,
//     `📚 Based on our knowledge base:`,
//     bullets,
//     ``,
//     `💡 Tip: Keep a weekly log (skills learned, projects, outcomes).`
//   ];
// }

// export async function POST(req: NextRequest) {
//   try {
//     const { profile } = await req.json();

//     const roadmap = await makeRoadmap(profile);

//     return NextResponse.json({ roadmap });
//   } catch (err: any) {
//     console.error("❌ Roadmap API Error:", err);
//     return NextResponse.json({ error: "Failed to generate roadmap" }, { status: 500 });
//   }
// }


















// import { NextRequest, NextResponse } from "next/server";
// import { retrieve } from "@/lib/rag";

// function makeRoadmap(profile: any) {
//   const interest = profile?.interest || "General";
//   const level = (profile?.level || "beginner").toLowerCase();
//   const baseQuery = `roadmap ${interest} ${profile?.standard || ""} ${level}`;
//   // const hits = retrieve(baseQuery, 4);

//   const hits = await retrieve(query);
// if (!Array.isArray(hits)) {
//   return NextResponse.json({ roadmap: ["Demo roadmap loaded."] });
// }
// const roadmap = hits.map(h => h.pageContent);
// return NextResponse.json({ roadmap });


//   const phases = [
//     { name: "Phase 0 — Foundations (2–4 weeks)", focus: "Core concepts & terminology, quick wins" },
//     { name: "Phase 1 — Skills & Tools (4–8 weeks)", focus: "Hands-on practice + 1 capstone" },
//     { name: "Phase 2 — Portfolio & Cert (4–6 weeks)", focus: "Publish work + one credible certificate" },
//     { name: "Phase 3 — Internships & Applications (4–8 weeks)", focus: "Networking + projects to internships" }
//   ];

//   const bullets = hits.map((h: any, i: number) => `• Context ${i+1}: ${h.text.replace(/\n+/g, ' ').slice(0,220)}...`).join("\n");
//   return [
//     `Goal: ${profile?.goal || "Explore and secure an entry opportunity"}`,
//     ``,
//     ...phases.map(p => `### ${p.name}\nFocus: ${p.focus}`),
//     ``,
//     `Based on our knowledge base:`,
//     bullets,
//     ``,
//     `Tip: Keep a weekly log (skills learned, projects, outcomes).`
//   ].join("\n");
// }

// export async function POST(req: NextRequest) {
//   const { profile } = await req.json();
//   return NextResponse.json({ roadmap: makeRoadmap(profile) });
// }
