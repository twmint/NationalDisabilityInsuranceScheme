import { NextRequest, NextResponse } from "next/server";
import { GetInvoices, InvoiceSource } from "@/repositories/invoice.repository";

function parseId(value: string | null): number | undefined | null {
    if (value === null || value === "") return undefined;
    const id = Number(value);
    return Number.isInteger(id) && id > 0 ? id : null;
}

function badRequest(message: string) {
    return NextResponse.json({ error: { code: "VALIDATION_ERROR", message } }, { status: 400 });
}

export async function GET(request: NextRequest) {
    const params = request.nextUrl.searchParams;

    const page = Number(params.get("page") ?? "1");
    const pageSize = Number(params.get("pageSize") ?? "10");

    if (!Number.isInteger(page) || page < 1 || !Number.isInteger(pageSize) || pageSize < 1 || pageSize > 100) {
        return badRequest("Invalid page or page size.");
    }

    const participantId = parseId(params.get("participant"));
    if (participantId === null) return badRequest("participant must be a valid id.");

    const providerId = parseId(params.get("provider"));
    if (providerId === null) return badRequest("provider must be a valid id.");

    const invoiceDate = params.get("invoiceDate") || undefined;
    if (invoiceDate !== undefined && !/^\d{4}-\d{2}-\d{2}$/.test(invoiceDate)) {
        return badRequest("invoiceDate must be YYYY-MM-DD.");
    }

    const source = params.get("source") || undefined;
    if (source !== undefined && source !== InvoiceSource.MANUAL && source !== InvoiceSource.UPLOADED) {
        return badRequest("source must be 'manual' or 'uploaded'.");
    }

    const result = await GetInvoices({
        search: params.get("search") ?? undefined,
        participantId,
        providerId,
        invoiceDate,
        source: source as InvoiceSource | undefined,
        page,
        pageSize,
    });

    return NextResponse.json(result);
}
