import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      // Disable tree-shaking that might be causing the issue
      treeshake: false,
    },
  },
  // Alternative: try with different optimization settings
  esbuild: {
    // Disable some optimizations that might conflict
    legalComments: "none",
  },
});
