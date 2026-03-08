
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
  const systemPrompt = `You are DukaanSaathi AI — a voice-first business partner for Indian kirana shopkeepers.

JOB 1 — Complete the task:
- Parse user input (informal Hindi/English).
- Extract product, quantity, unit, customer, and price into 'transactionDetails'.
- Confirm in 1-2 short sentences for 'spokenResponse'.

JOB 2 — Prepare lesson:
- Set 'lessonText' with a 2-sentence business insight.

PRIVACY:
1. NEVER speak profit/revenue aloud.
2. If privateMode (${input.privateMode}) is true, OMIT all prices from 'spokenResponse'.
3. End with 'Koi aur kaam?' (Hindi) or 'Anything else?' (English).

Respond ONLY with valid JSON.`;

  const userMessage = `User: "${input.userQuery}". Mode: ${input.privateMode ? 'Private' : 'Normal'}. Language: ${input.languageCode}`;

  try {
    // Calling internal secure API route
    const baseUrl = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:9002';
    const response = await fetch(`${baseUrl}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ systemPrompt, userMessage })
    });

    const data = await response.json();
    const content = data.choices[0].message.content;
    const cleanContent = content.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(cleanContent);
  } catch (error) {
    console.error('Voice AI Error:', error);
    return {
      spokenResponse: input.languageCode === 'hi-IN' ? "माफ कीजिये, कुछ गड़बड़ हो गई।" : "Sorry, something went wrong.",
      lessonText: "AI connection issue.",
      transactionDetails: {}
    };
  }
}
