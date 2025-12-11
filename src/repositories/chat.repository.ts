import { PrismaClient, Contact, Message } from '@prisma/client';
import { logger } from '../utils/logger';

const prisma = new PrismaClient();

export class ChatRepository {
    async getOrCreateContact(phone: string, name?: string): Promise<Contact> {
        logger.debug('ChatRepository', `Getting or creating contact: ${phone}`);
        let contact = await prisma.contact.findUnique({
            where: { phone }
        });

        if (!contact) {
            logger.info('ChatRepository', `Creating new contact: ${phone}`);
            contact = await prisma.contact.create({
                data: {
                    phone,
                    name
                }
            });
        } else if (name && contact.name !== name) {
             logger.debug('ChatRepository', `Updating contact name for ${phone}`);
             // Update name if changed/available
             contact = await prisma.contact.update({
                where: { id: contact.id },
                data: { name }
            });
        }

        return contact;
    }

    async saveMessage(contactId: string, role: 'user' | 'model', content: string): Promise<Message> {
        // Log truncated content to avoid massive logs for long messages
        const preview = content.length > 50 ? content.substring(0, 50) + '...' : content;
        logger.debug('ChatRepository', `Saving message for contact ${contactId} (${role}): ${preview}`);
        return prisma.message.create({
            data: {
                contactId,
                role,
                content
            }
        });
    }

    async getHistory(contactId: string, limit: number = 10): Promise<Message[]> {
        logger.debug('ChatRepository', `Fetching history for contact ${contactId} (limit: ${limit})`);
        return prisma.message.findMany({
            where: { contactId },
            orderBy: { createdAt: 'asc' }, // Get oldest to newest for context
            take: -limit // Take the last N messages
        });
    }
}
