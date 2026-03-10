"use client";

import { useState, useRef, useEffect } from "react";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Volume2, Plus, AlertTriangle, Mic, ShoppingCart, CheckCircle2, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

interface StockTabProps {
  role: "owner" | "helper";
  language: "hi-IN" | "en-IN";
  stock: any[];
  onAddCategory: (category: any) => void;
  sales: any[];
  profile: any;
}

const guessEmoji = (name: string): string => {
  const n = name.toLowerCase();
  if (/rice|chawal|चावल/.test(n)) return '🌾';
  if (/milk|doodh|दूध/.test(n)) return '🥛';
  if (/oil|tel|तेल/.test(n)) return '🛢️';
  if (/wheat|atta|आटा|gehun|गेहूं/.test(n)) return '🌾';
  if (/sugar|chini|चीनी/.test(n)) return '🍚';
  if (/dal|daal|दाल/.test(n)) return '🫘';
  if (/soap|sabun|साबुन/.test(n)) return '🧼';
  if (/salt|namak|नमक/.test(n)) return '🧂';
  if (/tea|chai|चाय/.test(n)) return '🍵';
  if (/egg|anda|अंडा/.test(n)) return '🥚';
  if (/potato|aloo|आलू/.test(n)) return '🥔';
  if (/onion|pyaaz|प्याज/.test(n)) return '🧅';
  if (/mobile|phone|screen/.test(n)) return '📱';
  if (/fabric|cloth|kapda|कपड़ा/.test(n)) return '🧵';
  if (/medicine|tablet|dawa|दवा/.test(n)) return '💊';
  if (/shampoo|hair/.test(n)) return '🧴';
  if (/battery/.test(n)) return '🔋';
  return '📦';
};

const extractProductName = (text: string): string => {
  return text
    .replace(/\d+(\.\d+)?\s*(kg|kilo|किलो|litre|liter|लीटर|piece|pcs|पीस|packet|पैकेट|bottle|बोतल|tablet|टैबलेट|meter|मीटर|gram|ग्राम|gm|unit|यूनिट|l\b)/gi, '')
    .replace(/\b(mera|mere|paas|hai|हैं|है|ke|का|की|ko|add|jodo|जोड़ो|जोड़ें|I have|have|there is|stock|put|save|enter|record|today|now|abhi|aaj)\b/gi, '')
    .replace(/\s+/g, ' ')
    .trim();
};

const extractQty = (text: string): number => {
  if (/sawa/i.test(text)) return 1.25;
  if (/dedh|dhed/i.test(text)) return 1.5;
  if (/dhai/i.test(text)) return 2.5;
  const match = text.match(/(\d+(\.\d+)?)/);
  return match ? parseFloat(match[1]) : 1;
};

const extractUnit = (text: string, lang: string): string => {
  const t = text.toLowerCase();
  if (/\b(kg|kilo|किलो)\b/.test(t)) return 'kg';
  if (/\b(litre|liter|लीटर|litr)\b/.test(t)) return 'L';
  if (/\b(meter|मीटर|mtr)\b/.test(t)) return 'm';
  if (/\b(gram|ग्राम|gm|grm)\b/.test(t)) return 'gm';
  if (/\b(packet|पैकेट|pack)\b/.test(t)) return lang === 'hi-IN' ? 'पैकेट' : 'packet';
  if (/\b(bottle|बोतल)\b/.test(t)) return lang === 'hi-IN' ? 'बोतल' : 'bottle';
  if (/\b(tablet|टैबलेट)\b/.test(t)) return lang === 'hi-IN' ? 'टैबलेट' : 'tablet';
  if (/\b(piece|pcs|पीस|unit)\b/.test(t)) return lang === 'hi-IN' ? 'पीस' : 'pcs';
  return lang === 'hi-IN' ? 'यूनिट' : 'units';
};

export default function StockTab({ role, language, stock, onAddCategory, sales, profile }: StockTabProps) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [savedItem, setSavedItem] = useState<any>(null);
  const [manualText, setManualText] = useState("");
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const { toast } = useToast();
  const isHelper = role === "helper";
  const recognitionRef = useRef<any>(null);
  const isHi = language === 'hi-IN';

  useEffect(() => {
    if (typeof window === "undefined") return;
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) return;
    const r = new SR();
    r.lang = language;
    r.continuous = false;
    r.interimResults = true;
    r.onresult = (e: any) => {
      let text = "";
      for (let i = 0; i < e.results.length; i++) text += e.results[i][0].transcript;
      setTranscript(text);
      if (e.results[e.results.length - 1].isFinal) saveFromText(text);
    };
    r.onend = () => setIsListening(false);
    r.onerror = () => setIsListening(false);
    recognitionRef.current = r;
  }, [language]);

  const speak = (text: string) => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = language;
    window.speechSynthesis.speak(u);
  };

  const saveFromText = (text: string) => {
    if (!text.trim()) return;
    const name = extractProductName(text) || text.trim();
    const qty = extractQty(text);
    const unit = extractUnit(text, language);
    const emoji = guessEmoji(name);
    const item = {
      id: Date.now(),
      name, hiName: name, qty, unit, emoji,
      level: 100, maxQty: qty,
      lowStockLevel: Math.max(1, qty * 0.2),
      price: 0,
    };
    setSavedItem(item);
    onAddCategory(item);
    speak(isHi ? `${name} जोड़ दिया गया` : `${name} added`);
    setTimeout(() => {
      setSavedItem(null);
      setTranscript("");
      setManualText("");
      setShowAddModal(false);
    }, 1500);
  };

  const startListening = () => {
    if (isListening) return;
    setTranscript("");
    setIsListening(true);
    try { recognitionRef.current?.start(); } catch (e) { setIsListening(false); }
  };

  const speakStockStatus = (item: any) => {
    const name = isHi ? (item.hiName || item.name) : item.name;
    let mood = item.level < 15
      ? (isHi ? "— जल्दी ऑर्डर करो!" : "— Order urgently!")
      : item.level < 30
        ? (isHi ? "— थोड़ा कम है।" : "— Running low.")
        : (isHi ? "— ठीक है।" : "— Stock is fine.");
    speak(isHi ? `${name} ${item.qty} ${item.unit} बचा है ${mood}` : `${name} ${item.qty} ${item.unit} left ${mood}`);
  };

  const handleOrderStock = (item: any) => {
    if (isHelper) return;
    if (!profile?.supplierPhone) {
      toast({ variant: "destructive", title: isHi ? "सप्लायर का नंबर नहीं है" : "No Supplier Number", description: isHi ? "सेटिंग्स में सप्लायर का WhatsApp नंबर जोड़ें।" : "Add supplier WhatsApp in Settings." });
      return;
    }
    const itemName = isHi ? (item.hiName || item.name) : item.name;
    const shopName = profile?.shopName || "BolVyaapar Shop";
    const message = isHi
      ? `नमस्ते, मैं ${shopName} से बोल रहा हूँ। हमें ${itemName} के ${item.maxQty} ${item.unit} की ज़रूरत है। कृपया जल्दी भेजें।`
      : `Hi, this is ${shopName}. We need ${item.maxQty} ${item.unit} of ${itemName}. Please deliver soon.`;
    window.open(`https://wa.me/${profile.supplierPhone}?text=${encodeURIComponent(message)}`, '_blank');
  };

  const texts = {
    "hi-IN": {
      title: "स्टॉक",
      add: "जोड़ें",
      empty: "कोई सामान नहीं — ऊपर जोड़ें बटन दबाएं",
      listen: "सुनो",
      order: "ऑर्डर",
      newItem: "नया सामान जोड़ें",
      typeHere: "यहाँ लिखें...",
      example: "जैसे: '10 किलो चावल' या '5 kg wheat'",
      saved: "सहेज लिया"
    },
    "en-IN": {
      title: "Stock",
      add: "Add",
      empty: "No items yet — tap Add above",
      listen: "Listen",
      order: "Order",
      newItem: "Add Item",
      typeHere: "Type here...",
      example: "e.g. '10kg Rice' or '5 kilo atta'",
      saved: "Saved"
    }
  }[language];

  return (
    <div className="space-y-4 pb-48">
      {/* Header */}
      <div className="flex justify-between items-center px-1">
        <h3 className="text-2xl font-black text-slate-900 tracking-tight">
          {texts.title}
        </h3>
        {!isHelper && (
          <button
            onClick={() => { setShowAddModal(true); setSavedItem(null); setTranscript(""); }}
            className="h-12 px-5 bg-[#C45000] text-white rounded-[20px] flex items-center gap-2 text-sm font-black uppercase tracking-widest shadow-lg active:scale-95 transition-all"
          >
            <Plus size={18} /> {texts.add}
          </button>
        )}
      </div>

      {/* Empty state */}
      {stock.length === 0 && (
        <div className="bg-slate-50 border border-slate-100 rounded-3xl p-12 text-center">
          <p className="text-4xl mb-3">📦</p>
          <p className="text-slate-400 font-bold text-sm">{texts.empty}</p>
        </div>
      )}

      {/* COMPACT 2-column grid */}
      <div className="grid grid-cols-2 gap-3 px-1">
        {stock.map((item) => {
          const isRed = item.level < 15;
          const isYellow = !isRed && item.level < 30;

          return (
            <button
              key={item.id}
              onClick={() => setSelectedItem(item)}
              className={cn(
                "rounded-[20px] p-3.5 border-2 bg-white text-left transition-all active:scale-95 shadow-sm overflow-hidden",
                isRed ? "border-red-400 bg-red-50/10" : isYellow ? "border-amber-400 bg-amber-50/10" : "border-emerald-400"
              )}
            >
              {/* Emoji + alert */}
              <div className="flex items-start justify-between mb-2">
                <span className="text-2xl">{item.emoji || "📦"}</span>
                {isRed && (
                  <div className="bg-red-600 text-white rounded-full p-0.5 shadow-sm">
                    <AlertTriangle size={12} fill="currentColor" />
                  </div>
                )}
              </div>

              {/* Name */}
              <p className="font-bold text-slate-800 text-[11px] uppercase tracking-tight truncate mb-1">
                {isHi ? (item.hiName || item.name) : item.name}
              </p>

              {/* Qty */}
              <div className="flex items-baseline gap-0.5 mb-2">
                <span className={cn(
                  "text-2xl font-black leading-none",
                  isRed ? "text-red-600" : isYellow ? "text-amber-500" : "text-emerald-600"
                )}>
                  {item.qty}
                </span>
                <span className="text-[9px] font-black text-slate-400 uppercase">{item.unit}</span>
              </div>

              {/* Progress bar */}
              <Progress
                value={item.level}
                className={cn(
                  "h-1.5 rounded-full bg-slate-100",
                  isRed ? "[&>div]:bg-red-500" : isYellow ? "[&>div]:bg-amber-400" : "[&>div]:bg-emerald-500"
                )}
              />
            </button>
          );
        })}
      </div>

      {/* Detail bottom sheet */}
      {selectedItem && (
        <div className="fixed inset-0 z-[140] bg-black/50 flex items-end" onClick={() => setSelectedItem(null)}>
          <div className="bg-white w-full rounded-t-[40px] p-8 space-y-6 animate-in slide-in-from-bottom duration-300" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-start">
              <div>
                <span className="text-5xl">{selectedItem.emoji || "📦"}</span>
                <h2 className="text-2xl font-black text-slate-800 mt-2 uppercase">{isHi ? (selectedItem.hiName || selectedItem.name) : selectedItem.name}</h2>
                <p className={cn("text-4xl font-black mt-1", selectedItem.level < 15 ? "text-red-600" : selectedItem.level < 30 ? "text-amber-500" : "text-emerald-600")}>
                  {selectedItem.qty} <span className="text-lg text-slate-400">{selectedItem.unit}</span>
                </p>
              </div>
              <button onClick={() => setSelectedItem(null)} className="h-10 w-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400"><X size={24} /></button>
            </div>

            <Progress
              value={selectedItem.level}
              className={cn("h-3 rounded-full bg-slate-100", selectedItem.level < 15 ? "[&>div]:bg-red-500" : selectedItem.level < 30 ? "[&>div]:bg-amber-400" : "[&>div]:bg-emerald-500")}
            />

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => { speakStockStatus(selectedItem); setSelectedItem(null); }}
                className="h-16 rounded-2xl bg-slate-50 border-2 border-slate-100 flex items-center justify-center gap-3 text-slate-600 font-black uppercase text-xs"
              >
                <Volume2 size={22} /> {texts.listen}
              </button>
              {selectedItem.level < 15 && !isHelper && (
                <button
                  onClick={() => { handleOrderStock(selectedItem); setSelectedItem(null); }}
                  className="h-16 rounded-2xl bg-[#1A6B3C] text-white flex items-center justify-center gap-3 font-black uppercase text-xs shadow-xl shadow-[#1A6B3C]/20"
                >
                  <ShoppingCart size={22} /> {texts.order}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Add Item Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-[150] bg-black/60 backdrop-blur-sm flex items-end justify-center p-4">
          <div className="bg-[#0D2240] w-full max-w-md rounded-[40px] shadow-2xl p-8 space-y-6 animate-in slide-in-from-bottom-4 duration-300">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-black text-white">{texts.newItem}</h2>
              <button onClick={() => setShowAddModal(false)} className="text-white/40"><X size={28} /></button>
            </div>

            {savedItem ? (
              <div className="bg-emerald-500/10 border-2 border-emerald-500/40 p-6 rounded-[28px] text-center animate-in zoom-in-95">
                <div className="text-5xl mb-2">{savedItem.emoji}</div>
                <p className="text-emerald-400 font-black text-xs uppercase flex items-center justify-center gap-1 mb-1">
                  <CheckCircle2 size={12} /> {texts.saved}
                </p>
                <h2 className="text-2xl font-black text-white">{savedItem.name}</h2>
                <p className="text-white/60 font-bold">{savedItem.qty} {savedItem.unit}</p>
              </div>
            ) : (
              <>
                <div className="flex flex-col items-center space-y-3">
                  <button
                    onClick={startListening}
                    className={cn(
                      "h-28 w-28 rounded-full flex items-center justify-center shadow-2xl transition-all active:scale-90",
                      isListening ? "bg-red-500 animate-pulse ring-4 ring-red-500/30" : "bg-[#C45000]"
                    )}
                  >
                    <Mic size={44} className="text-white" />
                  </button>
                  {transcript ? (
                    <p className="text-[#38BDF8] font-black text-sm text-center animate-pulse">"{transcript}"</p>
                  ) : (
                    <p className="text-white/40 text-[10px] font-black uppercase tracking-widest text-center">
                      {texts.example}
                    </p>
                  )}
                </div>

                <div className="flex gap-3">
                  <Input
                    value={manualText}
                    onChange={e => setManualText(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter' && manualText.trim()) saveFromText(manualText); }}
                    placeholder={texts.typeHere}
                    className="h-14 rounded-2xl bg-white/5 border-white/10 text-white flex-1 font-bold"
                  />
                  <button
                    onClick={() => { if (manualText.trim()) saveFromText(manualText); }}
                    disabled={!manualText.trim()}
                    className="h-14 px-5 bg-[#38BDF8] text-[#0D2240] font-black rounded-2xl disabled:opacity-40 uppercase text-xs"
                  >
                    {texts.add}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
