"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Store, User, Phone, Users, ShieldCheck, ShoppingBasket, Scissors, Wrench, Utensils, Truck } from "lucide-react";

interface ProfileSetupProps {
  onComplete: () => void;
  language: "hi-IN" | "en-IN";
}

const BUSINESS_TYPES = [
  { id: 'kirana', icon: <ShoppingBasket size={18} />, en: "Kirana / General Store", hi: "किराना / जनरल स्टोर" },
  { id: 'tailor', icon: <Scissors size={18} />, en: "Tailor / Boutique", hi: "दर्जी / बुटीक" },
  { id: 'repair', icon: <Wrench size={18} />, en: "Repair Shop", hi: "रिपेयर शॉप" },
  { id: 'dhaba', icon: <Utensils size={18} />, en: "Dhaba / Restaurant", hi: "ढाबा / रेस्टोरेंट" },
  { id: 'milk', icon: <Truck size={18} />, en: "Milk Delivery", hi: "दूध की डिलीवरी" },
];

export default function ProfileSetup({ onComplete, language }: ProfileSetupProps) {
  const [formData, setFormData] = useState({
    shopName: "",
    businessType: "kirana",
    ownerName: "",
    ownerPhone: "",
    supplierName: "",
    supplierPhone: "",
    helperName: "",
    familyPhone: ""
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem("bolvyapar_profile", JSON.stringify(formData));
    onComplete();
  };

  const texts = {
    "hi-IN": {
      title: "प्रोफ़ाइल सेटअप",
      subtitle: "अपने व्यापार की जानकारी भरें",
      shop: "दुकान का नाम",
      bizType: "व्यापार का प्रकार",
      owner: "मालिक का नाम",
      ownerPhone: "मालिक का WhatsApp नंबर",
      supplier: "सप्लायर का नाम",
      supplierPhone: "सप्लायर का WhatsApp नंबर",
      helper: "हेल्पर का नाम",
      family: "घर के सदस्य का WhatsApp नंबर",
      save: "शुरू करें"
    },
    "en-IN": {
      title: "Profile Setup",
      subtitle: "Complete your business profile",
      shop: "Shop Name",
      bizType: "Business Type",
      owner: "Owner Name",
      ownerPhone: "Owner WhatsApp No.",
      supplier: "Supplier Name",
      supplierPhone: "Supplier WhatsApp No.",
      helper: "Helper Name",
      family: "Family Member WhatsApp No.",
      save: "Get Started"
    }
  }[language];

  return (
    <div className="fixed inset-0 bg-[#0D2240] z-[100] flex flex-col p-6 overflow-y-auto">
      <div className="max-w-md mx-auto w-full space-y-8 py-8">
        <div className="text-center space-y-2">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-[#C45000]/20 border border-[#C45000]/30 mb-4">
            <Store className="text-[#C45000]" size={32} />
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight">{texts.title}</h1>
          <p className="text-white/60 text-sm font-medium">{texts.subtitle}</p>
        </div>

        <Card className="border-none bg-white/5 backdrop-blur-md rounded-[32px] overflow-hidden">
          <CardContent className="p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase text-white/40 tracking-widest flex items-center gap-2">
                    <Store size={12} /> {texts.shop}
                  </Label>
                  <Input 
                    required 
                    className="bg-white/5 border-white/10 text-white h-14 rounded-2xl" 
                    placeholder="e.g. Rahul General Store"
                    value={formData.shopName}
                    onChange={e => setFormData({...formData, shopName: e.target.value})}
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase text-white/40 tracking-widest flex items-center gap-2">
                    <ShoppingBasket size={12} /> {texts.bizType}
                  </Label>
                  <Select 
                    value={formData.businessType} 
                    onValueChange={(val) => setFormData({...formData, businessType: val})}
                  >
                    <SelectTrigger className="bg-white/5 border-white/10 text-white h-14 rounded-2xl">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-[#0D2240] border-white/10 text-white rounded-2xl">
                      {BUSINESS_TYPES.map((type) => (
                        <SelectItem key={type.id} value={type.id} className="focus:bg-white/10 focus:text-white">
                          <div className="flex items-center gap-2">
                            {type.icon}
                            <span>{language === 'hi-IN' ? type.hi : type.en}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase text-white/40 tracking-widest flex items-center gap-2">
                      <User size={12} /> {texts.owner}
                    </Label>
                    <Input 
                      required 
                      className="bg-white/5 border-white/10 text-white h-14 rounded-2xl" 
                      value={formData.ownerName}
                      onChange={e => setFormData({...formData, ownerName: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase text-white/40 tracking-widest flex items-center gap-2">
                      <Phone size={12} /> WhatsApp
                    </Label>
                    <Input 
                      required 
                      className="bg-white/5 border-white/10 text-white h-14 rounded-2xl" 
                      placeholder="91..."
                      value={formData.ownerPhone}
                      onChange={e => setFormData({...formData, ownerPhone: e.target.value})}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase text-white/40 tracking-widest flex items-center gap-2">
                      <Users size={12} /> {texts.supplier}
                    </Label>
                    <Input 
                      className="bg-white/5 border-white/10 text-white h-14 rounded-2xl" 
                      value={formData.supplierName}
                      onChange={e => setFormData({...formData, supplierName: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase text-white/40 tracking-widest flex items-center gap-2">
                      <Phone size={12} /> Supplier WA
                    </Label>
                    <Input 
                      className="bg-white/5 border-white/10 text-white h-14 rounded-2xl" 
                      placeholder="91..."
                      value={formData.supplierPhone}
                      onChange={e => setFormData({...formData, supplierPhone: e.target.value})}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase text-white/40 tracking-widest flex items-center gap-2">
                    <ShieldCheck size={12} /> {texts.helper}
                  </Label>
                  <Input 
                    className="bg-white/5 border-white/10 text-white h-14 rounded-2xl" 
                    value={formData.helperName}
                    onChange={e => setFormData({...formData, helperName: e.target.value})}
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase text-white/40 tracking-widest flex items-center gap-2">
                    <Phone size={12} /> {texts.family}
                  </Label>
                  <Input 
                    className="bg-white/5 border-white/10 text-white h-14 rounded-2xl" 
                    placeholder="91..."
                    value={formData.familyPhone}
                    onChange={e => setFormData({...formData, familyPhone: e.target.value})}
                  />
                </div>
              </div>

              <Button type="submit" className="w-full h-16 rounded-2xl bg-[#C45000] text-white font-black text-lg shadow-xl shadow-[#C45000]/20 active:scale-95 transition-all">
                {texts.save}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
