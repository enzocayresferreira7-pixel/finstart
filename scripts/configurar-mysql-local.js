// Execute com o site parado. A instalação existente do MySQL não é modificada.
import { randomBytes } from "node:crypto";
import { DatabaseSync, backup } from "node:sqlite";
import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { parseEnv } from "node:util";
import { createServer } from "node:net";
import mysql from "mysql2/promise";
import { executavelMySQL, iniciarMySQLLocal } from "./mysql-local.js";
const root = fileURLToPath(new URL("../", import.meta.url));
const data = resolve(root, "data"),
  datadir = resolve(data, "mysql");
if (existsSync(datadir))
  throw Error(
    "data/mysql já existe. Nenhum dado foi alterado; confira a configuração existente.",
  );
const envPath = resolve(root, ".env");
const original = existsSync(envPath)
  ? readFileSync(envPath, "utf8").replace(/^\uFEFF/, "")
  : "";
const env = parseEnv(original);
if (env.DB_DRIVER === "mysql")
  throw Error("O projeto já está configurado para MySQL.");
const port = Number(process.argv[2] || 3308);
if (!Number.isInteger(port) || port < 1024 || port > 65535)
  throw Error("Porta inválida.");
await new Promise((ok, fail) => {
  const s = createServer();
  s.once("error", fail);
  s.listen(port, "127.0.0.1", () => s.close(ok));
});
mkdirSync(data, { recursive: true });
const stamp = new Date().toISOString().replace(/[:.]/g, "-");
const source = resolve(root, env.DB_PATH || "data/finstart.sqlite");
let sqlite;
if (existsSync(source)) {
  sqlite = new DatabaseSync(source, { readOnly: true });
  await backup(sqlite, resolve(data, `antes-mysql-${stamp}.sqlite`));
}
writeFileSync(resolve(data, `config-anterior-${stamp}.env`), original, {
  mode: 0o600,
});
const init = spawnSync(
  executavelMySQL(),
  ["--no-defaults", "--initialize-insecure", `--datadir=${datadir}`],
  { windowsHide: true, encoding: "utf8", timeout: 120000 },
);
if (init.status !== 0)
  throw Error(
    "Falha ao inicializar MySQL: " + (init.error?.message || init.stderr),
  );
await iniciarMySQLLocal({ port, user: "root", password: "" });
const conn = await mysql.createConnection({
  host: "127.0.0.1",
  port,
  user: "root",
  password: "",
  dateStrings: true,
});
const admin = randomBytes(24).toString("hex"),
  app = randomBytes(24).toString("hex"),
  viewer = randomBytes(18).toString("hex");
writeFileSync(
  resolve(data, "mysql-administrador.txt"),
  `Acesso local privado\nHost: 127.0.0.1\nPorta: ${port}\nUsuário: root\nSenha: ${admin}\n`,
  { mode: 0o600 },
);
try {
  await conn.query("ALTER USER 'root'@'localhost' IDENTIFIED BY ?", [admin]);
  await conn.query(
    "CREATE DATABASE finstart CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci",
  );
  await conn.query("CREATE USER 'finstart_app'@'localhost' IDENTIFIED BY ?", [
    app,
  ]);
  await conn.query(
    "GRANT ALL PRIVILEGES ON finstart.* TO 'finstart_app'@'localhost'",
  );
  await conn.query(
    "CREATE USER 'finstart_leitura'@'localhost' IDENTIFIED BY ?",
    [viewer],
  );
  await conn.query(
    "GRANT SELECT, SHOW VIEW ON finstart.* TO 'finstart_leitura'@'localhost'",
  );
  await conn.query("USE finstart");
  for (const statement of readFileSync(
    resolve(root, "database/schema.mysql.sql"),
    "utf8",
  )
    .split(";")
    .map((s) => s.trim())
    .filter(Boolean))
    await conn.query(statement);
  const order = [
    "usuarios",
    "categoria",
    "tipo_investimento",
    "simulacoes",
    "sessoes",
    "metas",
    "juros",
    "conteudo",
    "simulacao_investimento",
    "progresso_meta",
  ];
  const counts = {};
  await conn.beginTransaction();
  try {
    for (const table of order) {
      const exists = sqlite
        ?.prepare(
          "SELECT name FROM sqlite_master WHERE type='table' AND name=?",
        )
        .get(table);
      const rows = exists ? sqlite.prepare(`SELECT * FROM ${table}`).all() : [];
      for (const row of rows) {
        const keys = Object.keys(row);
        await conn.execute(
          `INSERT INTO ${table} (${keys.map((k) => "`" + k + "`").join(",")}) VALUES (${keys.map(() => "?").join(",")})`,
          keys.map((k) => row[k]),
        );
      }
      const [[count]] = await conn.query(`SELECT COUNT(*) AS n FROM ${table}`);
      if (Number(count.n) !== rows.length)
        throw Error("Contagem divergente em " + table);
      // Compare todos os valores originais, incluindo hashes e relacionamentos.
      const [copied] = await conn.query(`SELECT * FROM ${table}`);
      const fields = rows[0] ? Object.keys(rows[0]).sort() : [];
      const normalized = (a) =>
        a.map((r) => JSON.stringify(fields.map((k) => r[k]))).sort();
      if (
        JSON.stringify(normalized(rows)) !== JSON.stringify(normalized(copied))
      )
        throw Error("Conteúdo divergente em " + table);
      counts[table] = rows.length;
    }
    await conn.commit();
  } catch (error) {
    await conn.rollback();
    throw error;
  }
  const updated = {
    ...env,
    JWT_SECRET: env.JWT_SECRET || randomBytes(32).toString("hex"),
    PORT: env.PORT || "3000",
    DB_DRIVER: "mysql",
    MYSQL_LOCAL: "1",
    DB_HOST: "127.0.0.1",
    DB_PORT: String(port),
    DB_NAME: "finstart",
    DB_USER: "finstart_app",
    DB_PASSWORD: app,
  };
  writeFileSync(
    envPath,
    Object.entries(updated)
      .map(([k, v]) => `${k}=${JSON.stringify(v)}`)
      .join("\n") + "\n",
    { mode: 0o600 },
  );
  writeFileSync(
    resolve(data, "ACESSO-WORKBENCH.txt"),
    `FinStart - acesso privado somente para leitura\nNo Workbench, crie uma conexão Standard TCP/IP.\nConnection Name: FinStart\nHostname: 127.0.0.1\nPort: ${port}\nUsername: finstart_leitura\nDefault Schema: finstart\nPassword: ${viewer}\n\nNão compartilhe este arquivo. Use database/consultas-demonstracao.mysql.sql para consultar tabelas e relacionamentos.\n`,
    { mode: 0o600 },
  );
  writeFileSync(
    resolve(data, "migracao-mysql.json"),
    JSON.stringify(
      {
        data: new Date().toISOString(),
        origem: "SQLite local",
        destino: `MySQL local:${port}/finstart`,
        comparacao: "Todos os campos originais comparados antes do commit",
        tabelas: counts,
      },
      null,
      2,
    ),
  );
  console.log(
    "MySQL preparado; dados comparados e preservados. Acesso do Workbench em data/ACESSO-WORKBENCH.txt.",
  );
  console.log(JSON.stringify(counts));
} finally {
  await conn.end();
  sqlite?.close();
}
