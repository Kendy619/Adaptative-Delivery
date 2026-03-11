import { NextRequest, NextResponse } from "next/server";
import { processClickEvent } from "@/lib/adaptation-engine";
import type { ClickEventRequest } from "@/lib/types";

/**
 * POST /api/session/event
 *
 * Registra um evento de clickstream e retorna a vitrine adaptada.
 * Atende RN01 (monitorar navegação), RN02 (identificar interesse),
 * RN03 (ajustar categorias) e RA01 (adaptação instantânea).
 */
export async function POST(request: NextRequest) {
  try {
    const body: ClickEventRequest = await request.json();

    // Validação dos campos obrigatórios
    if (!body.sessionId || !body.itemId || !body.category) {
      return NextResponse.json(
        {
          error:
            "Campos obrigatórios ausentes: sessionId, itemId e category são obrigatórios",
        },
        { status: 400 }
      );
    }

    // Normalizar eventType com fallback seguro
    if (!body.eventType) {
      body.eventType = "view";
    }

    const response = await processClickEvent(body);

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error("[POST /api/session/event] Erro:", error);

    return NextResponse.json(
      { error: "Erro interno do servidor ao processar evento" },
      { status: 500 }
    );
  }
}

/** CORS preflight */
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, X-Session-Id",
    },
  });
}
