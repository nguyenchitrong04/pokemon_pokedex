"use client";
import React, { useState, useEffect } from 'react';
import { useUser } from "@clerk/nextjs";
import { supabase } from '@/lib/supabaseClient';
import { 
  Shuffle, Save, Trash2, Plus, Search, Filter, 
  X, Zap, CheckCircle, Loader2, History, ExternalLink, Calendar, Eye, Edit3
} from 'lucide-react';
import { TYPE_COLORS } from '@/lib/pokemonData';
import { ALL_POKEMON_NAMES } from '@/lib/pokemonNames';
import PokemonStatsView from '@/components/PokemonStatsView'; 

const GENS = [
  { id: "1", range: [1, 151], label: "Gen 1" },
  { id: "2", range: [152, 251], label: "Gen 2" },
  { id: "3", range: [252, 386], label: "Gen 3" },
  { id: "4", range: [387, 493], label: "Gen 4" },
  { id: "5", range: [494, 649], label: "Gen 5" },
  { id: "6", range: [650, 721], label: "Gen 6" },
  { id: "7", range: [722, 809], label: "Gen 7" },
  { id: "8", range: [810, 905], label: "Gen 8" },
  { id: "9", range: [906, 1025], label: "Gen 9" },
];

export default function TeamRandomizer({ fetchPoke }: { fetchPoke: any }) {
  const { user, isLoaded: userLoaded } = useUser();
  const [team, setTeam] = useState<any[]>(Array(6).fill(null));
  const [savedTeams, setSavedTeams] = useState<any[]>([]); 
  const [loading, setLoading] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "success">("idle");
  
  // States mới cho việc đặt tên team
  const [customTeamName, setCustomTeamName] = useState("");
  const [randType, setRandType] = useState("");
  const [randGen, setRandGen] = useState("");
  
  // Modals
  const [viewingPoke, setViewingPoke] = useState<any>(null);
  const [searchIdx, setSearchIdx] = useState<number | null>(null);
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);

  const loadSavedTeams = async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from('pokemon_teams')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      if (data) setSavedTeams(data);
    } catch (err) { console.error("Lỗi tải data:", err); }
  };

  useEffect(() => {
    if (userLoaded && user) loadSavedTeams();
  }, [user, userLoaded]);

  const deleteTeam = async (id: string) => {
    if (!confirm("Xóa đội hình này?")) return;
    const { error } = await supabase.from('pokemon_teams').delete().eq('id', id);
    if (!error) loadSavedTeams();
  };

  const handleSaveTeam = async () => {
    if (!user) return alert("Vui lòng đăng nhập!");
    if (team.every(p => p === null)) return alert("Đội hình trống!");
    
    setSaveStatus("saving");
    // Sử dụng tên tùy chỉnh hoặc tên mặc định theo thời gian
    const finalName = customTeamName.trim() || `Team ${new Date().toLocaleTimeString('vi-VN')}`;

    try {
      const { error } = await supabase.from('pokemon_teams').insert({ 
        user_id: user.id,
        team_data: JSON.parse(JSON.stringify(team)),
        team_name: finalName
      });
      if (error) throw error;
      setSaveStatus("success");
      setCustomTeamName(""); // Reset tên sau khi lưu
      await loadSavedTeams();
      setTimeout(() => setSaveStatus("idle"), 3000);
    } catch (err) { setSaveStatus("idle"); }
  };

  const handleRandomTeam = async () => {
    setLoading(true);
    try {
      let results: any[] = [];
      if (randType) {
        const res = await fetch(`https://pokeapi.co/api/v2/type/${randType}`);
        const data = await res.json();
        results = data.pokemon.map((p: any) => p.pokemon);
      } else {
        const res = await fetch(`https://pokeapi.co/api/v2/pokemon?limit=1025`);
        const data = await res.json();
        results = data.results;
      }
      let filtered = results.filter(p => {
        const id = parseInt(p.url.split('/').filter(Boolean).pop() || "0");
        if (randGen) {
          const range = GENS.find(g => g.id === randGen)?.range || [1, 1025];
          return id >= range[0] && id <= range[1];
        }
        return true;
      });
      const shuffled = filtered.sort(() => 0.5 - Math.random()).slice(0, 6);
      const newTeam = await Promise.all(shuffled.map(p => fetchPoke(p.name)));
      setTeam(newTeam);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  return (
    <div className="space-y-12 pb-20 animate-in fade-in duration-700">
      
      {/* 1. BUILDER PANEL */}
      <div className="bg-white dark:bg-slate-900 p-8 rounded-[3.5rem] shadow-2xl border dark:border-slate-800 space-y-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex-1 w-full space-y-4">
            <h2 className="text-3xl font-black uppercase italic tracking-tighter dark:text-white">Team Builder</h2>
            {/* INPUT ĐẶT TÊN TEAM */}
            <div className="relative max-w-sm">
               <Edit3 className="absolute left-4 top-3 text-indigo-500" size={18} />
               <input 
                  type="text"
                  placeholder="Đặt tên cho đội hình..."
                  className="w-full bg-slate-50 dark:bg-slate-800 p-3 pl-12 rounded-2xl outline-none border-2 border-transparent focus:border-indigo-500 font-bold transition-all text-sm dark:text-white"
                  value={customTeamName}
                  onChange={(e) => setCustomTeamName(e.target.value)}
               />
            </div>
          </div>
          <div className="flex gap-3">
            <button onClick={handleRandomTeam} className="bg-indigo-600 text-white px-8 py-4 rounded-2xl font-black uppercase italic text-[10px] flex items-center gap-2 hover:scale-105 active:scale-95 transition-all shadow-xl">
              {loading ? <Loader2 className="animate-spin" size={18}/> : <Shuffle size={18}/>} Random Team
            </button>
            <button onClick={handleSaveTeam} disabled={saveStatus === "saving"} className="bg-emerald-600 text-white px-8 py-4 rounded-2xl font-black uppercase italic text-[10px] flex items-center gap-2 hover:scale-105 active:scale-95 transition-all shadow-xl min-w-[130px] justify-center">
              {saveStatus === "saving" ? <Loader2 className="animate-spin" size={18}/> : saveStatus === "success" ? <CheckCircle size={18}/> : <Save size={18}/>}
              {saveStatus === "success" ? "Saved" : "Save Team"}
            </button>
          </div>
        </div>

        {/* RANDOM FILTERS */}
        <div className="flex flex-wrap gap-4 pt-6 border-t dark:border-slate-800">
          <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800 px-4 py-2 rounded-xl border dark:border-slate-700">
            <Filter size={14} className="text-indigo-500" />
            <select className="bg-transparent font-black uppercase text-[10px] outline-none cursor-pointer dark:text-white" value={randType} onChange={(e) => setRandType(e.target.value)}>
              <option value="">Tất cả Hệ</option>
              {Object.keys(TYPE_COLORS).map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800 px-4 py-2 rounded-xl border dark:border-slate-700">
            <Zap size={14} className="text-yellow-500" />
            <select className="bg-transparent font-black uppercase text-[10px] outline-none cursor-pointer dark:text-white" value={randGen} onChange={(e) => setRandGen(e.target.value)}>
              <option value="">Tất cả Gen</option>
              {GENS.map(g => <option key={g.id} value={g.id}>{g.label}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* 2. TEAM SLOTS */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
        {team.map((p, idx) => (
          <div key={idx} className="bg-white dark:bg-slate-900 p-6 rounded-[3rem] border-2 dark:border-slate-800 text-center shadow-lg group min-h-[260px] flex flex-col justify-between relative transition-all hover:border-indigo-500">
            {p ? (
              <>
                <div className="absolute top-4 right-4 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-all z-10">
                  <button onClick={() => setViewingPoke(p)} className="p-2 bg-blue-500 text-white rounded-full shadow-md hover:scale-110 active:scale-90"><Eye size={14}/></button>
                  <button onClick={() => {const newT=[...team]; newT[idx]=null; setTeam(newT);}} className="p-2 bg-red-500 text-white rounded-full shadow-md hover:scale-110 active:scale-90"><Trash2 size={14}/></button>
                </div>
                <div className="cursor-pointer" onClick={() => setViewingPoke(p)}>
                  <img src={p.sprites.other['official-artwork'].front_default} className="w-24 h-24 mx-auto drop-shadow-2xl" alt={p.name} />
                  <p className="font-black uppercase italic text-[11px] mt-4 tracking-tighter truncate dark:text-white">{p.name}</p>
                </div>
              </>
            ) : (
              <div onClick={() => setSearchIdx(idx)} className="flex-1 flex flex-col items-center justify-center text-slate-300 hover:text-indigo-500 cursor-pointer border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-[2.5rem] transition-all bg-slate-50/30 dark:bg-slate-900/50 group">
                <Plus size={40} className="group-hover:rotate-90 transition-transform duration-300" />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* 3. HISTORY SECTION */}
      <div className="space-y-8 border-t dark:border-slate-800 pt-10">
        <div className="flex items-center gap-4">
          <History className="text-red-500" size={24} />
          <h2 className="text-2xl font-black uppercase italic tracking-widest dark:text-white">Saved Teams</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {savedTeams.map((saved) => (
            <div key={saved.id} className="bg-white dark:bg-slate-900 p-6 rounded-[3rem] border dark:border-slate-800 flex items-center justify-between group border-l-8 border-l-blue-500/30">
              <div className="flex items-center gap-6">
                <div className="grid grid-cols-3 gap-1.5 bg-slate-50 dark:bg-slate-800 p-3 rounded-2xl min-w-[130px]">
                  {saved.team_data.map((p: any, i: number) => (
                    <div key={i} className="w-8 h-8 flex items-center justify-center cursor-pointer hover:scale-125 transition-transform" onClick={() => p && setViewingPoke(p)}>
                      {p ? <img src={p.sprites.front_default} className="w-full h-full object-contain" /> : <div className="w-1.5 h-1.5 bg-slate-300 rounded-full" />}
                    </div>
                  ))}
                </div>
                <div className="space-y-1">
                  <p className="text-lg font-black uppercase italic tracking-tighter dark:text-white leading-none">{saved.team_name}</p>
                  <p className="text-[10px] text-slate-400 font-bold uppercase italic"><Calendar size={12} className="inline mr-1"/> {new Date(saved.created_at).toLocaleDateString()}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => { setTeam(saved.team_data); window.scrollTo({top: 0, behavior: 'smooth'}); }} className="p-4 bg-indigo-500 text-white rounded-[1.5rem] hover:bg-indigo-600 shadow-lg"><ExternalLink size={20} /></button>
                <button onClick={() => deleteTeam(saved.id)} className="p-4 bg-red-500/10 text-red-500 rounded-[1.5rem] hover:bg-red-50 hover:text-white transition-all"><Trash2 size={20} /></button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* MODALS (STAT VIEW & MANUAL SEARCH) */}
      {viewingPoke && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <div className="bg-white dark:bg-slate-900 w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-[3rem] p-8 md:p-12 relative shadow-2xl border dark:border-slate-800 custom-scrollbar">
                <button onClick={() => setViewingPoke(null)} className="absolute top-8 right-8 z-[120] p-3 bg-slate-100 dark:bg-slate-800 hover:bg-red-500 hover:text-white rounded-full transition-all"><X size={24} /></button>
                <PokemonStatsView pokemon={viewingPoke} fetchPoke={fetchPoke} onSelectPokemon={(p: any) => setViewingPoke(p)} />
            </div>
        </div>
      )}

      {searchIdx !== null && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-[3rem] p-10 shadow-2xl border dark:border-slate-800 relative">
            <button onClick={() => setSearchIdx(null)} className="absolute top-8 right-8 p-2 hover:bg-slate-100 rounded-full dark:text-white"><X size={24} /></button>
            <h3 className="font-black uppercase italic text-2xl tracking-tighter mb-8 dark:text-white">Slot #{searchIdx + 1} Member</h3>
            <div className="relative">
              <Search className="absolute left-4 top-4 text-slate-400" size={20} />
              <input autoFocus className="w-full bg-slate-50 dark:bg-slate-800 border-2 dark:border-slate-700 p-4 pl-12 rounded-2xl outline-none focus:border-indigo-500 font-bold dark:text-white" placeholder="Type name..." value={query} onChange={(e) => {
                  setQuery(e.target.value);
                  setSuggestions(ALL_POKEMON_NAMES.filter(n => n.includes(e.target.value.toLowerCase())).slice(0, 5));
              }} />
              <div className="mt-6 space-y-2">
                {suggestions.map(s => (
                  <div key={s} onClick={async () => {
                    const p = await fetchPoke(s);
                    const newTeam = [...team]; newTeam[searchIdx] = p;
                    setTeam(newTeam); setSearchIdx(null); setQuery("");
                  }} className="p-4 bg-slate-50 dark:bg-slate-800 dark:text-white rounded-2xl cursor-pointer hover:bg-indigo-600 hover:text-white font-black uppercase italic text-xs transition-all">{s}</div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}