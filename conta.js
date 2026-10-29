import { carregarPainel } from "./painel.js";
import { api } from "./api.js";
const $ = (id) => document.getElementById(id);
const mostrar = (texto) => {
  $("mensagem").textContent = texto;
};
async function atualizar() {
  try {
    const user = await api("me");
    $("formularios").hidden = true;
    $("perfil").hidden = false;
    $("boas-vindas").textContent = "Olá, " + user.nome;
    await carregarPainel();
  } catch {
    $("formularios").hidden = false;
    $("perfil").hidden = true;
    for (const id of ["indicadores", "painel-metas", "painel-simulacoes"])
      $(id).replaceChildren();
  }
}
for (const id of ["login", "cadastro"])
  $(id).addEventListener("submit", async (event) => {
    event.preventDefault();
    const form = event.currentTarget,
      botao = form.querySelector("button:last-child");
    botao.disabled = true;
    try {
      const body = Object.fromEntries(new FormData(form));
      await api(id, "POST", body);
      form.reset();
      if (id === "cadastro") {
        mostrar("Conta criada. Entre com seu e-mail e senha.");
        $("contador").textContent = "0/50 caracteres";
        $("forca").textContent =
          "Use pelo menos 8 caracteres, com letra e número.";
      } else {
        mostrar("Login realizado.");
        await atualizar();
      }
    } catch (e) {
      mostrar(e.message);
    } finally {
      botao.disabled = false;
    }
  });
$("nome").addEventListener(
  "input",
  () => ($("contador").textContent = $("nome").value.length + "/50 caracteres"),
);
$("senha").addEventListener("input", () => {
  const s = $("senha").value;
  $("forca").textContent =
    s.length >= 8 && /\p{L}/u.test(s) && /\d/.test(s)
      ? "Formato aceito. Prefira uma senha longa e exclusiva."
      : "Use pelo menos 8 caracteres, com letra e número.";
});
$("alternar").addEventListener("click", () => {
  const show = $("senha").type === "password";
  $("senha").type = show ? "text" : "password";
  $("alternar").textContent = show ? "Ocultar senha" : "Mostrar senha";
  $("alternar").setAttribute("aria-pressed", String(show));
});
$("sair").addEventListener("click", async () => {
  try {
    await api("logout", "POST");
    await atualizar();
    mostrar("Sessão encerrada.");
  } catch (e) {
    mostrar(e.message);
  }
});
atualizar();
