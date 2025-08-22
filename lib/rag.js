import fs from "fs"; import path from "path";
const DATA_DIR=path.join(process.cwd(),"data","seeds");
function splitIntoChunks(text){
  const parts=text.split(/\n\s*---+\s*\n|\n# /g).map(p=>p.trim()).filter(Boolean);
  const chunks=[]; for(const p of parts){ if(p.length<=1200){chunks.push(p);} else{ for(let i=0;i<p.length;i+=1200){chunks.push(p.slice(i,i+1200));}}} return chunks;
}
function score(query,chunk){ const q=query.toLowerCase(); let s=0;
  for(const token of q.split(/[^a-z0-9+]+/g)){ if(!token)continue; const re=new RegExp(`\\b${token.replace(/[.*+?^${}()|[\\]\\]/g,'\\$&')}\\b`,"i"); if(re.test(chunk)) s+=2; if(chunk.toLowerCase().includes(token)) s+=1; }
  if(/^\s*(AI|Data|Cloud|Cyber|Software|Design|Commerce|Medical|Law|Career)/i.test(chunk)) s+=1.5;
  return s;
}
export function loadKnowledge(){ const files=fs.readdirSync(DATA_DIR).filter(f=>f.endsWith(".txt")); const docs=[];
  for(const f of files){ const text=fs.readFileSync(path.join(DATA_DIR,f),"utf-8"); const chunks=splitIntoChunks(text).map((c,i)=>({id:`${f}:${i}`,text:c})); docs.push(...chunks);} return docs; }
const MEMO={docs:null}; export function getDocs(){ if(!MEMO.docs) MEMO.docs=loadKnowledge(); return MEMO.docs; }
export function retrieve(query,k=6){ const docs=getDocs(); const ranked=docs.map(d=>({d,s:score(query,d.text)})).sort((a,b)=>b.s-a.s).slice(0,k).map(x=>x.d); return ranked; }
export function synthesizeAnswer(query,profile,hits){
  const header=profile?.name?`For ${profile.name} (${profile.standard}, interest: ${profile.interest}, level: ${profile.level})\n\n`:"";
  const context=hits.map(h=>`• ${h.text.replace(/\n+/g,' ').slice(0,300)}...`).join("\n");
  const promptLike=[`Question: ${query}`,`Context (snippets):\n${context}`,`Guidelines: Provide a concise, actionable answer with steps, recommended skills/certs, and 2 sample projects. Align with the user's level and goal if provided.`].join("\n\n");
  const steps=["Start with foundations (core subjects & terminology).","Build practical skills via a short project.","Earn one reputed certification relevant to your track.","Join a community; apply for internships or challenges."].join("\n- ");
  const rec=hits[0]?.text?.slice(0,200)||"";
  return `${header}${promptLike}\n\nAnswer:\n- ${steps}\n\nBased on the context, focus on: ${rec}...\n\nSample projects:\n1) Mini capstone aligned to your interest (document outcomes).\n2) Portfolio piece (publish on GitHub/Behance).\n\nYou can ask follow-ups like: "Which cert first?" or "Create a 12-week plan."`;
}
