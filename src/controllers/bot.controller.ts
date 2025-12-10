import { Request, Response } from 'express';
import whatsappService from '../services/whatsapp.service';

export class BotController {
    public getStatus(req: Request, res: Response): void {
        const isReady = whatsappService.isReady();
        res.json({
            status: isReady ? 'connected' : 'disconnected',
            timestamp: new Date()
        });
    }
}
