import { initializeApp } from 'firebase/app';
import { getDatabase, ref, push, set, onValue, off, DataSnapshot } from 'firebase/database';
import type { ChatMessage, SenderType, MessageType } from '../types/emergency';

// Firebase configuration for Wheelbase
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'AIzaSyDOqzW1EHYnNgqECmtst2kMqRf8f5ias7A',
  authDomain: 'wheelbase-d688c.firebaseapp.com',
  databaseURL: 'https://wheelbase-d688c-default-rtdb.firebaseio.com',
  projectId: 'wheelbase-d688c',
  storageBucket: 'wheelbase-d688c.firebasestorage.app',
  messagingSenderId: '249886728996',
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

/**
 * Subscribe to all messages for an alert (for initial load and updates)
 */
export function subscribeToAllFirebaseMessages(
  alertId: string,
  onMessagesUpdate: (messages: ChatMessage[]) => void
): () => void {
  const chatRef = ref(database, `emergency_chats/${alertId}/messages`);

  const callback = (snapshot: DataSnapshot) => {
    if (snapshot.exists()) {
      const messagesData = snapshot.val();
      const messages: ChatMessage[] = Object.entries(messagesData).map(([key, value]) => {
        const msg = value as Record<string, unknown>;
        return {
          id: key,
          sender_type: (msg.sender_type as SenderType) || 'user',
          message_type: (msg.message_type as MessageType) || 'text',
          content: msg.content as string,
          latitude: (msg.latitude as number) || null,
          longitude: (msg.longitude as number) || null,
          created_at: (msg.created_at as string) || new Date().toISOString(),
        };
      });

      // Sort by created_at
      messages.sort((a, b) =>
        new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      );

      onMessagesUpdate(messages);
    } else {
      onMessagesUpdate([]);
    }
  };

  onValue(chatRef, callback);

  return () => {
    off(chatRef, 'value', callback);
  };
}

/**
 * Push a new message to Firebase RTDB (mirrors Supabase)
 */
export async function pushMessageToFirebase(
  alertId: string,
  message: {
    sender_type: 'user' | 'contact';
    sender_user_id?: string;
    sender_contact_id?: string;
    message_type: string;
    content: string;
    latitude?: number;
    longitude?: number;
  }
): Promise<string | null> {
  try {
    const chatRef = ref(database, `emergency_chats/${alertId}/messages`);
    const newMessageRef = await push(chatRef, {
      ...message,
      created_at: new Date().toISOString(),
      read_by_user: message.sender_type === 'user',
      read_by_contact: message.sender_type === 'contact',
    });

    return newMessageRef.key;
  } catch (error) {
    console.error('Error pushing message to Firebase:', error);
    return null;
  }
}

/**
 * Push an acknowledgment to Firebase RTDB for real-time sync
 */
export async function pushAcknowledgmentToFirebase(
  alertId: string,
  acknowledgment: {
    id: string;
    contact_id: string;
    acknowledgment_type: string;
    eta_minutes?: number | null;
    message?: string | null;
  }
): Promise<boolean> {
  try {
    const ackRef = ref(database, `emergency_chats/${alertId}/acknowledgments/${acknowledgment.contact_id}`);
    // Firebase doesn't accept undefined values, convert to null
    await set(ackRef, {
      id: acknowledgment.id,
      contact_id: acknowledgment.contact_id,
      acknowledgment_type: acknowledgment.acknowledgment_type,
      eta_minutes: acknowledgment.eta_minutes ?? null,
      message: acknowledgment.message ?? null,
      updated_at: new Date().toISOString(),
    });
    console.log('[Firebase] Acknowledgment pushed for contact:', acknowledgment.contact_id);
    return true;
  } catch (error) {
    console.error('Error pushing acknowledgment to Firebase:', error);
    return false;
  }
}

/**
 * Subscribe to acknowledgment updates for an alert
 */
export function subscribeToAcknowledgments(
  alertId: string,
  onAcknowledgmentsUpdate: (acknowledgments: Record<string, unknown>[]) => void
): () => void {
  const ackRef = ref(database, `emergency_chats/${alertId}/acknowledgments`);

  const callback = (snapshot: DataSnapshot) => {
    if (snapshot.exists()) {
      const ackData = snapshot.val();
      const acknowledgments = Object.entries(ackData).map(([contactId, value]) => {
        const ack = value as Record<string, unknown>;
        return {
          id: ack.id || contactId,
          contact_id: contactId,
          acknowledgment_type: ack.acknowledgment_type || 'received',
          eta_minutes: ack.eta_minutes || null,
          message: ack.message || null,
          updated_at: ack.updated_at || new Date().toISOString(),
        };
      });
      onAcknowledgmentsUpdate(acknowledgments);
    } else {
      onAcknowledgmentsUpdate([]);
    }
  };

  onValue(ackRef, callback);

  return () => {
    off(ackRef, 'value', callback);
  };
}

export { database };
