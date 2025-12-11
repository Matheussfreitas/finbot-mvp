import { PrismaClient, Category } from '@prisma/client';

const prisma = new PrismaClient();

export class CategoryRepository {
    async findByName(name: string, contactId?: string): Promise<Category | null> {
        const categories = await prisma.category.findMany({
            where: {
                OR: [
                    { contactId: null }, // Global category
                    { contactId: contactId } // User specific
                ]
            }
        });

        return categories.find(c => c.name.toLowerCase() === name.toLowerCase()) || null;
    }

    async create(name: string, type: 'EXPENSE' | 'INCOME', contactId?: string): Promise<Category> {
        return prisma.category.create({
            data: {
                name,
                type,
                contactId
            }
        });
    }

    async list(contactId: string): Promise<Category[]> {
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
