import { NextRequest, NextResponse } from "next/server";
import { getRecommendations } from "@/lib/adaptation-engine";

/**
 * GET /api/session/recommendations?sessionId=xxx
 *
 * Retorna as recomendações atuais de uma sessão existente,
 * sem registrar um novo evento. Útil para recarregar a página
 * sem perder o estado adaptativo (RN05 – acesso livre).
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId =
      searchParams.get("sessionId") ||
      request.headers.get("X-Session-Id");

    if (!sessionId) {
      return NextResponse.json(
        {
          error:
            "sessionId é obrigatório. Envie via query string (?sessionId=xxx) ou header X-Session-Id",
        },
        { status: 400 }
      );
    }

    const response = await getRecommendations(sessionId);

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error("[GET /api/session/recommendations] Erro:", error);

    return NextResponse.json(
      { error: "Erro interno ao buscar recomendações" },
      { status: 500 }
    );
  }
}
