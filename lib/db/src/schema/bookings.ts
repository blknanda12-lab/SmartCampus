import {
  pgTable,
  serial,
  text,
  integer,
  timestamp,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const bookingsTable = pgTable("bookings", {
  id: serial("id").primaryKey(),
  resourceId: integer("resource_id").notNull(),
  userId: integer("user_id").notNull(),
  title: text("title").notNull(),
  startTime: timestamp("start_time", { withTimezone: true }).notNull(),
  endTime: timestamp("end_time", { withTimezone: true }).notNull(),
  date: text("date").notNull(),
  attendees: integer("attendees").notNull().default(1),
  status: text("status").notNull().default("confirmed"),
  priority: integer("priority").notNull().default(1),
  checkInTime: timestamp("check_in_time", { withTimezone: true }),
  qrCode: text("qr_code").notNull(),
  notes: text("notes").notNull().default(""),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertBookingSchema = createInsertSchema(bookingsTable).omit({
  id: true,
  createdAt: true,
});
export type InsertBooking = z.infer<typeof insertBookingSchema>;
export type Booking = typeof bookingsTable.$inferSelect;
