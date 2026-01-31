import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Search, Home as HomeIcon, Folder,
  Filter, Star, ChevronDown, BookOpen, Hash
} from 'lucide-react';

// ... (Interfaces remain the same)
interface Manga {
  mal_id: number;
  title: string;
  score?: number;
  chapters?: number;
  type?: string;
  status?: string;
  images: {
    jpg: {
      image_url: string;
      large_image_url: string;
    };
  };
}

interface Genre {
  mal_id: number;
  name: string;
}

const Browse: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialQuery = searchParams.get('q') || '';

  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const observer = React.useRef<IntersectionObserver | null>(null);

  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [mangaList, setMangaList] = useState<Manga[]>([]);
  const [genres, setGenres] = useState<Genre[]>([]);
  const [loading, setLoading] = useState(false);
  
  const [showSearch, setShowSearch] = useState(false);
  const [searchMounted, setSearchMounted] = useState(false);
  const [searchResults, setSearchResults] = useState<Manga[]>([]);
  const [showFilters, setShowFilters] = useState(false); // This controls the panel
  const [isSortOpen, setIsSortOpen] = useState(false);

  const [selectedGenre, setSelectedGenre] = useState<number | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [selectedSort, setSelectedSort] = useState<string>('popularity');

  useEffect(() => {
    const id = 'vf-ui-animations';
    if (document.getElementById(id)) return;
    const s = document.createElement('style');
    s.id = id;
    s.innerHTML = `
      .animate-in { will-change: transform, opacity; animation: vf-fade-in .28s cubic-bezier(.2,.9,.3,1) both; }
      .animate-out { will-change: transform, opacity; animation: vf-fade-out .22s cubic-bezier(.4,.0,.2,1) both; }
      @keyframes vf-fade-in { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
      @keyframes vf-fade-out { from { opacity: 1; transform: translateY(0); } to { opacity: 0; transform: translateY(10px); } }
      .vf-ripple { position: absolute; width: 50px; height: 50px; border-radius: 50%; background: radial-gradient(circle, rgba(16, 185, 129, 0.4) 0%, rgba(255,255,255,0.1) 70%, transparent 100%); transform: translate(-50%,-50%) scale(0); pointer-events: none; animation: vf-ripple 450ms cubic-bezier(0.1, 0, 0.2, 1) forwards; }
      @keyframes vf-ripple { 0% { transform: translate(-50%,-50%) scale(0); opacity: 1; } 100% { transform: translate(-50%,-50%) scale(12); opacity: 0; } }
      button { position: relative; overflow: hidden; }
      .thin-scroll::-webkit-scrollbar { width: 4px; }
      .thin-scroll::-webkit-scrollbar-thumb { background: rgba(16, 185, 129, 0.2); border-radius: 10px; }
    `;
    document.head.appendChild(s);
  }, []);

  const createRipple = (e: React.MouseEvent<HTMLElement>) => {
    const button = e.currentTarget;
    const rect = button.getBoundingClientRect();
    const ripple = document.createElement('div');
    ripple.className = 'vf-ripple';
    ripple.style.left = `${e.clientX - rect.left}px`;
    ripple.style.top = `${e.clientY - rect.top}px`;
    button.appendChild(ripple);
    setTimeout(() => ripple.remove(), 600);
  };

  // --- API LOGIC ---
  useEffect(() => {
    fetch('https://api.jikan.moe/v4/genres/manga').then(res => res.json()).then(data => {
      if (data.data) setGenres(data.data.slice(0, 24));
    });
  }, []);

  const buildSearchQuery = useCallback(() => {
    let query = searchQuery;
    if (selectedGenre) {
      const genre = genres.find(g => g.mal_id === selectedGenre);
      if (genre) query = query ? `${query} ${genre.name}` : genre.name;
    }
    if (selectedStatus) query = query ? `${query} ${selectedStatus}` : selectedStatus;
    return query;
  }, [searchQuery, selectedGenre, selectedStatus, genres]);

  const performMainSearch = useCallback(async (query: string, pageNum: number = 1) => {
    if (pageNum === 1) setLoading(true);
    try {
      const params = new URLSearchParams();
      const searchTerm = query || buildSearchQuery();
      if (searchTerm) params.append('q', searchTerm);
      params.append('limit', '24');
      params.append('page', pageNum.toString());
      params.append('order_by', selectedSort);
      params.append('sort', 'desc');

      const res = await fetch(`https://api.jikan.moe/v4/manga?${params.toString()}`);
      const data = await res.json();
      if (data.data) {
        setMangaList(prev => pageNum === 1 ? data.data : [...prev, ...data.data]);
        setHasMore(data.pagination.has_next_page);
      }
    } catch (e) { console.error(e); } finally { setLoading(false); }
  }, [buildSearchQuery, selectedSort]);

  useEffect(() => {
    setPage(1);
    performMainSearch(buildSearchQuery(), 1);
  }, [searchQuery, selectedGenre, selectedStatus, selectedSort, performMainSearch, buildSearchQuery]);

  const lastElementRef = useCallback((node: HTMLDivElement) => {
    if (loading) return;
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        setPage(prev => {
          const nextPage = prev + 1;
          performMainSearch(buildSearchQuery(), nextPage);
          return nextPage;
        });
      }
    });
    if (node) observer.current.observe(node);
  }, [loading, hasMore, buildSearchQuery, performMainSearch]);

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans selection:bg-emerald-500/30">
      
      {/* HEADER */}
      <header className="sticky top-0 z-[100] w-full bg-[#050505]/80 backdrop-blur-xl border-b border-white/5 transition-all">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
               <div className="bg-emerald-600 p-1.5 rounded-lg">
                  <BookOpen size={20} className="text-white" />
               </div>
               <span className="text-xl font-black tracking-tighter uppercase hidden sm:block">MANGAVEL</span>
            </div>

            <nav className="hidden md:flex items-center gap-2">
              <button onClick={(e) => { createRipple(e); navigate('/'); }} className="flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium bg-white/5 hover:bg-white/10 transition-all">
                <HomeIcon size={18}/> Home
              </button>
              <button className="flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium bg-emerald-600 text-white shadow-lg shadow-emerald-500/25">
                <Folder size={18}/> Browse
              </button>
            </nav>
          </div>

          {/* SEARCH & FILTER BUTTONS */}
          <div className="flex items-center gap-3">
            <div className="relative group hidden sm:block">
              <div className="relative">
                <input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-black border border-white/10 rounded-full py-2 pl-10 pr-4 text-sm w-[180px] md:w-[260px] focus:w-[320px] focus:border-emerald-500/50 outline-none transition-all duration-300"
                  placeholder="Search manga..."
                />
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
              </div>
            </div>
            
            {/* THE MISSING FILTER BUTTON */}
            <button 
              onClick={(e) => { createRipple(e); setShowFilters(!showFilters); }}
              className={`p-2.5 rounded-xl border transition-all duration-300 ${
                showFilters 
                  ? 'bg-emerald-600 border-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.3)] text-white' 
                  : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10 hover:border-white/20'
              }`}
            >
              <Filter size={20} className={showFilters ? 'scale-110' : ''} />
            </button>
          </div>
        </div>
      </header>

      {/* FILTERS PANEL */}
      <div className={`overflow-hidden transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] border-b border-white/5 bg-[#0a0a0a] ${showFilters ? 'max-h-[600px] py-10 opacity-100' : 'max-h-0 opacity-0'}`}>
        <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-12">
          
          <div className="space-y-4">
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">Genres</h3>
            <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto thin-scroll pr-2">
              {genres.map(g => (
                <button 
                  key={g.mal_id} 
                  onClick={(e) => { createRipple(e); setSelectedGenre(selectedGenre === g.mal_id ? null : g.mal_id); }}
                  className={`text-left px-3 py-2 text-xs rounded-lg border transition-all ${selectedGenre === g.mal_id ? 'bg-emerald-600/20 border-emerald-500 text-emerald-300 font-bold' : 'bg-white/5 border-white/5 text-gray-400 hover:border-white/20'}`}
                >
                  {g.name}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">Status</h3>
            <div className="flex flex-col gap-2">
              {['publishing', 'complete', 'on_hiatus'].map(s => (
                <button 
                  key={s} 
                  onClick={(e) => { createRipple(e); setSelectedStatus(selectedStatus === s ? '' : s); }}
                  className={`flex items-center justify-between px-4 py-3 text-xs font-bold uppercase rounded-xl border transition-all ${selectedStatus === s ? 'bg-emerald-600 border-emerald-400 text-white' : 'bg-white/5 border-white/10 text-gray-400 hover:border-white/20'}`}
                >
                  {s.replace('_', ' ')} {selectedStatus === s && <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse shadow-[0_0_8px_white]"/>}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">Sort</h3>
            <div className="relative">
              <button
                onClick={(e) => { createRipple(e); setIsSortOpen(!isSortOpen); }}
                className={`w-full flex items-center justify-between px-4 py-3 text-xs font-bold uppercase rounded-xl border transition-all ${isSortOpen ? 'bg-emerald-600/20 border-emerald-500 text-emerald-300' : 'bg-white/5 border-white/10 text-gray-400'}`}
              >
                <span>{selectedSort === 'popularity' ? 'Popularity' : selectedSort === 'score' ? 'Rating' : 'Chapters'}</span>
                <ChevronDown size={16} className={`transition-transform duration-300 ${isSortOpen ? 'rotate-180 text-emerald-400' : ''}`} />
              </button>

              {isSortOpen && (
                <div className="absolute top-full left-0 w-full mt-2 bg-[#0f0f0f] border border-white/10 rounded-xl shadow-2xl z-[120] overflow-hidden animate-in">
                  {[{ id: 'popularity', label: 'Popularity' }, { id: 'score', label: 'Rating' }, { id: 'chapters', label: 'Chapters' }].map((o) => (
                    <div key={o.id} onClick={() => { setSelectedSort(o.id); setIsSortOpen(false); }} className={`px-4 py-3 text-xs font-bold uppercase cursor-pointer hover:bg-emerald-600/20 ${selectedSort === o.id ? 'text-emerald-400' : 'text-gray-500'}`}>{o.label}</div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* RESULTS GRID */}
      <main className="container mx-auto px-4 py-12 space-y-6">
        <h2 className="text-2xl font-bold tracking-tight">
          {buildSearchQuery() ? `Results for: ${buildSearchQuery()}` : 'Explore Manga'}
        </h2>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
          {mangaList.map((manga, idx) => (
            <div key={`${manga.mal_id}-${idx}`} onClick={() => navigate(`/read/${manga.mal_id}`)} className="group cursor-pointer hover:scale-105 transition-all duration-300">
              <div className="relative aspect-[2/3] rounded-2xl overflow-hidden bg-white/5 border border-white/10 group-hover:border-emerald-500/40 transition-all">
                <img src={manga.images.jpg.image_url} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt="" />
                <div className="absolute bottom-2 right-2 bg-black/70 backdrop-blur-md px-2 py-0.5 rounded text-[10px] font-black border border-white/10 flex items-center gap-1">
                   <Hash size={10}/> {manga.chapters || '?'}
                </div>
              </div>
              <h3 className="mt-3 text-sm font-bold truncate group-hover:text-emerald-400 transition-colors">{manga.title}</h3>
              <div className="flex items-center justify-between mt-1">
                <span className="text-[10px] text-gray-500 font-bold uppercase tracking-tighter">{manga.type}</span>
                <span className="text-[10px] text-emerald-500 font-black tracking-tighter">★ {manga.score || 'N/A'}</span>
              </div>
            </div>
          ))}
        </div>

        <div ref={lastElementRef} className="h-20 w-full flex items-center justify-center">
          {hasMore && <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />}
        </div>
      </main>
    </div>
  );
};

export default Browse;