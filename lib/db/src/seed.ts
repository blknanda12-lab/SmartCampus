import { db, usersTable, resourcesTable, notificationsTable } from "./index";
import bcrypt from "bcryptjs";
import "dotenv/config";

async function seed() {
  console.log("🌱 Starting Database Seeding...");

  try {
    // 1. Create Users
    console.log("👤 Creating default users...");
    const adminHash = await bcrypt.hash("admin123", 10);
    const facultyHash = await bcrypt.hash("faculty123", 10);
    const studentHash = await bcrypt.hash("student123", 10);

    const users = await db.insert(usersTable).values([
      { name: "Admin User", email: "admin@smartcampus.edu", passwordHash: adminHash, role: "admin", department: "IT Administration" },
      { name: "Dr. Sarah Smith", email: "faculty@smartcampus.edu", passwordHash: facultyHash, role: "faculty", department: "Computer Science" },
      { name: "Chetan Student", email: "student@smartcampus.edu", passwordHash: studentHash, role: "student", department: "Engineering" }
    ]).onConflictDoNothing().returning();

    console.log(`✅ Created ${users.length} users.`);

    // 2. Create Resources
    console.log("🏢 Creating campus resources...");
    const resources = await db.insert(resourcesTable).values([
      { name: "AI Innovation Lab", type: "lab", building: "Main Block", floor: 3, capacity: 30, status: "available", pricePerHour: 0, lat: 12.9716, lng: 77.5946 },
      { name: "Quiet Study Room A", type: "room", building: "Library", floor: 1, capacity: 4, status: "available", pricePerHour: 0, lat: 12.9717, lng: 77.5947 },
      { name: "Central Conference Hall", type: "hall", building: "Admin Block", floor: 0, capacity: 150, status: "available", pricePerHour: 0, lat: 12.9718, lng: 77.5948 },
      { name: "Physics Research Wing", type: "lab", building: "Science Tower", floor: 4, capacity: 20, status: "available", pricePerHour: 0, lat: 12.9719, lng: 77.5949 },
      { name: "Smart Classroom 101", type: "room", building: "West Wing", floor: 1, capacity: 40, status: "available", pricePerHour: 0, lat: 12.9720, lng: 77.5950 },
      { name: "Cafeteria Meeting Hub", type: "room", building: "Student Center", floor: 2, capacity: 10, status: "available", pricePerHour: 0, lat: 12.9721, lng: 77.5951 }
    ]).onConflictDoNothing().returning();

    console.log(`✅ Created ${resources.length} resources.`);

    // 3. Create Welcome Notifications
    console.log("🔔 Creating notifications...");
    if (users.length > 0) {
      await db.insert(notificationsTable).values(
        users.map(u => ({
          userId: u.id,
          title: "Welcome to Smart Campus!",
          message: "The new asset management system is live. Explore resources and book your first room!",
          type: "announcement"
        }))
      );
    }

    console.log("🚀 Seeding Complete! Enjoy your Smart Campus.");
    process.exit(0);
  } catch (err) {
    console.error("❌ Seeding failed:", err);
    process.exit(1);
  }
}

seed();
