import { startMcpServer } from "./server.js";
import { DEFAULT_MCP_PORT } from "./constants.js";

declare const process: NodeJS.Process;

const args = process.argv.slice(2);
const stdio = args.includes("--stdio");
const portIndex = args.indexOf("--port");
const portArg = portIndex !== -1 ? args[portIndex + 1] : undefined;
const port = portArg ? Number.parseInt(portArg, 10) : DEFAULT_MCP_PORT;

await startMcpServer({ port, stdio }).catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
