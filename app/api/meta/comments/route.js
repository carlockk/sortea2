import { NextResponse } from "next/server";
import axios from "axios";
import { connectMongo } from "@/lib/mongo";
import MetaAuth from "@/models/MetaAuth";

/**
 * Body esperado:
 *  - target: puede ser un POST_ID ("{PAGEID}_{POSTID}") o una URL del post.
 *  - pageId (opcional): si lo pasas, intenta usar el token de esa página.
 */
export async function POST(req) {
  try {
    const { target, pageId } = await req.json();
    if (!target) {
      return NextResponse.json({ error: "Falta 'target' (postId o URL)" }, { status: 400 });
    }

    await connectMongo();
    const last = await MetaAuth.findOne().sort({ updatedAt: -1 }).lean();
    if (!last || !last.pages?.length) {
      return NextResponse.json({ error: "No hay páginas conectadas aún" }, { status: 400 });
    }

    // Elegir token de página
    let pageToken = null;
    if (pageId) {
      const p = last.pages.find((x) => x.pageId === pageId);
      pageToken = p?.accessToken || null;
    }
    if (!pageToken) pageToken = last.pages[0].accessToken;

    // Resolver POST_ID
    let postId = target.trim();

    // Si viene una URL, intentamos resolverla a un ID con el endpoint de URL.
    if (/^https?:\/\//i.test(postId)) {
      const urlInfo = await axios.get("https://graph.facebook.com/v21.0/", {
        params: { id: postId, access_token: pageToken },
      });
      // Suele devolver un 'id' con formato "{PAGEID}_{POSTID}"
      postId = urlInfo.data?.id || postId;

      // fallback: intentar story_fbid en querystring
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
      return NextResponse.json({ error: "No pude resolver el POST_ID. Pega la URL oficial del post o el ID {PAGEID}_{POSTID}." }, { status: 400 });
    }

    // Leer comentarios
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

    return NextResponse.json({ comments, total: res.data?.summary?.total_count || comments.length });
  } catch (e) {
    console.error("comments API error:", e?.response?.data || e.message);
    return NextResponse.json({ error: "No se pudieron cargar los comentarios", details: e?.response?.data || e.message }, { status: 500 });
  }
}
