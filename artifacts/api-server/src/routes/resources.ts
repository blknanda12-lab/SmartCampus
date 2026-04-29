import { Router } from "express";
import { db, resourcesTable, bookingsTable } from "@workspace/db";
import { eq, and, gte, lte } from "drizzle-orm";

const router = Router();

router.get("/", async (req, res) => {
  const { type, status, building } = req.query;
  
  try {
    let query = db.select().from(resourcesTable);
    
    // In a real app we would use a more dynamic query builder
    const allResources = await query;
    
    let filtered = allResources;
    if (type) filtered = filtered.filter(r => r.type === type);
    if (status) filtered = filtered.filter(r => r.status === status);
    if (building) filtered = filtered.filter(r => r.building === building);
    
    res.json(filtered);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch resources" });
  }
});

router.get("/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  try {
    const [resource] = await db.select().from(resourcesTable).where(eq(resourcesTable.id, id)).limit(1);
    if (!resource) return res.status(404).json({ error: "Resource not found" });
    res.json(resource);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch resource" });
  }
});

router.get("/:id/availability", async (req, res) => {
  const id = parseInt(req.params.id);
  const { date } = req.query;
  
  if (!date) return res.status(400).json({ error: "Date is required" });

  try {
    // Fetch bookings for this resource on this date
    const dayBookings = await db.select().from(bookingsTable).where(
      and(
        eq(bookingsTable.resourceId, id),
        eq(bookingsTable.date, date as string)
      )
    );

    // Generate slots from 8am to 10pm (14 hours)
    const slots = Array.from({ length: 14 }).map((_, i) => {
      const hour = i + 8;
      const booking = dayBookings.find(b => {
        const startHour = new Date(b.startTime).getHours();
        const endHour = new Date(b.endTime).getHours();
        return hour >= startHour && hour < endHour;
      });

      return {
        hour,
        available: !booking,
        bookingId: booking?.id,
        bookingTitle: booking?.title
      };
    });

    res.json(slots);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch availability" });
  }
});

export default router;
