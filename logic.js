const mongoose = require("mongoose");
const seedEvents = require("./seedEvents");
const {
  Stack,
  Queue,
  PriorityQueue,
  LinkedList,
} = require("./dataStructures");

const DB_URI = "mongodb://127.0.0.1:27017/eventdb";

// --- MONGODB SCHEMAS & MODELS ---

const EventSchema = new mongoose.Schema({
  id: { type: Number, unique: true, required: true },
  title: String,
  venue: String,
  date: Date,
  seats: Number,
  priceNormal: Number,
  priceVIP: Number,
  city: String,
  category: String,
  img: String,
  rating: Number,
  views: Number,
});

const BookingSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  event: { type: String, required: true },
  eventId: { type: Number, required: true },
  ticketType: { type: String, required: true },
  seats: { type: Number, required: true, min: 1 },
  totalPrice: { type: Number, required: true, min: 1 },
  bookingDate: { type: Date, default: Date.now },
  status: { type: String, default: "confirmed" },
  bookingCode: { type: String, unique: true },
});

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  phone: String,
  joinedDate: { type: Date, default: Date.now },
});

const Event = mongoose.model("Event", EventSchema);
const Booking = mongoose.model("Booking", BookingSchema);
const User = mongoose.model("User", UserSchema);

// --- DATA STRUCTURE UTILITIES ---

const EVENT_PRIORITY_COMPARATOR = (a, b) => {
  const diff = new Date(a.date).getTime() - new Date(b.date).getTime();
  if (diff !== 0) {
    return diff;
  }
  return (b.rating || 0) - (a.rating || 0);
};

const eventCache = [];
let eventPriorityQueue = new PriorityQueue(EVENT_PRIORITY_COMPARATOR);

const bookingRequestQueue = new Queue();
const bookingHistoryStack = new Stack();
const recentUsersList = new LinkedList(50);
const connectionStatusStack = new Stack();

const MAX_BOOKING_HISTORY = 25;
let processingBookingQueue = false;
let isConnected = false;

function getMaxEventId() {
  if (eventCache.length === 0) {
    return 0;
  }
  return eventCache.reduce((max, event) => (event.id > max ? event.id : max), 0);
}

function rebuildEventCaches(events) {
  eventCache.length = 0;
  eventPriorityQueue = new PriorityQueue(EVENT_PRIORITY_COMPARATOR);
  events.forEach((event) => {
    const normalized = { ...event };
    eventCache.push(normalized);
    eventPriorityQueue.enqueue(normalized);
  });
}

async function refreshEventsFromDB() {
  const events = await Event.find({}).lean();
  rebuildEventCaches(events);
  return eventCache;
}

async function ensureEventCache() {
  if (eventCache.length === 0) {
    await refreshEventsFromDB();
  }
  return eventCache;
}

async function generateEventId() {
  await ensureEventCache();
  return getMaxEventId() + 1;
}

function upsertEventInMemory(event) {
  const normalized = { ...event };
  const index = eventCache.findIndex((ev) => ev.id === normalized.id);
  if (index >= 0) {
    eventCache[index] = normalized;
  } else {
    eventCache.push(normalized);
  }

  eventPriorityQueue = new PriorityQueue(EVENT_PRIORITY_COMPARATOR);
  eventCache.forEach((item) => eventPriorityQueue.enqueue(item));
}

function removeEventFromMemory(eventId) {
  const index = eventCache.findIndex((ev) => ev.id === eventId);
  if (index >= 0) {
    eventCache.splice(index, 1);
    eventPriorityQueue = new PriorityQueue(EVENT_PRIORITY_COMPARATOR);
    eventCache.forEach((item) => eventPriorityQueue.enqueue(item));
  }
}

function enqueueBookingTask(task) {
  return new Promise((resolve, reject) => {
    bookingRequestQueue.enqueue({ task, resolve, reject });
    processBookingQueue().catch((err) => {
      // Errors during processing are propagated to individual promises
      console.error("Booking queue processing error", err);
    });
  });
}

async function processBookingQueue() {
  if (processingBookingQueue) {
    return;
  }
  processingBookingQueue = true;
  while (!bookingRequestQueue.isEmpty()) {
    const { task, resolve, reject } = bookingRequestQueue.dequeue();
    try {
      const result = await task();
      resolve(result);
    } catch (error) {
      reject(error);
    }
  }
  processingBookingQueue = false;
}

function pushBookingHistory(bookingDoc) {
  bookingHistoryStack.push({
    bookingCode: bookingDoc.bookingCode,
    email: bookingDoc.email,
    eventId: bookingDoc.eventId,
    timestamp: new Date().toISOString(),
  });
  bookingHistoryStack.trim(MAX_BOOKING_HISTORY);
}

function recordRecentUser(userDoc) {
  recentUsersList.addToHead({
    name: userDoc.name,
    email: userDoc.email,
    joinedDate: userDoc.joinedDate,
  });
}

function recordConnection(status, error) {
  connectionStatusStack.push({
    status,
    at: new Date().toISOString(),
    error: error ? error.message : null,
  });
  connectionStatusStack.trim(10);
}

async function seedEventsIfEmpty() {
  const count = await Event.collection.estimatedDocumentCount();
  if (count === 0) {
    await Event.insertMany(seedEvents);
    console.log("✅ Seed events inserted.");
  }
}

// --- DATABASE FUNCTIONS ---

const connectDB = async () => {
  if (isConnected) {
    return mongoose.connection;
  }

  try {
    await mongoose.connect(DB_URI, { autoIndex: true });
    isConnected = true;
    recordConnection("connected");

    mongoose.connection.on("disconnected", () => {
      recordConnection("disconnected");
      isConnected = false;
    });

    mongoose.connection.on("reconnected", () => {
      recordConnection("reconnected");
      isConnected = true;
    });

    await seedEventsIfEmpty();
    await refreshEventsFromDB();

    console.log("✅ MongoDB Connected");
    return mongoose.connection;
  } catch (err) {
    recordConnection("error", err);
    console.log("❌ MongoDB Connection Error:", err);
    throw err;
  }
};

async function getSortedEvents() {
  await ensureEventCache();
  return eventPriorityQueue.toArray().map((event) => ({ ...event }));
}

async function getBookingsByEmail(email) {
  const bookings = await Booking.find({ email }).lean();
  return bookings;
}

function generateBookingCode() {
  return "EN" + Math.random().toString(36).substr(2, 9).toUpperCase();
}

async function persistBooking(data) {
  const bookingCode = generateBookingCode();
  const booking = new Booking({ ...data, bookingCode });
  const saved = await booking.save();
  const plain = saved.toObject();
  pushBookingHistory(plain);
  return {
    success: true,
    message: "Booking successful!",
    data: plain,
  };
}

async function saveBooking(data) {
  return enqueueBookingTask(async () => {
    try {
      const result = await persistBooking(data);
      return result;
    } catch (err) {
      return {
        success: false,
        error: err.message || "Failed to save booking",
      };
    }
  });
}

async function saveUser(data) {
  try {
    const user = new User(data);
    const saved = await user.save();
    const plain = saved.toObject();
    recordRecentUser(plain);
    return { success: true, message: "Registration successful!" };
  } catch (err) {
    if (err.code === 11000) {
      return { success: false, error: "Email already registered" };
    }
    return { success: false, error: err.message || "Failed to register" };
  }
}

async function authenticateUser(email, password) {
  const user = await User.findOne({ email, password }).lean();
  if (!user) {
    return null;
  }
  recentUsersList.addToHead({
    name: user.name,
    email: user.email,
    joinedDate: user.joinedDate,
  });
  return {
    name: user.name,
    email: user.email,
    phone: user.phone,
    joinedDate: user.joinedDate,
  };
}

async function createOrUpdateEvent(data) {
  const payload = { ...data };
  if (!payload.id) {
    payload.id = await generateEventId();
  }

  if (payload.date) {
    payload.date = new Date(payload.date);
  }

  if (payload.seats !== undefined) {
    payload.seats = Number(payload.seats);
  }

  if (payload.priceNormal !== undefined) {
    payload.priceNormal = Number(payload.priceNormal);
  }

  if (payload.priceVIP !== undefined) {
    payload.priceVIP = Number(payload.priceVIP);
  }

  if (payload.views !== undefined) {
    payload.views = Number(payload.views);
  }

  const saved = await Event.findOneAndUpdate(
    { id: payload.id },
    payload,
    {
      new: true,
      upsert: true,
      setDefaultsOnInsert: true,
      runValidators: true,
    }
  ).lean();

  upsertEventInMemory(saved);

  return saved;
}

async function deleteEvent(eventId) {
  const result = await Event.deleteOne({ id: eventId });
  if (result.deletedCount > 0) {
    removeEventFromMemory(eventId);
    return true;
  }
  return false;
}

function getBookingHistorySnapshot() {
  return bookingHistoryStack.toArray();
}

function getRecentUsersSnapshot() {
  return recentUsersList.toArray();
}

function getConnectionStatusSnapshot() {
  return connectionStatusStack.toArray();
}

module.exports = {
  connectDB,
  getSortedEvents,
  getBookingsByEmail,
  saveBooking,
  saveUser,
  authenticateUser,
  createOrUpdateEvent,
  deleteEvent,
  getBookingHistorySnapshot,
  getRecentUsersSnapshot,
  getConnectionStatusSnapshot,
  Event,
  Booking,
  User,
};