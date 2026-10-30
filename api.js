export async function api(path, method = "GET", body) {
  let res;
  try {
    res = await fetch("/api/" + path, {
      method,
      headers: body !== undefined ? { "Content-Type": "application/json" } : {},
      body: body !== undefined ? JSON.stringify(body) : undefined,
      signal: AbortSignal.timeout(90000),
    });
  } catch {
    throw Error(
      "O servidor pode estar iniciando. Aguarde um momento e consulte seu histórico antes de repetir uma operação de salvamento. Verifique também sua conexão.",
    );
  }
  let data = null;
  if (res.status !== 204) {
    try {
      data = await res.json();
    } catch {
      throw Error(
        "O servidor retornou uma resposta inesperada. Tente novamente.",
      );
    }
  }
  if (!res.ok) {
    const erro = Error(data?.erro || "Não foi possível concluir.");
    erro.status = res.status;
    throw erro;
  }
  return data;
}
