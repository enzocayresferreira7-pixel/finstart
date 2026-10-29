import test from "node:test";
import assert from "node:assert/strict";
import { request } from "node:http";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { backup } from "node:sqlite";
import { conectar } from "../server/database.js";
import { criarServidor } from "../server/index.js";
const secret = "segredo-de-integracao-completa-123456789";
const conta = {
  nome: "Integração Acentuação",
  email: "integracao@example.test",
  senha: "TesteIntegracao123",
};
async function iniciar(db) {
  const server = criarServidor({ db, secret });
  await new Promise((r) => server.listen(0, "127.0.0.1", r));
  return { server, base: "http://127.0.0.1:" + server.address().port };
}
async function fechar(server) {
  await new Promise((r) => server.close(r));
}

test("CRUD HTTP completo, reinício e backup restaurável", async () => {
  const dir = mkdtempSync(join(tmpdir(), "finstart-completa-"));
  let db = conectar(join(dir, "db.sqlite"));
  let { server, base } = await iniciar(db);
  let cookie;
  async function call(path, method = "GET", body, session = cookie) {
    const r = await fetch(base + "/api/" + path, {
      method,
      headers: {
        ...(body !== undefined ? { "Content-Type": "application/json" } : {}),
        ...(session ? { cookie: session } : {}),
      },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
    const data = r.status === 204 ? null : await r.json();
    return {
      status: r.status,
      data,
      cookie: r.headers.get("set-cookie")?.split(";")[0],
    };
  }
  try {
    assert.equal((await call("saude")).data.banco, "conectado");
    for (const p of ["metas", "juros", "simulacoes"])
      assert.equal((await call(p)).status, 401);
    assert.equal((await call("cadastro", "POST", conta)).status, 201);
    cookie = (await call("login", "POST", conta)).cookie;
    const m = await call("metas", "POST", {
      titulo: "Reserva de emergência",
      alvo_centavos: 600000,
    });
    assert.equal(m.status, 201);
    assert.equal(
      (await call("metas/" + m.data.id, "PUT", { guardado_centavos: 150000 }))
        .status,
      204,
    );
    assert.equal(
      (await call("metas/" + m.data.id, "PUT", { guardado_centavos: -1 }))
        .status,
      400,
    );
    const j = await call("juros", "POST", {
      inicial_centavos: 100000,
      aporte_centavos: 20000,
      taxa: 0.5,
      meses: 24,
    });
    assert.equal(j.status, 201);
    assert.equal((await call("juros")).data[0].saldo_centavos, 621355);
    assert.equal(
      (
        await call("juros", "POST", {
          inicial_centavos: 0,
          aporte_centavos: 0,
          taxa: 0,
          meses: 0,
        })
      ).status,
      400,
    );
    const o = await call("simulacoes", "POST", { renda_centavos: 300000 });
    assert.equal(o.status, 201);
    const outro = { ...conta, email: "segundo@example.test" };
    await call("cadastro", "POST", outro);
    const outroCookie = (await call("login", "POST", outro)).cookie;
    for (const [p, id] of [
      ["metas", m.data.id],
      ["juros", j.data.id],
      ["simulacoes", o.data.id],
    ]) {
      assert.deepEqual((await call(p, "GET", undefined, outroCookie)).data, []);
      assert.equal(
        (await call(p + "/" + id, "DELETE", undefined, outroCookie)).status,
        404,
      );
    }
    // O servidor novo deve ler os mesmos registros e sessões após reabrir o arquivo.
    await fechar(server);
    db.close();
    db = conectar(join(dir, "db.sqlite"));
    ({ server, base } = await iniciar(db));
    assert.equal((await call("metas")).data[0].guardado_centavos, 150000);
    assert.equal((await call("juros")).data[0].saldo_centavos, 621355);
    assert.equal((await call("simulacoes")).data[0].renda_centavos, 300000);
    await backup(db, join(dir, "backup.sqlite"));
    const restored = conectar(join(dir, "backup.sqlite"));
    try {
      assert.equal(restored.prepare("SELECT count(*) n FROM metas").get().n, 1);
      assert.equal(
        restored.prepare("PRAGMA integrity_check").get().integrity_check,
        "ok",
      );
      assert.deepEqual(restored.prepare("PRAGMA foreign_key_check").all(), []);
    } finally {
      restored.close();
    }
    for (const [p, id] of [
      ["metas", m.data.id],
      ["juros", j.data.id],
      ["simulacoes", o.data.id],
    ]) {
      assert.equal((await call(p + "/" + id, "DELETE")).status, 204);
      assert.deepEqual((await call(p)).data, []);
      assert.equal((await call(p + "/" + id, "DELETE")).status, 404);
    }
    assert.equal((await call("logout", "POST")).status, 204);
    assert.equal((await call("me")).status, 401);
  } finally {
    await fechar(server);
    db.close();
    rmSync(dir, { recursive: true, force: true });
  }
});

test("Protocolo HTTP: JSON, tamanho, origem e UTF-8 fragmentado", async () => {
  const db = conectar(":memory:");
  const { server, base } = await iniciar(db);
  try {
    const raw = (body, headers = {}) =>
      fetch(base + "/api/cadastro", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...headers },
        body,
      });
    assert.equal((await raw("{")).status, 400);
    assert.equal((await raw("[]")).status, 400);
    assert.equal(
      (await raw("{}", { "Content-Type": "text/plain" })).status,
      415,
    );
    assert.equal(
      (await raw(JSON.stringify({ nome: "x".repeat(17000) }))).status,
      413,
    );
    assert.equal(
      (await raw("{}", { Origin: "https://outro.example" })).status,
      403,
    );
    const bytes = Buffer.from(JSON.stringify(conta));
    const pos = bytes.indexOf(Buffer.from("ç")) + 1;
    const resposta = await new Promise((resolve, reject) => {
      const req = request(
        base + "/api/cadastro",
        { method: "POST", headers: { "Content-Type": "application/json" } },
        (res) => {
          const partes = [];
          res.on("data", (p) => partes.push(p));
          res.on("end", () =>
            resolve({
              status: res.statusCode,
              data: JSON.parse(Buffer.concat(partes)),
            }),
          );
        },
      );
      req.on("error", reject);
      req.write(bytes.subarray(0, pos));
      setTimeout(() => req.end(bytes.subarray(pos)), 10);
    });
    assert.equal(resposta.status, 201);
    assert.equal(resposta.data.nome, conta.nome);
    for (const path of [
      "/.env",
      "/data/finstart.sqlite",
      "/database/schema.sql",
      "/docs/evidencias/banco.json",
      "/server/controllers.js",
    ])
      assert.equal((await fetch(base + path)).status, 404);
  } finally {
    await fechar(server);
    db.close();
  }
});
