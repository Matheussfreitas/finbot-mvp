import { PrismaClient, Contact, Message } from '@prisma/client';

const prisma = new PrismaClient();

export class ChatRepository {
    async getOrCreateContact(phone: string, name?: string): Promise<Contact> {
        let contact = await prisma.contact.findUnique({
            where: { phone }
        });

        if (!contact) {
            contact = await prisma.contact.create({
                data: {
                    phone,
                    name
                }
            });
        } else if (name && contact.name !== name) {
             // Update name if changed/available
             contact = await prisma.contact.update({
                where: { id: contact.id },
                data: { name }
            });
        }

        return contact;
    }

    async saveMessage(contactId: string, role: 'user' | 'model', content: string): Promise<Message> {
        return prisma.message.create({
            data: {
                contactId,
                role,
                content
            }
        });
    }

    async getHistory(contactId: string, limit: number = 10): Promise<Message[]> {
        return prisma.message.findMany({
            where: { contactId },
            orderBy: { createdAt: 'asc' }, // Get oldest to newest for context
            take: -limit // Take the last N messages
        });
    }
}
