import api from './api';
import type { User } from '../types';

export async function login(email: string, password: string): Promise<{ token: string; user: User }> {
  const res = await api.post('/auth/login', { email, password });
  return res.data;
}

export async function register(data: {
  email: string;
  password: string;
  name: string;
  clinicName?: string;
}): Promise<{ token: string; user: User }> {
  const res = await api.post('/auth/register', data);
  return res.data;
}

export async function getMe(): Promise<User> {
  const res = await api.get('/auth/me');
  return res.data;
}

export function logout() {
  localStorage.removeItem('token');
}

export function getToken() {
  return localStorage.getItem('token');
}
