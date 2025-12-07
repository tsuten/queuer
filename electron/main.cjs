const { app, BrowserWindow, ipcMain, Tray, Menu } = require('electron')
const path = require('path')
const db = require('./db.cjs')

// const isDev = !app.isPackaged;
// if (isDev) {
//   console.log('isDev')
// } else {
//   console.log('isProd')
// }

// データベースにappインスタンスを設定
db.setApp(app)

const template = [
//   { label: 'Create Category', role: 'createCategory' },
//   { label: 'Create Queue', role: 'createQueue' },
//   { label: 'Quit', role: 'quit' }
]

const menu = Menu.buildFromTemplate(template)
Menu.setApplicationMenu(menu)
const createWindow = () => {

  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
        preload: path.join(app.getAppPath(), 'preload.cjs')
      },
  })
  // Load the index.html from the app directory
  // if (isDev) {
  //   win.loadURL('http://localhost:5173')
  // } else {
    // ビルド後はprocess.resourcesPathを使用
    // const distPath = path.join(process.resourcesPath, 'dist', 'index.html')
    // win.loadFile(distPath)
  // }

  const distPath = path.join(process.resourcesPath, 'dist', 'index.html')
  win.loadFile(distPath)
  
  // 開発環境・ビルド後どちらでも開発者ツールを開く（デバッグ用）
  // win.webContents.openDevTools()
  
  // return win
}

function createTray() {
  const tray = new Tray(path.join(process.resourcesPath, 'assets', 'icon.png'))
  tray.setToolTip('Queuer')
  tray.on('click', () => {
    BrowserWindow.getAllWindows()[0].show()
  })
}

// IPCハンドラーの設定
function setupIPCHandlers() {
  // カテゴリ操作
  ipcMain.handle('db:getCategories', async () => await db.getCategories())
  ipcMain.handle('db:getCategoryById', async (event, categoryId) => await db.getCategoryById(categoryId))
  ipcMain.handle('db:addCategory', async (event, categoryData) => await db.addCategory(categoryData))
  ipcMain.handle('db:updateCategory', async (event, categoryId, updates) => await db.updateCategory(categoryId, updates))
  ipcMain.handle('db:deleteCategory', async (event, categoryId) => await db.deleteCategory(categoryId))
  ipcMain.handle('db:reorderCategories', async (event, categoryIds) => await db.reorderCategories(categoryIds))
  
  // キュー操作
  ipcMain.handle('db:addQueue', async (event, categoryId, queueData) => await db.addQueue(categoryId, queueData))
  ipcMain.handle('db:getQueuesByCategory', async (event, categoryId) => await db.getQueuesByCategory(categoryId))
  ipcMain.handle('db:getAllQueues', async () => await db.getAllQueues())
  ipcMain.handle('db:getQueueById', async (event, categoryId, queueId) => await db.getQueueById(categoryId, queueId))
  ipcMain.handle('db:updateQueue', async (event, categoryId, queueId, updates) => await db.updateQueue(categoryId, queueId, updates))
  ipcMain.handle('db:deleteQueue', async (event, categoryId, queueId) => await db.deleteQueue(categoryId, queueId))
  ipcMain.handle('db:reorderQueues', async (event, categoryId, queueIds) => await db.reorderQueues(categoryId, queueIds))
  ipcMain.handle('db:moveQueue', async (event, fromCategoryId, toCategoryId, queueId, newIndex) => await db.moveQueue(fromCategoryId, toCategoryId, queueId, newIndex))
  
  // 設定操作
  ipcMain.handle('db:updateSettings', async (event, newSettings) => await db.updateSettings(newSettings))
  ipcMain.handle('db:getSettings', async () => await db.getSettings())
}

app.whenReady().then(() => {
  createTray()
  setupIPCHandlers()
  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

