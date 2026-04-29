import { Router } from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { db, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { authenticateToken } from "../middlewares/auth";

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || "smart_campus_jwt_secret_2024";

router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const [user] = await db.select().from(usersTable).where(eq(usersTable.email, email)).limit(1);

    if (!user) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    // In a real app, use bcrypt.compare. For demo ease, we support plain text if not hashed.
    const isPasswordValid = password === user.passwordHash || await bcrypt.compare(password, user.passwordHash);

    if (!isPasswordValid) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '24h' });
    
    const { passwordHash, ...userWithoutPassword } = user;
    res.json({ token, user: userWithoutPassword });
  } catch (err) {
    res.status(500).json({ error: "Server error during login" });
  }
});

router.get("/me", authenticateToken, (req: any, res) => {
  const { passwordHash, ...userWithoutPassword } = req.user;
  res.json(userWithoutPassword);
});

export default router;
