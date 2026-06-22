/**
 * EmbeddedCraft API Client
 * Industrial-grade client for communicating with the backend.
 */

import type { CampaignEditor } from '@/store/useEditorStore';
import { editorToBackend, backendToEditor, type BackendCampaign } from './campaignTransformers';

// Configuration
const DEFAULT_BASE_URL = (import.meta.env.VITE_API_URL || (import.meta.env.PROD ? '' : 'http://localhost:4000')).replace(/\/$/, '');
const DEFAULT_TIMEOUT_MS = 30000;
const API_KEY_STORAGE_KEY = 'embeddedcraft_api_key';

// Types
export interface EnterpriseTypographyConfig {
  typography?: {
    fontFamilies: {
      id: string;
      name: string;
      isVariableFont: boolean;
      variants: {
        weight: number;
        style: 'normal' | 'italic';
        urls: { woff2?: string; ttf?: string };
      }[];
      variableAxes?: { wght?: number[]; ital?: number[] };
    }[];
    tokens: {
      displayLarge?: TypographyToken;
      displayMedium?: TypographyToken;
      headlineLarge?: TypographyToken;
      bodyLarge?: TypographyToken;
      bodyMedium?: TypographyToken;
      labelLarge?: TypographyToken;
    };
  };
}

export interface TypographyToken {
  fontFamilyId: string;
  weight: number;
  size: { base: number; md: number; lg: number };
  lineHeight: { base: number; md: number; lg: number };
  letterSpacing: number;
  textTransform: 'none' | 'uppercase' | 'lowercase';
}

export interface ApiErrorDetails {
  message: string;
  code?: string;
  details?: any;
}

export class ApiError extends Error {
  constructor(
    public message: string,
    public status: number,
    public code?: string,
    public details?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

interface RequestOptions extends RequestInit {
  timeout?: number;
  skipAuth?: boolean;
}

// Main Client Class
class ApiClient {
  private baseUrl: string;
  private apiKey: string | null = null;

  constructor() {
    this.baseUrl = this.resolveBaseUrl();
    this.apiKey = sessionStorage.getItem(API_KEY_STORAGE_KEY);
  }

  private resolveBaseUrl(): string {
    return DEFAULT_BASE_URL;
  }

  public setApiKey(key: string) {
    if (!key.trim()) throw new Error('API key cannot be empty');
    this.apiKey = key;
    sessionStorage.setItem(API_KEY_STORAGE_KEY, key);
  }

  public getApiKey(): string | null {
    return this.apiKey;
  }

  public clearApiKey() {
    this.apiKey = null;
    sessionStorage.removeItem(API_KEY_STORAGE_KEY);
  }

  private async request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const headers = new Headers(options.headers);

    if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
      headers.set('Content-Type', 'application/json');
    }

    if (!options.skipAuth && this.apiKey) {
      headers.set('Authorization', `Bearer ${this.apiKey}`);
    }

    // Send the active environment with every request for data isolation
    const activeEnv = typeof window !== 'undefined' ? localStorage.getItem('embedcraft_active_environment') : null;
    if (activeEnv) {
      headers.set('X-Environment', activeEnv);
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), options.timeout || DEFAULT_TIMEOUT_MS);

    try {
      const fetchOptions: RequestInit = {
        ...options,
        headers,
        signal: controller.signal,
      };
      
      // Prevent browser caching for GET requests
      if (!options.method || options.method.toUpperCase() === 'GET') {
        fetchOptions.cache = 'no-store';
      }

      const response = await fetch(url, fetchOptions);

      clearTimeout(timeoutId);
      return await this.handleResponse<T>(response);
    } catch (error: any) {
      clearTimeout(timeoutId);
      if (error.name === 'AbortError') {
        throw new ApiError('Request timeout', 408, 'TIMEOUT');
      }
      throw error;
    }
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      let errorBody: any;
      try {
        const text = await response.text();
        try {
          errorBody = JSON.parse(text);
        } catch {
          errorBody = { message: text };
        }
      } catch (e) {
        errorBody = { message: `HTTP ${response.status}` };
      }

      if (response.status === 401) {
        // Clear authentication tokens to avoid infinite 401 loops
        if (typeof window !== 'undefined') {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          sessionStorage.removeItem(API_KEY_STORAGE_KEY);
          
          // Only redirect if we are not already on the login page
          if (window.location.pathname !== '/login') {
            window.location.href = '/login';
          }
        }
      }

      throw new ApiError(
        errorBody.message || errorBody.error || `HTTP ${response.status}`,
        response.status,
        errorBody.code,
        errorBody.details
      );
    }

    // Handle 204 No Content
    if (response.status === 204) {
      return {} as T;
    }

    try {
      return await response.json();
    } catch {
      throw new ApiError('Invalid JSON response', 500, 'INVALID_JSON');
    }
  }

  // ============================================================================
  // Authentication
  // ============================================================================
  public async changePassword(data: any): Promise<any> {
    return this.request('/api/auth/change-password', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // ============================================================================
  // Admin / Campaign Management
  // ============================================================================

  public async listCampaigns(limit = 20, offset = 0): Promise<{ campaigns: BackendCampaign[]; total: number }> {
    return this.request(`/v1/admin/campaigns?limit=${limit}&offset=${offset}`);
  }

  // ============================================================================
  // Gamification Vault (Rewards)
  // ============================================================================

  public async listRewards(): Promise<any> {
    return this.request('/v1/admin/rewards');
  }

  public async createReward(data: any): Promise<any> {
    return this.request('/v1/admin/rewards', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  public async updateReward(id: string, data: any): Promise<any> {
    return this.request(`/v1/admin/rewards/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  public async deleteReward(id: string): Promise<any> {
    return this.request(`/v1/admin/rewards/${id}`, {
      method: 'DELETE',
    });
  }

  public async getCampaign(id: string): Promise<BackendCampaign> {
    return this.request(`/v1/admin/campaigns/${encodeURIComponent(id)}`);
  }

  public async createCampaign(campaign: Partial<BackendCampaign>): Promise<BackendCampaign> {
    return this.request('/v1/admin/campaigns', {
      method: 'POST',
      body: JSON.stringify(campaign),
    });
  }

  public async updateCampaign(id: string, updates: Partial<BackendCampaign>): Promise<BackendCampaign> {
    return this.request(`/v1/admin/campaigns/${encodeURIComponent(id)}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  public async checkConflicts(event: string, excludeId?: string): Promise<{ campaigns: any[]; count: number; maxPriority: number }> {
    const params = new URLSearchParams({ event });
    if (excludeId) params.append('exclude', excludeId);
    return this.request(`/v1/admin/campaigns/check-conflicts?${params.toString()}`);
  }

  public async deleteCampaign(id: string): Promise<{ ok: boolean }> {
    return this.request(`/v1/admin/campaigns/${encodeURIComponent(id)}`, {
      method: 'DELETE',
    });
  }

  public async listEvents(limit = 100, offset = 0): Promise<{ events: any[]; total: number }> {
    return this.request(`/v1/admin/analytics/events?limit=${limit}&offset=${offset}`);
  }

  public async getEventTypes(): Promise<{ types: string[] }> {
    return this.request('/v1/admin/analytics/events/types');
  }

  public async listUsers(limit = 50, offset = 0): Promise<{ users: any[]; total: number }> {
    return this.request(`/v1/admin/analytics/users?limit=${limit}&offset=${offset}`);
  }

  public async getUser(userId: string, limit = 50, offset = 0, range = '3months', startDate?: string, endDate?: string): Promise<{ user: any; events: any[]; totalEvents?: number }> {
    let url = `/v1/admin/analytics/users/${encodeURIComponent(userId)}?limit=${limit}&offset=${offset}&range=${range}`;
    if (range === 'custom') {
      if (startDate) url += `&startDate=${encodeURIComponent(startDate)}`;
      if (endDate) url += `&endDate=${encodeURIComponent(endDate)}`;
    }
    return this.request(url);
  }

  public async getDashboardStats(): Promise<{ activeCampaigns: number; totals: any; daily: any[] }> {
    return this.request('/v1/admin/analytics/dashboard');
  }

  public async getCampaignStats(campaignId: string): Promise<any> {
    return this.request(`/v1/admin/analytics/campaign/${encodeURIComponent(campaignId)}`);
  }

  public async getCampaignEvents(campaignId: string, limit = 50, offset = 0): Promise<{ events: any[]; total: number }> {
    return this.request(`/v1/admin/analytics/campaign/${encodeURIComponent(campaignId)}/events?limit=${limit}&offset=${offset}`);
  }

  public async uploadImage(file: File): Promise<{ url: string }> {
    const formData = new FormData();
    formData.append('image', file);
    return this.request('/v1/upload', {
      method: 'POST',
      body: formData,
      timeout: 60000, // Longer timeout for uploads
    });
  }

  public async checkHealth(): Promise<boolean> {
    try {
      const res = await this.request<{ status: string }>('/v1/health', { timeout: 5000 });
      return res.status === 'ok';
    } catch {
      return false;
    }
  }

  // ============================================================================
  // Pages (Page Feature)
  // ============================================================================
  public async listPages(): Promise<{ pages: any[] }> {
    return this.request('/api/pages');
  }

  public async getPage(id: string): Promise<any> {
    return this.request(`/api/pages/${encodeURIComponent(id)}`);
  }

  public async createPageSession(): Promise<{ token: string; deepLink: string }> {
    return this.request('/api/pages/session', {
      method: 'POST',
    });
  }

  public async pollPageStatus(token: string): Promise<{ status: string; pageId?: string }> {
    return this.request(`/api/pages/poll/${encodeURIComponent(token)}`);
  }

  public async deletePage(id: string): Promise<any> {
    return this.request(`/api/pages/${encodeURIComponent(id)}`, {
      method: 'DELETE',
    });
  }

  // ============================================================================
  // Analytics / SDK
  // ============================================================================

  public async identify(userId: string, traits: Record<string, any>): Promise<any> {
    return this.request('/api/v1/nudge/identify', {
      method: 'POST',
      body: JSON.stringify({ userId, traits }),
    });
  }

  public async track(userId: string, event: string, properties: Record<string, any> = {}): Promise<any> {
    return this.request('/api/v1/nudge/track', {
      method: 'POST',
      body: JSON.stringify({ userId, action: event, metadata: properties }),
    });
  }

  // ============================================================================
  // Templates
  // ============================================================================
  public async listTemplates(params?: { category?: string; search?: string }): Promise<{ templates: any[] }> {
    const query = new URLSearchParams();
    if (params?.category) query.append('category', params.category);
    if (params?.search) query.append('search', params.search);

    const queryString = query.toString();
    const url = `/v1/admin/templates${queryString ? `?${queryString}` : ''}`;

    return this.request(url);
  }

  public async getTemplate(id: string): Promise<any> {
    return this.request(`/v1/admin/templates/${encodeURIComponent(id)}`);
  }

  public async createTemplate(template: any): Promise<any> {
    return this.request('/v1/admin/templates', {
      method: 'POST',
      body: JSON.stringify(template),
    });
  }

  public async updateTemplate(id: string, template: any): Promise<any> {
    return this.request(`/v1/admin/templates/${encodeURIComponent(id)}`, {
      method: 'PUT',
      body: JSON.stringify(template),
    });
  }

  public async deleteTemplate(id: string): Promise<any> {
    return this.request(`/v1/admin/templates/${encodeURIComponent(id)}`, {
      method: 'DELETE',
    });
  }

  // ============================================================================
  // Assets
  // ============================================================================
  public async listAssets(): Promise<{ assets: any[]; meta: { total: number; images: number; videos: number; files: number; totalSize: string; totalSizeBytes: number } }> {
    return this.request('/v1/admin/assets');
  }

  public async uploadAsset(file: File): Promise<any> {
    const formData = new FormData();
    formData.append('file', file);
    return this.request('/v1/admin/assets', {
      method: 'POST',
      body: formData,
      timeout: 60000,
    });
  }

  public async uploadMultipleAssets(files: File[]): Promise<{ assets: any[]; count: number }> {
    const formData = new FormData();
    files.forEach(file => formData.append('files', file));
    return this.request('/v1/admin/assets/bulk', {
      method: 'POST',
      body: formData,
      timeout: 120000,
    });
  }

  public async createAssetFromUrl(data: { name: string; url: string; type?: 'image' | 'video' | 'file' }): Promise<any> {
    return this.request('/v1/admin/assets/url', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  public async renameAsset(id: string, name: string): Promise<any> {
    return this.request(`/v1/admin/assets/${encodeURIComponent(id)}`, {
      method: 'PUT',
      body: JSON.stringify({ name }),
    });
  }

  public async deleteAsset(id: string): Promise<any> {
    return this.request(`/v1/admin/assets/${encodeURIComponent(id)}`, {
      method: 'DELETE',
    });
  }

  // ============================================================================
  // Team Management
  // ============================================================================
  public async listTeam(): Promise<{ team: any[] }> {
    return this.request('/v1/admin/team');
  }

  public async inviteUser(email: string, name: string, role: string): Promise<any> {
    return this.request('/v1/admin/team/invite', {
      method: 'POST',
      body: JSON.stringify({ email, name, role }),
    });
  }

  public async removeUser(userId: string): Promise<any> {
    return this.request(`/v1/admin/team/${encodeURIComponent(userId)}`, {
      method: 'DELETE',
    });
  }

  // ============================================================================
  // Segments
  // ============================================================================
  public async listSegments(): Promise<{ segments: any[] }> {
    return this.request('/v1/admin/segments');
  }

  public async createSegment(segment: any): Promise<any> {
    return this.request('/v1/admin/segments', {
      method: 'POST',
      body: JSON.stringify(segment),
    });
  }

  public async deleteSegment(id: string): Promise<any> {
    return this.request(`/v1/admin/segments/${encodeURIComponent(id)}`, {
      method: 'DELETE',
    });
  }

  // ============================================================================
  // Flows
  // ============================================================================
  public async listFlows(): Promise<{ flows: any[] }> {
    return this.request('/v1/admin/flows');
  }

  public async createFlow(flow: any): Promise<any> {
    return this.request('/v1/admin/flows', {
      method: 'POST',
      body: JSON.stringify(flow),
    });
  }

  public async deleteFlow(id: string): Promise<any> {
    return this.request(`/v1/admin/flows/${encodeURIComponent(id)}`, {
      method: 'DELETE',
    });
  }

  public async getEnvironmentConfig(): Promise<{ organizationName: string; environments: Record<string, { apiKey: string; label: string }> }> {
    return this.request('/api/auth/environment');
  }

  // ============================================================================
  // Organization Settings
  // ============================================================================
  public async getOrganizationSettings(): Promise<{ settings: { global_session_limit: number | null; brandGuidelines?: EnterpriseTypographyConfig } }> {
    return this.request('/v1/admin/organization/settings');
  }

  public async updateOrganizationSettings(settings: { global_session_limit?: number | null; brandGuidelines?: EnterpriseTypographyConfig }): Promise<any> {
    return this.request('/v1/admin/organization/settings', {
      method: 'PUT',
      body: JSON.stringify(settings),
    });
  }
}

// Export Singleton Instance
export const apiClient = new ApiClient();

// Export Legacy Functions (Adapters) for backward compatibility
export const setApiKey = (key: string) => apiClient.setApiKey(key);
export const getApiKey = () => apiClient.getApiKey();
export const clearApiKey = () => apiClient.clearApiKey();

export const listCampaigns = (opts?: { limit?: number; offset?: number }) => apiClient.listCampaigns(opts?.limit, opts?.offset);
export const listUsers = (opts?: { limit?: number; offset?: number }) => apiClient.listUsers(opts?.limit, opts?.offset);
export const deleteCampaign = (id: string) => apiClient.deleteCampaign(id);
export const uploadImage = (file: File) => apiClient.uploadImage(file);
export const testConnection = () => apiClient.checkHealth();
export const getCampaignStats = (id: string) => apiClient.getCampaignStats(id);

// Adapter for loadCampaign to return CampaignEditor format
export const loadCampaign = async (id: string): Promise<CampaignEditor> => {
  const backend = await apiClient.getCampaign(id);
  return backendToEditor(backend);
};

// Adapter for saveCampaign
export const saveCampaign = async (campaign: CampaignEditor): Promise<BackendCampaign> => {
  const backend = editorToBackend(campaign);

  // Determine if this is an existing campaign (has valid MongoDB ObjectId)
  // MongoDB ObjectIds are 24 hexadecimal characters
  const id = campaign.id || (campaign as any)._id;
  const isValidMongoId = id && /^[a-f\d]{24}$/i.test(id);

  if (isValidMongoId) {
    // Existing campaign - UPDATE
    return apiClient.updateCampaign(id, backend);
  } else {
    // New campaign - CREATE
    return apiClient.createCampaign(backend);
  }
};

export const saveTemplate = async (template: any): Promise<any> => {
  const id = template.id || template._id;
  if (id) {
    return apiClient.updateTemplate(id, template);
  } else {
    return apiClient.createTemplate(template);
  }
};

// Legacy SDK adapters
export const identify = async (userId: string, traits: Record<string, any>) => {
  try {
    await apiClient.identify(userId, traits);
  } catch (e) {
    console.warn('identify failed', e);
  }
};

export const track = async (userId: string, event: string, properties?: Record<string, any>) => {
  try {
    return await apiClient.track(userId, event, properties);
  } catch (e) {
    console.warn('track failed', e);
    return { ok: false };
  }
};

// Deprecated/Unused
export const fetchCampaigns = async (userId: string) => {
  console.warn('fetchCampaigns is deprecated and not supported by the new server.');
  return { campaigns: [] };
};

export const adminCreateCampaign = async (payload: any) => {
  return apiClient.createCampaign(payload);
};

export const updateCampaign = (id: string, updates: Partial<BackendCampaign>) => apiClient.updateCampaign(id, updates);

export const getCampaignAnalytics = async (campaignId: string) => {
  // This endpoint might not exist yet, but keeping the signature
  // Assuming it might be GET /v1/analytics/campaigns/:id/stats or similar
  // For now, fallback to admin get
  return apiClient.getCampaign(campaignId);
};
