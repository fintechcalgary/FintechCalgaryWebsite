const GROQ_MODEL = process.env.GROQ_MODEL || "openai/gpt-oss-20b";

export function cleanGroqText(text = "") {
  return text
    .replace(/\*\*/g, "")
    .replace(/\*/g, "")
    .replace(/^Summary:\s*/i, "")
    .trim();
}

export function isUsableSummary(summary) {
  const cleaned = cleanGroqText(summary || "");
  const wordCount = cleaned.split(/\s+/).filter(Boolean).length;
  return cleaned.length >= 80 && wordCount >= 12 && /[.!?]$/.test(cleaned);
}

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
        max_completion_tokens: options.maxTokens ?? 1000,
        include_reasoning: false,
        reasoning_effort: options.reasoningEffort || "low",
      }),
      signal: AbortSignal.timeout(options.timeoutMs ?? 30000),
    }
  );

  if (!response.ok) {
    const errorText = await response.text().catch(() => "");
    throw new Error(`Groq request failed (${response.status})${errorText ? `: ${errorText.slice(0, 200)}` : ""}`);
  }

  const data = await response.json();
  const choice = data?.choices?.[0];
  const text = choice?.message?.content?.trim();

  if (!text) throw new Error("Empty response from Groq");
  if (choice?.finish_reason === "length") {
    throw new Error("Groq response was truncated before completion");
  }

  return cleanGroqText(text);
}
