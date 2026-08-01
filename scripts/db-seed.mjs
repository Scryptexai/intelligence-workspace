// Helper: npx tsx src/db/seed.ts dengan env dari .env
import { loadEnvFile } from "node:process";
try { loadEnvFile(".env"); } catch {}
const { spawn } = await import("node:child_process");
const p = spawn("npx", ["tsx", "src/db/seed.ts"], { stdio: "inherit", env: process.env });
p.on("exit", (c) => process.exit(c ?? 1));
