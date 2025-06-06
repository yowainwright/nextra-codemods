import transform from "../src/transforms/migrate-meta-files";
import jscodeshift from "jscodeshift";

test("migrate-meta-files transforms _meta.js correctly", () => {
  // Sample _meta.js content
  const input = `
export default {
  index: 'Introduction',
  getting_started: 'Getting Started',
  advanced: {
    title: 'Advanced',
    display: 'hidden'
  }
}
  `;

  // Run the transform
  const output = transform(
    { path: "_meta.js", source: input },
    { jscodeshift, j: jscodeshift, stats: () => {}, report: () => {} },
    {},
  );

  // Verify the output contains the "use client" directive
  expect(output).toContain("use client");
  expect(output).toContain("export default {");
  expect(output).toContain("index: 'Introduction'");
});

test("migrate-meta-files skips non-_meta files", () => {
  const input = `
export default {
  someKey: 'someValue'
}
  `;

  // Run the transform on a non-_meta file
  const output = transform(
    { path: "some-other-file.js", source: input },
    { jscodeshift, j: jscodeshift, stats: () => {}, report: () => {} },
    {},
  );

  // Verify the output is unchanged
  expect(output).toBe(input);
});
