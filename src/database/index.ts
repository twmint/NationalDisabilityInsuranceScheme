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
    dob: Date;
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

export interface DB {
    gender: GenderTable;
    rate_set_support_item_pricing_region: RateSetSupportItemPricingRegionTable;
    client: ClientTable;
}

export const db = new Kysely<DB>({
    dialect: new PostgresDialect({
        pool: new Pool({ connectionString: process.env.DATABASE_URL }),
    }),
});
