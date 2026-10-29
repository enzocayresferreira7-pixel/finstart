import assert from "node:assert/strict";
import { mkdtempSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { conectar } from "../server/database.js";
import { criarServidor } from "../server/index.js";
const dir = mkdtempSync(join(tmpdir(), "finstart-evidencias-"));
const db = conectar(join(dir, "demo.sqlite"));
const server = criarServidor({
  db,
  secret: "segredo-descartavel-evidencias-123456789",
});
await new Promise((r) => server.listen(0, "127.0.0.1", r));
const base = "http://127.0.0.1:" + server.address().port;
const evidence = [];
let cookie;
async function call(path, method = "GET", body, expected = 200) {
  const res = await fetch(base + path, {
    method,
    headers: {
      ...(body ? { "Content-Type": "application/json" } : {}),
      ...(cookie ? { cookie } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (path === "/api/login")
    cookie = res.headers.get("set-cookie")?.split(";")[0];
  const data = res.status === 204 ? null : await res.json();
  assert.equal(res.status, expected, method + " " + path);
  evidence.push({ method, path, status: res.status, body: data });
  return data;
}
try {
  await call("/api/saude");
  await call("/api/conteudos");
  await call("/api/tipos");
  await call("/api/metas", "GET", undefined, 401);
  await call(
    "/api/cadastro",
    "POST",
    {
      nome: "Aluno Demonstração",
      email: "demo@example.test",
      senha: "ExemploLocal123",
    },
    201,
  );
  await call("/api/login", "POST", {
    email: "demo@example.test",
    senha: "ExemploLocal123",
  });
  const orcamento = await call(
    "/api/simulacoes",
    "POST",
    { renda_centavos: 300000 },
    201,
  );
  const juros = await call(
    "/api/juros",
    "POST",
    { inicial_centavos: 100000, aporte_centavos: 20000, taxa: 0.5, meses: 24 },
    201,
  );
  const meta = await call(
    "/api/metas",
    "POST",
    { titulo: "Reserva de emergência", alvo_centavos: 600000, prazo_meses: 12 },
    201,
  );
  await call(
    "/api/metas/" + meta.id,
    "PUT",
    { guardado_centavos: 150000 },
    204,
  );
  await call("/api/metas/" + meta.id + "/progresso");
  await call("/api/comparar", "POST", {
    inicial_centavos: 100000,
    aporte_centavos: 20000,
    meses: 24,
  });
  const comp = await call(
    "/api/comparacoes",
    "POST",
    { inicial_centavos: 100000, aporte_centavos: 20000, meses: 24 },
    201,
  );
  await call("/api/comparacoes");
  await call("/api/juros/" + comp.id, "DELETE", undefined, 204);
  for (const p of ["me", "simulacoes", "juros", "metas"])
    await call("/api/" + p);
  const banco = {
    integridade: db.prepare("PRAGMA integrity_check").all(),
    chavesEstrangeiras: db.prepare("PRAGMA foreign_key_check").all(),
    tabelas: db
      .prepare(
        "SELECT name,sql FROM sqlite_master WHERE type='table' ORDER BY name",
      )
      .all(),
    relacoes: [
      "simulacoes",
      "juros",
      "metas",
      "sessoes",
      "conteudo",
      "simulacao_investimento",
      "progresso_meta",
    ].map((table) => ({
      table,
      foreignKeys: db.prepare(`PRAGMA foreign_key_list(${table})`).all(),
    })),
    consultaRelacionada: db
      .prepare(
        "SELECT u.nome,m.titulo,m.alvo_centavos,m.guardado_centavos FROM usuarios u JOIN metas m ON m.usuario_id=u.id",
      )
      .all(),
  };
  for (const [p, id] of [
    ["metas", meta.id],
    ["juros", juros.id],
    ["simulacoes", orcamento.id],
  ]) {
    await call("/api/" + p + "/" + id, "DELETE", undefined, 204);
    assert.deepEqual(await call("/api/" + p), []);
  }
  await call("/api/logout", "POST", undefined, 204);
  await call("/api/me", "GET", undefined, 401);
  writeFileSync(
    "docs/evidencias/endpoints.json",
    JSON.stringify(
      {
        data: "2026-10-28",
        observacao:
          "Execução HTTP real em banco temporário isolado. Dados fictícios, sem tokens ou senhas nas evidências. Todos os status foram verificados por assert.",
        evidence,
      },
      null,
      2,
    ),
  );
  writeFileSync("docs/evidencias/banco.json", JSON.stringify(banco, null, 2));
  console.log(
    evidence.length +
      " chamadas HTTP verificadas; dez tabelas e oito relações inspecionadas.",
  );
} finally {
  await new Promise((r) => server.close(r));
  db.close();
  rmSync(dir, { recursive: true, force: true });
}
