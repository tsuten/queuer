const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('versions', {
  node: () => console.log(process.versions.node),
  chrome: () => console.log(process.versions.chrome),
  electron: () => console.log(process.versions.electron)
  // we can also expose variables, not just functions
})

contextBridge.exposeInMainWorld('test', {
    test: () => {
        function getRandomInt() {
            return Math.floor(Math.random() * 100);
          }
        let randomNumber = getRandomInt()
        console.log(randomNumber)
        if (randomNumber % 2 === 0) {
            return "Even"
        } else {
            return "Odd"
        }
    }
})

// データベースAPIの公開
contextBridge.exposeInMainWorld('electronDB', {
  // カテゴリ操作
  getCategories: () => ipcRenderer.invoke('db:getCategories'),
  getCategoryById: (categoryId) => ipcRenderer.invoke('db:getCategoryById', categoryId),
  addCategory: (categoryData) => ipcRenderer.invoke('db:addCategory', categoryData),
  updateCategory: (categoryId, updates) => ipcRenderer.invoke('db:updateCategory', categoryId, updates),
  deleteCategory: (categoryId) => ipcRenderer.invoke('db:deleteCategory', categoryId),
  reorderCategories: (categoryIds) => ipcRenderer.invoke('db:reorderCategories', categoryIds),
  
  // キュー操作
  addQueue: (categoryId, queueData) => ipcRenderer.invoke('db:addQueue', categoryId, queueData),
  getQueuesByCategory: (categoryId) => ipcRenderer.invoke('db:getQueuesByCategory', categoryId),
  getAllQueues: () => ipcRenderer.invoke('db:getAllQueues'),
  getQueueById: (categoryId, queueId) => ipcRenderer.invoke('db:getQueueById', categoryId, queueId),
  updateQueue: (categoryId, queueId, updates) => ipcRenderer.invoke('db:updateQueue', categoryId, queueId, updates),
  deleteQueue: (categoryId, queueId) => ipcRenderer.invoke('db:deleteQueue', categoryId, queueId),
  reorderQueues: (categoryId, queueIds) => ipcRenderer.invoke('db:reorderQueues', categoryId, queueIds),
  moveQueue: (fromCategoryId, toCategoryId, queueId, newIndex) => ipcRenderer.invoke('db:moveQueue', fromCategoryId, toCategoryId, queueId, newIndex),
  
  // 設定操作
  updateSettings: (newSettings) => ipcRenderer.invoke('db:updateSettings', newSettings),
  getSettings: () => ipcRenderer.invoke('db:getSettings')
})

