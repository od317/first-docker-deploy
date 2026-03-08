"use client";

import { useEffect, useState } from "react";

export default function TestPage() {
  const [backendStatus, setBackendStatus] = useState<
    "loading" | "online" | "offline"
  >("loading");
  const [databaseStatus, setDatabaseStatus] = useState<
    "loading" | "online" | "offline"
  >("loading");
  const [rooms, setRooms] = useState<any[]>([]);

  const testBackendConnection = async () => {
    try {
      // Test health endpoint
      const healthResponse = await fetch("http://localhost:8000/health");
      if (healthResponse.ok) {
        setBackendStatus("online");

        // Test rooms endpoint
        const roomsResponse = await fetch("http://localhost:8000/api/rooms");
        if (roomsResponse.ok) {
          const roomsData = await roomsResponse.json();
          setRooms(roomsData);
          setDatabaseStatus("online");
        } else {
          setDatabaseStatus("offline");
        }
      } else {
        setBackendStatus("offline");
      }
    } catch (error) {
      setBackendStatus("offline");
      setDatabaseStatus("offline");
    }
  };

  useEffect(() => {
    testBackendConnection();
  }, []);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Connection Test (Fetch API)</h1>

      <div className="space-y-4">
        <div
          className={`p-4 rounded-lg ${
            backendStatus === "online"
              ? "bg-green-100"
              : backendStatus === "offline"
              ? "bg-red-100"
              : "bg-yellow-100"
          }`}
        >
          <h2 className="font-bold">Backend Connection</h2>
          <p>
            Status:{" "}
            {backendStatus === "online"
              ? "✅ Online"
              : backendStatus === "offline"
              ? "❌ Offline"
              : "⏳ Loading..."}
          </p>
          <p>Endpoint: http://localhost:8000/health</p>
        </div>

        <div
          className={`p-4 rounded-lg ${
            databaseStatus === "online"
              ? "bg-green-100"
              : databaseStatus === "offline"
              ? "bg-red-100"
              : "bg-yellow-100"
          }`}
        >
          <h2 className="font-bold">Database Connection</h2>
          <p>
            Status:{" "}
            {databaseStatus === "online"
              ? "✅ Online"
              : databaseStatus === "offline"
              ? "❌ Offline"
              : "⏳ Loading..."}
          </p>
          <p>Endpoint: http://localhost:8000/api/rooms</p>
        </div>

        {rooms.length > 0 && (
          <div className="p-4 rounded-lg bg-blue-50">
            <h2 className="font-bold">Available Rooms ({rooms.length})</h2>
            <ul className="mt-2 space-y-1">
              {rooms.map((room) => (
                <li key={room.id} className="flex items-center gap-2">
                  <span className="inline-block w-2 h-2 rounded-full bg-green-500"></span>
                  {room.name} - {room.description}
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="p-4 rounded-lg bg-gray-100">
          <h2 className="font-bold">Test WebSocket Connection</h2>
          <button
            onClick={async () => {
              try {
                // Test WebSocket via fetch (this would create a REST endpoint for testing)
                const response = await fetch("http://localhost:8000/health");
                if (response.ok) {
                  alert(
                    "✅ Backend is running. WebSocket should be available on port 8000."
                  );
                }
              } catch (error) {
                alert("❌ Cannot connect to backend.");
              }
            }}
            className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Test Connection
          </button>
        </div>
      </div>
    </div>
  );
}
