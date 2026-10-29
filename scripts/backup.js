import { DatabaseSync, backup } from "node:sqlite";
import { mkdirSync } from "node:fs";
import { resolve, dirname } from "node:path";
if (process.env.DB_DRIVER === "mysql") {
  await import("./backup-mysql.js");
} else {
  const origem = resolve(process.env.DB_PATH || "data/finstart.sqlite");
  const destino = resolve(
    process.argv[2] ||
      `backups/finstart-${new Date().toISOString().replace(/[:.]/g, "-")}.sqlite`,
  );
  if (origem === destino)
    throw Error("Escolha um destino diferente do banco em uso.");
  mkdirSync(dirname(destino), { recursive: true });
  const db = new DatabaseSync(origem, { readOnly: true });
  try {
    await backup(db, destino);
    console.log("Backup criado: " + destino);
  } finally {
    db.close();
  }
}
