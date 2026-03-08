import ChatInterface from '@/components/ChatInterface';

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-gray-900">RealTalk Chat</h1>
          <p className="text-gray-600 mt-2">A real-time chat application built with Next.js 16, WebSockets, and Docker</p>
        </div>
      </header>
      
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <ChatInterface />
        </div>
        
        {/* Connection Status Panel */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="font-bold text-lg mb-2">Backend Status</h3>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse"></div>
              <span>Connected to WebSocket server</span>
            </div>
            <p className="text-sm text-gray-600 mt-2">Port: 8000 • Docker: Running</p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="font-bold text-lg mb-2">Database Status</h3>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
              <span>PostgreSQL connected</span>
            </div>
            <p className="text-sm text-gray-600 mt-2">Messages are being saved in real-time</p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="font-bold text-lg mb-2">Test Instructions</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>1. Type a message and press Enter</li>
              <li>2. Click Send Test for auto-messages</li>
              <li>3. Open another browser tab for multi-user test</li>
              <li>4. Check browser console for WebSocket events</li>
            </ul>
          </div>
        </div>
      </main>
    </div>
  );
}