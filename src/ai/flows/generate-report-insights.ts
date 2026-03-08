
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
  const systemPrompt = `Analyze sales data and return: 
1. Customer Patterns
2. Sales Patterns
3. Weekly Tip
4. lessonText

PRIVACY: NEVER mention exact revenue/profit margins. 
Language: ${input.language}. Respond ONLY with JSON.`;

  const userMessage = `Sales Data: ${JSON.stringify(input.salesData)}`;

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
    console.error('Report AI Error:', error);
    return {
      customerPatterns: "Data processing unavailable",
      salesPatterns: "Data processing unavailable",
      weeklyTip: "Continue tracking your sales for better insights.",
      lessonText: "Connection error."
    };
  }
}
