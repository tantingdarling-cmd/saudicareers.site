const API_BASE = import.meta.env.VITE_API_URL || 'https://saudicareers.site/api';

const getToken = () => localStorage.getItem('auth_token');
const setToken = (token) => localStorage.setItem('auth_token', token);
const removeToken = () => localStorage.removeItem('auth_token');

class ApiService {
  async request(endpoint, options = {}) {
    const url = `${API_BASE}${endpoint}`;
    const token = getToken();
    
    const config = {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    };

    if (config.body && typeof config.body === 'object' && !(config.body instanceof FormData)) {
      config.body = JSON.stringify(config.body);
    } else if (config.body instanceof FormData) {
      delete config.headers['Content-Type'];
    }

    try {
      const response = await fetch(url, config);
      const data = await response.json();
      
      if (!response.ok) {
        if (response.status === 401) {
          removeToken();
          window.location.href = '/admin';
        }
        throw new Error(data.message || data.error || 'حدث خطأ غير متوقع');
      }
      
      return data;
    } catch (error) {
      if (error.name === 'TypeError') {
        throw new Error('فشل الاتصال بالخادم');
      }
      throw error;
    }
  }

  get(endpoint, params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const url = queryString ? `${endpoint}?${queryString}` : endpoint;
    return this.request(url);
  }

  post(endpoint, data) {
    return this.request(endpoint, { method: 'POST', body: data instanceof FormData ? data : data });
  }

  put(endpoint, data) {
    return this.request(endpoint, { method: 'PUT', body: data });
  }

  patch(endpoint, data) {
    return this.request(endpoint, { method: 'PATCH', body: data });
  }

  delete(endpoint) {
    return this.request(endpoint, { method: 'DELETE' });
  }
}

export const api = new ApiService();

export const authApi = {
  login: async (email, password, deviceName = 'admin') => {
    const data = await api.post('/v1/login', { email, password, device_name: deviceName });
    setToken(data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    return data;
  },
  logout: () => {
    return api.post('/logout').finally(() => {
      removeToken();
      localStorage.removeItem('user');
    });
  },
  getUser: () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },
  isAuthenticated: () => !!getToken(),
};

export const jobsApi = {
  getAll: (params = {}) => api.get('/v1/jobs', params),
  getFeatured: () => api.get('/v1/jobs/featured'),
  getById: (id) => api.get(`/v1/jobs/${id}`),
  create: (data) => api.post('/admin/jobs', data),
  update: (id, data) => api.patch(`/admin/jobs/${id}`, data),
  delete: (id) => api.delete(`/admin/jobs/${id}`),
};

export const applicationsApi = {
  submit: (data) => api.post('/v1/applications', data),
  track: (token) => api.get(`/v1/track/${token}`),
  my: () => api.get('/v1/applications/my'),
  nativeApply: (jobId, data) => api.post(`/v1/jobs/${jobId}/apply`, data),
  getAll: (params = {}) => api.get('/admin/applications', params),
  updateStatus: (id, status, notes = '') => api.patch(`/admin/applications/${id}/status`, { status, notes }),
};

export const tipsApi = {
  getAll: (params = {}) => api.get('/v1/tips', params),
  getBySlug: (slug) => api.get(`/v1/tips/${slug}`),
};

export const subscribersApi = {
  subscribe: (data) => api.post('/v1/subscribe', data),
  getAll: () => api.get('/admin/subscribers'),
};

export const settingsApi = {
  getAll:  ()           => api.get('/admin/settings'),
  update:  (key, value) => api.patch(`/admin/settings/${encodeURIComponent(key)}`, { value }),
};

export const employerApi = {
  getJobs:                ()              => api.get('/v1/employer/jobs'),
  createJob:              (data)          => api.post('/v1/employer/jobs', data),
  updateJob:              (id, data)      => api.put(`/v1/employer/jobs/${id}`, data),
  deleteJob:              (id)            => api.delete(`/v1/employer/jobs/${id}`),
  getApplications:        (jobId, params) => api.get(`/v1/employer/jobs/${jobId}/applications`, params),
  updateApplicationStatus:(id, status, notes = '') => api.patch(`/v1/employer/applications/${id}/status`, { status, notes }),
};

export const salaryApi = {
  getStats: (params = {}) => api.get('/v1/jobs/salary-stats', params),
};

export const companyApi = {
  getBySlug: (slug) => api.get(`/v1/companies/${slug}`),
};

export const alertsApi = {
  getAll:  ()     => api.get('/v1/alerts'),
  create:  (data) => api.post('/v1/alerts', data),
  delete:  (id)   => api.delete(`/v1/alerts/${id}`),
  toggle:  (id)   => api.patch(`/v1/alerts/${id}/toggle`, {}),
};

export const savedJobsApi = {
  getAll:  ()      => api.get('/v1/saved-jobs'),
  save:    (jobId) => api.post(`/v1/saved-jobs/${jobId}`, {}),
  unsave:  (jobId) => api.delete(`/v1/saved-jobs/${jobId}`),
};

export const probationApi = {
  getAll:  (params = {}) => api.get('/admin/probation', params),
  getStatus: (id) => api.get(`/admin/probation/${id}/status`),
  create:  (data) => api.post('/admin/probation', data),
  extend:  (id, formData) => api.post(`/admin/probation/${id}/extend`, formData),
};
