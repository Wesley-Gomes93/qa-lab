import { defineConfig } from "tsup";

export default defineConfig({
  entry: { server: "../../agents/mcp-server/server.js" },
  format: ["esm"],
  target: "node18",
  outDir: "dist",
  clean: true,
  bundle: true,
  splitting: false,
  sourcemap: true,
  minify: false,
  noExternal: ["@modelcontextprotocol/sdk", "dotenv", "zod"],
});
