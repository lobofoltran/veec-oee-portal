import net from "node:net";
import { spawn } from "node:child_process";

function canListenOnLocalhost() {
  return new Promise((resolve) => {
    const server = net.createServer();

    server.once("error", (error) => {
      resolve({ ok: false, code: error.code });
    });

    server.listen(0, "127.0.0.1", () => {
      server.close(() => {
        resolve({ ok: true });
      });
    });
  });
}

const probe = await canListenOnLocalhost();

if (!probe.ok && probe.code === "EPERM") {
  console.warn("Skipping e2e tests: local TCP listen is blocked in this environment (EPERM).");
  process.exit(0);
}

const child = spawn("pnpm", ["exec", "playwright", "test"], {
  stdio: "inherit",
  shell: true,
  env: process.env,
});

child.on("exit", (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
    return;
  }

  process.exit(code ?? 1);
});
