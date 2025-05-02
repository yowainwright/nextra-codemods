import { setupTailwind } from "../src/fixes/fix-tailwind";
import * as fs from "fs";
import * as path from "path";

// Mock fs and path modules
jest.mock("fs");
jest.mock("path");

describe("fix-tailwind", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Setup default mocks
    (fs.writeFileSync as jest.Mock).mockReturnValue(undefined);
    (path.join as jest.Mock).mockImplementation((...args) => args.join("/"));
  });

  test("creates tailwind.config.js with correct content", () => {
    // Run the function
    const messages = setupTailwind("/test-project");

    // Verify tailwind.config.js was created
    expect(fs.writeFileSync).toHaveBeenCalledWith(
      "/test-project/tailwind.config.js",
      expect.stringContaining("content:"),
    );

    // Check the content of the config file
    const writeFileCalls = (fs.writeFileSync as jest.Mock).mock.calls;
    const tailwindConfigCall = writeFileCalls.find(
      (call) =>
        typeof call[0] === "string" && call[0].includes("tailwind.config.js"),
    );

    if (tailwindConfigCall) {
      const configContent = tailwindConfigCall[1];
      expect(configContent).toContain("./app/**/*.{js,jsx,ts,tsx,md,mdx}");
      expect(configContent).toContain("./pages/**/*.{js,jsx,ts,tsx,md,mdx}");
      expect(configContent).toContain("./theme.config.jsx");
      expect(configContent).toContain("./mdx-components.tsx");
    }

    // Verify message
    expect(messages).toContain("Created tailwind.config.js");
  });

  test("creates postcss.config.js with correct plugins", () => {
    // Run the function
    const messages = setupTailwind("/test-project");

    // Verify postcss.config.js was created
    expect(fs.writeFileSync).toHaveBeenCalledWith(
      "/test-project/postcss.config.js",
      expect.stringContaining("plugins:"),
    );

    // Check the content of the config file
    const writeFileCalls = (fs.writeFileSync as jest.Mock).mock.calls;
    const postcssConfigCall = writeFileCalls.find(
      (call) =>
        typeof call[0] === "string" && call[0].includes("postcss.config.js"),
    );

    if (postcssConfigCall) {
      const configContent = postcssConfigCall[1];
      expect(configContent).toContain("tailwindcss");
      expect(configContent).toContain("autoprefixer");
    }

    // Verify message
    expect(messages).toContain("Created postcss.config.js");
  });

  test("returns correct messages", () => {
    // Run the function
    const messages = setupTailwind("/test-project");

    // Verify messages
    expect(messages).toHaveLength(2);
    expect(messages).toContain("Created tailwind.config.js");
    expect(messages).toContain("Created postcss.config.js");
  });
});
