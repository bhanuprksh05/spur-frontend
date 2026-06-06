import { apiRequest } from "./api";

// Fetch chat history
export async function fetchChatHistory(
    sessionId: string,
    options?: { cursor?: string; limit?: number },
) {
    const params = new URLSearchParams();

    if (options?.cursor) params.append("cursor", options.cursor);
    if (options?.limit) params.append("limit", String(options.limit));

    const query = params.toString() ? `?${params.toString()}` : "";

    return apiRequest(`/api/chat/history/${sessionId}${query}`);
}

// Send message
export async function sendChatMessage(payload: {
    content: string;
    sessionId?: string;
}) {
    return apiRequest("/api/chat/message", {
        method: "POST",
        body: payload,
    });
}

// Fetch sessions batch
export async function fetchSessionsBatch(sessionIds: string[]) {
    return apiRequest("/api/chat/sessions/batch", {
        method: "POST",
        body: { sessionIds },
    });
}