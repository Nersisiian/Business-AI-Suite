import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || "",
});

export async function suggestClientReply(
  clientMessage: string,
  clientName?: string | null,
  context?: string | null
): Promise<string> {
  const systemPrompt = `You are an expert business communication assistant for a CRM platform. 
Your job is to suggest professional, warm, and effective replies to client messages.
Keep replies concise, friendly, and action-oriented. Aim for 2-4 sentences.`;

  const userPrompt = `${clientName ? `Client: ${clientName}\n` : ""}${context ? `Context: ${context}\n` : ""}
Client message: "${clientMessage}"

Please suggest a professional reply:`;

  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
    max_tokens: 300,
    temperature: 0.7,
  });

  return response.choices[0]?.message?.content || "Unable to generate reply.";
}

export async function analyzeDealSuccess(params: {
  title: string;
  value: number;
  status: string;
  notes?: string | null;
  clientName?: string | null;
}): Promise<{ probability: number; reasoning: string; recommendations: string[] }> {
  const systemPrompt = `You are an expert sales analyst with deep expertise in deal qualification and pipeline management.
Analyze deals and provide actionable insights. Always respond with valid JSON.`;

  const userPrompt = `Analyze this sales deal and predict success probability:

Deal Title: ${params.title}
Deal Value: $${params.value.toLocaleString()}
Current Status: ${params.status}
${params.clientName ? `Client: ${params.clientName}` : ""}
${params.notes ? `Notes: ${params.notes}` : ""}

Respond with JSON in this exact format:
{
  "probability": <number 0-100>,
  "reasoning": "<2-3 sentence analysis>",
  "recommendations": ["<action 1>", "<action 2>", "<action 3>"]
}`;

  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
    max_tokens: 400,
    temperature: 0.5,
    response_format: { type: "json_object" },
  });

  const content = response.choices[0]?.message?.content || "{}";
  const parsed = JSON.parse(content);

  return {
    probability: Math.min(100, Math.max(0, Number(parsed.probability) || 50)),
    reasoning: parsed.reasoning || "Unable to analyze deal.",
    recommendations: Array.isArray(parsed.recommendations) ? parsed.recommendations.slice(0, 5) : [],
  };
}
