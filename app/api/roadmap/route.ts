import { NextRequest, NextResponse } from "next/server";

// Helper: Deterministic 12-week plan generator
function get12WeekPlan(profile: any) {
  const interest = (profile?.interest || "General").toLowerCase();
  const level = (profile?.level || "beginner").toLowerCase();
  const weeks: string[] = [];

  if (interest.includes("data") || interest.includes("ai") || interest.includes("ml")) {
    if (level === "beginner") {
      weeks.push("Weeks 1-2: Python Basics & Core Math Review.");
      weeks.push("Weeks 3-4: SQL & Data Manipulation (Pandas).");
      weeks.push("Weeks 5-6: Introduction to ML & First Model.");
      weeks.push("Weeks 7-8: Deep Learning Intro (TensorFlow/PyTorch).");
      weeks.push("Weeks 9-10: Capstone Project: End-to-End ML Pipeline.");
      weeks.push("Weeks 11-12: Portfolio Polish & Certification Prep.");
    } else {
      weeks.push("Weeks 1-2: Advanced Stats/Math Refresher & Tool Setup (Docker).");
      weeks.push("Weeks 3-4: Advanced ML Algorithms & Model Optimization.");
      weeks.push("Weeks 5-6: MLOps Basics (Deployment, Monitoring).");
      weeks.push("Weeks 7-8: Specialization Deep Dive (LLMs / Computer Vision).");
      weeks.push("Weeks 9-10: Complex Capstone Project & Documentation.");
      weeks.push("Weeks 11-12: Interview Prep & Open Source Contribution.");
    }
  } else {
    weeks.push("Weeks 1-2: Core concepts of your chosen field.");
    weeks.push("Weeks 3-4: Master one essential tool/software.");
    weeks.push("Weeks 5-6: Complete a small, practical project.");
    weeks.push("Weeks 7-8: Research a current industry trend.");
    weeks.push("Weeks 9-10: Prepare a presentation on your project.");
    weeks.push("Weeks 11-12: Network online; update LinkedIn/Portfolio.");
  }

  return weeks;
}

// Generate roadmap text (no external model, just logic)
async function makeRoadmapText(profile: any) {
  const interest = profile?.interest || "General";
  const level = profile?.level || "beginner";
  const goal = profile?.goal || "Career Advancement";

  // Generate 12-week roadmap
  const plan = get12WeekPlan(profile);
  const planSection = plan
    .map((p, idx) => `• Week Block ${Math.floor(idx / 2) + 1}: ${p}`)
    .join("\n");

  const roadmapSections = [
    `🎯 **Primary Goal:** ${goal}`,
    `👤 **Profile:** ${profile?.standard || "N/A"} | ${interest} | ${level.toUpperCase()}`,
    "",
    "---",
    "**📘 12-Week Roadmap Summary:**",
    planSection,
    "",
    "---",
    "💡 **Tip:** Ask the AI Career Assistant for learning resources or project ideas for each week!"
  ];

  return roadmapSections.join("\n\n");
}

// API route handler
export async function POST(req: NextRequest) {
  try {
    const { profile } = await req.json();

    if (!profile || !profile.interest) {
      return NextResponse.json(
        { roadmap: "Profile data missing. Please complete onboarding." },
        { status: 400 }
      );
    }

    const roadmapText = await makeRoadmapText(profile);
    return NextResponse.json({ roadmap: roadmapText }, { status: 200 });
  } catch (err) {
    console.error("Roadmap API error:", err);
    return NextResponse.json(
      { roadmap: "Failed to generate roadmap due to an internal error." },
      { status: 500 }
    );
  }
}
