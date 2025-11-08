import { JSONFilePreset } from 'lowdb/node'
import path from 'path'

// データベースのデフォルト構造
const defaultData = {
  categories: [
  ],
  settings: {
    maxQueueSize: 100,
    autoCleanup: true
  }
}

// データベースファイルのパス
const dbPath = path.join(process.cwd(), 'data', 'db.json')

// データベースの初期化（シングルトン）
let dbPromise = null

async function getDB() {
  if (!dbPromise) {
    dbPromise = JSONFilePreset(dbPath, defaultData)
  }
  const db = await dbPromise
  // 毎回ファイルから最新データを読み込む
  await db.read()
  return db
}

// カテゴリ関連の操作
export async function getCategories() {
  const database = await getDB()
  return database.data.categories.sort((a, b) => a.index - b.index)
}

export async function getCategoryById(categoryId) {
  const database = await getDB()
  return database.data.categories.find(cat => cat.id === categoryId)
}

export async function addCategory(categoryData) {
  const database = await getDB()
  await database.update(({ categories }) => {
    const maxIndex = categories.length > 0 
      ? Math.max(...categories.map(c => c.index)) 
      : -1
    const newCategory = {
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      index: maxIndex + 1,
      queues: [],
      ...categoryData
    }
    categories.push(newCategory)
  })
  return database.data.categories[database.data.categories.length - 1]
}

export async function updateCategory(categoryId, updates) {
  const database = await getDB()
  await database.update(({ categories }) => {
    const index = categories.findIndex(cat => cat.id === categoryId)
    if (index !== -1) {
      categories[index] = { 
        ...categories[index], 
        ...updates, 
        updatedAt: new Date().toISOString() 
      }
    }
  })
}

export async function deleteCategory(categoryId) {
  const database = await getDB()
  await database.update(({ categories }) => {
    const index = categories.findIndex(cat => cat.id === categoryId)
    if (index !== -1) {
      categories.splice(index, 1)
    }
  })
}

export async function reorderCategories(categoryIds) {
  const database = await getDB()
  await database.update(({ categories }) => {
    categoryIds.forEach((id, newIndex) => {
      const category = categories.find(cat => cat.id === id)
      if (category) {
        category.index = newIndex
      }
    })
  })
}

// キュー関連の操作
export async function addQueue(categoryId, queueData) {
  const database = await getDB()
  await database.update(({ categories }) => {
    const category = categories.find(cat => cat.id === categoryId)
    if (category) {
      const maxIndex = category.queues.length > 0 
        ? Math.max(...category.queues.map(q => q.index)) 
        : -1
      const newQueue = {
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
        index: maxIndex + 1,
        ...queueData
      }
      category.queues.push(newQueue)
    }
  })
  const category = database.data.categories.find(cat => cat.id === categoryId)
  return category ? category.queues[category.queues.length - 1] : null
}

export async function getQueuesByCategory(categoryId) {
  const database = await getDB()
  const category = database.data.categories.find(cat => cat.id === categoryId)
  return category ? category.queues.sort((a, b) => a.index - b.index) : []
}

export async function getAllQueues() {
  const database = await getDB()
  const allQueues = []
  database.data.categories.forEach(category => {
    category.queues.forEach(queue => {
      allQueues.push({
        ...queue,
        categoryId: category.id,
        categoryName: category.name
      })
    })
  })
  return allQueues
}

export async function getQueueById(categoryId, queueId) {
  const database = await getDB()
  const category = database.data.categories.find(cat => cat.id === categoryId)
  return category ? category.queues.find(queue => queue.id === queueId) : null
}

export async function updateQueue(categoryId, queueId, updates) {
  const database = await getDB()
  await database.update(({ categories }) => {
    const category = categories.find(cat => cat.id === categoryId)
    if (category) {
      const index = category.queues.findIndex(queue => queue.id === queueId)
      if (index !== -1) {
        category.queues[index] = { 
          ...category.queues[index], 
          ...updates, 
          updatedAt: new Date().toISOString() 
        }
      }
    }
  })
}

export async function deleteQueue(categoryId, queueId) {
  const database = await getDB()
  await database.update(({ categories }) => {
    const category = categories.find(cat => cat.id === categoryId)
    if (category) {
      const index = category.queues.findIndex(queue => queue.id === queueId)
      if (index !== -1) {
        category.queues.splice(index, 1)
      }
    }
  })
}

export async function reorderQueues(categoryId, queueIds) {
  const database = await getDB()
  await database.update(({ categories }) => {
    const category = categories.find(cat => cat.id === categoryId)
    if (category) {
      queueIds.forEach((id, newIndex) => {
        const queue = category.queues.find(q => q.id === id)
        if (queue) {
          queue.index = newIndex
        }
      })
    }
  })
}

export async function moveQueue(fromCategoryId, toCategoryId, queueId, newIndex) {
  const database = await getDB()
  await database.update(({ categories }) => {
    const fromCategory = categories.find(cat => cat.id === fromCategoryId)
    const toCategory = categories.find(cat => cat.id === toCategoryId)
    
    if (fromCategory && toCategory) {
      const queueIndex = fromCategory.queues.findIndex(q => q.id === queueId)
      if (queueIndex !== -1) {
        // 移動元カテゴリからキューを削除
        const [queue] = fromCategory.queues.splice(queueIndex, 1)
        
        // 移動先カテゴリに追加し、インデックスを再計算
        toCategory.queues.push(queue)
        const maxIndex = toCategory.queues.length > 0 
          ? Math.max(...toCategory.queues.map(q => q.index || 0)) 
          : -1
        queue.index = maxIndex + 1
        
        // 移動元カテゴリのインデックスを再計算
        fromCategory.queues.forEach((q, idx) => {
          q.index = idx
        })
        
        // 移動先カテゴリのインデックスを再計算（必要な場合）
        if (typeof newIndex === 'number' && newIndex >= 0) {
          // 指定されたインデックスに移動
          toCategory.queues.sort((a, b) => a.index - b.index)
          const movedQueue = toCategory.queues.pop()
          toCategory.queues.splice(newIndex, 0, movedQueue)
          toCategory.queues.forEach((q, idx) => {
            q.index = idx
          })
        }
      }
    }
  })
}

// 設定関連の操作
export async function updateSettings(newSettings) {
  const database = await getDB()
  await database.update(({ settings }) => {
    Object.assign(settings, newSettings)
  })
}

export async function getSettings() {
  const database = await getDB()
  return database.data.settings
}
