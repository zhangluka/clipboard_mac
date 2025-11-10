import { defineConfig } from "electron-vite";
import react from "@vitejs/plugin-react";
import { resolve } from "path";

export default defineConfig({
  main: {
    plugins: [],
    build: {
      rollupOptions: {
        external: ["@nut-tree/nut-js", "robotjs"],
      },
    },
  },
  preload: {
    plugins: [],
    vite: {
      build: {
        rollupOptions: {
          external: ["@nut-tree/nut-js", "robotjs"],
        },
      },
    },
  },
  renderer: {
    plugins: [react()],
    resolve: {
      alias: {
        "@": resolve("src"),
      },
    },
  },
});
