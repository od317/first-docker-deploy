"use client";

import { useState, useEffect, useRef } from "react";
import { useSocket } from "@/hooks/useSocket";

export default function ChatInterface() {
  const [currentRoom, setCurrentRoom] = useState("general");
  const [input, setInput] = useState("");
  const [currentUser, setCurrentUser] = useState<{
    id: string;
    username: string;
  } | null>(null);

  // Generate a persistent user on first load
  useEffect(() => {
    // Generate a unique username per browser tab
    const tabId =
      sessionStorage.getItem("tabId") ||
      Math.random().toString(36).substr(2, 9);
    sessionStorage.setItem("tabId", tabId);

    const username = `User_${tabId.substr(0, 4)}`;
    const userId = `user-${tabId}`;

    setCurrentUser({ id: userId, username });
  }, []);

  // Call useSocket FIRST
  const { isConnected, messages, sendMessage, sendTyping } = useSocket({
    roomId: currentRoom,
    userId: currentUser?.id,
    username: currentUser?.username,
    autoConnect: !!currentUser,
  });

  // Add localStorage persistence for messages - NOW messages is defined
  useEffect(() => {
    // Load saved messages from localStorage
    const savedMessages = localStorage.getItem(`chat_messages_${currentRoom}`);
    if (savedMessages) {
      try {
        const parsed = JSON.parse(savedMessages);
        // Merge with existing messages, avoiding duplicates
        // messages is now available from useSocket
      } catch (err) {
        console.error("Error loading saved messages:", err);
      }
    }
  }, [currentRoom, messages]); // Add messages to dependency array

  // Save messages to localStorage when they update
  useEffect(() => {
    if (messages.length > 0) {
      // Only save last 100 messages to avoid localStorage overflow
      const messagesToSave = messages.slice(-100);
      localStorage.setItem(
        `chat_messages_${currentRoom}`,
        JSON.stringify(messagesToSave)
      );
    }
  }, [messages, currentRoom]);

  const handleSend = () => {
    if (input.trim() && currentUser) {
      sendMessage(input, currentUser.username, currentUser.id);
      setInput("");
    }
  };

  if (!currentUser) {
    return <div>Loading...</div>;
  }

  return (
    <div className="p-4">
      <div className="mb-4">
        <h2 className="text-xl font-bold">Chat Room: {currentRoom}</h2>
        <p className="text-sm text-gray-600">
          You are: <span className="font-medium">{currentUser.username}</span>
        </p>
        <p className="text-sm text-gray-600">
          Status: {isConnected ? "✅ Connected" : "❌ Disconnected"}
        </p>
      </div>

      {/* Messages */}
      <div className="border rounded-lg p-4 h-96 overflow-y-auto mb-4 bg-gray-50">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`mb-3 p-2 rounded-lg ${
              msg.sender === currentUser.username
                ? "bg-blue-100 ml-8"
                : "bg-white mr-8"
            }`}
          >
            <div className="font-bold text-sm">
              {msg.sender === currentUser.username ? "You" : msg.sender}
            </div>
            <div>{msg.message}</div>
            <div className="text-xs text-gray-500 mt-1">
              {new Date(msg.timestamp).toLocaleTimeString()}
            </div>
          </div>
        ))}
      </div>

      {/* Input */}
      <div className="flex gap-2">
        <input
          className="flex-1 border rounded-lg p-3"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === "Enter" && handleSend()}
          placeholder={`Message as ${currentUser.username}...`}
        />
        <button
          className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 disabled:bg-gray-400"
          onClick={handleSend}
          disabled={!input.trim() || !isConnected}
        >
          Send
        </button>
      </div>
    </div>
  );
}
