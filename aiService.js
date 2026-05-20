const { GoogleGenerativeAI } = require('@google/generative-ai');
const dotenv = require('dotenv');
dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.DISCORD_GEMINI_KEY || process.env.GEMINI_API_KEY);

class AIService {
    constructor() {
        this.model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    }

    /**
     * Analyzes a message for toxicity, harassment, and rule-breaking content.
     */
    async analyzeMessage(content) {
        if (!content || content.length < 2) return null;

        const prompt = `
            Analyze the following Discord message for toxicity, harassment, hate speech, or severe rule-breaking.
            Provide a response in JSON format:
            {
                "is_toxic": boolean,
                "score": float (0-1),
                "reason": "Brief reason why it was flagged",
                "category": "toxicity/harassment/hate_speech/profanity/none",
                "recommended_action": "flag/warn/delete"
            }
            
            Message: "${content}"
        `;

        try {
            const result = await this.model.generateContent(prompt);
            const response = await result.response;
            const text = response.text();

            // Extract JSON from potential markdown blocks
            const jsonStr = text.match(/\{[\s\S]*\}/)?.[0] || text;
            return JSON.parse(jsonStr);
        } catch (error) {
            console.error('[AIService] Analysis error:', error);
            return null;
        }
    }

    /**
     * Generates embed JSON data based on a user prompt.
     */
    async generateEmbedFromPrompt(userPrompt) {
        const prompt = `
            Act as a Discord Embed Designer. Generate a JSON object for a Discord embed based on this user request: "${userPrompt}".
            The JSON MUST follow this exact structure:
            {
                "title": "string",
                "description": "string",
                "color": "hex_string (e.g. #ff0000)",
                "fields": [{"name": "string", "value": "string", "inline": boolean}],
                "author": {"name": "string", "icon_url": "string"},
                "footer": {"text": "string", "icon_url": "string"},
                "thumbnail": {"url": "string"},
                "image": {"url": "string"}
            }
            Only return the JSON object. Do not include any explanation.
        `;

        try {
            const result = await this.model.generateContent(prompt);
            const response = await result.response;
            const text = response.text();

            const jsonStr = text.match(/\{[\s\S]*\}/)?.[0] || text;
            return JSON.parse(jsonStr);
        } catch (error) {
            console.error('[AIService] Generation error:', error);
            throw new Error('AI failed to generate design');
        }
    }
}

module.exports = new AIService();
