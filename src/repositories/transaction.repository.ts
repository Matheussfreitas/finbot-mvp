import { PrismaClient, Transaction } from '@prisma/client';
import { logger } from '../utils/logger';

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
        logger.info('TransactionRepository', `Creating transaction: ${type} ${amount} for ${contactId}`, { categoryId, description });
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
        logger.debug('TransactionRepository', `Calculating balance for ${contactId}`);
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

        const balance = {
            income,
            expense,
            total: income - expense
        };
        logger.debug('TransactionRepository', `Balance calculated`, balance);
        return balance;
    }
    
    // Future: Report methods
}
