import { Generated, Kysely, PostgresDialect } from "kysely";
import { Pool } from "pg";

interface GenderTable {
    id: Generated<number>;
    code: string;
    label: string;
    created_at: Generated<Date>;
    updated_at: Generated<Date>;
    deactivated_at: Date | null;
}

interface RateSetSupportItemPricingRegionTable {
    code: string;
    label: string;
    full_label: string;
    created_at: Generated<Date>;
    deactivated_at: Date | null;
}

interface ClientTable {
    id: Generated<number>;
    first_name: string;
    last_name: string;
    name_parts: Generated<string[]>;
    gender_id: number;
    dob: string;
    ndis_number: string;
    email: string;
    phone_number: string | null;
    address: string;
    unit_building: string | null;
    pricing_region: string;
    created_at: Generated<Date>;
    updated_at: Generated<Date>;
    deactivated_at: Date | null;
    deleted_at: Date | null;
}

interface ProviderTable {
    id: Generated<number>;
    abn: string;
    name: string;
    name_parts: Generated<string[]>;
    email: string | null;
    phone_number: string | null;
    address: string | null;
    unit_building: string | null;
    created_at: Generated<Date>;
    updated_at: Generated<Date>;
    deactivated_at: Date | null;
    deleted_at: Date | null;
}

interface InvoiceTable {
    id: Generated<number>;
    client_id: number | null;
    provider_id: number | null;
    invoice_number: string | null;
    invoice_date: string | null;
    amount: string | null;
    expected_amount: string | null;
    status: Generated<"drafted" | "completed">;
    created_at: Generated<Date>;
    updated_at: Generated<Date>;
    deleted_at: Date | null;
}

interface InvoiceItemTable {
    id: Generated<number>;
    invoice_id: number;
    rate_set_id: number | null;
    category_id: number | null;
    support_item_id: number | null;
    start_date: Date | null;
    end_date: Date | null;
    max_rate: string | null;
    unit: string | null;
    input_rate: string | null;
    amount: string | null;
    sort_order: Generated<number>;
    created_at: Generated<Date>;
    updated_at: Generated<Date>;
    deleted_at: Date | null;
}

interface InvoiceUploadBatchTable {
    id: Generated<string>;
    uploaded_by: number;
    status: Generated<"uploading" | "uploaded" | "processing" | "completed" | "completed_with_errors" | "failed">;
    file_count: number;
    total_size: string;
    error_message: string | null;
    created_at: Generated<Date>;
    updated_at: Generated<Date>;
}

interface InvoiceUploadFileTable {
    id: Generated<string>;
    batch_id: string;
    original_name: string;
    object_key: string;
    content_type: string;
    size: string;
    etag: string;
    processing_status: Generated<"queued" | "processing" | "draft_created" | "needs_review" | "failed">;
    attempt_count: Generated<number>;
    error_message: string | null;
    warnings: Generated<unknown>;
    extraction_result: unknown | null;
    invoice_id: number | null;
    ai_provider: "openai" | "openrouter" | null;
    model: string | null;
    prompt_tokens: number | null;
    completion_tokens: number | null;
    total_tokens: number | null;
    processing_started_at: Date | null;
    processing_completed_at: Date | null;
    created_at: Generated<Date>;
    updated_at: Generated<Date>;
}

export interface DB {
    gender: GenderTable;
    rate_set_support_item_pricing_region: RateSetSupportItemPricingRegionTable;
    client: ClientTable;
    provider: ProviderTable;
    invoice: InvoiceTable;
    invoice_item: InvoiceItemTable;
    invoice_upload_batch: InvoiceUploadBatchTable;
    invoice_upload_file: InvoiceUploadFileTable;
}

export const db = new Kysely<DB>({
    dialect: new PostgresDialect({
        pool: new Pool({ connectionString: process.env.DATABASE_URL }),
    }),
});
