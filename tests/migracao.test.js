import test from "node:test";
import assert from "node:assert/strict";
import { DatabaseSync } from "node:sqlite";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { conectar } from "../server/database.js";
test("Migração SQLite preserva registros antigos sem inventar histórico anterior", () => {
  const dir = mkdtempSync(join(tmpdir(), "finstart-migracao-")),
    path = join(dir, "antigo.sqlite");
  let old = new DatabaseSync(path);
  old.exec(
    "CREATE TABLE usuarios(id INTEGER PRIMARY KEY,nome TEXT NOT NULL,email TEXT UNIQUE,senha_hash TEXT,criado_em TEXT DEFAULT CURRENT_TIMESTAMP); CREATE TABLE metas(id INTEGER PRIMARY KEY,usuario_id INTEGER REFERENCES usuarios(id),titulo TEXT,alvo_centavos INTEGER,guardado_centavos INTEGER,criado_em TEXT DEFAULT CURRENT_TIMESTAMP);INSERT INTO usuarios(id,nome,email,senha_hash) VALUES(1,'Legado','legado@example.test','hash-preservado');INSERT INTO metas(id,usuario_id,titulo,alvo_centavos,guardado_centavos) VALUES(7,1,'Reserva antiga',100000,25000);",
  );
  old.close();
  let db;
  try {
    db = conectar(path);
    const row = db.prepare("SELECT * FROM metas WHERE id=7").get();
    assert.equal(row.guardado_centavos, 25000);
    assert.equal(row.prazo_meses, null);
    assert.equal(row.status, "em_andamento");
    assert.equal(
      db.prepare("SELECT senha_hash FROM usuarios WHERE id=1").get().senha_hash,
      "hash-preservado",
    );
    assert.equal(
      db.prepare("SELECT count(*) n FROM progresso_meta").get().n,
      1,
    );
    db.close();
    db = conectar(path);
    assert.equal(
      db.prepare("SELECT count(*) n FROM progresso_meta").get().n,
      1,
    );
    assert.deepEqual(db.prepare("PRAGMA foreign_key_check").all(), []);
  } finally {
    db?.close();
    rmSync(dir, { recursive: true, force: true });
  }
});
