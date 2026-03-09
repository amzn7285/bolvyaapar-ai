"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Volume2, Plus, AlertTriangle, MessageCircle } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface StockTabProps {
  language: "hi-IN" | "en-IN";
  stock: any[];
  onAddCategory: (category: any) => void;
  sales: any[];
}

export default function StockTab({ language, stock, onAddCategory, sales }: StockTabProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    hiName: "",
    emoji: "📦",
    qty: "",
    unit: "units",
    costPrice: "",
    sellingPrice: "",
    lowStockLevel: ""
  });

  const speakStock = (item: any) => {
    const name = language === 'hi-IN' ? item.hiName : item.name;
    const text = `${name} stock is ${item.qty} ${item.unit}.`;
    if (typeof window === 'undefined' || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = language;
    window.speechSynthesis.speak(utterance);
  };

  const handleOrderStock = (item: any) => {
    // Calculate suggested quantity based on last 7 days sales
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const relevantSales = sales.filter(s => {
      const saleDate = new Date(s.timestamp);
      const prodName = (s.item || "").toLowerCase();
      const itemName = item.name.toLowerCase();
      const itemHiName = (item.hiName || "").toLowerCase();
      const isMatch = prodName.includes(itemName) || prodName.includes(itemHiName);
      return saleDate >= sevenDaysAgo && isMatch;
    });

    const weeklyTotal = relevantSales.reduce((acc, curr) => {
      const qty = parseFloat(curr.qty) || 0;
      return acc + qty;
    }, 0);

    const suggestedQty = Math.max(item.maxQty || 100, Math.ceil(weeklyTotal * 1.5));
    
    const shopName = "BolVyapar AI";
    const message = language === 'hi-IN' 
      ? `नमस्ते! मुझे ${item.hiName || item.name} का स्टॉक चाहिए।\nप्रस्तावित मात्रा: ${suggestedQty} ${item.unit}\nदुकान: ${shopName}`
      : `Hi! I need to restock ${item.name}.\nSuggested Quantity: ${suggestedQty} ${item.unit}\nShop: ${shopName}`;

    const encodedMsg = encodeURIComponent(message);
    window.open(`https://wa.me/?text=${encodedMsg}`, '_blank');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAddCategory({
      ...formData,
      qty: Number(formData.qty),
      costPrice: Number(formData.costPrice),
      sellingPrice: Number(formData.sellingPrice),
      lowStockLevel: Number(formData.lowStockLevel),
      hiName: formData.hiName || formData.name
    });
    setIsDialogOpen(false);
    setFormData({
      name: "",
      hiName: "",
      emoji: "📦",
      qty: "",
      unit: "units",
      costPrice: "",
      sellingPrice: "",
      lowStockLevel: ""
    });
  };

  const texts = {
    "hi-IN": {
      title: "इन्वेंट्री स्टेटस",
      addBtn: "नई कैटेगरी",
      critical: "खत्म होने वाला है",
      healthy: "पर्याप्त है",
      formTitle: "नई स्टॉक कैटेगरी",
      save: "सुरक्षित करें",
      order: "स्टॉक मंगाएं"
    },
    "en-IN": {
      title: "Inventory Status",
      addBtn: "Add Category",
      critical: "Critical",
      healthy: "Healthy",
      formTitle: "Add New Category",
      save: "Save Category",
      order: "Order Stock"
    }
  }[language];

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4 px-1">
        <h3 className="text-slate-900 text-lg font-black tracking-tight">
          {texts.title}
        </h3>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <button className="h-10 px-4 bg-[#C45000] text-white rounded-xl flex items-center gap-2 text-[10px] font-black uppercase tracking-widest shadow-lg shadow-[#C45000]/20">
              <Plus size={14} /> {texts.addBtn}
            </button>
          </DialogTrigger>
          <DialogContent className="max-w-[90vw] rounded-[32px] p-6 border-none shadow-2xl">
            <DialogHeader>
              <DialogTitle className="text-xl font-black text-[#0D2240] mb-4">
                {texts.formTitle}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-[10px] uppercase font-bold text-slate-400">Name (English)</Label>
                  <Input 
                    required 
                    value={formData.name} 
                    onChange={e => setFormData({...formData, name: e.target.value})}
                    placeholder="e.g. Cooking Oil"
                    className="rounded-xl border-slate-100 bg-slate-50"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-[10px] uppercase font-bold text-slate-400">नाम (हिंदी)</Label>
                  <Input 
                    value={formData.hiName} 
                    onChange={e => setFormData({...formData, hiName: e.target.value})}
                    placeholder="उदा. तेल"
                    className="rounded-xl border-slate-100 bg-slate-50"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-[10px] uppercase font-bold text-slate-400">Emoji</Label>
                  <Select onValueChange={val => setFormData({...formData, emoji: val})}>
                    <SelectTrigger className="rounded-xl border-slate-100 bg-slate-50">
                      <SelectValue placeholder="📦" />
                    </SelectTrigger>
                    <SelectContent>
                      {["📦", "🧴", "🍬", "🍫", "🧂", "🍳", "🥖", "🍖", "🥦", "🍎"].map(e => (
                        <SelectItem key={e} value={e}>{e}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label className="text-[10px] uppercase font-bold text-slate-400">Unit</Label>
                  <Select onValueChange={val => setFormData({...formData, unit: val})}>
                    <SelectTrigger className="rounded-xl border-slate-100 bg-slate-50">
                      <SelectValue placeholder="units" />
                    </SelectTrigger>
                    <SelectContent>
                      {["kg", "L", "units", "pkts", "dozen"].map(u => (
                        <SelectItem key={u} value={u}>{u}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-[10px] uppercase font-bold text-slate-400">Opening Stock</Label>
                  <Input 
                    required 
                    type="number" 
                    value={formData.qty} 
                    onChange={e => setFormData({...formData, qty: e.target.value})}
                    className="rounded-xl border-slate-100 bg-slate-50"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-[10px] uppercase font-bold text-slate-400">Low Stock Alert</Label>
                  <Input 
                    required 
                    type="number" 
                    value={formData.lowStockLevel} 
                    onChange={e => setFormData({...formData, lowStockLevel: e.target.value})}
                    className="rounded-xl border-slate-100 bg-slate-50"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-[10px] uppercase font-bold text-slate-400">Cost (₹)</Label>
                  <Input 
                    required 
                    type="number" 
                    value={formData.costPrice} 
                    onChange={e => setFormData({...formData, costPrice: e.target.value})}
                    className="rounded-xl border-slate-100 bg-slate-50"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-[10px] uppercase font-bold text-slate-400">Selling (₹)</Label>
                  <Input 
                    required 
                    type="number" 
                    value={formData.sellingPrice} 
                    onChange={e => setFormData({...formData, sellingPrice: e.target.value})}
                    className="rounded-xl border-slate-100 bg-slate-50"
                  />
                </div>
              </div>

              <Button type="submit" className="w-full h-14 rounded-2xl bg-[#C45000] text-white font-bold shadow-xl shadow-[#C45000]/20">
                {texts.save}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {stock.map((item) => {
          const warning = item.lowStockLevel || 10;
          const isRed = item.qty < (warning * 0.15);
          const isYellow = !isRed && item.qty < (warning * 0.30);
          const isGreen = !isRed && !isYellow && item.qty > (warning * 0.50);

          return (
            <Card 
              key={item.id} 
              className={cn(
                "bg-white rounded-[24px] overflow-hidden shadow-sm transition-all border-2",
                isRed ? "border-red-500" : isYellow ? "border-amber-400" : isGreen ? "border-emerald-500" : "border-slate-100"
              )}
            >
              <CardContent className="p-5">
                <div className="flex justify-between items-center mb-4">
                  <div className="flex gap-4 items-center">
                    <span className="text-4xl relative">
                      {item.emoji}
                      {isRed && (
                        <div className="absolute -top-1 -right-1 bg-red-600 text-white rounded-full p-0.5 animate-flash ring-1 ring-white">
                          <AlertTriangle size={12} fill="currentColor" />
                        </div>
                      )}
                    </span>
                    <div>
                      <h3 className="text-slate-400 text-[10px] uppercase font-bold tracking-widest">
                        {language === 'hi-IN' ? item.hiName : item.name}
                      </h3>
                      <p className={cn(
                        "text-[22px] font-black",
                        isRed ? "text-red-600" : isYellow ? "text-amber-500" : isGreen ? "text-emerald-600" : "text-slate-900"
                      )}>
                        {item.qty}
                        <span className="text-xs ml-1 font-bold text-slate-400 uppercase">{item.unit}</span>
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => speakStock(item)}
                      className={cn(
                        "h-12 w-12 flex items-center justify-center rounded-2xl",
                        isRed ? "bg-red-50 text-red-600" : "bg-slate-50 text-[#1A6B3C]"
                      )}
                    >
                      <Volume2 size={20} />
                    </button>
                    {isRed && (
                      <button 
                        onClick={() => handleOrderStock(item)}
                        className="h-12 px-4 bg-[#1A6B3C] text-white rounded-2xl flex items-center gap-2 text-[10px] font-black uppercase tracking-widest animate-in fade-in slide-in-from-right-2"
                      >
                        <MessageCircle size={16} /> {texts.order}
                      </button>
                    )}
                  </div>
                </div>
                <div className="space-y-2">
                  <Progress 
                    value={item.level} 
                    className={cn(
                      "h-2 rounded-full",
                      isRed ? "[&>div]:bg-red-500" : isYellow ? "[&>div]:bg-amber-400" : isGreen ? "[&>div]:bg-emerald-500" : ""
                    )} 
                  />
                  <div className="flex justify-between text-[9px] font-black uppercase tracking-widest">
                    <span className={isRed ? "text-red-600 font-black" : isYellow ? "text-amber-500" : ""}>
                      {texts.critical}
                    </span>
                    <span className={isGreen ? "text-emerald-600 font-black" : ""}>{texts.healthy}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
