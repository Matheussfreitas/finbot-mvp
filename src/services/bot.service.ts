import { Message } from 'whatsapp-web.js';
import whatsappService from './whatsapp.service';
import { BotRepository } from '../repositories/bot.repository';

export class BotService {
    private repository: BotRepository;

    constructor() {
        this.repository = new BotRepository();
    }

    public initialize(): void {
        const client = whatsappService.getClient();

        client.on('message', async (msg: Message) => {
            await this.handleMessage(msg);
        });
    }

    private async handleMessage(msg: Message): Promise<void> {
        await this.repository.logMessage(msg.from, msg.body);

        console.log('MESSAGE RECEIVED:', msg.body);
        if (msg.body === 'Ping') {
            await msg.reply('Pong');
        }
    }
}
