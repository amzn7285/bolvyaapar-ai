"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Lock, Eye, Share2, Download, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ReportTabProps {
  role: "owner" | "helper";
  privateMode: boolean;
  language: "hi-IN" | "en-IN";
}

export default function ReportTab({ language, privateMode }: ReportTabProps) {
  const [isLocked, setIsLocked] = useState(true);
  const [pin, setPin] = useState("");
  const [revealMargin, setRevealMargin] = useState(false);
  const [error, setError] = useState(false);
  const { toast } = useToast();

  const handlePinDigit = (digit: string) => {
    if (pin.length >= 4) return;
    const newPin = pin + digit;
    setPin(newPin);
    setError(false);

    if (newPin.length === 4) {
      if (newPin === "1234") {
        setIsLocked(false);
        setPin("");
      } else {
        setTimeout(() => {
          setPin("");
          setError(true);
        }, 300);
      }
    }
  };

  const handleDelete = () => {
    setPin(pin.slice(0, -1));
  };

  const texts = {
    "hi-IN": {
      title: "रिपोर्ट लॉक",
      enter: "मालिक का PIN दर्ज करें",
      error: "गलत PIN, फिर से प्रयास करें",
      revenue: "हफ्ते की कुल कमाई",
      bestProduct: "सबसे अच्छा सामान",
      margin: "मुनाफा",
      reveal: "👁️ निजी तौर पर देखें",
      insights: "AI की सलाह",
      customerPattern: "ग्राहक का तरीका",
      salesPattern: "बिक्री का तरीका",
      tip: "अगले हफ्ते की टिप",
      whatsapp: "WhatsApp Summary",
      export: "Export Data",
      privacy: "सुरक्षा सेटिंग्स",
      lockReport: "रिपोर्ट लॉक करें"
    },
    "en-IN": {
      title: "Report Locked",
      enter: "Enter Owner PIN",
      error: "Wrong PIN, try again",
      revenue: "WEEKLY REVENUE",
      bestProduct: "BEST PRODUCT",
      margin: "BEST MARGIN",
      reveal: "👁️ Reveal privately",
      insights: "AI INSIGHTS",
      customerPattern: "Customer Pattern",
      salesPattern: "Sales Pattern",
      tip: "Weekly Tip",
      whatsapp: "WhatsApp Summary",
      export: "Export Data",
      privacy: "PRIVACY FEATURES",
      lockReport: "Lock Report"
    }
  }[language];

  const reports = {
    weekly: 24500,
    bestProduct: language === 'hi-IN' ? 'अनाज 🌾' : 'Grains 🌾',
    bestMargin: "15%",
    customerPattern: language === 'hi-IN' ? 'लोग सुबह 9 बजे सबसे ज्यादा दूध खरीदते हैं।' : 'Customers buy milk most at 9 AM.',
    salesPattern: language === 'hi-IN' ? 'शनिवार को बिक्री 20% बढ़ जाती है।' : 'Sales increase by 20% on Saturdays.',
    tip: language === 'hi-IN' ? 'अगले हफ्ते साबुन पर ऑफर चलाएं!' : 'Run an offer on Soaps next week!'
  };

  const handleWhatsAppSummary = () => {
    const summary = `${language === 'hi-IN' ? 'व्यापार अपडेट' : 'Business Update'}: 
${texts.bestProduct}: ${reports.bestProduct}
${texts.customerPattern}: ${reports.customerPattern}
${texts.salesPattern}: ${reports.salesPattern}
${texts.tip}: ${reports.tip}`;

    toast({ 
      title: "WhatsApp Summary Shared!",
      description: language === 'hi-IN' ? "रुपे की जानकारी के बिना सारांश भेजा गया।" : "Summary shared without any rupee amounts." 
    });
  };

  if (isLocked) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70svh] space-y-8 animate-in fade-in zoom-in-95 duration-300 px-4">
        <div className="flex flex-col items-center gap-6 text-center">
          <div className="p-6 bg-card rounded-full shadow-inner border border-border">
            <Lock className={cn("w-12 h-12", error ? "text-destructive animate-shake" : "text-primary")} />
          </div>
          <div className="space-y-2">
            <h2 className="text-3xl font-bold">{texts.title}</h2>
            <p className="text-muted-foreground text-sm uppercase tracking-widest">{texts.enter}</p>
          </div>
        </div>

        <div className="flex gap-4">
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className={cn(
                "w-6 h-6 rounded-full border-2 transition-all duration-300",
                pin.length > i ? "bg-primary border-primary scale-125" : "border-border"
              )}
            />
          ))}
        </div>

        {error && <p className="text-destructive font-bold uppercase tracking-wider">{texts.error}</p>}

        <div className="grid grid-cols-3 gap-6 w-full max-w-[320px]">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
            <button
              key={n}
              onClick={() => handlePinDigit(n.toString())}
              className="h-20 w-20 rounded-full bg-card hover:bg-muted active:bg-primary active:scale-95 transition-all text-4xl font-bold flex items-center justify-center border border-border mx-auto"
            >
              {n}
            </button>
          ))}
          <div />
          <button
            onClick={() => handlePinDigit("0")}
            className="h-20 w-20 rounded-full bg-card hover:bg-muted active:bg-primary active:scale-95 transition-all text-4xl font-bold flex items-center justify-center border border-border mx-auto"
          >
            0
          </button>
          <button
            onClick={handleDelete}
            className="h-20 w-20 rounded-full bg-card/50 hover:bg-muted active:scale-95 transition-all text-xl flex items-center justify-center text-muted-foreground mx-auto"
          >
            ⌫
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-40 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between px-1">
        <h2 className="text-2xl font-bold">{language === 'hi-IN' ? 'व्यापार रिपोर्ट' : 'Business Report'}</h2>
        <button 
          onClick={() => {
            setIsLocked(true);
            setRevealMargin(false);
          }}
          className="flex items-center gap-2 h-16 px-6 bg-destructive/10 text-destructive rounded-full text-sm font-bold uppercase tracking-wider active:scale-95 transition-all"
        >
          <Lock size={20} />
          {texts.lockReport}
        </button>
      </div>

      <Card className="bg-gradient-to-br from-secondary/20 to-primary/20 border-none rounded-3xl overflow-hidden shadow-xl">
        <CardContent className="p-10">
          <p className="text-xs font-bold uppercase tracking-widest opacity-60 mb-2">{texts.revenue}</p>
          <p className={cn("text-7xl font-black tracking-tighter", privateMode && "blur-2xl")}>
            ₹{reports.weekly.toLocaleString()}
          </p>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-4">
        <Card className="rounded-3xl border-border bg-card shadow-md overflow-hidden">
          <CardContent className="p-8 flex justify-between items-center">
            <div>
              <p className="text-xs font-bold uppercase text-muted-foreground mb-1">{texts.bestProduct}</p>
              <p className="text-4xl font-black">{reports.bestProduct}</p>
            </div>
          </CardContent>
        </Card>
        
        <Card className="rounded-3xl border-border bg-card shadow-md overflow-hidden">
          <CardContent className="p-8 flex justify-between items-center">
            <div>
              <p className="text-xs font-bold uppercase text-muted-foreground mb-1">{texts.margin}</p>
              {revealMargin ? (
                <p className="text-4xl font-black text-secondary animate-in zoom-in-95">{reports.bestMargin}</p>
              ) : (
                <button 
                  onClick={() => setRevealMargin(true)} 
                  className="flex items-center gap-2 h-16 px-8 bg-muted rounded-2xl text-sm font-bold uppercase tracking-tight text-primary active:scale-95 transition-all"
                >
                  <Eye size={20} /> {texts.reveal}
                </button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground px-1">{texts.insights}</h3>
        <Card className="rounded-3xl border-border bg-card shadow-lg">
          <CardContent className="p-8 space-y-8">
            <div className="flex gap-6">
              <div className="text-5xl">👥</div>
              <div className="space-y-1">
                <p className="text-xs font-bold uppercase text-muted-foreground">{texts.customerPattern}</p>
                <p className="text-xl font-bold leading-relaxed">{reports.customerPattern}</p>
              </div>
            </div>
            <div className="flex gap-6">
              <div className="text-5xl">📈</div>
              <div className="space-y-1">
                <p className="text-xs font-bold uppercase text-muted-foreground">{texts.salesPattern}</p>
                <p className="text-xl font-bold leading-relaxed">{reports.salesPattern}</p>
              </div>
            </div>
            <div className="p-6 bg-secondary/10 border border-secondary/20 rounded-3xl flex gap-6">
              <div className="text-4xl">💡</div>
              <div className="space-y-1">
                <p className="text-xs font-bold uppercase text-secondary">{texts.tip}</p>
                <p className="text-xl font-black">{reports.tip}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 pt-4">
        <button 
          onClick={handleWhatsAppSummary}
          className="w-full h-20 bg-[#1A6B3C] text-white rounded-2xl flex items-center justify-center gap-3 font-bold text-2xl active:scale-95 transition-all shadow-lg"
        >
          <Share2 size={28} />
          {texts.whatsapp}
        </button>
        <button 
          onClick={() => toast({ title: "Data Exported successfully!" })}
          className="w-full h-20 bg-card border-2 border-border text-white rounded-2xl flex items-center justify-center gap-3 font-bold text-2xl active:scale-95 transition-all"
        >
          <Download size={28} />
          {texts.export}
        </button>
      </div>
    </div>
  );
}
