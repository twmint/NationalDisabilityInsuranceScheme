export type PgError = { code?: string; constraint?: string };

export function isPgError(error: unknown): error is PgError {
    return typeof error === "object" && error !== null && "code" in error;
}

export const PG_ERROR_CODE = {
    FOREIGN_KEY_VIOLATION: "23503",
    UNIQUE_VIOLATION: "23505",
    NOT_NULL_VIOLATION: "23502",
} as const;
