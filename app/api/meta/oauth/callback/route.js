import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import axios from "axios";
import { connectMongo } from "@/lib/mongo";
import MetaAuth from "@/models/MetaAuth";

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");
  const state = searchParams.get("state");

  if (!code) {
    return NextResponse.json({ error: "Falta code" }, { status: 400 });
  }

  const client_id = process.env.META_APP_ID;
  const client_secret = process.env.META_APP_SECRET;
  const redirect_uri = process.env.META_REDIRECT_URI;

  if (!client_id || !client_secret || !redirect_uri) {
    return NextResponse.json(
      { error: "Faltan variables de entorno META_*" },
      { status: 500 }
    );
  }

  try {
    await connectMongo();

    // (Opcional) validar state
    const expected = cookies().get("meta_oauth_state")?.value;
    if (expected && state && expected !== state) {
      return NextResponse.json({ error: "Invalid state" }, { status: 400 });
    }

    // 1) code -> short-lived user token
    const tokenRes = await axios.get("https://graph.facebook.com/v21.0/oauth/access_token", {
      params: { client_id, client_secret, redirect_uri, code },
    });
    const shortToken = tokenRes.data?.access_token;
    if (!shortToken) {
      return NextResponse.json(
        { error: "No se recibió short-lived token", details: tokenRes.data },
        { status: 502 }
      );
    }

    // 2) Extender a long-lived user token
    const longRes = await axios.get("https://graph.facebook.com/v21.0/oauth/access_token", {
      params: {
        grant_type: "fb_exchange_token",
        client_id,
        client_secret,
        fb_exchange_token: shortToken,
      },
    });
    const longToken = longRes.data?.access_token;
    if (!longToken) {
      return NextResponse.json(
        { error: "No se recibió long-lived token", details: longRes.data },
        { status: 502 }
      );
    }

    // ⚠️ FIX: calcular expiresAt solo si expires_in es numérico
    const expiresInRaw = longRes.data?.expires_in;
    const expiresIn = Number(expiresInRaw);
    let expiresAt; // undefined si no es válido
    if (Number.isFinite(expiresIn) && expiresIn > 0) {
      expiresAt = new Date(Date.now() + expiresIn * 1000);
    }

    // 3) Usuario y páginas
    const meRes = await axios.get("https://graph.facebook.com/v21.0/me", {
      params: { access_token: longToken, fields: "id,name" },
    });
    const metaUserId = meRes.data?.id;
    if (!metaUserId) {
      return NextResponse.json(
        { error: "No se pudo obtener el usuario (me)", details: meRes.data },
        { status: 502 }
      );
    }

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

    // 4) Upsert sin meter "Invalid Date"
    const updateDoc = {
      metaUserId,
      shortLivedToken: shortToken,
      longLivedToken: longToken,
      pages,
      raw: {
        tokenRes: tokenRes.data,
        longRes: longRes.data,
        accounts: accountsRes.data,
      },
    };
    if (expiresAt) updateDoc.longLivedTokenExpiresAt = expiresAt;

    await MetaAuth.findOneAndUpdate({ metaUserId }, updateDoc, {
      upsert: true,
      new: true,
    });

    // 5) Redirect a tu UI
    const base = process.env.PUBLIC_URL || new URL(req.url).origin;
    return NextResponse.redirect(`${base}/dashboard?connected=meta`);
  } catch (e) {
    const details = e?.response?.data || e?.message || String(e);
    console.error("OAuth callback error:", details);
    return NextResponse.json({ error: "Fallo OAuth", details }, { status: 500 });
  }
}
