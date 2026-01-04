"use client";
import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { DndContext, PointerSensor, useSensor, useSensors, DragOverlay, UniqueIdentifier, DragOverEvent, DragEndEvent, useDroppable, pointerWithin } from '@dnd-kit/core';
import { arrayMove, SortableContext, rectSortingStrategy } from '@dnd-kit/sortable';
import { Loader2, Search, Download, RotateCcw, LayoutGrid } from 'lucide-react';
import { toPng } from 'html-to-image';
import SortablePokemon from '@/components/SortablePokemon';

const TIERS = [
  { id: 'S', label: 'OP', color: 'bg-red-500/80' },
  { id: 'A', label: 'Mạnh', color: 'bg-orange-500/80' },
  { id: 'B', label: 'Hữu dụng', color: 'bg-yellow-500/80' },
  { id: 'C', label: 'Ổn', color: 'bg-green-500/80' },
  { id: 'D', label: 'Phế', color: 'bg-blue-500/80' },
];

const GENS = [
  { label: 'Tất cả (1-9)', offset: 0, limit: 1025 },
  { label: 'Gen 1 (Kanto)', offset: 0, limit: 151 },
  { label: 'Gen 2 (Johto)', offset: 151, limit: 100 },
  { label: 'Gen 3 (Hoenn)', offset: 251, limit: 135 },
  { label: 'Gen 4 (Sinnoh)', offset: 386, limit: 107 },
  { label: 'Gen 5 (Unova)', offset: 493, limit: 156 },
  { label: 'Gen 6 (Kalos)', offset: 649, limit: 72 },
  { label: 'Gen 7 (Alola)', offset: 721, limit: 88 },
  { label: 'Gen 8 (Galar)', offset: 809, limit: 96 },
  { label: 'Gen 9 (Paldea)', offset: 905, limit: 120 },
];

const POKEMON_TYPES = ['Tất cả hệ', 'fire', 'water', 'grass', 'electric', 'psychic', 'ice', 'dragon', 'dark', 'fairy', 'normal', 'fighting', 'flying', 'poison', 'ground', 'rock', 'bug', 'ghost', 'steel'];

function DroppableZone({ id, items, children, className }: any) {
  const { setNodeRef } = useDroppable({ id });
  return (
    <div ref={setNodeRef} className={className}>
      <SortableContext id={id} items={items.map((i: any) => i.id)} strategy={rectSortingStrategy}>
        {children}
      </SortableContext>
    </div>
  );
}

export default function PokemonTierList() {
  const [allPokemon, setAllPokemon] = useState<any[]>([]);
  const [containers, setContainers] = useState<Record<string, any[]>>({ S: [], A: [], B: [], C: [], D: [] });
  const [loading, setLoading] = useState(false);
  const [activeId, setActiveId] = useState<UniqueIdentifier | null>(null);
  const [search, setSearch] = useState('');
  const [selectedGen, setSelectedGen] = useState(GENS[0]);
  const [selectedType, setSelectedType] = useState('Tất cả hệ');
  const [displayLimit, setDisplayLimit] = useState(60);
  
  const tierBoardRef = useRef<HTMLDivElement>(null);
  const observerTarget = useRef(null);
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 10 } }));

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await fetch(`https://pokeapi.co/api/v2/pokemon?offset=${selectedGen.offset}&limit=${selectedGen.limit}`);
      const data = await res.json();
      
      const detailedData = await Promise.all(
        data.results.map(async (p: any) => {
          const detailRes = await fetch(p.url);
          const detail = await detailRes.json();
          // Lọc bỏ các dạng Mega/Gmax để danh sách không quá loãng
          if (detail.name.includes('-mega') || detail.name.includes('-gmax') || detail.name.includes('-totem')) return null;

          return {
            id: `poke-${detail.id}`,
            name: detail.name,
            sprite: detail.sprites.front_default || `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${detail.id}.png`,
            types: detail.types.map((t: any) => t.type.name)
          };
        })
      );
      setAllPokemon(detailedData.filter(Boolean));
      setDisplayLimit(60);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { loadData(); }, [selectedGen]);

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && !loading) setDisplayLimit(prev => prev + 40);
    }, { threshold: 0.1 });
    if (observerTarget.current) observer.observe(observerTarget.current);
    return () => observer.disconnect();
  }, [loading]);

  const filteredBank = useMemo(() => {
    const assignedIds = new Set(Object.values(containers).flat().map(p => p.id));
    return allPokemon
      .filter(p => !assignedIds.has(p.id))
      .filter(p => p.name.toLowerCase().includes(search.toLowerCase()))
      .filter(p => selectedType === 'Tất cả hệ' || p.types.includes(selectedType))
      .slice(0, displayLimit);
  }, [allPokemon, containers, search, selectedType, displayLimit]);

  const handleReset = () => { if (confirm("Xóa toàn bộ bảng xếp hạng?")) setContainers({ S: [], A: [], B: [], C: [], D: [] }); };

  const handleExport = async () => {
    if (!tierBoardRef.current) return;
    const dataUrl = await toPng(tierBoardRef.current, { backgroundColor: '#09090b', quality: 1 });
    const link = document.createElement('a');
    link.download = `pkm-tier-9gen-${Date.now()}.png`; link.href = dataUrl; link.click();
  };

  const findContainer = (id: UniqueIdentifier) => {
    if (id in containers || id === 'bank') return id;
    return Object.keys(containers).find(key => containers[key].some(p => p.id === id)) || 'bank';
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;
    const activeContainer = findContainer(active.id);
    const overContainer = findContainer(over.id);
    if (activeContainer === overContainer) return;
    setContainers(prev => {
      const activeItems = activeContainer === 'bank' ? allPokemon : prev[activeContainer as string];
      const movedItem = activeItems.find(i => i.id === active.id);
      const newPrev = { ...prev };
      if (activeContainer !== 'bank') newPrev[activeContainer as string] = prev[activeContainer as string].filter(i => i.id !== active.id);
      if (overContainer !== 'bank') newPrev[overContainer as string] = [...(prev[overContainer as string] || []), movedItem];
      return newPrev;
    });
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    const activeContainer = findContainer(active.id);
    const overContainer = findContainer(over?.id || "");
    if (activeContainer !== 'bank' && activeContainer === overContainer) {
      const oldIdx = containers[activeContainer as string].findIndex(i => i.id === active.id);
      const newIdx = containers[activeContainer as string].findIndex(i => i.id === over?.id);
      setContainers(prev => ({ ...prev, [activeContainer as string]: arrayMove(prev[activeContainer as string], oldIdx, newIdx) }));
    }
    setActiveId(null);
  };

  return (
    <DndContext sensors={sensors} collisionDetection={pointerWithin} onDragStart={(e) => setActiveId(e.active.id)} onDragOver={handleDragOver} onDragEnd={handleDragEnd}>
      <div className="max-w-6xl mx-auto p-4 space-y-6 bg-zinc-950 min-h-screen text-white">
        
        {/* HEADER */}
        <div className="bg-zinc-900 border border-white/10 p-6 rounded-[2.5rem] shadow-2xl">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
            <h1 className="text-2xl font-black italic tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-yellow-500 to-green-500">POKEMON TIERLIST</h1>
            <div className="flex gap-2">
              <button onClick={handleExport} className="bg-white text-black text-[10px] font-black px-4 py-2 rounded-xl hover:bg-zinc-200 transition-all flex items-center gap-2"><Download size={14} /> LƯU ẢNH</button>
              <button onClick={handleReset} className="bg-zinc-800 text-red-500 text-[10px] font-black px-4 py-2 rounded-xl border border-red-500/20 hover:bg-red-500/10 transition-all flex items-center gap-2"><RotateCcw size={14} /> RESET</button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-4 border-t border-white/5">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20" size={14} />
              <input type="text" placeholder="Tìm tên..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full bg-black border border-white/10 rounded-xl py-2 pl-9 pr-4 text-xs outline-none focus:ring-1 ring-yellow-500" />
            </div>
            <select value={selectedGen.label} onChange={(e) => setSelectedGen(GENS.find(g => g.label === e.target.value)!)} className="bg-black border border-white/10 rounded-xl px-3 py-2 text-xs outline-none">
              {GENS.map(g => <option key={g.label} value={g.label}>{g.label}</option>)}
            </select>
            <select value={selectedType} onChange={(e) => setSelectedType(e.target.value)} className="bg-black border border-white/10 rounded-xl px-3 py-2 text-xs outline-none font-bold text-zinc-400">
              {POKEMON_TYPES.map(t => <option key={t} value={t}>{t.toUpperCase()}</option>)}
            </select>
          </div>
        </div>

        {/* TIER BOARD */}
        <div ref={tierBoardRef} className="rounded-[2.5rem] overflow-hidden border border-white/10 bg-zinc-950">
          {TIERS.map((tier) => (
            <div key={tier.id} className="flex border-b border-white/5 last:border-0 min-h-[120px]">
              <div className={`${tier.color} w-20 md:w-32 flex flex-col items-center justify-center shrink-0 border-r border-black/10`}>
                <span className="text-4xl font-black text-black/40">{tier.id}</span>
                <span className="text-[8px] font-black text-black/30 tracking-widest uppercase">{tier.label}</span>
              </div>
              <DroppableZone id={tier.id} items={containers[tier.id]} className="flex-1 p-4 flex flex-wrap gap-2 content-start bg-zinc-900/10">
                {containers[tier.id].map((p) => <SortablePokemon key={p.id} p={p} />)}
              </DroppableZone>
            </div>
          ))}
        </div>

        {/* STORAGE */}
        <div className="bg-zinc-900/40 rounded-[3rem] p-8 border border-white/5 shadow-inner">
          <div className="flex items-center gap-4 mb-8">
            <LayoutGrid size={16} className="text-yellow-500" />
            <h3 className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.5em]">Storage ({filteredBank.length})</h3>
            <div className="h-px flex-1 bg-white/5" />
          </div>
          
          <DroppableZone id="bank" items={filteredBank} className="flex flex-wrap gap-3 min-h-[250px] justify-center md:justify-start">
            {loading ? (
              <div className="w-full flex flex-col items-center py-20 gap-4">
                <Loader2 className="animate-spin text-yellow-500" size={32} />
                <p className="text-[10px] font-bold text-zinc-600 tracking-widest uppercase">Đang tải Pokémon...</p>
              </div>
            ) : (
              <>
                {filteredBank.map((p) => <SortablePokemon key={p.id} p={p} />)}
                <div ref={observerTarget} className="w-full h-10" />
              </>
            )}
          </DroppableZone>
        </div>
      </div>

      <DragOverlay>
        {activeId ? (
          <div className="w-16 h-16 bg-zinc-800 rounded-2xl shadow-2xl flex items-center justify-center border-2 border-yellow-500 scale-110 rotate-3">
            <img src={allPokemon.find(p => p.id === activeId)?.sprite} className="w-12 h-12 object-contain" alt="" />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}