import axios from 'axios';

import type {
  Analytics,
  AuthResponse,
  ChatResponse,
  DocumentItem,
  HistoryItem,
} from '@/lib/types';

const rawApiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';
const baseURL = rawApiUrl.replace(/\/+$/, '');

const api = axios.create({ baseURL });

api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('semantic_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

export const apiClient = {
  async signup(email: string, password: string, fullName?: string) {
    const { data } = await api.post<AuthResponse>('auth/signup', {
      email,
      password,
      full_name: fullName,
    });
    return data;
  },
  async login(email: string, password: string) {
    const { data } = await api.post<AuthResponse>('auth/login', { email, password });
    return data;
  },
  async getDocuments() {
    const { data } = await api.get<DocumentItem[]>('documents');
    return data;
  },
  async uploadDocuments(files: File[], onProgress?: (progress: number) => void) {
    const formData = new FormData();
    files.forEach((file) => formData.append('files', file));
    const { data } = await api.post('documents/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: (event) => {
        if (!event.total || !onProgress) {
          return;
        }
        onProgress(Math.round((event.loaded * 100) / event.total));
      },
    });
    return data;
  },
  async deleteDocument(id: string) {
    await api.delete(`documents/${id}`);
  },
  async chat(question: string, topK = 5) {
    const { data } = await api.post<ChatResponse>('chat', { question, top_k: topK });
    return data;
  },
  async search(query: string, topK = 5) {
    const { data } = await api.post('search', { query, top_k: topK });
    return data;
  },
  async getHistory() {
    const { data } = await api.get<{ items: HistoryItem[] }>('history');
    return data.items;
  },
  async deleteHistory(queryId: string) {
    await api.delete(`history/${queryId}`);
  },
  async clearAllHistory() {
    await api.delete('history');
  },
  async getAnalytics() {
    const { data } = await api.get<Analytics>('analytics');
    return data;
  },
};
