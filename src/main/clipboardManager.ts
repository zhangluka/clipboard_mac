import { clipboard, nativeImage, BrowserWindow } from "electron";
import { app } from "electron";

export interface ClipboardItem {
  id: string;
  type: "text" | "image";
  content: string; // 文本内容或图片 base64
  preview: string; // 显示预览
  timestamp: number; // 复制时间
}

class ClipboardManager {
  private history: ClipboardItem[] = [];
  private timer: NodeJS.Timeout | null = null;
  private lastText = "";
  private lastImage = "";

  init() {
    this.startMonitoring();
  }

  private startMonitoring() {
    // 每500ms检查一次剪贴板变化
    this.timer = setInterval(() => {
      this.checkClipboard();
    }, 500);
  }

  private checkClipboard() {
    try {
      const text = clipboard.readText();
      const image = clipboard.readImage();

      // 检查是否有新的文本内容
      if (text && text !== this.lastText) {
        this.lastText = text;
        this.addToHistory("text", text, text.substring(0, 100));
      }

      // 检查是否有新的图片内容
      if (image.isEmpty() === false) {
        const imageData = image.toDataURL();
        if (imageData && imageData !== this.lastImage) {
          this.lastImage = imageData;
          this.addToHistory("image", imageData, "[图片]");
        }
      }
    } catch (error) {
      console.error("检查剪贴板时出错:", error);
    }
  }

  private addToHistory(
    type: "text" | "image",
    content: string,
    preview: string
  ) {
    const item: ClipboardItem = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      type,
      content,
      preview,
      timestamp: Date.now(),
    };

    // 检查是否已存在相同内容
    const existingIndex = this.history.findIndex(
      (item) => item.type === type && item.content === content
    );

    if (existingIndex !== -1) {
      // 如果存在，移到最前面
      this.history.splice(existingIndex, 1);
    } else if (this.history.length >= 10) {
      // 如果超过10条，删除最早的
      this.history.pop();
    }

    // 添加到最前面
    this.history.unshift(item);
  }

  getHistory(): ClipboardItem[] {
    return this.history;
  }

  async pasteItem(id: string): Promise<boolean> {
    try {
      const item = this.history.find((item) => item.id === id);
      if (!item) return false;

      // 将内容写入剪贴板
      if (item.type === "text") {
        clipboard.writeText(item.content);
      } else if (item.type === "image") {
        const image = nativeImage.createFromDataURL(item.content);
        clipboard.writeImage(image);
      }

      // 发送系统级粘贴事件到活跃窗口
      const activeWindow = BrowserWindow.getFocusedWindow();
      if (activeWindow) {
        // 尝试通过渲染进程执行粘贴
        activeWindow.webContents.sendInputEvent({
          type: "keyDown",
          keyCode: process.platform === "darwin" ? "Command" : "Control",
        });
        activeWindow.webContents.sendInputEvent({
          type: "keyDown",
          keyCode: "V",
        });
        activeWindow.webContents.sendInputEvent({
          type: "keyUp",
          keyCode: "V",
        });
        activeWindow.webContents.sendInputEvent({
          type: "keyUp",
          keyCode: process.platform === "darwin" ? "Command" : "Control",
        });
      }

      return true;
    } catch (error) {
      console.error("粘贴失败:", error);
      return false;
    }
  }

  clear() {
    this.history = [];
    this.lastText = "";
    this.lastImage = "";
  }

  stop() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }
}

export const clipboardManager = new ClipboardManager();
