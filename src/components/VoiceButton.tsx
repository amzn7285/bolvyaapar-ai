
"use client";

import { useState, useRef, useEffect } from "react";
import { Mic, Loader2, BookOpen } from "lucide-react";
import { processVoiceSaleTransaction } from "@/ai/flows/process-voice-sale-transaction";
import { cn } from "@/lib/utils";

interface VoiceButtonProps {
  language: "hi-IN" | "en-IN";
  privateMode: boolean;
  onTransactionSuccess: (details: any) => void;
}

export default function VoiceButton({ language, privateMode, onTransactionSuccess }: VoiceButtonProps) {
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showLesson, setShowLesson] = useState(false);
  const [lessonContent, setLessonContent] = useState("");
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = language;

      recognitionRef.current.onresult = async (event: any) => {
        const transcript = event.results[0][0].transcript;
        processQuery(transcript);
      };

      recognitionRef.current.onerror = () => setIsListening(false);
      recognitionRef.current.onend = () => setIsListening(false);
    }
  }, [language]);

  const speak = (text: string) => {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = language;
    utterance.rate = 1.0;
    window.speechSynthesis.speak(utterance);
  };

  const startListening = () => {
    if (isListening) return;
    setIsListening(true);
    setShowLesson(false);
    speak(language === 'hi-IN' ? "बोलिए" : "Go ahead");
    recognitionRef.current?.start();
  };

  const processQuery = async (query: string) => {
    setIsProcessing(true);
    try {
      const result = await processVoiceSaleTransaction({
        userQuery: query,
        languageCode: language,
        privateMode: privateMode
      });

      if (result) {
        speak(result.spokenResponse);
        onTransactionSuccess(result.transactionDetails);
        setLessonContent(result.lessonText);
        
        setTimeout(() => {
          setShowLesson(true);
        }, 3000);
      }
    } catch (err) {
      console.error(err);
      speak(language === 'hi-IN' ? "माफ कीजिये, समझ नहीं आया।" : "Sorry, I didn't catch that.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleLessonTap = () => {
    alert(lessonContent);
  };

  return (
    <div className="flex flex-col items-center gap-4">
      {showLesson && (
        <button 
          onClick={handleLessonTap}
          className="bg-accent text-white py-2 px-6 rounded-full flex items-center gap-2 animate-in zoom-in-50 slide-in-from-bottom-4 duration-500 shadow-xl border-2 border-accent-foreground/20 font-bold uppercase tracking-wider text-xs"
        >
          <BookOpen size={18} /> {language === 'hi-IN' ? 'सीखें' : 'Unlock Lesson'}
        </button>
      )}

      <button
        onClick={startListening}
        disabled={isProcessing}
        className={cn(
          "w-24 h-24 rounded-full flex items-center justify-center shadow-[0_15px_60px_-15px_rgba(196,80,0,0.6)] transition-all active:scale-90 relative overflow-hidden",
          isProcessing ? "bg-muted cursor-wait" : "bg-primary",
          isListening && "voice-pulse ring-8 ring-primary/30"
        )}
      >
        {isProcessing ? (
          <Loader2 className="w-10 h-10 text-white animate-spin" />
        ) : (
          <Mic className="w-10 h-10 text-white" />
        )}
        
        {isListening && (
          <span className="absolute inset-0 bg-white/20 animate-ping rounded-full pointer-events-none" />
        )}
      </button>
    </div>
  );
}
