import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  resolve: {
    alias: {
      "@config": path.resolve(__dirname, "src/config"),
      "@clients": path.resolve(__dirname, "src/clients"),
      "@helpers": path.resolve(__dirname, "src/helpers"),
      "@fixtures": path.resolve(__dirname, "src/fixtures"),
      "@utils": path.resolve(__dirname, "src/utils"),
      "@api-types": path.resolve(__dirname, "src/types"),
      "@sdk-dogfood": path.resolve(__dirname, "src/sdk-dogfood"),
    },
  },
  test: {
    globals: true,
    environment: "node",
    include: ["tests/**/*.test.ts"],
    setupFiles: ["./src/config/index.ts"],
    reporters: ["default"],
    testTimeout: 30_000,
  },
});
