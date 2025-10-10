import { defineConfig, Plugin } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8081,
    fs: {
      // Allow serving files from project root plus client/shared folders.
      // `index.html` lives at the project root so we must include "./" here.
      allow: ["./", "./client", "./shared"],
      deny: [".env", ".env.*", "*.{crt,pem}", "**/.git/**", "server/**"],
    },
  },
  build: {
    outDir: "dist/spa",
    assetsDir: "assets",
    cssCodeSplit: true,
    rollupOptions: {
      output: {
        entryFileNames: 'assets/[name].[hash].js',
        chunkFileNames: 'assets/[name].[hash].js',
        assetFileNames: ({ name }) => {
          if (/\.(css)$/.test(name ?? '')) {
            return 'assets/[name].[hash][extname]';
          }
          return 'assets/[name].[hash][extname]';
        },
      },
    },
  },
  plugins: [react(), expressPlugin()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./client"),
      "@shared": path.resolve(__dirname, "./shared"),
    },
  },
}));

function expressPlugin(): Plugin {
  return {
    name: "express-plugin",
    apply: "serve", // Only apply during development (serve mode)
    async configureServer(server) {
      // Import server code dynamically to avoid Vite trying to statically
      // resolve server files during config bundling (which can cause
      // resolution errors or expose server files to the client build).
      const mod = await import("./server");
      const app = mod.createServer();

      // Add Express app as middleware to Vite dev server
      server.middlewares.use(app);
    },
  };
}
