'use client';

import { useState, useEffect } from 'react';
import { Room } from '@/lib/types';
import { Hash, Lock, Users } from 'lucide-react';

interface RoomSidebarProps {
  currentRoom: string;
  onRoomChange: (roomId: string) => void;
  currentUser: { id: string; username: string };
}

export default function RoomSidebar({ currentRoom, onRoomChange, currentUser }: RoomSidebarProps) {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    loadRooms();
  }, []);
  
  const loadRooms = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:8000/api/rooms');
      
      if (!response.ok) {
        throw new Error('Failed to load rooms');
      }
      
      const data = await response.json();
      setRooms(data);
    } catch (error) {
      console.error('Error loading rooms:', error);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="h-full flex flex-col">
      {/* User info */}
      <div className="p-4 border-b">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
            <Users className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <p className="font-medium">{currentUser.username}</p>
            <p className="text-sm text-gray-500">Online</p>
          </div>
        </div>
      </div>
      
      {/* Rooms list */}
      <div className="p-4">
        <h3 className="text-sm font-semibold text-gray-500 mb-3">ROOMS</h3>
        <div className="space-y-1">
          {loading ? (
            <p className="text-gray-500 text-sm">Loading rooms...</p>
          ) : (
            rooms.map(room => (
              <button
                key={room.id}
                onClick={() => onRoomChange(room.id)}
                className={`flex items-center gap-2 w-full p-2 rounded-lg text-left transition-colors ${
                  currentRoom === room.id 
                    ? 'bg-blue-100 text-blue-700' 
                    : 'hover:bg-gray-100 text-gray-700'
                }`}
              >
                {room.is_private ? (
                  <Lock className="w-4 h-4" />
                ) : (
                  <Hash className="w-4 h-4" />
                )}
                <span className="truncate">{room.name}</span>
              </button>
            ))
          )}
        </div>
      </div>
      
      {/* Refresh button */}
      <div className="p-4 mt-auto border-t">
        <button
          onClick={loadRooms}
          disabled={loading}
          className="w-full py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg disabled:opacity-50"
        >
          {loading ? 'Refreshing...' : 'Refresh Rooms'}
        </button>
      </div>
    </div>
  );
}