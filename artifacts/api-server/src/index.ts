import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { pinoHttp } from "pino-http";
import authRouter from "./routes/auth";
import resourcesRouter from "./routes/resources";
import bookingsRouter from "./routes/bookings";
import analyticsRouter from "./routes/analytics";
import iotRouter from "./routes/iot";
import aiRouter from "./routes/ai";
import notificationsRouter from "./routes/notifications";
import { setupAuth } from "./middlewares/auth";

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || true,
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());
app.use(pinoHttp());

// Authentication Middleware Setup
setupAuth(app);

// Routes
app.use("/api/auth", authRouter);
app.use("/api/resources", resourcesRouter);
app.use("/api/bookings", bookingsRouter);
app.use("/api/analytics", analyticsRouter);
app.use("/api/iot", iotRouter);
app.use("/api/ai", aiRouter);
app.use("/api/notifications", notificationsRouter);

// Health check
app.get("/api/healthz", (req, res) => {
  res.json({ status: "healthy" });
});

app.listen(port, () => {
  console.log(`API Server running on port ${port}`);
});
