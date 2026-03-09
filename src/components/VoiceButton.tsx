"use client";

import { useState, useRef, useEffect } from "react";
import { Mic, Loader2, Keyboard, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface VoiceButtonProps {
  language: "hi-IN" | "en-IN";
  privateMode: boolean;
  onTransactionSuccess: (details: any) => void;
  onSummaryRequested?: () => void;
  salesHistory?: any[];
  compact?: boolean;
}

export default function VoiceButton({
  language,
  privateMode,
  onTransactionSuccess,
  onSummaryRequested,
  salesHistory = [],
  compact,
}: VoiceButtonProps) {
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showTextInput, setShowTextInput] = useState(false);
  const [textQuery, setTextQuery] = useState("");
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.lang = language;
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.onresult = (e: any) => {
          const query = e.results[0][0].transcript;
          processQuery(query);
        };
        recognition.onerror = () => setIsListening(false);
        recognition.onend = () => setIsListening(false);
        recognitionRef.current = recognition;
      } else {
        setShowTextInput(true);
      }
    }
  }, [language]);

  const speak = (text: string) => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = language;
    window.speechSynthesis.speak(utterance);
  };

  const startListening = () => {
    if (isListening || isProcessing) return;
    speak(language === "hi-IN" ? "बोलिए" : "Go ahead");
    setIsListening(true);
    try {
      if (recognitionRef.current) {
        recognitionRef.current.lang = language;
        recognitionRef.current.start();
      }
    } catch {
      setShowTextInput(true);
      setIsListening(false);
    }
  };

  const processQuery = async (query: string) => {
    if (!query.trim()) return;

    setIsProcessing(true);
    try {
      const systemPrompt = `You are BolVyapar AI. Parse voice input.
      INTENTS:
      1. Sale: Item sold.
      2. Expense: Shop expense (kharcha).
      3. Credit (Udhar): Customer takes credit. Example: "Ramesh ko 200 ka udhar diya".
      4. Payment (Jama): Customer pays back. Example: "Ramesh ne 150 diya".
      
      Return ONLY raw JSON:
      {
        "spokenResponse": "1-sentence confirmation in ${language === 'hi-IN' ? 'Hindi' : 'English'}",
        "productName": "Item name or note",
        "quantity": number,
        "unit": "kg/L/etc",
        "customerName": "Name or 'Customer'",
        "price": number,
        "isExpense": boolean,
        "isCredit": boolean,
        "isPayment": boolean
      }
      Language: ${language === 'hi-IN' ? 'Hindi' : 'English'}.`;

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userMessage: query, systemPrompt }),
      });

      const data = await response.json();
      const rawReply = data.reply || "";
      const jsonMatch = rawReply.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        speak(parsed.spokenResponse);
        onTransactionSuccess(parsed);
      }

      setTextQuery("");
      setShowTextInput(false);
    } catch (err) {
      console.error(err);
      speak(language === "hi-IN" ? "गड़बड़ हो गई।" : "Error occurred.");
    } finally {
      setIsProcessing(false);
    }
  };

  if (showTextInput) {
    return (
      <div className="fixed inset-x-0 bottom-24 px-4 z-[70] animate-in slide-in-from-bottom-4">
        <div className="bg-white border border-slate-200 p-4 rounded-[24px] shadow-2xl space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-[10px] font-black text-[#C45000] uppercase tracking-[0.2em]">{language === "hi-IN" ? "लिख कर बताएं" : "Type Command"}</h3>
            <button onClick={() => setShowTextInput(false)} className="text-slate-400 p-2"><X size={20} /></button>
          </div>
          <Input value={textQuery} onChange={(e) => setTextQuery(e.target.value)} placeholder={language === "hi-IN" ? "जैसे: रमेश को 200 का उधार दिया..." : "e.g. Give 200 credit to Ramesh..."} className="h-14 text-sm rounded-2xl bg-slate-50 border-slate-100" />
          <Button onClick={() => processQuery(textQuery)} disabled={isProcessing || !textQuery.trim()} className="w-full h-14 rounded-2xl bg-[#C45000] text-white font-bold">{isProcessing ? <Loader2 className="animate-spin" /> : "Send"}</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center">
      <div className="flex items-center gap-4">
        <button onClick={startListening} disabled={isProcessing} className={cn("h-20 w-20 rounded-full flex items-center justify-center shadow-[0_10px_30px_rgba(196,80,0,0.3)] transition-all active:scale-90 border-4 border-white", isListening ? "bg-red-500 animate-pulse" : "bg-[#C45000]", isProcessing && "bg-slate-400")}>
          {isProcessing ? <Loader2 className="text-white animate-spin" size={32} /> : <Mic className="text-white" size={32} />}
        </button>
        <button onClick={() => setShowTextInput(true)} className="h-12 w-12 rounded-full bg-white border-2 border-slate-200 flex items-center justify-center text-slate-400 shadow-sm"><Keyboard size={20} /></button>
      </div>
      <p className="mt-2 text-[10px] font-black text-[#C45000] uppercase tracking-tighter">
        {isListening ? "सुन रहा हूँ..." : "बोलिए"}
      </p>
    </div>
  );
}
