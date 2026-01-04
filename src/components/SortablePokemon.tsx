"use client";
import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

const TYPE_COLORS: Record<string, string> = {
  fire: 'border-red-500/50 bg-red-500/10',
  water: 'border-blue-500/50 bg-blue-500/10',
  grass: 'border-green-500/50 bg-green-500/10',
  electric: 'border-yellow-400/50 bg-yellow-400/10',
  psychic: 'border-pink-500/50 bg-pink-500/10',
  ice: 'border-cyan-300/50 bg-cyan-300/10',
  dragon: 'border-indigo-600/50 bg-indigo-600/10',
  dark: 'border-zinc-700/50 bg-zinc-700/10',
  fairy: 'border-pink-300/50 bg-pink-300/10',
  normal: 'border-zinc-400/50 bg-zinc-400/10',
  fighting: 'border-orange-700/50 bg-orange-700/10',
  flying: 'border-sky-400/50 bg-sky-400/10',
  poison: 'border-purple-500/50 bg-purple-500/10',
  ground: 'border-amber-600/50 bg-amber-600/10',
  rock: 'border-stone-500/50 bg-stone-500/10',
  bug: 'border-lime-500/50 bg-lime-500/10',
  ghost: 'border-violet-800/50 bg-violet-800/10',
  steel: 'border-slate-400/50 bg-slate-400/10',
};

export default function SortablePokemon({ p }: { p: any }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: p.id });
  const typeColor = p.types && p.types[0] ? TYPE_COLORS[p.types[0]] : 'border-white/10 bg-white/5';

  const style = { 
    transform: CSS.Translate.toString(transform), 
    transition, 
    opacity: isDragging ? 0.3 : 1,
    zIndex: isDragging ? 50 : 1
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}
      className={`group relative w-14 h-14 md:w-16 md:h-16 rounded-xl border flex items-center justify-center transition-all cursor-grab active:cursor-grabbing shadow-lg ${typeColor}`}>
      <img src={p.sprite} alt={p.name} loading="lazy" className="w-full h-full object-contain p-1 pointer-events-none" />
      <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 bg-black text-[7px] px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap text-white z-30 font-bold uppercase border border-white/10 pointer-events-none capitalize">
        {p.name.replace('-', ' ')}
      </div>
    </div>
  );
}