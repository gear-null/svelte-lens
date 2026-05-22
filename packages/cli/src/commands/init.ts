import { existsSync, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { Command } from "commander";
import prompts from "prompts";
import { detectProject } from "../utils/detect.js";
import { applyTransform, previewTransform } from "../utils/transform.js";
import { installPackages } from "../utils/install.js";
import { logger, colors } from "../utils/logger.js";

const FRAMEWORK_LABELS = {
  sveltekit: "SvelteKit",
  "vite-svelte": "Vite + Svelte",
  unknown: "Unknown",
} as const;

export const init = new Command("init")
  .description("install svelte-lens into your project")
  .option("-y, --yes", "skip confirmation prompts", false)
  .option("-f, --force", "overwrite existing config", false)
  .option("--skip-install", "skip package installation", false)
  .option("-c, --cwd <cwd>", "working directory", process.cwd())
  .action(async (opts) => {
    const cwd = resolve(opts.cwd);

    if (!existsSync(cwd)) {
      logger.error(`Directory does not exist: ${cwd}`);
      process.exit(1);
    }

    const project = await detectProject(cwd);

    logger.log(`${colors.bold("svelte-lens init")}`);
    logger.break();
    logger.log(`  framework      ${colors.info(FRAMEWORK_LABELS[project.framework])}`);
    logger.log(`  package mgr    ${colors.info(project.packageManager)}`);
    logger.log(`  monorepo       ${project.isMonorepo ? "yes" : "no"}`);
    logger.break();

    if (project.framework === "unknown") {
      logger.error(
        "Could not detect a SvelteKit or Vite + Svelte project. svelte-lens requires either.",
      );
      process.exit(1);
    }

    if (project.hasSvelteLens && !opts.force) {
      logger.success("svelte-lens is already installed.");
      logger.log("Re-run with --force to reapply.");
      process.exit(0);
    }

    const result = previewTransform(project.projectRoot, project.framework, opts.force);
    if (!result.success) {
      logger.error(result.message);
      process.exit(1);
    }

    if (result.noChanges) {
      logger.success(result.message);
    } else {
      logger.info(result.message);
      logger.log(`  file: ${colors.dim(result.filePath)}`);
      logger.break();
    }

    if (!opts.yes && !result.noChanges) {
      const { proceed } = await prompts({
        type: "confirm",
        name: "proceed",
        message: "Apply these changes?",
        initial: true,
      });
      if (!proceed) {
        logger.log("Cancelled.");
        process.exit(0);
      }
    }

    if (!opts.skipInstall && !project.hasSvelteLens) {
      logger.info("Installing svelte-lens as dev dependency...");
      await installPackages(["svelte-lens"], project.packageManager, project.projectRoot);
    }

    if (!result.noChanges && result.newContent) {
      mkdirSync(dirname(result.filePath), { recursive: true });
      applyTransform(result);
    }

    logger.break();
    logger.success("svelte-lens installed.");
    logger.log("Restart your dev server to load it.");
  });
