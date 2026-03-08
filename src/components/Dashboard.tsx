"use client";

import { useState } from "react";
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
    // Wait 3 seconds before showing the card
    setTimeout(() => {
      setShowLessonCard(true);
    }, 3000);
  };

  const handleDismissLesson = () => {
    localStorage.setItem(SNOOZE_KEY, Date.now().toString());
    setShowLessonCard(false);
  };

  const speakLesson = (text: string) => {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = language;
    utterance.rate = 1.0;
    window.speechSynthesis.speak(utterance);
  };

  if (showCustomerView) {
    return <CustomerView transaction={lastTransaction} onBack={() => setShowCustomerView(false)} language={language} />;
  }

  return (
    <div className="flex flex-col h-full bg-background relative overflow-hidden">
      {/* Header */}
      <header className="bg-[#0D2240] px-4 py-3 flex items-center justify-between shadow-lg z-20">
        <div className="flex items-center gap-2">
          <span className="text-xl font-bold text-white">दुकान साथी AI 🇮🇳</span>
          <span className="text-lg">{language === 'hi-IN' ? '🇮🇳' : '🇬🇧'}</span>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => {
              setPrivateMode(!privateMode);
              if (!privateMode) setShowLessonCard(false); // Hide lesson card when entering private mode
            }}
            className={`h-16 w-16 flex items-center justify-center rounded-full transition-all ${privateMode ? 'bg-accent text-white' : 'bg-card/50 text-muted-foreground'}`}
          >
            {privateMode ? <EyeOff size={28} /> : <Eye size={28} />}
          </button>
          <button 
            onClick={() => setShowCustomerView(true)}
            className="h-16 w-16 flex items-center justify-center rounded-full bg-card/50 text-muted-foreground hover:bg-secondary transition-all"
          >
            <Users size={28} />
          </button>
          <button 
            onClick={onLogout}
            className="h-16 w-16 flex items-center justify-center rounded-full bg-card/50 text-muted-foreground hover:bg-destructive transition-all"
          >
            <Lock size={28} />
          </button>
        </div>
      </header>

      {privateMode && (
        <div className="bg-accent/20 border-b border-accent/30 py-2 px-4 text-center">
          <p className="text-accent-foreground text-xs font-bold uppercase tracking-wider">
            {language === 'hi-IN' ? 'प्राइवेट मोड चालू - नंबर छिपे हुए हैं' : 'Private Mode ON — Numbers hidden'}
          </p>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto pb-40">
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
        <div className="fixed bottom-32 left-4 right-4 bg-card border-2 border-primary/30 rounded-3xl p-6 shadow-2xl animate-in slide-in-from-bottom-full duration-500 z-[60] flex items-center gap-6">
          <div className="text-6xl select-none">📚</div>
          <div className="flex-1 space-y-3">
            <p className="text-xs font-bold text-primary uppercase tracking-widest">
              {language === 'hi-IN' ? 'नया सबक उपलब्ध' : 'NEW LESSON AVAILABLE'}
            </p>
            <div className="flex gap-3">
              <button 
                onClick={() => speakLesson(currentLesson)}
                className="bg-secondary text-white h-16 px-6 rounded-2xl flex items-center gap-2 font-bold active:scale-95 transition-all text-lg flex-1 justify-center"
              >
                <Volume2 size={24} />
                {language === 'hi-IN' ? 'सुनो' : 'Listen'}
              </button>
              <button 
                onClick={handleDismissLesson}
                className="bg-muted text-muted-foreground h-16 px-6 rounded-2xl flex items-center gap-2 font-bold active:scale-95 transition-all text-lg flex-1 justify-center"
              >
                <X size={24} />
                {language === 'hi-IN' ? 'बाद में' : 'Later'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Voice Button - Fixed Center */}
      <div className="fixed bottom-28 left-1/2 -translate-x-1/2 z-50">
        <VoiceButton 
          language={language} 
          privateMode={privateMode} 
          onTransactionSuccess={handleTransaction} 
          onLessonGenerated={handleLessonGenerated}
        />
      </div>

      {/* Tab Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border px-6 py-4 flex justify-between items-center z-40 pb-safe shadow-[0_-4px_20px_-5px_rgba(0,0,0,0.3)]">
        <button 
          onClick={() => setActiveTab("dukaan")}
          className={`flex flex-col items-center gap-1 transition-all ${activeTab === 'dukaan' ? 'text-primary scale-110' : 'text-muted-foreground'}`}
        >
          <Home size={32} />
          <span className="text-[10px] font-bold uppercase">{language === 'hi-IN' ? 'दुकान' : 'Dukaan'}</span>
        </button>
        
        <button 
          onClick={() => setActiveTab("seekha")}
          className={`flex flex-col items-center gap-1 transition-all ${activeTab === 'seekha' ? 'text-primary scale-110' : 'text-muted-foreground'}`}
        >
          <BookOpen size={32} />
          <span className="text-[10px] font-bold uppercase">{language === 'hi-IN' ? 'सीखा' : 'Seekha'}</span>
        </button>

        <button 
          onClick={() => setActiveTab("report")}
          className={`flex flex-col items-center gap-1 transition-all ${activeTab === 'report' ? 'text-primary scale-110' : 'text-muted-foreground'}`}
          disabled={role === 'helper'}
        >
          <BarChart3 size={32} className={role === 'helper' ? 'opacity-30' : ''} />
          <span className={`text-[10px] font-bold uppercase ${role === 'helper' ? 'opacity-30' : ''}`}>
            {language === 'hi-IN' ? 'रिपोर्ट' : 'Report'}
          </span>
        </button>
      </nav>
    </div>
  );
}
