import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { dotenv } from "./scripts/vite-plugin-dotenv";
import { autoChooseConfig } from "../../scripts/utils/auto-choose-config";

export default defineConfig({
  plugins: [react(), dotenv(autoChooseConfig())],
  server: {
    open: true,
  },
  resolve: {
    alias: [{ find: /^~/, replacement: "" }],
  },
  css: {
    preprocessorOptions: {
      less: {
        javascriptEnabled: true,
      },
    },
  },
});
