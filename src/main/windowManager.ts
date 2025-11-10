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
      focusable: false, // 禁用焦点获取，避免桌面切换
      hasShadow: true,
      titleBarStyle: "hidden",
      backgroundColor: "#00000000",
      // macOS 特定属性避免桌面切换
      ...(process.platform === "darwin" && {
        acceptFirstMouse: false,
        enableLargerThanScreen: false,
      }),
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

    // 获取光标所在显示器
    const cursorPoint = { x, y };
    const display = screen.getDisplayNearestPoint(cursorPoint);

    // 计算窗口位置，在光标右下方显示
    const windowWidth = 240; // 进一步减小宽度 (320 * 2/3 ≈ 240)
    const windowHeight = 300; // 进一步减小高度 (400 * 2/3 ≈ 300)

    // 初始位置：光标右下方
    let windowX = x + 20;
    let windowY = y + 20;

    // 边界检查和调整
    if (windowX + windowWidth > display.bounds.x + display.bounds.width) {
      // 如果超出右边界，调整到光标左侧
      windowX = x - windowWidth - 10;
    }

    if (windowX < display.bounds.x) {
      // 如果超出左边界，贴左边界显示
      windowX = display.bounds.x;
    }

    if (windowY + windowHeight > display.bounds.y + display.bounds.height) {
      // 如果超出下边界，向上调整
      windowY = display.bounds.y + display.bounds.height - windowHeight - 10;
    }

    if (windowY < display.bounds.y) {
      // 如果超出上边界，贴上边界显示
      windowY = display.bounds.y;
    }

    // 确保位置在有效范围内
    windowX = Math.max(windowX, display.bounds.x);
    windowY = Math.max(windowY, display.bounds.y);
    windowX = Math.min(
      windowX,
      display.bounds.x + display.bounds.width - windowWidth
    );
    windowY = Math.min(
      windowY,
      display.bounds.y + display.bounds.height - windowHeight
    );

    // 设置窗口位置和大小
    this.clipboardWindow.setBounds({
      x: Math.round(windowX),
      y: Math.round(windowY),
      width: windowWidth,
      height: windowHeight,
    });

    // 显示窗口 - macOS 专用的桌面切换避免策略
    if (process.platform === "darwin") {
      // macOS 特定处理：使用 setSimpleFullScreen 和其他属性
      this.clipboardWindow.setVisibleOnAllWorkspaces(true);
      this.clipboardWindow.setAlwaysOnTop(true, "floating", 1);

      // 使用 setSimpleFullScreen(false) 确保窗口不会影响桌面状态
      this.clipboardWindow.setSimpleFullScreen(false);

      // 延迟显示避免激活
      setTimeout(() => {
        if (this.clipboardWindow) {
          this.clipboardWindow.showInactive();
          this.clipboardWindow.setVisibleOnAllWorkspaces(false);
        }
      }, 1);
    } else {
      // 其他平台使用标准方法
      this.clipboardWindow.setVisibleOnAllWorkspaces(true);
      this.clipboardWindow.setAlwaysOnTop(true, "floating", 1);
      this.clipboardWindow.showInactive();
      this.clipboardWindow.setVisibleOnAllWorkspaces(false);
    }

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
