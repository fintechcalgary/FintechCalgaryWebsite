const GROQ_MODEL = process.env.GROQ_MODEL || "llama-3.1-8b-instant";

export async function callGroq(apiKey, prompt, options = {}) {
  const response = await fetch(
    "https://api.groq.com/openai/v1/chat/completions",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: options.model || GROQ_MODEL,
        messages: [{ role: "user", content: prompt }],
        temperature: options.temperature ?? 0.7,
        max_tokens: options.maxTokens ?? 1000,
      }),
      signal: AbortSignal.timeout(options.timeoutMs ?? 30000),
    }
  );

  if (!response.ok) {
    const errorText = await response.text().catch(() => "");
    throw new Error(`Groq request failed (${response.status})${errorText ? `: ${errorText.slice(0, 200)}` : ""}`);
  }

  const data = await response.json();
  const text = data?.choices?.[0]?.message?.content?.trim();

  if (!text) throw new Error("Empty response from Groq");

  return text.replace(/\*\*/g, "").replace(/\*/g, "").trim();
}
