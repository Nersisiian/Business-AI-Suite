import { Router } from "express";
import { db, dealsTable, clientsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import {
  CreateDealBody,
  UpdateDealBody,
  GetDealParams,
  UpdateDealParams,
  DeleteDealParams,
} from "@workspace/api-zod";
import { requireAuth } from "../lib/auth";
import type { AuthRequest } from "../lib/auth";

const router = Router();

async function formatDeal(d: typeof dealsTable.$inferSelect) {
  let clientName: string | null = null;
  if (d.clientId) {
    const [client] = await db.select().from(clientsTable).where(eq(clientsTable.id, d.clientId));
    clientName = client?.name ?? null;
  }
  return {
    id: d.id,
    title: d.title,
    value: d.value,
    status: d.status,
    clientId: d.clientId,
    clientName,
    notes: d.notes,
    createdAt: d.createdAt.toISOString(),
    updatedAt: d.updatedAt.toISOString(),
  };
}

router.get("/deals", requireAuth, async (_req: AuthRequest, res): Promise<void> => {
  const deals = await db.select().from(dealsTable).orderBy(dealsTable.createdAt);
  const formatted = await Promise.all(deals.map(formatDeal));
  res.json(formatted);
});

router.post("/deals", requireAuth, async (req: AuthRequest, res): Promise<void> => {
  const parsed = CreateDealBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [deal] = await db.insert(dealsTable).values({
    ...parsed.data,
    status: parsed.data.status || "new",
  }).returning();

  res.status(201).json(await formatDeal(deal));
});

router.get("/deals/:id", requireAuth, async (req: AuthRequest, res): Promise<void> => {
  const params = GetDealParams.safeParse({ id: Number(Array.isArray(req.params.id) ? req.params.id[0] : req.params.id) });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [deal] = await db.select().from(dealsTable).where(eq(dealsTable.id, params.data.id));
  if (!deal) {
    res.status(404).json({ error: "Deal not found" });
    return;
  }

  res.json(await formatDeal(deal));
});

router.patch("/deals/:id", requireAuth, async (req: AuthRequest, res): Promise<void> => {
  const params = UpdateDealParams.safeParse({ id: Number(Array.isArray(req.params.id) ? req.params.id[0] : req.params.id) });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const parsed = UpdateDealBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [deal] = await db
    .update(dealsTable)
    .set(parsed.data)
    .where(eq(dealsTable.id, params.data.id))
    .returning();

  if (!deal) {
    res.status(404).json({ error: "Deal not found" });
    return;
  }

  res.json(await formatDeal(deal));
});

router.delete("/deals/:id", requireAuth, async (req: AuthRequest, res): Promise<void> => {
  const params = DeleteDealParams.safeParse({ id: Number(Array.isArray(req.params.id) ? req.params.id[0] : req.params.id) });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [deal] = await db
    .delete(dealsTable)
    .where(eq(dealsTable.id, params.data.id))
    .returning();

  if (!deal) {
    res.status(404).json({ error: "Deal not found" });
    return;
  }

  res.sendStatus(204);
});

export default router;
