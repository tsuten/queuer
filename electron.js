// electron.js
const { app, BrowserWindow } = require('electron');
const path = require('path');
const { spawn } = require('child_process');

let nextServer = null;

async function startNextServer() {
  return new Promise((resolve, reject) => {
    // Next.jsのproductionサーバーを起動
    nextServer = spawn('npm', ['run', 'start'], {
      cwd: __dirname,
      shell: true,
      env: { ...process.env, PORT: '3000' }
    });

    nextServer.stdout.on('data', (data) => {
      console.log(`Next.js: ${data}`);
      // サーバーが起動したことを検出
      if (data.toString().includes('Local:') || data.toString().includes('Ready')) {
        setTimeout(resolve, 1000); // サーバーが完全に起動するまで少し待つ
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
    }, 5000);
  });
}

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  // 常にローカルサーバーを使用
  win.loadURL('http://localhost:3000');

  // 開発時は DevTools を開く
  if (process.env.NODE_ENV === 'development') {
    win.webContents.openDevTools();
  }
}

app.whenReady().then(async () => {
  if (process.env.NODE_ENV !== 'development') {
    // 本番モードではNext.jsサーバーを起動してから窓を開く
    await startNextServer();
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
