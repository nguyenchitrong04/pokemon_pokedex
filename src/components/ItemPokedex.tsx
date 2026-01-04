"use client";
import React, { useState, useEffect, useMemo } from 'react';
import { Search, X, Loader2, BookOpen, Users } from 'lucide-react';
import { STATIC_ITEMS, ITEM_CATEGORIES, getItemSprite } from '@/lib/itemData';
import { POKEMON_MACHINES_GEN9 } from '@/lib/machineData';
import { TYPE_COLORS } from '@/lib/pokemonData';

// --- FIX LỖI BUILD: Định nghĩa Interface rõ ràng ---
interface ItemBase {
  id: number | string;
  name: string;
  category: string;
  effect: string;
  isMachine?: boolean;
  type?: string;
  moveName?: string;
}

export default function ItemPokedex({ onSelectPokemon }: { onSelectPokemon: (p: any) => void }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [selectedItem, setSelectedItem] = useState<ItemBase | null>(null);
  const [compatiblePoke, setCompatiblePoke] = useState<any[]>([]);
  const [fetchingDetails, setFetchingDetails] = useState(false);

  // Gộp danh sách vật phẩm và TMs
  const allItems = useMemo(() => {
    const machines = POKEMON_MACHINES_GEN9.map(m => ({ 
      ...m, 
      category: 'machine', 
      isMachine: true 
    })) as ItemBase[];
    return [...(STATIC_ITEMS as ItemBase[]), ...machines];
  }, []);

  const filteredItems = allItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase().replace(/ /g, '-'));
    const matchesCategory = category === "all" || item.category === category;
    return matchesSearch && matchesCategory;
  });

  const getPokemonIdFromUrl = (url: string) => url.split('/').filter(Boolean).pop();

  // Tra cứu Đá tiến hóa
  const fetchCompatibleByItem = async (itemName: string) => {
    const manualMap: Record<string, string[]> = {
      "thunder-stone": ["pikachu", "raichu-alola", "eevee", "eelektrik", "magneton"],
      "fire-stone": ["vulpix", "growlithe", "eevee", "pansear", "capsakid"],
      "water-stone": ["poliwhirl", "shellder", "staryu", "eevee", "lombre", "panpour"],
      "leaf-stone": ["gloom", "weepinbell", "exeggcute", "eevee", "nuzleaf", "pansage"],
      "moon-stone": ["nidorina", "nidorino", "clefairy", "jigglypuff", "skitty", "munna"],
      "sun-stone": ["gloom", "sunkern", "cottonee", "petilil", "helioptile"],
      "shiny-stone": ["togetic", "roselia", "minccino", "floette"],
      "dusk-stone": ["murkrow", "misdreavus", "lampent", "doublade"],
      "dawn-stone": ["kirlia", "snorunt"],
      "ice-stone": ["sandshrew-alola", "vulpix-alola", "eevee", "crabrawler", "cetoddle"]
    };

    const names = manualMap[itemName] || [];
    return Promise.all(names.map(async (n) => {
      const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${n}`);
      return res.json();
    }));
  };

  const handleItemClick = async (item: ItemBase) => {
    setSelectedItem(item);
    setCompatiblePoke([]);
    setFetchingDetails(true);

    try {
      if (item.isMachine && item.moveName) {
        const res = await fetch(`https://pokeapi.co/api/v2/move/${item.moveName}`);
        const data = await res.json();
        
        const pokes = data.learned_by_pokemon.map((p: any) => {
          const id = getPokemonIdFromUrl(p.url);
          return {
            id: id,
            name: p.name,
            sprites: {
              front_default: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`
            }
          };
        });
        setCompatiblePoke(pokes);
      } else if (item.category === 'stone-evolution') {
        const pokes = await fetchCompatibleByItem(item.name);
        setCompatiblePoke(pokes);
      }
    } catch (e) { 
      console.error("Lỗi fetch dữ liệu:", e); 
    } finally {
      setFetchingDetails(false);
    }
  };

  const handleSelectPokemonWithFetch = async (p: any) => {
    try {
      const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${p.name}`);
      const fullData = await res.json();
      onSelectPokemon(fullData);
      setSelectedItem(null);
    } catch (e) { console.error(e); }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Search & Tabs */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-3.5 text-slate-400" size={20} />
          <input 
            className="w-full bg-white dark:bg-slate-900 border-2 dark:border-slate-800 p-3.5 pl-12 rounded-2xl outline-none focus:border-red-400 transition-all font-bold"
            placeholder="Tìm vật phẩm, TMs, quả mọng..." 
            value={searchQuery} 
            onChange={(e) => setSearchQuery(e.target.value)} 
          />
        </div>
        <select 
          className="bg-white dark:bg-slate-900 border-2 dark:border-slate-800 px-6 py-3 rounded-2xl font-black uppercase text-[10px] outline-none cursor-pointer tracking-widest"
          value={category} 
          onChange={(e) => setCategory(e.target.value)}
        >
          {ITEM_CATEGORIES.map(cat => <option key={cat.id} value={cat.id}>{cat.label}</option>)}
        </select>
      </div>

      {/* Grid Items */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
        {filteredItems.map((item) => (
          <div key={item.name} onClick={() => handleItemClick(item)} 
            className="bg-white dark:bg-slate-900 p-5 rounded-[2.5rem] border dark:border-slate-800 hover:shadow-2xl hover:scale-105 transition-all cursor-pointer group text-center">
            <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-3xl mb-3 group-hover:bg-white dark:group-hover:bg-slate-800">
              <img 
                // FIX LỖI DÒNG 132 TẠI ĐÂY: Sử dụng kiểm tra an toàn
                src={item.isMachine ? `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/tm-${item.type}.png` : getItemSprite(item.name)} 
                className="w-12 h-12 mx-auto object-contain drop-shadow-md" 
                alt={item.name} 
              />
            </div>
            <p className="font-black uppercase italic tracking-tighter text-[10px] truncate dark:text-white">{item.name.replace(/-/g, ' ')}</p>
          </div>
        ))}
      </div>

      {/* Modal Detail */}
      {selectedItem && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 w-full max-w-3xl rounded-[3rem] p-8 relative max-h-[85vh] flex flex-col border dark:border-slate-800 shadow-2xl">
            <button onClick={() => setSelectedItem(null)} className="absolute top-8 right-8 p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors z-10 dark:text-white"><X size={24}/></button>
            
            <div className="flex items-center gap-6 mb-6 border-b dark:border-slate-800 pb-6 shrink-0">
              <div className="p-6 bg-slate-50 dark:bg-slate-800 rounded-[2.5rem] shadow-inner">
                <img src={selectedItem.isMachine ? `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/tm-${selectedItem.type}.png` : getItemSprite(selectedItem.name)} className="w-20 h-20 object-contain drop-shadow-lg" alt={selectedItem.name} />
              </div>
              <div className="space-y-1">
                <h3 className="text-3xl font-black uppercase italic tracking-tighter dark:text-white">{selectedItem.name.replace(/-/g, ' ')}</h3>
                <div className="flex gap-2">
                   <span className="bg-red-500 text-white text-[8px] font-black px-3 py-1 rounded-full uppercase italic shadow-sm">{selectedItem.category}</span>
                   {selectedItem.isMachine && selectedItem.type && (
                     <span className={`${TYPE_COLORS[selectedItem.type as keyof typeof TYPE_COLORS]} text-white text-[8px] font-black px-3 py-1 rounded-full uppercase italic shadow-sm`}>Hệ: {selectedItem.type}</span>
                   )}
                </div>
              </div>
            </div>

            <div className="overflow-y-auto pr-4 space-y-8 custom-scrollbar">
              <div className="bg-slate-50 dark:bg-slate-800/30 p-6 rounded-[2rem] border dark:border-slate-800/50">
                <h4 className="text-[10px] font-black uppercase text-red-500 mb-3 italic flex items-center gap-2"><BookOpen size={14}/> Hiệu ứng / Tác dụng</h4>
                <p className="text-sm text-slate-600 dark:text-slate-300 font-bold italic leading-relaxed">{selectedItem.effect}</p>
              </div>

              <div>
                <h4 className="text-[10px] font-black uppercase text-blue-500 mb-4 italic flex items-center gap-2">
                  <Users size={14}/> Pokémon tương thích ({compatiblePoke.length})
                </h4>
                
                {fetchingDetails ? (
                  <div className="flex flex-col items-center justify-center py-20 gap-3">
                    <Loader2 className="animate-spin text-blue-500" size={32} />
                    <p className="text-[8px] font-black uppercase text-slate-400 tracking-widest">Đang quét dữ liệu toàn hệ thống...</p>
                  </div>
                ) : compatiblePoke.length > 0 ? (
                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3 pb-4">
                    {compatiblePoke.map(p => (
                      <div key={p.id} onClick={() => handleSelectPokemonWithFetch(p)} 
                        className="bg-white dark:bg-slate-800/50 p-3 rounded-3xl text-center border-2 border-transparent hover:border-blue-400 cursor-pointer transition-all shadow-sm group">
                        <img 
                          src={p.sprites.front_default} 
                          className="w-12 h-12 mx-auto group-hover:scale-110 transition-transform" 
                          alt={p.name}
                          onError={(e) => { (e.target as any).src = 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/poke-ball.png' }}
                        />
                        <p className="text-[7px] font-black uppercase mt-1 truncate tracking-tighter dark:text-white">{p.name.replace(/-/g, ' ')}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 border-2 border-dashed rounded-[2rem] dark:border-slate-800 opacity-30">
                    <p className="text-[10px] font-black uppercase italic dark:text-white">Vật phẩm này không dành cho Pokémon cụ thể</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}