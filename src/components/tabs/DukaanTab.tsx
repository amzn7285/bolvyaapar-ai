
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
  const [stock] = useState([
    { id: 'grains', emoji: '🌾', name: language === 'hi-IN' ? 'अनाज' : 'Grains', qty: 25, unit: language === 'hi-IN' ? 'किलो' : 'kg', level: 80 },
    { id: 'dairy', emoji: '🥛', name: language === 'hi-IN' ? 'डेयरी' : 'Dairy', qty: 15, unit: language === 'hi-IN' ? 'लीटर' : 'L', level: 25 },
    { id: 'essentials', emoji: '🧼', name: language === 'hi-IN' ? 'ज़रूरी सामान' : 'Essentials', qty: 30, unit: language === 'hi-IN' ? 'यूनिट' : 'units', level: 12 },
  ]);
  const [recentSales] = useState([
    { id: 1, item: language === 'hi-IN' ? 'आटा' : 'Aata', qty: '5kg', customer: 'Rahul', time: '2m ago', amount: 240, revealed: false },
    { id: 2, item: language === 'hi-IN' ? 'दूध' : 'Milk', qty: '2L', customer: 'Sita', time: '15m ago', amount: 120, revealed: false },
    { id: 3, item: language === 'hi-IN' ? 'साबुन' : 'Soap', qty: '3 units', customer: 'Amit', time: '1h ago', amount: 300, revealed: false },
  ]);

  const texts = {
    "hi-IN": {
      todaySales: "आज की बिक्री",
      stockStatus: "स्टॉक की स्थिति",
      recentSales: "हाल की बिक्री",
      transactions: "लेन-देन",
      itemsLow: "चीजें कम हैं!",
      reveal: "देखें",
      profitHint: "📊 मुनाफे की जानकारी रिपोर्ट टैब में है 🔐"
    },
    "en-IN": {
      todaySales: "Today's Sales",
      stockStatus: "Stock Status",
      recentSales: "Recent Sales",
      transactions: "transactions",
      itemsLow: "items low!",
      reveal: "Reveal",
      profitHint: "📊 Profit details in Report tab only 🔐"
    }
  }[language];

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
        <div className="bg-destructive/10 border border-destructive/20 rounded-xl p-3 flex items-center justify-between animate-pulse">
          <p className="text-destructive font-bold text-sm">
            ⚠️ {lowStockCount} {texts.itemsLow}
          </p>
          <button onClick={() => speakStock(stock.find(s => s.level < 30))} className="text-destructive">
            <Volume2 size={20} />
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
            <span className="text-xl font-bold text-primary">₹</span>
            <span className={cn("text-5xl font-bold tracking-tighter", privateMode && "blur-xl")}>
              {salesData.total.toLocaleString()}
            </span>
          </div>
          <p className="text-secondary font-medium">
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
              <CardContent className="p-5">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex gap-4 items-center">
                    <span className="text-5xl">{item.emoji}</span>
                    <div>
                      <h3 className="text-muted-foreground text-xs uppercase font-bold">{item.name}</h3>
                      <p className="text-3xl font-bold">{item.qty}<span className="text-lg ml-1 font-normal opacity-60">{item.unit}</span></p>
                    </div>
                  </div>
                  <button 
                    onClick={() => speakStock(item)}
                    className="p-4 bg-secondary/10 rounded-full text-secondary hover:bg-secondary/20 active:scale-90 transition-all"
                  >
                    <Volume2 size={24} />
                  </button>
                </div>
                <div className="space-y-2">
                  <Progress 
                    value={item.level} 
                    className="h-3"
                    indicatorClassName={cn(
                      item.level < 15 ? "bg-destructive" : item.level < 30 ? "bg-yellow-500" : "bg-secondary"
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
        <h3 className="text-muted-foreground text-xs uppercase font-bold tracking-wider px-1">
          {texts.recentSales}
        </h3>
        <div className="space-y-3">
          {recentSales.map((sale) => (
            <div key={sale.id} className="bg-card/30 border border-border p-4 rounded-2xl flex items-center justify-between">
              <div className="flex gap-4">
                <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center text-2xl">
                  {sale.item.includes('आटा') || sale.item === 'Aata' ? '🌾' : sale.item.includes('दूध') || sale.item === 'Milk' ? '🥛' : '🧼'}
                </div>
                <div>
                  <h4 className="font-bold text-lg">{sale.item}</h4>
                  <p className="text-xs text-muted-foreground">{sale.qty} • {sale.customer} • {sale.time}</p>
                </div>
              </div>
              <div className="flex flex-col items-end">
                {!privateMode ? (
                  <span className="text-2xl font-bold text-primary">₹{sale.amount}</span>
                ) : (
                  <div className="flex items-center gap-1 py-2 px-3 bg-muted rounded-full text-[10px] font-bold uppercase tracking-wider text-muted-foreground opacity-50">
                    <Eye size={14} /> {texts.reveal}
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
