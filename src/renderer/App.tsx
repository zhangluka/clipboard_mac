import React, { useState, useEffect } from "react";
import {
  Box,
  Stack,
  Text,
  Button,
  Group,
  Avatar,
  ScrollArea,
  ActionIcon,
  Divider,
  Center,
  Loader,
  Textarea,
  useMantineTheme,
} from "@mantine/core";

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
  const theme = useMantineTheme();

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
      await (window as any).electronAPI.pasteClipboardItem(id);
      // 通知用户
      console.log("已粘贴到剪贴板");
      // 隐藏窗口
      await (window as any).electronAPI.hideClipboardWindow();
    } catch (error) {
      console.error("粘贴失败:", error);
    }
  };

  // 清空历史
  const handleClear = async () => {
    setHistory([]);
    // 这里可以调用主进程的清空方法
  };

  // 监听窗口显示事件
  useEffect(() => {
    // 监听剪贴板窗口显示
    const handleWindowShown = () => {
      setIsVisible(true);
      fetchHistory();
    };

    // 监听剪贴板历史变化
    const handleHistoryUpdated = () => {
      fetchHistory();
    };

    // 监听 ESC 键
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

  // 监听历史变化
  useEffect(() => {
    if (isVisible) {
      fetchHistory();
    }
  }, [isVisible]);

  const formatTime = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;

    if (diff < 60000) {
      // 1分钟内
      return "刚刚";
    } else if (diff < 3600000) {
      // 1小时内
      return `${Math.floor(diff / 60000)}分钟前`;
    } else if (diff < 86400000) {
      // 24小时内
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
        <Box
          style={{
            width: 16,
            height: 16,
            backgroundColor: theme.colors.gray[4],
            borderRadius: 2,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Text size="xs" color="white">
            🖼️
          </Text>
        </Box>
      );
    }
    return (
      <Box
        style={{
          width: 16,
          height: 16,
          backgroundColor: theme.colors.blue[4],
          borderRadius: 2,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Text size="xs" color="white">
          📋
        </Text>
      </Box>
    );
  };

  if (!isVisible) {
    return (
      <Box style={{ width: "100%", height: "100%" }}>
        <Center style={{ width: "100%", height: "100%" }}>
          <Loader />
        </Center>
      </Box>
    );
  }

  return (
    <Box
      style={{
        width: "100%",
        height: "100%",
        backgroundColor: "rgba(255, 255, 255, 0.95)",
        borderRadius: theme.radius.md,
        border: `1px solid ${theme.colors.gray[2]}`,
        overflow: "hidden",
      }}
    >
      {/* 头部 */}
      <Box
        style={{
          padding: theme.spacing.md,
          borderBottom: `1px solid ${theme.colors.gray[2]}`,
          backgroundColor: theme.colors.gray[0],
        }}
      >
        <Group justify="space-between" align="center">
          <Text size="lg" weight={600}>
            剪贴板历史
          </Text>
          <Group>
            <ActionIcon
              size="sm"
              variant="subtle"
              onClick={() => (window as any).electronAPI.hideClipboardWindow()}
            >
              <Box
                style={{
                  width: 16,
                  height: 16,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Text size="sm">×</Text>
              </Box>
            </ActionIcon>
          </Group>
        </Group>
        <Text size="sm" color="dimmed" mt={4}>
          最近 {history.length} 条记录
        </Text>
      </Box>

      {/* 内容区域 */}
      <Box style={{ height: "calc(100% - 80px)" }}>
        {loading ? (
          <Center style={{ height: "100%" }}>
            <Loader />
          </Center>
        ) : history.length === 0 ? (
          <Center style={{ height: "100%" }}>
            <Stack align="center" gap="md">
              <Box
                style={{
                  width: 48,
                  height: 48,
                  backgroundColor: theme.colors.gray[4],
                  borderRadius: 8,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Text size="lg" color="white">
                  📋
                </Text>
              </Box>
              <Text color="dimmed">暂无剪贴板历史</Text>
              <Text size="sm" color="dimmed">
                复制一些内容开始使用
              </Text>
            </Stack>
          </Center>
        ) : (
          <ScrollArea h="100%">
            <Stack gap={0}>
              {history.map((item, index) => (
                <Box key={item.id}>
                  {index > 0 && <Divider my={0} />}
                  <Button
                    variant="white"
                    size="lg"
                    fullWidth
                    justify="space-between"
                    style={{
                      textAlign: "left",
                      padding: theme.spacing.md,
                      borderRadius: 0,
                      "&:hover": {
                        backgroundColor: theme.colors.blue[0],
                      },
                    }}
                    onClick={() => handlePaste(item.id)}
                  >
                    <Stack align="flex-start" gap={4}>
                      <Group gap="sm">
                        {getItemIcon(item.type)}
                        <Text
                          size="sm"
                          weight={500}
                          lineClamp={2}
                          style={{ wordBreak: "break-word" }}
                        >
                          {item.preview}
                        </Text>
                      </Group>
                      <Group gap="sm">
                        <Box
                          style={{
                            width: 12,
                            height: 12,
                            backgroundColor: theme.colors.gray[5],
                            borderRadius: 6,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <Text size="xs" color="white">
                            ⏰
                          </Text>
                        </Box>
                        <Text size="xs" color="dimmed">
                          {formatTime(item.timestamp)}
                        </Text>
                      </Group>
                    </Stack>
                  </Button>
                </Box>
              ))}
            </Stack>
          </ScrollArea>
        )}
      </Box>

      {/* 底部 */}
      {history.length > 0 && (
        <Box
          style={{
            padding: theme.spacing.sm,
            borderTop: `1px solid ${theme.colors.gray[2]}`,
            backgroundColor: theme.colors.gray[0],
          }}
        >
          <Group justify="space-between" align="center">
            <Text size="xs" color="dimmed">
              按 ESC 键或点击外部区域关闭
            </Text>
            <Button
              variant="subtle"
              size="xs"
              color="red"
              leftSection={
                <Box
                  style={{
                    width: 12,
                    height: 12,
                    backgroundColor: theme.colors.red[4],
                    borderRadius: 6,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Text size="xs" color="white">
                    🗑️
                  </Text>
                </Box>
              }
              onClick={handleClear}
            >
              清空历史
            </Button>
          </Group>
        </Box>
      )}
    </Box>
  );
};

export default App;
