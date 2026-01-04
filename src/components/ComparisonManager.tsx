"use client";
import React, { useState } from 'react';
import { Search, X } from "lucide-react";
import { ALL_POKEMON_NAMES } from '@/lib/pokemonNames';
import PokemonComparison from '@/components/PokemonComparison';

export default function ComparisonManager({ fetchPoke }: { fetchPoke: any }) {
  const [comparePoke1, setComparePoke1] = useState<any>(null);
  const [comparePoke2, setComparePoke2] = useState<any>(null);
  const [selectingSlot, setSelectingSlot] = useState<1 | 2>(1);
  const [suggestions, setSuggestions] = useState<string[]>([]);

  return (
    <div className="space-y-10">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-black uppercase italic tracking-tighter dark:text-white">Pokemon Comparison</h2>
        <p className="text-slate-400 text-xs font-bold uppercase tracking-widest italic">Phân tích và so sánh chỉ số cơ bản</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center bg-slate-50 dark:bg-slate-900/50 p-8 rounded-[3rem] border dark:border-slate-800 shadow-inner">
        <ComparisonSlot 
          active={selectingSlot === 1} 
          pokemon={comparePoke1} 
          onSelect={() => setSelectingSlot(1)} 
          onClear={() => setComparePoke1(null)} 
          label="Slot 1"
        />
        <ComparisonSlot 
          active={selectingSlot === 2} 
          pokemon={comparePoke2} 
          onSelect={() => setSelectingSlot(2)} 
          onClear={() => setComparePoke2(null)} 
          label="Slot 2"
        />
      </div>

      <div className="max-w-md mx-auto relative">
        <Search className="absolute left-4 top-3.5 text-slate-400" size={20} />
        <input 
          className="w-full bg-white dark:bg-slate-900 border-2 dark:border-slate-800 p-3.5 pl-12 rounded-2xl outline-none focus:border-red-500 transition-all font-medium dark:text-white"
          placeholder={`Chọn Pokemon cho ${selectingSlot === 1 ? 'Slot 1' : 'Slot 2'}...`}
          onChange={(e) => setSuggestions(ALL_POKEMON_NAMES.filter(n => n.includes(e.target.value.toLowerCase())).slice(0, 5))}
        />
        {suggestions.length > 0 && (
          <div className="absolute z-50 w-full bg-white dark:bg-slate-900 mt-2 rounded-2xl shadow-2xl border dark:border-slate-800 overflow-hidden">
            {suggestions.map(s => (
              <div key={s} onClick={async () => {
                const p = await fetchPoke(s);
                if (selectingSlot === 1) setComparePoke1(p); else setComparePoke2(p);
                setSuggestions([]);
                if (selectingSlot === 1 && !comparePoke2) setSelectingSlot(2);
              }} className="p-3.5 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer capitalize font-bold border-b dark:border-slate-800 last:border-0 dark:text-white">{s}</div>
            ))}
          </div>
        )}
      </div>

      {comparePoke1 && comparePoke2 && (
        <PokemonComparison poke1={comparePoke1} poke2={comparePoke2} onClose={() => {}} />
      )}
    </div>
  );
}

function ComparisonSlot({ active, pokemon, onSelect, onClear, label }: any) {
  return (
    <div 
      onClick={onSelect} 
      className={`relative cursor-pointer p-6 rounded-[2.5rem] border-4 transition-all h-48 flex flex-col items-center justify-center ${active ? "border-red-500 bg-white dark:bg-slate-900 shadow-xl scale-105" : "border-transparent bg-slate-100 dark:bg-slate-800/50 text-slate-400"}`}
    >
      {pokemon ? (
        <>
          <img src={pokemon.sprites.other['official-artwork'].front_default} className="w-24 h-24 drop-shadow-lg" alt={pokemon.name} />
          <p className="font-black uppercase italic mt-2 text-slate-900 dark:text-white">{pokemon.name}</p>
          <button onClick={(e) => { e.stopPropagation(); onClear(); }} className="absolute top-4 right-4 text-red-500"><X size={18} /></button>
        </>
      ) : (
        <div className="flex flex-col items-center opacity-20">
          <div className="w-12 h-12 border-4 border-dashed border-current rounded-full mb-2 flex items-center justify-center font-bold text-2xl">+</div>
          <span className="text-[10px] font-black uppercase italic">{label} Empty</span>
        </div>
      )}
    </div>
  );
}