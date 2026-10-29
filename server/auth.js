import {
  createHmac,
  timingSafeEqual,
  randomBytes,
  scryptSync,
  randomUUID,
} from "node:crypto";
export function hashSenha(senha) {
  const salt = randomBytes(16).toString("hex");
  return salt + ":" + scryptSync(senha, salt, 64).toString("hex");
}
export function conferirSenha(senha, hash) {
  const [salt, hex] = hash.split(":");
  return timingSafeEqual(scryptSync(senha, salt, 64), Buffer.from(hex, "hex"));
}
export function emitirToken(
  usuarioId,
  secret,
  exp = Math.floor(Date.now() / 1000) + 3600,
) {
  const encode = (value) =>
    Buffer.from(JSON.stringify(value)).toString("base64url");
  const claims = {
    sub: String(usuarioId),
    jti: randomUUID(),
    iat: Math.floor(Date.now() / 1000),
    exp,
    iss: "finstart",
    aud: "finstart-web",
  };
  const data = encode({ alg: "HS256", typ: "JWT" }) + "." + encode(claims);
  return {
    token:
      data +
      "." +
      createHmac("sha256", secret).update(data).digest("base64url"),
    claims,
  };
}
export function verificarToken(token, secret) {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) throw Error();
    const header = JSON.parse(Buffer.from(parts[0], "base64url"));
    const signature = Buffer.from(parts[2], "base64url");
    const expected = createHmac("sha256", secret)
      .update(parts[0] + "." + parts[1])
      .digest();
    if (
      header.alg !== "HS256" ||
      signature.length !== expected.length ||
      !timingSafeEqual(signature, expected)
    )
      throw Error();
    const claims = JSON.parse(Buffer.from(parts[1], "base64url"));
    if (
      !Number.isInteger(claims.exp) ||
      claims.exp <= Date.now() / 1000 ||
      claims.iss !== "finstart" ||
      claims.aud !== "finstart-web" ||
      !/^\d+$/.test(claims.sub) ||
      typeof claims.jti !== "string"
    )
      throw Error();
    return claims;
  } catch {
    throw Object.assign(
      Error("Sessão inválida ou expirada. Entre novamente."),
      { status: 401 },
    );
  }
}
