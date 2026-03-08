"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { Volume2, Eye } from "lucide-react";

interface DukaanTabProps {
  privateMode: boolean;
  language: "hi-IN" | "en-IN";
  onTransaction?: (t: any) => void;
}

export default function DukaanTab({ privateMode, language }: DukaanTabProps) {
  const [salesData] = useState({ total: 1450, count: 12 });
  const [revealedSales, setRevealedSales] = useState<Set<number>>(new Set());
  
  const [stock] = useState([
    { id: 'grains', emoji: '🌾', name: language === 'hi-IN' ? 'अनाज' : 'Grains', qty: 25, unit: language === 'hi-IN' ? 'किलो' : 'kg', level: 80 },
    { id: 'dairy', emoji: '🥛', name: language === 'hi-IN' ? 'डेयरी' : 'Dairy', qty: 15, unit: language === 'hi-IN' ? 'लीटर' : 'L', level: 25 },
    { id: 'essentials', emoji: '🧼', name: language === 'hi-IN' ? 'ज़रूरी सामान' : 'Essentials', qty: 30, unit: language === 'hi-IN' ? 'यूनिट' : 'units', level: 12 },
  ]);
  
  const [recentSales] = useState([
    { id: 1, item: language === 'hi-IN' ? 'आटा' : 'Aata', qty: '5kg', customer: 'Rahul', time: '2m ago', amount: 240 },
    { id: 2, item: language === 'hi-IN' ? 'दूध' : 'Milk', qty: '2L', customer: 'Sita', time: '15m ago', amount: 120 },
    { id: 3, item: language === 'hi-IN' ? 'साबुन' : 'Soap', qty: '3 units', customer: 'Amit', time: '1h ago', amount: 300 },
  ]);

  const texts = {
    "hi-IN": {
      todaySales: "आज की बिक्री (Aaj ki Bikri)",
      stockStatus: "स्टॉक की स्थिति (Stock Status)",
      recentSales: "हाल की बिक्री (Recent Sales)",
      transactions: "लेन-देन",
      itemsLow: "चीजें कम हैं!",
      reveal: "👁️ टैप करें",
      revealNote: "कीमतें छिपी हुई हैं — देखने के लिए टैप करें",
      profitHint: "📊 मुनाफे की जानकारी रिपोर्ट टैब में है 🔐"
    },
    "en-IN": {
      todaySales: "Today's Sales",
      stockStatus: "Stock Status",
      recentSales: "Recent Sales",
      transactions: "transactions",
      itemsLow: "items low!",
      reveal: "👁️ Tap",
      revealNote: "Amounts hidden — tap any sale to reveal",
      profitHint: "📊 Profit details in Report tab only 🔐"
    }
  }[language];

  const toggleSaleReveal = (id: number) => {
    setRevealedSales(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const speakStock = (item: any) => {
    const text = language === 'hi-IN' 
      ? `${item.name} का स्टॉक ${item.qty} ${item.unit} है।`
      : `${item.name} stock is ${item.qty} ${item.unit}.`;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = language;
    window.speechSynthesis.speak(utterance);
  };

  const lowStockCount = stock.filter(s => s.level < 30).length;

  return (
    <div className="space-y-6">
      {lowStockCount > 0 && (
        <div className="bg-destructive/10 border border-destructive/20 rounded-xl p-4 flex items-center justify-between animate-pulse min-h-[64px]">
          <p className="text-destructive font-bold text-2xl">
            ⚠️ {lowStockCount} {texts.itemsLow}
          </p>
          <button 
            onClick={() => speakStock(stock.find(s => s.level < 30))} 
            className="h-16 w-16 flex items-center justify-center text-destructive bg-destructive/10 rounded-full"
          >
            <Volume2 size={32} />
          </button>
        </div>
      )}

      {/* Today's Sales Card */}
      <Card className="bg-gradient-to-br from-primary/20 to-secondary/20 border-none overflow-hidden rounded-3xl shadow-2xl">
        <CardContent className="p-8">
          <p className="text-muted-foreground text-sm font-bold uppercase tracking-wider mb-2">
            {texts.todaySales}
          </p>
          <div className="flex items-baseline gap-2 mb-4">
            <span className="text-4xl font-bold text-primary">₹</span>
            <span className={cn("text-6xl font-black tracking-tighter transition-all duration-300", privateMode && "blur-xl")}>
              {salesData.total.toLocaleString()}
            </span>
          </div>
          <p className="text-secondary font-bold text-4xl">
            {salesData.count} {texts.transactions}
          </p>
        </CardContent>
      </Card>

      {/* Stock Cards */}
      <div className="space-y-4">
        <h3 className="text-muted-foreground text-xs uppercase font-bold tracking-wider px-1">
          {texts.stockStatus}
        </h3>
        <div className="grid grid-cols-1 gap-4">
          {stock.map((item) => (
            <Card key={item.id} className="bg-card border-border overflow-hidden rounded-2xl">
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex gap-4 items-center">
                    <span className="text-6xl">{item.emoji}</span>
                    <div>
                      <h3 className="text-muted-foreground text-xs uppercase font-bold">{item.name}</h3>
                      <p className="text-4xl font-black">{item.qty}<span className="text-xl ml-1 font-normal opacity-60">{item.unit}</span></p>
                    </div>
                  </div>
                  <button 
                    onClick={() => speakStock(item)}
                    className="h-16 w-16 flex items-center justify-center bg-secondary/10 rounded-full text-secondary hover:bg-secondary/20 active:scale-90 transition-all"
                  >
                    <Volume2 size={32} />
                  </button>
                </div>
                <div className="space-y-2">
                  <Progress 
                    value={item.level} 
                    className={cn(
                      "h-4",
                      item.level < 15 ? "bg-destructive/30" : item.level < 30 ? "bg-yellow-500/30" : "bg-secondary/30"
                    )}
                  />
                  <p className="text-[10px] text-muted-foreground text-center font-bold uppercase tracking-tight">
                    {texts.profitHint}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Recent Sales */}
      <div className="space-y-4">
        <div className="flex flex-col gap-1 px-1">
          <h3 className="text-muted-foreground text-xs uppercase font-bold tracking-wider">
            {texts.recentSales}
          </h3>
          <p className="text-[10px] text-primary/70 font-bold uppercase tracking-tight">
            ℹ️ {texts.revealNote}
          </p>
        </div>
        
        <div className="space-y-3">
          {recentSales.map((sale) => (
            <div 
              key={sale.id} 
              onClick={() => toggleSaleReveal(sale.id)}
              className="bg-card/30 border border-border p-6 rounded-2xl flex items-center justify-between active:bg-card/50 transition-all cursor-pointer group min-h-[64px]"
            >
              <div className="flex gap-4 items-center">
                <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center text-4xl group-active:scale-95 transition-transform">
                  {sale.item.includes('आटा') || sale.item === 'Aata' ? '🌾' : sale.item.includes('दूध') || sale.item === 'Milk' ? '🥛' : '🧼'}
                </div>
                <div>
                  <h4 className="font-bold text-xl">{sale.item}</h4>
                  <p className="text-sm text-muted-foreground font-bold">{sale.qty} • {sale.customer}</p>
                  <p className="text-xs text-muted-foreground/60">{sale.time}</p>
                </div>
              </div>
              <div className="flex flex-col items-end">
                {revealedSales.has(sale.id) ? (
                  <span className="text-4xl font-black text-primary animate-in zoom-in-95 duration-200">
                    ₹{sale.amount}
                  </span>
                ) : (
                  <div className="flex items-center gap-2 h-16 px-6 bg-primary/10 rounded-2xl text-sm font-bold uppercase tracking-wider text-primary group-hover:bg-primary/20 transition-colors">
                    <Eye size={20} /> {texts.reveal}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
