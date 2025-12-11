import { FunctionDeclaration } from "@google/genai";

// Use SchemaType if available, otherwise fallback to strings if import fails (but we try to import it)
// If SchemaType is not exported, we use 'STRING', 'NUMBER', 'OBJECT'
// Based on error "Module ... has no exported member 'SchemaType'", we CANNOT import it.
// So we use string literals casts as any or complying with the type.

export const tools: FunctionDeclaration[] = [
    {
        name: "addTransaction",
        description: "Add a new financial transaction (expense or income) to the database.",
        parameters: {
            type: "OBJECT" as any,
            properties: {
                amount: {
                    type: "NUMBER" as any,
                    description: "The amount of money involved in the transaction."
                },
                description: {
                    type: "STRING" as any,
                    description: "A brief description of the transaction (e.g., 'McDonalds', 'Salary')."
                },
                categoryName: {
                    type: "STRING" as any,
                    description: "The category of the transaction (e.g., 'Food', 'Transport', 'Salary')."
                },
                type: {
                    type: "STRING" as any,
                    description: "The type of transaction. Must be either 'EXPENSE' or 'INCOME'.",
                    enum: ["EXPENSE", "INCOME"]
                }
            },
            required: ["amount", "description", "categoryName", "type"]
        }
    },
    {
        name: "getBalance",
        description: "Get the current financial balance (income, expenses, and total).",
        parameters: {
            type: "OBJECT" as any,
            properties: {
            }
        }
    }
];
