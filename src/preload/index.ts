import { contextBridge, ipcRenderer } from "electron";

// 暴露给渲染进程的 API
contextBridge.exposeInMainWorld("electronAPI", {
  // 剪贴板历史
  getClipboardHistory: () => ipcRenderer.invoke("get-clipboard-history"),
  pasteClipboardItem: (id: string) =>
    ipcRenderer.invoke("paste-clipboard-item", id),

  // 窗口控制
  hideWindow: () => ipcRenderer.send("hide-window"),
  hideClipboardWindow: () => ipcRenderer.send("hide-window"),

  // 光标位置
  getCursorPosition: () => ipcRenderer.invoke("get-cursor-position"),

  // 监听事件
  onClipboardWindowShown: (callback: () => void) =>
    ipcRenderer.on("clipboard-window-shown", callback),
  onClipboardItemSelected: (
    callback: (event: Electron.IpcRendererEvent, id: string) => void
  ) => ipcRenderer.on("clipboard-item-selected", callback),
  onClipboardWindowHide: (callback: () => void) =>
    ipcRenderer.on("clipboard-window-hide", callback),

  // 移除监听器
  removeListener: (channel: string, listener: (...args: any[]) => void) =>
    ipcRenderer.removeListener(channel, listener),
});
