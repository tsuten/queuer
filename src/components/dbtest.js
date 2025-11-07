'use client'

import { useState, useEffect } from 'react'
import { 
  getCategories,
  addCategory,
  deleteCategory,
  getAllQueues,
  addQueue, 
  deleteQueue, 
  getSettings, 
  updateSettings 
} from '../utils/electronDb'

export default function DBTest() {
  const [categories, setCategories] = useState([])
  const [queues, setQueues] = useState([])
  const [settings, setSettings] = useState({})
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [selectedCategoryId, setSelectedCategoryId] = useState('default')

  // データベース初期化
  useEffect(() => {
    loadData()
  }, [])

  // データ読み込み
  const loadData = async () => {
    try {
      const [categoriesData, queuesData, settingsData] = await Promise.all([
        getCategories(),
        getAllQueues(),
        getSettings()
      ])
      
      if (categoriesData.success) {
        setCategories(categoriesData.data)
        if (categoriesData.data.length > 0 && !selectedCategoryId) {
          setSelectedCategoryId(categoriesData.data[0].id)
        }
      } else {
        setMessage(`カテゴリ読み込みエラー: ${categoriesData.error}`)
      }
      
      if (queuesData.success) {
        setQueues(queuesData.data)
      } else {
        setMessage(`キュー読み込みエラー: ${queuesData.error}`)
      }
      
      if (settingsData.success) {
        setSettings(settingsData.data)
      } else {
        setMessage(`設定読み込みエラー: ${settingsData.error}`)
      }
    } catch (error) {
      setMessage(`データ読み込みエラー: ${error.message}`)
    }
  }

  // カテゴリ追加
  const handleAddCategory = async () => {
    setLoading(true)
    try {
      const result = await addCategory({
        name: `テストカテゴリ ${Date.now()}`
      })
      
      if (result.success) {
        setMessage(`カテゴリを追加しました: ${result.data.name}`)
        await loadData()
      } else {
        setMessage(`カテゴリ追加エラー: ${result.error}`)
      }
    } catch (error) {
      setMessage(`カテゴリ追加エラー: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  // カテゴリ削除
  const handleDeleteCategory = async (categoryId) => {
    if (categoryId === 'default') {
      setMessage('デフォルトカテゴリは削除できません')
      return
    }
    
    setLoading(true)
    try {
      const result = await deleteCategory(categoryId)
      
      if (result.success) {
        setMessage('カテゴリを削除しました')
        if (selectedCategoryId === categoryId) {
          setSelectedCategoryId('default')
        }
        await loadData()
      } else {
        setMessage(`カテゴリ削除エラー: ${result.error}`)
      }
    } catch (error) {
      setMessage(`カテゴリ削除エラー: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  // キュー追加
  const handleAddQueue = async () => {
    if (!selectedCategoryId) {
      setMessage('カテゴリを選択してください')
      return
    }
    
    setLoading(true)
    try {
      const result = await addQueue(selectedCategoryId, {
        name: `テストキュー ${Date.now()}`,
        description: 'テスト用のキューです',
        status: 'active',
        maxSize: 50
      })
      
      if (result.success) {
        setMessage(`キューを追加しました: ${result.data.name}`)
        await loadData()
      } else {
        setMessage(`キュー追加エラー: ${result.error}`)
      }
    } catch (error) {
      setMessage(`キュー追加エラー: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  // キュー削除
  const handleDeleteQueue = async (categoryId, queueId) => {
    setLoading(true)
    try {
      const result = await deleteQueue(categoryId, queueId)
      
      if (result.success) {
        setMessage('キューを削除しました')
        await loadData()
      } else {
        setMessage(`キュー削除エラー: ${result.error}`)
      }
    } catch (error) {
      setMessage(`キュー削除エラー: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  // 設定更新
  const handleUpdateSettings = async () => {
    setLoading(true)
    try {
      const result = await updateSettings({
        maxQueueSize: Math.floor(Math.random() * 200) + 50,
        autoCleanup: Math.random() > 0.5
      })
      
      if (result.success) {
        setMessage('設定を更新しました')
        setSettings(result.data)
      } else {
        setMessage(`設定更新エラー: ${result.error}`)
      }
    } catch (error) {
      setMessage(`設定更新エラー: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">データベーステスト</h1>
      
      {message && (
        <div className="mb-4 p-3 bg-blue-100 border border-blue-400 text-blue-700 rounded">
          {message}
        </div>
      )}

      <div className="space-y-6">
        {/* カテゴリ管理 */}
        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">カテゴリ管理</h2>
          
          <div className="space-y-3 mb-4">
            <button
              onClick={handleAddCategory}
              disabled={loading}
              className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded disabled:opacity-50"
            >
              {loading ? '処理中...' : 'カテゴリ追加'}
            </button>
          </div>

          <div className="space-y-2">
            <h3 className="font-medium">カテゴリ一覧 ({categories.length}件)</h3>
            {categories.length === 0 ? (
              <p className="text-gray-500">カテゴリがありません</p>
            ) : (
              <div className="space-y-2">
                {categories.map((category) => (
                  <div key={category.id} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                    <div>
                      <div className="font-medium">{category.name}</div>
                      <div className="text-xs text-gray-500">
                        Index: {category.index} | キュー数: {category.queues?.length || 0}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setSelectedCategoryId(category.id)}
                        disabled={loading}
                        className={`px-3 py-1 rounded text-sm disabled:opacity-50 ${
                          selectedCategoryId === category.id
                            ? 'bg-blue-500 text-white'
                            : 'bg-gray-200 hover:bg-gray-300'
                        }`}
                      >
                        {selectedCategoryId === category.id ? '選択中' : '選択'}
                      </button>
                      {category.id !== 'default' && (
                        <button
                          onClick={() => handleDeleteCategory(category.id)}
                          disabled={loading}
                          className="bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded text-sm disabled:opacity-50"
                        >
                          削除
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* キュー操作 */}
          <div className="bg-white p-4 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">キュー操作</h2>
            
            <div className="mb-4">
              <div className="mb-3">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  カテゴリを選択してください
                </label>
                <select
                  value={selectedCategoryId}
                  onChange={(e) => setSelectedCategoryId(e.target.value)}
                  disabled={loading}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                >
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name} ({category.queues?.length || 0}件のキュー)
                    </option>
                  ))}
                </select>
              </div>
              <button
                onClick={handleAddQueue}
                disabled={loading || !selectedCategoryId}
                className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded disabled:opacity-50"
              >
                {loading ? '処理中...' : '選択したカテゴリにキュー追加'}
              </button>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <h3 className="font-medium">
                  選択中のカテゴリのキュー一覧
                  {selectedCategoryId && (
                    <span className="text-sm text-gray-600 ml-2">
                      ({queues.filter(q => q.categoryId === selectedCategoryId).length}件)
                    </span>
                  )}
                </h3>
                <div className="flex gap-2">
                  <button
                    onClick={() => setSelectedCategoryId('')}
                    className="text-sm text-blue-600 hover:text-blue-800"
                  >
                    全表示
                  </button>
                </div>
              </div>
              
              {queues.length === 0 ? (
                <p className="text-gray-500">キューがありません</p>
              ) : (
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {queues
                    .filter(queue => !selectedCategoryId || queue.categoryId === selectedCategoryId)
                    .map((queue) => (
                    <div key={`${queue.categoryId}-${queue.id}`} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                      <div>
                        <div className="font-medium">{queue.name}</div>
                        <div className="text-sm text-gray-600">{queue.description}</div>
                        <div className="text-xs text-gray-500">
                          カテゴリ: {queue.categoryName} | Index: {queue.index}
                        </div>
                      </div>
                      <button
                        onClick={() => handleDeleteQueue(queue.categoryId, queue.id)}
                        disabled={loading}
                        className="bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded text-sm disabled:opacity-50"
                      >
                        削除
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* 設定表示 */}
          <div className="bg-white p-4 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">現在の設定</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">最大キューサイズ</label>
                <p className="text-lg font-semibold">{settings.maxQueueSize || 'N/A'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">自動クリーンアップ</label>
                <p className="text-lg font-semibold">{settings.autoCleanup ? '有効' : '無効'}</p>
              </div>
              <div className="pt-4">
                <button
                  onClick={handleUpdateSettings}
                  disabled={loading}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
                >
                  {loading ? '更新中...' : '設定をランダム更新'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>


      {/* データリロードボタン */}
      <div className="mt-6 text-center">
        <button
          onClick={loadData}
          disabled={loading}
          className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded disabled:opacity-50"
        >
          {loading ? '読み込み中...' : 'データを再読み込み'}
        </button>
      </div>
    </div>
  )
}
