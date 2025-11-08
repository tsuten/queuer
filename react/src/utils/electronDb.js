// Electron APIのラッパー
// window.electronDBを通じてメインプロセスのデータベース操作を呼び出す

// window.electronDBが存在するか確認
function checkElectronDB() {
    if (!window.electronDB) {
      console.error('window.electronDB is not available. Make sure preload script is loaded.')
      return false
    }
    return true
  }
  
  // カテゴリ操作
  export async function getCategories() {
    if (!checkElectronDB()) return { success: false, error: 'electronDB not available' }
    try {
      return await window.electronDB.getCategories()
    } catch (error) {
      console.error('Error in getCategories:', error)
      return { success: false, error: error.message }
    }
  }
  
  export async function getCategoryById(categoryId) {
    return await window.electronDB.getCategoryById(categoryId)
  }
  
  export async function addCategory(categoryData) {
    if (!checkElectronDB()) return { success: false, error: 'electronDB not available' }
    try {
      console.log('Calling addCategory with:', categoryData)
      const result = await window.electronDB.addCategory(categoryData)
      console.log('addCategory result:', result)
      return result
    } catch (error) {
      console.error('Error in addCategory:', error)
      return { success: false, error: error.message }
    }
  }
  
  export async function updateCategory(categoryId, updates) {
    return await window.electronDB.updateCategory(categoryId, updates)
  }
  
  export async function renameCategory(categoryId, newName) {
    return await window.electronDB.updateCategory(categoryId, { name: newName })
  }
  
  export async function deleteCategory(categoryId) {
    return await window.electronDB.deleteCategory(categoryId)
  }
  
  export async function reorderCategories(categoryIds) {
    return await window.electronDB.reorderCategories(categoryIds)
  }
  
  // キュー操作
  export async function addQueue(categoryId, queueData) {
    return await window.electronDB.addQueue(categoryId, queueData)
  }
  
  export async function getQueuesByCategory(categoryId) {
    return await window.electronDB.getQueuesByCategory(categoryId)
  }
  
  export async function getAllQueues() {
    return await window.electronDB.getAllQueues()
  }
  
  export async function getQueueById(categoryId, queueId) {
    return await window.electronDB.getQueueById(categoryId, queueId)
  }
  
  export async function updateQueue(categoryId, queueId, updates) {
    return await window.electronDB.updateQueue(categoryId, queueId, updates)
  }
  
  export async function deleteQueue(categoryId, queueId) {
    return await window.electronDB.deleteQueue(categoryId, queueId)
  }
  
  export async function reorderQueues(categoryId, queueIds) {
    return await window.electronDB.reorderQueues(categoryId, queueIds)
  }
  
  export async function moveQueue(fromCategoryId, toCategoryId, queueId, newIndex) {
    return await window.electronDB.moveQueue(fromCategoryId, toCategoryId, queueId, newIndex)
  }
  
  // 設定操作
  export async function updateSettings(newSettings) {
    return await window.electronDB.updateSettings(newSettings)
  }
  
  export async function getSettings() {
    return await window.electronDB.getSettings()
  }
  
  