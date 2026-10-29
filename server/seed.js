import { artigos } from "./conteudos.js";
export { artigos } from "./conteudos.js";
export const categorias = [...new Set(artigos.map((a) => a.categoria))].map(
  (nome) => [nome, "Conteúdos educativos sobre " + nome.toLowerCase() + "."],
);
export const tipos = [
  [
    "Cenário conservador",
    "Hipótese educativa; não representa um produto específico.",
    4,
  ],
  [
    "Cenário intermediário",
    "Hipótese educativa com taxa constante, sem garantia.",
    7,
  ],
  [
    "Cenário de maior taxa",
    "Hipótese didática; taxa maior não elimina riscos.",
    10,
  ],
];
export async function semear(db) {
  for (const [nome, descricao] of categorias) {
    if (!(await db.prepare("SELECT id FROM categoria WHERE nome=?").get(nome)))
      await db
        .prepare("INSERT INTO categoria(nome,descricao) VALUES(?,?)")
        .run(nome, descricao);
  }
  for (const artigo of artigos) {
    const c = await db
      .prepare("SELECT id FROM categoria WHERE nome=?")
      .get(artigo.categoria);
    const existente = await db
      .prepare("SELECT id FROM conteudo WHERE titulo=?")
      .get(artigo.titulo);
    const valores = [
      c.id,
      artigo.texto,
      artigo.nivel,
      JSON.stringify(artigo.fontes),
    ];
    if (existente)
      await db
        .prepare(
          "UPDATE conteudo SET categoria_id=?,texto=?,nivel=?,fontes_json=? WHERE id=?",
        )
        .run(...valores, existente.id);
    else
      await db
        .prepare(
          "INSERT INTO conteudo(categoria_id,texto,nivel,fontes_json,titulo) VALUES(?,?,?,?,?)",
        )
        .run(...valores, artigo.titulo);
  }
  for (const [nome, descricao, taxa] of tipos) {
    if (
      !(await db
        .prepare("SELECT id FROM tipo_investimento WHERE nome=?")
        .get(nome))
    )
      await db
        .prepare(
          "INSERT INTO tipo_investimento(nome,descricao,taxa_anual_padrao) VALUES(?,?,?)",
        )
        .run(nome, descricao, taxa);
  }
}
