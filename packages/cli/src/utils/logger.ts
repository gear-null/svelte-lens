import pc from "picocolors";

export const logger = {
  log: (message: string) => console.log(message),
  info: (message: string) => console.log(`${pc.blue("info")}  ${message}`),
  warn: (message: string) => console.log(`${pc.yellow("warn")}  ${message}`),
  error: (message: string) => console.error(`${pc.red("error")} ${message}`),
  success: (message: string) => console.log(`${pc.green("ok")}    ${message}`),
  break: () => console.log(""),
};

export const colors = {
  info: pc.cyan,
  dim: pc.dim,
  bold: pc.bold,
  highlight: pc.cyan,
  success: pc.green,
  warn: pc.yellow,
  error: pc.red,
};
