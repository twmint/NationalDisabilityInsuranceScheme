import { sql } from "kysely";
import { db } from "@/database";
import { isPgError, PG_ERROR_CODE } from "@/database/pgError";
import { ValidationError } from "@/lib/errors";

export type ClientFilters = {
    search?: string;
    gender?: string;
    pricingRegion?: string;
    status?: "active" | "inactive";
    page: number;
    pageSize: number;
};

// Shape hint only (YYYY-MM-DD) — actual validity is checked at runtime by isValidIsoDate
export type IsoDateString = `${number}-${number}-${number}`;

export type Client = {
    id?: number;                 // present on rows read from the DB, absent on create/update payloads
    first_name: string;
    last_name: string;
    gender_code: string;         // gender code — used both as create/update payload field and on rows read from the DB
    gender_label?: string;       // present on rows read from the DB (display only)
    dob: IsoDateString;
    ndis_number: string;
    email: string;
    phone_number?: string | null;
    address: string;
    unit_building?: string | null;
    pricing_region: string;      // pricing region code — validated against rate_set_support_item_pricing_region(code) at insert (FK)
    status?: "active" | "inactive"; // present on rows read from the DB
};

function isValidIsoDate(value: string): boolean {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
    const date = new Date(value);
    return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
}


export async function GetClients(filters: ClientFilters): Promise<{ data: Client[]; total: number }> {
    const offset = (filters.page - 1) * filters.pageSize;

    let base = db
        .selectFrom("client")
        .innerJoin("gender", "gender.id", "client.gender_id")
        .innerJoin("rate_set_support_item_pricing_region", "rate_set_support_item_pricing_region.code", "client.pricing_region")
        .where("client.deleted_at", "is", null);

    if (filters.search) {
        const term = `%${filters.search}%`;
        base = base.where((eb) =>
            eb.or([
                eb("client.first_name", "ilike", term),
                eb("client.last_name", "ilike", term),
                eb("client.email", "ilike", term),
                eb("client.ndis_number", "ilike", term),
            ])
        );
    }

    if (filters.gender) {
        base = base.where("gender.code", "=", filters.gender);
    }

    if (filters.pricingRegion) {
        base = base.where("client.pricing_region", "=", filters.pricingRegion);
    }

    if (filters.status === "active") {
        base = base.where("client.deactivated_at", "is", null);
    } else if (filters.status === "inactive") {
        base = base.where("client.deactivated_at", "is not", null);
    }

    const [rows, countResult] = await Promise.all([
        base
            .select((eb) => [
                "client.id",
                "client.first_name",
                "client.last_name",
                "gender.code as gender_code",
                "gender.label as gender_label",
                sql<string>`client.dob::text`.as("dob"),
                "client.ndis_number",
                "client.email",
                "client.phone_number",
                "client.address",
                "client.unit_building",
                "rate_set_support_item_pricing_region.label as pricing_region",
                eb.case()
                    .when("client.deactivated_at", "is", null)
                    .then("active")
                    .else("inactive")
                    .end()
                    .as("status"),
            ])
            .orderBy("client.id")
            .limit(filters.pageSize)
            .offset(offset)
            .execute(),
        base
            .select((eb) => eb.fn.countAll<string>().as("count"))
            .executeTakeFirstOrThrow(),
    ]);

    return {
        data: rows.map((row) => ({
            id: row.id,
            first_name: row.first_name,
            last_name: row.last_name,
            gender_code: row.gender_code,
            gender_label: row.gender_label,
            dob: row.dob as IsoDateString,
            ndis_number: row.ndis_number,
            email: row.email,
            phone_number: row.phone_number,
            address: row.address,
            unit_building: row.unit_building,
            pricing_region: row.pricing_region,
            status: row.status as "active" | "inactive",
        })),
        total: Number(countResult.count),
    };
}

export async function AddClient(clientData: Client) {
    if (typeof clientData.dob !== "string" || !isValidIsoDate(clientData.dob)) {
        throw new ValidationError({ dob: "Date of birth must be a valid ISO date (YYYY-MM-DD)." });
    }

    const gender = await db
        .selectFrom("gender")
        .select("id")
        .where("code", "=", clientData.gender_code)
        .where("deactivated_at", "is", null)
        .executeTakeFirst();

    if (!gender) {
        throw new ValidationError({ gender_code: `Unknown gender code: ${clientData.gender_code}` });
    }

    try {
        return await db
            .insertInto("client")
            .values({
                first_name: clientData.first_name,
                last_name: clientData.last_name,
                gender_id: gender.id,
                dob: clientData.dob,
                ndis_number: clientData.ndis_number,
                email: clientData.email,
                phone_number: clientData.phone_number ?? null,
                address: clientData.address,
                unit_building: clientData.unit_building ?? null,
                pricing_region: clientData.pricing_region,
            })
            .returning(["id"])
            .executeTakeFirstOrThrow();
    } catch (error) {
        if (isPgError(error) && error.code === PG_ERROR_CODE.FOREIGN_KEY_VIOLATION && error.constraint === "client_pricing_region_fkey") {
            throw new ValidationError({ pricing_region: `Unknown pricing region code: ${clientData.pricing_region}` });
        }
        if (isPgError(error) && error.code === PG_ERROR_CODE.UNIQUE_VIOLATION && error.constraint === "client_unique_ndis_number") {
            throw new ValidationError({ ndis_number: `NDIS number already in use: ${clientData.ndis_number}` });
        }
        throw error;
    }
}

export async function DeleteClient(clientId: number) {
    const existing = await db
        .selectFrom("client")
        .select("id")
        .where("id", "=", clientId)
        .where("deleted_at", "is", null)
        .executeTakeFirst();

    if (!existing) {
        throw new ValidationError({ id: `Client with ID ${clientId} does not exist.` });
    }

    await db
        .updateTable("client")
        .set({ deleted_at: new Date() })
        .where("id", "=", clientId)
        .execute();
}

export async function UpdateClient(clientId: number, clientData: Client) {
    if (typeof clientData.dob !== "string" || !isValidIsoDate(clientData.dob)) {
        throw new ValidationError({ dob: "Date of birth must be a valid ISO date (YYYY-MM-DD)." });
    }

    const existing = await db
        .selectFrom("client")
        .select(["id", "deactivated_at"])
        .where("id", "=", clientId)
        .where("deleted_at", "is", null)
        .executeTakeFirst();

    if (!existing) {
        throw new ValidationError({ id: `Client with ID ${clientId} does not exist.` });
    }

    const gender = await db
        .selectFrom("gender")
        .select("id")
        .where("code", "=", clientData.gender_code)
        .where("deactivated_at", "is", null)
        .executeTakeFirst();

    if (!gender) {
        throw new ValidationError({ gender_code: `Unknown gender code: ${clientData.gender_code}` });
    }

    const deactivated_at = clientData.status === "inactive" ? existing.deactivated_at ?? new Date() : null;

    try {
        return await db
            .updateTable("client")
            .set({
                first_name: clientData.first_name,
                last_name: clientData.last_name,
                gender_id: gender.id,
                dob: clientData.dob,
                ndis_number: clientData.ndis_number,
                email: clientData.email,
                phone_number: clientData.phone_number ?? null,
                address: clientData.address,
                unit_building: clientData.unit_building ?? null,
                pricing_region: clientData.pricing_region,
                deactivated_at,
            })
            .where("id", "=", clientId)
            .returning(["id"])
            .executeTakeFirstOrThrow();
    } catch (error) {
        if (isPgError(error) && error.code === PG_ERROR_CODE.FOREIGN_KEY_VIOLATION && error.constraint === "client_pricing_region_fkey") {
            throw new ValidationError({ pricing_region: `Unknown pricing region code: ${clientData.pricing_region}` });
        }
        if (isPgError(error) && error.code === PG_ERROR_CODE.UNIQUE_VIOLATION && error.constraint === "client_unique_ndis_number") {
            throw new ValidationError({ ndis_number: `NDIS number already in use: ${clientData.ndis_number}` });
        }
        throw error;
    }
}