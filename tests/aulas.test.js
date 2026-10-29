import test from "node:test";
import assert from "node:assert/strict";
import { conectar } from "../server/database.js";
import { criarServidor } from "../server/index.js";
test("Conteúdos, comparação, edição de metas e progresso integrados", async () => {
  const db = conectar(":memory:"),
    server = criarServidor({
      db,
      secret: "segredo-de-teste-exclusivo-com-32-caracteres",
    });
  await new Promise((r) => server.listen(0, "127.0.0.1", r));
  const base = "http://127.0.0.1:" + server.address().port;
  let cookie = "";
  async function call(p, method = "GET", body, session = cookie) {
    const r = await fetch(base + "/api/" + p, {
      method,
      headers: { "Content-Type": "application/json", cookie: session },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
    return {
      status: r.status,
      data: r.status === 204 ? null : await r.json(),
      cookie: r.headers.get("set-cookie")?.split(";")[0],
    };
  }
  try {
    const catalogo = (await call("conteudos")).data;
    assert.equal(catalogo.length, 15);
    for (const nivel of ["basico", "intermediario", "avancado"])
      assert.equal(catalogo.filter((a) => a.nivel === nivel).length, 5);
    for (const a of catalogo) {
      assert.ok(a.fontes.length);
      for (const f of a.fontes) {
        assert.equal(new URL(f.url).protocol, "https:");
        assert.ok(f.titulo);
      }
    }

    assert.equal((await call("tipos")).data.length, 3);
    const plano = {
      inicial_centavos: 100000,
      aporte_centavos: 20000,
      meses: 24,
    };
    const comp = await call("comparar", "POST", plano);
    assert.equal(comp.status, 200);
    assert.equal(comp.data.length, 3);
    assert.ok(comp.data[0].saldo_centavos < comp.data[2].saldo_centavos);
    assert.equal(
      (await call("comparar", "POST", { ...plano, meses: 0 })).status,
      400,
    );
    assert.equal((await call("comparacoes", "POST", plano)).status, 401);
    const conta = {
      nome: "Teste Curso",
      email: "curso@example.test",
      senha: "TesteCurso123",
    };
    await call("cadastro", "POST", conta);
    cookie = (await call("login", "POST", conta)).cookie;
    const c = await call("comparacoes", "POST", plano);
    assert.equal(c.status, 201);
    assert.equal((await call("comparacoes")).data.length, 3);
    assert.equal((await call("juros")).data.length, 0);
    const m = await call("metas", "POST", {
      titulo: "Reserva",
      alvo_centavos: 120000,
      prazo_meses: 12,
    });
    assert.equal(m.status, 201);
    assert.equal((await call("metas")).data[0].aporte_centavos, 10000);
    assert.equal(
      (
        await call("metas/" + m.data.id, "PUT", {
          titulo: "Reserva revista",
          alvo_centavos: 240000,
          prazo_meses: 24,
          guardado_centavos: 24000,
        })
      ).status,
      204,
    );
    const meta = (await call("metas")).data[0];
    assert.equal(meta.titulo, "Reserva revista");
    assert.equal(meta.aporte_centavos, 9000);
    assert.equal(meta.percentual, 10);
    assert.equal(
      (await call("metas/" + m.data.id + "/progresso")).data[0].saldo_centavos,
      24000,
    );
    await call("metas/" + m.data.id, "PUT", { guardado_centavos: 12000 });
    const hist = (await call("metas/" + m.data.id + "/progresso")).data;
    assert.equal(hist.length, 2);
    assert.equal(hist[1].variacao_centavos, -12000);
    const outra = { ...conta, email: "outra@example.test" };
    await call("cadastro", "POST", outra);
    const other = (await call("login", "POST", outra)).cookie;
    assert.equal(
      (await call("metas/" + m.data.id + "/progresso", "GET", undefined, other))
        .status,
      404,
    );
    assert.deepEqual(
      (await call("comparacoes", "GET", undefined, other)).data,
      [],
    );
    await call("juros/" + c.data.id, "DELETE");
    assert.equal(
      db.prepare("SELECT count(*) n FROM simulacao_investimento").get().n,
      0,
    );
    await call("metas/" + m.data.id, "DELETE");
    assert.equal(
      db.prepare("SELECT count(*) n FROM progresso_meta").get().n,
      0,
    );
  } finally {
    await new Promise((r) => server.close(r));
    db.close();
  }
});
