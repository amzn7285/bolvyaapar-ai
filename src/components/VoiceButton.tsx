
"use client";

import { useState, useRef, useEffect } from "react";
import { Mic, Loader2, Send, Keyboard, X } from "lucide-react";
import { processVoiceSaleTransaction } from "@/ai/flows/process-voice-sale-transaction";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface VoiceButtonProps {
  language: "hi-IN" | "en-IN";
  privateMode: boolean;
  onTransactionSuccess: (details: any) => void;
  onLessonGenerated: (lessonText: string) => void;
}

export default function VoiceButton({ language, privateMode, onTransactionSuccess, onLessonGenerated }: VoiceButtonProps) {
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [browserSupported, setBrowserSupported] = useState(true);
  const [showTextInput, setShowTextInput] = useState(false);
  const [textQuery, setTextQuery] = useState("");
  const recognitionRef = useRef<any>(null);
  const audioUnlocked = useRef(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      
      if (!SpeechRecognition) {
        setBrowserSupported(false);
        setShowTextInput(true); // Automatically show text input if voice is not supported
        return;
      }

      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = language;

      recognition.onresult = async (event: any) => {
        const transcript = event.results[0][0].transcript;
        processQuery(transcript);
      };

      recognition.onerror = (event: any) => {
        console.error("Speech Recognition Error:", event.error);
        setIsListening(false);
        // If it's a critical error (like permission denied), show text input as fallback
        if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
          setShowTextInput(true);
        }
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }
  }, [language]);

  const speak = (text: string) => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = language;
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    window.speechSynthesis.speak(utterance);
  };

  const unlockAudio = () => {
    if (audioUnlocked.current) return;
    const silent = new SpeechSynthesisUtterance("");
    window.speechSynthesis.speak(silent);
    audioUnlocked.current = true;
  };

  const startListening = () => {
    if (isListening || isProcessing) return;
    
    if (!browserSupported) {
      setShowTextInput(true);
      return;
    }

    unlockAudio();
    speak(language === 'hi-IN' ? "बोलिए" : "Go ahead");
    setIsListening(true);
    
    try {
      if (recognitionRef.current) {
        recognitionRef.current.lang = language;
        recognitionRef.current.start();
      }
    } catch (err) {
      console.error("Failed to start recognition:", err);
      setIsListening(false);
      setShowTextInput(true);
    }
  };

  const processQuery = async (query: string) => {
    if (!query.trim()) return;
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
        onLessonGenerated(result.lessonText);
        setTextQuery("");
        setShowTextInput(false);
      }
    } catch (err) {
      console.error("Transaction processing error:", err);
      speak(language === 'hi-IN' ? "माफ कीजिये, समझ नहीं आया।" : "Sorry, I didn't catch that.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleTextSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    processQuery(textQuery);
  };

  if (showTextInput) {
    return (
      <div className="w-full max-w-md px-4 animate-in slide-in-from-bottom-4">
        <form onSubmit={handleTextSubmit} className="space-y-4 bg-card/80 backdrop-blur-md p-6 rounded-[2.5rem] border-2 border-primary/20 shadow-2xl">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xl font-bold text-primary">
              {language === 'hi-IN' ? 'लिख कर बताएं' : 'Type Command'}
            </h3>
            <button 
              type="button"
              onClick={() => setShowTextInput(false)}
              className="p-2 text-muted-foreground hover:text-white"
            >
              <X size={24} />
            </button>
          </div>
          <Input 
            value={textQuery}
            onChange={(e) => setTextQuery(e.target.value)}
            placeholder={language === 'hi-IN' ? 'उदा: ५ किलो आटा राहुल' : 'e.g. 5kg Aata Rahul'}
            className="h-20 text-3xl font-bold bg-background border-border rounded-2xl px-6"
            autoFocus
          />
          <Button 
            disabled={isProcessing || !textQuery.trim()}
            className="w-full h-16 text-2xl font-black rounded-2xl flex items-center gap-3 bg-primary text-white"
          >
            {isProcessing ? (
              <Loader2 className="animate-spin" size={32} />
            ) : (
              <>
                <Send size={32} />
                {language === 'hi-IN' ? 'भेजें' : 'Send'}
              </>
            )}
          </Button>
        </form>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex items-center gap-6">
        <button
          onClick={startListening}
          disabled={isProcessing}
          className={cn(
            "w-32 h-32 rounded-full flex items-center justify-center shadow-[0_20px_70px_-15px_rgba(196,80,0,0.6)] transition-all active:scale-90 relative overflow-hidden",
            isProcessing ? "bg-muted cursor-wait" : "bg-primary",
            isListening && "voice-pulse ring-[12px] ring-primary/30"
          )}
        >
          {isProcessing ? (
            <Loader2 className="w-12 h-12 text-white animate-spin" />
          ) : (
            <Mic className="w-12 h-12 text-white" />
          )}
          
          {isListening && (
            <span className="absolute inset-0 bg-white/20 animate-ping rounded-full pointer-events-none" />
          )}
        </button>

        <button
          onClick={() => setShowTextInput(true)}
          className="w-20 h-20 rounded-full bg-card/50 border-2 border-border flex items-center justify-center text-muted-foreground hover:text-primary transition-colors active:scale-90 shadow-lg"
        >
          <Keyboard size={32} />
        </button>
      </div>

      <p className="text-4xl font-black text-muted-foreground uppercase tracking-tighter opacity-60">
        {isListening ? (language === 'hi-IN' ? 'सुन रहा हूँ...' : 'Listening...') : (language === 'hi-IN' ? 'टैप करें' : 'Tap')}
      </p>
    </div>
  );
}
