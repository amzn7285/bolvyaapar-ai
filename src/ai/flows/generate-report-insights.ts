
'use server';

import { z } from 'zod';

const SaleRecordSchema = z.object({
  productName: z.string(),
  quantity: z.number(),
  customerName: z.string().optional(),
  salePrice: z.number(),
  saleTimestamp: z.string(),
});

const ReportInsightsInputSchema = z.object({
  salesData: z.array(SaleRecordSchema),
  language: z.enum(['en-IN', 'hi-IN']),
});
export type ReportInsightsInput = z.infer<typeof ReportInsightsInputSchema>;

const ReportInsightsOutputSchema = z.object({
  customerPatterns: z.string(),
  salesPatterns: z.string(),
  weeklyTip: z.string(),
  lessonText: z.string(),
});
export type ReportInsightsOutput = z.infer<typeof ReportInsightsOutputSchema>;

export async function generateReportInsights(input: ReportInsightsInput): Promise<ReportInsightsOutput> {
  const systemPrompt = `You are DukaanSaathi AI. Analyze the provided sales data and generate insights.
1. Customer Patterns: Recurring behaviors.
2. Sales Patterns: Trends and peak times.
3. Weekly Tip: Actionable advice.
4. lessonText: 2-sentence business insight.

PRIVACY: NEVER mention profit margins.
Respond ONLY with a valid JSON object.`;

  const userMessage = `Sales Data: ${JSON.stringify(input.salesData)}. Language: ${input.language}`;

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
    console.error('Report AI Error:', error);
    return {
      customerPatterns: "Data unavailable",
      salesPatterns: "Data unavailable",
      weeklyTip: "Keep selling!",
      lessonText: "AI connection error."
    };
  }
}
