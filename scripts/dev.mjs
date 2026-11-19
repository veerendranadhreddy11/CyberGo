import { spawn } from "node:child_process";
import { createRequire } from "node:module";
import { parseArgs } from "node:util";

const require = createRequire(import.meta.url);
const { values } = parseArgs({
  options: {
    host: { type: "string" },
    hostname: { type: "string" },
    port: { type: "string", short: "p" },
    strictPort: { type: "boolean" },
    webpack: { type: "boolean" },
  }
});
const args = ["dev"];
const host = values.host ?? values.hostname;
if (host) args.push("--hostname", host);
if (values.port) args.push("--port", values.port);
if (values.webpack) args.push("--webpack");
const child = spawn(process.execPath, [require.resolve("next/dist/bin/next"), ...args], { stdio: "inherit" });
for (const signal of ["SIGINT", "SIGTERM"]) {
  process.once(signal, () => child.kill(signal));
}
child.on("exit", (code) => { process.exitCode = code ?? 1; });
