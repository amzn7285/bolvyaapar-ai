
"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Search, MessageCircle, Phone, History, Camera, ArrowUpRight, ArrowDownLeft, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

interface CreditKhataTabProps {
  language: "hi-IN" | "en-IN";
  customers: any[];
  onUpdateCustomers: (customers: any[]) => void;
  profile: any;
}

export default function CreditKhataTab({ language, customers, onUpdateCustomers, profile }: CreditKhataTabProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newCustomer, setNewCustomer] = useState({ name: "", phone: "" });

  const filteredCustomers = customers.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.phone.includes(searchTerm)
  );

  const handleAddCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCustomer.name) return;
    const updated = [...customers, { ...newCustomer, id: Date.now(), balance: 0, history: [] }];
    onUpdateCustomers(updated);
    setIsAddOpen(false);
    setNewCustomer({ name: "", phone: "" });
  };

  const handleSendReminder = (customer: any) => {
    const shopName = profile?.shopName || "BolVyapar AI Shop";
    const message = language === 'hi-IN'
      ? `नमस्ते ${customer.name}! ${shopName} से रिमाइंडर। आपका ₹${customer.balance} का उधार बाकी है। कृपया जल्द भुगतान करें। धन्यवाद!`
      : `Hi ${customer.name}! Reminder from ${shopName}. Your outstanding balance is ₹${customer.balance}. Please clear it soon. Thank you!`;
    window.open(`https://wa.me/${customer.phone}?text=${encodeURIComponent(message)}`, '_blank');
  };

  const handleSharePhoto = (customer: any) => {
    const message = language === 'hi-IN' 
      ? `नमस्ते ${customer.name}, यहाँ आपके हिसाब की फोटो है:`
      : `Hi ${customer.name}, here is a photo of your ledger page:`;
    window.open(`https://wa.me/${customer.phone}?text=${encodeURIComponent(message)}`, '_blank');
    // Note: Standard web links don't attach local files. User must manually attach the photo in WhatsApp.
  };

  const texts = {
    "hi-IN": { title: "क्रेडिट खाता (Udhar)", search: "नाम से खोजें", add: "नया ग्राहक", empty: "कोई ग्राहक नहीं मिला", history: "हिसाब", balance: "बाकी उधार", remind: "रिमाइंडर भेजें", camera: "फोटो भेजें" },
    "en-IN": { title: "Credit Khata", search: "Search by name", add: "New Customer", empty: "No customers found", history: "History", balance: "Balance Due", remind: "Send Reminder", camera: "Send Photo" }
  }[language];

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center px-1">
        <h2 className="text-xl font-black text-[#0D2240]">{texts.title}</h2>
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button className="h-10 rounded-xl bg-[#C45000] text-white flex gap-2 font-bold uppercase text-[10px] tracking-widest shadow-lg shadow-[#C45000]/20">
              <Plus size={14} /> {texts.add}
            </Button>
          </DialogTrigger>
          <DialogContent className="rounded-3xl p-6 border-none max-w-[90vw]">
            <DialogHeader><DialogTitle className="text-xl font-black">{texts.add}</DialogTitle></DialogHeader>
            <form onSubmit={handleAddCustomer} className="space-y-4 pt-4">
              <div className="space-y-2">
                <Input required placeholder="Customer Name" value={newCustomer.name} onChange={e => setNewCustomer({...newCustomer, name: e.target.value})} className="h-14 rounded-2xl bg-slate-50 border-slate-100" />
              </div>
              <div className="space-y-2">
                <Input placeholder="Phone (with 91...)" value={newCustomer.phone} onChange={e => setNewCustomer({...newCustomer, phone: e.target.value})} className="h-14 rounded-2xl bg-slate-50 border-slate-100" />
              </div>
              <Button type="submit" className="w-full h-14 rounded-2xl bg-[#C45000] text-white font-bold text-lg">Save Customer</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
        <Input 
          value={searchTerm} 
          onChange={e => setSearchTerm(e.target.value)} 
          placeholder={texts.search} 
          className="h-14 pl-12 rounded-2xl border-slate-100 shadow-sm bg-white" 
        />
      </div>

      <div className="space-y-3">
        {filteredCustomers.length === 0 ? (
          <div className="text-center py-20 opacity-30 flex flex-col items-center">
            <BookOpen size={48} className="mb-2" />
            <p className="font-bold">{texts.empty}</p>
          </div>
        ) : (
          filteredCustomers.map(customer => (
            <Card key={customer.id} className="rounded-2xl border-slate-100 shadow-sm bg-white overflow-hidden">
              <CardContent className="p-4 space-y-3">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-[#C45000]/5 text-[#C45000] flex items-center justify-center font-black text-xl">
                      {customer.name[0].toUpperCase()}
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-800">{customer.name}</h4>
                      <p className="text-[10px] text-slate-400 font-bold flex items-center gap-1"><Phone size={10} /> {customer.phone || '---'}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-[9px] font-black uppercase text-slate-400 tracking-widest">{texts.balance}</p>
                    <p className="text-xl font-black text-red-600">₹{customer.balance.toLocaleString()}</p>
                  </div>
                </div>

                <div className="flex gap-2 pt-2 border-t border-slate-50">
                  <Button onClick={() => setSelectedCustomer(customer)} variant="outline" className="flex-1 h-10 rounded-xl border-slate-100 text-slate-500 font-bold text-[10px] uppercase gap-2">
                    <History size={14} /> {texts.history}
                  </Button>
                  <Button onClick={() => handleSendReminder(customer)} className="flex-1 h-10 rounded-xl bg-[#1A6B3C] text-white font-bold text-[10px] uppercase gap-2">
                    <MessageCircle size={14} /> {texts.remind}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Detailed History Dialog */}
      <Dialog open={!!selectedCustomer} onOpenChange={() => setSelectedCustomer(null)}>
        <DialogContent className="max-w-[95vw] h-[80vh] flex flex-col p-0 border-none rounded-t-[32px] overflow-hidden">
          {selectedCustomer && (
            <>
              <div className="bg-[#0D2240] p-8 text-white">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-2xl font-black">{selectedCustomer.name}</h2>
                    <p className="text-white/40 text-[10px] font-bold uppercase tracking-widest">{selectedCustomer.phone}</p>
                  </div>
                  <button onClick={() => setSelectedCustomer(null)} className="p-2 text-white/40"><X size={24} /></button>
                </div>
                <div className="mt-6 flex items-baseline gap-2">
                  <span className="text-white/40 text-xs font-bold uppercase">Total Due</span>
                  <span className="text-4xl font-black text-[#FFB300]">₹{selectedCustomer.balance}</span>
                </div>
              </div>

              <div className="flex-1 bg-slate-50 overflow-y-auto p-4 space-y-3">
                <Button onClick={() => handleSharePhoto(selectedCustomer)} className="w-full h-14 bg-white border border-slate-200 text-slate-600 rounded-2xl flex items-center justify-center gap-2 font-bold shadow-sm mb-4">
                  <Camera size={20} className="text-[#C45000]" /> {texts.camera}
                </Button>

                {selectedCustomer.history?.length === 0 ? (
                  <p className="text-center py-10 text-slate-300 font-bold uppercase text-[10px]">No History Yet</p>
                ) : (
                  selectedCustomer.history.map((entry: any) => (
                    <div key={entry.id} className="bg-white p-4 rounded-2xl flex items-center justify-between border border-slate-100">
                      <div className="flex gap-3 items-center">
                        <div className={cn(
                          "w-10 h-10 rounded-xl flex items-center justify-center",
                          entry.type === 'credit' ? "bg-red-50 text-red-600" : "bg-emerald-50 text-emerald-600"
                        )}>
                          {entry.type === 'credit' ? <ArrowUpRight size={20} /> : <ArrowDownLeft size={20} />}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-800">{entry.note || (entry.type === 'credit' ? 'Udhar' : 'Jama')}</p>
                          <p className="text-[10px] text-slate-400 font-medium uppercase">{format(new Date(entry.timestamp), 'dd MMM, hh:mm a')}</p>
                        </div>
                      </div>
                      <p className={cn(
                        "text-lg font-black",
                        entry.type === 'credit' ? "text-red-600" : "text-emerald-600"
                      )}>
                        {entry.type === 'credit' ? '+' : '-'} ₹{entry.amount}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
