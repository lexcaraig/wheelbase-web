import { useState, useEffect, useCallback, useRef } from 'react';
import type { RealtimeChannel } from '@supabase/supabase-js';
import { sendMessage, sendStatusUpdate } from '../services/emergencyApi';
import { subscribeToChatMessages, unsubscribe } from '../services/realtime';
import type { ChatMessage } from '../types/emergency';

export interface UseChatReturn {
  messages: ChatMessage[];
  sendTextMessage: (content: string) => Promise<boolean>;
  sendQuickStatus: (statusCode: string) => Promise<boolean>;
  isSending: boolean;
}

export function useChat(
  token: string | null,
  alertId: string | null,
  initialMessages: ChatMessage[]
): UseChatReturn {
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [isSending, setIsSending] = useState(false);
  const channelRef = useRef<RealtimeChannel | null>(null);

  // Update messages when initial messages change
  useEffect(() => {
    setMessages(initialMessages);
  }, [initialMessages]);

  // Subscribe to real-time chat messages
  useEffect(() => {
    if (!alertId) return;

    const channel = subscribeToChatMessages(alertId, (newMessage: ChatMessage) => {
      setMessages(prev => {
        // Avoid duplicates
        if (prev.some(msg => msg.id === newMessage.id)) {
          return prev;
        }
        return [...prev, newMessage];
      });
    });

    channelRef.current = channel;

    return () => {
      if (channelRef.current) {
        unsubscribe(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [alertId]);

  const sendTextMessage = useCallback(
    async (content: string): Promise<boolean> => {
      if (!token || !content.trim()) return false;

      setIsSending(true);

      try {
        const response = await sendMessage(token, content.trim());

        if (response.success) {
          // The message will be added via real-time subscription
          // But we can optimistically add it here for better UX
          return true;
        }

        return false;
      } finally {
        setIsSending(false);
      }
    },
    [token]
  );

  const sendQuickStatus = useCallback(
    async (statusCode: string): Promise<boolean> => {
      if (!token) return false;

      setIsSending(true);

      try {
        const response = await sendStatusUpdate(token, statusCode);
        return response.success;
      } finally {
        setIsSending(false);
      }
    },
    [token]
  );

  return {
    messages,
    sendTextMessage,
    sendQuickStatus,
    isSending,
  };
}
