import ollama from 'ollama';

async function main() {
  const response = await ollama.chat({
    model: 'gemma3:latest',
    messages: [
      { role: 'user', content: 'Hello, how are you?' }
    ],
  });

  console.log(response.message.content);
}

main().catch(console.error);
 