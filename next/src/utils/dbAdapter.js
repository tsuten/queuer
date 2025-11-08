// データベースアダプター
// 環境に応じて適切なデータベース実装を自動選択します
// - Electron環境: window.electronDB経由でIPC通信
// - Next.js環境: 直接ファイルシステムアクセス

// Electron環境かどうかを判定
function isElectronEnvironment() {
  return typeof window !== 'undefined' && window.electronDB
}

// Electron用の実装をインポート（クライアントサイドのみ）
let electronDB = null
if (typeof window !== 'undefined') {
  electronDB = require('./electronDB')
}

// Next.js Server Actions用の実装（サーバーサイドのみ）
let serverDB = null
if (typeof window === 'undefined') {
  serverDB = require('./db')
}

// カテゴリ操作
export async function getCategories() {
  if (isElectronEnvironment()) {
    return await electronDB.getCategories()
  }
  return { success: true, data: await serverDB.getCategories() }
}

export async function getCategoryById(categoryId) {
  if (isElectronEnvironment()) {
    return await electronDB.getCategoryById(categoryId)
  }
  const data = await serverDB.getCategoryById(categoryId)
  return { success: true, data }
}

export async function addCategory(categoryData) {
  if (isElectronEnvironment()) {
    return await electronDB.addCategory(categoryData)
  }
  const data = await serverDB.addCategory(categoryData)
  return { success: true, data }
}

export async function updateCategory(categoryId, updates) {
  if (isElectronEnvironment()) {
    return await electronDB.updateCategory(categoryId, updates)
  }
  await serverDB.updateCategory(categoryId, updates)
  const data = await serverDB.getCategoryById(categoryId)
  return { success: true, data }
}

export async function deleteCategory(categoryId) {
  if (isElectronEnvironment()) {
    return await electronDB.deleteCategory(categoryId)
  }
  await serverDB.deleteCategory(categoryId)
  return { success: true }
}

export async function reorderCategories(categoryIds) {
  if (isElectronEnvironment()) {
    return await electronDB.reorderCategories(categoryIds)
  }
  await serverDB.reorderCategories(categoryIds)
  return { success: true }
}

// キュー操作
export async function addQueue(categoryId, queueData) {
  if (isElectronEnvironment()) {
    return await electronDB.addQueue(categoryId, queueData)
  }
  const data = await serverDB.addQueue(categoryId, queueData)
  return { success: true, data }
}

export async function getQueuesByCategory(categoryId) {
  if (isElectronEnvironment()) {
    return await electronDB.getQueuesByCategory(categoryId)
  }
  const data = await serverDB.getQueuesByCategory(categoryId)
  return { success: true, data }
}

export async function getAllQueues() {
  if (isElectronEnvironment()) {
    return await electronDB.getAllQueues()
  }
  const data = await serverDB.getAllQueues()
  return { success: true, data }
}

export async function getQueueById(categoryId, queueId) {
  if (isElectronEnvironment()) {
    return await electronDB.getQueueById(categoryId, queueId)
  }
  const data = await serverDB.getQueueById(categoryId, queueId)
  return { success: true, data }
}

export async function updateQueue(categoryId, queueId, updates) {
  if (isElectronEnvironment()) {
    return await electronDB.updateQueue(categoryId, queueId, updates)
  }
  await serverDB.updateQueue(categoryId, queueId, updates)
  const data = await serverDB.getQueueById(categoryId, queueId)
  return { success: true, data }
}

export async function deleteQueue(categoryId, queueId) {
  if (isElectronEnvironment()) {
    return await electronDB.deleteQueue(categoryId, queueId)
  }
  await serverDB.deleteQueue(categoryId, queueId)
  return { success: true }
}

export async function reorderQueues(categoryId, queueIds) {
  if (isElectronEnvironment()) {
    return await electronDB.reorderQueues(categoryId, queueIds)
  }
  await serverDB.reorderQueues(categoryId, queueIds)
  return { success: true }
}

export async function moveQueue(fromCategoryId, toCategoryId, queueId, newIndex) {
  if (isElectronEnvironment()) {
    return await electronDB.moveQueue(fromCategoryId, toCategoryId, queueId, newIndex)
  }
  await serverDB.moveQueue(fromCategoryId, toCategoryId, queueId, newIndex)
  return { success: true }
}

// 設定操作
export async function updateSettings(newSettings) {
  if (isElectronEnvironment()) {
    return await electronDB.updateSettings(newSettings)
  }
  await serverDB.updateSettings(newSettings)
  const data = await serverDB.getSettings()
  return { success: true, data }
}

export async function getSettings() {
  if (isElectronEnvironment()) {
    return await electronDB.getSettings()
  }
  const data = await serverDB.getSettings()
  return { success: true, data }
}

