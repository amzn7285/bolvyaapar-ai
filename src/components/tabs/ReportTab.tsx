"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Lock, Eye, Share2, Download, TrendingUp, MinusCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ReportTabProps {
  role: "owner" | "helper";
  privateMode: boolean;
  language: "hi-IN" | "en-IN";
  sales: any[];
  expenses: any[];
}

export default function ReportTab({ language, privateMode, sales, expenses }: ReportTabProps) {
  const [isLocked, setIsLocked] = useState(true);
  const [pin, setPin] = useState("");
  const [revealProfit, setRevealProfit] = useState(false);
  const [error, setError] = useState(false);
  const { toast } = useToast();

  const today = new Date().toDateString();
  const todaySales = sales.filter(s => new Date(s.timestamp).toDateString() === today);
  const todayExpenses = expenses.filter(e => new Date(e.timestamp).toDateString() === today);

  const totalRevenue = todaySales.reduce((acc, curr) => acc + (curr.amount || 0), 0);
  const totalExp = todayExpenses.reduce((acc, curr) => acc + (curr.amount || 0), 0);
  const netProfit = totalRevenue - totalExp;

  const handlePinDigit = (digit: string) => {
    if (pin.length >= 4) return;
    const newPin = pin + digit;
    setPin(newPin);
    if (newPin.length === 4) {
      if (newPin === "1234") { setIsLocked(false); setPin(""); }
      else { setTimeout(() => { setPin(""); setError(true); }, 300); }
    }
  };

  const texts = {
    "hi-IN": {
      title: "रिपोर्ट सुरक्षित",
      enter: "मालिक का PIN दर्ज करें",
      revenue: "आज की कुल बिक्री",
      expenses: "आज के खर्चे",
      profit: "आज का मुनाफा",
      insights: "AI एनालिसिस",
      whatsapp: "शेयर समरी",
      lock: "लॉक करें",
      reveal: "देखें"
    },
    "en-IN": {
      title: "Reports Secure",
      enter: "Enter Owner PIN",
      revenue: "TODAY'S REVENUE",
      expenses: "TODAY'S EXPENSES",
      profit: "NET PROFIT",
      insights: "AI BUSINESS INSIGHTS",
      whatsapp: "Share Summary",
      lock: "Lock",
      reveal: "Reveal"
    }
  }[language];

  if (isLocked) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50svh] space-y-8 animate-in fade-in zoom-in-95 px-4">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="p-6 bg-white rounded-[24px] shadow-xl border border-slate-100">
            <Lock className={cn("w-10 h-10", error ? "text-destructive" : "text-[#0D2240]")} />
          </div>
          <div className="space-y-1">
            <h2 className="text-lg font-black text-slate-900">{texts.title}</h2>
            <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">{texts.enter}</p>
          </div>
        </div>
        <div className="flex gap-4">
          {[0, 1, 2, 3].map(i => <div key={i} className={cn("w-4 h-4 rounded-full border-2 transition-all", pin.length > i ? "bg-[#C45000] border-[#C45000]" : "border-slate-200")} />)}
        </div>
        <div className="grid grid-cols-3 gap-4 w-full max-w-[260px]">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(n => (
            <button key={n} onClick={() => handlePinDigit(n.toString())} className="h-14 w-14 rounded-2xl bg-white shadow-sm border border-slate-100 text-xl font-bold flex items-center justify-center text-slate-800 active:bg-slate-100">{n}</button>
          ))}
          <div />
          <button onClick={() => handlePinDigit("0")} className="h-14 w-14 rounded-2xl bg-white shadow-sm border border-slate-100 text-xl font-bold flex items-center justify-center text-slate-800 active:bg-slate-100">0</button>
          <button onClick={() => setPin(pin.slice(0, -1))} className="h-14 w-14 flex items-center justify-center text-slate-300 font-bold">⌫</button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
      <div className="flex items-center justify-between px-1">
        <h2 className="text-lg font-black text-slate-900 tracking-tight">Business Reports</h2>
        <button onClick={() => setIsLocked(true)} className="flex items-center gap-2 h-10 px-4 bg-slate-100 text-slate-500 rounded-xl text-[10px] font-bold uppercase">
          <Lock size={14} /> {texts.lock}
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        <Card className="bg-[#0D2240] border-none rounded-[32px] overflow-hidden shadow-2xl">
          <CardContent className="p-8 relative">
            <TrendingUp size={80} className="absolute right-[-10px] bottom-[-10px] text-white/5" />
            <p className="text-white/40 text-[10px] font-bold uppercase tracking-widest mb-2">{texts.revenue}</p>
            <p className={cn("text-[26px] font-black text-white", privateMode && "blur-xl")}>₹{totalRevenue.toLocaleString()}</p>
          </CardContent>
        </Card>

        <Card className="bg-white border-slate-100 rounded-[32px] overflow-hidden shadow-sm">
          <CardContent className="p-8 relative">
            <MinusCircle size={80} className="absolute right-[-10px] bottom-[-10px] text-slate-50 opacity-10" />
            <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-2">{texts.expenses}</p>
            <p className={cn("text-[26px] font-black text-red-600", privateMode && "blur-xl")}>₹{totalExp.toLocaleString()}</p>
          </CardContent>
        </Card>
      </div>

      <Card className="rounded-[32px] border-slate-100 shadow-sm bg-white overflow-hidden">
        <CardContent className="p-8 flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-[10px] font-bold uppercase text-slate-400">{texts.profit}</p>
            {revealProfit ? (
              <p className={cn("text-[28px] font-black transition-all", netProfit >= 0 ? "text-[#1A6B3C]" : "text-red-600")}>
                ₹{netProfit.toLocaleString()}
              </p>
            ) : (
              <p className="text-[28px] font-black text-slate-200">₹••••••</p>
            )}
          </div>
          <button 
            onClick={() => setRevealProfit(!revealProfit)}
            className="h-12 w-24 bg-slate-50 rounded-2xl text-[10px] font-black uppercase text-[#C45000] border border-slate-100 shadow-sm"
          >
            {revealProfit ? 'Hide' : texts.reveal}
          </button>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <h3 className="text-slate-900 text-lg font-black tracking-tight px-1">{texts.insights}</h3>
        <Card className="rounded-[32px] border-slate-100 shadow-sm bg-white">
          <CardContent className="p-6 space-y-6">
            <div className="p-5 bg-[#1A6B3C]/5 border border-[#1A6B3C]/10 rounded-2xl flex gap-4">
              <div className="text-3xl">💡</div>
              <div className="space-y-1">
                <p className="text-[10px] font-bold uppercase text-[#1A6B3C]">Profit Tip</p>
                <p className="text-sm font-black text-slate-800">
                  {netProfit < 0 ? "Expenses are higher than sales today. Check for heavy utility costs." : "Healthy profit margins! Reinvest in fast-moving stock categories."}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex gap-4 pt-4">
        <button onClick={() => toast({ title: "Summary Shared!" })} className="flex-1 h-14 bg-[#1A6B3C] text-white rounded-2xl flex items-center justify-center gap-2 font-bold text-sm shadow-lg shadow-[#1A6B3C]/20">
          <Share2 size={18} /> WhatsApp
        </button>
        <button onClick={() => toast({ title: "Exported!" })} className="w-14 h-14 bg-white border border-slate-200 text-slate-400 rounded-2xl flex items-center justify-center shadow-sm">
          <Download size={20} />
        </button>
      </div>
    </div>
  );
}
