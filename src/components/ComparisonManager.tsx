"use client";
import React, { useState } from 'react';
import { Search, X, Plus } from "lucide-react";
import { ALL_POKEMON_NAMES } from '@/lib/pokemonNames';
import PokemonComparison from '@/components/PokemonComparison';

export default function ComparisonManager({ fetchPoke }: { fetchPoke: any }) {
  const [comparePoke1, setComparePoke1] = useState<any>(null);
  const [comparePoke2, setComparePoke2] = useState<any>(null);
  const [selectingSlot, setSelectingSlot] = useState<1 | 2>(1);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [inputValue, setInputValue] = useState("");

  // Hàm xử lý đóng bảng so sánh (Fix lỗi Build)
  const handleClose = () => {
    setComparePoke1(null);
    setComparePoke2(null);
    setSelectingSlot(1);
    setInputValue("");
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      {/* Tiêu đề */}
      <div className="text-center space-y-2">
        <h2 className="text-4xl font-[1000] uppercase italic tracking-tighter dark:text-white">
          Pokemon <span className="text-red-600">Comparison</span>
        </h2>
        <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] italic">
          Phân tích và so sánh chỉ số cơ bản
        </p>
      </div>
      
      {/* Khu vực chọn Pokémon */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center bg-black/5 dark:bg-slate-900/50 p-8 rounded-[3rem] border dark:border-slate-800 shadow-inner">
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

      {/* Thanh tìm kiếm */}
      <div className="max-w-md mx-auto relative group">
        <Search className="absolute left-4 top-4 text-slate-400 group-focus-within:text-red-500 transition-colors" size={20} />
        <input 
          className="w-full bg-white dark:bg-slate-900 border-2 dark:border-slate-800 p-4 pl-12 rounded-2xl outline-none focus:border-red-500 transition-all font-bold dark:text-white shadow-lg"
          placeholder={`Chọn Pokemon cho ${selectingSlot === 1 ? 'Slot 1' : 'Slot 2'}...`}
          value={inputValue}
          onChange={(e) => {
            setInputValue(e.target.value);
            setSuggestions(ALL_POKEMON_NAMES.filter(n => n.includes(e.target.value.toLowerCase())).slice(0, 5));
          }}
        />
        
        {/* Gợi ý tìm kiếm */}
        {suggestions.length > 0 && (
          <div className="absolute z-50 w-full bg-white dark:bg-slate-900 mt-2 rounded-2xl shadow-2xl border dark:border-slate-800 overflow-hidden animate-in slide-in-from-top-2">
            {suggestions.map(s => (
              <div key={s} onClick={async () => {
                const p = await fetchPoke(s);
                if (selectingSlot === 1) setComparePoke1(p); else setComparePoke2(p);
                setSuggestions([]);
                setInputValue("");
                // Tự động chuyển sang slot tiếp theo nếu slot đó trống
                if (selectingSlot === 1 && !comparePoke2) setSelectingSlot(2);
                else if (selectingSlot === 2 && !comparePoke1) setSelectingSlot(1);
              }} className="p-4 hover:bg-red-500 hover:text-white cursor-pointer capitalize font-black border-b dark:border-slate-800 last:border-0 dark:text-white transition-colors">
                {s}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Bảng so sánh chi tiết */}
      {comparePoke1 && comparePoke2 && (
        <div className="animate-in zoom-in-95 duration-500">
          <PokemonComparison 
            poke1={comparePoke1} 
            poke2={comparePoke2} 
            onClose={handleClose} 
          />
        </div>
      )}
    </div>
  );
}

function ComparisonSlot({ active, pokemon, onSelect, onClear, label }: any) {
  return (
    <div 
      onClick={onSelect} 
      className={`relative cursor-pointer p-8 rounded-[3rem] border-4 transition-all h-56 flex flex-col items-center justify-center group
        ${active 
          ? "border-red-500 bg-white dark:bg-slate-900 shadow-2xl scale-105" 
          : "border-transparent bg-black/5 dark:bg-slate-800/30 text-slate-400 hover:bg-black/10 dark:hover:bg-slate-800/50"
        }`}
    >
      {pokemon ? (
        <>
          <img 
            src={pokemon.sprites.other['official-artwork'].front_default} 
            className="w-32 h-32 drop-shadow-2xl group-hover:scale-110 transition-transform" 
            alt={pokemon.name} 
          />
          <p className="font-black uppercase italic mt-4 text-slate-900 dark:text-white tracking-tighter">
            {pokemon.name}
          </p>
          <button 
            onClick={(e) => { e.stopPropagation(); onClear(); }} 
            className="absolute top-6 right-6 p-2 bg-red-500/10 text-red-500 rounded-full hover:bg-red-500 hover:text-white transition-all shadow-sm"
          >
            <X size={16} />
          </button>
        </>
      ) : (
        <div className="flex flex-col items-center opacity-30 group-hover:opacity-60 transition-opacity">
          <div className="w-16 h-16 border-4 border-dashed border-current rounded-[1.5rem] mb-4 flex items-center justify-center transition-transform group-hover:rotate-90">
            <Plus size={32} />
          </div>
          <span className="text-[10px] font-black uppercase italic tracking-widest">{label} Empty</span>
        </div>
      )}
      
      {/* Badge hiển thị trạng thái đang chọn */}
      {active && !pokemon && (
        <div className="absolute -bottom-3 bg-red-500 text-white text-[8px] font-black px-4 py-1 rounded-full uppercase tracking-tighter animate-bounce">
          Selecting...
        </div>
      )}
    </div>
  );
}