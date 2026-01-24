import type {
  ApiResponse,
  AlertInfoResponse,
  AcknowledgeResponse,
  SendMessageResponse,
  StatusUpdateResponse,
  AcknowledgmentType,
  MessageType,
} from '../types/emergency';

const API_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/emergency-acknowledgment`;

async function apiRequest<T>(body: Record<string, unknown>): Promise<ApiResponse<T>> {
  try {
    const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': anonKey,
        'Authorization': `Bearer ${anonKey}`,
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();
    return data as ApiResponse<T>;
  } catch (error) {
    console.error('API request failed:', error);
    return {
      success: false,
      error: { message: 'Network error. Please check your connection.' },
    };
  }
}

/**
 * Get alert information for the response page
 */
export async function getAlertInfo(token: string): Promise<ApiResponse<AlertInfoResponse>> {
  return apiRequest<AlertInfoResponse>({
    action: 'get_alert_info',
    token,
  });
}

/**
 * Acknowledge the SOS alert
 */
export async function acknowledgeAlert(
  token: string,
  acknowledgmentType: AcknowledgmentType,
  options?: {
    message?: string;
    etaMinutes?: number;
    latitude?: number;
    longitude?: number;
  }
): Promise<ApiResponse<AcknowledgeResponse>> {
  return apiRequest<AcknowledgeResponse>({
    action: 'acknowledge',
    token,
    acknowledgmentType,
    ...options,
  });
}

/**
 * Send a chat message
 */
export async function sendMessage(
  token: string,
  content: string,
  messageType: MessageType = 'text',
  location?: { latitude: number; longitude: number }
): Promise<ApiResponse<SendMessageResponse>> {
  return apiRequest<SendMessageResponse>({
    action: 'send_message',
    token,
    messageType,
    content,
    ...location,
  });
}

/**
 * Send a quick status update using a template
 */
export async function sendStatusUpdate(
  token: string,
  statusCode: string
): Promise<ApiResponse<StatusUpdateResponse>> {
  return apiRequest<StatusUpdateResponse>({
    action: 'status_update',
    token,
    statusCode,
  });
}
