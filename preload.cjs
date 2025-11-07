const { contextBridge, ipcRenderer } = require('electron');

console.log('Preload script loaded');

// IPC通信のAPIを安全に公開
contextBridge.exposeInMainWorld('electronAPI', {
  // カテゴリ操作
  getCategories: () => ipcRenderer.invoke('db:getCategories'),
  getCategoryById: (categoryId) => ipcRenderer.invoke('db:getCategoryById', categoryId),
  addCategory: (categoryData) => ipcRenderer.invoke('db:addCategory', categoryData),
  updateCategory: (categoryId, updates) => ipcRenderer.invoke('db:updateCategory', categoryId, updates),
  deleteCategory: (categoryId) => ipcRenderer.invoke('db:deleteCategory', categoryId),
  reorderCategories: (categoryIds) => ipcRenderer.invoke('db:reorderCategories', categoryIds),
  renameCategory: (categoryId, newName) => ipcRenderer.invoke('db:renameCategory', categoryId, newName),
  
  // キュー操作
  getQueuesByCategory: (categoryId) => ipcRenderer.invoke('db:getQueuesByCategory', categoryId),
  getAllQueues: () => ipcRenderer.invoke('db:getAllQueues'),
  getQueueById: (categoryId, queueId) => ipcRenderer.invoke('db:getQueueById', categoryId, queueId),
  addQueue: (categoryId, queueData) => ipcRenderer.invoke('db:addQueue', categoryId, queueData),
  updateQueue: (categoryId, queueId, updates) => ipcRenderer.invoke('db:updateQueue', categoryId, queueId, updates),
  deleteQueue: (categoryId, queueId) => ipcRenderer.invoke('db:deleteQueue', categoryId, queueId),
  reorderQueues: (categoryId, queueIds) => ipcRenderer.invoke('db:reorderQueues', categoryId, queueIds),
  moveQueue: (fromCategoryId, toCategoryId, queueId, newIndex) => ipcRenderer.invoke('db:moveQueue', fromCategoryId, toCategoryId, queueId, newIndex),
  
  // 設定操作
  getSettings: () => ipcRenderer.invoke('db:getSettings'),
  updateSettings: (newSettings) => ipcRenderer.invoke('db:updateSettings', newSettings),
});

console.log('Electron API exposed to main world');

