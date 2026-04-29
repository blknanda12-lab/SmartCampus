import { db, usersTable, resourcesTable, notificationsTable } from "./index";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import "dotenv/config";

async function seed() {
  console.log("🌱 Starting Database Force-Seeding...");

  try {
    // 1. Create/Update Users
    console.log("👤 Syncing users...");
    const userData = [
      { name: "Admin User", email: "admin@smartcampus.edu", password: "admin123", role: "admin", department: "IT Administration" },
      { name: "Dr. Sarah Smith", email: "faculty@smartcampus.edu", password: "faculty123", role: "faculty", department: "Computer Science" },
      { name: "Chetan Student", email: "student@smartcampus.edu", password: "student123", role: "student", department: "Engineering" }
    ];

    for (const u of userData) {
      const passwordHash = await bcrypt.hash(u.password, 10);
      await db.insert(usersTable)
        .values({ ...u, passwordHash })
        .onConflictDoUpdate({
          target: usersTable.email,
          set: { passwordHash, role: u.role, name: u.name }
        });
    }
    console.log("✅ Users synced successfully.");

    // 2. Create Resources
    console.log("🏢 Syncing campus resources...");
    const resourceData = [
      { name: "AI Innovation Lab", type: "lab", building: "Main Block", floor: 3, capacity: 30, status: "available", lat: 13.9858, lng: 75.5689 },
      { name: "Quiet Study Room A", type: "room", building: "Library", floor: 1, capacity: 4, status: "available", lat: 13.9860, lng: 75.5692 },
      { name: "Central Conference Hall", type: "hall", building: "Admin Block", floor: 0, capacity: 150, status: "available", lat: 13.9855, lng: 75.5685 },
      { name: "PG Block Seminar Room", type: "hall", building: "PG Block", floor: 1, capacity: 80, status: "available", lat: 13.9852, lng: 75.5680 },
      { name: "Smart Classroom 101", type: "room", building: "Main Block", floor: 1, capacity: 40, status: "available", lat: 13.9860, lng: 75.5690 },
      { name: "Cafeteria Meeting Hub", type: "room", building: "Student Center", floor: 2, capacity: 10, status: "available", lat: 13.9848, lng: 75.5678 }
    ];

    for (const r of resourceData) {
      const existing = await db.select().from(resourcesTable).where(eq(resourcesTable.name, r.name)).limit(1);
      
      if (existing.length > 0) {
        // Update existing resource with new Shivamogga coordinates
        await db.update(resourcesTable)
          .set({ lat: r.lat, lng: r.lng, building: r.building })
          .where(eq(resourcesTable.id, existing[0].id));
      } else {
        // Create new resource
        await db.insert(resourcesTable).values(r);
      }
    }
    console.log("✅ Resources synced successfully.");

    console.log("🚀 Force-Seeding Complete! Everything is in sync.");
    process.exit(0);
  } catch (err) {
    console.error("❌ Seeding failed:", err);
    process.exit(1);
  }
}

seed();
