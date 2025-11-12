import { GoogleGenAI, Type } from "@google/genai";
import { ChatMessage, Invoice, ParsedInvoice, Income } from '../types';
import { TFunction } from 'i18next';

const getAiClient = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

const getExpenseCategories = (t: TFunction) => [
    t('expenseCategories.software'),
    t('expenseCategories.utilities'),
    t('expenseCategories.office'),
    t('expenseCategories.marketing'),
    t('expenseCategories.travel'),
    t('expenseCategories.meals'),
    t('expenseCategories.services'),
    t('expenseCategories.rent'),
    t('expenseCategories.payroll'),
    t('expenseCategories.inventory'),
    t('expenseCategories.other'),
];

export const analyzeInvoice = async (
    fileData: { mimeType: string; data: string },
    t: TFunction,
    language: string
): Promise<ParsedInvoice> => {
    try {
        const ai = getAiClient();
        const categories = getExpenseCategories(t);
        const promptText = t('gemini.analyzeInvoicePrompt', {
            language,
            categories: categories.join(", "),
        });
        
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: {
                parts: [
                    {
                        inlineData: {
                            mimeType: fileData.mimeType,
                            data: fileData.data,
                        },
                    },
                    { text: promptText },
                ],
            },
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        provider: { type: Type.STRING, description: "The name of the company that issued the invoice." },
                        date: { type: Type.STRING, description: "The date of the invoice in YYYY-MM-DD format." },
                        amount: { type: Type.NUMBER, description: "The subtotal or amount before taxes." },
                        tax: { type: Type.NUMBER, description: "The total tax amount." },
                        total: { type: Type.NUMBER, description: "The final total amount including tax." },
                        category: { type: Type.STRING, description: `The most appropriate expense category. Must be one of: ${categories.join(", ")}` },
                        items: {
                            type: Type.ARRAY,
                            description: "A list of all line items from the invoice.",
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    description: { type: Type.STRING, description: "The description of the line item." },
                                    quantity: { type: Type.NUMBER, description: "The quantity of the item." },
                                    unitPrice: { type: Type.NUMBER, description: "The price per unit of the item." },
                                    total: { type: Type.NUMBER, description: "The total price for the line item (quantity * unitPrice)." },
                                },
                                required: ["description", "quantity", "unitPrice", "total"]
                            }
                        }
                    },
                    required: ["provider", "date", "amount", "tax", "total", "category", "items"],
                },
            },
        });
        
        const jsonString = response.text.trim();
        const parsedData: ParsedInvoice = JSON.parse(jsonString);
        
        if (typeof parsedData.provider !== 'string' || typeof parsedData.date !== 'string' || typeof parsedData.total !== 'number' || !Array.isArray(parsedData.items)) {
            throw new Error('Parsed data is missing required fields.');
        }

        return parsedData;

    } catch (error) {
        console.error("Error analyzing invoice with Gemini:", error);
        throw new Error(t('gemini.invoiceAnalysisError'));
    }
};

export const getChatResponse = async (
    history: ChatMessage[], 
    invoices: Invoice[], 
    income: Income[],
    t: TFunction,
    language: string
): Promise<string> => {
    try {
        const ai = getAiClient();
        const context = `
        - Invoices represent expenses.
        - Income represents earnings.
        Do not mention that you are using this JSON data unless asked.
        Invoice Data: ${JSON.stringify(invoices)}
        Income Data: ${JSON.stringify(income)}
        `;

        const systemInstruction = t('gemini.chatSystemInstruction', { language });
        
        const contents = history.map((msg, i) => {
            let content = msg.content;
            if (i === 0) {
                // Prepend context to the very first message of the conversation.
                content = `${context}\n\n${content}`;
            }
            return {
                role: msg.role,
                parts: [{ text: content }],
            };
        });

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: contents,
            config: {
                systemInstruction: systemInstruction,
            },
        });

        return response.text;
    } catch (error) {
        console.error("Error getting chat response from Gemini:", error);
        return t('chat.error');
    }
};