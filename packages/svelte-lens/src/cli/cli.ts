import { Command } from "commander";
import { init } from "./commands/init.js";

declare const process: NodeJS.Process;

const VERSION = process.env.SVELTE_LENS_CLI_VERSION ?? "0.0.0";

process.on("SIGINT", () => process.exit(0));
process.on("SIGTERM", () => process.exit(0));

const program = new Command()
  .name("svelte-lens")
  .description("install svelte-lens into your Svelte project")
  .version(VERSION, "-v, --version", "display the version number");

program.addCommand(init);

await program.parseAsync().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
