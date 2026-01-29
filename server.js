// server.js

const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");

// Import Logic and Models
const {
  connectDB,
  getSortedEvents,
  getBookingsByEmail,
  saveBooking,
  saveUser,
  authenticateUser,
  createOrUpdateEvent,
  deleteEvent,
} = require("./logic");

const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Connect to MongoDB
connectDB().catch((err) => {
  console.error("Mongo connection failed", err);
});

// --- API ROUTES ---

// 1. GET Events (Used by renderEvents)
app.get("/api/events", async (req, res) => {
  try {
    const events = await getSortedEvents();
    res.json({ success: true, data: events });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to fetch events" });
  }
});

// 1b. POST Event (Create/Update)
app.post("/api/events", async (req, res) => {
  try {
    const created = await createOrUpdateEvent(req.body || {});
    res.status(201).json({ success: true, data: created });
  } catch (err) {
    res
      .status(400)
      .json({ success: false, message: err.message || "Failed to save event" });
  }
});

// 1c. DELETE Event
app.delete("/api/events/:id", async (req, res) => {
  const id = Number(req.params.id);
  if (Number.isNaN(id)) {
    return res
      .status(400)
      .json({ success: false, message: "Valid numeric id parameter required" });
  }
  try {
    const removed = await deleteEvent(id);
    if (!removed) {
      return res
        .status(404)
        .json({ success: false, message: "Event not found" });
    }
    res.json({ success: true });
  } catch (err) {
    res
      .status(500)
      .json({ success: false, message: err.message || "Failed to delete event" });
  }
});

// 2. GET Bookings (Used by showUpcoming and for seat calculation)
app.get("/api/bookings", async (req, res) => {
  try {
    // Fetch bookings based on user email from query parameter
    const email = req.query.email;
    if (!email) {
      return res.status(400).json({ success: false, message: "Email parameter is required" });
    }
    
    const bookings = await getBookingsByEmail(email);
    res.json({ success: true, data: bookings });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to fetch bookings" });
  }
});

// 3. POST Booking (Used by processPayment)
app.post("/api/book", async (req, res) => {
  const response = await saveBooking(req.body);
  if (response.success) {
    res.status(201).json(response);
  } else {
    res.status(400).json(response);
  }
});

// 4. POST Registration (Used by register function)
app.post("/api/register", async (req, res) => {
  const response = await saveUser(req.body);
  if (response.success) {
    res.status(201).json(response);
  } else {
    res.status(400).json(response);
  }
});

// 5. POST Login (Used by login function)
app.post("/api/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await authenticateUser(email, password);
    if (user) {
      res.json({ success: true, data: user });
    } else {
      res.status(401).json({ success: false, message: "Invalid credentials" });
    }
  } catch (err) {
    res.status(500).json({ success: false, message: "Login failed" });
  }
});

// Test Route
app.get("/", (req, res) => {
  res.send("Backend running...");
});

// Server Start
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));