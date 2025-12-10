import express from 'express';
import botRoutes from './routes/bot.routes';
import { BotService } from './services/bot.service';

const app = express();
const port = 3000;

// Initialize Bot Service (which sets up listeners)
const botService = new BotService();
botService.initialize();

// Middleware
app.use(express.json());

// Routes
app.use('/api', botRoutes);

app.get('/', (req, res) => {
    res.send('WhatsApp Bot is running (TypeScript)!');
});

// Start Server
app.listen(port, () => {
    console.log(`Express app listening at http://localhost:${port}`);
});
