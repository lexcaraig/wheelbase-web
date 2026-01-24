import { useState, useEffect, useCallback } from 'react';
import { sendMessage, sendStatusUpdate } from '../services/emergencyApi';
import { subscribeToAllFirebaseMessages, pushMessageToFirebase } from '../services/firebase';
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
  contactId: string | null,
  initialMessages: ChatMessage[]
): UseChatReturn {
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [isSending, setIsSending] = useState(false);

  // Subscribe to Firebase RTDB for real-time chat messages
  useEffect(() => {
    if (!alertId) return;

    console.log('[useChat] Subscribing to Firebase RTDB for alert:', alertId);

    // Subscribe to all messages from Firebase
    const unsubscribe = subscribeToAllFirebaseMessages(alertId, (firebaseMessages) => {
      console.log('[useChat] Firebase messages updated:', firebaseMessages.length);
      setMessages(firebaseMessages);
    });

    return () => {
      console.log('[useChat] Unsubscribing from Firebase RTDB');
      unsubscribe();
    };
  }, [alertId]);

  // Also update when initial messages change (from Supabase fetch)
  useEffect(() => {
    if (initialMessages.length > 0 && messages.length === 0) {
      setMessages(initialMessages);
    }
  }, [initialMessages, messages.length]);

  const sendTextMessage = useCallback(
    async (content: string): Promise<boolean> => {
      if (!token || !content.trim() || !alertId) return false;

      setIsSending(true);

      try {
        // Send to Supabase via Edge Function (persists to database)
        const response = await sendMessage(token, content.trim());

        if (response.success) {
          // Also push to Firebase RTDB for real-time sync
          await pushMessageToFirebase(alertId, {
            sender_type: 'contact',
            sender_contact_id: contactId || undefined,
            message_type: 'text',
            content: content.trim(),
          });

          console.log('[useChat] Message sent and pushed to Firebase');
          return true;
        }

        return false;
      } catch (error) {
        console.error('[useChat] Error sending message:', error);
        return false;
      } finally {
        setIsSending(false);
      }
    },
    [token, alertId, contactId]
  );

  const sendQuickStatus = useCallback(
    async (statusCode: string): Promise<boolean> => {
      if (!token || !alertId) return false;

      setIsSending(true);

      try {
        const response = await sendStatusUpdate(token, statusCode);

        if (response.success) {
          // Also push status to Firebase RTDB
          await pushMessageToFirebase(alertId, {
            sender_type: 'contact',
            sender_contact_id: contactId || undefined,
            message_type: 'status_update',
            content: statusCode,
          });

          return true;
        }

        return false;
      } catch (error) {
        console.error('[useChat] Error sending status:', error);
        return false;
      } finally {
        setIsSending(false);
      }
    },
    [token, alertId, contactId]
  );

  return {
    messages,
    sendTextMessage,
    sendQuickStatus,
    isSending,
  };
}
