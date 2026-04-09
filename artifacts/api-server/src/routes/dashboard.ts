import { Router } from "express";
import { db, clientsTable, dealsTable, tasksTable } from "@workspace/db";
import { eq, count, sum, sql } from "drizzle-orm";
import { requireAuth } from "../lib/auth";
import type { AuthRequest } from "../lib/auth";

const router = Router();

router.get("/dashboard/summary", requireAuth, async (_req: AuthRequest, res): Promise<void> => {
  const [clientCount] = await db.select({ count: count() }).from(clientsTable);
  const [dealCount] = await db.select({ count: count() }).from(dealsTable);
  const [taskCount] = await db
    .select({ count: count() })
    .from(tasksTable)
    .where(sql`${tasksTable.status} != 'done'`);
  const [activeClientCount] = await db
    .select({ count: count() })
    .from(clientsTable)
    .where(eq(clientsTable.status, "active"));
  const [wonDealCount] = await db
    .select({ count: count() })
    .from(dealsTable)
    .where(eq(dealsTable.status, "won"));

  const wonDeals = await db
    .select({ value: dealsTable.value })
    .from(dealsTable)
    .where(eq(dealsTable.status, "won"));
  const totalRevenue = wonDeals.reduce((acc, d) => acc + (d.value || 0), 0);

  res.json({
    totalClients: clientCount?.count ?? 0,
    totalDeals: dealCount?.count ?? 0,
    totalRevenue,
    wonDeals: wonDealCount?.count ?? 0,
    openTasks: taskCount?.count ?? 0,
    activeClients: activeClientCount?.count ?? 0,
  });
});

router.get("/dashboard/deal-pipeline", requireAuth, async (_req: AuthRequest, res): Promise<void> => {
  const statuses = ["new", "negotiation", "won", "lost", "on_hold"];
  const result = await Promise.all(
    statuses.map(async (status) => {
      const [cnt] = await db
        .select({ count: count() })
        .from(dealsTable)
        .where(eq(dealsTable.status, status));
      const deals = await db
        .select({ value: dealsTable.value })
        .from(dealsTable)
        .where(eq(dealsTable.status, status));
      const value = deals.reduce((acc, d) => acc + (d.value || 0), 0);
      return { status, count: Number(cnt?.count ?? 0), value };
    })
  );

  res.json(result);
});

router.get("/dashboard/recent-activity", requireAuth, async (_req: AuthRequest, res): Promise<void> => {
  const recentClients = await db
    .select({ id: clientsTable.id, name: clientsTable.name, createdAt: clientsTable.createdAt })
    .from(clientsTable)
    .orderBy(sql`${clientsTable.createdAt} DESC`)
    .limit(3);

  const recentDeals = await db
    .select({ id: dealsTable.id, title: dealsTable.title, status: dealsTable.status, createdAt: dealsTable.createdAt })
    .from(dealsTable)
    .orderBy(sql`${dealsTable.createdAt} DESC`)
    .limit(3);

  const recentTasks = await db
    .select({ id: tasksTable.id, title: tasksTable.title, status: tasksTable.status, createdAt: tasksTable.createdAt })
    .from(tasksTable)
    .orderBy(sql`${tasksTable.createdAt} DESC`)
    .limit(3);

  const activities = [
    ...recentClients.map((c) => ({
      id: `client-${c.id}`,
      type: "client",
      description: `New client added: ${c.name}`,
      createdAt: c.createdAt.toISOString(),
    })),
    ...recentDeals.map((d) => ({
      id: `deal-${d.id}`,
      type: "deal",
      description: `Deal "${d.title}" is ${d.status.replace("_", " ")}`,
      createdAt: d.createdAt.toISOString(),
    })),
    ...recentTasks.map((t) => ({
      id: `task-${t.id}`,
      type: "task",
      description: `Task "${t.title}" is ${t.status.replace("_", " ")}`,
      createdAt: t.createdAt.toISOString(),
    })),
  ];

  activities.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  res.json(activities.slice(0, 10));
});

export default router;
