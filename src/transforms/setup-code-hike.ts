import { FileInfo, API, Options } from "jscodeshift";
import fs from "fs";
import path from "path";

export default function transformer(
  file: FileInfo,
  api: API,
  options: Options,
): string {
  const j = api.jscodeshift;
  const root = j(file.source);
  const projectRoot = options.projectRoot || process.cwd();

  // Handle different file types
  if (file.path.includes("package.json")) {
    // Update package.json
    try {
      const packageJson = JSON.parse(file.source);

      if (!packageJson.dependencies) {
        packageJson.dependencies = {};
      }

      // Add Code Hike dependency if not present
      if (!packageJson.dependencies["@code-hike/mdx"]) {
        packageJson.dependencies["@code-hike/mdx"] = "^0.9.0";
        console.log("Added @code-hike/mdx dependency to package.json");
      }

      return JSON.stringify(packageJson, null, 2);
    } catch (error) {
      console.error("Error updating package.json:", error);
      return file.source;
    }
  } else if (file.path.includes("next.config")) {
    // Update Next.js config
    const isEsm = file.path.endsWith(".mjs");

    if (isEsm) {
      // Handle ESM config
      const importDeclarations = root.find(j.ImportDeclaration);
      const hasCodeHikeImport = importDeclarations.some(
        (path) => path.node.source.value === "@code-hike/mdx/components",
      );

      if (!hasCodeHikeImport) {
        // Add Code Hike import
        root
          .get()
          .node.program.body.unshift(
            j.importDeclaration(
              [j.importSpecifier(j.identifier("CH"))],
              j.literal("@code-hike/mdx/components"),
            ),
          );
      }

      // Find nextra configuration
      const nextraCall = root.find(j.CallExpression, {
        callee: { name: "nextra" },
      });

      if (nextraCall.length > 0) {
        const nextraConfig = nextraCall.get(0).node.arguments[0];

        // Add mdxOptions if not present
        if (nextraConfig.type === "ObjectExpression") {
          const mdxOptionsProperty = nextraConfig.properties.find(
            (prop: any) => prop.key && prop.key.name === "mdxOptions",
          );

          if (!mdxOptionsProperty) {
            nextraConfig.properties.push(
              j.property(
                "init",
                j.identifier("mdxOptions"),
                j.objectExpression([
                  j.property(
                    "init",
                    j.identifier("remarkPlugins"),
                    j.arrayExpression([]),
                  ),
                  j.property(
                    "init",
                    j.identifier("rehypePlugins"),
                    j.arrayExpression([]),
                  ),
                ]),
              ),
            );
          }
        }
      }
    } else {
      // Handle CJS config
      const requireStatements = root
        .find(j.VariableDeclaration)
        .filter((path) => {
          return path.node.declarations.some(
            (decl) =>
              decl.init &&
              decl.init.type === "CallExpression" &&
              decl.init.callee &&
              decl.init.callee.name === "require",
          );
        });

      const hasCodeHikeRequire = requireStatements.some((path) => {
        return path.node.declarations.some(
          (decl) =>
            decl.init &&
            decl.init.type === "CallExpression" &&
            decl.init.callee &&
            decl.init.callee.name === "require" &&
            decl.init.arguments[0].value === "@code-hike/mdx/components",
        );
      });

      if (!hasCodeHikeRequire) {
        // Add Code Hike require
        root
          .get()
          .node.program.body.unshift(
            j.variableDeclaration("const", [
              j.variableDeclarator(
                j.objectPattern([
                  j.property("init", j.identifier("CH"), j.identifier("CH")),
                ]),
                j.callExpression(j.identifier("require"), [
                  j.literal("@code-hike/mdx/components"),
                ]),
              ),
            ]),
          );
      }

      // Find nextra configuration
      const nextraCall = root.find(j.CallExpression, {
        callee: { name: "nextra" },
      });

      if (nextraCall.length > 0) {
        const nextraConfig = nextraCall.get(0).node.arguments[0];

        // Add mdxOptions if not present
        if (nextraConfig.type === "ObjectExpression") {
          const mdxOptionsProperty = nextraConfig.properties.find(
            (prop: any) => prop.key && prop.key.name === "mdxOptions",
          );

          if (!mdxOptionsProperty) {
            nextraConfig.properties.push(
              j.property(
                "init",
                j.identifier("mdxOptions"),
                j.objectExpression([
                  j.property(
                    "init",
                    j.identifier("remarkPlugins"),
                    j.arrayExpression([]),
                  ),
                  j.property(
                    "init",
                    j.identifier("rehypePlugins"),
                    j.arrayExpression([]),
                  ),
                ]),
              ),
            );
          }
        }
      }
    }

    return root.toSource();
  } else if (file.path.includes("mdx-components")) {
    // Update mdx-components.tsx/jsx
    const importDeclarations = root.find(j.ImportDeclaration);

    // Check if CH is already imported
    const hasCodeHikeImport = importDeclarations.some(
      (path) => path.node.source.value === "@code-hike/mdx/components",
    );

    if (!hasCodeHikeImport) {
      // Add Code Hike import
      root
        .get()
        .node.program.body.unshift(
          j.importDeclaration(
            [j.importSpecifier(j.identifier("CH"))],
            j.literal("@code-hike/mdx/components"),
          ),
        );
    }

    // Find useMDXComponents function
    const useMDXComponentsFunction = root.find(j.FunctionDeclaration, {
      id: { name: "useMDXComponents" },
    });

    if (useMDXComponentsFunction.length > 0) {
      // Find the return statement
      const returnStatement = useMDXComponentsFunction.find(j.ReturnStatement);

      if (returnStatement.length > 0) {
        const returnObject = returnStatement.get(0).node.argument;

        if (returnObject.type === "ObjectExpression") {
          // Check if CH is already in the return object
          const hasCHProperty = returnObject.properties.some(
            (prop: any) => prop.key && prop.key.name === "CH",
          );

          if (!hasCHProperty) {
            // Add CH to the return object
            returnObject.properties.push(
              j.property("init", j.identifier("CH"), j.identifier("CH")),
            );
          }
        }
      }
    }

    return root.toSource();
  } else if (file.path.includes("globals.css")) {
    // Update globals.css
    if (!file.source.includes("@code-hike/mdx/styles.css")) {
      return `@import '@code-hike/mdx/styles.css';\n${file.source}`;
    }
  }

  return file.source;
}

// Helper function to create example files
function createExampleFiles(projectRoot: string) {
  const examplesDir = path.join(projectRoot, "app", "examples");
  if (!fs.existsSync(examplesDir)) {
    fs.mkdirSync(examplesDir, { recursive: true });
  }

  const codeHikeExamplePath = path.join(examplesDir, "code-hike.mdx");
  const codeHikeExampleContent = `# Code Hike Example

Here's an example of using Code Hike with Nextra v4:

<CH.Code>
\`\`\`js
function hello() {
  console.log("Hello, world!");
  return "Hello, world!";
}

hello();
\`\`\`
</CH.Code>

## Code Spotlight

<CH.Spotlight>
\`\`\`js
function add(a, b) {
  return a + b;
}

function subtract(a, b) {
  return a - b;
}

function multiply(a, b) {
  return a * b;
}

function divide(a, b) {
  if (b === 0) {
    throw new Error("Division by zero");
  }
  return a / b;
}
\`\`\`

<CH.Focus lines="4-6" />
This function subtracts \`b\` from \`a\` and returns the result.

<CH.Focus lines="8-10" />
This function multiplies \`a\` and \`b\` and returns the product.

<CH.Focus lines="12-17" />
This function divides \`a\` by \`b\` but first checks if \`b\` is zero to avoid division by zero errors.
</CH.Spotlight>
`;

  if (!fs.existsSync(codeHikeExamplePath)) {
    fs.writeFileSync(codeHikeExamplePath, codeHikeExampleContent);
    console.log(`Created Code Hike example at ${codeHikeExamplePath}`);
  }

  // Update _meta.js to include the Code Hike example
  const metaPath = path.join(projectRoot, "app", "_meta.js");
  if (fs.existsSync(metaPath)) {
    let metaContent = fs.readFileSync(metaPath, "utf8");

    // Check if examples section exists and if code-hike is already included
    if (
      metaContent.includes("examples:") &&
      !metaContent.includes("code-hike")
    ) {
      // Add code-hike to examples
      metaContent = metaContent.replace(
        /examples:\s*{([^}]*)}/,
        (match, p1) => `examples: {${p1}  'code-hike': 'Code Hike',\n}`,
      );

      fs.writeFileSync(metaPath, metaContent);
      console.log(`Updated _meta.js to include Code Hike example`);
    }
  }
}

// Run this function if this script is executed directly
if (require.main === module) {
  const projectRoot = process.cwd();
  createExampleFiles(projectRoot);
}
