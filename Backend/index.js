// ----------------- IMPORTS -----------------
import express from "express";
import bodyParser from "body-parser";
import pg from "pg";
import bcrypt from "bcrypt";
import passport from "passport";
import { Strategy } from "passport-local";
import session from "express-session";
import env from "dotenv";
import cors from "cors";
import http from "http";
import { Server } from "socket.io";

// ----------------- CONFIG -----------------
const app = express();
const server = http.createServer(app);
const port = process.env.PORT || 5000; // ⚡ Render provides PORT
const saltRounds = 10;
env.config();

// ----------------- SOCKET.IO -----------------
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:5173", // ⚡ use env for Netlify
    credentials: true,
  },
});

const onlineUsers = {}; // userId -> socketId

io.on("connection", (socket) => {
  console.log("🔌 User connected:", socket.id);

  socket.on("register", (userId) => {
    onlineUsers[userId] = socket.id;
    console.log("✅ Registered user:", userId);
  });

  socket.on("sendMessage", async ({ senderId, receiverId, message }) => {
    try {
      const result = await db.query(
        "INSERT INTO messages (sender_id, receiver_id, message) VALUES ($1, $2, $3) RETURNING *",
        [senderId, receiverId, message]
      );

      const newMessage = result.rows[0];

      if (onlineUsers[receiverId]) {
        io.to(onlineUsers[receiverId]).emit("receiveMessage", newMessage);
      }

      socket.emit("messageSent", newMessage);
    } catch (err) {
      console.error("❌ Error saving message:", err);
    }
  });

  socket.on("disconnect", () => {
    console.log("❌ User disconnected:", socket.id);
    for (const [uid, sid] of Object.entries(onlineUsers)) {
      if (sid === socket.id) {
        delete onlineUsers[uid];
        break;
      }
    }
  });
});

// ----------------- MIDDLEWARE -----------------
app.use(
  session({
    secret: process.env.SESSION_SECRET || "fallbacksecret", // ⚡ changed env name
    resave: false,
    saveUninitialized: true,
  })
);
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173", // ⚡ Netlify URL in env
    credentials: true,
  })
);
app.use(passport.initialize());
app.use(passport.session());

// ----------------- DATABASE -----------------
const { Pool } = pg;

// ⚡ Use single DATABASE_URL instead of multiple vars
const db = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }, // ⚡ required for Supabase
});

// ----------------- ROUTES -----------------
app.get("/", (req, res) => res.json({ message: "API running 🚀" }));

// ---- Dashboard ----
app.get("/api/dashboard", async (req, res) => {
  try {
    const tasks = await db.query(
      "SELECT t.id, t.title, t.description, t.created_at, u.name AS assigned_by_name " +
        "FROM tasks t JOIN users u ON t.assigned_by = u.id " +
        "WHERE t.assigned_to = $1 ORDER BY t.created_at DESC",
      [req.user?.id || null] // ⚡ safe access
    );
    res.json({ user: req.user, tasks: tasks.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error loading tasks" });
  }
});

// ---- Get users ----
app.get("/api/users", async (req, res) => {
  try {
    const users = await db.query("SELECT id, name, email FROM users WHERE id != $1", [
      req.user?.id || null,
    ]);
    res.json(users.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error loading users" });
  }
});

// ---- Create Task ----
app.post("/api/task/new", async (req, res) => {
  if (!req.isAuthenticated()) return res.status(401).json({ error: "Unauthorized" });

  const { title, description, assigned_to } = req.body;
  try {
    await db.query(
      "INSERT INTO tasks (title, description, assigned_by, assigned_to) VALUES ($1, $2, $3, $4)",
      [title, description, req.user.id, assigned_to]
    );
    res.json({ success: true, message: "Task created successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error creating task" });
  }
});

// ---- Delete Task ----
app.delete("/api/task/:id", async (req, res) => {
  if (!req.isAuthenticated()) return res.status(401).json({ error: "Unauthorized" });

  try {
    await db.query("DELETE FROM tasks WHERE id = $1 AND assigned_to = $2", [
      req.params.id,
      req.user.id,
    ]);
    res.json({ success: true, message: "Task deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error deleting task" });
  }
});

// ----------------- AUTH -----------------
app.post("/api/login", passport.authenticate("local"), (req, res) => {
  res.json({ success: true, user: req.user });
});

app.post("/api/register", async (req, res) => {
  const { name, email, password } = req.body;

  try {
    const checkResult = await db.query("SELECT * FROM users WHERE email = $1", [email]);
    if (checkResult.rows.length > 0)
      return res.status(400).json({ error: "User already exists" });

    bcrypt.hash(password, saltRounds, async (err, hash) => {
      if (err) return res.status(500).json({ error: "Error hashing password" });

      const result = await db.query(
        "INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING *",
        [name, email, hash]
      );
      const user = result.rows[0];
      req.login(user, (err) => {
        if (err) console.error(err);
        res.json({ success: true, user });
      });
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Server error" });
  }
});

app.post("/api/logout", (req, res) => {
  req.logout((err) => {
    if (err) return res.status(500).json({ error: "Error logging out" });
    res.json({ success: true, message: "Logged out successfully" });
  });
});

// ----------------- PASSPORT -----------------
passport.use(
  new Strategy(async function verify(username, password, cb) {
    try {
      const result = await db.query("SELECT * FROM users WHERE email = $1 ", [username]);
      if (result.rows.length === 0) return cb(null, false);

      const user = result.rows[0];
      bcrypt.compare(password, user.password, (err, valid) => {
        if (err) return cb(err);
        return valid ? cb(null, user) : cb(null, false);
      });
    } catch (err) {
      console.log(err);
      return cb(err);
    }
  })
);

passport.serializeUser((user, cb) => cb(null, user));
passport.deserializeUser((user, cb) => cb(null, user));

// ----------------- CHAT APIs -----------------
app.get("/api/messages/:otherUserId", async (req, res) => {
  try {
    const { otherUserId } = req.params;
    const result = await db.query(
      "SELECT m.id, m.sender_id, m.receiver_id, m.message, m.created_at, " +
        "s.name AS sender_name, r.name AS receiver_name " +
        "FROM messages m " +
        "JOIN users s ON m.sender_id = s.id " +
        "JOIN users r ON m.receiver_id = r.id " +
        "WHERE (m.sender_id = $1 AND m.receiver_id = $2) OR (m.sender_id = $2 AND m.receiver_id = $1) " +
        "ORDER BY m.created_at ASC",
      [req.user?.id || null, otherUserId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error fetching messages" });
  }
});

// ----------------- START -----------------
server.listen(port, () => {
  console.log(`✅ API + Socket.IO running at http://localhost:${port}`);
});
