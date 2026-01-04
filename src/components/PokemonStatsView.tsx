"use client";
import React, { useMemo, useState, useEffect } from 'react';
import { ABILITY_DESC } from '@/lib/abilityData';
import { TYPE_COLORS, TYPE_EFFECTIVENESS } from '@/lib/pokemonData';
import { 
  ChevronRight, Sparkles, Activity, BookOpen, 
  Fingerprint, Sword, ShieldAlert, ShieldCheck, Info, X, Loader2
} from 'lucide-react';

interface PokemonStatsViewProps {
  pokemon: any;
  fetchPoke: (nameOrId: string) => Promise<any>;
  onSelectPokemon: (p: any) => void;
  onTypeClick?: (typeName: string) => void;
}

export default function PokemonStatsView({ 
  pokemon, 
  fetchPoke, 
  onSelectPokemon,
  onTypeClick 
}: PokemonStatsViewProps) {
  const [evoChain, setEvoChain] = useState<any[]>([]);
  const [flavorText, setFlavorText] = useState("");
  const [levelMoves, setLevelMoves] = useState<any[]>([]);
  const [selectedAbility, setSelectedAbility] = useState<string | null>(null);
  
  // States cho tính năng xem chi tiết Move
  const [selectedMove, setSelectedMove] = useState<any>(null);
  const [isMoveLoading, setIsMoveLoading] = useState(false);

  const getIdFromUrl = (url: string) => url.split('/').filter(Boolean).pop();

  const handleEvoClick = async (name: string) => {
    if (name === pokemon.name) return;
    const newPoke = await fetchPoke(name);
    if (newPoke) {
      onSelectPokemon(newPoke);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Hàm fetch chi tiết chiêu thức
  const handleMoveClick = async (moveName: string) => {
    setIsMoveLoading(true);
    try {
      const response = await fetch(`https://pokeapi.co/api/v2/move/${moveName.toLowerCase().replace(/ /g, '-')}`);
      const data = await response.json();
      setSelectedMove(data);
    } catch (error) {
      console.error("Lỗi tải chi tiết chiêu thức:", error);
    } finally {
      setIsMoveLoading(false);
    }
  };

  useEffect(() => {
    const fetchExtraData = async () => {
      try {
        const speciesRes = await fetch(pokemon.species.url);
        const speciesData = await speciesRes.json();
        
        // 1. Flavor Text
        const englishFlavor = speciesData.flavor_text_entries.find(
          (entry: any) => entry.language.name === 'en'
        )?.flavor_text.replace(/\f/g, ' ');
        setFlavorText(englishFlavor || "Data currently unavailable.");

        // 2. Evolution Chain
        const evoRes = await fetch(speciesData.evolution_chain.url);
        const evoData = await evoRes.json();
        const fullChain = [];
        let curr = evoData.chain;

        while (curr) {
          const speciesName = curr.species.name;
          const sRes = await fetch(`https://pokeapi.co/api/v2/pokemon-species/${speciesName}`);
          const sData = await sRes.json();
          const varieties = sData.varieties.map((v: any) => {
            const id = getIdFromUrl(v.pokemon.url);
            return {
              name: v.pokemon.name,
              id: id,
              sprite: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`
            };
          });
          const details = curr.evolution_details[0];
          fullChain.push({ speciesName, varieties, level: details?.min_level, item: details?.item?.name });
          curr = curr.evolves_to[0];
        }
        setEvoChain(fullChain);

        // 3. Level-up Moves
        const moves = pokemon.moves
          .filter((m: any) => m.version_group_details[0].move_learn_method.name === 'level-up')
          .map((m: any) => ({
            name: m.move.name.replace(/-/g, ' '),
            level: m.version_group_details[0].level_learned_at
          }))
          .sort((a: any, b: any) => a.level - b.level);
        setLevelMoves(moves);
      } catch (e) { console.error(e); }
    };
    fetchExtraData();
    setSelectedAbility(null);
    setSelectedMove(null);
  }, [pokemon]);

  const typeEffect = useMemo(() => {
    const results: { [key: string]: number } = {};
    const pokeTypes = pokemon.types.map((t: any) => t.type.name);
    Object.keys(TYPE_EFFECTIVENESS).forEach((atk) => {
      let mult = 1;
      pokeTypes.forEach((def: string) => {
        if (TYPE_EFFECTIVENESS[atk][def] !== undefined) mult *= TYPE_EFFECTIVENESS[atk][def];
      });
      if (mult !== 1) results[atk] = mult;
    });
    return results;
  }, [pokemon]);

  return (
    <div className="flex flex-col space-y-12 pb-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* SECTION 1: HEADER & ABILITIES */}
      <div className="flex flex-col lg:flex-row items-center gap-12">
        <div className="text-center group relative min-w-[320px]">
          <img src={pokemon.sprites.other['official-artwork'].front_default} className="w-72 h-72 drop-shadow-2xl transition-all group-hover:scale-110" alt={pokemon.name} />
          <div className="mt-6">
            <h2 className="text-5xl font-black uppercase italic tracking-tighter dark:text-white">{pokemon.name.replace(/-/g, ' ')}</h2>
            <div className="flex gap-2 justify-center mt-4">
              {pokemon.types.map((t: any) => (
                <button key={t.type.name} onClick={() => onTypeClick?.(t.type.name)} className={`${TYPE_COLORS[t.type.name]} px-5 py-2 rounded-2xl text-[10px] font-black uppercase text-white shadow-lg border-b-4 border-black/20 hover:brightness-110`}>
                  {t.type.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex-1 space-y-6 w-full">
          <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-[2.5rem] border-2 border-dashed dark:border-slate-700 relative">
            <BookOpen className="absolute -top-3 -left-3 bg-red-500 text-white p-2 rounded-lg" size={32} />
            <p className="text-sm font-bold italic text-slate-600 dark:text-slate-300">"{flavorText}"</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {pokemon.abilities.map((a: any) => (
              <div key={a.ability.name} className="flex flex-col gap-2">
                <button onClick={() => setSelectedAbility(selectedAbility === a.ability.name ? null : a.ability.name)} 
                  className={`bg-white dark:bg-slate-900 p-4 rounded-2xl border flex items-center gap-4 shadow-sm transition-all ${selectedAbility === a.ability.name ? 'border-blue-500 ring-4 ring-blue-500/10' : 'dark:border-slate-800 hover:border-blue-400'}`}>
                  <div className={`p-3 rounded-xl ${selectedAbility === a.ability.name ? 'bg-blue-500 text-white' : 'bg-blue-50 dark:bg-blue-900/30 text-blue-500'}`}><Fingerprint size={20} /></div>
                  <div className="text-left flex-1">
                    <p className="text-[10px] font-black uppercase dark:text-white">{a.ability.name.replace(/-/g, ' ')}</p>
                    <p className="text-[8px] font-bold text-slate-400 uppercase">{a.is_hidden ? 'Hidden Ability' : 'Standard'}</p>
                  </div>
                  <Info size={14} className="text-slate-300" />
                </button>
                {selectedAbility === a.ability.name && (
                  <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800/50 rounded-2xl animate-in slide-in-from-top-2">
                    <p className="text-[10px] font-bold text-blue-700 dark:text-blue-300 italic leading-relaxed">{ABILITY_DESC[a.ability.name] || "Description being updated..."}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* SECTION 2: BASE STATISTICS */}
      <div className="p-8 bg-slate-50 dark:bg-slate-800/40 rounded-[3rem] border dark:border-slate-700/50 shadow-inner">
        <h3 className="text-[10px] font-black uppercase text-slate-400 mb-8 tracking-widest italic flex items-center gap-2"><Activity size={16} /> Base Statistics</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
          {pokemon.stats.map((s: any) => (
            <div key={s.stat.name} className="flex items-center gap-4">
              <span className="w-24 text-[9px] font-black text-slate-400 uppercase">{s.stat.name.replace('special-', 'sp. ')}</span>
              <div className="flex-1 bg-white dark:bg-slate-900 h-3 rounded-full border dark:border-slate-800 p-0.5 shadow-inner">
                <div className={`${TYPE_COLORS[pokemon.types[0].type.name]} h-full rounded-full transition-all duration-1000`} style={{ width: `${Math.min((s.base_stat/255)*100, 100)}%` }} />
              </div>
              <span className="w-10 text-right font-mono text-xs font-black dark:text-white">{s.base_stat}</span>
            </div>
          ))}
        </div>
      </div>

      {/* SECTION 3: EVOLUTION */}
      <div className="p-10 bg-white dark:bg-slate-900 rounded-[3.5rem] border-2 dark:border-slate-800 shadow-xl overflow-x-auto custom-scrollbar">
        <h4 className="text-[10px] font-black uppercase text-blue-500 mb-10 tracking-widest italic flex items-center gap-2"><Sparkles size={18} className="text-yellow-500 animate-pulse" /> Evolution & Regional Forms</h4>
        <div className="flex flex-col lg:flex-row items-center justify-center gap-8 lg:gap-12 min-w-max">
          {evoChain.map((step, idx) => (
            <React.Fragment key={idx}>
              {idx !== 0 && <div className="flex flex-col items-center opacity-30"><ChevronRight className="rotate-90 lg:rotate-0 dark:text-white" size={24} /></div>}
              <div className="flex flex-wrap justify-center gap-4 p-5 bg-slate-50 dark:bg-slate-800/50 rounded-[2.5rem] border-2 border-dashed dark:border-slate-700/50">
                {step.varieties.map((v: any) => (
                  <div key={v.id} onClick={() => handleEvoClick(v.name)} className={`p-4 rounded-[2rem] border-2 transition-all cursor-pointer group hover:scale-105 ${v.name === pokemon.name ? 'border-blue-500 bg-white dark:bg-slate-800 shadow-2xl' : 'border-transparent bg-white/50 dark:bg-slate-900/50 shadow-sm'}`}>
                    <img src={v.sprite} className="w-20 h-20 object-contain drop-shadow-md" alt={v.name} />
                    <p className={`font-black uppercase text-[8px] mt-3 text-center tracking-tighter truncate w-20 px-1 ${v.name === pokemon.name ? 'text-blue-500' : 'dark:text-white'}`}>{v.name.includes('-') ? v.name.split('-').slice(1).join(' ') : 'Original'}</p>
                  </div>
                ))}
              </div>
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* SECTION 4: MOVES & WEAKNESSES */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        <div className="xl:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-8 p-10 bg-slate-50 dark:bg-slate-900/50 rounded-[3.5rem] border dark:border-slate-800 shadow-inner">
          <div>
            <h4 className="text-[10px] font-black uppercase text-red-500 mb-6 tracking-widest italic flex items-center gap-2"><ShieldAlert size={14}/> Weaknesses</h4>
            <div className="flex flex-wrap gap-4">
              {Object.entries(typeEffect).filter(([_, m]) => m > 1).map(([t, m]) => (
                <button key={t} onClick={() => onTypeClick?.(t)} className="flex items-center bg-white dark:bg-slate-900 rounded-2xl border dark:border-slate-800 shadow-sm pr-3 h-10 overflow-hidden hover:scale-105 transition-all">
                  <span className={`${TYPE_COLORS[t]} text-white text-[9px] font-black px-4 h-full flex items-center uppercase`}>{t}</span>
                  <span className={`ml-2 text-xs font-black ${m >= 4 ? 'text-red-600 animate-pulse' : 'text-red-500'}`}>x{m}</span>
                </button>
              ))}
            </div>
          </div>
          <div>
            <h4 className="text-[10px] font-black uppercase text-green-500 mb-6 tracking-widest italic flex items-center gap-2"><ShieldCheck size={14}/> Resistances</h4>
            <div className="flex flex-wrap gap-4">
              {Object.entries(typeEffect).filter(([_, m]) => m < 1).map(([t, m]) => (
                <button key={t} onClick={() => onTypeClick?.(t)} className="flex items-center bg-white dark:bg-slate-900 rounded-2xl border dark:border-slate-800 shadow-sm pr-3 h-10 overflow-hidden hover:scale-105 transition-all">
                  <span className={`${TYPE_COLORS[t]} text-white text-[9px] font-black px-4 h-full flex items-center uppercase`}>{t}</span>
                  <span className="ml-2 text-xs font-black text-green-500">{m === 0 ? '0' : m}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Moves Table */}
        <div className="p-8 bg-slate-900 text-white rounded-[3rem] shadow-2xl border-b-8 border-slate-800 flex flex-col h-[500px]">
          <h4 className="text-[10px] font-black uppercase text-red-500 mb-6 tracking-widest italic flex items-center gap-2"><Sword size={18} /> Move Training</h4>
          <div className="flex-1 space-y-3 overflow-y-auto pr-3 custom-scrollbar">
            {levelMoves.map((m, i) => (
              <div key={i} onClick={() => handleMoveClick(m.name)} className="flex justify-between items-center p-3.5 bg-white/5 rounded-2xl border border-white/10 hover:bg-white/10 transition-colors group cursor-pointer">
                <div className="flex items-center gap-3">
                  <Info size={12} className="opacity-0 group-hover:opacity-100 text-red-400 transition-opacity" />
                  <span className="text-[10px] font-black uppercase italic tracking-tighter group-hover:text-red-400">{m.name}</span>
                </div>
                <span className="text-[9px] font-black bg-red-500 px-3 py-1 rounded-lg shadow-lg">LV.{m.level}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* MOVE DETAIL MODAL */}
      {selectedMove && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in zoom-in duration-300">
          <div className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-[3rem] p-8 border dark:border-slate-800 relative shadow-2xl">
            <button onClick={() => setSelectedMove(null)} className="absolute top-6 right-6 p-2 bg-slate-100 dark:bg-slate-800 rounded-full hover:bg-red-500 hover:text-white transition-all"><X size={20} /></button>
            <div className="space-y-6">
              <div className="flex justify-between items-center border-b dark:border-slate-800 pb-4">
                <h3 className="text-2xl font-black uppercase italic tracking-tighter dark:text-white">{selectedMove.name.replace(/-/g, ' ')}</h3>
                <span className={`${TYPE_COLORS[selectedMove.type.name]} px-4 py-1.5 rounded-xl text-[10px] font-black uppercase text-white shadow-lg`}>{selectedMove.type.name}</span>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-2xl text-center border dark:border-slate-700">
                  <Sword size={16} className="mx-auto mb-1 text-red-500" />
                  <p className="text-[8px] font-black text-slate-400 uppercase">Power</p>
                  <p className="font-black text-lg dark:text-white">{selectedMove.power || '--'}</p>
                </div>
                <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-2xl text-center border dark:border-slate-700">
                  <ShieldAlert size={16} className="mx-auto mb-1 text-blue-500" />
                  <p className="text-[8px] font-black text-slate-400 uppercase">Acc.</p>
                  <p className="font-black text-lg dark:text-white">{selectedMove.accuracy || '--'}%</p>
                </div>
                <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-2xl text-center border dark:border-slate-700">
                  <Activity size={16} className="mx-auto mb-1 text-emerald-500" />
                  <p className="text-[8px] font-black text-slate-400 uppercase">PP</p>
                  <p className="font-black text-lg dark:text-white">{selectedMove.pp}</p>
                </div>
              </div>
              <div className="bg-slate-50 dark:bg-slate-800 p-5 rounded-[2rem] border dark:border-slate-700">
                <h4 className="text-[9px] font-black text-indigo-500 uppercase mb-2 tracking-widest italic flex items-center gap-2"><BookOpen size={12} /> Move Description</h4>
                <p className="text-[11px] font-bold text-slate-600 dark:text-slate-300 leading-relaxed italic">{selectedMove.effect_entries.find((e: any) => e.language.name === 'en')?.short_effect.replace('$effect_chance', selectedMove.effect_chance) || "No description available."}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {isMoveLoading && (
        <div className="fixed inset-0 z-[301] flex items-center justify-center bg-black/20 backdrop-blur-[2px]"><Loader2 className="animate-spin text-red-500" size={48} /></div>
      )}
    </div>
  );
}