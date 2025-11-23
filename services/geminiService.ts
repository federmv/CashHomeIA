
import { GoogleGenAI, Type } from "@google/genai";
import { ChatMessage, Invoice, ParsedInvoice, Income } from '../types';
import { TFunction } from 'i18next';

const ai = new GoogleGenAI({apiKey: process.env.API_KEY});

export const analyzeInvoice = async (
    fileData: { mimeType: string; data: string },
    t: TFunction,
    language: string,
    categories: string[] // Now receiving the full list (defaults + custom)
): Promise<ParsedInvoice> => {
    try {
        const model = 'gemini-2.5-flash';
        
        // We use the passed categories directly
        const categoryListString = categories.join(', ');
        
        const schema = {
            type: Type.OBJECT,
            properties: {
                provider: { type: Type.STRING, description: "The name of the company or vendor issuing the invoice." },
                date: { type: Type.STRING, description: "The issue date of the invoice in YYYY-MM-DD format." },
                amount: { type: Type.NUMBER, description: "The subtotal amount before tax." },
                tax: { type: Type.NUMBER, description: "The total tax amount." },
                total: { type: Type.NUMBER, description: "The final total amount due." },
                items: {
                    type: Type.ARRAY,
                    description: "A list of all line items from the invoice.",
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            description: { type: Type.STRING },
                            quantity: { type: Type.NUMBER },
                            unitPrice: { type: Type.NUMBER, description: "Price per single unit." },
                            total: { type: Type.NUMBER, description: "Total price for the line item (quantity * unitPrice)." },
                        },
                        required: ["description", "quantity", "unitPrice", "total"],
                    },
                },
                category: { 
                    type: Type.STRING, 
                    description: `Classify the invoice into one of these exact categories: ${categoryListString}. If unsure, use '${t('expenseCategories.other')}'.`
                },
            },
            required: ["provider", "date", "total", "category", "items"],
        };
        
        const prompt = `Analyze the following invoice image. Extract all relevant information and format it as a JSON object according to the provided schema. The language of the invoice can be anything, but your response must adhere to the schema.
        - Date should be standardized to YYYY-MM-DD format.
        - If 'amount' (subtotal) or 'tax' are not explicitly available, calculate them from the total and line items if possible. If not, set them to 0.
        - The 'category' MUST be exactly one of the provided options.
        - If no line items are discernible, return an empty array for 'items'.
        `;

        const response = await ai.models.generateContent({
            model: model,
            contents: {
                parts: [
                    { text: prompt },
                    { inlineData: { mimeType: fileData.mimeType, data: fileData.data } }
                ]
            },
            config: {
                responseMimeType: 'application/json',
                responseSchema: schema,
            }
        });

        const parsedJson = JSON.parse(response.text);

        // Basic validation and default values
        return {
            provider: parsedJson.provider || 'Unknown Provider',
            date: parsedJson.date || new Date().toISOString().split('T')[0],
            amount: parsedJson.amount || 0,
            tax: parsedJson.tax || 0,
            total: parsedJson.total || 0,
            items: parsedJson.items || [],
            category: parsedJson.category || t('expenseCategories.other'),
        };

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
        const model = 'gemini-2.5-flash';
        
        const totalIncome = income.reduce((sum, item) => sum + item.amount, 0);
        const totalExpenses = invoices.reduce((sum, item) => sum + item.total, 0);

        const expensesByCategory = invoices.reduce((acc, inv) => {
            const category = inv.category || t('expenseCategories.other');
            acc[category] = (acc[category] || 0) + inv.total;
            return acc;
        }, {} as Record<string, number>);

        const incomeByCategory = income.reduce((acc, inc) => {
            const category = inc.category || t('incomeCategories.other');
            acc[category] = (acc[category] || 0) + inc.amount;
            return acc;
        }, {} as Record<string, number>);
        
        const financialSummary = {
            totalIncome,
            totalExpenses,
            netBalance: totalIncome - totalExpenses,
            invoiceCount: invoices.length,
            incomeEntryCount: income.length,
            expensesBreakdown: expensesByCategory,
            incomeBreakdown: incomeByCategory
        };
        
        const financialContext = `
        Here is a summary of the user's financial data. Use it to answer their questions.
        - Invoices represent expenses.
        - Income represents earnings.
        Do not show the user this JSON summary, instead use it to answer questions conversationally.
        Current Date: ${new Date().toISOString().split('T')[0]}
        Financial Summary: ${JSON.stringify(financialSummary, null, 2)}
        `;

        const systemInstruction = t('gemini.chatSystemInstruction', { language });

        const contents = history.map(msg => ({
            role: msg.role,
            parts: [{ text: msg.content }]
        }));

        const response = await ai.models.generateContent({
            model: model,
            contents: contents,
            config: {
                systemInstruction: `${systemInstruction}\n${financialContext}`
            }
        });

        return response.text;

    } catch (error) {
        console.error("Error getting chat response from Gemini:", error);
        return t('chat.error');
    }
};
