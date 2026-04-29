import { Router } from "express";
import { db, bookingsTable, resourcesTable, usersTable } from "@workspace/db";
import { eq, and, or, lt, gt } from "drizzle-orm";
import { authenticateToken } from "../middlewares/auth";
import { nanoid } from "nanoid";

const router = Router();

router.get("/", authenticateToken, async (req: any, res) => {
  try {
    const { userId, resourceId } = req.query;
    
    let query = db.select().from(bookingsTable);
    
    // Simplification for demo: fetching all and mapping
    // In production, join or use aggregate queries
    const allBookings = await query;
    const resources = await db.select().from(resourcesTable);
    const users = await db.select().from(usersTable);

    const enriched = allBookings.map(b => {
      const resource = resources.find(r => r.id === b.resourceId);
      const user = users.find(u => u.id === b.userId);
      return {
        ...b,
        resourceName: resource?.name || "Unknown Resource",
        userName: user?.name || "Unknown User",
        userRole: user?.role || "student"
      };
    });

    let filtered = enriched;
    if (userId) filtered = filtered.filter(b => b.userId === parseInt(String(userId)));
    if (resourceId) filtered = filtered.filter(b => b.resourceId === parseInt(String(resourceId)));

    res.json(filtered);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch bookings" });
  }
});

router.post("/", authenticateToken, async (req: any, res) => {
  const { resourceId, title, startTime, endTime, attendees, notes, override } = req.body;
  const userId = req.user.id;

  try {
    const start = new Date(startTime);
    const end = new Date(endTime);
    const dateStr = start.toISOString().split('T')[0];

    // Check permissions for Classrooms/Labs
    const [resource] = await db.select().from(resourcesTable).where(eq(resourcesTable.id, resourceId)).limit(1);
    if (!resource) return res.status(404).json({ error: "Resource not found" });

    if ((resource.type === "classroom" || resource.type === "lab") && req.user.role !== "faculty") {
      return res.status(403).json({ error: "Only faculty are authorized to book classrooms and labs." });
    }

    // Conflict Detection: (StartA < EndB) AND (EndA > StartB)
    const conflicts = await db.select().from(bookingsTable).where(
      and(
        eq(bookingsTable.resourceId, resourceId),
        eq(bookingsTable.date, dateStr),
        eq(bookingsTable.status, "confirmed"),
        lt(bookingsTable.startTime, end),
        gt(bookingsTable.endTime, start)
      )
    );

    if (conflicts.length > 0 && !override) {
      return res.status(409).json({
        error: "Time slot conflict detected",
        conflicts,
        canOverride: req.user.role === "faculty" || req.user.role === "admin"
      });
    }

    // Handle overrides (cancel conflicting student bookings)
    if (conflicts.length > 0 && override) {
      for (const conflict of conflicts) {
        await db.update(bookingsTable).set({ status: "cancelled" }).where(eq(bookingsTable.id, conflict.id));
      }
    }

    const [newBooking] = await db.insert(bookingsTable).values({
      resourceId,
      userId,
      title,
      startTime: start,
      endTime: end,
      date: dateStr,
      attendees: attendees || 1,
      status: req.user.role === "admin" ? "confirmed" : "pending",
      qrCode: `qr_${nanoid(10)}`,
      notes: notes || ""
    }).returning();

    res.status(201).json(newBooking);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create booking" });
  }
});

router.patch("/:id/status", authenticateToken, async (req: any, res) => {
  const id = parseInt(String(req.params.id));
  const { status } = req.body;

  if (req.user.role !== "admin") {
    return res.status(403).json({ error: "Only admins can approve/reject bookings" });
  }

  if (!["confirmed", "cancelled"].includes(status)) {
    return res.status(400).json({ error: "Invalid status update" });
  }

  try {
    const [updated] = await db.update(bookingsTable)
      .set({ status })
      .where(eq(bookingsTable.id, id))
      .returning();
    
    if (!updated) return res.status(404).json({ error: "Booking not found" });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: "Status update failed" });
  }
});

router.post("/:id/checkin", authenticateToken, async (req, res) => {
  const id = parseInt(String(req.params.id));
  try {
    const [updated] = await db.update(bookingsTable)
      .set({ checkInTime: new Date(), status: "completed" })
      .where(eq(bookingsTable.id, id))
      .returning();
    
    if (!updated) return res.status(404).json({ error: "Booking not found" });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: "Check-in failed" });
  }
});

router.delete("/:id", authenticateToken, async (req: any, res) => {
  const id = parseInt(String(req.params.id));
  try {
    const [booking] = await db.select().from(bookingsTable).where(eq(bookingsTable.id, id)).limit(1);
    
    if (!booking) return res.status(404).json({ error: "Booking not found" });

    // Check authority: Owner OR Admin
    if (booking.userId !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({ error: "Unauthorized to cancel this booking" });
    }

    const [cancelled] = await db.update(bookingsTable)
      .set({ status: "cancelled" })
      .where(eq(bookingsTable.id, id))
      .returning();
    res.json(cancelled);
  } catch (err) {
    res.status(500).json({ error: "Cancellation failed" });
  }
});

export default router;
