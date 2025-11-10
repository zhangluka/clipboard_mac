import React, { useState, useEffect } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  ScrollArea,
  Button,
  Badge,
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
  Skeleton,
  Progress,
  Separator,
} from "./components/ui";
import {
  Clock,
  Clipboard,
  Image as ImageIcon,
  Eye,
  Trash2,
  Search,
  Settings,
  RefreshCw,
} from "lucide-react";
import { cn } from "./lib/utils";

interface ClipboardItem {
  id: string;
  type: "text" | "image";
  content: string;
  preview: string;
  timestamp: number;
}

const App: React.FC = () => {
  const [history, setHistory] = useState<ClipboardItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isVisible, setIsVisible] = useState(false);
  const [pasting, setPasting] = useState<string | null>(null);

  // 获取剪贴板历史
  const fetchHistory = async () => {
    try {
      setLoading(true);
      const result = await (window as any).electronAPI.getClipboardHistory();
      setHistory(result || []);
    } catch (error) {
      console.error("获取剪贴板历史失败:", error);
    } finally {
      setLoading(false);
    }
  };

  // 粘贴选中的项目
  const handlePaste = async (id: string) => {
    try {
      setPasting(id); // 设置正在粘贴状态

      // 通过主进程执行粘贴操作，这样可以确保内容粘贴到正确的应用程序中
      await (window as any).electronAPI.pasteClipboardItem(id);
      console.log("内容已粘贴到光标位置");

      // 关闭窗口
      await (window as any).electronAPI.hideClipboardWindow();
    } catch (error) {
      console.error("粘贴失败:", error);

      // 如果主进程方法失败，尝试直接操作剪贴板
      try {
        const itemToPaste = history.find((item) => item.id === id);
        if (itemToPaste) {
          await navigator.clipboard.writeText(itemToPaste.content);
          console.log("内容已复制到剪贴板");
          await (window as any).electronAPI.hideClipboardWindow();
        }
      } catch (clipboardError) {
        console.error("剪贴板操作失败:", clipboardError);
      }
    } finally {
      setPasting(null); // 清除粘贴状态
    }
  };

  // 监听窗口显示事件
  useEffect(() => {
    const handleWindowShown = () => {
      setIsVisible(true);
      fetchHistory();
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        (window as any).electronAPI.hideClipboardWindow();
      }
    };

    (window as any).electronAPI.onClipboardWindowShown(handleWindowShown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  useEffect(() => {
    if (isVisible) {
      fetchHistory();
    }
  }, [isVisible]);

  const formatTime = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;

    if (diff < 60000) {
      return "刚刚";
    } else if (diff < 3600000) {
      return `${Math.floor(diff / 60000)}分钟前`;
    } else if (diff < 86400000) {
      return `${Math.floor(diff / 3600000)}小时前`;
    } else {
      const date = new Date(timestamp);
      return `${date.getMonth() + 1}/${date.getDate()} ${date.getHours()}:${date
        .getMinutes()
        .toString()
        .padStart(2, "0")}`;
    }
  };

  const getItemIcon = (type: string) => {
    if (type === "image") {
      return (
        <div className="flex items-center justify-center w-4 h-4 bg-indigo-600 rounded text-white text-xs">
          🖼️
        </div>
      );
    }
    return (
      <div className="flex items-center justify-center w-4 h-4 bg-blue-600 rounded text-white text-xs">
        📋
      </div>
    );
  };

  if (!isVisible) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="w-full h-full">
      <Card className="w-full h-full border-0 shadow-none bg-white/95 backdrop-blur-xl">
        <CardHeader className="space-y-1">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clipboard className="h-5 w-5 text-primary" />
              <CardTitle className="text-base">剪贴板历史</CardTitle>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="text-xs">
                {history.length} 项
              </Badge>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => fetchHistory()}
                      className="h-8 w-8 p-0"
                    >
                      <RefreshCw className="h-3 w-3" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>刷新历史</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {loading ? (
            <div className="h-[400px] flex flex-col items-center justify-center space-y-4">
              <div className="flex flex-col items-center space-y-2">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                <p className="text-sm text-muted-foreground">加载中...</p>
              </div>
            </div>
          ) : history.length === 0 ? (
            <div className="h-[400px] flex flex-col items-center justify-center space-y-4">
              <div className="text-center space-y-2">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-full flex items-center justify-center shadow-lg">
                  <Clipboard className="h-6 w-6 text-white" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-lg font-semibold">暂无剪贴板历史</h3>
                  <p className="text-sm text-muted-foreground">
                    复制一些内容开始使用
                  </p>
                </div>
              </div>
              <div className="space-y-1 text-xs text-muted-foreground">
                <p>💡 提示：</p>
                <ul className="list-disc list-inside space-y-0.5">
                  <li>复制文本、图片或文件路径</li>
                  <li>使用快捷键 Command+Shift+V 唤起</li>
                  <li>点击项目粘贴到当前位置</li>
                </ul>
              </div>
            </div>
          ) : (
            <ScrollArea className="h-[400px] w-full">
              <div className="space-y-1 pr-2">
                {history.map((item, index) => (
                  <div
                    key={item.id}
                    onClick={() => handlePaste(item.id)}
                    className={`group cursor-pointer ${
                      pasting === item.id ? "cursor-wait" : ""
                    }`}
                  >
                    <Card
                      className={`transition-all duration-200 hover:shadow-xl hover:border-primary/20 border border-gray-100 hover:border-gray-200 bg-gradient-to-r from-white to-gray-50 ${
                        pasting === item.id
                          ? "opacity-50 cursor-wait"
                          : "cursor-pointer"
                      }`}
                    >
                      <CardContent className="p-3">
                        <div className="flex items-start gap-4">
                          {/* 图标区域 - 更大更突出 */}
                          <div className="flex-shrink-0 flex items-center justify-center w-12 h-12 mt-1">
                            {item.type === "image" ? (
                              <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg transform transition-transform hover:scale-105">
                                <ImageIcon className="h-5 w-5 text-white drop-shadow-sm" />
                              </div>
                            ) : (
                              <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl flex items-center justify-center shadow-lg transform transition-transform hover:scale-105">
                                <Clipboard className="h-5 w-5 text-white drop-shadow-sm" />
                              </div>
                            )}
                          </div>

                          {/* 内容区域 - 大字体突出显示 */}
                          <div className="flex-1 min-w-0 space-y-2">
                            <div className="text-base font-semibold text-gray-800 leading-relaxed break-words tracking-wide">
                              {item.preview}
                            </div>
                            <div className="flex items-center gap-2 text-xs text-gray-500 font-medium">
                              <Clock className="h-3 w-3 text-gray-400" />
                              <span className="text-gray-600">
                                {formatTime(item.timestamp)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </CardContent>

        <CardFooter className="flex flex-col space-y-2">
          <Separator />
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <span>💡</span>按 ESC 键或点击外部区域关闭
            </span>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" className="text-xs h-auto p-1">
                清空历史
              </Button>
              <Button variant="ghost" size="sm" className="text-xs h-auto p-1">
                设置
              </Button>
            </div>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

export default App;
