import transform from "../src/transforms/migrate-pages-to-app";
import jscodeshift from "jscodeshift";
import * as fs from "fs";
import * as path from "path";

// Mock fs and path modules
jest.mock("fs");
jest.mock("path");

describe("migrate-pages-to-app", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Setup default mocks
    (fs.existsSync as jest.Mock).mockReturnValue(false);
    (fs.mkdirSync as jest.Mock).mockReturnValue(undefined);
    (fs.writeFileSync as jest.Mock).mockReturnValue(undefined);
    (fs.readdirSync as jest.Mock).mockReturnValue([]);
    (fs.statSync as jest.Mock).mockReturnValue({ isDirectory: () => false });
    (fs.readFileSync as jest.Mock).mockReturnValue("");

    (path.join as jest.Mock).mockImplementation((...args) => args.join("/"));
  });

  test("skips if pages directory does not exist", () => {
    // Run the transform
    transform(
      { path: "some-file.js", source: "" },
      { jscodeshift, j: jscodeshift, stats: () => {}, report: () => {} },
      { projectRoot: "/app" },
    );

    // Verify no files were created
    expect(fs.writeFileSync).not.toHaveBeenCalled();
  });

  test("creates app directory with layout and meta files", () => {
    // Setup mocks for this test
    (fs.existsSync as jest.Mock).mockImplementation((path: string) => {
      return path.includes("pages");
    });

    // Run the transform
    transform(
      { path: "some-file.js", source: "" },
      { jscodeshift, j: jscodeshift, stats: () => {}, report: () => {} },
      { projectRoot: "/app" },
    );

    // Verify app directory was created
    expect(fs.mkdirSync).toHaveBeenCalledWith("/app/app", { recursive: true });

    // Verify layout.jsx was created
    expect(fs.writeFileSync).toHaveBeenCalledWith(
      "/app/app/layout.jsx",
      expect.stringContaining("DocsLayout"),
    );

    // Verify _meta.js was created
    expect(fs.writeFileSync).toHaveBeenCalledWith(
      "/app/app/_meta.js",
      expect.stringContaining("index"),
    );
  });
});
