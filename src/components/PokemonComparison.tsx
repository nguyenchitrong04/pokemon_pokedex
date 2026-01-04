"use client";
import React from 'react';
import { TYPE_COLORS } from '@/lib/pokemonData';
import { Trophy } from 'lucide-react';

export default function PokemonComparison({ poke1, poke2 }: { poke1: any; poke2: any }) {
  const statsLabel = [
    { id: 'hp', label: 'HP' },
    { id: 'attack', label: 'Attack' },
    { id: 'defense', label: 'Defense' },
    { id: 'special-attack', label: 'Sp. Atk' },
    { id: 'special-defense', label: 'Sp. Def' },
    { id: 'speed', label: 'Speed' }
  ];

  const getStatValue = (pokemon: any, id: string) => 
    pokemon.stats.find((s: any) => s.stat.name === id)?.base_stat || 0;

  const bst1 = poke1.stats.reduce((a: number, b: any) => a + b.base_stat, 0);
  const bst2 = poke2.stats.reduce((a: number, b: any) => a + b.base_stat, 0);

  return (
    <div className="w-full bg-white dark:bg-slate-900 rounded-[3rem] p-6 md:p-10 border dark:border-slate-800 shadow-2xl animate-in zoom-in-95 duration-500">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
        
        {/* Pokémon Left */}
        <div className="text-center space-y-4">
          <div className={`inline-block p-6 rounded-[2.5rem] bg-slate-50 dark:bg-slate-800/50 border-2 ${bst1 >= bst2 ? 'border-yellow-400 shadow-lg' : 'border-transparent'}`}>
            <img src={poke1.sprites.other['official-artwork'].front_default} className="w-32 h-32 md:w-44 md:h-44 mx-auto drop-shadow-2xl" alt="" />
          </div>
          <h3 className="text-2xl font-black uppercase italic tracking-tighter">{poke1.name}</h3>
          <div className="flex justify-center gap-2">
            {poke1.types.map((t: any) => (
              <span key={t.type.name} className={`${TYPE_COLORS[t.type.name]} text-white text-[9px] px-3 py-1 rounded-lg font-black uppercase`}>
                {t.type.name}
              </span>
            ))}
          </div>
          <p className="text-2xl font-black text-slate-300">BST: {bst1}</p>
        </div>

        {/* Stats Middle */}
        <div className="space-y-6">
          {statsLabel.map((stat) => {
            const v1 = getStatValue(poke1, stat.id);
            const v2 = getStatValue(poke2, stat.id);
            const total = v1 + v2;
            return (
              <div key={stat.id} className="group">
                <div className="flex justify-between items-end mb-2 px-1">
                  <span className={`text-sm font-black ${v1 > v2 ? 'text-green-500 scale-110' : 'text-slate-400'} transition-all`}>{v1}</span>
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 italic">{stat.label}</span>
                  <span className={`text-sm font-black ${v2 > v1 ? 'text-green-500 scale-110' : 'text-slate-400'} transition-all`}>{v2}</span>
                </div>
                <div className="h-3 flex bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden border dark:border-slate-700 p-0.5">
                  <div 
                    className={`${TYPE_COLORS[poke1.types[0].type.name]} h-full rounded-full transition-all duration-1000 ease-out`} 
                    style={{ width: `${(v1 / total) * 100}%` }}
                  ></div>
                  <div 
                    className={`${TYPE_COLORS[poke2.types[0].type.name]} h-full rounded-full transition-all duration-1000 ease-out ml-auto`} 
                    style={{ width: `${(v2 / total) * 100}%` }}
                  ></div>
                </div>
              </div>
            );
          })}
          
          <div className="pt-6 flex justify-center italic">
            {bst1 !== bst2 && (
              <div className="flex items-center gap-2 bg-yellow-400/10 text-yellow-600 dark:text-yellow-400 px-4 py-2 rounded-2xl text-[10px] font-black uppercase">
                <Trophy size={14} /> {bst1 > bst2 ? poke1.name : poke2.name} is Stronger
              </div>
            )}
          </div>
        </div>

        {/* Pokémon Right */}
        <div className="text-center space-y-4">
          <div className={`inline-block p-6 rounded-[2.5rem] bg-slate-50 dark:bg-slate-800/50 border-2 ${bst2 >= bst1 ? 'border-yellow-400 shadow-lg' : 'border-transparent'}`}>
            <img src={poke2.sprites.other['official-artwork'].front_default} className="w-32 h-32 md:w-44 md:h-44 mx-auto drop-shadow-2xl" alt="" />
          </div>
          <h3 className="text-2xl font-black uppercase italic tracking-tighter">{poke2.name}</h3>
          <div className="flex justify-center gap-2">
            {poke2.types.map((t: any) => (
              <span key={t.type.name} className={`${TYPE_COLORS[t.type.name]} text-white text-[9px] px-3 py-1 rounded-lg font-black uppercase`}>
                {t.type.name}
              </span>
            ))}
          </div>
          <p className="text-2xl font-black text-slate-300">BST: {bst2}</p>
        </div>
      </div>
    </div>
  );
}