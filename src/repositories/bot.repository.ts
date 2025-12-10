export class BotRepository {
    async logMessage(from: string, body: string): Promise<void> {
        console.log(`[Repository] Logged message from ${from}: ${body}`);
    }
}
