import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET() {
  const appId = process.env.META_APP_ID;
  const redirectUri = encodeURIComponent(process.env.META_REDIRECT_URI ?? "");
  if (!appId || !redirectUri) {
    return NextResponse.json(
      { error: "Faltan META_APP_ID o META_REDIRECT_URI" },
      { status: 500 }
    );
  }

  const state = crypto.randomUUID();
  // cookie por 5 min
  cookies().set("meta_oauth_state", state, {
    httpOnly: true,
    sameSite: "lax",
    maxAge: 300,
    path: "/",
  });

  const scope = [
    "public_profile",
    "email",
    "pages_show_list",
    "pages_read_engagement",
    "pages_manage_metadata",
  ].join(",");

  const url =
    `https://www.facebook.com/v21.0/dialog/oauth` +
    `?client_id=${appId}` +
    `&redirect_uri=${redirectUri}` +
    `&state=${state}` +
    `&scope=${scope}` +
    `&auth_type=rerequest`;

  return NextResponse.redirect(url);
}
