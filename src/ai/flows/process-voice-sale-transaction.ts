
'use server';

import { z } from 'zod';

const ProcessVoiceSaleTransactionInputSchema = z.object({
  userQuery: z.string(),
  languageCode: z.union([z.literal('en-IN'), z.literal('hi-IN')]),
  privateMode: z.boolean(),
});
export type ProcessVoiceSaleTransactionInput = z.infer<typeof ProcessVoiceSaleTransactionInputSchema>;

const ProcessVoiceSaleTransactionOutputSchema = z.object({
  spokenResponse: z.string(),
  lessonText: z.string(),
  transactionDetails: z.object({
    productName: z.string().optional(),
    quantity: z.number().optional(),
    unit: z.string().optional(),
    customerName: z.string().optional(),
    price: z.number().optional(),
  }).optional(),
});
export type ProcessVoiceSaleTransactionOutput = z.infer<typeof ProcessVoiceSaleTransactionOutputSchema>;

export async function processVoiceSaleTransaction(input: ProcessVoiceSaleTransactionInput): Promise<ProcessVoiceSaleTransactionOutput> {
  const systemPrompt = `You are DukaanSaathi AI — a voice-first business partner for Indian kirana shopkeepers. Your main goal is to assist with sales transactions and provide business insights.

JOB 1 — Complete the task (for 'spokenResponse' and 'transactionDetails'):
- Parse the user's voice input (informal Hindi, Hinglish, or English).
- Extract the product name, quantity, unit, customer name (if mentioned), and price (if mentioned) into the 'transactionDetails' object.
- Confirm the transaction in 1-2 warm, short sentences for 'spokenResponse'.

JOB 2 — Prepare a passive lesson (for 'lessonText'):
- Prepare a 'lessonText' field containing a 2-sentence business or AI insight from this transaction.

PRIVACY RULES:
1. NEVER speak profit margins, total revenue, or credit balances aloud.
2. If privateMode is active (${input.privateMode}), omit ALL financial figures from the 'spokenResponse'.
3. Keep 'spokenResponse' to 1-2 short sentences.
4. End 'spokenResponse' with 'Koi aur kaam?' if languageCode is 'hi-IN', otherwise end with 'Anything else?'.

TONE: Warm and friendly.
Language: ${input.languageCode}

IMPORTANT: Respond ONLY with a valid JSON object matching the requested schema. Do not include markdown formatting or extra text.`;

  const userMessage = `User voice input: "${input.userQuery}"`;

  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.NEXT_PUBLIC_OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://dukaansaathi-ai-syed-gulam-ahmeds-projects.vercel.app',
        'X-Title': 'DukaanSaathi AI'
      },
      body: JSON.stringify({
        model: 'google/gemini-2.0-flash-exp:free',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userMessage }
        ]
      })
    });

    const data = await response.json();
    const content = data.choices[0].message.content;
    const cleanContent = content.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(cleanContent);
  } catch (error) {
    console.error('AI Processing Error:', error);
    return {
      spokenResponse: input.languageCode === 'hi-IN' ? "माफ कीजिये, कुछ गड़बड़ हो गई।" : "Sorry, something went wrong.",
      lessonText: "AI connection issue.",
      transactionDetails: {}
    };
  }
}
