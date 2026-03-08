"use client";

import { useState, useEffect } from "react";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { Home, BookOpen, BarChart3, Lock, Users, Eye, EyeOff, Volume2, X } from "lucide-react";
import DukaanTab from "./tabs/DukaanTab";
import SeekhaTab from "./tabs/SeekhaTab";
import ReportTab from "./tabs/ReportTab";
import CustomerView from "./CustomerView";
import VoiceButton from "./VoiceButton";

interface DashboardProps {
  role: "owner" | "helper";
  language: "hi-IN" | "en-IN";
  onLogout: () => void;
}

const SNOOZE_KEY = "dukaansaathi_lesson_snooze";
const SNOOZE_DURATION = 3600000; // 1 hour

export default function Dashboard({ role, language, onLogout }: DashboardProps) {
  const [activeTab, setActiveTab] = useState("dukaan");
  const [privateMode, setPrivateMode] = useState(false);
  const [showCustomerView, setShowCustomerView] = useState(false);
  const [lastTransaction, setLastTransaction] = useState<any>(null);
  const [currentLesson, setCurrentLesson] = useState<string | null>(null);
  const [showLessonCard, setShowLessonCard] = useState(false);

  const handleTransaction = (details: any) => {
    setLastTransaction(details);
  };

  const handleLessonGenerated = (lesson: string) => {
    const snoozeTime = localStorage.getItem(SNOOZE_KEY);
    if (snoozeTime && Date.now() - parseInt(snoozeTime) < SNOOZE_DURATION) {
      return;
    }

    setCurrentLesson(lesson);
    setTimeout(() => {
      setShowLessonCard(true);
    }, 3000);
  };

  const handleDismissLesson = () => {
    localStorage.setItem(SNOOZE_KEY, Date.now().toString());
    setShowLessonCard(false);
  };

  const speakLesson = (text: string) => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = language;
    utterance.rate = 1.0;
    window.speechSynthesis.speak(utterance);
  };

  if (showCustomerView) {
    return <CustomerView transaction={lastTransaction} onBack={() => setShowCustomerView(false)} language={language} />;
  }

  const texts = {
    "hi-IN": {
      dukaan: "दुकान",
      seekha: "सीखा",
      report: "रिपोर्ट",
      newLesson: "नया सबक उपलब्ध",
      listen: "सुनो",
      later: "बाद में",
      privateModeOn: "प्राइवेट मोड चालू - नंबर छिपे हुए हैं"
    },
    "en-IN": {
      dukaan: "Dukaan",
      seekha: "Seekha",
      report: "Report",
      newLesson: "NEW LESSON AVAILABLE",
      listen: "Listen",
      later: "Later",
      privateModeOn: "Private Mode ON — Numbers hidden"
    }
  }[language];

  return (
    <div className="flex flex-col h-full bg-background relative overflow-hidden">
      {/* Header */}
      <header className="bg-[#0D2240] px-4 py-3 flex items-center justify-between shadow-lg z-20 h-20 shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-2xl font-black text-white">दुकान साथी AI 🇮🇳</span>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => {
              setPrivateMode(!privateMode);
              if (!privateMode) setShowLessonCard(false);
            }}
            className={`h-16 w-16 flex items-center justify-center rounded-full transition-all ${privateMode ? 'bg-accent text-white' : 'bg-card/50 text-muted-foreground'}`}
          >
            {privateMode ? <EyeOff size={32} /> : <Eye size={32} />}
          </button>
          <button 
            onClick={() => setShowCustomerView(true)}
            className="h-16 w-16 flex items-center justify-center rounded-full bg-card/50 text-muted-foreground hover:bg-secondary transition-all"
          >
            <Users size={32} />
          </button>
          <button 
            onClick={onLogout}
            className="h-16 w-16 flex items-center justify-center rounded-full bg-card/50 text-muted-foreground hover:bg-destructive transition-all"
          >
            <Lock size={32} />
          </button>
        </div>
      </header>

      {privateMode && (
        <div className="bg-accent/20 border-b border-accent/30 py-3 px-4 text-center shrink-0">
          <p className="text-accent-foreground text-sm font-bold uppercase tracking-wider">
            {texts.privateModeOn}
          </p>
        </div>
      )}

      {/* Main Content - Generous padding bottom to clear floating buttons */}
      <main className="flex-1 overflow-y-auto pb-[420px]">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full">
          <TabsContent value="dukaan" className="m-0 p-4 animate-in fade-in slide-in-from-right-4">
            <DukaanTab privateMode={privateMode} language={language} onTransaction={handleTransaction} />
          </TabsContent>
          <TabsContent value="seekha" className="m-0 p-4 animate-in fade-in slide-in-from-right-4">
            <SeekhaTab language={language} />
          </TabsContent>
          <TabsContent value="report" className="m-0 p-4 animate-in fade-in slide-in-from-right-4">
            <ReportTab role={role} privateMode={privateMode} language={language} />
          </TabsContent>
        </Tabs>
      </main>

      {/* Passive Lesson Card */}
      {showLessonCard && !privateMode && !showCustomerView && currentLesson && (
        <div className="fixed bottom-[240px] left-4 right-4 bg-card border-4 border-primary/30 rounded-[2.5rem] p-8 shadow-2xl animate-in slide-in-from-bottom-full duration-500 z-[60] flex items-center gap-8">
          <div className="text-8xl select-none">📚</div>
          <div className="flex-1 space-y-4">
            <p className="text-sm font-bold text-primary uppercase tracking-widest">
              {texts.newLesson}
            </p>
            <div className="flex gap-4">
              <button 
                onClick={() => {
                  speakLesson(currentLesson);
                  setShowLessonCard(false);
                }}
                className="bg-secondary text-white h-20 px-8 rounded-3xl flex items-center gap-3 font-black active:scale-95 transition-all text-2xl flex-1 justify-center shadow-xl"
              >
                <Volume2 size={32} />
                {texts.listen}
              </button>
              <button 
                onClick={handleDismissLesson}
                className="bg-muted text-muted-foreground h-20 px-8 rounded-3xl flex items-center gap-3 font-black active:scale-95 transition-all text-2xl flex-1 justify-center shadow-md"
              >
                <X size={32} />
                {texts.later}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Voice Button Area - Fixed above Tab Navigation */}
      <div className="fixed bottom-32 left-0 right-0 z-50 flex justify-center pointer-events-none">
        <div className="pointer-events-auto">
          <VoiceButton 
            language={language} 
            privateMode={privateMode} 
            onTransactionSuccess={handleTransaction} 
            onLessonGenerated={handleLessonGenerated}
          />
        </div>
      </div>

      {/* Tab Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-card border-t-2 border-border px-8 py-6 flex justify-between items-center z-40 pb-safe shadow-[0_-4px_30px_-5px_rgba(0,0,0,0.5)] h-28 shrink-0">
        <button 
          onClick={() => setActiveTab("dukaan")}
          className={`flex flex-col items-center gap-1 transition-all ${activeTab === 'dukaan' ? 'text-primary scale-110' : 'text-muted-foreground'}`}
        >
          <Home size={40} />
          <span className="text-xs font-black uppercase">{texts.dukaan}</span>
        </button>
        
        <button 
          onClick={() => setActiveTab("seekha")}
          className={`flex flex-col items-center gap-1 transition-all ${activeTab === 'seekha' ? 'text-primary scale-110' : 'text-muted-foreground'}`}
        >
          <BookOpen size={40} />
          <span className="text-xs font-black uppercase">{texts.seekha}</span>
        </button>

        <button 
          onClick={() => setActiveTab("report")}
          className={`flex flex-col items-center gap-1 transition-all ${activeTab === 'report' ? 'text-primary scale-110' : 'text-muted-foreground'}`}
          disabled={role === 'helper'}
        >
          <BarChart3 size={40} className={role === 'helper' ? 'opacity-30' : ''} />
          <span className={`text-xs font-black uppercase ${role === 'helper' ? 'opacity-30' : ''}`}>
            {texts.report}
          </span>
        </button>
      </nav>
    </div>
  );
}
