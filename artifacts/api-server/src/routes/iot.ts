import { Router } from "express";
import { db, resourcesTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const router = Router();

router.get("/sensors", async (req, res) => {
  try {
    const resources = await db.select().from(resourcesTable);
    const readings = resources.map(r => ({
      resourceId: r.id,
      resourceName: r.name,
      capacity: r.capacity,
      currentOccupancy: r.currentOccupancy,
      occupancyPct: (r.currentOccupancy / r.capacity) * 100,
      status: r.status,
      updatedAt: new Date().toISOString()
    }));
    res.json(readings);
  } catch (err) {
    res.status(500).json({ error: "IoT failed" });
  }
});

router.post("/simulate", async (req, res) => {
  try {
    // Randomly update occupancy for all resources
    const resources = await db.select().from(resourcesTable);
    for (const r of resources) {
      const newOcc = Math.floor(Math.random() * r.capacity);
      await db.update(resourcesTable).set({ currentOccupancy: newOcc }).where(eq(resourcesTable.id, r.id));
    }
    res.json({ message: "Simulation triggered" });
  } catch (err) {
    res.status(500).json({ error: "Simulation failed" });
  }
});

export default router;
