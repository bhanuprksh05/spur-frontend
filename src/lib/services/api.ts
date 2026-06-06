// lib/services/api.ts

import { PUBLIC_API_URL } from "$env/static/public";

const BASE_URL = PUBLIC_API_URL || "http://localhost:4000";

type RequestOptions = {
    method?: "GET" | "POST" | "PUT" | "DELETE";
    body?: any;
    headers?: Record<string, string>;
};

export async function apiRequest<T = any>(
    endpoint: string,
    options: RequestOptions = {},
): Promise<T> {
    const { method = "GET", body, headers = {} } = options;

    const res = await fetch(`${BASE_URL}${endpoint}`, {
        method,
        headers: {
            "Content-Type": "application/json",
            ...headers,
        },
        body: body ? JSON.stringify(body) : undefined,
    });

    let data;
    try {
        data = await res.json();
    } catch {
        throw new Error("Invalid JSON response");
    }

    if (!res.ok) {
        throw new Error(data?.error || "API request failed");
    }

    return data;
}