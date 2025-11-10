import { BrowserWindow, screen, ipcMain } from "electron";
import path from "path";

class WindowManager {
  private clipboardWindow: BrowserWindow | null = null;
  private mainWindow: BrowserWindow | null = null;

  init(mainWindow: BrowserWindow) {
    this.mainWindow = mainWindow;
    this.createClipboardWindow();
    this.setupWindowEvents();
  }

  private createClipboardWindow() {
    this.clipboardWindow = new BrowserWindow({
      width: 400,
      height: 500,
      minWidth: 300,
      maxWidth: 600,
      minHeight: 200,
      maxHeight: 700,
      show: false,
      frame: false,
      transparent: true,
      alwaysOnTop: true,
      skipTaskbar: true,
      resizable: false,
      maximizable: false,
      fullscreenable: false,
      movable: true,
      focusable: true,
      hasShadow: true,
      titleBarStyle: "hidden",
      backgroundColor: "#00000000",
      webPreferences: {
        preload: path.join(__dirname, "../preload/index.js"),
        contextIsolation: true,
        nodeIntegration: false,
        devTools: process.env.NODE_ENV === "development",
      },
    });

    // 设置窗口样式 - 毛玻璃效果
    this.clipboardWindow.setVibrancy("hud");
    this.clipboardWindow.setOpacity(0.95);

    // 加载渲染进程
    if (process.env.NODE_ENV === "development") {
      this.clipboardWindow.loadURL("http://localhost:5173/clipboard");
    } else {
      this.clipboardWindow.loadFile(
        path.join(__dirname, "../../dist/renderer/index.html"),
        {
          hash: "/clipboard",
        }
      );
    }

    // 开发环境下显示窗口
    if (process.env.NODE_ENV === "development") {
      this.clipboardWindow.webContents.openDevTools();
    }
  }

  private setupWindowEvents() {
    if (!this.clipboardWindow) return;

    // 窗口关闭时隐藏而不是销毁
    this.clipboardWindow.on("close", (event) => {
      event.preventDefault();
      this.hideClipboardWindow();
    });

    // 失去焦点时隐藏
    this.clipboardWindow.on("blur", () => {
      this.hideClipboardWindow();
    });

    // 监听渲染进程的消息
    ipcMain.on("clipboard-item-selected", (event, id: string) => {
      this.hideClipboardWindow();
    });

    ipcMain.on("clipboard-window-hide", () => {
      this.hideClipboardWindow();
    });
  }

  showClipboardWindow(x: number, y: number) {
    if (!this.clipboardWindow) return;

    // 计算窗口位置，确保不超出屏幕边界
    const display = screen.getDisplayNearestPoint({ x, y });
    const windowWidth = 400;
    const windowHeight = 500;

    let windowX = x - windowWidth / 2;
    let windowY = y - windowHeight / 2;

    // 边界检查
    if (windowX < display.bounds.x) windowX = display.bounds.x;
    if (windowX + windowWidth > display.bounds.x + display.bounds.width) {
      windowX = display.bounds.x + display.bounds.width - windowWidth;
    }
    if (windowY < display.bounds.y) windowY = display.bounds.y;
    if (windowY + windowHeight > display.bounds.y + display.bounds.height) {
      windowY = display.bounds.y + display.bounds.height - windowHeight;
    }

    // 设置窗口位置和大小
    this.clipboardWindow.setBounds({
      x: Math.round(windowX),
      y: Math.round(windowY),
      width: windowWidth,
      height: windowHeight,
    });

    // 显示窗口
    this.clipboardWindow.show();
    this.clipboardWindow.focus();

    // 发送消息给渲染进程，通知窗口已显示
    this.clipboardWindow.webContents.send("clipboard-window-shown");
  }

  hideClipboardWindow() {
    if (this.clipboardWindow) {
      this.clipboardWindow.hide();
    }
  }

  toggleClipboardWindow() {
    if (this.clipboardWindow?.isVisible()) {
      this.hideClipboardWindow();
    } else {
      const cursorPos = screen.getCursorScreenPoint();
      this.showClipboardWindow(cursorPos.x, cursorPos.y);
    }
  }

  isClipboardWindowVisible(): boolean {
    return this.clipboardWindow?.isVisible() || false;
  }

  getClipboardWindow(): BrowserWindow | null {
    return this.clipboardWindow;
  }

  destroy() {
    if (this.clipboardWindow) {
      this.clipboardWindow.destroy();
      this.clipboardWindow = null;
    }
  }
}

export const windowManager = new WindowManager();
