import { OllamaEmbeddings } from "@langchain/community/embeddings/ollama";

export const EMBEDDINGS = new OllamaEmbeddings({
  model: "nomic-embed-text:latest"
});
