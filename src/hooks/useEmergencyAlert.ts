import { useState, useEffect, useCallback, useRef } from 'react';
import type { RealtimeChannel } from '@supabase/supabase-js';
import { getAlertInfo, acknowledgeAlert } from '../services/emergencyApi';
import {
  subscribeToLocationUpdates,
  subscribeToAlertStatus,
  unsubscribe,
  type LocationUpdate,
  type AlertStatusUpdate,
} from '../services/realtime';
import type {
  EmergencyState,
  AcknowledgmentType,
  Location,
} from '../types/emergency';

export interface UseEmergencyAlertReturn extends EmergencyState {
  refreshAlert: () => Promise<void>;
  acknowledge: (type: AcknowledgmentType, options?: { message?: string; etaMinutes?: number }) => Promise<boolean>;
  location: Location | null;
}

export function useEmergencyAlert(token: string | null): UseEmergencyAlertReturn {
  const [state, setState] = useState<EmergencyState>({
    loading: true,
    error: null,
    alert: null,
    contact: null,
    existingAcknowledgment: null,
    messages: [],
    statusTemplates: [],
  });

  const [location, setLocation] = useState<Location | null>(null);
  const channelsRef = useRef<RealtimeChannel[]>([]);

  const fetchAlertInfo = useCallback(async () => {
    if (!token) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: 'No token provided',
      }));
      return;
    }

    setState(prev => ({ ...prev, loading: true, error: null }));

    const response = await getAlertInfo(token);

    if (response.success && response.data) {
      setState({
        loading: false,
        error: null,
        alert: response.data.alert,
        contact: response.data.contact,
        existingAcknowledgment: response.data.existingAcknowledgment,
        messages: response.data.messages,
        statusTemplates: response.data.statusTemplates,
      });
      setLocation(response.data.alert.location);
    } else {
      setState(prev => ({
        ...prev,
        loading: false,
        error: response.error?.message || 'Failed to load alert information',
      }));
    }
  }, [token]);

  // Subscribe to real-time updates
  useEffect(() => {
    if (!state.alert?.id) return;

    const alertId = state.alert.id;

    // Subscribe to location updates
    const locationChannel = subscribeToLocationUpdates(alertId, (update: LocationUpdate) => {
      setLocation({
        latitude: update.latitude,
        longitude: update.longitude,
        accuracy: update.accuracy || undefined,
      });
    });

    // Subscribe to alert status updates
    const statusChannel = subscribeToAlertStatus(alertId, (update: AlertStatusUpdate) => {
      setState(prev => {
        if (!prev.alert) return prev;
        return {
          ...prev,
          alert: {
            ...prev.alert,
            status: update.status,
            resolved_at: update.resolved_at,
          },
        };
      });
    });

    channelsRef.current = [locationChannel, statusChannel];

    return () => {
      channelsRef.current.forEach(channel => unsubscribe(channel));
      channelsRef.current = [];
    };
  }, [state.alert?.id]);

  // Initial fetch
  useEffect(() => {
    fetchAlertInfo();
  }, [fetchAlertInfo]);

  const acknowledge = useCallback(
    async (
      type: AcknowledgmentType,
      options?: { message?: string; etaMinutes?: number }
    ): Promise<boolean> => {
      if (!token) return false;

      const response = await acknowledgeAlert(token, type, options);

      if (response.success && response.data) {
        setState(prev => ({
          ...prev,
          existingAcknowledgment: {
            id: response.data!.acknowledgmentId,
            sos_alert_id: response.data!.sosAlertId,
            contact_id: prev.contact?.id || '',
            acknowledgment_type: type,
            message: options?.message || null,
            eta_minutes: options?.etaMinutes || null,
            responded_at: new Date().toISOString(),
            latitude: null,
            longitude: null,
          },
        }));
        return true;
      }

      return false;
    },
    [token]
  );

  return {
    ...state,
    location,
    refreshAlert: fetchAlertInfo,
    acknowledge,
  };
}
