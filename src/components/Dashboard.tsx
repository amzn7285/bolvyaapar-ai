"use client";

import { useState, useEffect } from "react";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { Home, Package, BarChart3, Lock, BookOpen, Eye, EyeOff, Volume2 } from "lucide-react";
import DukaanTab from "./tabs/DukaanTab";
import StockTab from "./tabs/StockTab";
import ReportTab from "./tabs/ReportTab";
import SettingsTab from "./tabs/SettingsTab";
import CreditKhataTab from "./tabs/CreditKhataTab";
import VoiceButton from "./VoiceButton";
import { cn } from "@/lib/utils";

interface DashboardProps {
  role: "owner" | "helper";
  language: "hi-IN" | "en-IN";
  onLogout: () => void;
}

const SALES_STORAGE_KEY = "bolvyapar_sales_history";
const EXPENSES_STORAGE_KEY = "bolvyapar_expenses_history";
const STOCK_STORAGE_KEY = "bolvyapar_stock_data";
const CREDIT_KHATA_KEY = "bolvyapar_credit_khata";
const PROFILE_KEY = "bolvyapar_profile";

const DEFAULT_STOCK = [
  { id: 'grains', emoji: '🌾', name: 'Grains', hiName: 'अनाज', qty: 100, unit: 'kg', level: 100, maxQty: 100, lowStockLevel: 20 },
  { id: 'dairy', emoji: '🥛', name: 'Dairy', hiName: 'डेयरी', qty: 50, unit: 'L', level: 100, maxQty: 50, lowStockLevel: 10 },
  { id: 'essentials', emoji: '🧼', name: 'Essentials', hiName: 'ज़रूरी सामान', qty: 200, unit: 'units', level: 100, maxQty: 200, lowStockLevel: 30 },
];

export default function Dashboard({ role, language, onLogout }: DashboardProps) {
  const [activeTab, setActiveTab] = useState("dukaan");
  const [privateMode, setPrivateMode] = useState(false);
  const [sales, setSales] = useState<any[]>([]);
  const [expenses, setExpenses] = useState<any[]>([]);
  const [stock, setStock] = useState<any[]>(DEFAULT_STOCK);
  const [creditKhata, setCreditKhata] = useState<any[]>([]);
  const [profile, setProfile] = useState<any>(null);
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);

  useEffect(() => {
    const savedSales = localStorage.getItem(SALES_STORAGE_KEY);
    if (savedSales) {
      try { setSales(JSON.parse(savedSales)); } catch (e) { console.error(e); }
    }

    const savedExpenses = localStorage.getItem(EXPENSES_STORAGE_KEY);
    if (savedExpenses) {
      try { setExpenses(JSON.parse(savedExpenses)); } catch (e) { console.error(e); }
    }

    const savedStock = localStorage.getItem(STOCK_STORAGE_KEY);
    if (savedStock) {
      try { setStock(JSON.parse(savedStock)); } catch (e) { console.error(e); }
    }

    const savedKhata = localStorage.getItem(CREDIT_KHATA_KEY);
    if (savedKhata) {
      try { setCreditKhata(JSON.parse(savedKhata)); } catch (e) { console.error(e); }
    }

    const savedProfile = localStorage.getItem(PROFILE_KEY);
    if (savedProfile) {
      try { setProfile(JSON.parse(savedProfile)); } catch (e) { console.error(e); }
    }
  }, []);

  const handleTransaction = (details: any) => {
    const timestamp = new Date().toISOString();
    
    if (details.isExpense) {
      const newExpense = {
        id: Date.now(),
        timestamp,
        category: details.productName || (language === 'hi-IN' ? 'खर्चा' : 'Expense'),
        amount: details.price || 0
      };
      const updatedExpenses = [newExpense, ...expenses];
      setExpenses(updatedExpenses);
      localStorage.setItem(EXPENSES_STORAGE_KEY, JSON.stringify(updatedExpenses));
      return;
    }

    if (details.isCredit) {
      const updatedKhata = creditKhata.map(c => {
        if (c.name.toLowerCase() === details.customerName?.toLowerCase()) {
          const entry = { id: Date.now(), timestamp, type: 'credit', amount: details.price || 0, note: details.productName || '' };
          return { ...c, balance: (c.balance || 0) + (details.price || 0), history: [entry, ...(c.history || [])] };
        }
        return c;
      });
      setCreditKhata(updatedKhata);
      localStorage.setItem(CREDIT_KHATA_KEY, JSON.stringify(updatedKhata));
    }

    if (details.isPayment) {
      const updatedKhata = creditKhata.map(c => {
        if (c.name.toLowerCase() === details.customerName?.toLowerCase()) {
          const entry = { id: Date.now(), timestamp, type: 'payment', amount: details.price || 0, note: 'Received payment' };
          return { ...c, balance: Math.max(0, (c.balance || 0) - (details.price || 0)), history: [entry, ...(c.history || [])] };
        }
        return c;
      });
      setCreditKhata(updatedKhata);
      localStorage.setItem(CREDIT_KHATA_KEY, JSON.stringify(updatedKhata));
      return;
    }

    const newSale = {
      id: Date.now(),
      timestamp,
      item: details.productName || "Unknown Item",
      qty: details.quantity ? `${details.quantity} ${details.unit || ''}` : "---",
      customer: details.customerName || (language === 'hi-IN' ? 'ग्राहक' : 'Customer'),
      amount: details.price || 0
    };

    const updatedSales = [newSale, ...sales];
    setSales(updatedSales);
    localStorage.setItem(SALES_STORAGE_KEY, JSON.stringify(updatedSales));

    const soldQty = Number(details.quantity) || 0;
    const prodName = (details.productName || "").toLowerCase();

    const updatedStock = stock.map(item => {
      let isMatch = false;
      const itemName = item.name.toLowerCase();
      const itemHiName = item.hiName.toLowerCase();

      if (prodName.includes(itemName) || prodName.includes(itemHiName)) {
        isMatch = true;
      } else if (item.id === 'dairy' && (prodName.includes('milk') || prodName.includes('doodh'))) {
        isMatch = true;
      } else if (item.id === 'grains' && (prodName.includes('rice') || prodName.includes('chawal') || prodName.includes('atta') || prodName.includes('wheat') || prodName.includes('dal'))) {
        isMatch = true;
      }

      if (isMatch) {
        const newQty = Math.max(0, item.qty - soldQty);
        const maxQty = item.maxQty || item.qty || 100;
        const newLevel = (newQty / maxQty) * 100;
        return { ...item, qty: newQty, level: newLevel };
      }
      return item;
    });

    setStock(updatedStock);
    localStorage.setItem(STOCK_STORAGE_KEY, JSON.stringify(updatedStock));
  };

  const handleUpdateKhata = (newKhata: any[]) => {
    setCreditKhata(newKhata);
    localStorage.setItem(CREDIT_KHATA_KEY, JSON.stringify(newKhata));
  };

  const handleDailySummary = async () => {
    if (isGeneratingSummary) return;
    setIsGeneratingSummary(true);

    const today = new Date().toDateString();
    const todaySales = sales.filter(s => new Date(s.timestamp).toDateString() === today);
    const totalSales = todaySales.reduce((acc, curr) => acc + (curr.amount || 0), 0);
    
    const systemPrompt = `Generate a 2-sentence summary of today's business. Total Sales: ₹${totalSales}. 
    Language: ${language === 'hi-IN' ? 'Hindi' : 'English'}. NO Net Profit details.`;

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userMessage: "Today's summary", systemPrompt }),
      });
      const data = await response.json();
      const text = data.reply || "";
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = language;
        window.speechSynthesis.speak(utterance);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsGeneratingSummary(false);
    }
  };

  const totalOutstanding = creditKhata.reduce((acc, curr) => acc + (curr.balance || 0), 0);
  const redItemsCount = stock.filter(item => item.qty < ((item.lowStockLevel || 10) * 0.15)).length;

  const texts = {
    "hi-IN": { dukaan: "दुकान", stock: "स्टॉक", khata: "खाता", report: "रिपोर्ट", settings: "सेटिंग्स" },
    "en-IN": { dukaan: "Home", stock: "Stock", khata: "Khata", report: "Report", settings: "Settings" }
  }[language];

  return (
    <div className="flex flex-col h-full bg-[#F8FAFC] relative overflow-hidden">
      <header className="bg-[#0D2240] px-6 py-4 flex items-center justify-between shadow-2xl z-20 shrink-0 border-b border-white/5">
        <div className="flex items-center gap-2">
          <div className="text-xl font-black flex items-baseline">
            <span className="text-[#C45000]">Bol</span>
            <span className="text-[#1A6B3C]">Vyapar</span>
            <span className="text-[#FFB300] ml-1 text-[10px] font-bold">AI 🇮🇳</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setPrivateMode(!privateMode)}
            className={cn(
              "h-10 w-10 flex items-center justify-center rounded-xl transition-all",
              privateMode ? 'bg-[#C45000] text-white' : 'bg-white/5 text-white/40'
            )}
          >
            {privateMode ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
          <button onClick={onLogout} className="h-10 w-10 flex items-center justify-center rounded-xl bg-white/5 text-white/40">
            <Lock size={18} />
          </button>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto pb-48 pt-4">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full">
          <TabsContent value="dukaan" className="m-0 p-4">
            <DukaanTab 
              privateMode={privateMode} 
              language={language} 
              sales={sales} 
              profile={profile}
              totalOutstanding={totalOutstanding}
              onGenerateSummary={handleDailySummary}
              isGeneratingSummary={isGeneratingSummary}
            />
          </TabsContent>
          <TabsContent value="stock" className="m-0 p-4">
            <StockTab language={language} stock={stock} onAddCategory={(cat) => setStock([...stock, {...cat, id: Date.now(), level: 100, maxQty: cat.qty}])} sales={sales} profile={profile} />
          </TabsContent>
          <TabsContent value="khata" className="m-0 p-4">
            <CreditKhataTab language={language} customers={creditKhata} onUpdateCustomers={handleUpdateKhata} profile={profile} />
          </TabsContent>
          <TabsContent value="report" className="m-0 p-4">
            <ReportTab role={role} privateMode={privateMode} language={language} sales={sales} expenses={expenses} profile={profile} />
          </TabsContent>
          <TabsContent value="settings" className="m-0 p-4">
            <SettingsTab language={language} profile={profile} onUpdateProfile={(p) => setProfile(p)} />
          </TabsContent>
        </Tabs>
      </main>

      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 px-4 py-3 pb-safe z-[60] shadow-[0_-10px_40px_rgba(0,0,0,0.05)]">
        <div className="flex justify-between items-center max-w-md mx-auto relative h-16">
          <NavBtn icon={<Home size={22} />} label={texts.dukaan} active={activeTab === 'dukaan'} onClick={() => setActiveTab('dukaan')} />
          <NavBtn 
            icon={<Package size={22} />} 
            label={texts.stock} 
            active={activeTab === 'stock'} 
            onClick={() => setActiveTab('stock')} 
            badge={redItemsCount > 0 ? redItemsCount : undefined}
          />
          
          <div className="relative -top-8 flex flex-col items-center">
            <VoiceButton 
              language={language} 
              privateMode={privateMode} 
              onTransactionSuccess={handleTransaction} 
              onSummaryRequested={handleDailySummary}
              salesHistory={sales}
              compact
            />
          </div>

          <NavBtn icon={<BookOpen size={22} />} label={texts.khata} active={activeTab === 'khata'} onClick={() => setActiveTab('khata')} />
          <NavBtn icon={<BarChart3 size={22} />} label={texts.report} active={activeTab === 'report'} onClick={() => setActiveTab('report')} disabled={role === 'helper'} />
        </div>
      </nav>
    </div>
  );
}

function NavBtn({ icon, label, active, onClick, disabled, badge }: { icon: any, label: string, active: boolean, onClick: () => void, disabled?: boolean, badge?: number }) {
  return (
    <button onClick={onClick} disabled={disabled} className={cn("flex flex-col items-center gap-1 min-w-[56px] transition-all relative", active ? "text-[#C45000]" : "text-slate-400", disabled && "opacity-20")}>
      <div className={cn("transition-transform", active && "scale-110")}>
        {icon}
        {badge !== undefined && (
          <div className="absolute -top-1 -right-1 bg-red-600 text-white text-[8px] font-black h-4 w-4 rounded-full flex items-center justify-center ring-2 ring-white animate-pulse">
            {badge}
          </div>
        )}
      </div>
      <span className="text-[10px] font-bold uppercase tracking-tight">{label}</span>
      {active && <div className="w-1 h-1 rounded-full bg-[#C45000] mt-0.5" />}
    </button>
  );
}
