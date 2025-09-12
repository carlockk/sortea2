import { NextResponse } from "next/server";

/**
 * Endpoint que Meta puede consultar para confirmar el flujo de eliminación.
 * Acepta GET con ?user_id=... o POST con { user_id }.
 * Aquí deberías borrar tokens/registro asociados a ese user_id.
 */
export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("user_id") || "desconocido";
  // TODO: eliminar en tu DB lo asociado a userId
  return NextResponse.json({
    status: "success",
    message: "Datos eliminados (simulado).",
    user_id: userId,
  });
}

export async function POST(req) {
  const body = await req.json().catch(() => ({}));
  const userId = body?.user_id || "desconocido";
  // TODO: eliminar en tu DB lo asociado a userId
  return NextResponse.json({
    status: "success",
    message: "Datos eliminados (simulado).",
    user_id: userId,
  });
}
