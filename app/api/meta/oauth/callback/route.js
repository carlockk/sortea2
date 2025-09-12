// /app/api/meta/oauth/callback/route.js
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
    return NextResponse.json({ error: "Falta 'code' en la URL" }, { status: 400 });
  }

  const client_id = process.env.META_APP_ID;
  const client_secret = process.env.META_APP_SECRET;
  const redirect_uri = process.env.META_REDIRECT_URI;

  if (!client_id || !client_secret || !redirect_uri) {
    return NextResponse.json(
      { error: "Faltan META_APP_ID, META_APP_SECRET o META_REDIRECT_URI" },
      { status: 500 }
    );
  }

  try {
    await connectMongo();

    // Validar CSRF (si guardaste state en cookie al iniciar el login)
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

    // 2) Intercambiar por long-lived user token
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

    // NOTA: No logeamos tokens por seguridad.
    console.log("[META] Long-lived token OK (no mostrado por seguridad)");

    // Evitar "Invalid Date": solo si expires_in es numérico
    const expiresIn = Number(longRes.data?.expires_in);
    let expiresAt;
    if (Number.isFinite(expiresIn) && expiresIn > 0) {
      expiresAt = new Date(Date.now() + expiresIn * 1000);
    }

    // 3) Usuario actual
    const meRes = await axios.get("https://graph.facebook.com/v21.0/me", {
      params: { access_token: longToken, fields: "id,name" },
    });
    const metaUserId = meRes.data?.id;
    console.log("[META] /me →", meRes.data);
    if (!metaUserId) {
      return NextResponse.json(
        { error: "No se pudo obtener el usuario (me)", details: meRes.data },
        { status: 502 }
      );
    }

    // 4) Páginas del usuario (pedimos ambos campos por si FB rellena uno u otro)
    const accountsRes = await axios.get("https://graph.facebook.com/v21.0/me/accounts", {
      params: {
        access_token: longToken,
        fields:
          "id,name,access_token," +
          "instagram_business_account{id,username}," +
          "connected_instagram_account{id,username}",
        limit: 100,
      },
    });

    // DEBUG: log completo de lo que retorna Meta
    try {
      console.log(
        "[META] /me/accounts (raw) →",
        JSON.stringify(accountsRes.data, null, 2)
      );
    } catch {
      console.log("[META] /me/accounts (raw) → (no se pudo serializar)");
    }

    const rawPages = (accountsRes.data?.data || []).map((p) => ({
      pageId: p.id,
      name: p.name,
      accessToken: p.access_token,
      // Tomamos el IG id del campo que exista
      igBusinessId:
        p.instagram_business_account?.id ||
        p.connected_instagram_account?.id ||
        null,
    }));

    // 5) Enriquecer por página (a veces /me/accounts no trae el IG y hay que
    //    ir página por página con el page token)
    const pages = [];
    for (const p of rawPages) {
      let igId = p.igBusinessId;

      if (!igId && p.pageId && p.accessToken) {
        try {
          const pr = await axios.get(`https://graph.facebook.com/v21.0/${p.pageId}`, {
            params: {
              access_token: p.accessToken,
              fields:
                "instagram_business_account{id,username}," +
                "connected_instagram_account{id,username}",
            },
          });
          igId =
            pr.data?.instagram_business_account?.id ||
            pr.data?.connected_instagram_account?.id ||
            null;

          console.log(
            `[META] enrich page ${p.pageId} (${p.name}) → igId:`,
            igId || "(sin IG)"
          );
        } catch (err) {
          console.log(
            `[META] enrich page ${p.pageId} (${p.name}) → fallo`,
            err?.response?.data || err?.message
          );
        }
      } else {
        console.log(
          `[META] page ${p.pageId} (${p.name}) venía con igId:`,
          igId || "(sin IG)"
        );
      }

      pages.push({ ...p, igBusinessId: igId || null });
    }

    console.log(
      "[META] pages (normalizadas) →",
      pages.map((p) => ({
        pageId: p.pageId,
        name: p.name,
        hasIG: !!p.igBusinessId,
      }))
    );

    // 6) Guardar en Mongo
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

    // Limpiar cookie de state si existiera
    cookies().set("meta_oauth_state", "", { path: "/", maxAge: 0 });

    // 7) Redirigir al dashboard
    const base = process.env.PUBLIC_URL || new URL(req.url).origin;
    return NextResponse.redirect(`${base}/dashboard?connected=meta`);
  } catch (e) {
    const details = e?.response?.data || e?.message || String(e);
    console.error("OAuth callback error:", details);
    return NextResponse.json({ error: "Fallo OAuth", details }, { status: 500 });
  }
}
