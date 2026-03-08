const { query } = require("./db/index.js");

async function initDatabase() {
  try {
    console.log("Starting database initialization...");

    // Create users table
    await query(`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        username VARCHAR(50) UNIQUE NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        avatar_url TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log("✅ Users table created/verified");

    // Create rooms table
    await query(`
      CREATE TABLE IF NOT EXISTS rooms (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(100) NOT NULL,
        description TEXT,
        is_private BOOLEAN DEFAULT false,
        created_by UUID REFERENCES users(id),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log("✅ Rooms table created/verified");

    // Create messages table (WITHOUT the index in CREATE TABLE)
    await query(`
  CREATE TABLE IF NOT EXISTS messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    room_id UUID REFERENCES rooms(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id),
    content TEXT NOT NULL,
    message_type VARCHAR(20) DEFAULT 'text',
    metadata JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_room_created (room_id, created_at)
  )
`);
    console.log("✅ Messages table created/verified");

    // Create the index SEPARATELY
    await query(`
      CREATE INDEX IF NOT EXISTS idx_room_created 
      ON messages (room_id, created_at)
    `);
    console.log("✅ Index created on messages(room_id, created_at)");

    // Create room_participants table
    await query(`
      CREATE TABLE IF NOT EXISTS room_participants (
        room_id UUID REFERENCES rooms(id) ON DELETE CASCADE,
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (room_id, user_id)
      )
    `);
    console.log("✅ Room participants table created/verified");

    // Create a test room
    await query(`
      INSERT INTO rooms (id, name, description, is_private)
      VALUES ('11111111-1111-1111-1111-111111111111', 'general', 'General discussion room', false)
      ON CONFLICT (id) DO NOTHING
    `);
    console.log('✅ Test room "general" created');

    // Create a test user
    await query(`
      INSERT INTO users (id, username, email)
      VALUES ('22222222-2222-2222-2222-222222222222', 'testuser', 'test@example.com')
      ON CONFLICT (id) DO NOTHING
    `);

    await query(`
  INSERT INTO users (id, username, email)
  VALUES ('00000000-0000-0000-0000-000000000000', 'Anonymous', 'anon@example.com')
  ON CONFLICT (id) DO NOTHING
`);

    // Insert some sample messages
    await query(`
  INSERT INTO messages (room_id, user_id, content, message_type)
  SELECT 
    '11111111-1111-1111-1111-111111111111',
    '00000000-0000-0000-0000-000000000000',
    'Welcome to the chat! 👋',
    'text'
  WHERE NOT EXISTS (SELECT 1 FROM messages WHERE content = 'Welcome to the chat! 👋')
`);

    console.log('✅ Test user "testuser" created');

    console.log("🎉 Database initialization completed successfully!");
  } catch (error) {
    console.error("❌ Error initializing database:", error.message);
    console.error("Full error:", error);
  }
}

module.exports = { initDatabase };

initDatabase();
