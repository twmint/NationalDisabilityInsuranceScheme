import { NextRequest, NextResponse } from "next/server";
import { DeleteClient, UpdateClient } from "@/repositories/client.repository";
import { ValidationError } from "@/lib/errors";
import { validateClientData } from "@/lib/validators";

function parseClientId(id: string): number | null {
    const clientId = Number(id);
    return Number.isInteger(clientId) && clientId > 0 ? clientId : null;
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const clientId = parseClientId(id);

    if (clientId === null) {
        return NextResponse.json(
            { error: { code: "VALIDATION_ERROR", message: "Invalid client id." } },
            { status: 400 }
        );
    }

    try {
        const body: unknown = await request.json();
        const clientData = validateClientData(body);
        const result = await UpdateClient(clientId, clientData);
        return NextResponse.json({ data: result });
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

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const clientId = parseClientId(id);

    if (clientId === null) {
        return NextResponse.json(
            { error: { code: "VALIDATION_ERROR", message: "Invalid client id." } },
            { status: 400 }
        );
    }

    try {
        await DeleteClient(clientId);
        return NextResponse.json({ data: { id: clientId, deleted: true } });
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
