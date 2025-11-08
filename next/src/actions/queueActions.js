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
} from '../utils/db'

// カテゴリ操作
export async function getCategories() {
  try {
    const categories = await dbGetCategories()
    return { success: true, data: categories }
  } catch (error) {
    return { success: false, error: error.message }
  }
}

export async function getCategoryById(categoryId) {
  try {
    const category = await dbGetCategoryById(categoryId)
    return { success: true, data: category }
  } catch (error) {
    return { success: false, error: error.message }
  }
}

export async function addCategory(categoryData) {
  if (!categoryData.name) {
    return { success: false, error: 'Name is missing' }
  }

  try {
    const newCategory = await dbAddCategory(categoryData)
    return { success: true, data: newCategory }
  } catch (error) {
    return { success: false, error: error.message }
  }
}

export async function updateCategory(categoryId, updates) {
  try {
    await dbUpdateCategory(categoryId, updates)
    const updatedCategory = await dbGetCategoryById(categoryId)
    return { success: true, data: updatedCategory }
  } catch (error) {
    return { success: false, error: error.message }
  }
}

export async function deleteCategory(categoryId) {
  try {
    await dbDeleteCategory(categoryId)
    return { success: true }
  } catch (error) {
    return { success: false, error: error.message }
  }
}

export async function reorderCategories(categoryIds) {
  try {
    await dbReorderCategories(categoryIds)
    return { success: true }
  } catch (error) {
    return { success: false, error: error.message }
  }
}

// キュー操作
export async function getQueuesByCategory(categoryId) {
  try {
    const queues = await dbGetQueuesByCategory(categoryId)
    return { success: true, data: queues }
  } catch (error) {
    return { success: false, error: error.message }
  }
}

export async function renameCategory(categoryId, newName) {
  try {
    await dbUpdateCategory(categoryId, { name: newName })
    return { success: true }
  } catch (error) {
    return { success: false, error: error.message }
  }
}

export async function getAllQueues() {
  try {
    const queues = await dbGetAllQueues()
    return { success: true, data: queues }
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
    const newQueue = await dbAddQueue(categoryId, queueData)
    return { success: true, data: newQueue }
  } catch (error) {
    return { success: false, error: error.message }
  }
}

export async function updateQueue(categoryId, queueId, updates) {
  try {
    await dbUpdateQueue(categoryId, queueId, updates)
    const updatedQueue = await dbGetQueueById(categoryId, queueId)
    return { success: true, data: updatedQueue }
  } catch (error) {
    return { success: false, error: error.message }
  }
}

export async function deleteQueue(categoryId, queueId) {
  try {
    await dbDeleteQueue(categoryId, queueId)
    return { success: true }
  } catch (error) {
    return { success: false, error: error.message }
  }
}

export async function reorderQueues(categoryId, queueIds) {
  try {
    await dbReorderQueues(categoryId, queueIds)
    return { success: true }
  } catch (error) {
    return { success: false, error: error.message }
  }
}

export async function moveQueue(fromCategoryId, toCategoryId, queueId, newIndex) {
  try {
    await dbMoveQueue(fromCategoryId, toCategoryId, queueId, newIndex)
    return { success: true }
  } catch (error) {
    return { success: false, error: error.message }
  }
}

// 設定操作
export async function getSettings() {
  try {
    const settings = await dbGetSettings()
    return { success: true, data: settings }
  } catch (error) {
    return { success: false, error: error.message }
  }
}

export async function updateSettings(newSettings) {
  try {
    await dbUpdateSettings(newSettings)
    const updatedSettings = await dbGetSettings()
    return { success: true, data: updatedSettings }
  } catch (error) {
    return { success: false, error: error.message }
  }
}
