import { db } from "@/database";

export function GetGenders() {
    return db
        .selectFrom("gender")
        .select(["id", "code", "label"])
        .where("deactivated_at", "is", null)
        .execute();
}