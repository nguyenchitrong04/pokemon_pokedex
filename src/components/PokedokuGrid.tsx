"use client";
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { RotateCcw, X, Loader2, Trophy, Search, Share2, Star, Zap, Calendar, Eye } from 'lucide-react';
import confetti from 'canvas-confetti';
import { TYPE_COLORS } from '@/lib/pokemonData';
import { ALL_POKEMON_NAMES } from '@/lib/pokemonNames';

// --- UTILS ---
const GEN_RANGES: Record<string, [number, number]> = {
  gen1: [1, 151], gen2: [152, 251], gen3: [252, 386],
  gen4: [387, 493], gen5: [494, 649], gen6: [650, 721],
  gen7: [722, 809], gen8: [810, 905], gen9: [906, 1025]
};

const seededRandom = (seed: string) => {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = Math.imul(31, h) + seed.charCodeAt(i) | 0;
  return () => {
    h = Math.imul(h ^ h >>> 16, 0x85ebca6b);
    h = Math.imul(h ^ h >>> 13, 0xc2b2ae35);
    return ((h ^= h >>> 16) >>> 0) / 4294967296;
  };
};

const evolutionCache = new Map<string, any>();

// --- COMPONENT THẺ BÀI (TCG STYLE) ---
const PokemonCard = ({ pokemon, isSmall = false }: { pokemon: any, isSmall?: boolean }) => {
  const isShiny = pokemon.isShiny;
  return (
    <div className={`relative w-full h-full rounded-xl p-1 flex flex-col items-center justify-between border shadow-lg animate-in zoom-in
      ${isShiny ? 'bg-gradient-to-br from-yellow-200 to-amber-400 border-amber-500' : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700'}`}>
      {!isSmall && (
        <div className="w-full flex justify-between px-1 text-[7px] font-[1000] uppercase dark:text-slate-900">
          <span className="truncate w-12">{pokemon.name}</span>
          <span className="text-red-600">HP{pokemon.stats[0].base_stat}</span>
        </div>
      )}
      <div className={`w-full flex-1 rounded-md my-0.5 flex items-center justify-center relative overflow-hidden ${isShiny ? 'bg-white/40' : 'bg-slate-50 dark:bg-slate-900'}`}>
        <img 
          src={isShiny ? (pokemon.sprites.other['official-artwork'].front_shiny || pokemon.sprites.front_shiny) : (pokemon.sprites.other['official-artwork'].front_default || pokemon.sprites.front_default)} 
          className="w-full h-full object-contain p-0.5 z-10 drop-shadow-md" 
          alt={pokemon.name} 
        />
        {isShiny && <Star className="absolute text-yellow-500/30 animate-pulse" size={isSmall ? 20 : 40} />}
      </div>
      {!isSmall && (
        <div className="w-full grid grid-cols-2 gap-0.5 text-[5px] font-bold uppercase text-slate-500">
          <div className="bg-slate-100 dark:bg-slate-700 rounded text-center">ATK {pokemon.stats[1].base_stat}</div>
          <div className="bg-slate-100 dark:bg-slate-700 rounded text-center">DEF {pokemon.stats[2].base_stat}</div>
        </div>
      )}
      {isShiny && (
        <div className="absolute top-0 right-0 p-0.5">
          <Star className="text-yellow-600 fill-yellow-500" size={10} />
        </div>
      )}
    </div>
  );
};

// --- MAIN GAME ---
export default function PokedokuProMax({ fetchPoke }: { fetchPoke: any }) {
  const [mode, setMode] = useState<'daily' | 'infinite'>('daily');
  const [gridHeaders, setGridHeaders] = useState<any>(null);
  const [answers, setAnswers] = useState<(any | null)[]>(Array(9).fill(null));
  const [activeSlot, setActiveSlot] = useState<number | null>(null);
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isChecking, setIsChecking] = useState(false);
  const [showSolutions, setShowSolutions] = useState(false);
  const [solutions, setSolutions] = useState<Record<number, any[]>>({});

  // 1. Logic Check (Lõi)
  const checkLogic = async (tag: string, poke: any) => {
    if (!poke || !tag) return false;
    if (TYPE_COLORS[tag]) return poke.types.some((t: any) => t.type.name === tag);
    if (tag.startsWith('gen')) return poke.id >= GEN_RANGES[tag][0] && poke.id <= GEN_RANGES[tag][1];
    
    let evo = evolutionCache.get(poke.species.name);
    if (!evo) {
      try {
        const s = await fetch(poke.species.url).then(r => r.json());
        evo = await fetch(s.evolution_chain.url).then(r => r.json());
        evolutionCache.set(poke.species.name, evo);
      } catch { return false; }
    }
    const find = (n: any): any => {
      if (n.species.name === poke.name) return n;
      for (let next of n.evolves_to) { const f = find(next); if (f) return f; }
    };
    const node = find(evo.chain);
    if (tag === 'no_evo') return evo.chain.species.name === poke.name && evo.chain.evolves_to.length === 0;
    if (tag === 'final_evo') return node && node.evolves_to.length === 0;
    return false;
  };

  // 2. Khởi tạo Bảng
  const initBoard = useCallback((targetMode: 'daily' | 'infinite') => {
    const today = new Date().toISOString().slice(0, 10);
    const rng = seededRandom(targetMode === 'daily' ? today : Math.random().toString());
    const allTypes = Object.keys(TYPE_COLORS);
    
    const rows = [...allTypes].sort(() => 0.5 - rng()).slice(0, 3);
    const colType = allTypes.filter(t => !rows.includes(t)).sort(() => 0.5 - rng())[0];
    const colGen = `gen${Math.floor(rng() * 9) + 1}`;
    const colSpec = rng() > 0.5 ? 'final_evo' : 'no_evo';

    setGridHeaders({ rows, cols: [colType, colGen, colSpec] });
    setAnswers(Array(9).fill(null));
    setShowSolutions(false);
    setSolutions({});
    
    if (targetMode === 'daily') {
      const saved = localStorage.getItem(`pokedoku-daily-${today}`);
      if (saved) setAnswers(JSON.parse(saved));
    }
  }, []);

  useEffect(() => { initBoard(mode); }, [mode, initBoard]);

  // 3. REVEAL SOLUTIONS (Siêu tốc với Sample 50)
  const handleReveal = async () => {
    if (isChecking || !gridHeaders) return;
    setIsChecking(true);
    
    const sampleNames = [...ALL_POKEMON_NAMES].sort(() => 0.5 - Math.random()).slice(0, 50);
    
    // Fetch dữ liệu song song để tối ưu tốc độ
    const sampleData = await Promise.all(
      sampleNames.map(async (name) => {
        try { return await fetchPoke(name); } catch { return null; }
      })
    );
    const validPokes = sampleData.filter(p => p !== null);
    const newSolutions: Record<number, any[]> = {};
    
    for (let i = 0; i < 9; i++) {
      const rTag = gridHeaders.rows[Math.floor(i / 3)];
      const cTag = gridHeaders.cols[i % 3];
      const matches = [];
      for (const p of validPokes) {
        if (await checkLogic(rTag, p) && await checkLogic(cTag, p)) {
          matches.push(p);
          if (matches.length >= 2) break;
        }
      }
      newSolutions[i] = matches;
    }

    setSolutions(newSolutions);
    setShowSolutions(true);
    setIsChecking(false);
  };

  // 4. Validate Guess
  const validateGuess = async (name: string) => {
    if (activeSlot === null) return;
    setIsChecking(true);
    try {
      const p = await fetchPoke(name);
      const isOk = await checkLogic(gridHeaders.rows[Math.floor(activeSlot / 3)], p) && 
                   await checkLogic(gridHeaders.cols[activeSlot % 3], p);
      if (isOk) {
        const newAns = [...answers];
        newAns[activeSlot] = { ...p, isShiny: Math.random() < 0.05 };
        setAnswers(newAns);
        if (mode === 'daily') localStorage.setItem(`pokedoku-daily-${new Date().toISOString().slice(0, 10)}`, JSON.stringify(newAns));
        if (newAns.filter(a => a).length === 9) confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });
        setActiveSlot(null); setQuery(""); setSuggestions([]);
      } else { alert("Pokémon này không thỏa mãn điều kiện!"); }
    } finally { setIsChecking(false); }
  };

  return (
    <div className="flex flex-col items-center gap-6 py-10 px-4 min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors">
      
      {/* Menu & Header */}
      <div className="flex flex-col items-center gap-4">
        <h1 className="text-5xl font-[1000] italic tracking-tighter dark:text-white uppercase">Pokédoku <span className="text-red-600">Pro</span></h1>
        <div className="flex bg-white dark:bg-slate-900 p-1.5 rounded-2xl shadow-xl border dark:border-slate-800">
          <button onClick={() => setMode('daily')} className={`flex items-center gap-2 px-6 py-2 rounded-xl text-xs font-black transition-all ${mode === 'daily' ? 'bg-red-500 text-white shadow-lg' : 'text-slate-400'}`}>
            <Calendar size={14}/> DAILY
          </button>
          <button onClick={() => setMode('infinite')} className={`flex items-center gap-2 px-6 py-2 rounded-xl text-xs font-black transition-all ${mode === 'infinite' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400'}`}>
            <Zap size={14}/> INFINITE
          </button>
        </div>
      </div>

      {/* Grid Chơi */}
      <div className="grid grid-cols-4 gap-3 p-4 bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl border dark:border-slate-800">
        <div className="flex items-center justify-center opacity-10"><Trophy size={40}/></div>
        {gridHeaders?.cols.map((col: string, i: number) => (
          <div key={i} className={`flex items-center justify-center p-3 rounded-2xl font-black text-[9px] text-white shadow-md uppercase tracking-widest ${TYPE_COLORS[col] || 'bg-slate-700'}`}>
            {col.replace('_', ' ')}
          </div>
        ))}
        {gridHeaders?.rows.map((row: string, i: number) => (
          <React.Fragment key={i}>
            <div className={`flex items-center justify-center p-3 rounded-2xl font-black text-[9px] text-white shadow-md uppercase tracking-widest ${TYPE_COLORS[row]}`}>
              {row}
            </div>
            {[0, 1, 2].map(j => {
              const idx = i * 3 + j;
              const p = answers[idx];
              return (
                <div key={idx} onClick={() => !p && setActiveSlot(idx)}
                  className={`w-24 h-32 rounded-2xl border-2 transition-all flex items-center justify-center cursor-pointer relative
                    ${p ? 'border-transparent' : 'border-dashed border-slate-100 dark:border-slate-800 hover:border-red-400'}`}>
                  {p ? <PokemonCard pokemon={p} /> : <span className="text-slate-100 dark:text-slate-800 font-black text-2xl animate-pulse">?</span>}
                </div>
              );
            })}
          </React.Fragment>
        ))}
      </div>

      {/* Hành động */}
      <div className="flex flex-wrap justify-center gap-4 mt-2">
        <button 
          onClick={handleReveal} 
          disabled={isChecking}
          className={`flex items-center gap-2 px-6 py-3 bg-white dark:bg-slate-900 rounded-xl font-black text-xs shadow-md border dark:border-slate-800 transition-all ${isChecking ? 'opacity-50 cursor-wait' : 'hover:text-red-500'}`}
        >
          {isChecking ? <Loader2 className="animate-spin" size={14}/> : <Eye size={14}/>} 
          {showSolutions ? "REFRESH SOLUTIONS" : "QUICK REVEAL"}
        </button>
        <button onClick={() => {
          const grid = answers.map((a, i) => ((i+1)%3===0?'\n':'') + (a? (a.isShiny?'🌟':'✅') : '⬜')).join('');
          navigator.clipboard.writeText(`Pokédoku Pro (${mode})\n${grid}`);
          alert("Result copied!");
        }} className="px-8 py-3 bg-slate-900 text-white rounded-xl font-black text-xs hover:bg-red-600 transition-all flex items-center gap-2">
          <Share2 size={14}/> SHARE
        </button>
      </div>

      {/* Hiển thị Đáp án (Reveal Panel) */}
      {showSolutions && (
        <div className="w-full max-w-2xl grid grid-cols-3 gap-4 mt-4 animate-in fade-in slide-in-from-top-4">
          {[0, 1, 2, 3, 4, 5, 6, 7, 8].map(i => (
            <div key={i} className="bg-white/40 dark:bg-slate-900/40 p-2 rounded-xl border border-dashed dark:border-slate-800 backdrop-blur-sm">
              <p className="text-[7px] font-black text-slate-400 uppercase mb-1 text-center">Hints for Cell {i+1}</p>
              <div className="flex justify-center gap-1 h-14">
                {solutions[i]?.length > 0 ? solutions[i].map(p => (
                  <div key={p.id} className="w-10 h-full"><PokemonCard pokemon={p} isSmall /></div>
                )) : <span className="text-[8px] italic text-slate-300">No sample found</span>}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Search Modal */}
      {activeSlot !== null && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-[2.5rem] p-8 shadow-2xl relative">
            <button onClick={() => setActiveSlot(null)} className="absolute top-6 right-6 text-slate-400 hover:text-red-500"><X /></button>
            <h3 className="text-xl font-black uppercase italic mb-4 dark:text-white">Who's that Pokémon?</h3>
            <input autoFocus className="w-full bg-slate-100 dark:bg-slate-800 p-4 rounded-2xl outline-none font-bold dark:text-white border-2 border-transparent focus:border-red-500"
              placeholder="Ex: Arceus..." value={query} 
              onChange={(e) => {
                setQuery(e.target.value);
                setSuggestions(e.target.value.length >= 2 ? ALL_POKEMON_NAMES.filter(n => n.includes(e.target.value.toLowerCase())).slice(0, 5) : []);
              }} 
            />
            <div className="mt-4 space-y-1">
              {suggestions.map(s => (
                <button key={s} onClick={() => validateGuess(s)} className="w-full p-4 text-left hover:bg-red-500 hover:text-white rounded-xl capitalize font-black dark:text-white transition-all flex justify-between">
                  {s} {isChecking && <Loader2 className="animate-spin" size={14}/>}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}