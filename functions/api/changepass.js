// 비밀번호 변경: 현재 토큰 검증 후 새 비번으로 교체(토큰도 회전)
async function sha256(str) {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(str));
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("");
}
const json = (o, s = 200) =>
  new Response(JSON.stringify(o), { status: s, headers: { "content-type": "application/json", "cache-control": "no-store" } });
const uid = () => crypto.randomUUID().replace(/-/g, "");

export async function onRequestPost({ request, env }) {
  const token = request.headers.get("x-auth") || "";
  const raw = await env.MOVEK_CONTENT.get("auth");
  if (!raw) return json({ ok: false }, 500);
  const a = JSON.parse(raw);
  if (!token || token !== a.token) return json({ ok: false }, 401);

  let body;
  try { body = await request.json(); } catch (e) { return json({ ok: false }, 400); }
  const newPass = body && body.newPass;
  if (!newPass || String(newPass).length < 4) return json({ ok: false, error: "weak" }, 400);

  a.salt = uid();
  a.hash = await sha256(String(newPass) + a.salt);
  a.token = uid();
  await env.MOVEK_CONTENT.put("auth", JSON.stringify(a));
  return json({ ok: true, token: a.token });
}
