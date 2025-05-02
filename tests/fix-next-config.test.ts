import { updateNextConfig } from "../src/fixes/fix-next-config";
import transform from "../src/transforms/update-next-config";
import jscodeshift from "jscodeshift";
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
    (fs.copyFileSync as jest.Mock).mockReturnValue(undefined);
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

describe("update-next-config transform", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (fs.copyFileSync as jest.Mock).mockReturnValue(undefined);
  });

  test("transforms CommonJS next.config.js correctly", () => {
    // Sample next.config.js content
    const input = `
const withMDX = require('@next/mdx')();

module.exports = withMDX({
  pageExtensions: ['js', 'jsx', 'md', 'mdx'],
  reactStrictMode: true
});
    `;

    // Run the transform
    const output = transform(
      { path: "next.config.js", source: input },
      { jscodeshift, j: jscodeshift, stats: () => {}, report: () => {} },
      {},
    );

    // Verify the output contains nextra and withNextra
    expect(output).toMatch(/const nextra = require\(['"]nextra['"]\)/);
    expect(output).toContain("const withNextra = nextra(");
    expect(output).toContain("defaultShowCopyCode: true");
    expect(output).toContain("module.exports = withNextra(");
    // Verify it preserves the original config options
    expect(output).toContain("pageExtensions: ['js', 'jsx', 'md', 'mdx']");
    expect(output).toContain("reactStrictMode: true");
  });

  test("transforms ESM next.config.mjs correctly", () => {
    // Sample next.config.mjs content
    const input = `
import withMDX from '@next/mdx';

const mdxConfig = withMDX();

export default mdxConfig({
  pageExtensions: ['js', 'jsx', 'md', 'mdx'],
  reactStrictMode: true
});
    `;

    // Run the transform
    const output = transform(
      { path: "next.config.mjs", source: input },
      { jscodeshift, j: jscodeshift, stats: () => {}, report: () => {} },
      {},
    );

    // Verify the output contains nextra and withNextra
    expect(output).toMatch(/import nextra from ['"]nextra['"]/);
    expect(output).toContain("const withNextra = nextra(");
    expect(output).toContain("defaultShowCopyCode: true");
    expect(output).toContain("export default withNextra(");
    // Verify it preserves the original config options
    expect(output).toContain("pageExtensions: ['js', 'jsx', 'md', 'mdx']");
    expect(output).toContain("reactStrictMode: true");
  });

  test("handles existing withNextra configuration", () => {
    // Sample next.config.js with existing withNextra
    const input = `
const nextra = require('nextra');

const withNextra = nextra({
  theme: 'nextra-theme-docs',
  themeConfig: './theme.config.js',
  flexsearch: true
});

module.exports = withNextra({
  reactStrictMode: true
});
    `;

    // Run the transform
    const output = transform(
      { path: "next.config.js", source: input },
      { jscodeshift, j: jscodeshift, stats: () => {}, report: () => {} },
      {},
    );

    // Verify the output updates the withNextra config
    expect(output).toMatch(/const nextra = require\(['"]nextra['"]\)/);
    expect(output).toContain("const withNextra = nextra(");
    expect(output).toContain("defaultShowCopyCode: true");
    // Verify it removes the old options
    expect(output).not.toContain("theme: 'nextra-theme-docs'");
    expect(output).not.toContain("themeConfig: './theme.config.js'");
    expect(output).not.toContain("flexsearch: true");
    // Verify it preserves the original module.exports
    expect(output).toContain("module.exports = withNextra({");
    expect(output).toContain("reactStrictMode: true");
  });
});
