import {
  app,
  BrowserWindow,
  globalShortcut,
  ipcMain,
  clipboard,
  screen,
} from "electron";
import path from "path";
import { clipboardManager } from "./clipboardManager";
import { windowManager } from "./windowManager";

// 禁用安全警告
process.env["ELECTRON_DISABLE_SECURITY_WARNINGS"] = "true";

let mainWindow: BrowserWindow | null = null;
let isQuitting = false;

function createMainWindow() {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, "../preload/index.js"),
      contextIsolation: true,
      nodeIntegration: false,
      devTools: process.env.NODE_ENV === "development",
    },
    show: false,
    frame: false,
    transparent: true,
    alwaysOnTop: true,
    skipTaskbar: true,
    resizable: false,
    maximizable: false,
    fullscreenable: false,
  });

  // 加载渲染进程
  if (process.env.NODE_ENV === "development") {
    mainWindow.loadURL("http://localhost:5173");
  } else {
    mainWindow.loadFile(path.join(__dirname, "../../dist/renderer/index.html"));
  }

  // 开发环境下显示窗口以便调试
  if (process.env.NODE_ENV === "development") {
    mainWindow.show();
    mainWindow.webContents.openDevTools();
  }

  mainWindow.on("closed", () => {
    mainWindow = null;
  });

  return mainWindow;
}

// 注册全局快捷键
function registerShortcuts() {
  // Command+Shift+V 唤起剪贴板历史
  globalShortcut.register("Command+Shift+V", () => {
    if (isQuitting) return;

    const cursorPos = screen.getCursorScreenPoint();
    windowManager.showClipboardWindow(cursorPos.x, cursorPos.y);
  });

  // 注册其他快捷键
  globalShortcut.register("Escape", () => {
    windowManager.hideClipboardWindow();
  });
}

// 处理 IPC 通信
function setupIPC() {
  // 获取剪贴板历史
  ipcMain.handle("get-clipboard-history", () => {
    return clipboardManager.getHistory();
  });

  // 粘贴选中的历史记录
  ipcMain.handle("paste-clipboard-item", async (event, id: string) => {
    return clipboardManager.pasteItem(id);
  });

  // 隐藏窗口
  ipcMain.on("hide-window", () => {
    windowManager.hideClipboardWindow();
  });

  // 获取光标位置
  ipcMain.handle("get-cursor-position", () => {
    return screen.getCursorScreenPoint();
  });
}

// 应用程序生命周期
app.whenReady().then(() => {
  const win = createMainWindow();

  // 初始化组件
  clipboardManager.init();
  windowManager.init(win);
  setupIPC();
  registerShortcuts();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createMainWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

app.on("before-quit", () => {
  isQuitting = true;
  globalShortcut.unregisterAll();
});
