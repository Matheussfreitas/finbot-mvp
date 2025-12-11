import { TransactionService } from '../services/transaction.service';

const transactionService = new TransactionService();

interface ToolArgs {
    [key: string]: any;
}

export const executeTool = async (functionName: string, args: ToolArgs, contactPhone: string): Promise<string> => {
    try {
        switch (functionName) {
            case 'addTransaction':
                return await transactionService.addTransaction(
                    contactPhone,
                    args.amount,
                    args.description,
                    args.categoryName,
                    args.type
                );
            case 'getBalance':
                return await transactionService.getBalance(contactPhone);
            default:
                return `Function ${functionName} not found.`;
        }
    } catch (error: any) {
        console.error(`Error executing tool ${functionName}:`, error);
        return `Error executing tool: ${error.message}`;
    }
};
