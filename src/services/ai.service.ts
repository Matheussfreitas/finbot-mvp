import { GoogleGenAI } from "@google/genai";
import dotenv from 'dotenv';
import { FINBOT_PROMPT } from '../config/prompts';

dotenv.config();

class AiService {
    private ai: GoogleGenAI;
    private model: string = "gemini-2.5-flash-lite";

    constructor() {
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            console.warn("GEMINI_API_KEY not found in environment variables. AI features will not work.");
        }
        this.ai = new GoogleGenAI({ apiKey: apiKey });
    }

    public async generateResponse(userMessage: string, history: Array<{ role: 'user' | 'model', content: string }> = []): Promise<string> {
        try {
            // Convert history to Gemini format
            const historyParts = history.map(msg => ({
                role: msg.role,
                parts: [{ text: msg.content }]
            }));

            const contents = [
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

            const response = await this.ai.models.generateContent({
                model: this.model,
                contents: contents
            });


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
