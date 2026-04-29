import { Router } from "express";

const router = Router();

router.get("/predict", (req, res) => {
  const { resourceId, date } = req.query;
  const hourly = Array.from({ length: 14 }).map((_, i) => ({
    hour: i + 8,
    score: Math.floor(Math.random() * 60) + 20
  }));
  
  res.json({
    resourceId: parseInt(resourceId as string),
    date: date as string,
    hourly,
    peakHours: [10, 11, 14, 15]
  });
});

router.get("/insights", (req, res) => {
  res.json([
    {
      id: "insight_1",
      icon: "zap",
      type: "energy",
      title: "Energy Efficiency",
      message: "Science Lab A-101 has zero occupancy but high energy usage. Auto-off suggested.",
      action: "/resources/1",
      actionLabel: "View Resource"
    },
    {
      id: "insight_2",
      icon: "trending-up",
      type: "demand",
      title: "High Demand Alert",
      message: "Study Room block peaks tomorrow between 2-4 PM. Suggest booking early.",
      action: "/resources",
      actionLabel: "Book Now"
    }
  ]);
});

export default router;
