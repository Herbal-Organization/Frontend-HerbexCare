#!/usr/bin/env node

import fs from "fs";
import path from "path";

const SRC_PATH = "src";

// Walk through all files
function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach((file) => {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      walkDir(fullPath, callback);
    } else if (file.endsWith(".js") || file.endsWith(".jsx")) {
      callback(fullPath);
    }
  });
}

function convertRelativeToAlias(importPath, filePath) {
  // Resolve the relative path to an absolute path within src
  const fileDir = path.dirname(filePath);
  const resolvedPath = path.resolve(fileDir, importPath);
  const relativeSrcPath = path
    .relative(SRC_PATH, resolvedPath)
    .replace(/\\/g, "/");

  // Remove .jsx or .js extension if present
  let cleanPath = relativeSrcPath.replace(/\.(jsx?|ts|tsx)$/, "");

  // Map paths to aliases
  if (cleanPath.startsWith("features/"))
    return "@features/" + cleanPath.replace("features/", "");
  if (cleanPath.startsWith("components/"))
    return "@components/" + cleanPath.replace("components/", "");
  if (cleanPath.startsWith("hooks/"))
    return "@hooks/" + cleanPath.replace("hooks/", "");
  if (cleanPath.startsWith("services/"))
    return "@services/" + cleanPath.replace("services/", "");
  if (cleanPath.startsWith("utils/"))
    return "@utils/" + cleanPath.replace("utils/", "");
  if (cleanPath.startsWith("api/"))
    return "@api/" + cleanPath.replace("api/", "");
  if (cleanPath.startsWith("context/"))
    return "@context/" + cleanPath.replace("context/", "");
  if (cleanPath.startsWith("i18n/"))
    return "@i18n/" + cleanPath.replace("i18n/", "");
  if (cleanPath.startsWith("config/"))
    return "@config/" + cleanPath.replace("config/", "");
  if (cleanPath.startsWith("types/"))
    return "@types/" + cleanPath.replace("types/", "");
  if (cleanPath.startsWith("assets/"))
    return "@assets/" + cleanPath.replace("assets/", "");

  return null;
}

walkDir(SRC_PATH, (filePath) => {
  let content = fs.readFileSync(filePath, "utf8");
  let modified = false;

  // Match all import/export statements with relative paths
  const importRegex = /(from\s+['"])([./][^'"]*)(["'])/g;

  content = content.replace(
    importRegex,
    (match, prefix, importPath, suffix) => {
      // Skip if already using an alias
      if (importPath.startsWith("@")) {
        return match;
      }

      try {
        const alias = convertRelativeToAlias(importPath, filePath);
        if (alias) {
          modified = true;
          return `${prefix}${alias}${suffix}`;
        }
      } catch (e) {
        console.warn(
          `Error resolving ${importPath} in ${filePath}:`,
          e.message,
        );
      }

      return match;
    },
  );

  if (modified) {
    fs.writeFileSync(filePath, content, "utf8");
    console.log(`✓ Updated: ${filePath}`);
  }
});

console.log("\n✅ Relative imports converted to aliases!");
