
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
  const systemPrompt = `Generate a 2-sentence business or AI insight for a kirana shopkeeper based on a transaction. 
Tone: Friendly. 
Language: ${input.language}. 
Respond ONLY with JSON: {"lesson_text": "..."}`;

  const userMessage = `Transaction: ${input.productName} ${input.quantity || ''} ${input.unit || ''}. Customer: ${input.customerName || 'None'}. Price: ${input.price || 'None'}.`;

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
    const cleanContent = data.choices[0].message.content.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(cleanContent);
  } catch (error) {
    return { lesson_text: "AI is currently offline. Focus on customer service!" };
  }
}
