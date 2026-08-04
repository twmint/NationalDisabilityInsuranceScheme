import { db } from "@/database";

export function GetPricingRegions() {
    return db
        .selectFrom("rate_set_support_item_pricing_region")
        .select(["code", "label", "full_label"])
        .where("deactivated_at", "is", null)
        .execute();
}
