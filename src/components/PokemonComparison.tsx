"use client";
import React from 'react';
import { TYPE_COLORS } from '@/lib/pokemonData';
import { Trophy, X } from 'lucide-react';

// ĐỊNH NGHĨA NÀY BẮT BUỘC PHẢI CÓ
interface PokemonComparisonProps {
  poke1: any;
  poke2: any;
  onClose: () => void;
}

export default function PokemonComparison({ poke1, poke2, onClose }: PokemonComparisonProps) {
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
    <div className="w-full bg-white dark:bg-slate-900 rounded-[3rem] p-6 md:p-10 border dark:border-slate-800 shadow-2xl relative animate-in zoom-in-95 duration-500">
      <button 
        onClick={onClose}
        className="absolute top-6 right-6 p-3 bg-slate-100 dark:bg-slate-800 rounded-full hover:bg-red-500 hover:text-white transition-all z-10"
      >
        <X size={20} />
      </button>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
        <div className="text-center space-y-4">
          <div className={`inline-block p-6 rounded-[2.5rem] bg-slate-50 dark:bg-slate-800/50 border-2 ${bst1 >= bst2 ? 'border-yellow-400' : 'border-transparent'}`}>
            <img src={poke1.sprites.other['official-artwork'].front_default} className="w-32 h-32 mx-auto" alt="" />
          </div>
          <h3 className="text-2xl font-black dark:text-white uppercase italic">{poke1.name}</h3>
          <p className="text-2xl font-black text-slate-300">BST: {bst1}</p>
        </div>

        <div className="space-y-6">
          {statsLabel.map((stat) => {
            const v1 = getStatValue(poke1, stat.id);
            const v2 = getStatValue(poke2, stat.id);
            const total = v1 + v2;
            return (
              <div key={stat.id}>
                <div className="flex justify-between text-[10px] font-black uppercase text-slate-400 italic mb-1">
                  <span>{v1}</span>
                  <span>{stat.label}</span>
                  <span>{v2}</span>
                </div>
                <div className="h-2 flex bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div className={`${TYPE_COLORS[poke1.types[0].type.name]} h-full`} style={{ width: `${(v1/total)*100}%` }} />
                  <div className={`${TYPE_COLORS[poke2.types[0].type.name]} h-full ml-auto`} style={{ width: `${(v2/total)*100}%` }} />
                </div>
              </div>
            );
          })}
        </div>

        <div className="text-center space-y-4">
          <div className={`inline-block p-6 rounded-[2.5rem] bg-slate-50 dark:bg-slate-800/50 border-2 ${bst2 >= bst1 ? 'border-yellow-400' : 'border-transparent'}`}>
            <img src={poke2.sprites.other['official-artwork'].front_default} className="w-32 h-32 mx-auto" alt="" />
          </div>
          <h3 className="text-2xl font-black dark:text-white uppercase italic">{poke2.name}</h3>
          <p className="text-2xl font-black text-slate-300">BST: {bst2}</p>
        </div>
      </div>
    </div>
  );
}