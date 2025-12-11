import { PrismaClient, Transaction } from '@prisma/client';

const prisma = new PrismaClient();

export class TransactionRepository {
    async create(
        contactId: string,
        amount: number,
        type: 'EXPENSE' | 'INCOME',
        description?: string,
        categoryId?: string,
        date?: Date
    ): Promise<Transaction> {
        return prisma.transaction.create({
            data: {
                contactId,
                amount,
                type,
                description,
                categoryId,
                date: date || new Date()
            }
        });
    }

    async getBalance(contactId: string): Promise<{ income: number, expense: number, total: number }> {
        const aggregations = await prisma.transaction.groupBy({
            by: ['type'],
            where: { contactId },
            _sum: {
                amount: true
            }
        });

        let income = 0;
        let expense = 0;

        aggregations.forEach(ago => {
            if (ago.type === 'INCOME') income = ago._sum.amount || 0;
            if (ago.type === 'EXPENSE') expense = ago._sum.amount || 0;
        });

        return {
            income,
            expense,
            total: income - expense
        };
    }
    
    // Future: Report methods
}
