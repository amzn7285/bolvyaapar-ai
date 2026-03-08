"use client";

import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Volume2, Bot, Lock } from "lucide-react";

interface SeekhaTabProps {
  language: "hi-IN" | "en-IN";
}

const LESSONS = [
  { id: 'data', emoji: '📊', title: 'DATA', story: '📈 📱 🛒', unlocked: true, color: 'bg-blue-500' },
  { id: 'faida', emoji: '💰', title: 'FAIDA', story: '📉 ➡️ 📈', unlocked: true, color: 'bg-green-500' },
  { id: 'andaaza', emoji: '🔮', title: 'ANDAAZA', story: '📅 🥛 🛒', unlocked: false, color: 'bg-purple-500' },
  { id: 'ai-wale', emoji: '🤖', title: 'AI WALE!', story: '✨ 🧠 ⚡', unlocked: false, color: 'bg-saffron-500' },
];

export default function SeekhaTab({ language }: SeekhaTabProps) {
  const speak = (id: string, type: 'lesson' | 'ai') => {
    const text = type === 'lesson' 
      ? (language === 'hi-IN' ? "डाटा का मतलब है आपकी दुकान की पूरी जानकारी।" : "Data means all information about your shop.")
      : (language === 'hi-IN' ? "एआई ने आपके पिछले 100 बिलों को देखकर यह बताया है।" : "AI analyzed your last 100 bills to find this.");
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = language;
    window.speechSynthesis.speak(utterance);
  };

  return (
    <div className="space-y-6 pb-20">
      <div className="flex gap-2 justify-center mb-6">
        {[1, 2, 3, 4].map((i) => (
          <div 
            key={i} 
            className={cn("w-5 h-5 rounded-full", i <= 2 ? "bg-primary" : "bg-muted")} 
          />
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6">
        {LESSONS.map((lesson) => (
          <Card 
            key={lesson.id} 
            className={cn(
              "overflow-hidden rounded-[2.5rem] border-none shadow-2xl relative",
              lesson.unlocked ? "bg-card" : "bg-card/20 grayscale opacity-50"
            )}
          >
            <CardContent className="p-0">
              {!lesson.unlocked && (
                <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/40 backdrop-blur-sm">
                  <Lock size={64} className="text-white/50" />
                </div>
              )}
              
              <div className="p-10 flex flex-col items-center text-center space-y-8">
                <span className="text-9xl">{lesson.emoji}</span>
                <h2 className="text-6xl font-black tracking-tighter text-white">{lesson.title}</h2>
                <div className="text-4xl tracking-widest font-black">{lesson.story}</div>
                
                {lesson.unlocked && (
                  <div className="grid grid-cols-2 gap-4 w-full pt-4">
                    <button 
                      onClick={() => speak(lesson.id, 'lesson')}
                      className="flex flex-col items-center justify-center gap-2 bg-secondary h-24 rounded-[1.5rem] active:scale-95 transition-all shadow-lg"
                    >
                      <Volume2 size={40} />
                      <span className="text-xs font-bold uppercase">{language === 'hi-IN' ? 'सुनो' : 'Suno'}</span>
                    </button>
                    <button 
                      onClick={() => speak(lesson.id, 'ai')}
                      className="flex flex-col items-center justify-center gap-2 bg-primary h-24 rounded-[1.5rem] active:scale-95 transition-all shadow-lg"
                    >
                      <Bot size={40} />
                      <span className="text-xs font-bold uppercase">{language === 'hi-IN' ? 'AI क्या है?' : 'AI Why?'}</span>
                    </button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
