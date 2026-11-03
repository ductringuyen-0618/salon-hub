import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";

export default defineConfig({
  plugins: [react()],
  // A test or a second site can serve another folder of static files, with its own config.json.
  publicDir: process.env.HUB_PUBLIC_DIR || "public",
});
