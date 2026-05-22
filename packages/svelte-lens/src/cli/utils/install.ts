import { spawn } from "node:child_process";
import type { PackageManager } from "./detect.js";

const COMMAND_BY_PACKAGE_MANAGER: Record<PackageManager, [string, string[]]> = {
  npm: ["npm", ["install", "--save-dev"]],
  pnpm: ["pnpm", ["add", "-D"]],
  yarn: ["yarn", ["add", "-D"]],
  bun: ["bun", ["add", "-d"]],
};

export const installPackages = async (
  packageNames: string[],
  packageManager: PackageManager,
  cwd: string,
): Promise<void> => {
  const [command, baseArgs] = COMMAND_BY_PACKAGE_MANAGER[packageManager];
  const args = [...baseArgs, ...packageNames];
  await new Promise<void>((resolveInstall, rejectInstall) => {
    const child = spawn(command, args, { cwd, stdio: "inherit", shell: false });
    child.on("error", rejectInstall);
    child.on("exit", (code) => {
      if (code === 0) resolveInstall();
      else rejectInstall(new Error(`${command} ${args.join(" ")} failed (exit ${code})`));
    });
  });
};
