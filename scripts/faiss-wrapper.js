const fs = require("fs");
const path = require("path");
const { IndexFlatIP } = require("faiss-node");
const { OllamaEmbeddings } = require("@langchain/community/embeddings/ollama");

const DATA_DIR = path.join(__dirname, "..", "data", "docs");
const INDEX_PATH = path.join(__dirname, "..", "data", "faiss_index", "vectors.json");

async function buildIndex() {
  const files = fs.existsSync(DATA_DIR)
    ? fs.readdirSync(DATA_DIR).filter((f) => f.endsWith(".txt"))
    : [];

  const texts = files.map((f) =>
    fs.readFileSync(path.join(DATA_DIR, f), "utf8")
  );

  const embeddings = new OllamaEmbeddings({ model: "nomic-embed-text:latest" });

  const vectors = await Promise.all(
    texts.map(async (text, i) => {
      const vec = await embeddings.embedQuery(text);
      return {
        id: `doc-${i}`,
        values: vec,
        metadata: { text },
      };
    })
  );

  // Save to disk for later retrieval
  fs.mkdirSync(path.dirname(INDEX_PATH), { recursive: true });
  fs.writeFileSync(INDEX_PATH, JSON.stringify(vectors, null, 2));

  console.log("✅ FAISS index saved to vectors.json");
}

buildIndex();
