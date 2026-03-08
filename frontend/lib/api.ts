import { Message, Room, User } from "./types";

// Simple fetch wrapper for REST API calls
export class ApiClient {
  private baseUrl: string;
  
  constructor(baseUrl: string = 'http://localhost:8000') {
    this.baseUrl = baseUrl;
  }
  
  async get<T>(endpoint: string): Promise<T> {
    const response = await fetch(`${this.baseUrl}${endpoint}`);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    return response.json();
  }
  
  async post<T>(endpoint: string, data: any): Promise<T> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    return response.json();
  }
  
  // Add PUT, DELETE, etc. as needed
}

// Singleton instance
export const api = new ApiClient();

// Specific API functions for your chat app
export const chatApi = {
  // Get all rooms
  getRooms: () => api.get<Room[]>('/api/rooms'),
  
  // Get messages for a room
  getMessages: (roomId: string) => 
    api.get<Message[]>(`/api/rooms/${roomId}/messages`),
  
  // Get user info
  getUser: (userId: string) => 
    api.get<User>(`/api/users/${userId}`),
  
  // Send a message (if you want REST fallback)
  sendMessage: (roomId: string, message: string, sender: string) =>
    api.post('/api/messages', { roomId, message, sender }),
};