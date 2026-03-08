'use client';

import { Message } from '@/lib/types';
import { format } from 'date-fns';
import { User, Clock } from 'lucide-react';

interface MessageListProps {
  messages: Message[];
  typingUsers: Set<string>;
}

export default function MessageList({ messages, typingUsers }: MessageListProps) {
  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      {/* Messages */}
      {messages.map((msg) => (
        <div key={msg.id} className="flex gap-3 p-3 rounded-lg bg-white shadow-sm hover:bg-gray-50">
          <div className="flex-shrink-0">
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
              <User className="w-5 h-5 text-blue-600" />
            </div>
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-bold text-gray-900">{msg.sender}</span>
              <span className="text-xs text-gray-500 flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {format(new Date(msg.timestamp), 'HH:mm')}
              </span>
            </div>
            <p className="text-gray-800">{msg.message}</p>
          </div>
        </div>
      ))}
      
      {/* Typing indicators */}
      {typingUsers.size > 0 && (
        <div className="text-sm text-gray-500 italic p-2">
          {Array.from(typingUsers).join(', ')} {typingUsers.size === 1 ? 'is' : 'are'} typing...
        </div>
      )}
      
      {/* Empty state */}
      {messages.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <div className="mb-4">💬</div>
          <p>No messages yet. Start the conversation!</p>
        </div>
      )}
    </div>
  );
}