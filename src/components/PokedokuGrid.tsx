"use client";
import React, { useState, useEffect, useCallback } from 'react';
import { X, Loader2, Trophy, Share2, Star, Zap, Calendar, Eye, Search } from 'lucide-react';
import confetti from 'canvas-confetti';
import { TYPE_COLORS } from '@/lib/pokemonData';
import { ALL_POKEMON_NAMES } from '@/lib/pokemonNames';

// --- ĐỊNH NGHĨA KIỂU DỮ LIỆU ---
interface PokedokuGridProps {
  fetchPoke: (nameOrId: string) => Promise<any>;
  onTypeClick?: (typeName: string) => void; 
}

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

// --- COMPONENT THẺ BÀI ---
const PokemonCard = ({ pokemon, isSmall = false }: { pokemon: any, isSmall?: boolean }) => {
  const isShiny = pokemon.isShiny;
  return (
    <div className={`relative w-full h-full rounded-xl p-1 flex flex-col items-center justify-between border shadow-lg animate-in zoom-in duration-300
      ${isShiny ? 'bg-gradient-to-br from-yellow-200 to-amber-400 border-amber-500' : 'bg-white/10 backdrop-blur-md border-white/20'}`}>
      {!isSmall && (
        <div className="w-full flex justify-between px-1 text-[7px] font-[1000] uppercase text-white">
          <span className="truncate w-12">{pokemon.name}</span>
          <span className="text-red-400">HP{pokemon.stats[0].base_stat}</span>
        </div>
      )}
      <div className={`w-full flex-1 rounded-md my-0.5 flex items-center justify-center relative overflow-hidden ${isShiny ? 'bg-white/40' : 'bg-black/20'}`}>
        <img 
          src={isShiny ? (pokemon.sprites.other['official-artwork'].front_shiny || pokemon.sprites.front_shiny) : (pokemon.sprites.other['official-artwork'].front_default || pokemon.sprites.front_default)} 
          className="w-full h-full object-contain p-0.5 z-10 drop-shadow-md" 
          alt={pokemon.name} 
        />
        {isShiny && <Star className="absolute text-yellow-500/30 animate-pulse" size={isSmall ? 20 : 40} />}
      </div>
      {!isSmall && (
        <div className="w-full grid grid-cols-2 gap-0.5 text-[5px] font-bold uppercase text-white/50">
          <div className="bg-black/30 rounded text-center">ATK {pokemon.stats[1].base_stat}</div>
          <div className="bg-black/30 rounded text-center">DEF {pokemon.stats[2].base_stat}</div>
        </div>
      )}
    </div>
  );
};

// --- MAIN GAME COMPONENT ---
export default function PokedokuGrid({ fetchPoke, onTypeClick }: PokedokuGridProps) {
  const [mode, setMode] = useState<'daily' | 'infinite'>('daily');
  const [gridHeaders, setGridHeaders] = useState<{rows: string[], cols: string[]} | null>(null);
  const [answers, setAnswers] = useState<(any | null)[]>(Array(9).fill(null));
  const [activeSlot, setActiveSlot] = useState<number | null>(null);
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isChecking, setIsChecking] = useState(false);
  const [showSolutions, setShowSolutions] = useState(false);
  const [solutions, setSolutions] = useState<Record<number, any[]>>({});

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
      if (n.species.name === poke.name || n.species.name === poke.species.name) return n;
      for (let next of n.evolves_to) { const f = find(next); if (f) return f; }
    };
    const node = find(evo.chain);
    if (tag === 'no_evo') return evo.chain.species.name === (poke.species.name) && evo.chain.evolves_to.length === 0;
    if (tag === 'final_evo') return node && node.evolves_to.length === 0;
    return false;
  };

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
    
    if (targetMode === 'daily') {
      const saved = localStorage.getItem(`pokedoku-daily-${today}`);
      if (saved) setAnswers(JSON.parse(saved));
    }
  }, []);

  useEffect(() => { initBoard(mode); }, [mode, initBoard]);

  const handleReveal = async () => {
    if (isChecking || !gridHeaders) return;
    setIsChecking(true);
    // Lưu ý: Logic lấy gợi ý có thể tốn tài nguyên, đây là bản rút gọn
    alert("Tính năng gợi ý đang được tối ưu hóa!");
    setIsChecking(false);
  };

  const validateGuess = async (name: string) => {
    if (activeSlot === null || !gridHeaders) return;
    setIsChecking(true);
    try {
      const p = await fetchPoke(name);
      const rowTag = gridHeaders.rows[Math.floor(activeSlot / 3)];
      const colTag = gridHeaders.cols[activeSlot % 3];
      
      const isOk = (await checkLogic(rowTag, p)) && (await checkLogic(colTag, p));
      
      if (isOk) {
        const newAns = [...answers];
        newAns[activeSlot] = { ...p, isShiny: Math.random() < 0.05 };
        setAnswers(newAns);
        if (mode === 'daily') {
           localStorage.setItem(`pokedoku-daily-${new Date().toISOString().slice(0, 10)}`, JSON.stringify(newAns));
        }
        if (newAns.filter(a => a).length === 9) confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });
        setActiveSlot(null); setQuery(""); setSuggestions([]);
      } else { 
        alert(`Pokémon này không thỏa mãn điều kiện: ${rowTag} & ${colTag}`); 
      }
    } catch (err) {
      alert("Lỗi khi kiểm tra Pokémon!");
    } finally { setIsChecking(false); }
  };

  return (
    <div className="flex flex-col items-center gap-8 py-6 px-4 animate-in fade-in duration-700">
      
      {/* Header & Modes */}
      <div className="flex flex-col md:flex-row justify-between items-center w-full max-w-2xl gap-4">
        <h1 className="text-4xl font-[1000] italic tracking-tighter text-white uppercase">
          Poké<span className="text-red-600">doku</span> Pro
        </h1>
        <div className="flex bg-black/40 backdrop-blur-md p-1.5 rounded-2xl border border-white/10 shadow-2xl">
          <button onClick={() => setMode('daily')} className={`flex items-center gap-2 px-6 py-2 rounded-xl text-[10px] font-black transition-all ${mode === 'daily' ? 'bg-red-500 text-white shadow-lg' : 'text-white/40'}`}>
            <Calendar size={14}/> DAILY
          </button>
          <button onClick={() => setMode('infinite')} className={`flex items-center gap-2 px-6 py-2 rounded-xl text-[10px] font-black transition-all ${mode === 'infinite' ? 'bg-indigo-600 text-white shadow-lg' : 'text-white/40'}`}>
            <Zap size={14}/> INFINITE
          </button>
        </div>
      </div>

      {/* Ma trận Grid */}
      <div className="glass-card p-6 rounded-[3rem] shadow-2xl border border-white/10">
        <div className="grid grid-cols-4 gap-4">
          <div className="flex items-center justify-center bg-white/5 rounded-2xl shadow-inner">
            <Trophy className="text-yellow-500/50 animate-bounce" size={32}/>
          </div>

          {gridHeaders?.cols.map((col: string, i: number) => (
            <div key={i} onClick={() => onTypeClick?.(col)} className={`flex items-center justify-center p-4 rounded-2xl font-black text-[10px] text-white shadow-lg uppercase tracking-widest cursor-pointer hover:scale-105 transition-transform ${TYPE_COLORS[col] || 'bg-slate-700'}`}>
              {col.replace('gen', 'Gen ').replace('_', ' ')}
            </div>
          ))}

          {gridHeaders?.rows.map((row: string, i: number) => (
            <React.Fragment key={i}>
              <div onClick={() => onTypeClick?.(row)} className={`flex items-center justify-center p-4 rounded-2xl font-black text-[10px] text-white shadow-lg uppercase tracking-widest cursor-pointer hover:scale-105 transition-transform ${TYPE_COLORS[row]}`}>
                {row}
              </div>
              {[0, 1, 2].map(j => {
                const idx = i * 3 + j;
                const p = answers[idx];
                return (
                  <div key={idx} onClick={() => !p && setActiveSlot(idx)}
                    className={`w-24 h-32 md:w-32 md:h-44 rounded-3xl border-2 transition-all flex items-center justify-center cursor-pointer relative group
                      ${p ? 'border-transparent' : 'border-dashed border-white/10 bg-white/5 hover:bg-white/10 hover:border-red-500/50'}`}>
                    {p ? <PokemonCard pokemon={p} /> : <span className="text-white/10 font-black text-4xl group-hover:text-red-500/20 transition-colors">?</span>}
                  </div>
                );
              })}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-4">
        <button onClick={handleReveal} disabled={isChecking} className="flex items-center gap-2 px-8 py-4 bg-white/10 hover:bg-white/20 text-white rounded-2xl font-black text-[10px] uppercase border border-white/10 transition-all">
          {isChecking ? <Loader2 className="animate-spin" size={16}/> : <Eye size={16}/>} HINTS
        </button>
        <button onClick={() => {
          const grid = answers.map((a, i) => ((i+1)%3===0?'\n':'') + (a? (a.isShiny?'🌟':'✅') : '⬜')).join('');
          navigator.clipboard.writeText(`Pokédoku Pro\n${grid}`);
          alert("Kết quả đã được copy!");
        }} className="flex items-center gap-2 px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-black text-[10px] uppercase shadow-lg shadow-indigo-500/20 transition-all">
          <Share2 size={16}/> SHARE
        </button>
      </div>

      {/* Search Modal */}
      {activeSlot !== null && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-300">
          <div className="bg-slate-900 w-full max-w-sm rounded-[2.5rem] p-8 shadow-2xl relative border border-white/10">
            <button onClick={() => setActiveSlot(null)} className="absolute top-6 right-6 text-white/40 hover:text-red-500"><X /></button>
            <h3 className="text-xl font-black uppercase italic mb-6 text-white tracking-tighter">Who's that Pokémon?</h3>
            <div className="relative">
              <Search className="absolute left-4 top-4 text-white/30" size={20} />
              <input autoFocus className="w-full bg-white/5 p-4 pl-12 rounded-2xl outline-none font-bold text-white border-2 border-transparent focus:border-red-500 transition-all"
                placeholder="Ex: Pikachu..." value={query} 
                onChange={(e) => {
                  const val = e.target.value;
                  setQuery(val);
                  setSuggestions(val.length >= 2 ? ALL_POKEMON_NAMES.filter(n => n.includes(val.toLowerCase())).slice(0, 5) : []);
                }} 
              />
            </div>
            <div className="mt-4 space-y-2">
              {suggestions.map(s => (
                <button key={s} onClick={() => validateGuess(s)} disabled={isChecking} className="w-full p-4 text-left hover:bg-red-500 text-white rounded-xl capitalize font-black transition-all flex justify-between items-center group disabled:opacity-50">
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