// 360CareerChatbotNext\lib\retriever.ts

import fs from "fs";
import path from "path";
import { Document } from "@langchain/core/documents";
import { EMBEDDINGS } from "./embeddings";

const DATA_DIR = path.join(process.cwd(), "data", "docs");
const INDEX_DIR = path.join(process.cwd(), "data", "faiss_index"); 

let vectorStoreRetriever: any = null;
let isInitialized: boolean = false;

export async function initializeStore() {
    if (isInitialized) return;
    
    try {
        // Dynamically require faiss-node which is CJS, necessary for native modules sometimes
        const FaissStore = require("faiss-node").default; 

        // --- Index Creation/Loading Logic ---
        const faiss = new FaissStore(INDEX_DIR);
        
        const files = fs.existsSync(DATA_DIR)
            ? fs.readdirSync(DATA_DIR).filter((f) => f.endsWith(".txt"))
            : [];

        if (files.length === 0) {
            console.warn("🟡 No documentation files found in data/docs. RAG will be empty.");
            vectorStoreRetriever = { asRetriever: () => ({ getRelevantDocuments: async (query: string) => [] }) };
            isInitialized = true;
            return;
        }

        // Check for index file to decide if rebuilding is necessary
        const indexExists = fs.existsSync(path.join(INDEX_DIR, "index.faiss")); 
        
        if (!indexExists) {
            console.log("🔵 Building FAISS index from scratch...");
            const allDocs: Document[] = [];
            for (const file of files) {
                const text = fs.readFileSync(path.join(DATA_DIR, file), "utf8");
                allDocs.push(new Document({ pageContent: text }));
            }
            
            const vectors = await Promise.all(
                allDocs.map(async (doc, i) => {
                    const embedding = await EMBEDDINGS.embedQuery(doc.pageContent);
                    return {
                        id: `doc-${i}`,
                        values: embedding,
                        metadata: { text: doc.pageContent },
                    };
                })
            );
            await faiss.save(vectors); 
            console.log("✅ FAISS index built and saved.");
        } else {
            console.log("✅ FAISS index loaded from disk.");
        }
        
        // --- Retriever Interface ---
        vectorStoreRetriever = {
            asRetriever: (k = 6) => ({
                getRelevantDocuments: async (query: string) => {
                    const queryVector = await EMBEDDINGS.embedQuery(query);
                    const results = await faiss.search(queryVector, k); // Addresses Goal 3 (Efficiency)
                    return results.map(
                        (r: any) => new Document({ pageContent: r.metadata.text })
                    );
                },
            }),
        };
        isInitialized = true;
        
    } catch (err) {
        // CATCH THE FATAL ERROR HERE
        console.error("🔴 FATAL: Failed to initialize FAISS Vector Store. RAG will be disabled.", err);
        // Fallback: Create a dummy store that always returns empty results
        vectorStoreRetriever = { 
            asRetriever: () => ({ 
                getRelevantDocuments: async (query: string) => [] 
            }) 
        };
        isInitialized = true;
    }
}

// Export the getter for the retriever object
export function getRetriever(k?: number) {
    if (!isInitialized) {
        // In case the API is hit before the top-level initialization resolves/catches.
        console.warn("⚠️ RAG Retriever accessed before initialization completed. Attempting re-initialization...");
        initializeStore(); 
    }
    if (!vectorStoreRetriever) {
        throw new Error("Vector Store not ready after initialization attempt.");
    }
    return vectorStoreRetriever.asRetriever(k); 
}

// Call initialization when the module loads, relying on the try/catch above
initializeStore();