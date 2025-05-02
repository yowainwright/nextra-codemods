import { updateNextConfig } from "../src/fixes/fix-next-config";
import * as fs from "fs";
import * as path from "path";

// Mock fs and path modules
jest.mock("fs");
jest.mock("path");

describe("fix-next-config", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Setup default mocks
    (fs.existsSync as jest.Mock).mockImplementation((filePath: string) => {
      return filePath.includes("next.config.js");
    });
    (fs.writeFileSync as jest.Mock).mockReturnValue(undefined);
    (path.join as jest.Mock).mockImplementation((...args) => args.join("/"));
    (path.basename as jest.Mock).mockImplementation((filePath: string) => {
      return filePath.split("/").pop();
    });
  });

  test("creates next.config.js if it does not exist", () => {
    // Mock fs.existsSync to return false for all paths
    (fs.existsSync as jest.Mock).mockReturnValue(false);

    // Run the function
    const messages = updateNextConfig("/test-project");

    // Verify next.config.js was created
    expect(fs.writeFileSync).toHaveBeenCalledWith(
      "/test-project/next.config.js",
      expect.stringContaining("withNextra"),
    );

    // Verify message
    expect(messages).toContain("Created/updated next.config.js");
  });

  test("updates existing next.config.js", () => {
    // Run the function
    const messages = updateNextConfig("/test-project");

    // Verify next.config.js was updated
    expect(fs.writeFileSync).toHaveBeenCalledWith(
      "/test-project/next.config.js",
      expect.stringContaining("withNextra"),
    );

    // Check the content of the config file
    const writeFileCalls = (fs.writeFileSync as jest.Mock).mock.calls;
    const nextConfigCall = writeFileCalls.find(
      (call) =>
        typeof call[0] === "string" && call[0].includes("next.config.js"),
    );

    if (nextConfigCall) {
      const configContent = nextConfigCall[1];
      expect(configContent).toContain("const nextra = require('nextra')");
      expect(configContent).toContain("defaultShowCopyCode: true");
      expect(configContent).toContain("theme: 'nextra-theme-docs'");
      expect(configContent).toContain("reactStrictMode: true");
    }

    // Verify message
    expect(messages).toContain("Created/updated next.config.js");
  });

  test("uses next.config.mjs if it exists", () => {
    // Mock fs.existsSync to return true for next.config.mjs
    (fs.existsSync as jest.Mock).mockImplementation((filePath: string) => {
      return filePath.includes("next.config.mjs");
    });

    // Run the function
    const messages = updateNextConfig("/test-project");

    // Verify next.config.mjs was updated
    expect(fs.writeFileSync).toHaveBeenCalledWith(
      "/test-project/next.config.mjs",
      expect.stringContaining("withNextra"),
    );

    // Verify message
    expect(messages).toContain("Created/updated next.config.mjs");
  });
});
