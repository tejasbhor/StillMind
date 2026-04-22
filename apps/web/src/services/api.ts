/**
 * StillMind — Typed API Client with automatic token refresh
 * Wraps all calls to the FastAPI backend through the Caddy proxy.
 */

const BASE = process.env.NEXT_PUBLIC_API_URL ?? "/api/v1";

export interface ApiEnvelope<T> {
  data: T;
  message?: string;
  meta?: {
    request_id?: string;
    timestamp?: string;
  };
}

// ── Token helpers (sessionStorage + httpOnly refresh cookie) ──────────────────

export const tokenStore = {
  getAccess: () => (typeof window !== "undefined" ? sessionStorage.getItem("sm_token") : null),
  setAccess: (t: string) => {
    if (typeof window !== "undefined") sessionStorage.setItem("sm_token", t);
  },
  setTokens: (access: string) => {
    if (typeof window === "undefined") return;
    sessionStorage.setItem("sm_token", access);
  },
  clear: () => {
    if (typeof window === "undefined") return;
    sessionStorage.removeItem("sm_token");
    localStorage.removeItem("sm_user");
  },
};

// ── Refresh token handling ────────────────────────────────────────────────────

let isRefreshing = false;
let refreshSubscribers: ((token: string) => void)[] = [];

function subscribeToRefresh(callback: (token: string) => void) {
  refreshSubscribers.push(callback);
}

function onRefreshed(token: string) {
  refreshSubscribers.forEach((cb) => cb(token));
  refreshSubscribers = [];
}

async function doRefreshToken(): Promise<string | null> {
  try {
    const res = await fetch(`${BASE}/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({}),
    });
    if (!res.ok) throw new Error("Refresh failed");
    const json = await res.json();
    const newAccess = json.data?.access_token;
    if (newAccess) {
      tokenStore.setAccess(newAccess);
    }
    return newAccess;
  } catch {
    tokenStore.clear();
    return null;
  }
}

// ── Core fetch wrapper with automatic retry on 401 ───────────────────────────

async function apiFetch<T>(
  path: string,
  options: RequestInit = {},
  retry = true
): Promise<T> {
  const token = tokenStore.getAccess();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers as Record<string, string>),
  };

  const requestInit: RequestInit = {
    ...options,
    headers,
    credentials: options.credentials ?? "include",
  };
  const res = await fetch(`${BASE}${path}`, requestInit);
  const text = await res.text();
  let json: unknown = null;
  if (text) {
    try {
      json = JSON.parse(text);
    } catch {
      json = null;
    }
  }

  // Handle 401 Unauthorized with automatic token refresh
  if (res.status === 401 && retry) {
    if (!isRefreshing) {
      isRefreshing = true;
      const newToken = await doRefreshToken();
      isRefreshing = false;
      if (newToken) {
        onRefreshed(newToken);
        // Retry original request with new token
        return apiFetch(path, options, false);
      } else {
        // Refresh failed, clear auth and throw
        tokenStore.clear();
        window.location.href = "/login?expired=1";
        throw new Error("Session expired. Please log in again.");
      }
    } else {
      // Wait for refresh to complete then retry
      return new Promise((resolve, reject) => {
        subscribeToRefresh((newToken) => {
          // Retry with new token
          apiFetch<T>(path, options, false).then(resolve).catch(reject);
        });
      });
    }
  }

  if (!res.ok) {
    const err = json as { error?: { message?: string }; detail?: string } | null;
    throw new Error(err?.error?.message ?? err?.detail ?? "Request failed");
  }
  return json as T;
}

export const api = {
  get: <T>(path: string, options?: RequestInit) => apiFetch<T>(path, { ...options, method: "GET" }),
  post: <T>(path: string, body?: unknown, options?: RequestInit) =>
    apiFetch<T>(path, { ...options, method: "POST", body: body ? JSON.stringify(body) : undefined }),
  put: <T>(path: string, body?: unknown, options?: RequestInit) =>
    apiFetch<T>(path, { ...options, method: "PUT", body: body ? JSON.stringify(body) : undefined }),
  delete: <T>(path: string, options?: RequestInit) => apiFetch<T>(path, { ...options, method: "DELETE" }),
};

// ── Auth ──────────────────────────────────────────────────────────────────────

export interface LoginPayload { email: string; password: string }
export interface AuthUser  { 
  id: string; 
  email: string; 
  full_name?: string | null;
  avatar_url?: string | null;
  role: "student" | "counselor" | "admin" 
}
export interface StudentRegisterPayload {
  email: string;
  password: string;
  full_name: string;
  college_id?: string;
  phone?: string;
}

export interface StudentRegisterResult {
  user_id: string;
  role: "student";
  profile_status: string;
}
export interface StudentProfile {
  full_name: string | null;
  phone: string | null;
  guardian_contact?: unknown;
  version?: number | null;
  notification_preferences?: {
    email_enabled: boolean;
    push_enabled: boolean;
    appointment_reminders: boolean;
    message_alerts: boolean;
    weekly_check_in: boolean;
  };
}

export interface StudentRiskSummary {
  level: string;
  score: number;
  trend: string;
}

export interface LoginResult {
  requires_2fa?: boolean;
  message?: string;
  email?: string;
  access_token?: string;
  token_type?: string;
  user?: AuthUser;
}

export const authApi = {
  initiateStudentRegistration: async (
    payload: StudentRegisterPayload
  ): Promise<{ email: string; message: string; expires_in_minutes: number }> => {
    const res = await apiFetch<ApiEnvelope<{ email: string; message: string; expires_in_minutes: number }>>(
      "/auth/register/student/initiate",
      {
        method: "POST",
        body: JSON.stringify(payload),
      }
    );
    return res.data;
  },

  verifyStudentRegistration: async (
    email: string,
    code: string
  ): Promise<StudentRegisterResult> => {
    const res = await apiFetch<ApiEnvelope<StudentRegisterResult>>(
      "/auth/register/student/verify",
      {
        method: "POST",
        body: JSON.stringify({ email, code }),
      }
    );
    return res.data;
  },

  registerStudent: async (
    payload: StudentRegisterPayload
  ): Promise<StudentRegisterResult> => {
    const res = await apiFetch<ApiEnvelope<StudentRegisterResult>>(
      "/auth/register/student",
      {
        method: "POST",
        body: JSON.stringify(payload),
      }
    );
    return res.data;
  },

  login: async (payload: LoginPayload): Promise<LoginResult> => {
    const res = await apiFetch<ApiEnvelope<LoginResult>>("/auth/login", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    // Store access token if returned (bypass 2FA or Google)
    if (res.data.access_token) {
      tokenStore.setTokens(res.data.access_token);
    }
    return res.data;
  },

  verifyLogin: async (email: string, code: string): Promise<LoginResult> => {
    const res = await apiFetch<ApiEnvelope<LoginResult>>("/auth/login/verify", {
      method: "POST",
      body: JSON.stringify({ email, code }),
    });
    if (res.data.access_token) {
      tokenStore.setTokens(res.data.access_token);
    }
    return res.data;
  },

  refresh: async (): Promise<string | null> => {
    return doRefreshToken();
  },

  me: async (): Promise<AuthUser> => {
    const res = await apiFetch<ApiEnvelope<AuthUser>>("/auth/me");
    return res.data;
  },

  logout: async () => {
    try {
      await apiFetch<{ data?: unknown }>("/auth/logout", { method: "POST" }, false);
    } catch {
      // Best-effort cookie cleanup server-side; always clear local state.
    }
    tokenStore.clear();
  },

  forgotPassword: async (email: string): Promise<{ sent: boolean; message: string }> => {
    const res = await apiFetch<ApiEnvelope<{ sent: boolean; message: string }>>(
      "/auth/forgot-password",
      {
        method: "POST",
        body: JSON.stringify({ email }),
      }
    );
    return res.data;
  },

  resetPassword: async (token: string, new_password: string): Promise<{ reset: boolean; message: string }> => {
    const res = await apiFetch<ApiEnvelope<{ reset: boolean; message: string }>>(
      "/auth/reset-password",
      {
        method: "POST",
        body: JSON.stringify({ token, new_password }),
      }
    );
    return res.data;
  },
};

// ── Student ───────────────────────────────────────────────────────────────────

export const studentApi = {
  // Profile
  getProfile: () => apiFetch<ApiEnvelope<StudentProfile>>("/students/me/profile"),
  updateProfile: (data: {
    full_name?: string | null;
    phone?: string | null;
    guardian_contact?: unknown;
    version?: number | null;
    notification_preferences?: StudentProfile["notification_preferences"];
  }) =>
    apiFetch<ApiEnvelope<StudentProfile>>("/students/me/profile", { method: "PATCH", body: JSON.stringify(data) }),
  
  // Consents
  getConsents: () => apiFetch<{ data: any }>("/students/me/consents"),
  submitConsents: (data: any) => apiFetch<{ data: any }>("/students/me/consents", { method: "PUT", body: JSON.stringify(data) }),
  
  // Risk
  getRiskSummary: () => apiFetch<ApiEnvelope<StudentRiskSummary>>("/students/me/risk-summary"),
  
  // Assessments
  getAssessments: (limit = 20, offset = 0) => apiFetch<{ data: any[] }>(`/students/me/assessments?limit=${limit}&offset=${offset}`),
  submitAssessment: (data: any) => apiFetch<{ data: any }>("/students/me/assessments", { method: "POST", body: JSON.stringify(data) }),
  
  // Sessions
  getSessions: (limit = 20, offset = 0) => apiFetch<{ data: any[] }>(`/students/me/sessions?limit=${limit}&offset=${offset}`),
  getSessionSummaries: (limit = 20, offset = 0) => apiFetch<{ data: any[] }>(`/students/me/session-summaries?limit=${limit}&offset=${offset}`),
  
  // Allocation
  getAllocation: () => apiFetch<{ data: any }>("/students/me/allocation"),
  confirmAllocation: (idempotency_key: string) => 
    apiFetch<{ data: any }>("/students/me/allocation/confirm", { method: "POST", body: JSON.stringify({ idempotency_key }) }),
  declineAllocation: (idempotency_key: string, reason?: string) => 
    apiFetch<{ data: any }>("/students/me/allocation/decline", { method: "POST", body: JSON.stringify({ idempotency_key, reason }) }),
  rescheduleAllocation: (idempotency_key: string) => 
    apiFetch<{ data: any }>("/students/me/allocation/reschedule", { method: "POST", body: JSON.stringify({ idempotency_key }) }),
};

// ── Counselor ─────────────────────────────────────────────────────────────────

export const counselorApi = {
  // Dashboard
  getDashboard: () => apiFetch<{ data: any }>("/counselors/me/dashboard"),
  getCapacity: () => apiFetch<{ data: any }>("/counselors/me/capacity"),
  
  // Priority Queue
  getPriorityQueue: () => apiFetch<{ data: any[] }>("/counselors/me/dashboard/priority-queue"),
  getWaitlist: () => apiFetch<{ data: any[] }>("/counselors/me/waitlist"),
  
  // Sessions
  getSessions: (date?: string, limit = 20, offset = 0) => 
    apiFetch<{ data: any[] }>(`/counselors/me/sessions?${date ? `date=${date}&` : ''}limit=${limit}&offset=${offset}`),
  
  // Student Case View - PRD §8.2
  getStudent: (studentId: string) => apiFetch<{ data: any }>(`/counselors/me/students/${studentId}`),
  getStudentRisk: (studentId: string) => apiFetch<{ data: any }>(`/counselors/me/students/${studentId}/risk`),
  getStudentTimeline: (studentId: string, limit = 50, offset = 0) => 
    apiFetch<{ data: any[] }>(`/counselors/me/students/${studentId}/timeline?limit=${limit}&offset=${offset}`),
  getStudentAssessments: (studentId: string, limit = 20, offset = 0) => 
    apiFetch<{ data: any[] }>(`/counselors/me/students/${studentId}/assessments?limit=${limit}&offset=${offset}`),
  
  updateCapacity: (data: { is_active?: boolean; max_active_cases?: number }) =>
    apiFetch<{ data: any }>("/counselors/me/capacity", { method: "PATCH", body: JSON.stringify(data) }),

  // Session Actions
  markNoShow: (sessionId: string) =>
    apiFetch<{ data: any }>(`/counselors/sessions/${sessionId}/mark-no-show`, { method: "POST" }),
  logSessionNote: (sessionId: string, data: any) =>
    apiFetch<{ data: any }>(`/counselors/sessions/${sessionId}/notes`, { method: "POST", body: JSON.stringify(data) }),
  logOutcome: (sessionId: string, data: any) =>
    apiFetch<{ data: any }>(`/counselors/sessions/${sessionId}/outcome`, { method: "POST", body: JSON.stringify(data) }),
  logOverride: (allocationId: string, data: any) =>
    apiFetch<{ data: any }>(`/counselors/sessions/${allocationId}/override`, { method: "POST", body: JSON.stringify(data) }),
};


// ── Admin ─────────────────────────────────────────────────────────────────────

export interface AdminDashboard {
  total_students: number;
  active_users: number;
  total_counselors: number;
  risk_distribution: { green: number; yellow: number; red: number };
  resource_metrics: { slots_available: number; slots_used: number; average_wait_time_minutes: number; backlog_unassigned_students: number };
  engagement_metrics: { assessment_completion_rate: number; no_show_rate: number; drop_off_rate: number };
}

export interface AdminCounselor {
  id?: string;
  counselor_id: string;
  full_name: string;
  email: string;
  max_slots_day: number;
  max_active_cases?: number;
  is_active: boolean;
  assigned_students: number;
  specialties?: string[];
}

export interface AdminStudent {
  student_id: string;
  full_name: string;
  college_id: string;
  profile_status: string;
  last_activity: string | null;
  assigned_counselor: string | null;
  allocation_id: string | null;
}

export interface SystemAlert {
  type: string;
  label: string;
  detail: string;
  action: string;
}

export const adminApi = {
  // Dashboard - PRD §9.3
  getDashboard: () => apiFetch<any>("/admin/dashboard"),
  
  // Counselor Management - PRD §9.1
  getCounselors: (limit = 20, offset = 0, is_active?: boolean, search?: string) => 
    apiFetch<any>(`/admin/counselors?limit=${limit}&offset=${offset}${is_active !== undefined ? `&is_active=${is_active}` : ''}${search ? `&search=${search}` : ''}`),
  getCounselor: (counselorId: string) => apiFetch<any>(`/admin/counselors/${counselorId}`),
  createCounselor: (data: { email: string; full_name: string; password?: string; max_slots_day?: number; specialties?: string[] }) => 
    apiFetch<any>("/admin/counselors", { method: "POST", body: JSON.stringify(data) }),
  activateCounselor: (counselorId: string) => 
    apiFetch<any>(`/admin/counselors/${counselorId}/status?is_active=true`, { method: "PATCH" }),
  deactivateCounselor: (counselorId: string, reason?: string) => 
    apiFetch<any>(`/admin/counselors/${counselorId}/status?is_active=false${reason ? `&reason=${reason}` : ''}`, { method: "PATCH" }),
  updateCounselorStatus: (counselorId: string, is_active: boolean) => 
    apiFetch<any>(`/admin/counselors/${counselorId}/status?is_active=${is_active}`, { method: "PATCH" }),
  updateCounselorCapacity: (counselorId: string, max_slots_day: number) => 
    apiFetch<any>(`/admin/counselors/${counselorId}/capacity`, { method: "PATCH", body: JSON.stringify({ max_slots_day }) }),
  deleteCounselor: (counselorId: string) => 
    apiFetch<any>(`/admin/counselors/${counselorId}`, { method: "DELETE" }),
  reassignCounselor: (data: { from_counselor_id: string; to_counselor_id: string; reason?: string }) => 
    apiFetch<any>("/admin/counselors/reassign", { method: "POST", body: JSON.stringify(data) }),
  reassignAllocation: (data: { allocation_id: string; to_counselor_id: string; reason?: string }) =>
    apiFetch<any>("/admin/allocations/reassign", { method: "POST", body: JSON.stringify(data) }),
  
  // Student Management - PRD §9.1 (Limited view)
  getStudents: (limit = 20, offset = 0, status?: string) => 
    apiFetch<any>(`/admin/students?limit=${limit}&offset=${offset}${status ? `&status=${status}` : ''}`),
  getStudent: (studentId: string) => apiFetch<any>(`/admin/students/${studentId}`),
  
  getOrganization: () => apiFetch<any>("/admin/organization"),
  updateOrganization: (data: {
    name?: string;
    contact_email?: string;
    domain_whitelist?: string[];
    settings?: Record<string, unknown>;
  }) =>
    apiFetch<any>("/admin/organization", { method: "PATCH", body: JSON.stringify(data) }),

  // Configuration - PRD §9.2 & §9.6
  getResourcePolicies: () => apiFetch<any>("/admin/config/resource-policies"),
  updateResourcePolicies: (data: any) => 
    apiFetch<any>("/admin/config/resource-policies", { method: "PUT", body: JSON.stringify(data) }),
  getRiskThresholds: () => apiFetch<any>("/admin/config/risk-thresholds"),
  updateRiskThresholds: (data: any) => 
    apiFetch<any>("/admin/config/risk-thresholds", { method: "PUT", body: JSON.stringify(data) }),
  getAllocationWeights: () => apiFetch<any>("/admin/config/allocation-weights"),
  updateAllocationWeights: (data: any) => 
    apiFetch<any>("/admin/config/allocation-weights", { method: "PUT", body: JSON.stringify(data) }),
  getSystemSettings: () => apiFetch<any>("/admin/config/system-settings"),
  updateSystemSettings: (data: any) =>
    apiFetch<any>("/admin/config/system-settings", { method: "PUT", body: JSON.stringify(data) }),

  // Analytics - PRD §9.3
  getRiskDistribution: () => apiFetch<any>("/admin/analytics/risk-distribution"),
  getResourceUtilization: () => apiFetch<any>("/admin/analytics/resource-utilization"),
  getEngagementMetrics: () => apiFetch<any>("/admin/analytics/engagement"),
  
  // Alerts - PRD §9.7
  getAlerts: () => apiFetch<any>("/admin/alerts"),
  
  // System Health - PRD §9.8
  getSystemHealth: () => apiFetch<any>("/admin/system-health"),
  
  // Allocation Transparency - PRD §9.4
  getAllocations: (limit = 20, offset = 0) => 
    apiFetch<any>(`/admin/allocations?limit=${limit}&offset=${offset}`),
  
  // Audit Logs - PRD §9.5
  getAuditLogs: (limit = 50, offset = 0) => 
    apiFetch<any>(`/admin/audit-logs?limit=${limit}&offset=${offset}`),
};

// ── Notifications ─────────────────────────────────────────────────────────────

export interface NotificationItem {
  id: string;
  channel: string;
  template_code: string;
  payload: Record<string, unknown>;
  is_read: boolean;
  status: string;
  created_at: string;
}

export const notificationsApi = {
  list: (params?: { limit?: number; offset?: number; unread_only?: boolean }) => {
    const q = new URLSearchParams();
    if (params?.limit != null) q.set("limit", String(params.limit));
    if (params?.offset != null) q.set("offset", String(params.offset));
    if (params?.unread_only) q.set("unread_only", "true");
    const suffix = q.toString() ? `?${q}` : "";
    return apiFetch<ApiEnvelope<NotificationItem[]>>(`/notifications${suffix}`);
  },
  markRead: (notificationId: string) =>
    apiFetch<ApiEnvelope<{ message?: string }>>(`/notifications/${notificationId}/read`, {
      method: "POST",
    }),
  markAllRead: () =>
    apiFetch<ApiEnvelope<{ message?: string }>>("/notifications/mark-all-read", {
      method: "POST",
    }),
};

// ── Chat ──────────────────────────────────────────────────────────────────────

export interface ChatConversation {
  conversation_id: string;
  allocation_id?: string | null;
  title?: string | null;
  kind?: "DIRECT" | "GROUP";
  participants?: Array<{ user_id: string; role: string; name: string }>;
  other_party_name: string | null;
  status: string;
  last_message: {
    content: string;
    sender_id: string;
    created_at: string;
  } | null;
}

export interface ChatMessageItem {
  id: string;
  sender_id: string;
  content: string;
  created_at: string;
}

export const chatApi = {
  getToken: () => apiFetch<any>("/chat/token"),
  getConversations: () => apiFetch<{ data: ChatConversation[] }>("/chat/conversations"),
  createConversation: (data: {
    participant_ids: string[];
    title?: string;
    allocation_id?: string;
    kind?: "DIRECT" | "GROUP";
  }) => apiFetch<any>("/chat/conversations", { method: "POST", body: JSON.stringify(data) }),
  getHistory: (conversationId: string, limit = 50, offset = 0) =>
    apiFetch<{ data: ChatMessageItem[] }>(
      `/chat/rooms/${conversationId}/messages?limit=${limit}&offset=${offset}`
    ),
};

