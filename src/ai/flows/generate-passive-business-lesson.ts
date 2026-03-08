
'use server';

import { z } from 'zod';

const GeneratePassiveBusinessLessonInputSchema = z.object({
  productName: z.string(),
  quantity: z.number().optional(),
  unit: z.string().optional(),
  customerName: z.string().optional(),
  price: z.number().optional(),
  language: z.enum(['en-IN', 'hi-IN']),
});
export type GeneratePassiveBusinessLessonInput = z.infer<typeof GeneratePassiveBusinessLessonInputSchema>;

const GeneratePassiveBusinessLessonOutputSchema = z.object({
  lesson_text: z.string(),
});
export type GeneratePassiveBusinessLessonOutput = z.infer<typeof GeneratePassiveBusinessLessonOutputSchema>;

export async function generatePassiveBusinessLesson(input: GeneratePassiveBusinessLessonInput): Promise<GeneratePassiveBusinessLessonOutput> {
  const systemPrompt = `Generate a 2-sentence business insight for a kirana shopkeeper based on a transaction. 
Language: ${input.language}. Respond ONLY with JSON: {"lesson_text": "..."}`;

  const userMessage = `Transaction: ${input.productName} ${input.quantity || ''}. Price: ${input.price || 'None'}.`;

  try {
    const baseUrl = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:9002';
    const response = await fetch(`${baseUrl}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ systemPrompt, userMessage })
    });

    const data = await response.json();
    const cleanContent = data.choices[0].message.content.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(cleanContent);
  } catch (error) {
    return { lesson_text: "Focus on giving your customers the best service today!" };
  }
}
