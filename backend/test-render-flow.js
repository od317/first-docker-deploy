const io = require("socket.io-client");

// Change this to your Render URL
const RENDER_URL = "https://first-docker-deploy.onrender.com";

async function testFullFlow() {
  console.log("🧪 Testing complete chat flow on Render...");
  console.log("Connecting to:", RENDER_URL);

  // Connect to WebSocket on Render
  const socket = io(RENDER_URL, {
    path: "/socket.io", // default path
    transports: ["websocket", "polling"], // try websocket first, then polling
    reconnectionAttempts: 3,
    timeout: 10000,
  });

  socket.on("connect", () => {
    console.log("✅ Connected to WebSocket, ID:", socket.id);

    // Join the general room
    const roomId = "general"; // or use the UUID
    console.log("Joining room:", roomId);
    socket.emit("join_room", roomId);

    // Send a message after joining
    setTimeout(() => {
      const messageData = {
        roomId: roomId,
        message: "Test message from Render test! 🚀",
        sender: "TestBot",
        userId: "22222222-2222-2222-2222-222222222222",
        username: "testuser",
      };
      console.log("📤 Sending message:", messageData.message);
      socket.emit("send_message", messageData);
    }, 2000);
  });

  socket.on("message_history", (data) => {
    console.log(
      `📚 Received message history (${data.messages.length} messages)`,
    );
    if (data.messages.length > 0) {
      console.log("Last message:", data.messages[data.messages.length - 1]);
    }
  });

  socket.on("receive_message", (data) => {
    console.log("📨 Message received:", {
      from: data.sender || data.username,
      message: data.message,
      timestamp: data.timestamp,
    });
  });

  socket.on("user_joined", (data) => {
    console.log("👋 User joined notification");
  });

  socket.on("user_typing", (data) => {
    console.log("✏️ Typing indicator:", data);
  });

  socket.on("connect_error", (error) => {
    console.error("❌ Connection error:", error.message);
    console.log("Trying to connect with polling transport...");

    // Try alternative connection
    socket.io.opts.transports = ["polling", "websocket"];
  });

  socket.on("disconnect", (reason) => {
    console.log("Disconnected:", reason);
  });

  socket.on("error", (error) => {
    console.error("Socket error:", error);
  });

  // Keep the test running for 30 seconds
  setTimeout(() => {
    console.log("⏱️ Test timeout - disconnecting");
    socket.disconnect();
    process.exit(0);
  }, 30000);
}

// Add error handling for uncaught exceptions
process.on("uncaughtException", (error) => {
  console.error("Uncaught Exception:", error);
  process.exit(1);
});

testFullFlow();
