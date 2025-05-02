import { FileInfo, API, Options, Collection, JSCodeshift } from "jscodeshift";
import fs from "fs";
import {
  VariableDeclaration,
  VariableDeclarator,
  Identifier,
  CallExpression,
  ExportDefaultDeclaration,
  AssignmentExpression,
  MemberExpression,
  ObjectExpression,
  Property,
  Literal,
  ImportDeclaration,
  ImportDefaultSpecifier,
  ExpressionStatement,
  Program,
} from "jscodeshift/src/core";

export default function transformer(
  file: FileInfo,
  api: API,
  _options: Options,
): string {
  const j: JSCodeshift = api.jscodeshift;
  const root: Collection<Program> = j(file.source);
  const isEsm: boolean = file.path.endsWith(".mjs");

  // Create backup of the original file
  const backupPath: string = `${file.path}.bak`;
  try {
    fs.copyFileSync(file.path, backupPath);
    console.log(`Backup created at ${backupPath}`);
  } catch (error) {
    console.error(`Failed to create backup: ${(error as Error).message}`);
  }

  // Find or create the Nextra configuration
  let nextraConfigFound: boolean = false;

  // Look for existing withNextra call
  root.find(j.VariableDeclaration).forEach((path) => {
    const declaration = path.node.declarations[0] as
      | VariableDeclarator
      | undefined;
    if (
      declaration &&
      declaration.id &&
      declaration.id.type === "Identifier" &&
      (declaration.id as Identifier).name === "withNextra" &&
      declaration.init
    ) {
      nextraConfigFound = true;

      // Update the Nextra config to v4 format
      if (declaration.init.type === "CallExpression") {
        const callExpr = declaration.init as CallExpression;
        const args = callExpr.arguments;
        if (args.length > 0) {
          // Replace the config object with v4 compatible options
          callExpr.arguments[0] = j.objectExpression([
            j.property(
              "init",
              j.identifier("defaultShowCopyCode"),
              j.literal(true),
            ),
          ]) as ObjectExpression;
        }
      }
    }
  });

  // If no withNextra found, we need to add it
  if (!nextraConfigFound) {
    // Find the module.exports or export default statement
    let exportsFound: boolean = false;

    if (isEsm) {
      // Handle ESM format
      root.find(j.ExportDefaultDeclaration).forEach((path) => {
        exportsFound = true;

        // Add the nextra import if it doesn't exist
        const importDecl: ImportDeclaration = j.importDeclaration(
          [
            j.importDefaultSpecifier(
              j.identifier("nextra"),
            ) as ImportDefaultSpecifier,
          ],
          j.literal("nextra") as Literal,
        );

        root.get().node.program.body.unshift(importDecl);

        // Create the withNextra declaration
        const withNextraDecl: VariableDeclaration = j.variableDeclaration(
          "const",
          [
            j.variableDeclarator(
              j.identifier("withNextra") as Identifier,
              j.callExpression(j.identifier("nextra") as Identifier, [
                j.objectExpression([
                  j.property(
                    "init",
                    j.identifier("defaultShowCopyCode"),
                    j.literal(true),
                  ) as Property,
                ]) as ObjectExpression,
              ]) as CallExpression,
            ) as VariableDeclarator,
          ],
        );

        // Insert it before the export
        j(path).insertBefore([withNextraDecl]);

        // Wrap the exported config with withNextra
        const originalConfig = path.node.declaration;
        path.node.declaration = j.callExpression(
          j.identifier("withNextra") as Identifier,
          [originalConfig as any],
        ) as CallExpression;
      });
    } else {
      // Handle CommonJS format
      root
        .find(j.AssignmentExpression, {
          left: {
            type: "MemberExpression",
            object: { type: "Identifier", name: "module" },
            property: { type: "Identifier", name: "exports" },
          },
        })
        .forEach((path) => {
          exportsFound = true;

          // Add the nextra require if it doesn't exist
          const requireDecl: VariableDeclaration = j.variableDeclaration(
            "const",
            [
              j.variableDeclarator(
                j.identifier("nextra") as Identifier,
                j.callExpression(j.identifier("require") as Identifier, [
                  j.literal("nextra") as Literal,
                ]) as CallExpression,
              ) as VariableDeclarator,
            ],
          );

          // Create the withNextra declaration
          const withNextraDecl: VariableDeclaration = j.variableDeclaration(
            "const",
            [
              j.variableDeclarator(
                j.identifier("withNextra") as Identifier,
                j.callExpression(j.identifier("nextra") as Identifier, [
                  j.objectExpression([
                    j.property(
                      "init",
                      j.identifier("defaultShowCopyCode"),
                      j.literal(true),
                    ) as Property,
                  ]) as ObjectExpression,
                ]) as CallExpression,
              ) as VariableDeclarator,
            ],
          );

          // Insert declarations at the beginning of the file
          root.get().node.program.body.unshift(withNextraDecl);
          root.get().node.program.body.unshift(requireDecl);

          // Wrap the exported config with withNextra
          const originalConfig = path.node.right;
          path.node.right = j.callExpression(
            j.identifier("withNextra") as Identifier,
            [originalConfig],
          ) as CallExpression;
        });
    }

    // If no exports found, create a basic config
    if (!exportsFound) {
      if (isEsm) {
        // Create a basic ESM config
        const importDecl: ImportDeclaration = j.importDeclaration(
          [
            j.importDefaultSpecifier(
              j.identifier("nextra"),
            ) as ImportDefaultSpecifier,
          ],
          j.literal("nextra") as Literal,
        );

        const withNextraDecl: VariableDeclaration = j.variableDeclaration(
          "const",
          [
            j.variableDeclarator(
              j.identifier("withNextra") as Identifier,
              j.callExpression(j.identifier("nextra") as Identifier, [
                j.objectExpression([
                  j.property(
                    "init",
                    j.identifier("defaultShowCopyCode"),
                    j.literal(true),
                  ) as Property,
                ]) as ObjectExpression,
              ]) as CallExpression,
            ) as VariableDeclarator,
          ],
        );

        const exportDecl: ExportDefaultDeclaration = j.exportDefaultDeclaration(
          j.callExpression(j.identifier("withNextra") as Identifier, [
            j.objectExpression([
              j.property(
                "init",
                j.identifier("reactStrictMode"),
                j.literal(true),
              ) as Property,
            ]) as ObjectExpression,
          ]) as CallExpression,
        );

        root.get().node.program.body = [importDecl, withNextraDecl, exportDecl];
      } else {
        // Create a basic CommonJS config
        const requireDecl: VariableDeclaration = j.variableDeclaration(
          "const",
          [
            j.variableDeclarator(
              j.identifier("nextra") as Identifier,
              j.callExpression(j.identifier("require") as Identifier, [
                j.literal("nextra") as Literal,
              ]) as CallExpression,
            ) as VariableDeclarator,
          ],
        );

        const withNextraDecl: VariableDeclaration = j.variableDeclaration(
          "const",
          [
            j.variableDeclarator(
              j.identifier("withNextra") as Identifier,
              j.callExpression(j.identifier("nextra") as Identifier, [
                j.objectExpression([
                  j.property(
                    "init",
                    j.identifier("defaultShowCopyCode"),
                    j.literal(true),
                  ) as Property,
                ]) as ObjectExpression,
              ]) as CallExpression,
            ) as VariableDeclarator,
          ],
        );

        const moduleExports: ExpressionStatement = j.expressionStatement(
          j.assignmentExpression(
            "=",
            j.memberExpression(
              j.identifier("module") as Identifier,
              j.identifier("exports") as Identifier,
            ) as MemberExpression,
            j.callExpression(j.identifier("withNextra") as Identifier, [
              j.objectExpression([
                j.property(
                  "init",
                  j.identifier("reactStrictMode"),
                  j.literal(true),
                ) as Property,
              ]) as ObjectExpression,
            ]) as CallExpression,
          ) as AssignmentExpression,
        );

        root.get().node.program.body = [
          requireDecl,
          withNextraDecl,
          moduleExports,
        ];
      }
    }
  }

  return root.toSource();
}
