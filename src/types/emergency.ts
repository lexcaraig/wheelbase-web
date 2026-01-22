// Emergency Alert Types
export type AlertType = 'manual' | 'crash_detected';
export type AlertStatus = 'active' | 'resolved' | 'cancelled';
export type AcknowledgmentType = 'received' | 'responding' | 'on_the_way' | 'arrived' | 'cannot_help';
export type MessageType = 'text' | 'status_update' | 'location_share';
export type SenderType = 'user' | 'contact';

export interface Location {
  latitude: number;
  longitude: number;
  accuracy?: number;
  googleMapsUrl?: string;
}

export interface EmergencyAlert {
  id: string;
  alert_type: AlertType;
  status: AlertStatus;
  message: string | null;
  triggered_at: string;
  resolved_at: string | null;
  has_acknowledgments: boolean;
  acknowledgment_count: number;
  responders_count: number;
  earliest_eta_minutes: number | null;
  userName: string;
  location: Location | null;
}

export interface Contact {
  id: string;
  name: string;
}

export interface ExistingAcknowledgment {
  id: string;
  sos_alert_id: string;
  contact_id: string;
  acknowledgment_type: AcknowledgmentType;
  message: string | null;
  eta_minutes: number | null;
  responded_at: string;
  latitude: number | null;
  longitude: number | null;
}

export interface ChatMessage {
  id: string;
  sender_type: SenderType;
  message_type: MessageType;
  content: string;
  latitude: number | null;
  longitude: number | null;
  created_at: string;
}

export interface StatusTemplate {
  id: string;
  code: string;
  display_text: string;
  icon: string;
  category: string;
  sort_order: number;
  is_active: boolean;
}

// API Response Types
export interface AlertInfoResponse {
  alert: EmergencyAlert;
  contact: Contact;
  existingAcknowledgment: ExistingAcknowledgment | null;
  messages: ChatMessage[];
  statusTemplates: StatusTemplate[];
}

export interface AcknowledgeResponse {
  acknowledgmentId: string;
  acknowledgmentType: AcknowledgmentType;
  sosAlertId: string;
  userName: string;
  message: string;
}

export interface SendMessageResponse {
  messageId: string;
  sosAlertId: string;
  sentAt: string;
}

export interface StatusUpdateResponse {
  statusCode: string;
  statusText: string;
  sosAlertId: string;
}

// API Request Types
export interface AcknowledgeRequest {
  token: string;
  acknowledgmentType: AcknowledgmentType;
  message?: string;
  etaMinutes?: number;
  latitude?: number;
  longitude?: number;
}

export interface SendMessageRequest {
  token: string;
  messageType: MessageType;
  content: string;
  latitude?: number;
  longitude?: number;
}

export interface StatusUpdateRequest {
  token: string;
  statusCode: string;
}

// API Wrapper Response
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    message: string;
  };
}

// App State Types
export interface EmergencyState {
  loading: boolean;
  error: string | null;
  alert: EmergencyAlert | null;
  contact: Contact | null;
  existingAcknowledgment: ExistingAcknowledgment | null;
  messages: ChatMessage[];
  statusTemplates: StatusTemplate[];
}
