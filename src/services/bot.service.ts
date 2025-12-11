import { Message, MessageTypes } from 'whatsapp-web.js';
import whatsappService from './whatsapp.service';
import aiService from './ai.service';
import { BotRepository } from '../repositories/bot.repository';
import { ChatRepository } from '../repositories/chat.repository';

export class BotService {
    private repository: BotRepository;
    private chatRepository: ChatRepository;

    constructor() {
        this.repository = new BotRepository();
        this.chatRepository = new ChatRepository();
    }

    public initialize(): void {
        const client = whatsappService.getClient();

        client.on('message', async (msg: Message) => {
            await this.handleMessage(msg);
        });
    }

    private async handleMessage(msg: Message): Promise<void> {
        // Ignore status updates
        if (msg.from === 'status@broadcast') {
            return;
        }

        // Ignore group messages
        if ((await msg.getChat()).isGroup) {
            return;
        }

        await this.repository.logMessage(msg.from, msg.body);

        if (msg.type === MessageTypes.TEXT) {
          await this.handleTextMessage(msg);
        }
    }

    private async handleTextMessage(msg: Message) {
      console.log('TEXT MESSAGE RECEIVED:', msg.body);
      
       // Retrieve or create contact
      const contact = await this.chatRepository.getOrCreateContact(msg.from);

      // Save user message
      await this.chatRepository.saveMessage(contact.id, 'user', msg.body);

      // Get history for context
      const history = await this.chatRepository.getHistory(contact.id, 10);
      const formattedHistory = history.map(m => ({ role: m.role as 'user' | 'model', content: m.content }));

      // Generate AI response for other messages
      const aiResponse = await aiService.generateResponse(msg.body, formattedHistory);
      
      // Save AI response
      await this.chatRepository.saveMessage(contact.id, 'model', aiResponse);

      await msg.reply(aiResponse);
    }
}
