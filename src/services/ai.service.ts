import { GoogleGenAI, Tool } from "@google/genai";
import dotenv from 'dotenv';
import { FINBOT_PROMPT } from '../config/prompts';
import { tools } from '../tools/definitions';
import { executeTool } from '../tools/index';

dotenv.config();

class AiService {
    private ai: GoogleGenAI;
    private model: string = "gemini-2.5-flash";

    constructor() {
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            console.warn("GEMINI_API_KEY not found in environment variables. AI features will not work.");
        }
        this.ai = new GoogleGenAI({ apiKey: apiKey });
    }

    public async generateResponse(userMessage: string, history: Array<{ role: 'user' | 'model', content: string }> = [], contactPhone: string): Promise<string> {
        try {
            // Convert history to Gemini format
            const historyParts = history.map(msg => ({
                role: msg.role,
                parts: [{ text: msg.content }]
            }));

            const contents: any[] = [
                 {
                    role: "user",
                    parts: [{ text: FINBOT_PROMPT }]
                },
                ...historyParts,
                {
                    role: "user",
                    parts: [{ text: userMessage }]
                }
            ];

            const toolConfig: Tool[] = [{ functionDeclarations: tools }];

            let response = await this.ai.models.generateContent({
                model: this.model,
                contents: contents,
                tools: toolConfig
            } as any);

            // Handle Function Calls
            // Accessing functionCalls correctly based on SDK version (likely property or method, ensuring safe access)
            // If response.functionCalls is a getter returning array (some versions) or a property
            // The error said `Type 'FunctionCall[]' has no call signatures`, so it is likely a property array.
            // Using logic:
            let functionCall = (response.functionCalls && response.functionCalls.length > 0) ? response.functionCalls[0] : undefined;
            
            // Loop to handle cascading function calls
            while (functionCall) {
                const { name, args } = functionCall;
                if (!name) {
                     console.error("Function call name is undefined");
                     break;
                }
                console.log(`Executing tool: ${name} with args:`, args);
                
                const toolResult = await executeTool(name, args || {}, contactPhone);
                
                // Add function call and response to history
                contents.push({
                    role: "model",
                    parts: [{ functionCall: { name, args } }]
                });
                
                contents.push({
                    role: "user", 
                    parts: [{ functionResponse: { name, response: { result: toolResult } } }]
                });

                // Generate new response
                 response = await this.ai.models.generateContent({
                    model: this.model,
                    contents: contents,
                    tools: toolConfig
                } as any);

                functionCall = (response.functionCalls && response.functionCalls.length > 0) ? response.functionCalls[0] : undefined;
            }

            const text = response.text;
            return text || "I'm sorry, I couldn't generate a response.";
        } catch (error) {
            console.error("Error generating AI response:", error);
            return "I'm having trouble processing your request right now. Please try again later.";
        }
    }

    public async generateResponseWithImage(userMessage: string, imagePath: string): Promise<string> {
        return "Image processing is not yet implemented.";
    }
}

export default new AiService();
