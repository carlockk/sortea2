import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import axios from "axios";
import { connectMongo } from "@/lib/mongo";
import MetaAuth from "@/models/MetaAuth";

/**
 * Intercambia el `code` por un user access_token,
 * lo extiende a long-lived y guarda:
 *  - metaUserId
 *  - longLivedToken (y expiración)
 *  - pages: [ { pageId, name, accessToken, igBusinessId } ]
 */
export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");
  const state = searchParams.get("state");

  if (!code) {
    return NextResponse.json({ error: "Falta code" }, { status: 400 });
  }

  // (Opcional) validar el state si lo guardaste en cookie en /oauth/login
  const cookieStore = cookies();
  const expectedState = cookieStore.get("meta_oauth_state")?.value;
  if (expectedState && state && expectedState !== state) {
    return NextResponse.json({ error: "Invalid state" }, { status: 400 });
  }

  const client_id = process.env.META_APP_ID;
  const client_secret = process.env.META_APP_SECRET;
  const redirect_uri = process.env.META_REDIRECT_URI;

  try {
    await connectMongo();

    // 1) Intercambiar code -> short-lived user token
    const tokenRes = await axios.get("https://graph.facebook.com/v21.0/oauth/access_token", {
      params: { client_id, client_secret, redirect_uri, code },
    });
    const shortToken = tokenRes.data.access_token;

    // 2) Extender a long-lived user token
    const longRes = await axios.get("https://graph.facebook.com/v21.0/oauth/access_token", {
      params: {
        grant_type: "fb_exchange_token",
        client_id,
        client_secret,
        fb_exchange_token: shortToken,
      },
    });
    const longToken = longRes.data.access_token;
    const expiresIn = longRes.data.expires_in; // ~60 días

    // 3) Obtener el usuario y sus páginas (con tokens de página)
    const meRes = await axios.get("https://graph.facebook.com/v21.0/me", {
      params: { access_token: longToken, fields: "id,name" },
    });
    const metaUserId = meRes.data.id;

    const accountsRes = await axios.get("https://graph.facebook.com/v21.0/me/accounts", {
      params: {
        access_token: longToken,
        fields: "id,name,access_token,instagram_business_account{id}",
        limit: 100,
      },
    });

    const pages = (accountsRes.data?.data || []).map((p) => ({
      pageId: p.id,
      name: p.name,
      accessToken: p.access_token,
      igBusinessId: p.instagram_business_account?.id || null,
    }));

    // 4) Guardar en Mongo (upsert por metaUserId)
    await MetaAuth.findOneAndUpdate(
      { metaUserId },
      {
        metaUserId,
        shortLivedToken: shortToken,
        longLivedToken: longToken,
        longLivedTokenExpiresAt: new Date(Date.now() + expiresIn * 1000),
        pages,
        raw: { tokenRes: tokenRes.data, longRes: longRes.data, accounts: accountsRes.data },
      },
      { upsert: true, new: true }
    );

    // 5) OK → redirigir a dashboard
    const base = process.env.PUBLIC_URL || "http://localhost:3000";
    return NextResponse.redirect(`${base}/dashboard`);
  } catch (e) {
    const data = e?.response?.data;
    console.error("OAuth error:", data || e.message);
    return NextResponse.json({ error: "Fallo OAuth", details: data || e.message }, { status: 500 });
  }
}
