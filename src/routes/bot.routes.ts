import { Router } from 'express';
import { BotController } from '../controllers/bot.controller';

const router = Router();
const botController = new BotController();

router.get('/status', botController.getStatus.bind(botController));

export default router;
