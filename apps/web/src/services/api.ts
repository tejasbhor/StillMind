/**
 * StillMind — Typed API Client with automatic token refresh
 * Wraps all calls to the FastAPI backend through the Caddy proxy.
 */

const BASE = process.env.NEXT_PUBLIC_API_URL ?? "/api/v1";

// ── Token helpers (localStorage) ──────────────────────────────────────────────

export const tokenStore = {
  getAccess: () => (typeof window !== "undefined" ? localStorage.getItem("sm_token") : null),
  getRefresh: () => (typeof window !== "undefined" ? localStorage.getItem("sm_refresh_token") : null),
  setAccess: (t: string) => localStorage.setItem("sm_token", t),
  setRefresh: (t: string) => localStorage.setItem("sm_refresh_token", t),
  setTokens: (access: string, refresh: string) => {
    localStorage.setItem("sm_token", access);
    localStorage.setItem("sm_refresh_token", refresh);
  },
  clear: () => {
    localStorage.removeItem("sm_token");
    localStorage.removeItem("sm_refresh_token");
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
  const refreshToken = tokenStore.getRefresh();
  if (!refreshToken) return null;

  try {
    const res = await fetch(`${BASE}/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh_token: refreshToken }),
    });
    if (!res.ok) throw new Error("Refresh failed");
    const json = await res.json();
    const newAccess = json.data?.access_token;
    const newRefresh = json.data?.refresh_token;
    if (newAccess) {
      tokenStore.setAccess(newAccess);
      if (newRefresh) tokenStore.setRefresh(newRefresh);
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

  const res = await fetch(`${BASE}${path}`, { ...options, headers });
  const json = await res.json();

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
    throw new Error(json?.error?.message ?? json?.detail ?? "Request failed");
  }
  return json;
}

export const api = {
  get: <T>(path: string, options?: RequestInit) => apiFetch<T>(path, { ...options, method: "GET" }),
  post: <T>(path: string, body?: any, options?: RequestInit) => 
    apiFetch<T>(path, { ...options, method: "POST", body: body ? JSON.stringify(body) : undefined }),
  put: <T>(path: string, body?: any, options?: RequestInit) =>
    apiFetch<T>(path, { ...options, method: "PUT", body: body ? JSON.stringify(body) : undefined }),
  delete: <T>(path: string, options?: RequestInit) => apiFetch<T>(path, { ...options, method: "DELETE" }),
};

// ── Auth ──────────────────────────────────────────────────────────────────────

export interface LoginPayload { email: string; password: string }
export interface AuthUser  { id: string; email: string; role: "student" | "counselor" | "admin" }
export interface LoginResult {
  access_token: string;
  refresh_token: string;
  token_type: string;
  user: AuthUser;
}

export const authApi = {
  login: async (payload: LoginPayload): Promise<LoginResult> => {
    const res = await apiFetch<{ data: LoginResult }>("/auth/login", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    // Store both tokens
    if (res.data.access_token && res.data.refresh_token) {
      tokenStore.setTokens(res.data.access_token, res.data.refresh_token);
    }
    return res.data;
  },

  refresh: async (): Promise<string | null> => {
    return doRefreshToken();
  },

  me: async (): Promise<AuthUser> => {
    const res = await apiFetch<{ data: AuthUser }>("/auth/me");
    return res.data;
  },

  logout: () => {
    tokenStore.clear();
  },
};

// ── Student ───────────────────────────────────────────────────────────────────

export const studentApi = {
  // Profile
  getProfile: () => apiFetch<{ data: any }>("/students/me/profile"),
  updateProfile: (data: { full_name?: string | null; phone?: string | null; guardian_contact?: any; version?: number | null }) => 
    apiFetch<{ data: any }>("/students/me/profile", { method: "PATCH", body: JSON.stringify(data) }),
  
  // Consents
  getConsents: () => apiFetch<{ data: any }>("/students/me/consents"),
  submitConsents: (data: any) => apiFetch<{ data: any }>("/students/me/consents", { method: "PUT", body: JSON.stringify(data) }),
  
  // Risk
  getRiskSummary: () => apiFetch<{ data: { level: string; score: number; trend: string } }>("/students/me/risk-summary"),
  
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
  getPriorityQueue: () => apiFetch<{ data: any[] }>("/counselors/me/priority-queue"),
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
  counselor_id: string;
  full_name: string;
  email: string;
  max_slots_day: number;
  is_active: boolean;
  assigned_students: number;
}

export interface AdminStudent {
  student_id: string;
  full_name: string;
  college_id: string;
  profile_status: string;
  last_activity: string | null;
  assigned_counselor: string | null;
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
  createCounselor: (data: { email: string; full_name: string; password?: string; max_slots_day?: number }) => 
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
  
  // Student Management - PRD §9.1 (Limited view)
  getStudents: (limit = 20, offset = 0, status?: string) => 
    apiFetch<any>(`/admin/students?limit=${limit}&offset=${offset}${status ? `&status=${status}` : ''}`),
  getStudent: (studentId: string) => apiFetch<any>(`/admin/students/${studentId}`),
  
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

// ── Chat ──────────────────────────────────────────────────────────────────────

export interface ChatConversation {
  allocation_id: string;
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
  createConversation: () =>
    apiFetch<any>("/chat/conversations", { method: "POST" }),
  getHistory: (allocationId: string, limit = 50, offset = 0) =>
    apiFetch<{ data: ChatMessageItem[] }>(
      `/chat/rooms/${allocationId}/messages?limit=${limit}&offset=${offset}`
    ),
};

