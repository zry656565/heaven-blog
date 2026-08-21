const TOKEN_TTL = 7000;

function json(body, status = 200) {
  return Response.json(body, {
    status,
    headers: { "Cache-Control": "no-store" },
  });
}

function allowedShareUrl(raw, requestHost) {
  let url;
  try {
    url = new URL(raw);
  } catch {
    return null;
  }
  if (url.hash) url.hash = "";
  const host = url.hostname;
  const okHost =
    host === requestHost ||
    host === "jerryzou.com" ||
    host === "www.jerryzou.com" ||
    host === "heaven-blog-next.pages.dev" ||
    host.endsWith(".heaven-blog-next.pages.dev") ||
    host === "localhost" ||
    host === "127.0.0.1";
  if (!okHost) return null;
  if (
    url.protocol !== "https:" &&
    host !== "localhost" &&
    host !== "127.0.0.1"
  ) {
    return null;
  }
  return url.href;
}

async function sha1(text) {
  const bytes = await crypto.subtle.digest(
    "SHA-1",
    new TextEncoder().encode(text),
  );
  return [...new Uint8Array(bytes)]
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

async function cachedJson(cache, keyUrl) {
  const hit = await cache.match(keyUrl);
  if (!hit) return null;
  return hit.json();
}

async function putCache(cache, keyUrl, data, ctx) {
  const response = new Response(JSON.stringify(data), {
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": `public, max-age=${TOKEN_TTL}`,
    },
  });
  ctx.waitUntil(cache.put(keyUrl, response.clone()));
}

async function wechatJson(url) {
  const response = await fetch(url);
  const data = await response.json();
  if (data.errcode) {
    throw new Error(`${data.errcode}: ${data.errmsg || "wechat api error"}`);
  }
  return data;
}

async function getTicket(env, ctx) {
  const cache = caches.default;
  const ticketKey = new Request("https://wechat-cache.internal/jsapi-ticket");
  const cached = await cachedJson(cache, ticketKey);
  if (cached?.ticket) return cached.ticket;

  const tokenKey = new Request("https://wechat-cache.internal/access-token");
  let token = (await cachedJson(cache, tokenKey))?.access_token;
  if (!token) {
    const tokenData = await wechatJson(
      `https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=${encodeURIComponent(env.WECHAT_APP_ID)}&secret=${encodeURIComponent(env.WECHAT_APP_SECRET)}`,
    );
    token = tokenData.access_token;
    await putCache(cache, tokenKey, { access_token: token }, ctx);
  }

  const ticketData = await wechatJson(
    `https://api.weixin.qq.com/cgi-bin/ticket/getticket?access_token=${encodeURIComponent(token)}&type=jsapi`,
  );
  await putCache(cache, ticketKey, { ticket: ticketData.ticket }, ctx);
  return ticketData.ticket;
}

export async function onRequestGet(ctx) {
  const appId = ctx.env.WECHAT_APP_ID;
  const secret = ctx.env.WECHAT_APP_SECRET;
  if (!appId || !secret) {
    return json({ enabled: false }, 501);
  }

  const requestUrl = new URL(ctx.request.url);
  const pageUrl = allowedShareUrl(
    requestUrl.searchParams.get("url") || "",
    new URL(ctx.request.url).hostname,
  );
  if (!pageUrl) {
    return json({ enabled: false, error: "invalid url" }, 400);
  }

  try {
    const timestamp = Math.floor(Date.now() / 1000).toString();
    const nonceStr = crypto.randomUUID().replaceAll("-", "");
    const ticket = await getTicket(ctx.env, ctx);
    const signature = await sha1(
      `jsapi_ticket=${ticket}&noncestr=${nonceStr}&timestamp=${timestamp}&url=${pageUrl}`,
    );
    return json({
      enabled: true,
      appId,
      timestamp,
      nonceStr,
      signature,
    });
  } catch {
    return json({ enabled: false, error: "sign failed" }, 502);
  }
}
