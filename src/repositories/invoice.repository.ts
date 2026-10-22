import { sql } from "kysely";
import { db } from "@/database";
import { ValidationError } from "@/lib/errors";

export enum InvoiceSource {
    MANUAL = 'manual',
    UPLOADED = 'uploaded'
}

export enum InvoiceStatus {
    DRAFTED = 'drafted',
    COMPLETED = 'completed'
}

export type InvoiceFilters = {
    search?: string;
    participantId?: number;
    providerId?: number;
    invoiceDate?: string;
    source?: InvoiceSource;
    page: number;
    pageSize: number;
}

export type Invoice = {
    id: number;
    client_id: number | null;
    provider_id: number | null;
    participant: string | null;
    provider: string | null;
    invoice_number: string | null;
    invoice_date: string | null;
    amount: string | null;
    expected_amount: string | null;
    status: InvoiceStatus;
    source: InvoiceSource;
}

const sourceExpr = sql<InvoiceSource>`CASE WHEN EXISTS (SELECT 1 FROM invoice_upload_file WHERE invoice_upload_file.invoice_id = invoice.id) THEN 'uploaded' ELSE 'manual' END`;

export async function GetInvoices(filters: InvoiceFilters): Promise<{ data: Invoice[]; total: number }> {
    const offset = (filters.page - 1) * filters.pageSize;

    let base = db
        .selectFrom("invoice")
        .leftJoin("client", "client.id", "invoice.client_id")
        .leftJoin("provider", "provider.id", "invoice.provider_id")
        .where("invoice.deleted_at", "is", null);

    if (filters.search) {
        base = base.where("invoice.invoice_number", "ilike", `%${filters.search}%`);
    }

    if (filters.participantId !== undefined) {
        base = base.where("invoice.client_id", "=", filters.participantId);
    }

    if (filters.providerId !== undefined) {
        base = base.where("invoice.provider_id", "=", filters.providerId);
    }

    if (filters.invoiceDate) {
        base = base.where("invoice.invoice_date", "=", filters.invoiceDate);
    }

    if (filters.source) {
        base = base.where(sourceExpr, "=", filters.source);
    }

    const [rows, countResult] = await Promise.all([
        base
            .select([
                "invoice.id",
                "invoice.client_id",
                "invoice.provider_id",
                "invoice.invoice_number",
                "invoice.status",
                sql<string | null>`concat_ws(' ', client.first_name, client.last_name)`.as("participant"),
                sql<string | null>`provider.name`.as("provider"),
                sql<string | null>`invoice.invoice_date::text`.as("invoice_date"),
                sql<string | null>`round(invoice.amount, 2)::text`.as("amount"),
                sql<string | null>`round(invoice.expected_amount, 2)::text`.as("expected_amount"),
                sourceExpr.as("source"),
            ])
            .orderBy("invoice.id", "desc")
            .limit(filters.pageSize)
            .offset(offset)
            .execute(),
        base
            .select((eb) => eb.fn.countAll<string>().as("count"))
            .executeTakeFirstOrThrow(),
    ]);

    return {
        data: rows.map((row) => ({
            ...row,
            participant: row.participant || null,
            status: row.status as InvoiceStatus,
        })),
        total: Number(countResult.count),
    };
}

export async function DeleteInvoice(invoiceId: number) {
    await db.transaction().execute(async (trx) => {
        const existing = await trx
            .selectFrom("invoice")
            .select("id")
            .where("id", "=", invoiceId)
            .where("deleted_at", "is", null)
            .executeTakeFirst();

        if (!existing) {
            throw new ValidationError({ id: `Invoice with ID ${invoiceId} does not exist.` });
        }

        const now = new Date();

        await trx
            .updateTable("invoice_item")
            .set({ deleted_at: now })
            .where("invoice_id", "=", invoiceId)
            .where("deleted_at", "is", null)
            .execute();

        await trx
            .updateTable("invoice")
            .set({ deleted_at: now })
            .where("id", "=", invoiceId)
            .execute();
    });
}
