#!/usr/bin/env node

import fg from "fast-glob";
import fs from "fs";
import path from "path";
import YAML from "yaml";
import { z } from "zod";

(async () => {
  const configFilePath = findFile("symlinks.yml");
  const rootPath = path.dirname(configFilePath);
  const configSchema = z.record(z.union([z.string(), z.array(z.string())]));
  const config = configSchema.parse(
    YAML.parse(fs.readFileSync(configFilePath, "utf8"))
  );

  for (const [source, destinations] of Object.entries(config).map(
    ([source, destinations]) =>
      [
        source,
        Array.isArray(destinations) ? destinations : [destinations],
      ] as const
  )) {
    const sourceFilePath = path.join(rootPath, source.replace(/^\//, ""));
    if (!fs.existsSync(sourceFilePath)) {
      console.warn(`Source path "${source}" does not exist. Skipping...`);
      continue;
    }
    for (const destination of destinations) {
      const destinationGlobPath = destination.replace(/^\//, "");
      const isDestinationDynamic = fg.isDynamicPattern(destination);
      if (!isDestinationDynamic) {
        fs.mkdirSync(path.dirname(destinationGlobPath), { recursive: true });
      }
      const destinationFilePaths = await fg(path.dirname(destinationGlobPath), {
        cwd: rootPath,
        absolute: true,
        onlyDirectories: true
      }).then(paths => paths.map(x => path.join(x, path.basename(destinationGlobPath))));
      console.log(
        `Symlinking ${source} to ${destinationFilePaths.length} destination${
          destinationFilePaths.length === 1 ? "" : "s"
        }:`,
        destinationFilePaths
      );
      for (let destinationFilePath of destinationFilePaths) {
        fs.mkdirSync(path.dirname(destinationFilePath), { recursive: true });
        try {
          if (fs.lstatSync(destinationFilePath).isSymbolicLink()) {
            fs.unlinkSync(destinationFilePath);
          } else if (fs.existsSync(destinationFilePath)) {
            fs.rmSync(destinationFilePath, { recursive: true });
          }
        } catch {}
        fs.symlinkSync(sourceFilePath, destinationFilePath);
      }
    }
  }
})();

/**
 * Recursively searches for a file in the specified directory and its parent directories.
 * @param filePath - The path of the file to find.
 * @param directory - The directory to start the search from. Defaults to the current directory (__dirname).
 * @param count - The number of directories traversed. Defaults to 0.
 * @returns The absolute path of the found file.
 * @throws Error if the file is not found and the parent directory is "rxnt-pdf-api".
 */
function findFile(filePath: string, directory = __dirname, count = 0): string {
  const parentDir = path.join(directory, "..");
  const current = path.join(directory, filePath);
  if (fs.existsSync(current)) {
    return current;
  }
  if (parentDir === directory) {
    throw new Error(`Could not find file ${filePath}`);
  }
  return findFile(filePath, parentDir, count + 1);
}