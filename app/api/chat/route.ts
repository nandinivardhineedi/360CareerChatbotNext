// // 360CareerChatbotNext\app\api\chat\route.ts
// import { NextResponse } from "next/server";
// import ollama from "ollama"; 
// import { getRetriever } from "../../../lib/retriever"; // Now imports the store getter
// import { generateRoadmap } from "../../../lib/roadmap";
// import { getJobRecommendations } from "../../../lib/jobs";
// // Import interview.js if you want to add that intent later

// // --- Simple Intent Detection ---
// function getIntent(message: string) {
//     const lowerMsg = message.toLowerCase();
//     if (lowerMsg.includes("roadmap") || lowerMsg.includes("plan") || lowerMsg.includes("steps to become")) {
//         return { type: "roadmap" };
//     }
//     if (lowerMsg.includes("job") || lowerMsg.includes("opening") || lowerMsg.includes("recommend")) {
//         return { type: "jobs" };
//     }
//     return { type: "rag" }; // Default to RAG
// }

// // --- Simple Parameter Extraction (Improvement for Goal 4) ---
// function extractParams(message: string, history: any[]): { domain?: string, level?: string, goal?: string } {
//     const params: { [key: string]: string } = {};
    
//     // Simple keyword matching for demonstration. In a real system, you'd use an LLM call.
//     if (message.includes("Data Science")) params.domain = "Data Science";
//     if (message.includes("Cybersecurity")) params.domain = "Cybersecurity";
//     if (message.includes("AI/ML")) params.domain = "AI/ML";

//     if (message.includes("Beginner") || message.includes("beginner")) params.level = "Beginner";
//     if (message.includes("Intermediate") || message.includes("intermediate")) params.level = "Intermediate"; // Assuming you'll add this to roadmap.js

//     if (message.includes("Internship") || message.includes("internship")) params.goal = "Internship";
//     if (message.includes("Job") || message.includes("job")) params.goal = "Job";
    
//     return params;
// }


// // 360CareerChatbotNext\app\api\chat\route.ts (Updated RAG Case)
// // ... (Keep all the other imports and functions: getIntent, extractParams, generateRoadmap, etc.)

// export async function POST(req: Request) {
//     try {
//         const { message, userContext } = await req.json();
//         const detectedIntent = getIntent(message);
//         let replyContent = "";
//         let source = "LLM (RAG)";

//         const extractedParams = extractParams(message, userContext?.history || []);
        
//         switch (detectedIntent.type) {
//             // ... (roadmap and jobs cases remain the same)
//             case "roadmap": {
//                 // ... (roadmap logic)
//                 const { domain = "Data Science", level = "Beginner", goal = "Internship" } = extractedParams;
//                 const roadmap = generateRoadmap(domain, level, goal);
//                 replyContent = `Here is your personalized roadmap for **${domain}** (${level}) aiming for a **${goal}**:\n\n${roadmap}`;
//                 source = "Roadmap Generator";
//                 break;
//             }
//             case "jobs": {
//                 // ... (jobs logic)
//                 const { domain = "Data Science", goal = "Internship" } = extractedParams;
//                 const jobs = await getJobRecommendations({ domain, goal });
//                 replyContent = `Here are some job recommendations for a **${domain}** role targeting a **${goal}**:\n\n${jobs.join('\n')}`;
//                 source = "Job Recommender";
//                 break;
//             }
//             case "rag":
//             default: {
//                 // Goals 1, 2 & 3: RAG implementation
                
//                 // *** NEW: Handle simple greetings first ***
//                 if (message.toLowerCase().trim() === "hello" || message.toLowerCase().trim() === "hi") {
//                     replyContent = "Hello! How can I assist you with your career path, skills, or job search today?";
//                     source = "Simple Greeting";
//                     break;
//                 }

//                 const retriever = getRetriever(5); 
//                 const docs = await retriever.getRelevantDocuments(message);
//                 const context = docs.map(d => d.pageContent).join("\n\n--- New Document ---\n\n");

//                 // *** IMPROVED PROMPT: Stricter instruction on context ***
//                 // *** IMPROVED PROMPT: Stricter instruction on context and brevity ***
//                 const prompt = `You are an intelligent career assistant.
// Answer the 'User Question' based on the 'Context from Knowledge Base'.
// - If the context provides sufficient information, use it to form a clear, bulleted/numbered answer.
// - If the context is empty or insufficient, answer using your general knowledge but **DO NOT** mention the context being empty or repeat these instructions.
// - Always respond **concisely** using clear bullet points or numbered lists. Keep the total answer length to a minimum, focusing only on essential points.

// [Chat History]
// ${userContext?.history || ''}
// [Context from Knowledge Base]
// ${context}
// User Question: ${message}
// `;

//                 const response = await ollama.chat({
//                     model: "gemma3:latest",
//                     messages: [{ role: "user", content: prompt }],
//                 });
                
//                 replyContent = response.message.content;
//                 source = "RAG System";
//                 break;
//             }
//         }

//         console.log(`Request handled by: ${source}`);
//         return NextResponse.json({ reply: replyContent });

//     } catch (err) {
//         console.error("Chat API Error:", err);
//         return NextResponse.json({ error: "Error processing your request." }, { status: 500 });
//     }
// }
// 360CareerChatbotNext\app\api\chat\route.ts
import { NextResponse } from "next/server";
import ollama from "ollama"; 
import { getRetriever } from "../../../lib/retriever"; // Now imports the store getter
import { generateRoadmap } from "../../../lib/roadmap";
import { getJobRecommendations } from "../../../lib/jobs";
// Import interview.js if you want to add that intent later

// --- Simple Intent Detection ---
function getIntent(message: string) {
    const lowerMsg = message.toLowerCase();
    if (lowerMsg.includes("roadmap") || lowerMsg.includes("plan") || lowerMsg.includes("steps to become")) {
        return { type: "roadmap" };
    }
    if (lowerMsg.includes("job") || lowerMsg.includes("opening") || lowerMsg.includes("recommend")) {
        return { type: "jobs" };
    }
    return { type: "rag" }; // Default to RAG
}

// --- Simple Parameter Extraction (Improvement for Goal 4) ---
function extractParams(message: string, history: any[]): { domain?: string, level?: string, goal?: string } {
    const params: { [key: string]: string } = {};
    
    // Simple keyword matching for demonstration.
    if (message.includes("Data Science")) params.domain = "Data Science";
    if (message.includes("Cybersecurity")) params.domain = "Cybersecurity";
    if (message.includes("AI/ML")) params.domain = "AI/ML";

    if (message.includes("Beginner") || message.includes("beginner")) params.level = "Beginner";
    if (message.includes("Intermediate") || message.includes("intermediate")) params.level = "Intermediate"; 

    if (message.includes("Internship") || message.includes("internship")) params.goal = "Internship";
    if (message.includes("Job") || message.includes("job")) params.goal = "Job";
    
    return params;
}


export async function POST(req: Request) {
    try {
        const { message, userContext } = await req.json();
        const detectedIntent = getIntent(message);
        let replyContent = "";
        let source = "LLM (RAG)";

        const extractedParams = extractParams(message, userContext?.history || []);
        
        switch (detectedIntent.type) {
            case "roadmap": {
                // Ensure defaults are provided as TypeScript expects 'level' might be missing
                const { domain = "Data Science", level = "Beginner", goal = "Internship" } = extractedParams;
                const roadmap = generateRoadmap(domain, level, goal);
                replyContent = `Here is your personalized roadmap for **${domain}** (${level}) aiming for a **${goal}**:\n\n${roadmap}`;
                source = "Roadmap Generator";
                break;
            }
            case "jobs": {
                // FIX: Provide a default value for 'level' here as it's required by the call signature
                const { domain = "Data Science", level = "Any Level", goal = "Internship" } = extractedParams; 
                
                // Pass the resolved object to the function
                const jobs = await getJobRecommendations({ domain, goal, level }); 
                
                replyContent = `Here are some job recommendations for a **${domain}** role targeting a **${goal}**:\n\n${jobs.join('\n')}`;
                source = "Job Recommender";
                break;
            }
            case "rag":
            default: {
                // Goals 1, 2 & 3: RAG implementation
                
                // *** NEW: Handle simple greetings first ***
                if (message.toLowerCase().trim() === "hello" || message.toLowerCase().trim() === "hi") {
                    replyContent = "Hello! How can I assist you with your career path, skills, or job search today?";
                    source = "Simple Greeting";
                    break;
                }

                const retriever = getRetriever(5); 
                const docs = await retriever.getRelevantDocuments(message);
                const context = docs.map(d => d.pageContent).join("\n\n--- New Document ---\n\n");

                // *** IMPROVED PROMPT: Stricter instruction on context and brevity ***
                const prompt = `You are an intelligent career assistant.
Answer the 'User Question' based on the 'Context from Knowledge Base'.
- If the context provides sufficient information, use it to form a clear, bulleted/numbered answer.
- If the context is empty or insufficient, answer using your general knowledge but **DO NOT** mention the context being empty or repeat these instructions.
- Always respond **concisely** using clear bullet points or numbered lists. Keep the total answer length to a minimum, focusing only on essential points.

[Chat History]
${userContext?.history || ''}
[Context from Knowledge Base]
${context}
User Question: ${message}
`;

                const response = await ollama.chat({
                    model: "gemma3:latest",
                    messages: [{ role: "user", content: prompt }],
                });
                
                replyContent = response.message.content;
                source = "RAG System";
                break;
            }
        }

        console.log(`Request handled by: ${source}`);
        return NextResponse.json({ reply: replyContent });

    } catch (err) {
        console.error("Chat API Error:", err);
        return NextResponse.json({ error: "Error processing your request." }, { status: 500 });
    }
}