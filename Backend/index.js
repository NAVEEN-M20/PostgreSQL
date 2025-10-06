// ----------------- IMPORTS -----------------
import express from "express";
import bodyParser from "body-parser";
import pg from "pg";
import bcrypt from "bcrypt";
import passport from "passport";
import { Strategy } from "passport-local";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import session from "express-session";
import env from "dotenv";
import cors from "cors";
import http from "http";
import { Server } from "socket.io";
import validate from "validate.js";

// ----------------- CONFIG -----------------
const app = express();
const server = http.createServer(app);
const port = process.env.PORT || 5000;
const saltRounds = 10;
env.config();

// ----------------- CORS -----------------
const FRONTEND = process.env.FRONTEND_URL || "https://taskportalx.netlify.app";
const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:5000";

const allowedOrigins = [
  FRONTEND,
  "https://accounts.google.com",
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        console.error("❌ Blocked by CORS:", origin);
        callback(new Error("CORS policy: origin not allowed"));
      }
    },
    credentials: true,
  })
);

// ----------------- MIDDLEWARE -----------------
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.set("trust proxy", 1);

app.use(
  session({
    name: "taskportal.sid",
    secret: process.env.SESSION_SECRET || "fallbacksecret",
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 24 * 60 * 60 * 1000,
    },
  })
);

app.use(passport.initialize());
app.use(passport.session());

// ----------------- DATABASE -----------------
const { Pool } = pg;
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
  path: "/socket.io/",
});

const onlineUsers = {}; // userId -> socketId

// Function to get unread counts for a user
const getUnreadCounts = async (userId) => {
  try {
    const result = await db.query(
      `SELECT sender_id, COUNT(*) as count 
       FROM messages 
       WHERE receiver_id = $1 AND is_read = false 
       GROUP BY sender_id`,
      [userId]
    );

    const unreadCounts = {};
    result.rows.forEach((row) => {
      unreadCounts[row.sender_id] = parseInt(row.count);
    });

    return unreadCounts;
  } catch (err) {
    console.error("Error fetching unread counts:", err);
    return {};
  }
};

// Function to send unread counts to a user
const sendUnreadCounts = async (userId) => {
  try {
    const unreadCounts = await getUnreadCounts(userId);

    if (onlineUsers[userId]) {
      io.to(onlineUsers[userId]).emit("unreadCounts", unreadCounts);
    }
  } catch (err) {
    console.error("Error sending unread counts:", err);
  }
};

io.on("connection", (socket) => {
  console.log("🔌 User connected:", socket.id);

  socket.on("register", async (userId) => {
    onlineUsers[userId] = socket.id;
    console.log("✅ Registered user:", userId);

    // Send initial unread counts when user registers
    await sendUnreadCounts(userId);
  });

  socket.on("sendMessage", async ({ senderId, receiverId, message }) => {
    try {
      // Persist message with is_read = false by default
      const result = await db.query(
        "INSERT INTO messages (sender_id, receiver_id, message, is_read) VALUES ($1, $2, $3, false) RETURNING *",
        [senderId, receiverId, message]
      );
      const newMessage = result.rows[0];

      // Send message to receiver if online
      if (onlineUsers[receiverId]) {
        io.to(onlineUsers[receiverId]).emit("receiveMessage", newMessage);
      }

      // Update unread counts for receiver
      await sendUnreadCounts(receiverId);

      // Ack to sender
      socket.emit("messageSent", newMessage);
    } catch (err) {
      console.error("❌ Error saving message:", err);
      socket.emit("error", { message: "Message save failed" });
    }
  });

  // Mark messages as read from a specific user
  socket.on("markAsRead", async ({ senderId, receiverId }) => {
    try {
      // Update database to mark messages as read
      await db.query(
        "UPDATE messages SET is_read = true WHERE sender_id = $1 AND receiver_id = $2 AND is_read = false",
        [senderId, receiverId]
      );

      // Update unread counts for both users
      await sendUnreadCounts(receiverId);
      await sendUnreadCounts(senderId);
    } catch (err) {
      console.error("❌ Error marking messages as read:", err);
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
      "SELECT t.id, t.title, t.description, t.created_at, t.assigned_by, u.name AS assigned_by_name " +
        "FROM tasks t JOIN users u ON t.assigned_by = u.id " +
        "WHERE t.assigned_to = $1 ORDER BY t.created_at DESC",
      [userId]
    );
    res.json({ user: req.user || null, tasks: tasks.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error loading tasks" });
  }
});

// ---- Get users ----
app.get("/api/users", async (req, res) => {
  try {
    if (!req.isAuthenticated())
      return res.status(401).json({ error: "Unauthorized" });

    const users = await db.query(
      "SELECT id, name, email FROM users WHERE id != $1",
      [req.user.id]
    );
    res.json(users.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error loading users" });
  }
});

// ---- Create Task ----
app.post("/api/task/new", async (req, res) => {
  if (!req.isAuthenticated())
    return res.status(401).json({ error: "Unauthorized" });

  const { title, description, assigned_to } = req.body;
  try {
    // Normalize to array
    const assignees = Array.isArray(assigned_to)
      ? assigned_to
      : [assigned_to].filter(Boolean);
    if (assignees.length === 0) {
      return res.status(400).json({ error: "No assignees provided" });
    }

    await db.query("BEGIN");
    for (const to of assignees) {
      await db.query(
        "INSERT INTO tasks (title, description, assigned_by, assigned_to) VALUES ($1, $2, $3, $4)",
        [title, description, req.user.id, to]
      );
    }
    await db.query("COMMIT");

    res.json({
      success: true,
      message: `Task created for ${assignees.length} user(s)`,
    });
  } catch (err) {
    await db.query("ROLLBACK");
    console.error(err);
    res.status(500).json({ error: "Error creating task(s)" });
  }
});

// ---- Delete Task ----
app.delete("/api/task/:id", async (req, res) => {
  if (!req.isAuthenticated())
    return res.status(401).json({ error: "Unauthorized" });

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
passport.use(
  new Strategy({ usernameField: "email" }, async function verify(
    email,
    password,
    cb
  ) {
    try {
      const result = await db.query("SELECT * FROM users WHERE email = $1", [
        email,
      ]);
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

passport.serializeUser((user, cb) => cb(null, user.id));
passport.deserializeUser(async (id, cb) => {
  try {
    const result = await db.query(
      "SELECT id, name, email FROM users WHERE id = $1",
      [id]
    );
    cb(null, result.rows[0]);
  } catch (err) {
    cb(err);
  }
});

// ---- Login ----
app.post("/api/login", async (req, res, next) => {
  const { email, password } = req.body;

  // Validate email + password
  const constraints = {
    email: { presence: true, email: true },
    password: { presence: true },
  };
  const validation = validate({ email, password }, constraints);

  if (validation) {
    return res
      .status(400)
      .json({
        success: false,
        error: validation.email?.[0] || "Invalid input",
      });
  }

  passport.authenticate("local", async (err, user, info) => {
    if (err) return next(err);
    if (!user) {
      return res.status(400).json({ success: false, error: "Invalid credentials" });
    }

    req.login(user, async (err) => {
      if (err) return next(err);

      // Fetch unread counts immediately after login
      const unreadCounts = await getUnreadCounts(user.id);

      // Emit to connected sockets
      if (onlineUsers[user.id]) {
        io.to(onlineUsers[user.id]).emit("unreadCounts", unreadCounts);
      }

      res.json({
        success: true,
        user: { id: user.id, name: user.name, email: user.email },
        unreadCounts,
      });
    });
  })(req, res, next);
});

// ----------------- GOOGLE OAUTH STRATEGY -----------------
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.BACKEND_URL + "/api/auth/google/callback",
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // Check if user already exists in DB
        const result = await db.query("SELECT * FROM users WHERE email = $1", [
          profile.emails[0].value,
        ]);

        let user;
        if (result.rows.length === 0) {
          const insert = await db.query(
            "INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING id, name, email",
            [
              profile.displayName,
              profile.emails[0].value,
              "GoogleOAuthUser", // Placeholder password
            ]
          );
          user = insert.rows[0];
        } else {
          user = result.rows[0];
        }

        return done(null, user);
      } catch (err) {
        console.error("Google OAuth error:", err);
        return done(err, null);
      }
    }
  )
);

// ----------------- GOOGLE OAUTH ROUTES -----------------
app.get(
  "/api/auth/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

app.get(
  "/api/auth/google/callback",
  passport.authenticate("google", { failureRedirect: FRONTEND + "/#/login" }),
  (req, res) => {
    req.login(req.user, () => {
      res.redirect(FRONTEND + "/#/dashboard");
    });
  }
);

// ---- Register ----
app.post("/api/register", async (req, res) => {
  const { name, email, password } = req.body;

  // Validate name, email, password
  const constraints = {
    name: { presence: true },
    email: { presence: true, email: true },
    password: { presence: true, length: { minimum: 7 } },
  };
  const validation = validate({ name, email, password }, constraints);

  if (validation) {
    const firstError =
      validation.name?.[0] ||
      validation.email?.[0] ||
      validation.password?.[0] ||
      "Invalid input";
    return res.status(400).json({ success: false, error: firstError });
  }

  try {
    const checkResult = await db.query("SELECT * FROM users WHERE email = $1", [
      email,
    ]);
    if (checkResult.rows.length > 0)
      return res.status(400).json({ error: "User already exists" });

    const hash = await new Promise((resolve, reject) =>
      bcrypt.hash(password, saltRounds, (err, hashed) =>
        err ? reject(err) : resolve(hashed)
      )
    );

    const result = await db.query(
      "INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING id, name, email",
      [name, email, hash]
    );
    const user = result.rows[0];

    req.login(user, (err) => {
      if (err) {
        console.error("Login after register failed:", err);
        return res
          .status(500)
          .json({ error: "Registration succeeded but login failed" });
      }
      res.json({ success: true, user });
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

app.post("/api/logout", (req, res) => {
  req.logout((err) => {
    if (err) return res.status(500).json({ error: "Error logging out" });
    // Destroy session and clear cookie to fully log out
    req.session.destroy((err2) => {
      if (err2)
        return res.status(500).json({ error: "Error destroying session" });
      try {
        res.clearCookie("taskportal.sid", {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
        });
      } catch {}
      return res.json({ success: true, message: "Logged out successfully" });
    });
  });
});

// ----------------- CHAT APIs -----------------
// Get unread counts for all users
app.get("/api/messages/unread-counts", async (req, res) => {
  try {
    if (!req.isAuthenticated())
      return res.status(401).json({ error: "Unauthorized" });

    const unreadCounts = await getUnreadCounts(req.user.id);
    res.json(unreadCounts);
  } catch (err) {
    console.error("Error fetching unread counts:", err);
    res.status(500).json({ error: "Error fetching unread counts" });
  }
});

app.get("/api/messages/:otherUserId", async (req, res) => {
  try {
    if (!req.isAuthenticated())
      return res.status(401).json({ error: "Unauthorized" });

    const { otherUserId } = req.params;
    const result = await db.query(
      "SELECT m.id, m.sender_id, m.receiver_id, m.message, m.created_at, m.is_read, " +
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
    console.error("Error fetching messages:", err);
    res.status(500).json({ error: "Error fetching messages" });
  }
});

// Optional helper endpoint to check current session user
app.get("/api/me", async (req, res) => {
  if (req.user) {
    const unreadCounts = await getUnreadCounts(req.user.id);
    res.json({
      user: req.user,
      unreadCounts,
    });
  } else {
    res.json({ user: null, unreadCounts: {} });
  }
});

// ----------------- START -----------------
server.listen(port, () => {
  console.log(`✅ API + Socket.IO running at port ${port}`);
});
