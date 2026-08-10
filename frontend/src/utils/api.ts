const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

interface FetchOptions extends RequestInit {
  body?: any;
}

export async function apiRequest<T = any>(endpoint: string, options: FetchOptions = {}): Promise<T> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('smarthire_token') : null;
  
  const headers: Record<string, string> = {
    ...((options.headers as Record<string, string>) || {}),
  };

  // Automatically parse body if it is not FormData (which Multer uses)
  if (options.body && !(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
    options.body = JSON.stringify(options.body);
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const text = await response.text();
  let data: any;

  try {
    data = text ? JSON.parse(text) : {};
  } catch (err) {
    data = { error: text || 'Failed to parse JSON response' };
  }

  if (!response.ok) {
    // If token is invalid or expired, log out automatically
    if (response.status === 401 || response.status === 403) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('smarthire_token');
        localStorage.removeItem('smarthire_user');
        if (!window.location.pathname.startsWith('/login') && !window.location.pathname.startsWith('/register')) {
          window.location.href = '/login?expired=true';
        }
      }
    }
    throw new Error(data.error || `HTTP error! status: ${response.status}`);
  }

  return data as T;
}

export const authApi = {
  login: (credentials: any) => apiRequest('/auth/login', { method: 'POST', body: credentials }),
  register: (userDetails: any) => apiRequest('/auth/register', { method: 'POST', body: userDetails }),
  getMe: () => apiRequest('/auth/me', { method: 'GET' }),
};

export const jobApi = {
  create: (jobData: any) => apiRequest('/jobs', { method: 'POST', body: jobData }),
  getAll: () => apiRequest('/jobs', { method: 'GET' }),
  getById: (id: string) => apiRequest(`/${id.startsWith('jobs/') ? id : `jobs/${id}`}`, { method: 'GET' }),
  update: (id: string, jobData: any) => apiRequest(`/jobs/${id}`, { method: 'PUT', body: jobData }),
  delete: (id: string) => apiRequest(`/jobs/${id}`, { method: 'DELETE' }),
};

export const resumeApi = {
  upload: (formData: FormData) => apiRequest('/resume/upload', { method: 'POST', body: formData }),
};

export const scoreApi = {
  evaluate: (candidateId: string, jobId: string) => apiRequest('/score/candidate', {
    method: 'POST',
    body: { candidateId, jobId }
  }),
};

export const candidateApi = {
  getAll: () => apiRequest('/candidates', { method: 'GET' }),
  getById: (id: string) => apiRequest(`/candidates/${id}`, { method: 'GET' }),
  delete: (id: string) => apiRequest(`/candidates/${id}`, { method: 'DELETE' }),
};

export const analyticsApi = {
  getMetrics: () => apiRequest('/analytics', { method: 'GET' }),
};
