"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Volume2, Plus, X } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";

interface StockTabProps {
  language: "hi-IN" | "en-IN";
  stock: any[];
  onAddCategory: (category: any) => void;
}

export default function StockTab({ language, stock, onAddCategory }: StockTabProps) {
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAddCategory({
      ...formData,
      qty: Number(formData.qty),
      costPrice: Number(formData.costPrice),
      sellingPrice: Number(formData.sellingPrice),
      lowStockLevel: Number(formData.lowStockLevel),
      hiName: formData.hiName || formData.name // Fallback if no Hindi name provided
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
      placeholderName: "सामान का नाम (उदा. तेल)",
      placeholderQty: "मात्रा",
      placeholderPrice: "कीमत"
    },
    "en-IN": {
      title: "Inventory Status",
      addBtn: "Add Category",
      critical: "Critical",
      healthy: "Healthy",
      formTitle: "Add New Category",
      save: "Save Category",
      placeholderName: "Category Name (e.g. Oil)",
      placeholderQty: "Quantity",
      placeholderPrice: "Price"
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
        {stock.map((item) => (
          <Card key={item.id} className="bg-white border-slate-100 rounded-[24px] overflow-hidden shadow-sm">
            <CardContent className="p-5">
              <div className="flex justify-between items-center mb-4">
                <div className="flex gap-4 items-center">
                  <span className="text-4xl">{item.emoji}</span>
                  <div>
                    <h3 className="text-slate-400 text-[10px] uppercase font-bold tracking-widest">
                      {language === 'hi-IN' ? item.hiName : item.name}
                    </h3>
                    <p className="text-[22px] font-black text-slate-900">
                      {item.qty}
                      <span className="text-xs ml-1 font-bold text-slate-400 uppercase">{item.unit}</span>
                    </p>
                  </div>
                </div>
                <button 
                  onClick={() => speakStock(item)}
                  className="h-12 w-12 flex items-center justify-center bg-[#1A6B3C]/10 rounded-2xl text-[#1A6B3C]"
                >
                  <Volume2 size={20} />
                </button>
              </div>
              <div className="space-y-2">
                <Progress value={item.level} className="h-2 rounded-full" />
                <div className="flex justify-between text-[9px] font-black text-slate-300 uppercase tracking-widest">
                  <span className={item.qty <= (item.lowStockLevel || 10) ? "text-destructive" : ""}>
                    {texts.critical}
                  </span>
                  <span>{texts.healthy}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}