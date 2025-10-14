import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// change target to your backend origin when you spin it up
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/api": {
        target: "https://localhost:7250",
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
