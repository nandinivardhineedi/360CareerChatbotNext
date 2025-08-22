// lib/rag.js
// Lightweight local RAG + deterministic synthesizer for demo.
// Uses files placed in /data/seeds/*.txt.
// Optional: if GOOGLE_API_KEY present and @google/generative-ai installed,
// the server will attempt to polish the generated answer (non-blocking).

import fs from "fs";
import path from "path";

const SEEDS_DIR = path.join(process.cwd(), "data", "seeds");

// -------------------- utilities --------------------
function splitIntoChunks(text) {
  // Split on headings or into 1000-char chunks
  const parts = text.split(/\n\s*---+\s*\n|(?:\n#+\s+)/).map((p) => p.trim()).filter(Boolean);
  const chunks = [];
  for (const p of parts) {
    if (p.length <= 1000) chunks.push(p);
    else for (let i = 0; i < p.length; i += 1000) chunks.push(p.slice(i, i + 1000));
  }
  return chunks;
}

function score(query, chunk) {
  // Very simple keyword scoring (works well for demo)
  const q = query.toLowerCase();
  let s = 0;
  for (const token of q.split(/[^a-z0-9]+/).filter(Boolean)) {
    if (new RegExp(`\\b${token}\\b`, "i").test(chunk)) s += 3;
    if (chunk.toLowerCase().includes(token)) s += 1;
  }
  if (/^(\s*)(AI|Data|Science|Career|Skill|Roadmap|Skill Trends)/i.test(chunk)) s += 1.5;
  return s;
}

// -------------------- load knowledge --------------------
let MEMO = null;
export function loadKnowledge() {
  if (MEMO) return MEMO;
  const files = fs.existsSync(SEEDS_DIR) ? fs.readdirSync(SEEDS_DIR).filter((f) => f.endsWith(".txt")) : [];
  const docs = [];
  for (const f of files) {
    const text = fs.readFileSync(path.join(SEEDS_DIR, f), "utf8");
    const chunks = splitIntoChunks(text);
    for (let i = 0; i < chunks.length; i++) docs.push({ id: `${f}:${i}`, text: chunks[i] });
  }
  MEMO = docs;
  return docs;
}

// -------------------- retrieval --------------------
export function retrieve(query, k = 6) {
  const docs = loadKnowledge();
  if (!docs || docs.length === 0) return []; // empty array fallback
  const ranked = docs.map((d) => ({ d, s: score(query, d.text) }))
    .sort((a, b) => b.s - a.s)
    .slice(0, k)
    .map((x) => x.d);
  return ranked;
}

// -------------------- small helpers for content extraction --------------------
function topKeywordsFromHits(hits, max = 6) {
  const text = hits.map(h => h.text).join(" ").toLowerCase();
  const tokens = text.match(/\b[a-z]{3,}\b/g) || [];
  const freq = {};
  tokens.forEach(t => freq[t] = (freq[t]||0)+1);
  // prefer known skill tokens
  const common = ["python","sql","machine","data","ml","statistics","matlab","r","cloud","aws","azure","docker","git","javascript","react","cad","staa","design","ux","deep","neural","nlp"].filter(Boolean);
  const candidates = Object.keys(freq).sort((a,b)=>freq[b]-freq[a]);
  const picks = [];
  for (const c of [...common, ...candidates]) {
    if (picks.length >= max) break;
    if (text.includes(c) && !picks.includes(c)) picks.push(c);
  }
  return picks.map(p => (p[0].toUpperCase()+p.slice(1)));
}

// -------------------- 12-week plan generator --------------------
function generate12WeekPlan(profile) {
  const interest = (profile?.interest || "General").toLowerCase();
  const level = (profile?.level || "beginner").toLowerCase();
  const weeks = [];
  // baseline modules
  if (interest.includes("data") || interest.includes("ai") || interest.includes("ml")) {
    // data/ai plan
    if (level === "beginner") {
      weeks.push("Weeks 1-2: Revise math fundamentals (basic probability, linear algebra) and NCERT science concepts.");
      weeks.push("Weeks 3-4: Learn Python basics (syntax, data types, loops, functions).");
      weeks.push("Weeks 5-6: Intro to data handling (Pandas) + SQL basics; small data cleaning tasks.");
      weeks.push("Weeks 7-8: Learn core ML concepts (supervised learning) and try sklearn models on a simple dataset.");
      weeks.push("Weeks 9-10: Build mini project: classification pipeline + write a short report.");
      weeks.push("Weeks 11-12: Prepare portfolio entry; take an introductory online course/cert (Coursera/NPTEL) and document learnings.");
    } else {
      weeks.push("Weeks 1-2: Quick refresh of advanced math/statistics topics relevant to ML.");
      weeks.push("Weeks 3-4: Intermediate Python + data libraries (NumPy, Pandas) and SQL for analytics.");
      weeks.push("Weeks 5-6: Study ML algorithms (trees, SVM, neural nets) and implement examples.");
      weeks.push("Weeks 7-8: Hands-on deep learning intro (TensorFlow/PyTorch basics).");
      weeks.push("Weeks 9-10: Capstone project (end-to-end) and create visuals for results.");
      weeks.push("Weeks 11-12: Prepare portfolio & apply for internships; take one certification.");
    }
  } else if (interest.includes("design") || interest.includes("ui") || interest.includes("ux")) {
    weeks.push("Weeks 1-2: Fundamentals of design, user research basics.");
    weeks.push("Weeks 3-4: Wireframing & prototyping tools (Figma basics).");
    weeks.push("Weeks 5-6: Interaction design & small usability study.");
    weeks.push("Weeks 7-8: Build a small product prototype and test.");
    weeks.push("Weeks 9-10: Polish portfolio piece, document process.");
    weeks.push("Weeks 11-12: Publish portfolio and apply to internships/junior roles.");
  } else {
    // general STEM / scientist plan
    weeks.push("Weeks 1-2: Strengthen core science fundamentals relevant to your stream.");
    weeks.push("Weeks 3-4: Learn data analysis basics (Excel/Google Sheets) and basic Python.");
    weeks.push("Weeks 5-6: Design a mini experiment or data study around your interest.");
    weeks.push("Weeks 7-8: Work on results & write a report; learn literature search basics.");
    weeks.push("Weeks 9-10: Take an introductory certification (NPTEL/Coursera) related to your field.");
    weeks.push("Weeks 11-12: Prepare presentation/portfolio; seek mentorship/internship opportunities.");
  }
  // if shorter than 12 weeks, expand by splitting groups into weeks
  while (weeks.length < 6) weeks.push("Self-study and consolidation.");
  return weeks;
}

// -------------------- synthesize answer (deterministic local) --------------------
export function synthesizeAnswer(query, profile = {}, hits = []) {
  // If hits is not array, coerce
  hits = Array.isArray(hits) ? hits : [];

  // 1) Short career summary: use profile + hits
  const namePart = profile?.name ? `${profile.name}, ` : "";
  const interest = profile?.interest || "your chosen field";
  const summary = `${namePart}based on your interest in ${interest} and level (${profile?.level || "beginner"}), here is a concise plan and skills to focus on.`;

  // 2) Top recommended skills/certs (heuristic)
  let skills = topKeywordsFromHits(hits, 5);
  if (skills.length === 0) {
    // fallback by interest
    const intLower = interest.toLowerCase();
    if (intLower.includes("data") || intLower.includes("ai") || intLower.includes("ml")) {
      skills = ["Python", "SQL", "Statistics", "Machine Learning", "Data Visualization"];
    } else if (intLower.includes("design")) {
      skills = ["Design Thinking", "Figma", "Wireframing", "Prototyping", "User Research"];
    } else {
      skills = ["Core Subject Mastery", "Basic Data Skills", "Research & Documentation"];
    }
  }

  // 3) Short step-by-step next steps (generic)
  const steps = [
    "Strengthen your theory/fundamentals (NCERT / course-specific basics).",
    "Learn one practical tool/tech (e.g., Python for data or Figma for design).",
    "Build a small, demonstrable project (document results).",
    "Take one recognized course/certification and publish your work.",
  ];

  // 4) Two sample projects - tailored by interest
  let projects = [];
  const intLower = interest.toLowerCase();
  if (intLower.includes("data") || intLower.includes("ai") || intLower.includes("ml")) {
    projects = [
      "Project 1 — Classify a dataset (end-to-end): Data cleaning → model → evaluation → write-up.",
      "Project 2 — Data visualization report on a public dataset (publish on GitHub).",
    ];
  } else if (intLower.includes("design")) {
    projects = [
      "Project 1 — Complete a 2-week UX case study: research → wireframes → prototype.",
      "Project 2 — Redesign a small app page and document UX decisions.",
    ];
  } else {
    projects = [
      "Project 1 — Conduct a small experiment or study and write the results.",
      "Project 2 — Create a presentation/summary of learnings and share it publicly.",
    ];
  }

  // 5) If the user asked for a 12-week plan, generate it
  const want12Week = /\b(12[- ]?week|twelve week|12 week plan|create a 12 week plan)\b/i.test(query);
  const planSection = want12Week ? generate12WeekPlan(profile).map((p, idx) => `Week block ${idx+1}: ${p}`) : [];

  // 6) Build final structured string
  const out = [
    `Summary: ${summary}`,
    "",
    "Recommended skills & certifications:",
    ...skills.map(s => `- ${s}`),
    "",
    "Next Steps:",
    ...steps.map(s => `- ${s}`),
    "",
    "Sample Projects:",
    ...projects.map((p, i) => `${i+1}. ${p}`),
    "",
    ...(planSection.length ? ["12-week plan:", ...planSection, ""] : []),
    "Motivation: Take small consistent steps — progress compounds faster than you think!",
  ];

  return out.join("\n");
}
















// import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
// import { MemoryVectorStore } from "langchain/vectorstores/memory";
// import { Document } from "langchain/document";
// import fs from "fs";
// import path from "path";
// import { GoogleGenerativeAIEmbeddings, ChatGoogleGenerativeAI } from "@langchain/google-genai";

// let store;

// export async function initStore() {
//   if (store) return store;

//   const apiKey = process.env.GOOGLE_API_KEY;
//   if (!apiKey) {
//     console.warn("⚠️ GOOGLE_API_KEY missing, using mock vector store");
//     // ✅ Return fake store with similaritySearch fallback
//     return {
//       similaritySearch: async () => [
//         new Document({ pageContent: "1. Learn basics of Python, SQL" }),
//         new Document({ pageContent: "2. Specialize in AI/ML or Data Science" }),
//         new Document({ pageContent: "3. Earn certifications (Coursera, AWS, Azure)" }),
//         new Document({ pageContent: "4. Apply for internships & entry-level roles" }),
//       ],
//     };
//   }

//   // ✅ Load your dataset
//   const datasetPath = path.join(process.cwd(), "public", "dataset_career_path.txt");
//   const rawText = fs.readFileSync(datasetPath, "utf8");

//   const splitter = new RecursiveCharacterTextSplitter({ chunkSize: 500, chunkOverlap: 50 });
//   const docs = await splitter.splitDocuments([new Document({ pageContent: rawText })]);

//   const embeddings = new GoogleGenerativeAIEmbeddings({ apiKey });
//   store = await MemoryVectorStore.fromDocuments(docs, embeddings);

//   return store;
// }

// export async function retrieve(query) {
//   const store = await initStore();
//   return store.similaritySearch(query, 4);
// }

// // 🔹 Generate
// export async function synthesizeAnswer(query, docs) {
//   const llm = new ChatGoogleGenerativeAI({
//     apiKey: process.env.GOOGLE_API_KEY,
//     model: "gemini-pro",
//     temperature: 0.4,
//   });

//   const context = docs.map((d) => d.pageContent).join("\n\n");

//   const prompt = new PromptTemplate({
//     template: `
// You are AI 360 Career Bot. 
// Provide a clear, actionable career guidance response.

// Context:
// {context}

// Question:
// {question}

// Answer:
// - Summarize main path.
// - List 3–4 essential skills/certs.
// - Suggest 2 mini projects.
//     `,
//     inputVariables: ["context", "question"],
//   });

//   const input = await prompt.format({ context, question: query });
//   const response = await llm.invoke(input);

//   return response.content || response.text || "Sorry, I could not generate a response.";
// }


















// import fs from "fs";
// import path from "path";
// import { GoogleGenerativeAIEmbeddings, ChatGoogleGenerativeAI } from "@langchain/google-genai";
// import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
// import { PromptTemplate } from "@langchain/core/prompts";
// import { MemoryVectorStore } from "langchain/vectorstores/memory";

// // Initialize vector store
// let vectorStore;

// async function initStore() {
//   if (!vectorStore) {
//     const apiKey = process.env.GOOGLE_API_KEY;
//     if (!apiKey) {
//       // throw new Error("❌ GOOGLE_API_KEY is not set. Please add it to .env.local and restart.");
//       console.warn("⚠️ GOOGLE_API_KEY missing, using mock response...");
//     return `
// 1. Learn Python + SQL basics  
// 2. Move into Data Science or ML specialization  
// 3. Do certifications (Coursera, AWS, Azure)  
// 4. Apply for internships & entry-level jobs  
//     `;
//     }

//     const embeddings = new GoogleGenerativeAIEmbeddings({
//       apiKey,
//       model: "gemini-pro",
//     });

//     vectorStore = new MemoryVectorStore(embeddings);

//     // preload dataset
//     const datasetPath = path.join(process.cwd(), "data", "dataset_career_path.txt");
//     if (fs.existsSync(datasetPath)) {
//       const text = fs.readFileSync(datasetPath, "utf8");
//       const splitter = new RecursiveCharacterTextSplitter({ chunkSize: 500, chunkOverlap: 50 });
//       const docs = await splitter.createDocuments([text]);
//       await vectorStore.addDocuments(docs);
//     }
//   }
//   return vectorStore;
// }

// // 🔹 Retrieve
// export async function retrieve(query) {
//   const store = await initStore();
//   return store.similaritySearch(query, 4);
// }

// // 🔹 Generate
// export async function synthesizeAnswer(query, docs) {
//   const llm = new ChatGoogleGenerativeAI({
//     apiKey: process.env.GOOGLE_API_KEY,
//     model: "gemini-pro",
//     temperature: 0.4,
//   });

//   const context = docs.map((d) => d.pageContent).join("\n\n");

//   const prompt = new PromptTemplate({
//     template: `
// You are AI 360 Career Bot. 
// Provide a clear, actionable career guidance response.

// Context:
// {context}

// Question:
// {question}

// Answer:
// - Summarize main path.
// - List 3–4 essential skills/certs.
// - Suggest 2 mini projects.
//     `,
//     inputVariables: ["context", "question"],
//   });

//   const input = await prompt.format({ context, question: query });
//   const response = await llm.invoke(input);

//   return response.content || response.text || "Sorry, I could not generate a response.";
// }















// import fs from "fs";
// import path from "path";
// import { GoogleGenerativeAIEmbeddings, ChatGoogleGenerativeAI } from "@langchain/google-genai";
// import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
// import { PromptTemplate } from "@langchain/core/prompts";
// import { MemoryVectorStore } from "langchain/vectorstores/memory";

// // Create memory store once
// const storePath = path.join(process.cwd(), "data/memory_store.json");

// // Load or init memory
// let vectorStore;
// async function initStore() {
//   if (!vectorStore) {
//     const embeddings = new GoogleGenerativeAIEmbeddings({
//       apiKey: process.env.GOOGLE_API_KEY,
//       model: "embedding-001",
//     });

//     vectorStore = new MemoryVectorStore(embeddings);

//     // preload dataset if available
//     const datasetPath = path.join(process.cwd(), "data", "dataset_career_path.txt");
//     if (fs.existsSync(datasetPath)) {
//       const text = fs.readFileSync(datasetPath, "utf8");
//       const splitter = new RecursiveCharacterTextSplitter({ chunkSize: 500, chunkOverlap: 50 });
//       const docs = await splitter.createDocuments([text]);
//       await vectorStore.addDocuments(docs);
//     }
//   }
//   return vectorStore;
// }

// // 🔹 Retrieve relevant docs
// export async function retrieve(query) {
//   const store = await initStore();
//   return store.similaritySearch(query, 4);
// }

// // 🔹 Synthesize final answer
// export async function synthesizeAnswer(query, docs) {
//   const llm = new ChatGoogleGenerativeAI({
//     apiKey: process.env.GOOGLE_API_KEY,
//     model: "gemini-pro",
//     temperature: 0.4,
//   });

//   const context = docs.map((d) => d.pageContent).join("\n\n");

//   const prompt = new PromptTemplate({
//     template: `
// You are AI 360 Career Bot. 
// Use the context below to answer the question.

// Context:
// {context}

// Question:
// {question}

// Answer in clear, actionable career guidance steps.
//     `,
//     inputVariables: ["context", "question"],
//   });

//   const input = await prompt.format({ context, question: query });
//   const response = await llm.invoke(input);

//   return response.content || response.text || "Sorry, I could not generate a response.";
// }


















// import fs from "fs";
// import path from "path";
// // import { GoogleGenerativeAIEmbeddings, ChatGoogleGenerativeAI } from "@langchain/google-genai";


// // import { GoogleGenerativeAIEmbeddings, ChatGoogleGenerativeAI } from "langchain/google-genai";
// // import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
// // import { PromptTemplate } from "@langchain/core/prompts";
// // import { MemoryVectorStore } from "langchain/vectorstores/memory";

// import { GoogleGenerativeAIEmbeddings, ChatGoogleGenerativeAI } from "@langchain/google-genai";
// import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
// import { PromptTemplate } from "@langchain/core/prompts";
// import { MemoryVectorStore } from "langchain/vectorstores/memory";

// const INDEX_FILE = path.join(process.cwd(), "data", "index", "memory_store.json");

// // Embeddings + LLM
// const EMBEDDINGS = new GoogleGenerativeAIEmbeddings({
//   apiKey: process.env.GEMINI_API_KEY,
//   model: "text-embedding-004",
// });

// const LLM = new ChatGoogleGenerativeAI({
//   apiKey: process.env.GEMINI_API_KEY,
//   model: "gemini-1.5-pro",
//   temperature: 0.3,
//   maxOutputTokens: 1024,
// });

// // 🔹 System prompt ensures structured, user-friendly answers
// const SYSTEM_PROMPT = `
// You are AI 360 Career Assistant.
// Your job: give clear, structured, motivating career advice.

// Rules:
// - DO NOT dump raw text from sources.
// - Summarize insights into easy-to-read guidance.
// - Use bullet points for skills, certifications, and steps.
// - If asked for a plan, give a week-by-week roadmap.
// - Always end with 1 motivational line.
// `;

// const QA_TEMPLATE = PromptTemplate.fromTemplate(`
// {system}

// User Profile:
// - Name: {name}
// - Class/Standard: {standard}
// - Interest: {interest}
// - Level: {level}
// - Goal: {goal}

// Retrieved Knowledge Base Context:
// {context}

// User Question:
// {question}

// Now respond with:
// 1. Short Career Summary (2–3 lines)
// 2. Recommended Skills & Certifications
// 3. Step-by-Step Career Roadmap
// 4. 2 Sample Projects (mini or capstone)
// 5. Motivational Closing (1 line)
// `);

// export class RAGEngine {
//   constructor() {
//     this.vectorStore = null;
//   }

//   async loadOrCreateStore() {
//     if (this.vectorStore) return;

//     try {
//       if (fs.existsSync(INDEX_FILE)) {
//         const raw = fs.readFileSync(INDEX_FILE, "utf-8");
//         const docs = JSON.parse(raw);
//         this.vectorStore = await MemoryVectorStore.fromDocuments(docs, EMBEDDINGS);
//       } else {
//         this.vectorStore = new MemoryVectorStore(EMBEDDINGS);
//         this.saveStore();
//       }
//     } catch (e) {
//       console.error("⚠️ Error loading store:", e);
//       this.vectorStore = new MemoryVectorStore(EMBEDDINGS);
//     }
//   }

//   saveStore() {
//     if (!this.vectorStore) return;
//     const data = this.vectorStore.memoryVectors || [];
//     fs.mkdirSync(path.dirname(INDEX_FILE), { recursive: true });
//     fs.writeFileSync(INDEX_FILE, JSON.stringify(data, null, 2), "utf-8");
//   }

//   async ingestRawText(text, metadata = {}) {
//     await this.loadOrCreateStore();
//     const splitter = new RecursiveCharacterTextSplitter({ chunkSize: 1000, chunkOverlap: 200 });
//     const docs = await splitter.createDocuments([text], [metadata]);
//     await this.vectorStore.addDocuments(docs);
//     this.saveStore();
//     return { added: docs.length };
//   }

//   async retrieveContext(query, k = 4) {
//     await this.loadOrCreateStore();
//     const retriever = this.vectorStore.asRetriever(k);
//     const docs = await retriever.getRelevantDocuments(query);
//     return docs.map((d) => d.pageContent).join("\n\n");
//   }

//   async answer(profile, question) {
//     await this.loadOrCreateStore();
//     const context = await this.retrieveContext(question);

//     const prompt = await QA_TEMPLATE.format({
//       system: SYSTEM_PROMPT,
//       context,
//       question,
//       ...profile, // includes {name, standard, interest, level, goal}
//     });

//     const response = await LLM.invoke(prompt);
//     return response.content?.[0]?.text || response.text || String(response);
//   }
// }

// export const rag = new RAGEngine();


















// import fs from "fs"; import path from "path";
// const DATA_DIR=path.join(process.cwd(),"data","seeds");
// function splitIntoChunks(text){
//   const parts=text.split(/\n\s*---+\s*\n|\n# /g).map(p=>p.trim()).filter(Boolean);
//   const chunks=[]; for(const p of parts){ if(p.length<=1200){chunks.push(p);} else{ for(let i=0;i<p.length;i+=1200){chunks.push(p.slice(i,i+1200));}}} return chunks;
// }
// function score(query,chunk){ const q=query.toLowerCase(); let s=0;
//   for(const token of q.split(/[^a-z0-9+]+/g)){ if(!token)continue; const re=new RegExp(`\\b${token.replace(/[.*+?^${}()|[\\]\\]/g,'\\$&')}\\b`,"i"); if(re.test(chunk)) s+=2; if(chunk.toLowerCase().includes(token)) s+=1; }
//   if(/^\s*(AI|Data|Cloud|Cyber|Software|Design|Commerce|Medical|Law|Career)/i.test(chunk)) s+=1.5;
//   return s;
// }
// export function loadKnowledge(){ const files=fs.readdirSync(DATA_DIR).filter(f=>f.endsWith(".txt")); const docs=[];
//   for(const f of files){ const text=fs.readFileSync(path.join(DATA_DIR,f),"utf-8"); const chunks=splitIntoChunks(text).map((c,i)=>({id:`${f}:${i}`,text:c})); docs.push(...chunks);} return docs; }
// const MEMO={docs:null}; export function getDocs(){ if(!MEMO.docs) MEMO.docs=loadKnowledge(); return MEMO.docs; }
// export function retrieve(query,k=6){ const docs=getDocs(); const ranked=docs.map(d=>({d,s:score(query,d.text)})).sort((a,b)=>b.s-a.s).slice(0,k).map(x=>x.d); return ranked; }
// export function synthesizeAnswer(query,profile,hits){
//   const header=profile?.name?`For ${profile.name} (${profile.standard}, interest: ${profile.interest}, level: ${profile.level})\n\n`:"";
//   const context=hits.map(h=>`• ${h.text.replace(/\n+/g,' ').slice(0,300)}...`).join("\n");
//   const promptLike=[`Question: ${query}`,`Context (snippets):\n${context}`,`Guidelines: Provide a concise, actionable answer with steps, recommended skills/certs, and 2 sample projects. Align with the user's level and goal if provided.`].join("\n\n");
//   const steps=["Start with foundations (core subjects & terminology).","Build practical skills via a short project.","Earn one reputed certification relevant to your track.","Join a community; apply for internships or challenges."].join("\n- ");
//   const rec=hits[0]?.text?.slice(0,200)||"";
//   return `${header}${promptLike}\n\nAnswer:\n- ${steps}\n\nBased on the context, focus on: ${rec}...\n\nSample projects:\n1) Mini capstone aligned to your interest (document outcomes).\n2) Portfolio piece (publish on GitHub/Behance).\n\nYou can ask follow-ups like: "Which cert first?" or "Create a 12-week plan."`;
// }
