import { ValidationError } from "@/lib/errors";
import { Client } from "@/repositories/client.repository";
import { Provider } from "@/repositories/provider.repository";

const DIGITS_ONLY = /^\d+$/;
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function isNonEmptyString(value: unknown): value is string {
    return typeof value === "string" && value.trim().length > 0;
}

export function validateClientData(body: unknown): Client {
    const errors: Record<string, string> = {};
    const input = (body ?? {}) as Record<string, unknown>;

    if (!isNonEmptyString(input.first_name)) {
        errors.first_name = "First name is required and must not be empty.";
    }

    if (!isNonEmptyString(input.last_name)) {
        errors.last_name = "Last name is required and must not be empty.";
    }

    if (!isNonEmptyString(input.gender_code)) {
        errors.gender_code = "Gender is required.";
    }

    if (!isNonEmptyString(input.dob)) {
        errors.dob = "Date of birth is required.";
    }

    if (!isNonEmptyString(input.ndis_number)) {
        errors.ndis_number = "NDIS number is required.";
    } else if (!DIGITS_ONLY.test(input.ndis_number) || input.ndis_number.length > 16) {
        errors.ndis_number = "NDIS number must contain digits only, max 16 digits.";
    }

    if (!isNonEmptyString(input.email)) {
        errors.email = "Email is required.";
    } else if (!EMAIL.test(input.email)) {
        errors.email = "Email must be a valid email address.";
    }

    if (input.phone_number !== undefined && input.phone_number !== null && input.phone_number !== "") {
        if (typeof input.phone_number !== "string" || !DIGITS_ONLY.test(input.phone_number) || input.phone_number.length < 3 || input.phone_number.length > 16) {
            errors.phone_number = "Phone number must contain 3-16 digits.";
        }
    }

    if (!isNonEmptyString(input.address)) {
        errors.address = "Address is required and must not be empty.";
    }

    if (input.unit_building !== undefined && input.unit_building !== null && input.unit_building !== "") {
        if (!isNonEmptyString(input.unit_building)) {
            errors.unit_building = "Unit/Building must not be empty when provided.";
        }
    }

    if (!isNonEmptyString(input.pricing_region)) {
        errors.pricing_region = "Pricing Region is required.";
    }

    if (input.status !== undefined && input.status !== "active" && input.status !== "inactive") {
        errors.status = "Status must be 'active' or 'inactive'.";
    }

    if (Object.keys(errors).length > 0) {
        throw new ValidationError(errors);
    }

    return {
        first_name: (input.first_name as string).trim(),
        last_name: (input.last_name as string).trim(),
        gender_code: input.gender_code as string,
        dob: input.dob as Client["dob"],
        ndis_number: input.ndis_number as string,
        email: input.email as string,
        phone_number: (input.phone_number as string | undefined) || undefined,
        address: (input.address as string).trim(),
        unit_building: (input.unit_building as string | undefined)?.trim() || undefined,
        pricing_region: input.pricing_region as string,
        status: input.status as Client["status"],
    };
}

export function validateProviderData(body: unknown): Provider {
    const errors: Record<string, string> = {};
    const input = (body ?? {}) as Record<string, unknown>;

    if (!isNonEmptyString(input.abn)) {
        errors.abn = "ABN is required and must not be empty.";
    } else if (!DIGITS_ONLY.test(input.abn.trim()) || input.abn.trim().length > 11) {
        errors.abn = "ABN must contain digits only, max 11 digits.";
    }

    if (!isNonEmptyString(input.name)) {
        errors.name = "Name is required and must not be empty.";
    }

    if (!isNonEmptyString(input.email)) {
        errors.email = "Email is required.";
    } else if (!EMAIL.test(input.email)) {
        errors.email = "Email must be a valid email address.";
    }

    if (!isNonEmptyString(input.address)) {
        errors.address = "Address is required and must not be empty.";
    }

    if (input.phone_number !== undefined && input.phone_number !== null && input.phone_number !== "") {
        if (typeof input.phone_number !== "string" || !DIGITS_ONLY.test(input.phone_number) || input.phone_number.length < 3 || input.phone_number.length > 16) {
            errors.phone_number = "Phone number must contain 3-16 digits.";
        }
    }

    if (input.status !== undefined && input.status !== "active" && input.status !== "inactive") {
        errors.status = "Status must be 'active' or 'inactive'.";
    }

    if (Object.keys(errors).length > 0) {
        throw new ValidationError(errors);
    }

    return {
        abn: (input.abn as string).trim(),
        name: (input.name as string).trim(),
        email: (input.email as string).trim(),
        phone_number: (input.phone_number as string | undefined) || undefined,
        address: (input.address as string).trim(),
        unit_building: (input.unit_building as string | undefined)?.trim() || undefined,
        status: input.status as Provider["status"],
    };
}
