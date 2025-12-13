import axios from 'axios';

const API_URL = `${(import.meta.env.VITE_API_URL || (import.meta.env.PROD ? '' : 'http://localhost:4000')).replace(/\/$/, '')}/v1/admin/metadata`;

// Types based on backend models
export interface EventDefinition {
    _id: string;
    name: string;
    displayName?: string;
    description?: string;
    source: 'client' | 'server' | 'custom' | 'integration';
    category: string;
    isActive: boolean;
    jsonSchema?: any;
    version: number;
    isDeprecated: boolean;
    deprecationReason?: string;
    tags?: string[];
    owner?: string;
    validationLevel: 'strict' | 'lax' | 'none';
    organization_id: string;
    createdAt: string;
    updatedAt: string;
    properties?: PropertyDefinition[];
}

export interface PropertyDefinition {
    _id: string;
    name: string;
    displayName?: string;
    description?: string;
    type: 'string' | 'number' | 'boolean' | 'date' | 'array' | 'object';
    options?: string[];
    defaultValue?: any;
    isPrivate: boolean;
    isPII: boolean;
    validationRegex?: string;
    minValue?: number;
    maxValue?: number;
    minLength?: number;
    maxLength?: number;
    unit?: string;
    exampleValue?: string;
    tags?: string[];
    organization_id: string;
    createdAt: string;
    createdAt: string;
    updatedAt: string;
}

export interface PageDefinition {
    _id: string;
    name: string;
    pageTag: string;
    imageUrl?: string;
}


export const metadataService = {
    // Events
    getEvents: async (): Promise<EventDefinition[]> => {
        const response = await axios.get(`${API_URL}/events`, {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        // Map schema to jsonSchema for backward compatibility
        return response.data.map((e: any) => ({
            ...e,
            jsonSchema: e.jsonSchema || e.schema
        }));
    },

    createEvent: async (event: Partial<EventDefinition>): Promise<EventDefinition> => {
        const response = await axios.post(`${API_URL}/events`, event, {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        return response.data;
    },

    updateEvent: async (id: string, updates: Partial<EventDefinition>): Promise<EventDefinition> => {
        const response = await axios.put(`${API_URL}/events/${id}`, updates, {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        return response.data;
    },

    deleteEvent: async (id: string): Promise<void> => {
        await axios.delete(`${API_URL}/events/${id}`, {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
    },

    // Properties
    getProperties: async (): Promise<PropertyDefinition[]> => {
        const response = await axios.get(`${API_URL}/properties`, {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        return response.data;
    },

    createProperty: async (property: Partial<PropertyDefinition>): Promise<PropertyDefinition> => {
        const response = await axios.post(`${API_URL}/properties`, property, {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        return response.data;
    },

    updateProperty: async (id: string, updates: Partial<PropertyDefinition>): Promise<PropertyDefinition> => {
        const response = await axios.put(`${API_URL}/properties/${id}`, updates, {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        return response.data;
    },

    deleteProperty: async (id: string): Promise<void> => {
        await axios.delete(`${API_URL}/properties/${id}`, {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        deleteProperty: async (id: string): Promise<void> => {
            await axios.delete(`${API_URL}/properties/${id}`, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
        },

            // Pages
            getPages: async (): Promise<PageDefinition[]> => {
                const response = await axios.get(`${API_URL}/pages`, {
                    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
                });
                return response.data;
            }
    };
