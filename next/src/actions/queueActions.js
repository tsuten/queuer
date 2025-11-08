'use server'

import { 
  getCategories as dbGetCategories,
  getCategoryById as dbGetCategoryById,
  addCategory as dbAddCategory,
  updateCategory as dbUpdateCategory,
  deleteCategory as dbDeleteCategory,
  reorderCategories as dbReorderCategories,
  addQueue as dbAddQueue, 
  getQueuesByCategory as dbGetQueuesByCategory,
  getAllQueues as dbGetAllQueues,
  getQueueById as dbGetQueueById, 
  updateQueue as dbUpdateQueue, 
  deleteQueue as dbDeleteQueue,
  reorderQueues as dbReorderQueues,
  moveQueue as dbMoveQueue,
  getSettings as dbGetSettings,
  updateSettings as dbUpdateSettings
} from '../utils/dbAdapter'

// カテゴリ操作
export async function getCategories() {
  try {
    return await dbGetCategories()
  } catch (error) {
    return { success: false, error: error.message }
  }
}

export async function getCategoryById(categoryId) {
  try {
    return await dbGetCategoryById(categoryId)
  } catch (error) {
    return { success: false, error: error.message }
  }
}

export async function addCategory(categoryData) {
  if (!categoryData.name) {
    return { success: false, error: 'Name is missing' }
  }

  try {
    return await dbAddCategory(categoryData)
  } catch (error) {
    return { success: false, error: error.message }
  }
}

export async function updateCategory(categoryId, updates) {
  try {
    return await dbUpdateCategory(categoryId, updates)
  } catch (error) {
    return { success: false, error: error.message }
  }
}

export async function deleteCategory(categoryId) {
  try {
    return await dbDeleteCategory(categoryId)
  } catch (error) {
    return { success: false, error: error.message }
  }
}

export async function reorderCategories(categoryIds) {
  try {
    return await dbReorderCategories(categoryIds)
  } catch (error) {
    return { success: false, error: error.message }
  }
}

// キュー操作
export async function getQueuesByCategory(categoryId) {
  try {
    return await dbGetQueuesByCategory(categoryId)
  } catch (error) {
    return { success: false, error: error.message }
  }
}

export async function renameCategory(categoryId, newName) {
  try {
    return await dbUpdateCategory(categoryId, { name: newName })
  } catch (error) {
    return { success: false, error: error.message }
  }
}

export async function getAllQueues() {
  try {
    return await dbGetAllQueues()
  } catch (error) {
    return { success: false, error: error.message }
  }
}

export async function addQueue(categoryId, queueData) {
  if (!categoryId) {
    return { success: false, error: 'Category ID is missing' }
  }

  if (!queueData.name) {
    return { success: false, error: 'Name is missing' }
  }

  try {
    return await dbAddQueue(categoryId, queueData)
  } catch (error) {
    return { success: false, error: error.message }
  }
}

export async function updateQueue(categoryId, queueId, updates) {
  try {
    return await dbUpdateQueue(categoryId, queueId, updates)
  } catch (error) {
    return { success: false, error: error.message }
  }
}

export async function deleteQueue(categoryId, queueId) {
  try {
    return await dbDeleteQueue(categoryId, queueId)
  } catch (error) {
    return { success: false, error: error.message }
  }
}

export async function reorderQueues(categoryId, queueIds) {
  try {
    return await dbReorderQueues(categoryId, queueIds)
  } catch (error) {
    return { success: false, error: error.message }
  }
}

export async function moveQueue(fromCategoryId, toCategoryId, queueId, newIndex) {
  try {
    return await dbMoveQueue(fromCategoryId, toCategoryId, queueId, newIndex)
  } catch (error) {
    return { success: false, error: error.message }
  }
}

// 設定操作
export async function getSettings() {
  try {
    return await dbGetSettings()
  } catch (error) {
    return { success: false, error: error.message }
  }
}

export async function updateSettings(newSettings) {
  try {
    return await dbUpdateSettings(newSettings)
  } catch (error) {
    return { success: false, error: error.message }
  }
}
