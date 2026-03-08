
"use client";

import { useState, useRef, useEffect } from "react";
import { Mic, Loader2, AlertCircle } from "lucide-react";
import { processVoiceSaleTransaction } from "@/ai/flows/process-voice-sale-transaction";
import { cn } from "@/lib/utils";

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
  const recognitionRef = useRef<any>(null);
  const audioUnlocked = useRef(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      
      if (!SpeechRecognition) {
        setBrowserSupported(false);
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
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }
  }, [language]);

  const speak = (text: string) => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;
    
    // Stop any current speech
    window.speechSynthesis.cancel();
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = language;
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    
    // On some mobile browsers, we need to speak a silent utterance first to unlock audio context
    window.speechSynthesis.speak(utterance);
  };

  const unlockAudio = () => {
    if (audioUnlocked.current) return;
    // Play a silent utterance to "unlock" speech synthesis on mobile/safari
    const silent = new SpeechSynthesisUtterance("");
    window.speechSynthesis.speak(silent);
    audioUnlocked.current = true;
  };

  const startListening = () => {
    if (!browserSupported || isListening || isProcessing) return;

    // Direct user gesture: Unlock audio and start recognition
    unlockAudio();
    
    // Immediate verbal cue
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
    }
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
        // Automatically speak the response as soon as it appears
        speak(result.spokenResponse);
        onTransactionSuccess(result.transactionDetails);
        onLessonGenerated(result.lessonText);
      }
    } catch (err) {
      console.error("Transaction processing error:", err);
      speak(language === 'hi-IN' ? "माफ कीजिये, समझ नहीं आया।" : "Sorry, I didn't catch that.");
    } finally {
      setIsProcessing(false);
    }
  };

  if (!browserSupported) {
    return (
      <div className="bg-destructive/20 p-4 rounded-2xl flex items-center gap-3 border border-destructive/30">
        <AlertCircle className="text-destructive" size={24} />
        <p className="text-xs font-bold text-destructive uppercase">
          {language === 'hi-IN' ? 'आपका ब्राउज़र वॉयस सपोर्ट नहीं करता' : 'Voice not supported in this browser'}
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-4">
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
      <p className="text-4xl font-black text-muted-foreground uppercase tracking-tighter opacity-60">
        {isListening ? (language === 'hi-IN' ? 'सुन रहा हूँ...' : 'Listening...') : (language === 'hi-IN' ? 'टैप करें' : 'Tap')}
      </p>
    </div>
  );
}
