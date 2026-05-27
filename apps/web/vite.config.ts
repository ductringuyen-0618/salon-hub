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
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        // Split heavy vendor groups into their own chunks so the main bundle
        // stays well under 500 kB and first paint improves.
        manualChunks: (id) => {
          if (!id.includes("node_modules")) return undefined;
          if (id.includes("@radix-ui")) return "radix";
          if (id.includes("react-router") || id.includes("react-dom") || id.includes("/react/")) return "react-vendor";
          if (id.includes("@supabase")) return "supabase";
          if (id.includes("framer-motion")) return "framer";
          if (id.includes("recharts") || id.includes("d3")) return "charts";
          if (id.includes("lucide-react") || id.includes("react-icons")) return "icons";
          if (id.includes("@stomp") || id.includes("sockjs-client")) return "websocket";
          return "vendor";
        },
      },
    },
  },
});
