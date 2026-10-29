import { spawnSync } from "node:child_process";
import {
  mkdirSync,
  writeFileSync,
  rmSync,
  renameSync,
  existsSync,
} from "node:fs";
import { resolve, dirname, join } from "node:path";
import { randomUUID } from "node:crypto";
import { executavelMySQL } from "./mysql-local.js";
const target = resolve(
  process.argv[2] ||
    `backups/finstart-${new Date().toISOString().replace(/[:.]/g, "-")}.sql`,
);
if (existsSync(target))
  throw Error(
    "O destino já existe. Escolha outro nome para preservar o backup anterior.",
  );
mkdirSync(dirname(target), { recursive: true });
const config = join(dirname(target), `.mysql-backup-${randomUUID()}.cnf`),
  temporary = target + ".partial";
const quote = (v) =>
  '"' +
  String(v || "")
    .replace(/\\/g, "\\\\")
    .replace(/"/g, '\\"')
    .replace(/\n/g, "\\n")
    .replace(/\r/g, "\\r") +
  '"';
try {
  writeFileSync(
    config,
    "[client]\n" +
      [
        ["host", process.env.DB_HOST],
        ["port", process.env.DB_PORT || 3306],
        ["user", process.env.DB_USER],
        ["password", process.env.DB_PASSWORD],
      ]
        .map(([k, v]) => `${k}=${quote(v)}`)
        .join("\n"),
    { mode: 0o600 },
  );
  const result = spawnSync(
    join(dirname(executavelMySQL()), "mysqldump.exe"),
    [
      `--defaults-extra-file=${config}`,
      "--single-transaction",
      "--no-tablespaces",
      "--set-gtid-purged=OFF",
      `--result-file=${temporary}`,
      process.env.DB_NAME || "finstart",
    ],
    { windowsHide: true, encoding: "utf8", timeout: 120000 },
  );
  if (result.status !== 0)
    throw Error(
      "Falha no backup MySQL: " + (result.error?.message || result.stderr),
    );
  renameSync(temporary, target);
  console.log("Backup MySQL criado: " + target);
} finally {
  rmSync(config, { force: true });
  rmSync(temporary, { force: true });
}
