
"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Eye, TrendingUp, BarChart2, Loader2, Share2, Wallet } from "lucide-react";
import { format } from "date-fns";
import { toast } from "@/hooks/use-toast";

interface DukaanTabProps {
  privateMode: boolean;
  language: "hi-IN" | "en-IN";
  sales: any[];
  profile: any;
  totalOutstanding: number;
  onGenerateSummary: () => void;
  isGeneratingSummary?: boolean;
}

export default function DukaanTab({ privateMode, language, sales, profile, totalOutstanding, onGenerateSummary, isGeneratingSummary }: DukaanTabProps) {
  const [revealedSales, setRevealedSales] = useState<Set<number>>(new Set());
  
  const today = new Date().toDateString();
  const todaySales = sales.filter(s => new Date(s.timestamp).toDateString() === today);
  const totalAmount = todaySales.reduce((acc, curr) => acc + (curr.amount || 0), 0);
  const count = todaySales.length;

  const texts = {
    "hi-IN": {
      todaySales: "आज की बिक्री",
      recentSales: "हाल की बिक्री",
      outstanding: "उधार बाकी (Outstanding)",
      txns: "लेन-देन",
      tapToReveal: "कीमत देखने के लिए टैप करें",
      empty: "कोई बिक्री नहीं",
      summary: "आज का हिसाब",
      share: "WhatsApp"
    },
    "en-IN": {
      todaySales: "Today's Sales",
      recentSales: "Recent Sales",
      outstanding: "Total Outstanding",
      txns: "txns",
      tapToReveal: "Tap to reveal",
      empty: "No sales yet",
      summary: "Summary",
      share: "Share"
    }
  }[language];

  return (
    <div className="space-y-4">
      {/* Outstanding Balance Banner */}
      <Card className="bg-amber-50 border-amber-200 rounded-2xl shadow-sm border">
        <CardContent className="p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-amber-200 flex items-center justify-center text-amber-700">
              <Wallet size={20} />
            </div>
            <div>
              <p className="text-[10px] font-bold text-amber-600 uppercase tracking-widest">{texts.outstanding}</p>
              <p className={cn("text-xl font-black text-amber-900 transition-all", privateMode && "blur-md")}>
                ₹{totalOutstanding.toLocaleString()}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Today's Sales Card */}
      <Card className="bg-[#0D2240] border-none rounded-[24px] overflow-hidden shadow-xl">
        <CardContent className="p-6 relative">
          <TrendingUp size={64} className="absolute right-[-10px] bottom-[-10px] text-white/5 rotate-12" />
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-white/40 text-[10px] font-bold uppercase tracking-widest mb-1">{texts.todaySales}</p>
              <div className="flex items-baseline gap-1">
                <span className="text-xl font-bold text-[#C45000]">₹</span>
                <span className={cn("text-[32px] font-black text-white transition-all", privateMode && "blur-xl")}>
                  {totalAmount.toLocaleString()}
                </span>
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <button 
                onClick={onGenerateSummary}
                disabled={isGeneratingSummary || count === 0}
                className="flex items-center gap-2 px-3 py-2 bg-[#C45000] text-white rounded-xl text-[10px] font-black uppercase tracking-wider shadow-lg active:scale-95 transition-all disabled:opacity-50"
              >
                {isGeneratingSummary ? <Loader2 size={14} className="animate-spin" /> : <BarChart2 size={14} />}
                {texts.summary}
              </button>
            </div>
          </div>
          <div className="inline-flex items-center gap-2 bg-white/5 px-3 py-1 rounded-full">
            <div className="w-1.5 h-1.5 rounded-full bg-[#1A6B3C]" />
            <p className="text-white/60 font-bold text-xs">{count} {texts.txns}</p>
          </div>
        </CardContent>
      </Card>

      {/* Recent Sales List */}
      <div className="space-y-3">
        <div className="px-1 flex justify-between items-baseline">
          <h3 className="text-slate-900 text-lg font-black tracking-tight">{texts.recentSales}</h3>
        </div>
        
        <div className="space-y-2">
          {sales.length === 0 ? (
            <div className="text-center py-12 opacity-40">
              <span className="text-4xl block mb-2">📋</span>
              <p className="text-sm font-bold">{texts.empty}</p>
            </div>
          ) : (
            sales.slice(0, 10).map((sale) => (
              <div 
                key={sale.id} 
                onClick={() => setRevealedSales(prev => {
                  const n = new Set(prev);
                  n.has(sale.id) ? n.delete(sale.id) : n.add(sale.id);
                  return n;
                })}
                className="bg-white border border-slate-100 p-3 rounded-xl flex items-center justify-between shadow-sm active:bg-slate-50 transition-all"
              >
                <div className="flex gap-3 items-center">
                  <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-xl">🛍️</div>
                  <div>
                    <h4 className="font-bold text-sm text-slate-800">{sale.item}</h4>
                    <p className="text-[10px] text-slate-400 font-medium uppercase">
                      {sale.qty} • {sale.customer}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  {revealedSales.has(sale.id) ? (
                    <span className="text-lg font-black text-[#C45000]">₹{sale.amount}</span>
                  ) : (
                    <div className="text-[10px] font-bold text-slate-300 flex items-center gap-1"><Eye size={12} /> {texts.tapToReveal}</div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
