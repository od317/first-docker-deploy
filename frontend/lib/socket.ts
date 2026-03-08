import { io, Socket } from "socket.io-client";

// Get WebSocket URL from environment or use default
const WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8000';
const IS_DEV = process.env.NODE_ENV === "development";

interface ConnectionOptions {
  userId?: string;
  username?: string;
  autoReconnect?: boolean;
  onConnect?: () => void;
  onDisconnect?: (reason: string) => void;
  onError?: (error: Error) => void;
}

class SocketService {
  private socket: Socket | null = null;
  private static instance: SocketService;
  private connectionOptions: ConnectionOptions = {};

  private constructor() {}

  public static getInstance(): SocketService {
    if (!SocketService.instance) {
      SocketService.instance = new SocketService();
    }
    return SocketService.instance;
  }

  // Initialize connection with options
  public connect(options: ConnectionOptions = {}): Socket {
    if (this.socket?.connected) {
      IS_DEV && console.log("⚠️ Already connected, returning existing socket");
      return this.socket;
    }

    // Store options for reconnection
    this.connectionOptions = {
      autoReconnect: true,
      ...options,
    };

    const { userId, username, autoReconnect } = this.connectionOptions;

    IS_DEV && console.log(`🔗 Connecting to WebSocket: ${WS_URL}`);

    this.socket = io(WS_URL, {
      reconnection: autoReconnect !== false,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 20000,
      auth: {
        userId: userId || `anonymous-${Date.now()}`,
        username: username || "Anonymous",
      },
      transports: ["websocket", "polling"], // Fallback for different environments
    });

    this.setupEventListeners();
    return this.socket;
  }

  // Get current socket instance
  public getSocket(): Socket | null {
    return this.socket;
  }

  // Check if connected
  public isConnected(): boolean {
    return this.socket?.connected || false;
  }

  // Get connection ID
  public getSocketId(): string | null {
    return this.socket?.id || null;
  }

  // Join a room
  public joinRoom(roomId: string): void {
    if (!this.socket?.connected) {
      IS_DEV && console.warn("Cannot join room: socket not connected");
      return;
    }

    IS_DEV && console.log(`🚪 Joining room: ${roomId}`);
    this.socket?.emit("join_room", roomId);
  }

  // Send a message with typing
  public sendMessage(
    roomId: string,
    message: string,
    sender: string,
    userId?: string,
    metadata?: Record<string, any>
  ): void {
    if (!this.socket?.connected) {
      IS_DEV && console.warn("Cannot send message: socket not connected");
      return;
    }

    if (!message.trim()) {
      IS_DEV && console.warn("Cannot send empty message");
      return;
    }

    IS_DEV &&
      console.log(
        `📤 Sending message to ${roomId}: ${message.substring(0, 50)}...`
      );

    this.socket?.emit("send_message", {
      roomId,
      message: message.trim(),
      sender,
      userId: userId || this.connectionOptions.userId || "anonymous",
      username: sender,
      timestamp: new Date().toISOString(),
      ...metadata,
    });
  }

  // Typing indicator with debounce
  private typingTimeout: NodeJS.Timeout | null = null;

  public sendTypingIndicator(roomId: string, isTyping: boolean): void {
    if (!this.socket?.connected) return;

    // Debounce typing events to avoid flooding
    if (this.typingTimeout) {
      clearTimeout(this.typingTimeout);
    }

    this.typingTimeout = setTimeout(
      () => {
        this.socket?.emit("typing", { roomId, isTyping });
        this.typingTimeout = null;
      },
      isTyping ? 0 : 100
    ); // Immediate start, delayed stop
  }

  // Listen for specific events
  public on(event: string, callback: (data: any) => void): void {
    this.socket?.on(event, callback);
  }

  // Remove event listener
  public off(event: string, callback?: (data: any) => void): void {
    this.socket?.off(event, callback);
  }

  // Disconnect
  public disconnect(): void {
    if (this.socket) {
      IS_DEV && console.log("👋 Disconnecting socket...");
      this.socket.disconnect();
      this.socket = null;
      this.connectionOptions = {};

      if (this.typingTimeout) {
        clearTimeout(this.typingTimeout);
        this.typingTimeout = null;
      }
    }
  }

  // Reconnect manually
  public reconnect(): void {
    if (this.socket) {
      IS_DEV && console.log("🔄 Manually reconnecting...");
      this.socket.connect();
    }
  }

  // Setup event listeners
  private setupEventListeners(): void {
    if (!this.socket) return;

    this.socket.on("connect", () => {
      const socketId = this.socket?.id;
      IS_DEV && console.log("✅ Connected to WebSocket server:", socketId);
      this.connectionOptions.onConnect?.();
    });

    this.socket.on("connect_error", (error) => {
      IS_DEV && console.error("❌ Connection error:", error.message);
      this.connectionOptions.onError?.(error);
    });

    this.socket.on("disconnect", (reason) => {
      IS_DEV && console.log("🔌 Disconnected:", reason);
      this.connectionOptions.onDisconnect?.(reason);

      // Attempt reconnect on certain disconnect reasons
      if (
        reason === "io server disconnect" &&
        this.connectionOptions.autoReconnect
      ) {
        IS_DEV &&
          console.log("🔄 Server disconnected, attempting reconnect...");
        this.socket.connect();
      }
    });

    // Custom events from your backend
    this.socket.on("receive_message", (data) => {
      IS_DEV &&
        console.log("📨 Received message:", {
          from: data.sender,
          room: data.roomId,
          length: data.message.length,
        });
    });

    this.socket.on("user_joined", (data) => {
      IS_DEV && console.log(`👋 User ${data.userId} joined room`);
    });

    this.socket.on("user_typing", (data) => {
      IS_DEV &&
        console.log(
          `⌨️ User ${data.userId} is ${
            data.isTyping ? "typing" : "stopped typing"
          }`
        );
    });
  }
}

// Singleton instance
export default SocketService.getInstance();

// Helper function for quick connection
export const connectSocket = (options?: ConnectionOptions) => {
  return SocketService.getInstance().connect(options);
};

// Helper to get socket instance
export const getSocket = () => {
  return SocketService.getInstance().getSocket();
};

// Helper to check connection status
export const isSocketConnected = () => {
  return SocketService.getInstance().isConnected();
};
