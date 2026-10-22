import { NextRequest, NextResponse } from "next/server";
import { DeleteInvoice } from "@/repositories/invoice.repository";
import { ValidationError } from "@/lib/errors";

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const invoiceId = Number(id);

    if (!Number.isInteger(invoiceId) || invoiceId < 1) {
        return NextResponse.json(
            { error: { code: "VALIDATION_ERROR", message: "Invalid invoice id." } },
            { status: 400 }
        );
    }

    try {
        await DeleteInvoice(invoiceId);
        return NextResponse.json({ data: { id: invoiceId, deleted: true } });
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
