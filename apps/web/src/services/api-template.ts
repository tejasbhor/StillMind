/**
 * STILL MIND — API CLIENT TEMPLATE
 * Following the API Contract (v1.0)
 * This structure is designed for easy integration with the FastAPI backend.
 */

export interface ApiResponse<T> {
  success: true;
  message?: string;
  data: T;
  meta: {
    request_id: string;
    timestamp: string;
  };
}

export interface ApiError {
  success: false;
  error: {
    code: string;
    message: string;
    details?: Array<{
      field: string;
      issue: string;
    }>;
  };
  meta: {
    request_id: string;
    timestamp: string;
  };
}

// ── Roles ────────────────────────────────────────────────────────────────────
export type UserRole = "student" | "counselor" | "admin";

export interface User {
  user_id: string;
  role: UserRole;
  full_name: string;
  email: string;
}

// ── Auth ─────────────────────────────────────────────────────────────────────
export interface LoginResponse {
  access_token: string;
  refresh_token: string;
  token_type: "Bearer";
  expires_in: number;
  user: User;
}

// ── Notifications ────────────────────────────────────────────────────────────
export interface Notification {
  notification_id: string;
  recipient_user_id: string;
  channel: "EMAIL" | "IN_APP";
  template_code: string;
  payload: Record<string, any>;
  is_read: boolean;
  created_at: string;
}

// ── Chat ──────────────────────────────────────────────────────────────────────
export interface ChatConversation {
  conversation_id: string;
  participants: User[];
  last_message?: {
    text: string;
    timestamp: string;
  };
  context: "CASE_ASSIGNMENT" | "SYSTEM_ALERT";
}

export interface ChatMessage {
  message_id: string;
  sender_id: string;
  text: string;
  timestamp: string;
}

// ── Mock Helper ──────────────────────────────────────────────────────────────
export const mockResponse = <T>(data: T, message?: string): ApiResponse<T> => ({
  success: true,
  message,
  data,
  meta: {
    request_id: crypto.randomUUID(),
    timestamp: new Date().toISOString(),
  },
});

