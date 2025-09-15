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

// ----------------- CORS (must be before sessions) -----------------
// allow both production frontend and localhost dev
const FRONTEND = process.env.FRONTEND_URL || "https://taskportalx.netlify.app";
const LOCAL_DEV = "http://localhost:5173";
const allowedOrigins = [FRONTEND, LOCAL_DEV].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // allow requests with no origin (like mobile apps, curl)
      if (!origin) return callback(null, true);
      if (allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        callback(new Error("CORS policy: origin not allowed"));
      }
    },
    credentials: true,
  })
);

// ----------------- MIDDLEWARE -----------------
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// trust proxy so secure cookies work behind Render/Netlify proxies
app.set("trust proxy", 1);

// Session (must come before passport.session())
app.use(
  session({
    name: "taskportal.sid",
    secret: process.env.SESSION_SECRET || "fallbacksecret",
    resave: false,
    saveUninitialized: false, // don't create empty sessions
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // true on HTTPS (Render)
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 24 * 60 * 60 * 1000, // 1 day
    },
  })
);

app.use(passport.initialize());
app.use(passport.session());

// ----------------- DATABASE -----------------
const { Pool } = pg;

// Use DATABASE_URL (Supabase) with SSL config for hosted DBs (Supabase)
const db = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

// ----------------- SOCKET.IO -----------------
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
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
      // persist message and emit to receiver if online
      const result = await db.query(
        "INSERT INTO messages (sender_id, receiver_id, message) VALUES ($1, $2, $3) RETURNING *",
        [senderId, receiverId, message]
      );
      const newMessage = result.rows[0];

      if (onlineUsers[receiverId]) {
        io.to(onlineUsers[receiverId]).emit("receiveMessage", newMessage);
      }

      // ack to sender
      socket.emit("messageSent", newMessage);
    } catch (err) {
      console.error("❌ Error saving message:", err);
      socket.emit("error", { message: "Message save failed" });
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

// ----------------- ROUTES -----------------
app.get("/", (req, res) => res.json({ message: "API running 🚀" }));

// ---- Dashboard ----
app.get("/api/dashboard", async (req, res) => {
  try {
    const userId = req.user?.id || null;
    const tasks = await db.query(
      "SELECT t.id, t.title, t.description, t.created_at, u.name AS assigned_by_name " +
        "FROM tasks t JOIN users u ON t.assigned_by = u.id " +
        "WHERE t.assigned_to = $1 ORDER BY t.created_at DESC",
      [userId]
    );
    // return tasks and current user (so frontend can set context)
    res.json({ user: req.user || null, tasks: tasks.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error loading tasks" });
  }
});

// ---- Get users ----
app.get("/api/users", async (req, res) => {
  try {
    // Ensure authenticated when requesting users - optional but recommended
    if (!req.isAuthenticated()) return res.status(401).json({ error: "Unauthorized" });

    const users = await db.query("SELECT id, name, email FROM users WHERE id != $1", [
      req.user.id,
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
// We'll return JSON and make sure req.login() is called so the session is set.

passport.use(
  new Strategy(async function verify(username, password, cb) {
    try {
      const result = await db.query("SELECT * FROM users WHERE email = $1", [username]);
      if (result.rows.length === 0) return cb(null, false);

      const user = result.rows[0];
      bcrypt.compare(password, user.password, (err, valid) => {
        if (err) return cb(err);
        return valid ? cb(null, user) : cb(null, false);
      });
    } catch (err) {
      console.error(err);
      return cb(err);
    }
  })
);

// Only store user.id in session
passport.serializeUser((user, cb) => cb(null, user.id));

// Load full user from DB when session is restored
passport.deserializeUser(async (id, cb) => {
  try {
    const result = await db.query("SELECT id, name, email FROM users WHERE id = $1", [id]);
    cb(null, result.rows[0]);
  } catch (err) {
    cb(err);
  }
});

// Login route (uses passport.authenticate but then returns JSON)
app.post("/api/login", (req, res, next) => {
  passport.authenticate("local", (err, user, info) => {
    if (err) return next(err);
    if (!user) return res.status(400).json({ success: false, error: "Invalid credentials" });

    req.login(user, (err) => {
      if (err) return next(err);
      // Return safe user object
      const safeUser = { id: user.id, name: user.name, email: user.email };
      return res.json({ success: true, user: safeUser });
    });
  })(req, res, next);
});

// Register
app.post("/api/register", async (req, res) => {
  const { name, email, password } = req.body;

  try {
    const checkResult = await db.query("SELECT * FROM users WHERE email = $1", [email]);
    if (checkResult.rows.length > 0)
      return res.status(400).json({ error: "User already exists" });

    const hash = await new Promise((resolve, reject) =>
      bcrypt.hash(password, saltRounds, (err, hashed) => (err ? reject(err) : resolve(hashed)))
    );

    const result = await db.query(
      "INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING id, name, email",
      [name, email, hash]
    );
    const user = result.rows[0];

    // login the user so session cookie is set immediately
    req.login(user, (err) => {
      if (err) {
        console.error("Login after register failed:", err);
        return res.status(500).json({ error: "Registration succeeded but login failed" });
      }
      res.json({ success: true, user });
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

// ----------------- CHAT APIs -----------------
app.get("/api/messages/:otherUserId", async (req, res) => {
  try {
    if (!req.isAuthenticated()) return res.status(401).json({ error: "Unauthorized" });

    const { otherUserId } = req.params;
    const result = await db.query(
      "SELECT m.id, m.sender_id, m.receiver_id, m.message, m.created_at, " +
        "s.name AS sender_name, r.name AS receiver_name " +
        "FROM messages m " +
        "JOIN users s ON m.sender_id = s.id " +
        "JOIN users r ON m.receiver_id = r.id " +
        "WHERE (m.sender_id = $1 AND m.receiver_id = $2) OR (m.sender_id = $2 AND m.receiver_id = $1) " +
        "ORDER BY m.created_at ASC",
      [req.user.id, otherUserId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error fetching messages" });
  }
});

// Optional helper endpoint to check current session user
app.get("/api/me", (req, res) => {
  res.json({ user: req.user || null });
});

// ----------------- START -----------------
server.listen(port, () => {
  console.log(`✅ API + Socket.IO running at port ${port}`);
});
