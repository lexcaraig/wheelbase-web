import { supabase } from './supabase';
import type { RealtimeChannel } from '@supabase/supabase-js';
import type { ChatMessage } from '../types/emergency';

export interface LocationUpdate {
  latitude: number;
  longitude: number;
  accuracy: number | null;
  updated_at: string;
}

export interface AlertStatusUpdate {
  status: 'active' | 'resolved' | 'cancelled';
  resolved_at: string | null;
}

type LocationCallback = (location: LocationUpdate) => void;
type MessageCallback = (message: ChatMessage) => void;
type StatusCallback = (status: AlertStatusUpdate) => void;

/**
 * Subscribe to real-time location updates for an SOS alert
 */
export function subscribeToLocationUpdates(
  alertId: string,
  onUpdate: LocationCallback
): RealtimeChannel {
  const channel = supabase
    .channel(`sos_location:${alertId}`)
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'sos_alerts',
        filter: `id=eq.${alertId}`,
      },
      (payload) => {
        const { latitude, longitude, location_accuracy_m, updated_at } = payload.new as Record<string, unknown>;
        if (latitude && longitude) {
          onUpdate({
            latitude: latitude as number,
            longitude: longitude as number,
            accuracy: location_accuracy_m as number | null,
            updated_at: updated_at as string,
          });
        }
      }
    )
    .subscribe();

  return channel;
}

/**
 * Subscribe to real-time alert status updates
 */
export function subscribeToAlertStatus(
  alertId: string,
  onUpdate: StatusCallback
): RealtimeChannel {
  const channel = supabase
    .channel(`sos_status:${alertId}`)
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'sos_alerts',
        filter: `id=eq.${alertId}`,
      },
      (payload) => {
        const { status, resolved_at } = payload.new as Record<string, unknown>;
        onUpdate({
          status: status as 'active' | 'resolved' | 'cancelled',
          resolved_at: resolved_at as string | null,
        });
      }
    )
    .subscribe();

  return channel;
}

/**
 * Subscribe to real-time chat messages for an SOS alert
 */
export function subscribeToChatMessages(
  alertId: string,
  onMessage: MessageCallback
): RealtimeChannel {
  const channel = supabase
    .channel(`emergency_chat:${alertId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'emergency_chat_messages',
        filter: `sos_alert_id=eq.${alertId}`,
      },
      (payload) => {
        const newMessage = payload.new as ChatMessage;
        onMessage(newMessage);
      }
    )
    .subscribe();

  return channel;
}

/**
 * Unsubscribe from a channel
 */
export function unsubscribe(channel: RealtimeChannel): void {
  supabase.removeChannel(channel);
}
