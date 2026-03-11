/**
 * LLM client – suporta OpenAI, Groq e Gemini.
 * Escolhe o provedor automaticamente conforme a API key disponível.
 *
 * Variáveis de ambiente:
 * - OPENAI_API_KEY ou QA_LAB_LLM_API_KEY → OpenAI
 * - GROQ_API_KEY → Groq (gratuito)
 * - GEMINI_API_KEY → Google Gemini (gratuito)
 *
 * Prioridade: GROQ > GEMINI > OPENAI (para usar os gratuitos primeiro)
 */
const OPENAI_KEY = process.env.OPENAI_API_KEY || process.env.QA_LAB_LLM_API_KEY;
const GROQ_KEY = process.env.GROQ_API_KEY;
const GEMINI_KEY = process.env.GEMINI_API_KEY;

const PROVIDER = process.env.QA_LAB_LLM_PROVIDER ||
  (GROQ_KEY ? "groq" : GEMINI_KEY ? "gemini" : OPENAI_KEY ? "openai" : null);

const CONFIG = {
  openai: {
    key: OPENAI_KEY,
    baseUrl: process.env.QA_LAB_LLM_BASE_URL || "https://api.openai.com/v1",
    model: process.env.QA_LAB_LLM_MODEL || "gpt-4o-mini",
  },
  groq: {
    key: GROQ_KEY,
    baseUrl: "https://api.groq.com/openai/v1",
    model: process.env.QA_LAB_LLM_MODEL || "llama-3.3-70b-versatile",
  },
  gemini: {
    key: GEMINI_KEY,
    baseUrl: "https://generativelanguage.googleapis.com/v1beta",
    model: process.env.QA_LAB_LLM_MODEL || "gemini-1.5-flash",
  },
};

/**
 * @param {string} systemPrompt
 * @param {string} userPrompt
 * @returns {Promise<string>} Conteúdo da resposta
 */
export async function callLLM(systemPrompt, userPrompt) {
  if (!PROVIDER) {
    throw new Error(
      "No API key configured. Add one of these to .env:\n" +
        "  GROQ_API_KEY=...        (free: https://console.groq.com/keys)\n" +
        "  GEMINI_API_KEY=...      (free: https://aistudio.google.com/apikey)\n" +
        "  OPENAI_API_KEY=...      (paid: https://platform.openai.com/api-keys)"
    );
  }

  const cfg = CONFIG[PROVIDER];
  if (!cfg?.key) {
    throw new Error(`Provider ${PROVIDER} selected but API key not found.`);
  }

  if (PROVIDER === "gemini") {
    return callGemini(cfg, systemPrompt, userPrompt);
  }

  // OpenAI e Groq usam o mesmo formato
  return callOpenAICompatible(cfg, systemPrompt, userPrompt);
}

async function callOpenAICompatible(cfg, systemPrompt, userPrompt) {
  const res = await fetch(`${cfg.baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${cfg.key}`,
    },
    body: JSON.stringify({
      model: cfg.model,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
    ],
      temperature: 0.3,
      max_tokens: 4096,
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`LLM API error ${res.status}: ${errText}`);
  }

  const data = await res.json();
  const content = data.choices?.[0]?.message?.content;
  if (!content) {
    throw new Error("LLM retornou resposta vazia.");
  }
  return content.trim();
}

async function callGemini(cfg, systemPrompt, userPrompt) {
  const url = `${cfg.baseUrl}/models/${cfg.model}:generateContent?key=${cfg.key}`;
  const body = {
    systemInstruction: { parts: [{ text: systemPrompt }] },
    contents: [{ parts: [{ text: userPrompt }] }],
    generationConfig: {
      temperature: 0.3,
      maxOutputTokens: 4096,
    },
  };

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`LLM API error ${res.status}: ${errText}`);
  }

  const data = await res.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) {
    throw new Error("LLM retornou resposta vazia.");
  }
  return text.trim();
}
