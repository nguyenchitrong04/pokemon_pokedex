"use client";
import React, { useState, useEffect } from 'react';
import { useUser } from "@clerk/nextjs";
import { Search, Shuffle, Filter, X, Loader2, ChevronDown } from "lucide-react";

// Components
import Navbar from '@/components/Navbar';
import PokemonStatsView from '@/components/PokemonStatsView';
import PokedokuGrid from '@/components/PokedokuGrid';
import TeamRandomizer from '@/components/TeamRandomizer';
import PokemonQuiz from '@/components/PokemonQuiz';
import ItemPokedex from '@/components/ItemPokedex';
import ComparisonManager from '@/components/ComparisonManager';
import PokemonTierList from '@/components/PokemonTierList';

// Data
import { ALL_POKEMON_NAMES } from '@/lib/pokemonNames';
import { TYPE_COLORS } from '@/lib/pokemonData';

const GENS = [
  { id: 1, range: [1, 151], label: "Gen 1" },
  { id: 2, range: [152, 251], label: "Gen 2" },
  { id: 3, range: [252, 386], label: "Gen 3" },
  { id: 4, range: [387, 493], label: "Gen 4" },
  { id: 5, range: [494, 649], label: "Gen 5" },
  { id: 6, range: [650, 721], label: "Gen 6" },
  { id: 7, range: [722, 809], label: "Gen 7" },
  { id: 8, range: [810, 905], label: "Gen 8" },
  { id: 9, range: [906, 1025], label: "Gen 9" },
];

export default function PokemonApp() {
  const { isLoaded, user } = useUser();
  const [activeTab, setActiveTab] = useState<'search' | 'grid' | 'items' | 'team' | 'quiz' | 'compare' | 'tier'>('search');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [mounted, setMounted] = useState(false);
  
  // Pokedex States
  const [inputValue, setInputValue] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [mainPokemon, setMainPokemon] = useState<any>(null);
  const [filteredList, setFilteredList] = useState<any[]>([]);
  const [selectedType, setSelectedType] = useState("");
  const [selectedGen, setSelectedGen] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [displayCount, setDisplayCount] = useState(40); // Số lượng hiển thị ban đầu

  useEffect(() => {
    setMounted(true);
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      setIsDarkMode(true);
    }
  }, []);

  const toggleDarkMode = () => {
    const newTheme = !isDarkMode;
    setIsDarkMode(newTheme);
    localStorage.setItem('theme', newTheme ? 'dark' : 'light');
  };

  const getIdFromUrl = (url: string) => url.split('/').filter(Boolean).pop();

  const fetchPoke = async (nameOrId: string) => {
    try {
      const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${nameOrId.toLowerCase().trim()}`);
      return res.ok ? await res.json() : null;
    } catch { return null; }
  };

  const handleTypeClick = (typeName: string) => {
    setSelectedType(typeName.toLowerCase());
    setSelectedGen(null);
    setMainPokemon(null);
    setActiveTab('search');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // LOGIC CHÍNH: Filter và mặc định hiển thị FULL
  useEffect(() => {
    const filterData = async () => {
      setLoading(true);
      try {
        let results: any[] = [];
        
        // 1. Trường hợp chọn Hệ
        if (selectedType) {
          const res = await fetch(`https://pokeapi.co/api/v2/type/${selectedType}`);
          const data = await res.json();
          results = data.pokemon.map((p: any) => p.pokemon);
        } 
        // 2. Trường hợp mặc định hoặc chọn Gen (Fetch toàn bộ 1025 con trước)
        else {
          const res = await fetch(`https://pokeapi.co/api/v2/pokemon?limit=1025`);
          const data = await res.json();
          results = data.results;
        }

        // 3. Lọc theo Gen nếu người dùng chọn
        if (selectedGen) {
          const range = GENS[selectedGen - 1].range;
          results = results.filter((p: any) => {
            const id = parseInt(getIdFromUrl(p.url) || "0");
            return id >= range[0] && id <= range[1];
          });
        }

        // Mapping dữ liệu để hiển thị
        setFilteredList(results.map(p => ({
          id: getIdFromUrl(p.url),
          name: p.name,
          sprite: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${getIdFromUrl(p.url)}.png`
        })));
      } catch (e) { 
        console.error(e); 
      } finally { 
        setLoading(false); 
      }
    };

    if (mounted) filterData();
  }, [selectedType, selectedGen, mounted]);

  if (!isLoaded || !mounted) return null;

  return (
    <div className={`${isDarkMode ? 'dark' : ''} min-h-screen relative overflow-x-hidden transition-colors duration-500`}>
      <div className={`fixed inset-0 pointer-events-none z-0 transition-opacity duration-500 ${
        isDarkMode ? 'bg-black/60' : 'bg-white/10'
      }`} />

      <div className="relative z-10 flex flex-col min-h-screen font-sans">
        <Navbar 
          activeTab={activeTab} setActiveTab={setActiveTab} 
          isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode}
          userFirstName={user?.firstName} 
        />

        <main className="max-w-6xl mx-auto w-full p-4 md:p-6 flex-1 space-y-10">
          {activeTab === 'search' && (
            <div className="space-y-10 animate-in fade-in duration-1000">
              {/* SEARCH CARD */}
              <div className="glass-card p-6 md:p-8 rounded-[3rem] space-y-6">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1 relative">
                    <Search className="absolute left-4 top-4 text-slate-400" size={20} />
                    <input 
                      className="w-full bg-white/40 dark:bg-slate-800/40 border border-white/30 p-4 pl-12 rounded-2xl outline-none focus:ring-2 ring-red-500/50 transition-all font-bold dark:text-white"
                      placeholder="Tìm kiếm Pokémon..." 
                      value={inputValue} 
                      onChange={(e) => {
                        setInputValue(e.target.value);
                        setSuggestions(e.target.value.length > 0 ? ALL_POKEMON_NAMES.filter(n => n.includes(e.target.value.toLowerCase())).slice(0, 6) : []);
                      }} 
                    />
                    {suggestions.length > 0 && (
                      <div className="absolute z-[100] w-full bg-white/95 dark:bg-slate-900/95 mt-2 rounded-2xl shadow-2xl backdrop-blur-2xl border border-white/20">
                        {suggestions.map(s => (
                          <div key={s} onClick={async () => { setMainPokemon(await fetchPoke(s)); setSuggestions([]); setInputValue(""); }} className="p-4 hover:bg-red-500 hover:text-white cursor-pointer capitalize font-black transition-colors">{s}</div>
                        ))}
                      </div>
                    )}
                  </div>
                  <button onClick={async () => setMainPokemon(await fetchPoke((Math.floor(Math.random() * 1025) + 1).toString()))} className="bg-indigo-600/90 text-white px-8 py-4 rounded-2xl font-black uppercase italic text-xs flex gap-2 items-center hover:bg-indigo-700 shadow-xl transition-all">
                    <Shuffle size={18}/> Random
                  </button>
                </div>

                <div className="flex flex-wrap gap-3 items-center pt-4 border-t border-white/10">
                  <div className="flex items-center gap-2 bg-white/40 dark:bg-slate-800/40 px-4 py-2 rounded-xl border border-white/20 shadow-sm">
                    <Filter size={16} className="text-red-500" />
                    <select className="bg-transparent font-black uppercase text-[10px] outline-none cursor-pointer dark:text-white" value={selectedType} onChange={(e) => setSelectedType(e.target.value)}>
                      <option value="" className="text-black">Hệ: Tất cả</option>
                      {Object.keys(TYPE_COLORS).map(t => <option key={t} value={t} className="text-black">{t}</option>)}
                    </select>
                  </div>
                  <div className="flex gap-2 ml-auto overflow-x-auto no-scrollbar pb-1">
                    {GENS.map(g => (
                      <button key={g.id} onClick={() => setSelectedGen(selectedGen === g.id ? null : g.id)} className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase transition-all whitespace-nowrap ${selectedGen === g.id ? 'bg-red-500 text-white shadow-lg shadow-red-500/40' : 'bg-white/40 dark:bg-slate-800/40 border border-white/20 dark:text-white'}`}>{g.label}</button>
                    ))}
                  </div>
                </div>
              </div>

              {mainPokemon && (
                <div className="glass-card p-8 md:p-12 rounded-[4rem] animate-in zoom-in-95 relative overflow-hidden shadow-2xl">
                  <button onClick={() => setMainPokemon(null)} className="absolute top-8 right-8 p-3 bg-white/20 hover:bg-red-500 hover:text-white rounded-full transition-all z-20"><X size={24}/></button>
                  <PokemonStatsView pokemon={mainPokemon} fetchPoke={fetchPoke} onSelectPokemon={(p) => setMainPokemon(p)} onTypeClick={handleTypeClick} />
                </div>
              )}

              {/* GRID RESULTS */}
              {loading ? (
                <div className="flex flex-col items-center py-20 gap-4">
                  <Loader2 className="animate-spin text-red-500" size={48} />
                  <p className="font-black text-slate-500 dark:text-white uppercase italic tracking-widest">Searching Pokedex...</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
                  {filteredList.slice(0, displayCount).map(p => (
                    <div key={p.id} onClick={async () => { setMainPokemon(await fetchPoke(p.id)); window.scrollTo({top: 0, behavior: 'smooth'}); }}
                      className="glass-card p-5 rounded-[2.5rem] text-center hover:scale-105 hover:border-red-500 transition-all cursor-pointer group">
                      <div className="bg-white/40 dark:bg-slate-800/40 rounded-[2rem] p-4 mb-3 relative overflow-hidden shadow-inner border border-white/10">
                        <span className="absolute top-2 left-4 text-[10px] font-black opacity-30 dark:text-white">#{p.id}</span>
                        <img src={p.sprite} className="w-28 h-28 mx-auto relative z-10 group-hover:rotate-6 transition-transform" alt={p.name} loading="lazy" />
                      </div>
                      <p className="font-black uppercase italic tracking-tighter text-sm dark:text-white truncate">{p.name.replace(/-/g, ' ')}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* LOAD MORE BUTTON */}
              {filteredList.length > displayCount && (
                <div className="flex justify-center pb-20">
                  <button onClick={() => setDisplayCount(prev => prev + 40)} className="glass-card px-12 py-4 rounded-2xl font-black uppercase italic text-xs hover:scale-105 active:scale-95 transition-all text-slate-900 dark:text-white">
                    Xem thêm {filteredList.length - displayCount} Pokémon <ChevronDown className="inline ml-2" size={16}/>
                  </button>
                </div>
              )}
            </div>
          )}

          {activeTab === 'tier' && <PokemonTierList />}
          {activeTab === 'grid' && <PokedokuGrid fetchPoke={fetchPoke} onTypeClick={handleTypeClick} />}
          {activeTab === 'items' && <ItemPokedex onSelectPokemon={(p) => { setMainPokemon(p); setActiveTab('search'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} />}
          {activeTab === 'team' && <TeamRandomizer fetchPoke={fetchPoke} />}
          {activeTab === 'quiz' && <PokemonQuiz fetchPoke={fetchPoke} />}
          {activeTab === 'compare' && <ComparisonManager fetchPoke={fetchPoke} />}
        </main>

        <footer className="glass-card mt-auto p-10 text-center border-none rounded-t-[3rem] backdrop-blur-2xl">
          <p className="text-[10px] font-black uppercase tracking-[0.5em] text-slate-500 italic drop-shadow-sm dark:text-slate-400">©  POKÉ-PRO • Thiết kế với tình yêu và niềm đam mê </p>
        </footer>
      </div>
    </div>
  );
}