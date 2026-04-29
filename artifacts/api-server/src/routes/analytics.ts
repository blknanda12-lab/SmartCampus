import { Router } from "express";
import { db, resourcesTable, bookingsTable } from "@workspace/db";

const router = Router();

router.get("/summary", async (req, res) => {
  try {
    const resources = await db.select().from(resourcesTable);
    const bookings = await db.select().from(bookingsTable);
    
    res.json({
      totalResources: resources.length,
      activeBookingsToday: bookings.filter(b => b.status === "confirmed").length,
      utilizationPct: 68.5, // Mocked overall
      energySavedKwh: 124.2,
      totalBookings: bookings.length,
      cancelledPct: 4.2,
      avgDurationMinutes: 90
    });
  } catch (err) {
    res.status(500).json({ error: "Analytics failed" });
  }
});

router.get("/utilization", (req, res) => {
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const data = days.map(day => ({
    day,
    classroom: Math.floor(Math.random() * 40) + 40,
    lab: Math.floor(Math.random() * 30) + 50,
    study_room: Math.floor(Math.random() * 50) + 30,
    parking: Math.floor(Math.random() * 20) + 70,
    equipment: Math.floor(Math.random() * 40) + 20
  }));
  res.json(data);
});

router.get("/trends", (req, res) => {
  const data = Array.from({ length: 30 }).map((_, i) => ({
    date: `2024-11-${String(i + 1).padStart(2, '0')}`,
    bookings: Math.floor(Math.random() * 10) + 5,
    cancellations: Math.floor(Math.random() * 3)
  }));
  res.json(data);
});

export default router;
