import apiClient from './apiClient';
import authApi from './authApi';

// Lead API endpoints
export const leadApi = {
  getAll: async (params = {}) => {
    const response = await apiClient.get('/leads', { params });
    return response.data;
  },

  create: async (data) => {
    const response = await apiClient.post('/leads', data);
    return response.data;
  },

  getById: async (id) => {
    const response = await apiClient.get(`/leads/${id}`);
    return response.data;
  },

  update: async (id, data) => {
    const response = await apiClient.patch(`/leads/${id}`, data);
    return response.data;
  },

  delete: async (id) => {
    const response = await apiClient.delete(`/leads/${id}`);
    return response.data;
  },
};

// Deal API endpoints
export const dealApi = {
  getAll: async (params = {}) => {
    const response = await apiClient.get('/deals', { params });
    return response.data;
  },

  create: async (data) => {
    const response = await apiClient.post('/deals', data);
    return response.data;
  },

  getById: async (id) => {
    const response = await apiClient.get(`/deals/${id}`);
    return response.data;
  },

  update: async (id, data) => {
    const response = await apiClient.patch(`/deals/${id}`, data);
    return response.data;
  },

  delete: async (id) => {
    const response = await apiClient.delete(`/deals/${id}`);
    return response.data;
  },

  getPipeline: async () => {
    const response = await apiClient.get('/deals/pipeline');
    return response.data;
  },
};

// Company API endpoints
export const companyApi = {
  getAll: async (params = {}) => {
    const response = await apiClient.get('/companies', { params });
    return response.data;
  },

  create: async (data) => {
    const response = await apiClient.post('/companies', data);
    return response.data;
  },

  getById: async (id) => {
    const response = await apiClient.get(`/companies/${id}`);
    return response.data;
  },

  update: async (id, data) => {
    const response = await apiClient.patch(`/companies/${id}`, data);
    return response.data;
  },

  delete: async (id) => {
    const response = await apiClient.delete(`/companies/${id}`);
    return response.data;
  },
};

// Project API endpoints
export const projectApi = {
  getAll: async (params = {}) => {
    const response = await apiClient.get('/projects', { params });
    return response.data;
  },

  create: async (data) => {
    const response = await apiClient.post('/projects', data);
    return response.data;
  },

  getById: async (id) => {
    const response = await apiClient.get(`/projects/${id}`);
    return response.data;
  },

  update: async (id, data) => {
    const response = await apiClient.patch(`/projects/${id}`, data);
    return response.data;
  },

  delete: async (id) => {
    const response = await apiClient.delete(`/projects/${id}`);
    return response.data;
  },
};

// Task API endpoints
export const taskApi = {
  getAll: async (params = {}) => {
    const response = await apiClient.get('/tasks', { params });
    return response.data;
  },

  create: async (data) => {
    const response = await apiClient.post('/tasks', data);
    return response.data;
  },

  getById: async (id) => {
    const response = await apiClient.get(`/tasks/${id}`);
    return response.data;
  },

  update: async (id, data) => {
    const response = await apiClient.patch(`/tasks/${id}`, data);
    return response.data;
  },

  delete: async (id) => {
    const response = await apiClient.delete(`/tasks/${id}`);
    return response.data;
  },
};

// Requirement API endpoints (signature feature)
export const requirementApi = {
  getAll: async (params = {}) => {
    const response = await apiClient.get('/requirements', { params });
    return response.data;
  },

  create: async (data) => {
    const response = await apiClient.post('/requirements', data);
    return response.data;
  },

  getById: async (id) => {
    const response = await apiClient.get(`/requirements/${id}`);
    return response.data;
  },

  update: async (id, data) => {
    const response = await apiClient.patch(`/requirements/${id}`, data);
    return response.data;
  },

  delete: async (id) => {
    const response = await apiClient.delete(`/requirements/${id}`);
    return response.data;
  },

  getVersions: async (id) => {
    const response = await apiClient.get(`/requirements/${id}/versions`);
    return response.data;
  },

  createVersion: async (id, data) => {
    const response = await apiClient.post(`/requirements/${id}/versions`, data);
    return response.data;
  },

  approve: async (id) => {
    const response = await apiClient.post(`/requirements/${id}/approve`, {});
    return response.data;
  },
};

// Invoice API endpoints
export const invoiceApi = {
  getAll: async (params = {}) => {
    const response = await apiClient.get('/invoices', { params });
    return response.data;
  },

  create: async (data) => {
    const response = await apiClient.post('/invoices', data);
    return response.data;
  },

  getById: async (id) => {
    const response = await apiClient.get(`/invoices/${id}`);
    return response.data;
  },

  update: async (id, data) => {
    const response = await apiClient.patch(`/invoices/${id}`, data);
    return response.data;
  },

  delete: async (id) => {
    const response = await apiClient.delete(`/invoices/${id}`);
    return response.data;
  },
};

// Ticket API endpoints
export const ticketApi = {
  getAll: async (params = {}) => {
    const response = await apiClient.get('/tickets', { params });
    return response.data;
  },

  create: async (data) => {
    const response = await apiClient.post('/tickets', data);
    return response.data;
  },

  getById: async (id) => {
    const response = await apiClient.get(`/tickets/${id}`);
    return response.data;
  },

  update: async (id, data) => {
    const response = await apiClient.patch(`/tickets/${id}`, data);
    return response.data;
  },

  delete: async (id) => {
    const response = await apiClient.delete(`/tickets/${id}`);
    return response.data;
  },
};

export const clientApi = {
  getAll: async (params = {}) => (await apiClient.get('/clients', { params })).data,
  create: async (data) => (await apiClient.post('/clients', data)).data,
  getById: async (id) => (await apiClient.get(`/clients/${id}`)).data,
  update: async (id, data) => (await apiClient.patch(`/clients/${id}`, data)).data,
  delete: async (id) => (await apiClient.delete(`/clients/${id}`)).data,
};

export const userApi = {
  getAll: async () => (await apiClient.get('/users')).data,
  create: async (data) => (await apiClient.post('/users', data)).data,
  update: async (id, data) => (await apiClient.patch(`/users/${id}`, data)).data,
  delete: async (id) => (await apiClient.delete(`/users/${id}`)).data,
};

// Document API endpoints (upload, list, download)
export const documentApi = {
  getAll: async (params = {}) => (await apiClient.get('/documents', { params })).data,
  upload: async (file, relatedType, relatedId) => {
    const form = new FormData();
    form.append('file', file);
    if (relatedType) form.append('relatedType', relatedType);
    if (relatedId) form.append('relatedId', relatedId);
    const response = await apiClient.post('/documents', form);
    return response.data;
  },
  getDownloadUrl: (id) => `${apiClient.defaults.baseURL}/documents/${id}/download`,
};

// Ticket message API endpoints
export const messageApi = {
  getAll: async (ticketId, params = {}) => (await apiClient.get(`/tickets/${ticketId}/messages`, { params })).data,
  create: async (ticketId, data) => (await apiClient.post(`/tickets/${ticketId}/messages`, data)).data,
};

// Payment API endpoints
export const paymentApi = {
  getAll: async (params = {}) => (await apiClient.get('/payments', { params })).data,
  create: async (data) => (await apiClient.post('/payments', data)).data,
};

// Quotation API endpoints
export const quotationApi = {
  getAll: async (params = {}) => (await apiClient.get('/quotations', { params })).data,
  create: async (data) => (await apiClient.post('/quotations', data)).data,
};
// Task subtask & comment API endpoints
export const subtaskApi = {
  getAll: async (taskId) => (await apiClient.get(`/tasks/${taskId}/subtasks`)).data,
  create: async (taskId, data) => (await apiClient.post(`/tasks/${taskId}/subtasks`, data)).data,
  update: async (id, data) => (await apiClient.patch(`/tasks/subtasks/${id}`, data)).data,
};

export const taskCommentApi = {
  getAll: async (taskId) => (await apiClient.get(`/tasks/${taskId}/comments`)).data,
  create: async (taskId, data) => (await apiClient.post(`/tasks/${taskId}/comments`, data)).data,
};

const workflowApi = (resource) => ({
  getAll: async (params = {}) => (await apiClient.get(`/${resource}`, { params })).data,
  create: async (data) => (await apiClient.post(`/${resource}`, data)).data,
  getById: async (id) => (await apiClient.get(`/${resource}/${id}`)).data,
  update: async (id, data) => (await apiClient.patch(`/${resource}/${id}`, data)).data,
  delete: async (id) => (await apiClient.delete(`/${resource}/${id}`)).data,
});

export const contactApi = workflowApi('contacts');
export const prospectApi = workflowApi('prospects');
export const activityApi = workflowApi('activities');
export const milestoneApi = workflowApi('milestones');
export const portalApi = { getOverview: async () => (await apiClient.get('/portal/overview')).data };

export default {
  authApi,
  leadApi,
  dealApi,
  companyApi,
  clientApi,
  projectApi,
  taskApi,
  requirementApi,
  invoiceApi,
  ticketApi,
  userApi,
  contactApi,
  prospectApi,
  activityApi,
  milestoneApi,
  portalApi,
  documentApi,
  messageApi,
  paymentApi,
  quotationApi,
};
