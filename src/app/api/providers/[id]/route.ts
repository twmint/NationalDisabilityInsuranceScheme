import { NextRequest, NextResponse } from "next/server";
import { DeleteProvider, UpdateProvider } from "@/repositories/provider.repository";
import { ValidationError } from "@/lib/errors";
import { validateProviderData } from "@/lib/validators";

function parseProviderId(id: string): number | null {
    const providerId = Number(id);
    return Number.isInteger(providerId) && providerId > 0 ? providerId : null;
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const providerId = parseProviderId(id);

    if (providerId === null) {
        return NextResponse.json(
            { error: { code: "VALIDATION_ERROR", message: "Invalid provider id." } },
            { status: 400 }
        );
    }

    try {
        const body: unknown = await request.json();
        const providerData = validateProviderData(body);
        const result = await UpdateProvider(providerId, providerData);
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
    const providerId = parseProviderId(id);

    if (providerId === null) {
        return NextResponse.json(
            { error: { code: "VALIDATION_ERROR", message: "Invalid provider id." } },
            { status: 400 }
        );
    }

    try {
        await DeleteProvider(providerId);
        return NextResponse.json({ data: { id: providerId, deleted: true } });
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
