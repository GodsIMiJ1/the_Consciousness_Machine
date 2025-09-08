import { contextBridge, ipcRenderer } from 'electron';

const api = {
  // Thread operations
  threads: {
    list: () => ipcRenderer.invoke('threads:list'),
    create: (params: any) => ipcRenderer.invoke('threads:create', params),
    delete: (id: string) => ipcRenderer.invoke('threads:delete', id),
  },
  
  // Kodii operations
  kodii: {
    chat: (threadId: string, message: string, context?: any) => 
      ipcRenderer.invoke('kodii:chat', { threadId, message, context }),
  },
  
  // Project brain operations
  brain: {
    indexFile: (filePath: string) => ipcRenderer.invoke('brain:index-file', filePath),
    search: (query: string) => ipcRenderer.invoke('brain:search', query),
  },
  
  // System operations
  system: {
    platform: process.platform,
    version: process.versions,
  }
};

contextBridge.exposeInMainWorld('skide', api);

export type SKIDEApi = typeof api;
