import http from './client';

export const ygtApi = {
  list: (params) => http.get('/v1/ygt/docs', { params: params || {} }),
  create: (payload) => http.post('/v1/ygt/docs', payload),
  get: (id) => http.get(`/v1/ygt/docs/${encodeURIComponent(id)}`),
  save: (id, payload) => http.put(`/v1/ygt/docs/${encodeURIComponent(id)}`, payload),
  rename: (id, title) => http.post(`/v1/ygt/docs/${encodeURIComponent(id)}/rename`, { title }),
  remove: (id) => http.delete(`/v1/ygt/docs/${encodeURIComponent(id)}`)
};
