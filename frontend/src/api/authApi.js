import apiClient from './client';

export const authApi = {
async login({ email, password }) {
  const response = await apiClient.post('/auth/login', {
    email,
    password,
  });

  return {
    user: response.data.data.user,
    token: response.data.data.accessToken,
  };
},

async register({ name, email, password, phone }) {
  const response = await apiClient.post('/auth/register', {
    name,
    email,
    password,
    phone,
  });

  return {
    user: response.data.data.user,
    token: response.data.data.accessToken,
  };
},

async getProfile() {
  const response = await apiClient.get('/auth/me');
  return response.data;
},

async logout() {
  const response = await apiClient.post('/auth/logout');
  return response.data;
},


}