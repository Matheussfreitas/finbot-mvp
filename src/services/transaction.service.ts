import { TransactionRepository } from '../repositories/transaction.repository';
import { CategoryRepository } from '../repositories/category.repository';
import { ChatRepository } from '../repositories/chat.repository';

export class TransactionService {
    private transactionRepo: TransactionRepository;
    private categoryRepo: CategoryRepository;
    private chatRepo: ChatRepository;

    constructor() {
        this.transactionRepo = new TransactionRepository();
        this.categoryRepo = new CategoryRepository();
        this.chatRepo = new ChatRepository();
    }

    async addTransaction(phone: string, amount: number, description: string, categoryName: string, type: 'EXPENSE' | 'INCOME'): Promise<string> {
        const contact = await this.chatRepo.getOrCreateContact(phone);
        
        let category = await this.categoryRepo.findByName(categoryName, contact.id);
        if (!category) {
            // Auto-create category if not exists (simplification for MVP flow)
            // Ideally AI should ask confirmation, but we can assume 'Food' is 'EXPENSE' based on transaction type passed
            category = await this.categoryRepo.create(categoryName, type, contact.id);
        }

        const transaction = await this.transactionRepo.create(
            contact.id,
            amount,
            type,
            description,
            category.id
        );

        return `Successfully added ${type.toLowerCase()} of ${amount} to category '${category.name}'`;
    }

    async getBalance(phone: string): Promise<string> {
        const contact = await this.chatRepo.getOrCreateContact(phone);
        const balance = await this.transactionRepo.getBalance(contact.id);
        
        return `Here is your balance:\nIncome: ${balance.income}\nExpenses: ${balance.expense}\nBalance: ${balance.total}`;
    }
}
