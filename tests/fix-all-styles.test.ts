import { setupTailwindCSS } from "../src/fixes/fix-all-styles";
import * as fs from "fs";
import * as path from "path";

jest.mock("fs");
jest.mock("path");

describe("fix-all-styles", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    (fs.existsSync as jest.Mock).mockReturnValue(true);
    (fs.writeFileSync as jest.Mock).mockReturnValue(undefined);
    (fs.readFileSync as jest.Mock).mockReturnValue("{}");

    (path.join as jest.Mock).mockImplementation((...args) => args.join("/"));
  });

  test("creates tailwind.config.js and postcss.config.js", () => {
    const messages = setupTailwindCSS("/test-project");

    expect(fs.writeFileSync).toHaveBeenCalledWith(
      "/test-project/tailwind.config.js",
      expect.stringContaining("content:"),
    );

    expect(fs.writeFileSync).toHaveBeenCalledWith(
      "/test-project/postcss.config.js",
      expect.stringContaining("tailwindcss"),
    );

    expect(messages).toContain("Created tailwind.config.js");
    expect(messages).toContain("Created postcss.config.js");
  });

  test("creates globals.css if app directory exists", () => {
    const messages = setupTailwindCSS("/test-project");

    expect(fs.writeFileSync).toHaveBeenCalledWith(
      "/test-project/app/globals.css",
      expect.stringContaining("@tailwind"),
    );

    expect(messages).toContain("Created/updated app/globals.css");
  });

  test("updates package.json with Tailwind dependencies", () => {
    (fs.readFileSync as jest.Mock).mockReturnValue(
      JSON.stringify({
        name: "test-project",
        dependencies: {
          next: "^13.0.0",
        },
      }),
    );

    const messages = setupTailwindCSS("/test-project");

    expect(fs.writeFileSync).toHaveBeenCalledWith(
      "/test-project/package.json",
      expect.stringContaining("tailwindcss"),
    );

    const writeFileCalls = (fs.writeFileSync as jest.Mock).mock.calls;
    const packageJsonCall = writeFileCalls.find(
      (call) => typeof call[0] === "string" && call[0].includes("package.json"),
    );

    if (packageJsonCall) {
      const updatedPackageJson = JSON.parse(packageJsonCall[1]);
      expect(updatedPackageJson.devDependencies.tailwindcss).toBe("^3.3.0");
      expect(updatedPackageJson.devDependencies.postcss).toBe("^8.4.31");
      expect(updatedPackageJson.devDependencies.autoprefixer).toBe("^10.4.16");
    }

    expect(messages).toContain(
      "Updated package.json with Tailwind CSS dependencies",
    );
  });

  test("skips package.json update if dependencies already exist", () => {
    (fs.readFileSync as jest.Mock).mockReturnValue(
      JSON.stringify({
        name: "test-project",
        devDependencies: {
          tailwindcss: "^3.3.0",
          postcss: "^8.4.31",
          autoprefixer: "^10.4.16",
        },
      }),
    );

    const messages = setupTailwindCSS("/test-project");

    const writeFileCalls = (fs.writeFileSync as jest.Mock).mock.calls;
    const packageJsonCall = writeFileCalls.find(
      (call) => typeof call[0] === "string" && call[0].includes("package.json"),
    );

    expect(packageJsonCall).toBeUndefined();

    expect(messages).not.toContain(
      "Updated package.json with Tailwind CSS dependencies",
    );
  });

  test("handles errors gracefully", () => {
    (fs.readFileSync as jest.Mock).mockImplementation(() => {
      throw new Error("Test error");
    });

    const messages = setupTailwindCSS("/test-project");

    expect(messages).toContain("Error updating package.json: Test error");
  });
});
