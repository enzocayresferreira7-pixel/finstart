import { spawn } from "node:child_process";
import {
  existsSync,
  mkdirSync,
  openSync,
  closeSync,
} from "node:fs";
import { resolve, join } from "node:path";
import { fileURLToPath } from "node:url";
import mysql from "mysql2/promise";
const root = fileURLToPath(new URL("../", import.meta.url));
export function executavelMySQL() {
  const exe =
    process.env.MYSQL_EXECUTABLE ||
    join(
      process.env.ProgramFiles || "C:/Program Files",
      "MySQL/MySQL Server 8.0/bin/mysqld.exe",
    );
  if (!existsSync(exe))
    throw Error(
      "MySQL Server não encontrado. Instale MySQL 8.0.16+ ou configure MYSQL_EXECUTABLE.",
    );
  return exe;
}
export async function iniciarMySQLLocal(config) {
  const datadir = resolve(root, "data/mysql");
  const options = {
    host: "127.0.0.1",
    port: config.port,
    user: config.user,
    password: config.password,
    connectTimeout: 1500,
  };
  async function conectado() {
    const conn = await mysql.createConnection(options);
    try {
      const [[row]] = await conn.query("SELECT @@datadir AS pasta");
      if (resolve(row.pasta).toLowerCase() !== datadir.toLowerCase())
        throw Error(
          "A porta pertence a outra instância MySQL. Confira DB_PORT.",
        );
    } finally {
      await conn.end();
    }
  }
  try {
    await conectado();
    return;
  } catch (error) {
    if (!["ECONNREFUSED", "ETIMEDOUT"].includes(error.code)) throw error;
  }
  mkdirSync(resolve(root, "data"), { recursive: true });
  const out = openSync(resolve(root, "data/mysql-console.log"), "a");
  const child = spawn(
    executavelMySQL(),
    [
      "--no-defaults",
      `--datadir=${datadir}`,
      `--port=${config.port}`,
      "--bind-address=127.0.0.1",
      "--mysqlx=OFF",
      "--console",
    ],
    {
      cwd: root,
      detached: true,
      windowsHide: true,
      stdio: ["ignore", out, out],
    },
  );
  let launchError;
  child.on("error", (error) => {
    launchError = error;
  });
  child.unref();
  closeSync(out);
  for (let i = 0; i < 60; i++) {
    if (launchError) throw launchError;
    await new Promise((r) => setTimeout(r, 500));
    try {
      await conectado();
      return;
    } catch (error) {
      if (
        !["ECONNREFUSED", "ETIMEDOUT", "PROTOCOL_CONNECTION_LOST"].includes(
          error.code,
        )
      )
        throw error;
    }
  }
  throw Error("MySQL local não iniciou. Consulte data/mysql-console.log.");
}
if (
  process.argv[1] &&
  resolve(process.argv[1]) === fileURLToPath(import.meta.url)
) {
  if (process.env.MYSQL_LOCAL === "1") {
    await iniciarMySQLLocal({
      port: Number(process.env.DB_PORT),
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
    });
    console.log("MySQL exclusivo da FinStart conectado.");
  }
}
