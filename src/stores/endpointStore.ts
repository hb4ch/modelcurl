import { create } from 'zustand';
import { invoke } from '@tauri-apps/api/tauri';
import { Endpoint } from '../types';

interface EndpointStore {
  endpoints: Endpoint[];
  selectedEndpoint: Endpoint | null;
  loadEndpoints: () => Promise<void>;
  saveEndpoint: (endpoint: Endpoint) => Promise<void>;
  deleteEndpoint: (id: string) => Promise<void>;
  duplicateEndpoint: (endpoint: Endpoint) => Promise<void>;
  selectEndpoint: (endpoint: Endpoint | null) => void;
}

export const useEndpointStore = create<EndpointStore>((set, get) => ({
  endpoints: [],
  selectedEndpoint: null,

  loadEndpoints: async () => {
    try {
      const endpoints = await invoke<Endpoint[]>('get_saved_endpoints');
      set({ endpoints });
      if (endpoints.length > 0 && !get().selectedEndpoint) {
        set({ selectedEndpoint: endpoints[0] });
      }
    } catch (error) {
      console.error('Failed to load endpoints:', error);
    }
  },

  saveEndpoint: async (endpoint: Endpoint) => {
    try {
      await invoke('save_endpoint', { endpoint });
      await get().loadEndpoints();
    } catch (error) {
      console.error('Failed to save endpoint:', error);
      throw error;
    }
  },

  deleteEndpoint: async (id: string) => {
    try {
      await invoke('delete_endpoint', { id });
      await get().loadEndpoints();
      if (get().selectedEndpoint?.id === id) {
        set({ selectedEndpoint: get().endpoints[0] || null });
      }
    } catch (error) {
      console.error('Failed to delete endpoint:', error);
      throw error;
    }
  },

  duplicateEndpoint: async (endpoint: Endpoint) => {
    try {
      const duplicatedEndpoint: Endpoint = {
        ...endpoint,
        id: `endpoint-${Date.now()}`,
        name: `${endpoint.name} (copy)`,
      };
      await invoke('save_endpoint', { endpoint: duplicatedEndpoint });
      await get().loadEndpoints();
    } catch (error) {
      console.error('Failed to duplicate endpoint:', error);
      throw error;
    }
  },

  selectEndpoint: (endpoint: Endpoint | null) => {
    set({ selectedEndpoint: endpoint });
  },
}));
