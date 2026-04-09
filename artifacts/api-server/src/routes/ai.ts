import { Router } from "express";
import {
  SuggestReplyBody,
  AnalyzeDealBody,
} from "@workspace/api-zod";
import { requireAuth } from "../lib/auth";
import { suggestClientReply, analyzeDealSuccess } from "../lib/openai";
import type { AuthRequest } from "../lib/auth";

const router = Router();

router.post("/ai/suggest-reply", requireAuth, async (req: AuthRequest, res): Promise<void> => {
  const parsed = SuggestReplyBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { clientMessage, clientName, context } = parsed.data;

  if (!process.env.OPENAI_API_KEY) {
    res.status(500).json({ error: "OpenAI API key not configured. Please set OPENAI_API_KEY environment variable." });
    return;
  }

  try {
    const reply = await suggestClientReply(clientMessage, clientName, context);
    res.json({ reply });
  } catch (err) {
    req.log.error({ err }, "AI suggest-reply error");
    res.status(500).json({ error: "Failed to generate AI reply. Please try again." });
  }
});

router.post("/ai/analyze-deal", requireAuth, async (req: AuthRequest, res): Promise<void> => {
  const parsed = AnalyzeDealBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  if (!process.env.OPENAI_API_KEY) {
    res.status(500).json({ error: "OpenAI API key not configured. Please set OPENAI_API_KEY environment variable." });
    return;
  }

  try {
    const result = await analyzeDealSuccess({
      title: parsed.data.title,
      value: parsed.data.value,
      status: parsed.data.status,
      notes: parsed.data.notes,
      clientName: parsed.data.clientName,
    });
    res.json(result);
  } catch (err) {
    req.log.error({ err }, "AI analyze-deal error");
    res.status(500).json({ error: "Failed to analyze deal. Please try again." });
  }
});

export default router;
