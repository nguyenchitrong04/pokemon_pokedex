"use client";
import React, { useState, useEffect } from 'react';
import { Loader2, Zap, Target, Shield, Info } from 'lucide-react';
import { TYPE_COLORS } from '@/lib/pokemonData';

export default function MoveStatsView({ moveName }: { moveName: string }) {
  const [moveData, setMoveData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMoveDetail = async () => {
      try {
        const res = await fetch(`https://pokeapi.co/api/v2/move/${moveName}`);
        const data = await res.json();
        setMoveData(data);
      } catch (error) {
        console.error("Lỗi tải chiêu thức:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchMoveDetail();
  }, [moveName]);

  if (loading) return <div className="flex justify-center p-4"><Loader2 className="animate-spin" /></div>;
  if (!moveData) return <p className="text-red-500">Không tìm thấy thông tin chiêu thức.</p>;

  return (
    <div className="space-y-4 animate-in fade-in zoom-in duration-300">
      <div className="flex justify-between items-center border-b border-white/10 pb-2">
        <h3 className="text-xl font-black uppercase italic italic dark:text-white tracking-tighter">
          {moveData.name.replace(/-/g, ' ')}
        </h3>
        <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase text-white ${TYPE_COLORS[moveData.type.name]}`}>
          {moveData.type.name}
        </span>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white/5 p-3 rounded-2xl text-center border border-white/5">
          <Zap size={16} className="mx-auto mb-1 text-yellow-400" />
          <p className="text-[8px] font-bold opacity-50 uppercase">Power</p>
          <p className="font-black text-lg dark:text-white">{moveData.power || '--'}</p>
        </div>
        <div className="bg-white/5 p-3 rounded-2xl text-center border border-white/5">
          <Target size={16} className="mx-auto mb-1 text-blue-400" />
          <p className="text-[8px] font-bold opacity-50 uppercase">Accuracy</p>
          <p className="font-black text-lg dark:text-white">{moveData.accuracy || '--'}%</p>
        </div>
        <div className="bg-white/5 p-3 rounded-2xl text-center border border-white/5">
          <Shield size={16} className="mx-auto mb-1 text-emerald-400" />
          <p className="text-[8px] font-bold opacity-50 uppercase">PP</p>
          <p className="font-black text-lg dark:text-white">{moveData.pp}</p>
        </div>
      </div>

      <div className="bg-black/20 p-4 rounded-2xl border border-white/5">
        <p className="text-xs leading-relaxed text-slate-300 italic">
          {moveData.effect_entries.find((e: any) => e.language.name === 'en')?.short_effect || "No description available."}
        </p>
      </div>
    </div>
  );
}