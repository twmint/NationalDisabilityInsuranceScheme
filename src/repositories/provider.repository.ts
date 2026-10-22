import { db } from "@/database";
import { ValidationError } from "@/lib/errors";

export type ProviderFilters = {
    search?: string;
    status?: "active" | "inactive";
    page: number;
    pageSize: number;
};

export type Provider = {
    id?: number;
    abn: string;
    name: string;
    email: string;
    phone_number?: string | null;
    address: string;
    unit_building?: string | null;
    status?: "active" | "inactive";
};

export async function GetProviders(filters: ProviderFilters): Promise<{ data: Provider[]; total: number }> {
    const offset = (filters.page - 1) * filters.pageSize;

    let base = db
        .selectFrom("provider")
        .where("provider.deleted_at", "is", null);

    if (filters.search) {
        const term = `%${filters.search}%`;
        base = base.where((eb) =>
            eb.or([
                eb("provider.abn", "ilike", term),
                eb("provider.name", "ilike", term),
                eb("provider.email", "ilike", term),
            ])
        );
    }

    if (filters.status === "active") {
        base = base.where("provider.deactivated_at", "is", null);
    } else if (filters.status === "inactive") {
        base = base.where("provider.deactivated_at", "is not", null);
    }

    const [rows, countResult] = await Promise.all([
        base
            .select((eb) => [
                "provider.id",
                "provider.abn",
                "provider.name",
                "provider.email",
                "provider.phone_number",
                "provider.address",
                "provider.unit_building",
                eb.case()
                    .when("provider.deactivated_at", "is", null)
                    .then("active")
                    .else("inactive")
                    .end()
                    .as("status"),
            ])
            .orderBy("provider.id")
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
            abn: row.abn,
            name: row.name,
            email: row.email ?? "",
            phone_number: row.phone_number,
            address: row.address ?? "",
            unit_building: row.unit_building,
            status: row.status as "active" | "inactive",
        })),
        total: Number(countResult.count),
    };
}

export async function GetProviderOptions(): Promise<{ id: number; name: string }[]> {
    return await db
        .selectFrom("provider")
        .select(["id", "name"])
        .where("deleted_at", "is", null)
        .orderBy("name")
        .execute();
}

export async function AddProvider(providerData: Provider) {
    return await db
        .insertInto("provider")
        .values({
            abn: providerData.abn,
            name: providerData.name,
            email: providerData.email,
            phone_number: providerData.phone_number ?? null,
            address: providerData.address,
            unit_building: providerData.unit_building ?? null,
        })
        .returning(["id"])
        .executeTakeFirstOrThrow();
}

export async function DeleteProvider(providerId: number) {
    const existing = await db
        .selectFrom("provider")
        .select("id")
        .where("id", "=", providerId)
        .where("deleted_at", "is", null)
        .executeTakeFirst();

    if (!existing) {
        throw new ValidationError({ id: `Provider with ID ${providerId} does not exist.` });
    }

    await db
        .updateTable("provider")
        .set({ deleted_at: new Date() })
        .where("id", "=", providerId)
        .execute();
}

export async function UpdateProvider(providerId: number, providerData: Provider) {
    const existing = await db
        .selectFrom("provider")
        .select(["id", "deactivated_at"])
        .where("id", "=", providerId)
        .where("deleted_at", "is", null)
        .executeTakeFirst();

    if (!existing) {
        throw new ValidationError({ id: `Provider with ID ${providerId} does not exist.` });
    }

    const deactivated_at = providerData.status === "inactive" ? existing.deactivated_at ?? new Date() : null;

    return await db
        .updateTable("provider")
        .set({
            abn: providerData.abn,
            name: providerData.name,
            email: providerData.email,
            phone_number: providerData.phone_number ?? null,
            address: providerData.address,
            unit_building: providerData.unit_building ?? null,
            deactivated_at,
        })
        .where("id", "=", providerId)
        .returning(["id"])
        .executeTakeFirstOrThrow();
}
