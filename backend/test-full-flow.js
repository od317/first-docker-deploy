const io = require("socket.io-client");

async function testFullFlow() {
  console.log("🧪 Testing complete chat flow...");

  // Connect to WebSocket
  const socket = io("http://localhost:8000");

  socket.on("connect", () => {
    console.log("✅ Connected to WebSocket, ID:", socket.id);

    // Join a room
    socket.emit("join_room", "11111111-1111-1111-1111-111111111111");

    // Send a message
    setTimeout(() => {
      socket.emit("send_message", {
        roomId: "11111111-1111-1111-1111-111111111111",
        message: "Test message from automated test!",
        sender: "TestBot",
        userId: "22222222-2222-2222-2222-222222222222",
        username: "testuser",
      });
      console.log("📤 Test message sent");
    }, 1000);
  });

  socket.on("receive_message", (data) => {
    console.log("📨 Message received:", {
      from: data.sender,
      message: data.message,
      timestamp: data.timestamp,
    });

    // Wait and disconnect
    setTimeout(() => {
      socket.disconnect();
      console.log("✅ Test completed successfully!");
      process.exit(0);
    }, 2000);
  });

  socket.on("user_joined", (data) => {
    console.log("👋 User joined notification:", data.userId);
  });

  socket.on("connect_error", (error) => {
    console.error("❌ Connection error:", error);
    process.exit(1);
  });
}

testFullFlow();
