export interface Message {
  id: string;
  room_id?: string; // Database field name
  roomId?: string; // WebSocket field name
  message: string;
  content?: string; // Database field name
  sender: string;
  username?: string;
  timestamp: string;
  created_at?: string; // Database field name
  socketId?: string;
  user_id?: string;
  metadata?: any;
}

// Helper to normalize message from different sources
export const normalizeMessage = (msg: any): Message => {
  return {
    id: msg.id,
    roomId: msg.roomId || msg.room_id,
    message: msg.message || msg.content || "",
    sender: msg.sender || msg.username || "Anonymous",
    username: msg.username || msg.sender,
    timestamp: msg.timestamp || msg.created_at,
    socketId: msg.socketId,
    ...msg,
  };
};

export interface Room {
  id: string;
  name: string;
  description: string;
  is_private: boolean;
  created_at: string;
}

export interface User {
  id: string;
  username: string;
  avatar_url?: string;
}

export interface SocketEvent {
  type: "join_room" | "send_message" | "typing" | "disconnect";
  data: any;
}
