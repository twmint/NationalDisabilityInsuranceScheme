import { NextRequest, NextResponse } from "next/server";
import { AddClient, GetClients } from "@/repositories/client.repository";
import { ValidationError } from "@/lib/errors";
import { validateClientData } from "@/lib/validators";

export async function GET(request: NextRequest) {
    const params = request.nextUrl.searchParams;

    const page = Number(params.get("page") ?? "1");
    const pageSize = Number(params.get("pageSize") ?? "10");

    if (!Number.isInteger(page) || page < 1 || !Number.isInteger(pageSize) || pageSize < 1 || pageSize > 100) {
        return NextResponse.json(
            { error: { code: "VALIDATION_ERROR", message: "Invalid page or page size." } },
            { status: 400 }
        );
    }

    const status = params.get("status");
    if (status !== null && status !== "active" && status !== "inactive") {
        return NextResponse.json(
            { error: { code: "VALIDATION_ERROR", message: "status must be 'active' or 'inactive'." } },
            { status: 400 }
        );
    }

    const result = await GetClients({
        search: params.get("search") ?? undefined,
        gender: params.get("gender") ?? undefined,
        pricingRegion: params.get("pricingRegion") ?? undefined,
        status: status ?? undefined,
        page,
        pageSize,
    });

    return NextResponse.json(result);
}

export async function POST(request: NextRequest) {
    try {
        const body: unknown = await request.json();
        const clientData = validateClientData(body);
        const result = await AddClient(clientData);
        return NextResponse.json(result, { status: 201 });
    } catch (error) {
        if (error instanceof ValidationError) {
            return NextResponse.json(
                { error: { code: error.code, message: error.message, details: error.details } },
                { status: 400 }
            );
        }
        console.error(error);
        return NextResponse.json(
            { error: { code: "INTERNAL_ERROR", message: "Something went wrong." } },
            { status: 500 }
        );
    }
}

export async function PATCH(request: NextRequest) {
    const body: unknown = await request.json();
}