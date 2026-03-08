"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Lock } from "lucide-react";

interface PinLockProps {
  onAuth: (role: "owner" | "helper") => void;
  language: "hi-IN" | "en-IN";
  onLanguageChange: (lang: "hi-IN" | "en-IN") => void;
}

const LANGUAGES = [
  { code: "hi-IN", label: "🇮🇳 हिंदी", active: true },
  { code: "en-IN", label: "🇬🇧 English", active: true },
  { code: "te-IN", label: "తెలుగు", active: false },
  { code: "ta-IN", label: "தமிழ்", active: false },
  { code: "bn-IN", label: "বাংলা", active: false },
  { code: "mr-IN", label: "मराठी", active: false },
];

export default function PinLock({ onAuth, language, onLanguageChange }: PinLockProps) {
  const [pin, setPin] = useState("");
  const [error, setError] = useState(false);

  const handleDigit = (digit: string) => {
    if (pin.length >= 4) return;
    const newPin = pin + digit;
    setPin(newPin);
    setError(false);

    if (newPin.length === 4) {
      if (newPin === "1234") {
        onAuth("owner");
      } else if (newPin === "5678") {
        onAuth("helper");
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
      title: "दुकान साथी AI 🇮🇳",
      select: "भाषा चुनें",
      enter: "PIN दर्ज करें",
      error: "गलत PIN, फिर से प्रयास करें",
    },
    "en-IN": {
      title: "DukaanSaathi AI 🇮🇳",
      select: "Select Language",
      enter: "Enter PIN",
      error: "Wrong PIN, try again",
    }
  }[language];

  return (
    <div className="flex flex-col items-center justify-between h-full p-6 text-center bg-background overflow-y-auto">
      <div className="w-full max-w-md space-y-8 mt-4">
        <h1 className="text-4xl font-black text-white mb-2">{texts.title}</h1>
        
        <div className="space-y-4">
          <p className="text-muted-foreground text-sm uppercase tracking-widest font-bold">{texts.select}</p>
          <div className="grid grid-cols-2 gap-3">
            {LANGUAGES.map((lang) => (
              <button
                key={lang.code}
                disabled={!lang.active}
                onClick={() => lang.active && onLanguageChange(lang.code as any)}
                className={cn(
                  "relative flex flex-col items-center justify-center h-20 rounded-2xl border-2 transition-all",
                  language === lang.code 
                    ? "border-primary bg-primary/20 scale-105 z-10" 
                    : "border-border bg-card/50",
                  !lang.active && "opacity-50 grayscale cursor-not-allowed"
                )}
              >
                <span className="text-2xl mb-1">{lang.label.split(' ')[0]}</span>
                <span className="text-sm font-bold">{lang.label.split(' ')[1]}</span>
                {!lang.active && (
                  <Badge variant="secondary" className="absolute -top-2 -right-1 scale-75 whitespace-nowrap bg-muted text-[10px]">
                    Coming Soon
                  </Badge>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="w-full max-w-xs space-y-8 my-8">
        <div className="flex flex-col items-center gap-4">
          <div className="h-20 w-20 bg-card rounded-full shadow-inner border border-border flex items-center justify-center">
            <Lock className={cn("w-10 h-10", error ? "text-destructive animate-shake" : "text-primary")} />
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
          {error && <p className="text-destructive text-lg font-black uppercase">{texts.error}</p>}
        </div>

        <div className="grid grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
            <button
              key={n}
              onClick={() => handleDigit(n.toString())}
              className="h-20 w-20 rounded-full bg-card hover:bg-muted active:bg-primary active:scale-95 transition-all text-4xl font-black flex items-center justify-center border border-border"
            >
              {n}
            </button>
          ))}
          <div />
          <button
            onClick={() => handleDigit("0")}
            className="h-20 w-20 rounded-full bg-card hover:bg-muted active:bg-primary active:scale-95 transition-all text-4xl font-black flex items-center justify-center border border-border"
          >
            0
          </button>
          <button
            onClick={handleDelete}
            className="h-20 w-20 rounded-full bg-card/50 hover:bg-muted active:scale-95 transition-all text-2xl flex items-center justify-center text-muted-foreground"
          >
            ⌫
          </button>
        </div>
      </div>
    </div>
  );
}
