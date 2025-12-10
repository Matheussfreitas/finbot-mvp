import { Client, LocalAuth } from 'whatsapp-web.js';
import qrcode from 'qrcode-terminal';

class WhatsAppService {
    private client: Client;
    private static instance: WhatsAppService;
    private ready: boolean = false;

    private constructor() {
        this.client = new Client({
            authStrategy: new LocalAuth()
        });

        this.initializeEvents();
        this.client.initialize();
    }

    public static getInstance(): WhatsAppService {
        if (!WhatsAppService.instance) {
            WhatsAppService.instance = new WhatsAppService();
        }
        return WhatsAppService.instance;
    }

    private initializeEvents(): void {
        this.client.on('qr', (qr) => {
            console.log('QR RECEIVED', qr);
            qrcode.generate(qr, { small: true });
        });

        this.client.on('ready', () => {
            console.log('Client is ready!');
            this.ready = true;
        });
    }

    public getClient(): Client {
        return this.client;
    }

    public isReady(): boolean {
        return this.ready;
    }
}

export default WhatsAppService.getInstance();
