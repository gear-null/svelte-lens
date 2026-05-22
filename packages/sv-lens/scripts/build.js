import { cpSync, existsSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const aliasRoot = resolve(here, "..");
const sourceRoot = resolve(here, "../../svelte-lens");
const sourceDist = resolve(sourceRoot, "dist");
const aliasDist = resolve(aliasRoot, "dist");

if (!existsSync(sourceDist)) {
  console.error(
    `svelte-lens dist not found at ${sourceDist}. Run 'pnpm --filter svelte-lens build' first.`,
  );
  process.exit(1);
}

if (existsSync(aliasDist)) rmSync(aliasDist, { recursive: true });
cpSync(sourceDist, aliasDist, { recursive: true });

const sourcePackageJson = JSON.parse(readFileSync(resolve(sourceRoot, "package.json"), "utf8"));
const aliasPackageJsonPath = resolve(aliasRoot, "package.json");
const aliasPackageJson = JSON.parse(readFileSync(aliasPackageJsonPath, "utf8"));

aliasPackageJson.version = sourcePackageJson.version;

writeFileSync(aliasPackageJsonPath, `${JSON.stringify(aliasPackageJson, null, 2)}\n`);

console.log(`sv-lens: copied dist (${sourcePackageJson.version})`);
