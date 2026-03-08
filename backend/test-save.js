const { saveMessage } = require('./db/index.js');

async function testSave() {
  try {
    console.log('Testing message save...');
    
    const result = await saveMessage({
      roomId: '11111111-1111-1111-1111-111111111111', // general room
      userId: '22222222-2222-2222-2222-222222222222', // test user
      content: 'Hello from test!',
      messageType: 'text',
      metadata: { test: true }
    });
    
    console.log('✅ Message saved successfully:', result);
    
    // Query to verify
    const { query } = require('./db/index.js');
    const messages = await query('SELECT * FROM messages ORDER BY created_at DESC LIMIT 5');
    console.log('Latest messages:', messages.rows);
    
  } catch (error) {
    console.error('❌ Error saving message:', error.message);
  }
}

testSave();