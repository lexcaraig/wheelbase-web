import { useEffect, useRef } from 'react';
import type { ChatMessage } from '../types/emergency';
import { formatShortTime } from '../utils/formatters';

interface ChatWindowProps {
  messages: ChatMessage[];
  userName: string;
  contactName: string;
}

export function ChatWindow({ messages, userName, contactName }: ChatWindowProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (messages.length === 0) {
    return (
      <div className="bg-secondary-background rounded-xl p-4 h-48 flex items-center justify-center">
        <p className="text-gray-400 text-center text-sm">
          No messages yet. Send a message to let {userName} know you're here to help.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-secondary-background rounded-xl overflow-hidden">
      <div className="p-3 border-b border-gray-700">
        <h3 className="font-medium text-white text-sm">Messages</h3>
      </div>

      <div className="h-64 overflow-y-auto p-3 space-y-3">
        {messages.map(message => {
          const isFromUser = message.sender_type === 'user';
          const isStatusUpdate = message.message_type === 'status_update';
          const isLocationShare = message.message_type === 'location_share';

          return (
            <div
              key={message.id}
              className={`flex flex-col ${isFromUser ? 'items-start' : 'items-end'}`}
            >
              {/* Sender name */}
              <span className="text-xs text-gray-500 mb-1 px-1">
                {isFromUser ? userName : contactName}
              </span>

              {/* Message bubble */}
              <div
                className={`max-w-[85%] px-4 py-2 ${
                  isFromUser
                    ? 'message-user'
                    : 'message-contact'
                } ${isStatusUpdate ? 'italic' : ''}`}
              >
                {/* Location share indicator */}
                {isLocationShare && message.latitude && message.longitude && (
                  <a
                    href={`https://www.google.com/maps?q=${message.latitude},${message.longitude}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-blue-400 hover:underline mb-1"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    View Location
                  </a>
                )}

                {/* Message content */}
                <p className={`text-sm break-words ${isFromUser ? '' : 'text-white'}`}>
                  {message.content}
                </p>
              </div>

              {/* Timestamp */}
              <span className="text-xs text-gray-500 mt-1 px-1">
                {formatShortTime(message.created_at)}
              </span>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
}
