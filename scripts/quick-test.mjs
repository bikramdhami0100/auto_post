import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

// Load .env.local
const envRaw = readFileSync(resolve(__dirname, "..", ".env.local"), "utf-8");
const env = {};
for (const line of envRaw.split("\n")) {
  const t = line.trim();
  if (t && !t.startsWith("#")) {
    const i = t.indexOf("=");
    if (i > 0) env[t.substring(0, i)] = t.substring(i + 1);
  }
}

async function main() {
  console.log("=== Testing DeepSeek API ===\n");
  const resp = await fetch("https://api.deepseek.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${env.DEEPSEEK_API_KEY}`,
    },
    body: JSON.stringify({
      model: "deepseek-chat",
      messages: [
        { role: "system", content: "You are a helpful assistant." },
        { role: "user", content: "Reply with just the word: WORKING" },
      ],
      max_tokens: 10,
    }),
  });
  const data = await resp.json();
  console.log("Status:", resp.status);
  const reply = data.choices?.[0]?.message?.content || JSON.stringify(data);
  console.log("Reply:", reply);
  console.log(resp.ok ? "\n✓ DeepSeek API is WORKING" : "\n✗ DeepSeek API FAILED");
}

main().catch(console.error);
