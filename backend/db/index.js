const { Pool } = require("pg");
require("dotenv").config();


// Test connection
const pool = new Pool({
  connectionString:
    process.env.DATABASE_URL ||
    "postgresql://admin:secret@postgres:5432/chatapp", // ✅ CHANGE chatapp TO admin
  ssl:
    process.env.NODE_ENV === "production"
      ? { rejectUnauthorized: false }
      : false,
});

// Helper function to save messages
async function saveMessage(messageData) {
  const {
    roomId,
    userId,
    content,
    messageType = "text",
    metadata = {},
  } = messageData;

  const query = `
    INSERT INTO messages (room_id, user_id, content, message_type, metadata)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING id, created_at
  `;

  try {
    const result = await pool.query(query, [
      roomId,
      userId,
      content,
      messageType,
      metadata,
    ]);
    return result.rows[0];
  } catch (error) {
    console.error("Error saving message:", error);
    throw error;
  }
}

module.exports = {
  pool,
  saveMessage,
  query: (text, params) => pool.query(text, params),
};
