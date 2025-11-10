import React from "react";
import { createRoot } from "react-dom/client";
import { MantineProvider } from "@mantine/core";
import { Notifications } from "@mantine/notifications";
import App from "./App";
import "./styles/global.css";

// Mantine 主题配置
const theme = {
  fontFamily: "PingFang SC, -apple-system, BlinkMacSystemFont, sans-serif",
  fontFamilyMonospace: "Monaco, Consolas, monospace",
  primaryColor: "blue",
  colors: {
    dark: [
      "#f5f5f5",
      "#e0e0e0",
      "#cccccc",
      "#b8b8b8",
      "#a3a3a3",
      "#8f8f8f",
      "#7a7a7a",
      "#666666",
      "#525252",
      "#3d3d3d",
    ] as const,
  },
  cursorType: undefined,
  defaultRadius: "md",
  defaultSpacing: "sm",
  headings: {
    fontFamily: "PingFang SC, -apple-system, BlinkMacSystemFont, sans-serif",
  },
};

// 确保 DOM 加载完成
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => {
    const rootElement = document.getElementById("root");
    if (rootElement) {
      createRoot(rootElement).render(
        <React.StrictMode>
          <MantineProvider theme={theme} defaultColorScheme="light">
            <Notifications position="top-right" />
            <App />
          </MantineProvider>
        </React.StrictMode>
      );
    }
  });
} else {
  const rootElement = document.getElementById("root");
  if (rootElement) {
    createRoot(rootElement).render(
      <React.StrictMode>
        <MantineProvider theme={theme} defaultColorScheme="light">
          <Notifications position="top-right" />
          <App />
        </MantineProvider>
      </React.StrictMode>
    );
  }
}
