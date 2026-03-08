import { useEffect, useState, useCallback, useRef } from "react";
import socket, { connectSocket } from "@/lib/socket";
import { Message } from "@/lib/types";

interface UseSocketOptions {
  roomId?: string;
  autoConnect?: boolean;
  userId?: string;
  username?: string;
}

export const useSocket = (options: UseSocketOptions = {}) => {
  const { roomId = "general", autoConnect = true, userId, username } = options;

  const [isConnected, setIsConnected] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set());
  const [socketId, setSocketId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const hasConnectedRef = useRef(false);

  // Connect to socket
  const connect = useCallback(() => {
    // Prevent multiple connections
    if (hasConnectedRef.current || socket.isConnected()) {
      return;
    }

    hasConnectedRef.current = true;

    try {
      const socketInstance = connectSocket({
        // ✅ Define socketInstance here
        userId,
        username,
        autoReconnect: true,
        onConnect: () => {
          setIsConnected(true);
          setSocketId(socket.getSocketId());
          setError(null);

          // Join room if specified
          if (roomId) {
            socket.joinRoom(roomId);
          }
        },
        onDisconnect: (reason) => {
          // Only update state if it wasn't a manual disconnect
          if (reason !== "io client disconnect") {
            setIsConnected(false);
          }
        },
        onError: (error) => {
          setError(error.message);
          setIsConnected(false);
        },
      });

      // Listen for messages - ✅ Now socketInstance is defined
      socketInstance.on("receive_message", (message: Message) => {
        setMessages((prev) => [...prev, message]);
      });

      // Listen for typing indicators
      socketInstance.on(
        "user_typing",
        (data: { userId: string; isTyping: boolean }) => {
          setTypingUsers((prev) => {
            const newSet = new Set(prev);
            if (data.isTyping) {
              newSet.add(data.userId);
            } else {
              newSet.delete(data.userId);
            }
            return newSet;
          });
        }
      );

      // Listen for user joins
      socketInstance.on("user_joined", (data: { userId: string }) => {
        console.log(`User ${data.userId} joined room ${roomId}`);
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Connection failed");
      hasConnectedRef.current = false; // Reset on error
    }
  }, [roomId, userId, username]);

  // Send message
  const sendMessage = useCallback(
    (message: string, sender: string, userId?: string) => {
      if (!socket.isConnected()) {
        setError("Not connected to server");
        return false;
      }

      // Send with ALL user data
      socket.sendMessage(roomId, message, sender, userId, {
        username: sender,
        userId: userId,
      });
      return true;
    },
    [roomId]
  );

  // Send typing indicator
  const sendTyping = useCallback(
    (isTyping: boolean) => {
      if (socket.isConnected()) {
        socket.sendTypingIndicator(roomId, isTyping);
      }
    },
    [roomId]
  );

  // Disconnect
  const disconnect = useCallback(() => {
    hasConnectedRef.current = false;
    socket.disconnect();
    setIsConnected(false);
    setSocketId(null);
  }, []);

  // Clear messages
  const clearMessages = useCallback(() => {
    setMessages([]);
  }, []);

  // Load message history from REST API
  const loadMessageHistory = useCallback(async () => {
    try {
      const API_URL =
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      const response = await fetch(`${API_URL}/api/rooms/${roomId}/messages`);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      setMessages(data.reverse());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load messages");
      console.error("Error loading message history:", err);
    }
  }, [roomId]);

  // Auto-connect on mount if enabled
  useEffect(() => {
    if (autoConnect && !hasConnectedRef.current) {
      connect();

      // Load message history after a short delay
      const timer = setTimeout(() => {
        if (socket.isConnected()) {
          loadMessageHistory();
        }
      }, 1000);

      return () => {
        clearTimeout(timer);
        // DON'T disconnect here
      };
    }
  }, [autoConnect, connect, loadMessageHistory]);

  return {
    // State
    isConnected,
    messages,
    typingUsers,
    socketId,
    error,

    // Actions
    connect,
    disconnect,
    sendMessage,
    sendTyping,
    clearMessages,
    loadMessageHistory,

    // Connection info
    connectionInfo: {
      url: process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:8000",
      roomId,
      userId: userId || "anonymous",
    },
  };
};
