// ElectronのIPC経由でデータベース操作を実行するラッパー関数

// electronAPIが利用可能になるまで待つ
function waitForElectronAPI(timeout = 5000) {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined') {
      reject(new Error('Window is not available'));
      return;
    }
    
    if (window.electronAPI) {
      resolve(window.electronAPI);
      return;
    }
    
    const startTime = Date.now();
    const checkInterval = setInterval(() => {
      if (window.electronAPI) {
        clearInterval(checkInterval);
        resolve(window.electronAPI);
      } else if (Date.now() - startTime > timeout) {
        clearInterval(checkInterval);
        reject(new Error('Electron API not available after timeout'));
      }
    }, 100);
  });
}

// カテゴリ操作
export async function getCategories() {
  const api = await waitForElectronAPI();
  return await api.getCategories();
}

export async function getCategoryById(categoryId) {
  const api = await waitForElectronAPI();
  return await api.getCategoryById(categoryId);
}

export async function addCategory(categoryData) {
  const api = await waitForElectronAPI();
  return await api.addCategory(categoryData);
}

export async function updateCategory(categoryId, updates) {
  const api = await waitForElectronAPI();
  return await api.updateCategory(categoryId, updates);
}

export async function deleteCategory(categoryId) {
  const api = await waitForElectronAPI();
  return await api.deleteCategory(categoryId);
}

export async function reorderCategories(categoryIds) {
  const api = await waitForElectronAPI();
  return await api.reorderCategories(categoryIds);
}

export async function renameCategory(categoryId, newName) {
  const api = await waitForElectronAPI();
  return await api.renameCategory(categoryId, newName);
}

// キュー操作
export async function getQueuesByCategory(categoryId) {
  const api = await waitForElectronAPI();
  return await api.getQueuesByCategory(categoryId);
}

export async function getAllQueues() {
  const api = await waitForElectronAPI();
  return await api.getAllQueues();
}

export async function getQueueById(categoryId, queueId) {
  const api = await waitForElectronAPI();
  return await api.getQueueById(categoryId, queueId);
}

export async function addQueue(categoryId, queueData) {
  const api = await waitForElectronAPI();
  return await api.addQueue(categoryId, queueData);
}

export async function updateQueue(categoryId, queueId, updates) {
  const api = await waitForElectronAPI();
  return await api.updateQueue(categoryId, queueId, updates);
}

export async function deleteQueue(categoryId, queueId) {
  const api = await waitForElectronAPI();
  return await api.deleteQueue(categoryId, queueId);
}

export async function reorderQueues(categoryId, queueIds) {
  const api = await waitForElectronAPI();
  return await api.reorderQueues(categoryId, queueIds);
}

export async function moveQueue(fromCategoryId, toCategoryId, queueId, newIndex) {
  const api = await waitForElectronAPI();
  return await api.moveQueue(fromCategoryId, toCategoryId, queueId, newIndex);
}

// 設定操作
export async function getSettings() {
  const api = await waitForElectronAPI();
  return await api.getSettings();
}

export async function updateSettings(newSettings) {
  const api = await waitForElectronAPI();
  return await api.updateSettings(newSettings);
}

