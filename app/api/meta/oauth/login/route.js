import { cookies } from "next/headers";
import { NextResponse } from "next/server";

/**
 * Redirige al diálogo OAuth con scopes de Páginas.
 * Guarda un `state` en cookie para validar en el callback.
 */
export async function GET() {
  const appId = process.env.META_APP_ID;
  const redirectUri = encodeURIComponent(process.env.META_REDIRECT_URI);
  const state = crypto.randomUUID();

  // cookie (5 min)
  cookies().set("meta_oauth_state", state, { httpOnly: true, sameSite: "lax", maxAge: 300, path: "/" });

  const scope = [
    "public_profile",
    "email",
    "pages_show_list",
    "pages_read_engagement",
    "pages_manage_metadata"
  ].join(",");

  const url =
    `https://www.facebook.com/v21.0/dialog/oauth?client_id=${appId}` +
    `&redirect_uri=${redirectUri}&state=${state}&scope=${scope}` +
    `&auth_type=rerequest`;

  return NextResponse.redirect(url);
}
