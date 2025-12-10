export interface BotMessage {
    from: string;
    body: string;
}

export interface BotResponse {
    success: boolean;
    message?: string;
}
