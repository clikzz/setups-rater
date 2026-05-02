import { NextResponse } from "next/server";
import { signSession } from "@/lib/auth";

const COOKIE_NAME = "session";

export async function POST(request: Request) {
  const { password } = await request.json();

  if (!password || typeof password !== "string") {
    return NextResponse.json(
      { error: "Contraseña requerida" },
      { status: 400 }
    );
  }

  if (password !== process.env.PASSWORD) {
    return NextResponse.json(
      { error: "Contraseña incorrecta" },
      { status: 401 }
    );
  }

  const token = await signSession();

  const response = NextResponse.json({ success: true });
  response.cookies.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });

  return response;
}
