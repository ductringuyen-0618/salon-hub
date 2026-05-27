import path from "path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import { tempo } from "tempo-devtools/dist/vite";

// https://vitejs.dev/config/
export default defineConfig({
  base: process.env.NODE_ENV === "development" ? "/" : process.env.VITE_BASE_PATH || "/",
  // sockjs-client expects a browser `global` symbol (it's a Node-era library).
  // Without this polyfill, importing it throws "ReferenceError: global is not
  // defined" and crashes any page that uses the queue WebSocket — notably
  // /waitlist. See QA finding #6.
  define: {
    global: "globalThis",
  },
  optimizeDeps: {
    entries: ["src/main.tsx", "src/tempobook/**/*"],
  },
  plugins: [
    react(),
    tempo(),
  ],
  resolve: {
    preserveSymlinks: true,
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    // @ts-ignore
    allowedHosts: true,
  },
  build: {
    chunkSizeWarningLimit: 1200,
    // NOTE: an earlier version of this config split React, Radix, and a
    // generic "vendor" catchall into separate manualChunks. That created a
    // circular dependency between vendor <-> react-vendor and crashed the
    // PRODUCTION bundle with "Cannot access 'qt' before initialization"
    // (TDZ ReferenceError). We now only split a few standalone libraries
    // that don't share state with React internals — leaving React and
    // anything that depends on it in the default chunk.
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          if (!id.includes("node_modules")) return undefined;
          // Standalone, no React dependency in their init paths:
          if (id.includes("@supabase")) return "supabase";
          if (id.includes("@stomp") || id.includes("sockjs-client")) return "websocket";
          if (id.includes("recharts") || id.includes("d3")) return "charts";
          // Everything else (React + Radix + framer + icons + utils) goes
          // into the default chunk. Larger but correct.
          return undefined;
        },
      },
    },
  },
});
