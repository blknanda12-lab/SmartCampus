import { Router } from "express";
import { db, notificationsTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import { authenticateToken } from "../middlewares/auth.js";

const router = Router();

router.get("/", authenticateToken, async (req: any, res) => {
  const userId = req.user.id;
  try {
    const list = await db.select().from(notificationsTable).where(eq(notificationsTable.userId, userId));
    res.json(list);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch notifications" });
  }
});

router.post("/:id/read", authenticateToken, async (req, res) => {
  const id = parseInt(String(req.params.id));
  try {
    const [updated] = await db.update(notificationsTable).set({ read: true }).where(eq(notificationsTable.id, id)).returning();
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: "Failed to update notification" });
  }
});

export default router;
