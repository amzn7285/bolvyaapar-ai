"use client";

import { useState, useEffect } from "react";
import PinLock from "@/components/PinLock";
import Dashboard from "@/components/Dashboard";
import FirstLaunchFlow from "@/components/FirstLaunchFlow";

const PROFILE_KEY = "bolvyaapar_profile";
const LANG_KEY = "bolvyaapar_lang";

export default function Home() {
  const [authenticated, setAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState<"owner" | "helper" | null>(null);
  const [language, setLanguage] = useState<"hi-IN" | "en-IN">("hi-IN");
  const [hasProfile, setHasProfile] = useState(false);
  const [isFirstTime, setIsFirstTime] = useState(false);

  useEffect(() => {
    const savedLang = localStorage.getItem(LANG_KEY) as "hi-IN" | "en-IN";
    if (savedLang) setLanguage(savedLang);
    const profile = localStorage.getItem(PROFILE_KEY);
    if (profile) setHasProfile(true);
  }, []);

  const handleAuth = (role: "owner" | "helper") => {
    setUserRole(role);
    setAuthenticated(true);
  };

  const handleLogout = () => {
    setAuthenticated(false);
    setUserRole(null);
    setIsFirstTime(false);
  };

  const handleLanguageChange = (lang: "hi-IN" | "en-IN") => {
    setLanguage(lang);
    localStorage.setItem(LANG_KEY, lang);
  };

  const handleProfileComplete = () => {
    setHasProfile(true);
    setIsFirstTime(true); // Flag to open Stock tab on first launch after setup
  };

  if (!authenticated) {
    return <PinLock onAuth={handleAuth} language={language} onLanguageChange={handleLanguageChange} />;
  }

  // Show setup flow only for owner on first launch
  if (!hasProfile && userRole === "owner") {
    return <FirstLaunchFlow onComplete={handleProfileComplete} language={language} />;
  }

  return (
    <Dashboard
      role={userRole!}
      language={language}
      onLogout={handleLogout}
      openStockOnLoad={isFirstTime} // Automatically switches to Stock tab after setup
    />
  );
}
