"use client";
import React from 'react';
import { SignInButton, UserButton, SignedIn, SignedOut } from "@clerk/nextjs";
import { Search, Grid3X3, Box, ArrowLeftRight, Users, Gamepad2, Layout, Moon, Sun, Zap } from 'lucide-react';

export default function Navbar({ activeTab, setActiveTab, isDarkMode, toggleDarkMode, userFirstName }: any) {
  const navItems = [
    { id: 'search', label: 'POKEDEX', icon: Search },
    { id: 'grid', label: 'POKEDOKU', icon: Grid3X3 },
    { id: 'items', label: 'ITEMS', icon: Box },
    { id: 'compare', label: 'COMPARE', icon: ArrowLeftRight },
    { id: 'team', label: 'TEAM', icon: Users },
    { id: 'tier', label: 'TIERLIST', icon: Layout },
    { id: 'quiz', label: 'MINIGAMES', icon: Gamepad2 },
  ];

  return (
    <header className="sticky top-0 z-[100] w-full p-4 flex justify-center">
      <div className="glass-card flex items-center justify-between w-full max-w-6xl px-6 py-2 rounded-full border border-white/30 shadow-2xl backdrop-blur-xl">
        
        {/* LOGO */}
        <div className="flex items-center gap-2 cursor-pointer group" onClick={() => setActiveTab('search')}>
          <div className="bg-red-500 p-1.5 rounded-lg shadow-lg group-hover:rotate-12 transition-transform">
            <Zap size={18} className="text-white fill-white" />
          </div>
          <span className="font-black italic text-xl tracking-tighter uppercase dark:text-white">
            POKÉ<span className="text-red-500">-PRO</span>
          </span>
        </div>

        {/* NAVIGATION */}
        <nav className="hidden lg:flex items-center gap-1 bg-white/20 dark:bg-black/20 p-1 rounded-full border border-white/10">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`relative flex items-center gap-2 px-5 py-2 rounded-full transition-all duration-300 ${
                activeTab === item.id ? 'bg-white dark:bg-slate-900 shadow-md scale-105' : 'hover:bg-white/30 dark:hover:bg-black/30'
              }`}
            >
              <item.icon size={16} className={activeTab === item.id ? 'text-red-500' : 'text-slate-500 dark:text-slate-400'} />
              <span className={`text-[10px] font-black uppercase italic ${activeTab === item.id ? 'text-slate-900 dark:text-white' : 'text-slate-500 dark:text-slate-400'}`}>
                {item.label}
              </span>
            </button>
          ))}
        </nav>

        {/* ACTIONS & AUTH */}
        <div className="flex items-center gap-4">
          <button 
            onClick={toggleDarkMode}
            className="p-2.5 bg-white/30 dark:bg-slate-800/50 rounded-full border border-white/20 hover:scale-110 transition-all shadow-md"
          >
            {isDarkMode ? <Sun size={18} className="text-yellow-400" /> : <Moon size={18} className="text-slate-700" />}
          </button>

          <div className="flex items-center gap-4 pl-4 border-l border-white/20">
            <SignedOut>
              <SignInButton mode="modal">
                <button className="bg-red-500 text-white px-5 py-2 rounded-full font-black uppercase italic text-[10px] shadow-lg hover:bg-red-600">
                  Sign In
                </button>
              </SignInButton>
            </SignedOut>

            <SignedIn>
              <div className="flex items-center gap-3">
                <div className="text-right hidden sm:block leading-none">
                  <p className="text-[10px] font-black uppercase italic dark:text-white">{userFirstName || "Trainer"}</p>
                </div>
                <div className="w-10 h-10 rounded-full border-2 border-red-500 p-0.5 shadow-xl transition-transform hover:rotate-6">
                  <UserButton afterSignOutUrl="/" />
                </div>
              </div>
            </SignedIn>
          </div>
        </div>
      </div>
    </header>
  );
}