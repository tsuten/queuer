// electron.mjs
import { app, BrowserWindow, ipcMain, protocol } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';
import { spawn } from 'child_process';
import { 
  getCategories, 
  getCategoryById, 
  addCategory, 
  updateCategory, 
  deleteCategory, 
  reorderCategories,
  getQueuesByCategory,
  getAllQueues,
  getQueueById,
  addQueue,
  updateQueue,
  deleteQueue,
  reorderQueues,
  moveQueue,
  getSettings,
  updateSettings
} from './src/utils/db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let nextServer = null;

// カスタムプロトコルを登録して静的ファイルを正しく読み込む
function registerCustomProtocol() {
  protocol.registerFileProtocol('app', (request, callback) => {
    let filePath = request.url.replace('app://', '');
    
    // クエリパラメータやハッシュを削除
    filePath = filePath.split('?')[0].split('#')[0];
    
    // パスが空の場合はindex.htmlを返す
    if (filePath === '' || filePath === '/') {
      filePath = 'index.html';
    }
    
    // 先頭のスラッシュを削除
    if (filePath.startsWith('/')) {
      filePath = filePath.substring(1);
    }
    
    const fullPath = path.join(__dirname, 'out', filePath);
    callback({ path: fullPath });
  });
}

async function startNextServer() {
  return new Promise((resolve, reject) => {
    // Next.jsのproductionサーバーを起動（開発時のみ）
    nextServer = spawn('npm', ['run', 'dev'], {
      cwd: __dirname,
      shell: true,
      env: { ...process.env, PORT: '3000' }
    });

    nextServer.stdout.on('data', (data) => {
      console.log(`Next.js: ${data}`);
      // サーバーが起動したことを検出
      if (data.toString().includes('Local:') || data.toString().includes('Ready')) {
        setTimeout(resolve, 2000); // サーバーが完全に起動するまで少し待つ
      }
    });

    nextServer.stderr.on('data', (data) => {
      console.error(`Next.js Error: ${data}`);
    });

    nextServer.on('error', (error) => {
      console.error('Failed to start Next.js server:', error);
      reject(error);
    });

    // タイムアウト処理
    setTimeout(() => {
      resolve(); // タイムアウト後も続行
    }, 10000);
  });
}

// IPCハンドラーの登録
ipcMain.handle('db:getCategories', async () => {
  try {
    const categories = await getCategories();
    return { success: true, data: categories };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('db:getCategoryById', async (event, categoryId) => {
  try {
    const category = await getCategoryById(categoryId);
    return { success: true, data: category };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('db:addCategory', async (event, categoryData) => {
  try {
    if (!categoryData.name) {
      return { success: false, error: 'Name is missing' };
    }
    const newCategory = await addCategory(categoryData);
    return { success: true, data: newCategory };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('db:updateCategory', async (event, categoryId, updates) => {
  try {
    await updateCategory(categoryId, updates);
    const updatedCategory = await getCategoryById(categoryId);
    return { success: true, data: updatedCategory };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('db:deleteCategory', async (event, categoryId) => {
  try {
    await deleteCategory(categoryId);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('db:reorderCategories', async (event, categoryIds) => {
  try {
    await reorderCategories(categoryIds);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('db:renameCategory', async (event, categoryId, newName) => {
  try {
    await updateCategory(categoryId, { name: newName });
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('db:getQueuesByCategory', async (event, categoryId) => {
  try {
    const queues = await getQueuesByCategory(categoryId);
    return { success: true, data: queues };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('db:getAllQueues', async () => {
  try {
    const queues = await getAllQueues();
    return { success: true, data: queues };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('db:getQueueById', async (event, categoryId, queueId) => {
  try {
    const queue = await getQueueById(categoryId, queueId);
    return { success: true, data: queue };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('db:addQueue', async (event, categoryId, queueData) => {
  try {
    if (!categoryId) {
      return { success: false, error: 'Category ID is missing' };
    }
    if (!queueData.name) {
      return { success: false, error: 'Name is missing' };
    }
    const newQueue = await addQueue(categoryId, queueData);
    return { success: true, data: newQueue };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('db:updateQueue', async (event, categoryId, queueId, updates) => {
  try {
    await updateQueue(categoryId, queueId, updates);
    const updatedQueue = await getQueueById(categoryId, queueId);
    return { success: true, data: updatedQueue };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('db:deleteQueue', async (event, categoryId, queueId) => {
  try {
    await deleteQueue(categoryId, queueId);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('db:reorderQueues', async (event, categoryId, queueIds) => {
  try {
    await reorderQueues(categoryId, queueIds);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('db:moveQueue', async (event, fromCategoryId, toCategoryId, queueId, newIndex) => {
  try {
    await moveQueue(fromCategoryId, toCategoryId, queueId, newIndex);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('db:getSettings', async () => {
  try {
    const settings = await getSettings();
    return { success: true, data: settings };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('db:updateSettings', async (event, newSettings) => {
  try {
    await updateSettings(newSettings);
    const updatedSettings = await getSettings();
    return { success: true, data: updatedSettings };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.cjs'),
    },
  });

  // 開発時はNext.js dev server、本番時は静的ファイル
  const isDev = process.env.NODE_ENV === 'development' || !process.env.NODE_ENV;
  
  if (isDev && process.env.ELECTRON_DEV !== 'false') {
    // 開発時: Next.js dev serverを使用
    win.loadURL('http://localhost:3000');
  } else {
    // 本番時: 静的ファイルを使用
    const indexPath = path.join(__dirname, 'out', 'index.html');
    console.log('Loading static file from:', indexPath);
    win.loadFile(indexPath);
  }

  // DevToolsを開く（開発・本番両方でデバッグのため）
  win.webContents.openDevTools();
  
  // ページ読み込み完了後にデバッグ情報を出力
  win.webContents.on('did-finish-load', () => {
    console.log('Page loaded successfully');
    // electronAPIが利用可能か確認
    win.webContents.executeJavaScript(`
      console.log('window.electronAPI:', typeof window.electronAPI !== 'undefined' ? 'available' : 'not available');
    `);
  });
  
  // エラーハンドリング
  win.webContents.on('did-fail-load', (event, errorCode, errorDescription, validatedURL) => {
    console.error('Failed to load:', validatedURL);
    console.error('Error code:', errorCode);
    console.error('Error description:', errorDescription);
  });
}

app.whenReady().then(async () => {
  const isDev = process.env.NODE_ENV === 'development' || !process.env.NODE_ENV;
  
  if (isDev && process.env.ELECTRON_DEV !== 'false') {
    // 開発時はNext.js dev serverを起動
    console.log('Starting Next.js dev server...');
    await startNextServer();
  } else {
    // 本番時: カスタムプロトコルを登録（必要に応じて）
    // ただし、loadFileを使用する場合は不要
    console.log('Running in production mode');
  }
  
  createWindow();
});

// すべてのウィンドウが閉じられたらアプリを終了（macOS以外）
app.on('window-all-closed', () => {
  // Next.jsサーバーを停止
  if (nextServer) {
    nextServer.kill();
  }
  
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// アプリがアクティブになったときにウィンドウがなければ作成（macOS）
app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// アプリ終了時にNext.jsサーバーをクリーンアップ
app.on('before-quit', () => {
  if (nextServer) {
    nextServer.kill();
  }
});

