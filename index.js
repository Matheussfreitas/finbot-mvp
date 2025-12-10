const express = require('express');
const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');

const app = express();
const port = 3000;

const client = new Client({
    authStrategy: new LocalAuth()
});

client.on('qr', (qr) => {
    console.log('QR RECEIVED', qr);
    qrcode.generate(qr, { small: true });
});

client.on('ready', () => {
    console.log('Client is ready!');
});

client.on('message', async msg => {
    console.log('MESSAGE RECEIVED:', msg.body);
    if (msg.body === 'Ping') {
        await msg.reply('Pong');
    }
});

client.initialize();

app.get('/', (req, res) => {
    res.send('WhatsApp Bot is running!');
});

app.listen(port, () => {
    console.log(`Express app listening at http://localhost:${port}`);
});
