export class ValidationError extends Error {
    public code = "VALIDATION_ERROR";
    public details: Record<string, string>;

    constructor(details: Record<string, string>) {
        super("Validation failed");
        this.details = details;
    }
}
