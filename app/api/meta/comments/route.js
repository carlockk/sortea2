import { NextResponse } from "next/server";
import axios from "axios";
import { connectMongo } from "@/lib/mongo";
import MetaAuth from "@/models/MetaAuth";

function normUrl(u) {
  try {
    const url = new URL(u);
    url.search = "";
    return url.toString().replace(/\/$/, "");
  } catch (_) {
    return u.trim().replace(/\/$/, "");
  }
}

export async function POST(req) {
  try {
    const { target, pageId } = await req.json();
    if (!target) {
      return NextResponse.json({ error: "Falta 'target' (postId o URL)" }, { status: 400 });
    }

    await connectMongo();
    const auth = await MetaAuth.findOne().sort({ updatedAt: -1 }).lean();
    if (!auth) {
      return NextResponse.json({ error: "No hay conexión Meta guardada aún" }, { status: 400 });
    }

    const isIG = /instagram\.com/i.test(target);
    const normalized = normUrl(target);

    // ---------- INSTAGRAM ----------
    if (isIG) {
      const longUserToken = auth.longLivedToken;
      if (!longUserToken) {
        return NextResponse.json({ error: "No hay user token para IG" }, { status: 400 });
      }

      // Elegir IG user conectado
      let igUserId = null;
      if (pageId) {
        const p = auth.pages?.find((x) => x.pageId === pageId);
        igUserId = p?.igBusinessId || null;
      }
      if (!igUserId) {
        igUserId = auth.pages?.find((p) => p.igBusinessId)?.igBusinessId || null;
      }
      if (!igUserId) {
        return NextResponse.json({
          error: "No hay una cuenta de Instagram profesional conectada a tu Página.",
          hint: "Vincula tu IG en la configuración de la Página de Facebook y vuelve a conectar la app.",
        }, { status: 400 });
      }

      // Listar media de la cuenta IG y buscar por permalink
      const mediaRes = await axios.get(`https://graph.facebook.com/v21.0/${igUserId}/media`, {
        params: {
          access_token: longUserToken,
          fields: "id,permalink,caption,timestamp,media_type",
          limit: 100,
        },
      });

      const media = mediaRes.data?.data || [];
      const match = media.find((m) => normUrl(m.permalink) === normalized);
      if (!match) {
        return NextResponse.json({
          error: "No se encontró ese post en tu IG conectado.",
          hint: "La URL debe ser de tu propia cuenta profesional vinculada.",
          debug: { sample: media.slice(0, 3) },
        }, { status: 404 });
      }

      // Comentarios del media
      const commentsRes = await axios.get(`https://graph.facebook.com/v21.0/${match.id}/comments`, {
        params: {
          access_token: longUserToken,
          fields: "id,username,text,timestamp",
          limit: 500,
        },
      });

      const comments = (commentsRes.data?.data || []).map((c) => ({
        username: c.username || "usuario",
        text: c.text || "",
        created_time: c.timestamp,
      }));

      return NextResponse.json({
        source: "instagram",
        post_id: match.id,
        total: comments.length,
        comments,
      });
    }

    // ---------- FACEBOOK ----------
    // Elegir token de página
    let pageToken = null;
    if (pageId) {
      const p = auth.pages?.find((x) => x.pageId === pageId);
      pageToken = p?.accessToken || null;
    }
    if (!pageToken) pageToken = auth.pages?.[0]?.accessToken || null;

    if (!pageToken) {
      return NextResponse.json({ error: "No hay token de Página disponible" }, { status: 400 });
    }

    // Resolver POST_ID desde URL o usarlo directo
    let postId = target.trim();

    if (/^https?:\/\//i.test(postId)) {
      const urlInfo = await axios.get("https://graph.facebook.com/v21.0/", {
        params: { id: postId, access_token: pageToken },
      });
      postId = urlInfo.data?.id || postId;

      // fallback permalink tipo story_fbid
      if (!/_/.test(postId)) {
        try {
          const u = new URL(postId);
          const storyFbid = u.searchParams.get("story_fbid");
          const pid = u.searchParams.get("id");
          if (storyFbid && pid) postId = `${pid}_${storyFbid}`;
        } catch {}
      }
    }

    if (!/_/.test(postId) && !/^\d+$/.test(postId)) {
      return NextResponse.json({
        error: "No pude resolver el POST_ID de Facebook.",
        hint: "Pega la URL oficial o el ID {PAGEID}_{POSTID}.",
      }, { status: 400 });
    }

    const res = await axios.get(`https://graph.facebook.com/v21.0/${postId}/comments`, {
      params: {
        access_token: pageToken,
        summary: "true",
        filter: "stream",
        limit: 500,
        fields: "from{name},message,created_time",
      },
    });

    const comments = (res.data?.data || []).map((c) => ({
      username: c.from?.name || "Usuario",
      text: c.message || "",
      created_time: c.created_time,
    }));

    return NextResponse.json({
      source: "facebook",
      post_id: postId,
      total: res.data?.summary?.total_count || comments.length,
      comments,
    });
  } catch (e) {
    const details = e?.response?.data || e?.message || String(e);
    console.error("comments API error:", details);
    return NextResponse.json(
      { error: "No se pudieron cargar los comentarios", details },
      { status: 500 }
    );
  }
}
