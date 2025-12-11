import { logger } from '../utils/logger';

export class BotRepository {
    async logMessage(from: string, body: string): Promise<void> {
        // Here you might save to DB if you want, but user asked for "real logs" implying console/file logs too
        logger.info('BotRepository', `Message from ${from}: ${body}`);
    }
}
