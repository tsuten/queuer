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
  if (!checkElectronDB()) return { success: false, error: 'electronDB not available' }
  try {
    return await window.electronDB.getCategoryById(categoryId)
  } catch (error) {
    console.error('Error in getCategoryById:', error)
    return { success: false, error: error.message }
  }
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
  if (!checkElectronDB()) return { success: false, error: 'electronDB not available' }
  try {
    return await window.electronDB.updateCategory(categoryId, updates)
  } catch (error) {
    console.error('Error in updateCategory:', error)
    return { success: false, error: error.message }
  }
}

export async function renameCategory(categoryId, newName) {
  if (!checkElectronDB()) return { success: false, error: 'electronDB not available' }
  try {
    return await window.electronDB.updateCategory(categoryId, { name: newName })
  } catch (error) {
    console.error('Error in renameCategory:', error)
    return { success: false, error: error.message }
  }
}

export async function deleteCategory(categoryId) {
  if (!checkElectronDB()) return { success: false, error: 'electronDB not available' }
  try {
    return await window.electronDB.deleteCategory(categoryId)
  } catch (error) {
    console.error('Error in deleteCategory:', error)
    return { success: false, error: error.message }
  }
}

export async function reorderCategories(categoryIds) {
  if (!checkElectronDB()) return { success: false, error: 'electronDB not available' }
  try {
    return await window.electronDB.reorderCategories(categoryIds)
  } catch (error) {
    console.error('Error in reorderCategories:', error)
    return { success: false, error: error.message }
  }
}
  
  // キュー操作
export async function addQueue(categoryId, queueData) {
  if (!checkElectronDB()) return { success: false, error: 'electronDB not available' }
  try {
    return await window.electronDB.addQueue(categoryId, queueData)
  } catch (error) {
    console.error('Error in addQueue:', error)
    return { success: false, error: error.message }
  }
}

export async function getQueuesByCategory(categoryId) {
  if (!checkElectronDB()) return { success: false, error: 'electronDB not available' }
  try {
    return await window.electronDB.getQueuesByCategory(categoryId)
  } catch (error) {
    console.error('Error in getQueuesByCategory:', error)
    return { success: false, error: error.message }
  }
}

export async function getAllQueues() {
  if (!checkElectronDB()) return { success: false, error: 'electronDB not available' }
  try {
    return await window.electronDB.getAllQueues()
  } catch (error) {
    console.error('Error in getAllQueues:', error)
    return { success: false, error: error.message }
  }
}

export async function getQueueById(categoryId, queueId) {
  if (!checkElectronDB()) return { success: false, error: 'electronDB not available' }
  try {
    return await window.electronDB.getQueueById(categoryId, queueId)
  } catch (error) {
    console.error('Error in getQueueById:', error)
    return { success: false, error: error.message }
  }
}

export async function updateQueue(categoryId, queueId, updates) {
  if (!checkElectronDB()) return { success: false, error: 'electronDB not available' }
  try {
    return await window.electronDB.updateQueue(categoryId, queueId, updates)
  } catch (error) {
    console.error('Error in updateQueue:', error)
    return { success: false, error: error.message }
  }
}

export async function deleteQueue(categoryId, queueId) {
  if (!checkElectronDB()) return { success: false, error: 'electronDB not available' }
  try {
    return await window.electronDB.deleteQueue(categoryId, queueId)
  } catch (error) {
    console.error('Error in deleteQueue:', error)
    return { success: false, error: error.message }
  }
}

export async function reorderQueues(categoryId, queueIds) {
  if (!checkElectronDB()) return { success: false, error: 'electronDB not available' }
  try {
    return await window.electronDB.reorderQueues(categoryId, queueIds)
  } catch (error) {
    console.error('Error in reorderQueues:', error)
    return { success: false, error: error.message }
  }
}

export async function moveQueue(fromCategoryId, toCategoryId, queueId, newIndex) {
  if (!checkElectronDB()) return { success: false, error: 'electronDB not available' }
  try {
    return await window.electronDB.moveQueue(fromCategoryId, toCategoryId, queueId, newIndex)
  } catch (error) {
    console.error('Error in moveQueue:', error)
    return { success: false, error: error.message }
  }
}

// 設定操作
export async function updateSettings(newSettings) {
  if (!checkElectronDB()) return { success: false, error: 'electronDB not available' }
  try {
    return await window.electronDB.updateSettings(newSettings)
  } catch (error) {
    console.error('Error in updateSettings:', error)
    return { success: false, error: error.message }
  }
}

export async function getSettings() {
  if (!checkElectronDB()) return { success: false, error: 'electronDB not available' }
  try {
    return await window.electronDB.getSettings()
  } catch (error) {
    console.error('Error in getSettings:', error)
    return { success: false, error: error.message }
  }
}
  
  