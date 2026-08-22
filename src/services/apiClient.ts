/**
 * EBDA EDU — Centralized API Client
 * Interfaces with Google Apps Script Backend (Web App API).
 * Stores session tokens, dispatches typed requests, and handles Google Drive file uploads.
 */

import {
  User,
  SystemSettings,
  Teacher,
  SchoolBreak,
  TimetableSlot,
  TeachingRecord,
  LessonAttachment,
  UserRole,
} from '../types';

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: {
    code: string;
    message: string;
    status: number;
  };
  timestamp?: string;
}

class ApiClient {
  private apiUrl: string;
  private token: string | null = null;

  constructor() {
    this.apiUrl = (import.meta.env.VITE_API_URL || '').trim();
    if (typeof window !== 'undefined') {
      this.token = sessionStorage.getItem('ebda_session_token');
    }
  }

  public isConfigured(): boolean {
    return !!this.apiUrl && this.apiUrl.startsWith('http');
  }

  public setToken(token: string | null) {
    this.token = token;
    if (typeof window !== 'undefined') {
      if (token) {
        sessionStorage.setItem('ebda_session_token', token);
      } else {
        sessionStorage.removeItem('ebda_session_token');
      }
    }
  }

  public getToken(): string | null {
    return this.token;
  }

  /**
   * Universal Request Dispatcher to Google Apps Script Web App
   */
  private async request<T = any>(action: string, payload: Record<string, any> = {}, method: 'GET' | 'POST' = 'POST'): Promise<ApiResponse<T>> {
    if (!this.isConfigured()) {
      return {
        success: false,
        error: {
          code: 'API_NOT_CONFIGURED',
          message: 'VITE_API_URL is not set. Operating in local mode.',
          status: 0,
        },
      };
    }

    try {
      let url = this.apiUrl;
      let options: RequestInit = {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain;charset=utf-8', // Google Apps Script handles text/plain without CORS preflight issues
        },
      };

      const bodyData = {
        action: action,
        token: this.token,
        ...payload,
      };

      if (method === 'GET') {
        const queryParams = new URLSearchParams({
          action: action,
          token: this.token || '',
          ...payload,
        });
        url += (url.includes('?') ? '&' : '?') + queryParams.toString();
        options = { method: 'GET' };
      } else {
        options.body = JSON.stringify(bodyData);
      }

      const response = await fetch(url, options);
      if (!response.ok) {
        return {
          success: false,
          error: {
            code: 'HTTP_ERROR',
            message: `HTTP request failed with status: ${response.status}`,
            status: response.status,
          },
        };
      }

      const data: ApiResponse<T> = await response.json();
      return data;
    } catch (err: any) {
      return {
        success: false,
        error: {
          code: 'NETWORK_ERROR',
          message: err.message || 'فشل الاتصال بخادم Google Apps Script.',
          status: 0,
        },
      };
    }
  }

  // Authentication
  async login(username: string, password?: string): Promise<ApiResponse<{ user: User; token: string; expiresAt: string }>> {
    const res = await this.request('login', { username, password });
    if (res.success && res.data?.token) {
      this.setToken(res.data.token);
    }
    return res;
  }

  async logout(): Promise<ApiResponse> {
    const res = await this.request('logout');
    this.setToken(null);
    return res;
  }

  async getCurrentUser(): Promise<ApiResponse<User>> {
    return this.request<User>('getCurrentUser', {}, 'GET');
  }

  // System Settings
  async getSettings(): Promise<ApiResponse<SystemSettings>> {
    return this.request<SystemSettings>('getSettings', {}, 'GET');
  }

  async updateSettings(settings: Partial<SystemSettings>): Promise<ApiResponse<SystemSettings>> {
    return this.request<SystemSettings>('updateSettings', { settings });
  }

  // Dashboard Stats
  async getDashboardStats(date?: string): Promise<ApiResponse<any>> {
    return this.request('getDashboardStats', { date }, 'GET');
  }

  // Users & Access
  async getUsers(): Promise<ApiResponse<User[]>> {
    return this.request<User[]>('getUsers', {}, 'GET');
  }

  async createUser(user: Partial<User> & { initialPassword?: string }): Promise<ApiResponse<User>> {
    return this.request<User>('createUser', { user });
  }

  async updateUser(id: string, updates: Partial<User>): Promise<ApiResponse<User>> {
    return this.request<User>('updateUser', { id, updates });
  }

  async resetParentPassword(userId: string, newPassword: string): Promise<ApiResponse<{ message: string }>> {
    return this.request('resetParentPassword', { userId, newPassword });
  }

  async resetUserPassword(userId: string): Promise<ApiResponse<{ tempPassword: string }>> {
    return this.request('resetUserPassword', { userId });
  }

  // Teachers
  async getTeachers(): Promise<ApiResponse<Teacher[]>> {
    return this.request<Teacher[]>('getTeachers', {}, 'GET');
  }

  async createTeacher(teacher: Omit<Teacher, 'id'>): Promise<ApiResponse<Teacher>> {
    return this.request<Teacher>('createTeacher', { teacher });
  }

  async updateTeacher(id: string, updates: Partial<Teacher>): Promise<ApiResponse<Teacher>> {
    return this.request<Teacher>('updateTeacher', { id, updates });
  }

  async deleteTeacher(id: string): Promise<ApiResponse<{ deleted: boolean }>> {
    return this.request('deleteTeacher', { id });
  }

  async getTeacherWorkload(teacherId?: string): Promise<ApiResponse<any>> {
    return this.request('getTeacherWorkload', { teacherId }, 'GET');
  }

  // Breaks
  async getBreaks(): Promise<ApiResponse<SchoolBreak[]>> {
    return this.request<SchoolBreak[]>('getBreaks', {}, 'GET');
  }

  async createBreak(breakData: Omit<SchoolBreak, 'id'>): Promise<ApiResponse<SchoolBreak>> {
    return this.request<SchoolBreak>('createBreak', { breakData });
  }

  async updateBreak(id: string, updates: Partial<SchoolBreak>): Promise<ApiResponse<SchoolBreak>> {
    return this.request<SchoolBreak>('updateBreak', { id, updates });
  }

  async deleteBreak(id: string): Promise<ApiResponse<{ deleted: boolean }>> {
    return this.request('deleteBreak', { id });
  }

  // Timetable
  async getTimetable(): Promise<ApiResponse<TimetableSlot[]>> {
    return this.request<TimetableSlot[]>('getTimetable', {}, 'GET');
  }

  async createTimetableSlot(slot: Omit<TimetableSlot, 'id'>): Promise<ApiResponse<TimetableSlot>> {
    return this.request<TimetableSlot>('createTimetableSlot', { slot });
  }

  async updateTimetableSlot(id: string, updates: Partial<TimetableSlot>): Promise<ApiResponse<TimetableSlot>> {
    return this.request<TimetableSlot>('updateTimetableSlot', { id, updates });
  }

  async deleteTimetableSlot(id: string): Promise<ApiResponse<{ deleted: boolean }>> {
    return this.request('deleteTimetableSlot', { id });
  }

  // Teaching Records & Materials
  async getTeachingRecords(): Promise<ApiResponse<TeachingRecord[]>> {
    return this.request<TeachingRecord[]>('getTeachingRecords', {}, 'GET');
  }

  async recordLesson(record: Omit<TeachingRecord, 'id' | 'recordedAt'>): Promise<ApiResponse<TeachingRecord>> {
    return this.request<TeachingRecord>('recordLesson', { record });
  }

  async updateTeachingRecord(id: string, updates: Partial<TeachingRecord>): Promise<ApiResponse<TeachingRecord>> {
    return this.request<TeachingRecord>('updateTeachingRecord', { id, updates });
  }

  async toggleParentVisibility(id: string, visible: boolean): Promise<ApiResponse<TeachingRecord>> {
    return this.request<TeachingRecord>('toggleParentVisibility', { id, visible });
  }

  async getWeeklyLearningRecord(classId: string): Promise<ApiResponse<any[]>> {
    return this.request<any[]>('getWeeklyLearningRecord', { classId }, 'GET');
  }

  // Google Drive File Upload
  async uploadDriveFile(file: File): Promise<ApiResponse<LessonAttachment>> {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = async () => {
        const base64String = (reader.result as string).split(',')[1];
        const res = await this.request<LessonAttachment>('uploadDriveFile', {
          fileData: {
            fileName: file.name,
            mimeType: file.type,
            size: `${(file.size / (1024 * 1024)).toFixed(2)} MB`,
            base64Data: base64String,
          },
        });
        resolve(res);
      };
      reader.onerror = () => {
        resolve({
          success: false,
          error: {
            code: 'FILE_READ_ERROR',
            message: 'تعذر قراءة محتوى الملف للرفع على Google Drive.',
            status: 400,
          },
        });
      };
      reader.readAsDataURL(file);
    });
  }
}

export const apiClient = new ApiClient();
