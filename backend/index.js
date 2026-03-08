const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const { pool } = require("./db/index.js");
const { saveMessage } = require("./db/index.js");

require("dotenv").config();

process.on("SIGTERM", () => {
  console.log("SIGTERM received, closing server...");
  server.close(() => {
    console.log("Server closed");
    process.exit(0);
  });
});

// Test database connection
async function testDB() {
  try {
    const client = await pool.connect();
    console.log("✅ Database connected successfully!");
    const result = await client.query("SELECT version()");
    console.log("PostgreSQL:", result.rows[0].version);
    client.release();
  } catch (err) {
    console.error("❌ Database connection failed:", err.message);
  }
}

testDB();

const app = express();
const server = http.createServer(app);

// CORS for development (adjust for production)
app.use(
  cors({
    origin: ["http://localhost:3000", "http://frontend:3000"],
    credentials: true,
  }),
);

// Health check endpoint (CRITICAL for Render)
app.get("/health", (req, res) => {
  res.status(200).json({ status: "OK", timestamp: new Date().toISOString() });
});

// REST API endpoints
app.get("/api/rooms", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM rooms ORDER BY created_at DESC",
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/rooms/:roomId/messages", async (req, res) => {
  try {
    const { roomId } = req.params;
    const result = await pool.query(
      "SELECT * FROM messages WHERE room_id = $1 ORDER BY created_at DESC LIMIT 50",
      [roomId],
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/users/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const result = await pool.query(
      "SELECT id, username, avatar_url, created_at FROM users WHERE id = $1",
      [userId],
    );
    res.json(result.rows[0] || {});
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// WebSocket setup
const io = new Server(server, {
  cors: {
    origin: ["http://localhost:3000", "http://frontend:3000"],
    methods: ["GET", "POST"],
  },
  // Production optimizations
  pingTimeout: 60000,
  pingInterval: 25000,
  connectionStateRecovery: {
    maxDisconnectionDuration: 2 * 60 * 1000, // 2 minutes
    skipMiddlewares: true,
  },
});

// WebSocket connection handling
io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  // Join a specific room (channel)
  socket.on("join_room", async (roomId) => {
    socket.join(roomId);
    console.log(`User ${socket.id} joined room ${roomId}`);

    try {
      // Convert room name to UUID if needed
      let roomUuid = roomId;
      if (roomId === "general") {
        roomUuid = "11111111-1111-1111-1111-111111111111";
      }

      // Load last 50 messages from database
      const result = await pool.query(
        `SELECT m.*, u.username 
       FROM messages m 
       LEFT JOIN users u ON m.user_id = u.id 
       WHERE m.room_id = $1 
       ORDER BY m.created_at DESC 
       LIMIT 50`,
        [roomUuid],
      );

      // Send history to this user only
      socket.emit("message_history", {
        roomId,
        messages: result.rows.reverse(), // Send oldest first
      });

      console.log(
        `📚 Sent ${result.rows.length} previous messages to ${socket.id}`,
      );
    } catch (error) {
      console.error("Error loading message history:", error);
    }

    // Notify others in the room
    socket.to(roomId).emit("user_joined", {
      userId: socket.id,
      timestamp: new Date().toISOString(),
    });
  });

  // Send message to a room
  socket.on("send_message", async (data) => {
    const { roomId, message, sender, userId, username } = data;

    // Convert room name to UUID if needed
    let roomUuid = roomId;
    if (roomId === "general") {
      roomUuid = "11111111-1111-1111-1111-111111111111";
    }

    // Use anonymous user if no userId provided
    const actualUserId = userId || "00000000-0000-0000-0000-000000000000";
    const actualUsername = username || sender || "Anonymous";

    try {
      // Save to database
      const savedMessage = await saveMessage({
        roomId: roomUuid,
        userId: actualUserId,
        content: message,
        messageType: "text",
        metadata: {
          sender: actualUsername,
          socketId: socket.id,
        },
      });

      console.log(
        `💾 Saved message from ${actualUsername}: ${message.substring(0, 30)}...`,
      );

      // Broadcast to everyone in the room
      io.to(roomId).emit("receive_message", {
        id: savedMessage.id,
        roomId,
        message,
        sender: actualUsername,
        username: actualUsername,
        timestamp: savedMessage.created_at,
        socketId: socket.id,
      });
    } catch (error) {
      console.error("❌ Error saving message:", error.message);
      // Still broadcast even if save fails
      io.to(roomId).emit("receive_message", {
        id: Date.now().toString(),
        roomId,
        message,
        sender: actualUsername,
        timestamp: new Date().toISOString(),
        socketId: socket.id,
      });
    }
  });

  // Typing indicator
  socket.on("typing", (data) => {
    const { roomId, isTyping } = data;
    socket.to(roomId).emit("user_typing", {
      userId: socket.id,
      isTyping,
    });
  });

  // Handle disconnection
  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
    // You might want to notify rooms this user was in
  });
});

const PORT = process.env.PORT || 8000;
server.listen(PORT, () => {
  console.log(`Backend running on port ${PORT}`);
  console.log(`WebSocket server ready`);
});
