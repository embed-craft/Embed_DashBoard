import { create } from 'zustand';
import { apiClient } from '@/lib/api';
import { persist } from 'zustand/middleware';

export interface Campaign {
  id: string;
  name: string;
  status: 'active' | 'paused' | 'draft' | 'completed' | 'scheduled';
  trigger: string;
  segment: string;
  impressions: number;
  clicks: number;
  conversions: number;
  conversion: string;
  config: {
    type: string;
    text: string;
    backgroundColor: string;
    textColor: string;
    buttonText?: string;
    position?: string;
    [key: string]: any;
  };
  rules: Rule[];
  events?: string[];
  tags?: string[];
  createdAt: string;
  updatedAt: string;
  experience?: string;
  schedule?: {
    start_date?: string;
    end_date?: string;
    timezone?: string;
  } | null;
}

export interface Rule {
  id: number;
  type: 'event' | 'attribute';
  field: string;
  operator: string;
  value: string;
}

export interface Segment {
  id: string;
  _id?: string; // Backend ID
  name: string;
  conditions: string;
  users: number;
  rules: Rule[];
  createdAt: string;
}

export interface AnalyticsData {
  date: string;
  impressions: number;
  clicks: number;
  conversions: number;
}

interface Store {
  // Campaigns
  campaigns: Campaign[];
  addCampaign: (campaign: Omit<Campaign, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateCampaign: (id: string, campaign: Partial<Campaign>) => void;
  deleteCampaign: (id: string) => Promise<void>;
  toggleCampaignStatus: (id: string) => void;
  updateCampaignStatus: (id: string, status: 'active' | 'paused' | 'draft' | 'completed' | 'scheduled') => void;
  syncCampaigns: (campaigns: Campaign[]) => void;

  // Segments
  segments: Segment[];
  fetchSegments: () => Promise<void>;
  addSegment: (segment: Omit<Segment, 'id' | 'createdAt'>) => Promise<void>;
  updateSegment: (id: string, segment: Partial<Segment>) => void;
  deleteSegment: (id: string) => Promise<void>;

  // Analytics
  analyticsData: AnalyticsData[];
  dashboardStats: {
    activeCampaigns: number;
    impressions: number;
    clicks: number;
    conversions: number;
  };
  fetchAnalytics: () => Promise<void>;
  updateAnalytics: (data: AnalyticsData) => void;
  initializeAnalytics: () => void;

  // Real-time simulation
  simulateEvent: (campaignId: string, eventType: 'impression' | 'click' | 'conversion') => void;

  // Pages
  pages: Page[];
  addPage: (page: Omit<Page, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updatePage: (id: string, page: Partial<Page>) => void;
  deletePage: (id: string) => void;

  // Templates
  templates: Template[];
  fetchTemplates: () => Promise<void>;
  addTemplate: (template: Omit<Template, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  deleteTemplate: (id: string) => Promise<void>;

  // Event Preferences
  eventPreferences: Record<string, { enabled: boolean; isGoal: boolean }>;
  toggleEventStatus: (eventId: string) => void;
  toggleEventGoal: (eventId: string) => void;

  // Settings
  webhookUrl: string;
  setWebhookUrl: (url: string) => void;

  // Flows
  flows: Flow[];
  fetchFlows: () => Promise<void>;
  addFlow: (flow: Omit<Flow, 'id' | 'createdAt' | 'updatedAt' | 'status'>) => Promise<void>;
  deleteFlow: (id: string) => Promise<void>;
}

export interface Page {
  id: string;
  name: string;
  url: string; // or path
  createdAt: string;
  updatedAt: string;
}

export interface Flow {
  id: string;
  _id?: string; // Backend ID
  title: string;
  status: 'active' | 'draft' | 'archived';
  createdAt: string;
  updatedAt: string;
}

export interface Template {
  id: string;
  _id?: string; // Backend ID
  name: string;
  type: string; // 'modal', 'banner', etc.
  thumbnail?: string;
  createdAt: string;
  updatedAt: string;
  createdBy?: { _id: string; name: string; email: string };
  lastEditedBy?: { _id: string; name: string; email: string };
}

export const useStore = create<Store>()(
  persist(
    (set) => ({
      campaigns: [],
      segments: [],
      analyticsData: [],

      addCampaign: (campaign) =>
        set((state) => ({
          campaigns: [
            {
              ...campaign,
              id: Date.now().toString(),
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            },
            ...state.campaigns,
          ],
        })),

      updateCampaign: (id, campaign) =>
        set((state) => ({
          campaigns: state.campaigns.map((c) =>
            c.id === id ? { ...c, ...campaign, updatedAt: new Date().toISOString() } : c
          ),
        })),

      deleteCampaign: async (id) => {
        try {
          // Optimistically update UI
          set((state) => ({
            campaigns: state.campaigns.filter((c) => c.id !== id),
          }));
          // Call Backend
          await apiClient.deleteCampaign(id);
        } catch (error) {
          console.error('Failed to delete campaign:', error);
          // Optional: Re-fetch or revert on error (omitted for now to keep it simple)
        }
      },

      syncCampaigns: (campaigns) =>
        set(() => ({
          campaigns: campaigns,
        })),

      toggleCampaignStatus: (id) =>
        set((state) => ({
          campaigns: state.campaigns.map((c) =>
            c.id === id
              ? {
                ...c,
                status: c.status === 'active' ? 'paused' : 'active',
                updatedAt: new Date().toISOString(),
              }
              : c
          ),
        })),

      updateCampaignStatus: (id, status) =>
        set((state) => ({
          campaigns: state.campaigns.map((c) =>
            c.id === id ? { ...c, status, updatedAt: new Date().toISOString() } : c
          ),
        })),

      // Segments
      fetchSegments: async () => {
        try {
          const { segments } = await apiClient.listSegments();
          set({ segments });
        } catch (e) { console.error(e); }
      },
      addSegment: async (segment) => {
        try {
          const newSegment = await apiClient.createSegment(segment);
          set((state) => ({ segments: [newSegment, ...state.segments] }));
        } catch (e) { console.error(e); }
      },
      updateSegment: (id, segment) =>
        set((state) => ({
          segments: state.segments.map((s) => (s.id === id ? { ...s, ...segment } : s)),
        })),
      deleteSegment: async (id) => {
        try {
          await apiClient.deleteSegment(id);
          set((state) => ({ segments: state.segments.filter((s) => s._id !== id) }));
        } catch (e) { console.error(e); }
      },

      // Analytics
      dashboardStats: {
        activeCampaigns: 0,
        impressions: 0,
        clicks: 0,
        conversions: 0
      },
      fetchAnalytics: async () => {
        try {
          const stats = await apiClient.getDashboardStats();
          set({
            analyticsData: stats.daily,
            dashboardStats: {
              activeCampaigns: stats.activeCampaigns,
              impressions: stats.totals.impressions,
              clicks: stats.totals.clicks,
              conversions: stats.totals.conversions
            }
          });
        } catch (e) { console.error(e); }
      },
      updateAnalytics: (data) =>
        set((state) => ({
          analyticsData: [...state.analyticsData.slice(-6), data],
        })),
      initializeAnalytics: () => { }, // Deprecated, kept for compatibility if needed

      simulateEvent: (campaignId, eventType) =>
        set((state) => {
          // Deprecated: Real analytics now used
          return {};
        }),

      // Pages Implementation
      pages: [],
      addPage: (page) =>
        set((state) => ({
          pages: [
            {
              ...page,
              id: Date.now().toString(),
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            },
            ...state.pages,
          ],
        })),
      updatePage: (id, page) =>
        set((state) => ({
          pages: state.pages.map((p) =>
            p.id === id ? { ...p, ...page, updatedAt: new Date().toISOString() } : p
          ),
        })),
      deletePage: (id) =>
        set((state) => ({
          pages: state.pages.filter((p) => p.id !== id),
        })),

      // Templates Implementation
      templates: [],
      fetchTemplates: async () => {
        try {
          const { templates } = await apiClient.listTemplates();
          set({ templates });
        } catch (e) { console.error(e); }
      },
      addTemplate: async (template) => {
        try {
          const newTemplate = await apiClient.createTemplate(template);
          set((state) => ({ templates: [newTemplate, ...state.templates] }));
        } catch (e) { console.error(e); }
      },
      deleteTemplate: async (id) => {
        try {
          await apiClient.deleteTemplate(id);
          set((state) => ({ templates: state.templates.filter((t) => t._id !== id) }));
        } catch (e) { console.error(e); }
      },

      // Event Preferences Implementation
      eventPreferences: {},
      toggleEventStatus: (eventId) =>
        set((state) => {
          const current = state.eventPreferences[eventId] || { enabled: true, isGoal: false };
          return {
            eventPreferences: {
              ...state.eventPreferences,
              [eventId]: { ...current, enabled: !current.enabled },
            },
          };
        }),
      toggleEventGoal: (eventId) =>
        set((state) => {
          const current = state.eventPreferences[eventId] || { enabled: true, isGoal: false };
          return {
            eventPreferences: {
              ...state.eventPreferences,
              [eventId]: { ...current, isGoal: !current.isGoal },
            },
          };
        }),

      // Settings
      webhookUrl: '',
      setWebhookUrl: (url: string) => set({ webhookUrl: url }),

      // Flows
      flows: [],
      fetchFlows: async () => {
        try {
          const { flows } = await apiClient.listFlows();
          set({ flows });
        } catch (e) { console.error(e); }
      },
      addFlow: async (flow) => {
        try {
          const newFlow = await apiClient.createFlow(flow);
          set((state) => ({ flows: [newFlow, ...state.flows] }));
        } catch (e) { console.error(e); }
      },
      deleteFlow: async (id) => {
        try {
          await apiClient.deleteFlow(id);
          set((state) => ({ flows: state.flows.filter((f) => f._id !== id) }));
        } catch (e) { console.error(e); }
      },
    }),
    {
      name: 'nudge-platform-storage',
    }
  )
);

