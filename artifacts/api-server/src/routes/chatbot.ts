import { Router } from "express";

const router = Router();

router.post("/", async (req, res) => {
  const { message } = req.body;
  
  // Simple rule-based chatbot logic
  const msg = message.toLowerCase();
  let reply = "I'm not sure how to help with that. Try asking about booking a room, check-in, or availability.";

  if (msg.includes("book") || msg.includes("reserve")) {
    reply = "You can book a room by navigating to the 'Resources' tab and selecting 'Book Now' on your preferred space.";
  } else if (msg.includes("available") || msg.includes("status")) {
    reply = "Active occupancy is shown on the Dashboard. Green means available, Red means occupied.";
  } else if (msg.includes("hello") || msg.includes("hi")) {
    reply = "Hello! I'm your Smart Campus Assistant. How can I help you optimize your schedule today?";
  }

  res.json({ reply });
});

export default router;
