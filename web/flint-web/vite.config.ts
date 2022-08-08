import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { dotenv } from "./scripts/vite-plugin-dotenv";
import { autoChooseConfig } from "../../scripts/utils/auto-choose-config";
import { reactVirtualized } from "./scripts/vite-plugin-react-virtualized";

export default defineConfig({
  plugins: [react(), dotenv(autoChooseConfig()), reactVirtualized()],
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
