import test from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { conectar } from "../server/database.js";
import { criarServidor } from "../server/index.js";
import { emitirToken } from "../server/auth.js";
const secret = "segredo-exclusivo-para-testes-123456789";
test("Fluxo HTTP, isolamento, JWT, logout e persistência", async () => {
  const dir = mkdtempSync(join(tmpdir(), "finstart-")),
    path = join(dir, "test.sqlite");
  let db = conectar(path);
  const server = criarServidor({ db, secret });
  await new Promise((r) => server.listen(0, "127.0.0.1", r));
  const base = "http://127.0.0.1:" + server.address().port;
  async function call(route, method = "GET", body, cookie, extra = {}) {
    return fetch(base + route, {
      method,
      headers: {
        ...(body ? { "Content-Type": "application/json" } : {}),
        ...(cookie ? { cookie } : {}),
        ...extra,
      },
      body: body ? JSON.stringify(body) : undefined,
    });
  }
  try {
    assert.equal((await call("/server/auth.js")).status, 404);
    assert.equal((await call("/")).status, 200);
    assert.equal((await call("/api/simulacoes")).status, 401);
    assert.equal(
      (await call("/api/cadastro", "POST", { nome: "X" })).status,
      400,
    );
    const conta = {
      nome: "Aluno FinStart",
      email: "aluno@example.com",
      senha: "SenhaTeste123!",
    };
    assert.equal((await call("/api/cadastro", "POST", conta)).status, 201);
    assert.equal((await call("/api/cadastro", "POST", conta)).status, 409);
    assert.equal(
      (await call("/api/login", "POST", { ...conta, senha: "errada" })).status,
      401,
    );
    const login = await call("/api/login", "POST", conta);
    assert.equal(login.status, 200);
    const cookie = login.headers.get("set-cookie").split(";")[0];
    assert.match(login.headers.get("set-cookie"), /HttpOnly/);
    assert.equal((await call("/api/me", "GET", null, cookie)).status, 200);
    assert.equal(
      (await call("/api/simulacoes", "POST", { renda_centavos: 1.5 }, cookie))
        .status,
      400,
    );
    assert.equal(
      (
        await call("/api/simulacoes", "POST", { renda_centavos: 100 }, cookie, {
          Origin: "https://outro.example",
        })
      ).status,
      403,
    );
    const saved = await (
      await call("/api/simulacoes", "POST", { renda_centavos: 400000 }, cookie)
    ).json();
    assert.equal(
      (await (await call("/api/simulacoes", "GET", null, cookie)).json())
        .length,
      1,
    );
    await call("/api/cadastro", "POST", {
      ...conta,
      email: "outra@example.com",
    });
    const other = (
      await call("/api/login", "POST", {
        email: "outra@example.com",
        senha: conta.senha,
      })
    ).headers
      .get("set-cookie")
      .split(";")[0];
    assert.deepEqual(
      await (await call("/api/simulacoes", "GET", null, other)).json(),
      [],
    );
    assert.equal(
      (await call("/api/simulacoes/" + saved.id, "DELETE", null, other)).status,
      404,
    );
    const expired = emitirToken(1, secret, 1).token;
    assert.equal(
      (await call("/api/me", "GET", null, "finstart=" + expired)).status,
      401,
    );
    const token = cookie.slice("finstart=".length).split(".");
    token[1] = Buffer.from(
      JSON.stringify({ sub: "2", exp: 9999999999 }),
    ).toString("base64url");
    assert.equal(
      (await call("/api/me", "GET", null, "finstart=" + token.join(".")))
        .status,
      401,
    );
    assert.equal((await call("/api/logout", "POST", null, cookie)).status, 204);
    assert.equal((await call("/api/me", "GET", null, cookie)).status, 401);
    assert.notEqual(
      db.prepare("SELECT senha_hash FROM usuarios LIMIT 1").get().senha_hash,
      conta.senha,
    );
    assert.throws(() =>
      db
        .prepare(
          "INSERT INTO simulacoes(usuario_id,renda_centavos) VALUES(999,100)",
        )
        .run(),
    );
    db.close();
    db = conectar(path);
    assert.equal(db.prepare("SELECT COUNT(*) n FROM simulacoes").get().n, 1);
    db.close();
  } finally {
    await new Promise((r) => server.close(r));
    try {
      db.close();
    } catch {}
    try {
      rmSync(dir, { recursive: true, force: true });
    } catch {}
  }
});
