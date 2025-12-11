import { PrismaClient, Category } from '@prisma/client';
import { logger } from '../utils/logger';

const prisma = new PrismaClient();

export class CategoryRepository {
    async findByName(name: string, contactId?: string): Promise<Category | null> {
        logger.debug('CategoryRepository', `Finding category by name: ${name} for contact: ${contactId}`);
        const categories = await prisma.category.findMany({
            where: {
                OR: [
                    { contactId: null }, // Global category
                    { contactId: contactId } // User specific
                ]
            }
        });

        const found = categories.find(c => c.name.toLowerCase() === name.toLowerCase()) || null;
        if (found) {
             logger.debug('CategoryRepository', `Category found: ${found.id}`);
        } else {
             logger.debug('CategoryRepository', `Category not found: ${name}`);
        }
        return found;
    }

    async create(name: string, type: 'EXPENSE' | 'INCOME', contactId?: string): Promise<Category> {
        logger.info('CategoryRepository', `Creating category: ${name} (${type}) for contact: ${contactId}`);
        return prisma.category.create({
            data: {
                name,
                type,
                contactId
            }
        });
    }

    async list(contactId: string): Promise<Category[]> {
        logger.debug('CategoryRepository', `Listing categories for contact: ${contactId}`);
        return prisma.category.findMany({
            where: {
                OR: [
                    { contactId: null },
                    { contactId }
                ]
            }
        });
    }
}
