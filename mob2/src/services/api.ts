import axios from 'axios';

// In dev: uses localhost:3009
// In production (Vercel): set VITE_API_URL=https://safenest-api-XXXX-uc.a.run.app
const BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:3009';

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for adding the auth token
api.interceptors.request.use(
  async (config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export const ApiService = {
  // Token management
  getToken: () => localStorage.getItem('auth_token'),
  saveToken: (token: string) => localStorage.setItem('auth_token', token),
  saveUser: (user: any) => localStorage.setItem('user_data', JSON.stringify(user)),
  getUser: () => {
    const raw = localStorage.getItem('user_data');
    return raw ? JSON.parse(raw) : null;
  },
  logout: () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_data');
  },

  // Auth
  sendOtp: (phoneNumber: string) => api.post('/api/auth/send-otp', { phoneNumber }),
  verifyOtp: (phoneNumber: string, otp: string) => api.post('/api/auth/verify-otp', { phoneNumber, otp }),

  // Helpers
  getHelpers: (search?: string) => api.get(`/api/helpers${search ? `?search=${search}` : ''}`),
  getHelperProfile: (id: string) => api.get(`/api/helpers/${id}`),

  // Visitors
  getInSociety: () => api.get('/api/visitors/in-society'),
  logEntry: (data: {
    visitorPhone: string;
    destinationFlat: string;
    verificationMethod: string;
    qrCodeValue?: string;
  }) => api.post('/api/visitors/log-entry', data),
  logExit: (logId: number) => api.patch(`/api/visitors/log-exit/${logId}`, {}),
  preApprove: (data: {
    visitorName: string;
    visitorPhone: string;
    validFrom: string;
    validUntil: string;
  }) => api.post('/api/visitors/pre-approve', data),
  getPreApprovals: () => api.get('/api/visitors/pre-approvals'),
  deletePreApproval: (id: number) => api.delete(`/api/visitors/pre-approvals/${id}`),
  verifyQr: (qrCodeValue: string) => api.post('/api/visitors/verify-qr', { qrCodeValue }),

  // Admin
  getAdminOverview: () => api.get('/api/admin/overview'),
  getPendingUsers: () => api.get('/api/admin/pending-users'),
  approveUser: (id: number) => api.patch(`/api/admin/users/${id}/approve`, {}),
  banUser: (id: number) => api.patch(`/api/admin/users/${id}/ban`, {}),
  getAdminHelpers: () => api.get('/api/admin/helpers'),
  revokeCard: (id: number) => api.patch(`/api/admin/helpers/${id}/revoke-card`, {}),
  getAdminAlerts: () => api.get('/api/admin/alerts'),

  // Alerts
  fileAlert: (data: {
    description: string;
    severity: string;
    targetUserId?: number;
  }) => api.post('/api/alerts', data),
};

export default api;
