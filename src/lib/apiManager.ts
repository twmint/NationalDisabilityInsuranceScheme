export type APIErrorBody = {
    code: string;
    message: string;
    details?: unknown;
};

export class APIError extends Error {
    public code: string;
    public status: number;
    public details?: unknown;

    constructor(status: number, body: APIErrorBody) {
        super(body.message);
        this.code = body.code;
        this.status = status;
        this.details = body.details;
    }
}

export default class APIManager {
    private static instance: APIManager;
    private baseUrl: string;
    private authToken: string | null = null;

    private constructor() {
        this.baseUrl = "/api";
    }

    public static getInstance(): APIManager {
        if (!APIManager.instance) {
            APIManager.instance = new APIManager();
        }
        return APIManager.instance;
    }

    public setAuthToken(token: string): void {
        this.authToken = token;
    }

    public clearAuthToken(): void {
        this.authToken = null;
    }

    public get<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
        return this.request<T>(endpoint, { ...options, method: "GET" });
    }

    public post<T>(endpoint: string, body?: unknown, options: RequestInit = {}): Promise<T> {
        return this.request<T>(endpoint, { ...options, method: "POST", body: body !== undefined ? JSON.stringify(body) : undefined });
    }

    public patch<T>(endpoint: string, body?: unknown, options: RequestInit = {}): Promise<T> {
        return this.request<T>(endpoint, { ...options, method: "PATCH", body: body !== undefined ? JSON.stringify(body) : undefined });
    }

    public delete<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
        return this.request<T>(endpoint, { ...options, method: "DELETE" });
    }

    private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
        const url = `${this.baseUrl}${endpoint}`;
        const headers: HeadersInit = {
            ...options.headers,
            "Content-Type": "application/json",
            ...(this.authToken ? { "Authorization": `Bearer ${this.authToken}` } : {}),
        };

        const response = await fetch(url, { ...options, headers });
        if (!response.ok) {
            const body = await response.json().catch(() => null);
            if (body?.error) {
                throw new APIError(response.status, body.error);
            }
            throw new APIError(response.status, { code: "UNKNOWN_ERROR", message: `HTTP error! status: ${response.status}` });
        }

        return response.json() as Promise<T>;
    }
}