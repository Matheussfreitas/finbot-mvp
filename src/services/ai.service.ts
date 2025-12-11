import { GoogleGenAI, Tool } from "@google/genai";
import dotenv from 'dotenv';
import { FINBOT_PROMPT } from '../config/prompts';
import { tools } from '../tools/definitions';
import { executeTool } from '../tools/index';
import { logger } from '../utils/logger';

dotenv.config();

class AiService {
    private ai: GoogleGenAI;
    private model: string = "gemini-2.0-flash-lite";

    constructor() {
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            console.warn("GEMINI_API_KEY not found in environment variables. AI features will not work.");
        }
        this.ai = new GoogleGenAI({ apiKey: apiKey });
    }

    private async safeGenerateContent(params: any, retries: number = 3): Promise<any> {
        for (let attempt = 1; attempt <= retries; attempt++) {
            try {
                return await this.ai.models.generateContent(params);
            } catch (error: any) {
                if (error.response?.status === 429 || error.status === 429 || error.message?.includes('429')) {
                     logger.warn('AiService', `Gemini API 429 (Too Many Requests) handled. Attempt ${attempt}/${retries}`);
                     if (attempt === retries) {
                         logger.error('AiService', 'Gemini API 429: Max retries reached.');
                         throw error;
                     }
                     // Exponential backoff: 1s, 2s, 4s
                     const delay = Math.pow(2, attempt - 1) * 1000;
                     await new Promise(resolve => setTimeout(resolve, delay));
                } else {
                    throw error;
                }
            }
        }
    }

    public async generateResponse(userMessage: string, history: Array<{ role: 'user' | 'model', content: string }> = [], contactPhone: string): Promise<string> {
        try {
            logger.info('AiService', `Generating response for ${contactPhone}`, { userMessage });

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

            logger.debug('AiService', 'Calling Gemini API (Initial)');
            let response = await this.safeGenerateContent({
                model: this.model,
                contents: contents,
                tools: toolConfig
            });

            // Handle Function Calls
            let functionCall = (response.functionCalls && response.functionCalls.length > 0) ? response.functionCalls[0] : undefined;
            
            // Loop to handle cascading function calls
            while (functionCall) {
                const { name, args } = functionCall;
                if (!name) {
                     logger.error('AiService', "Function call name is undefined");
                     break;
                }
                logger.info('AiService', `Executing tool: ${name}`, args);
                
                let toolResult;
                try {
                    toolResult = await executeTool(name, args || {}, contactPhone);
                    logger.info('AiService', `Tool ${name} executed successfully`, toolResult);
                } catch (err) {
                    logger.error('AiService', `Error executing tool ${name}`, err);
                    toolResult = { error: "Failed to execute tool" };
                }
                
                // Add function call and response to history (Conversation Context)
                contents.push({
                    role: "model",
                    parts: [{ functionCall: { name, args } }]
                });
                
                contents.push({
                    role: "user", 
                    parts: [{ functionResponse: { name, response: { result: toolResult } } }]
                });

                logger.debug('AiService', 'Calling Gemini API (Post-Tool)');
                // Generate new response with tool result
                 response = await this.safeGenerateContent({
                    model: this.model,
                    contents: contents,
                    tools: toolConfig
                });

                functionCall = (response.functionCalls && response.functionCalls.length > 0) ? response.functionCalls[0] : undefined;
            }

            const text = response.text;
            logger.info('AiService', 'Generated final response', { text });
            
            if (text && (text.includes('```json') || text.includes('tool_code'))) {
                 logger.warn('AiService', 'Detected potential JSON leak in response, attempting to clean', { text });
            }

            return text || "Desculpe, não consegui processar sua solicitação.";
        } catch (error) {
            logger.error('AiService', "Error generating AI response", error);
            // If it's the 429 that bubbled up
            if ((error as any).status === 429 || (error as any).response?.status === 429) {
                 return "Muitas pessoas estão falando comigo agora! 😵‍💫 Tente novamente em alguns segundos.";
            }
            return "Estou com dificuldades para processar seu pedido agora. Tente novamente mais tarde.";
        }
    }

    public async generateResponseWithImage(userMessage: string, imagePath: string): Promise<string> {
        return "Image processing is not yet implemented.";
    }
}

export default new AiService();
