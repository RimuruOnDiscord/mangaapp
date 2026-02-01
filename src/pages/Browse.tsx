import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useSearchParams, NavLink } from 'react-router-dom';
import {
  Search, Home as HomeIcon, Folder,
  Star, ChevronDown, BookOpen, Hash, Play, RotateCcw, 
  Layers, Grid2X2, Zap, Clock, Plus, Dices, LucideIcon, 
  FilterX, Settings, X, Eye, Globe, ShieldCheck, ChevronRight
} from 'lucide-react';

// --- Interfaces ---
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

// Add this interface to handle the props from App.tsx
interface BrowseProps {
  initialSort?: string;
  title?: string;
}

interface CustomNavLinkProps {
  icon: LucideIcon;
  label: string;
  to: string;
}

const Logo: React.FC<{ className?: string }> = ({ className = "w-10 h-10" }) => (
  <div className={`relative ${className} group flex items-center justify-center`}>
    <svg viewBox="0 0 1406.2 1406.2" xmlns="http://www.w3.org/2000/svg" className="w-full h-full drop-shadow-[0_0_12px_rgba(16,185,129,0.4)] transition-all duration-500 group-hover:scale-110">
      <defs>
        <linearGradient id="mangaVelGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#34D399" />
          <stop offset="100%" stopColor="#059669" />
        </linearGradient>
      </defs>
      <path fill="url(#mangaVelGradient)" d="M391.7,270.7c-51.6,18.6-96.2,88.4-117.9,183.6c-7.8,34.8-15.1,93.5-15.1,121.7v19.7l-23.3,36.6 c-65,101.3-124.6,206.8-180.5,319.2C5.1,1051,0,1063.2,0,1080.9c0,7.8,2,18,4,22.2c6.6,12,22.2,24.4,39.7,31l16,6.2l651.1-0.2 c633.1,0,651.1-0.4,661.2-5.3c32.6-16.9,43-51.7,26.2-88c-63.8-139-150.5-296.8-229.6-418.5l-19.1-29.5l-2.2-33.7 c-8.7-129.4-36.1-208.6-92-266.5c-24.2-24.8-33.5-30.4-50.6-30.6c-23.9,0-39.9,10.9-75.6,52.1c-35.2,40.4-42.4,50.1-66.9,86.4 c-12,17.7-27,38.3-33.2,45.5l-11.3,13.5h-117l-117-0.2L560.2,429C515,359.2,440.7,274.5,419.6,268.7 C406.8,264.9,409,264.5,391.7,270.7z M466.2,666.4c8.9,6.2,11.3,11.8,14.4,37.7c4,30.6,7.7,34.8,27.5,32.4 c18-2.2,32.6,3.6,40.8,16.6c16,25.9-11.5,80.2-50.6,99.3c-14,7.1-19.1,7.8-42.8,7.8c-22.8,0-28.8-1.1-39.4-6.7 c-31.2-16.4-50.3-40.3-58.3-71.8c-4-16.6-4.2-21.7-1.1-36.3c4.2-21.1,11.5-35.2,24.8-50.1C404.8,669.5,449.1,654.4,466.2,666.4z M964,669c8.7,7.3,9.3,9.7,13.5,43.4c2.6,20.6,8.7,26.8,25.3,24.2c16-2.2,29.9,2.2,39.2,12.9c15.1,18.2,6.2,53.4-20.8,82.2 c-21.7,23.1-35.2,28.4-69.2,28.8c-25.9,0-29.1-0.5-42.8-8.2c-20.2-11.3-38.4-29.9-47.7-49c-6.2-12.8-8.2-20.8-8.9-39.2 c-0.9-21.1,0-25,7.7-41c14-30.4,35.5-49.2,65-57C945.2,660.2,954.7,661.1,964,669z" />
    </svg>
    <div className="absolute inset-0 bg-emerald-500/10 blur-2xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
  </div>
);

const CustomCursor = () => {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isPointer, setIsPointer] = useState(false);
  const [isClicking, setIsClicking] = useState(false);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setPosition({ x: e.clientX, y: e.clientY });
      const target = e.target as HTMLElement;
      const clickable = target.tagName === 'BUTTON' || target.tagName === 'A' || 
                        target.closest('button') || target.closest('a') ||
                        window.getComputedStyle(target).cursor === 'pointer';
      setIsPointer(!!clickable);
    };
    const handleMouseDown = () => setIsClicking(true);
    const handleMouseUp = () => setIsClicking(false);

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  return (
    <div 
      className="fixed top-0 left-0 pointer-events-none z-[9999] will-change-transform"
      style={{ 
        transform: `translate3d(${position.x}px, ${position.y}px, 0) translate(-50%, -50%)`,
        transition: 'transform 0.05s ease-out',
      }}
    >
      <div className={`
        rounded-full border border-white/40 backdrop-blur-[3px] transition-all duration-300
        shadow-[0_0_20px_rgba(255,255,255,0.2)]
        ${isPointer ? 'w-14 h-14 bg-white/10' : 'w-6 h-6 bg-white/5'}
        ${isClicking ? 'scale-75 opacity-50' : 'scale-100 opacity-100'}
      `} />
    </div>
  );
};

const CustomNavLink: React.FC<CustomNavLinkProps> = ({ icon: Icon, label, to }) => (
  <NavLink
    to={to}
    className={({ isActive }) =>
      `flex items-center gap-2 px-3 py-2 rounded-lg font-bold text-sm transition-colors ${
        isActive ? 'bg-emerald-600 text-black' : 'text-gray-300 hover:bg-white/10'
      }`
    }
  >
    <Icon className="w-4 h-4" />
    {label}
  </NavLink>
);

const Browse: React.FC<BrowseProps> = ({ initialSort = 'popularity', title = "Explore Manga" }) => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialQuery = searchParams.get('q') || '';

  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const observer = useRef<IntersectionObserver | null>(null);

  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [mangaList, setMangaList] = useState<Manga[]>([]);
  const [genres, setGenres] = useState<Genre[]>([]);
  const [loading, setLoading] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedGenre, setSelectedGenre] = useState<number | null>(null);
  const [selectedSort, setSelectedSort] = useState<string>(initialSort);

  // Added for search HUD
  const [showSearch, setShowSearch] = useState(false);
  const [searchMounted, setSearchMounted] = useState(false);
  const [searchResults, setSearchResults] = useState<Manga[]>([]);

    // New States
  const [isSortOpen, setIsSortOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Example Settings State
  const [safeSearch, setSafeSearch] = useState(true);
  const [hdImages, setHdImages] = useState(true);

    useEffect(() => {
      const id = 'vf-ui-animations';
      if (document.getElementById(id)) return;
      const s = document.createElement('style');
      s.id = id;
      s.innerHTML = `
        .animate-in { will-change: transform, opacity; }
        .animate-out { will-change: transform, opacity; }
        .fade-in { animation: vf-fade-in .28s cubic-bezier(.2,.9,.3,1) both; }
        .zoom-in { animation: vf-zoom-in .32s cubic-bezier(.2,.9,.3,1) both; }
        .zoom-out { animation: vf-zoom-out .22s cubic-bezier(.4,.0,.2,1) both; }
  
        @keyframes vf-fade-in { from { opacity: 0; } to { opacity: 1; } }
        @keyframes vf-zoom-in { from { opacity: 0; transform: translateY(8px) scale(.985); } to { opacity: 1; transform: translateY(0) scale(1); } }
        @keyframes vf-zoom-out { from { opacity: 1; transform: translateY(0) scale(1); } to { opacity: 0; transform: translateY(8px) scale(.985); } }
        
        .vf-ripple { 
          position: absolute; 
          width: 50px; height: 50px; 
          border-radius: 50%; 
          background: radial-gradient(circle, rgba(16, 185, 129, 0.4) 0%, rgba(255,255,255,0.1) 70%, transparent 100%); 
          transform: translate(-50%,-50%) scale(0); 
          pointer-events: none; 
          animation: vf-ripple 380ms cubic-bezier(0.4, 0, 0.2, 1) forwards; 
        }
        @keyframes vf-ripple {
          0% { transform: translate(-50%,-50%) scale(0); opacity: 0.9; }
          100% { transform: translate(-50%,-50%) scale(7); opacity: 0; }
        }
        button { position: relative; overflow: hidden; }
      `;
      document.head.appendChild(s);
      return () => { s.remove(); };
    }, []);

  // CRITICAL FIX: Sync internal state when navigating between different browse modes
  useEffect(() => {
    setSelectedSort(initialSort);
    setMangaList([]); // Clear list to show loading state for new filter
    setPage(1);
  }, [initialSort]);

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
    return query;
  }, [searchQuery, selectedGenre, genres]);

  const performMainSearch = useCallback(async (pageNum: number = 1) => {
    if (pageNum === 1) setLoading(true);
    setIsSearching(true);
    try {
      const params = new URLSearchParams();
      const searchTerm = buildSearchQuery();
      if (searchTerm) params.append('q', searchTerm);
      params.append('limit', '24');
      params.append('page', pageNum.toString());
      params.append('order_by', selectedSort); // Uses the passed initialSort logic
      params.append('sort', 'desc');

      const res = await fetch(`https://api.jikan.moe/v4/manga?${params.toString()}`);
      const data = await res.json();
      if (data.data) {
        setMangaList(prev => pageNum === 1 ? data.data : [...prev, ...data.data]);
        setHasMore(data.pagination.has_next_page);
      }
    } catch (e) { console.error(e); } finally { setLoading(false); setIsSearching(false); }
  }, [buildSearchQuery, selectedSort]);

  useEffect(() => {
    setPage(1);
    performMainSearch(1);
  }, [searchQuery, selectedGenre, selectedSort, performMainSearch]);

  const lastElementRef = useCallback((node: HTMLDivElement) => {
    if (loading) return;
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        setPage(prev => {
          const nextPage = prev + 1;
          performMainSearch(nextPage);
          return nextPage;
        });
      }
    });
    if (node) observer.current.observe(node);
  }, [loading, hasMore, performMainSearch]);

  // Optionally, fetch search results for the HUD (simple local filter for demo)
  useEffect(() => {
    if (showSearch && searchQuery) {
      setSearchMounted(true);
      // Simulate search results by filtering mangaList
      const filtered = mangaList.filter(m =>
        m.title.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setSearchResults(filtered);
    } else {
      setSearchMounted(false);
      setSearchResults([]);
    }
  }, [showSearch, searchQuery, mangaList]);

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans selection:bg-emerald-500/30">
      
<CustomCursor />

      {/* HEADER */}
      <header className="sticky top-0 z-[100] w-full bg-[#050505]/90 backdrop-blur-xl border-b border-white/5">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <div onClick={() => navigate('/')} className="flex items-center gap-3 cursor-pointer">
              <div 
  onClick={() => navigate('/')}
  className="flex items-center gap-3 group transition-transform active:scale-95 cursor-none"
>
          {/* The Icon */}
          <Logo className="w-10 h-10" /> 
          
          <div className="flex flex-col leading-none">
            <div className="flex items-center gap-1.5">
                <span className="text-xl font-[900] tracking-tighter text-white">MANGA</span><span className="text-xl font-[900] tracking-tighter text-emerald-500">VEL</span>
                
                {/* The v2 Badge */}
                <span className="bg-emerald-500 text-[9px] font-black px-1.5 py-0.5 rounded-sm italic text-black -translate-y-1">
                  v2
                </span>
            </div>
            {/* Optional tagline that looks clean */}
            <span className="text-[10px] font-bold text-gray-500 tracking-[0.2em] uppercase opacity-60">
              FAST • FREE • ONLINE
            </span>
          </div>
        </div>
            </div>
            {/* Nav Links */}
            <nav className="hidden lg:flex items-center gap-1">
                <CustomNavLink icon={Folder} label="Browse" to="/browse" />
                <CustomNavLink icon={Zap} label="Newest" to="/newest" />
                <CustomNavLink icon={Clock} label="Updated" to="/updated" />
                <CustomNavLink icon={Layers} label="Added" to="/added" />
                <CustomNavLink icon={Dices} label="Random" to="/random" />
            </nav>
          </div>

          <div className="flex items-center gap-3">
<div className="relative group hidden sm:block">
  {/* Outer Glow Effect on Focus */}
  <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500/20 to-transparent blur-lg opacity-0 group-focus-within:opacity-100 transition-opacity duration-500" />
  
  <div className="relative flex items-center">
    <div className="relative flex items-center">
      <input
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        onFocus={() => {
          if (searchQuery) setShowSearch(true);
        }}
        onBlur={() => setTimeout(() => setShowSearch(false), 200)}
        className="bg-[#080809] border border-white/10 rounded-xl py-2.5 pl-11 pr-12 text-[11px] font-bold tracking-wide w-[240px] md:w-[280px] focus:w-[360px] focus:border-emerald-500/50 focus:ring-4 focus:ring-emerald-500/5 outline-none transition-all duration-500 text-gray-200 placeholder:text-gray-600 uppercase"
        placeholder="Search..."
      />
      
      {/* Icon with focus glow */}
      <Search 
        className={`absolute left-4 transition-all duration-500 ${
          searchQuery ? 'text-emerald-500 drop-shadow-[0_0_8px_rgba(16,185,129,0.6)]' : 'text-gray-600'
        }`} 
        size={14} 
      />

      {/* Trailing Status Component */}
      <div className="absolute right-4 flex items-center gap-2">
        {isSearching ? (
          <div className="flex gap-0.5">
            <div className="w-1 h-3 bg-emerald-500 animate-[bounce_1s_infinite_0ms]" />
            <div className="w-1 h-3 bg-emerald-500 animate-[bounce_1s_infinite_200ms]" />
            <div className="w-1 h-3 bg-emerald-500 animate-[bounce_1s_infinite_400ms]" />
          </div>
        ) : searchQuery && (
          <button onClick={() => setSearchQuery('')} className="hover:rotate-90 transition-transform duration-300">
            <X size={14} className="text-gray-500 hover:text-emerald-500" />
          </button>
        )}
      </div>
    </div>
  </div>

  {/* --- HIGH-END RESULTS HUD --- */}
  {showSearch && (
    <div className={`absolute top-full right-0 mt-4 w-[420px] bg-[#050505]/95 backdrop-blur-2xl border border-white/10 rounded-[2rem] shadow-[0_40px_80px_rgba(0,0,0,0.9)] z-[110] overflow-hidden animate-in zoom-in slide-in-from-top-4 duration-300`}>
      {/* HUD Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-white/5 bg-white/[0.02]">
        <div className="flex items-center gap-2">
          <span className="text-[9px] font-black text-gray-500 uppercase tracking-[0.2em]">Database Matches</span>
        </div>
        <span className="text-[8px] font-bold text-emerald-500/40 uppercase">Index: {searchResults.length}</span>
      </div>

      <div className="p-3 space-y-1">
        {searchResults.length > 0 ? (
          searchResults.map((manga) => (
            <div
              key={manga.mal_id}
              onClick={() => navigate(`/read/${manga.mal_id}`)}
              className="group relative flex gap-4 p-3 hover:bg-white/[0.03] rounded-2xl cursor-pointer transition-all duration-300 border border-transparent hover:border-white/5"
            >
              <div className="relative w-12 h-16 flex-shrink-0">
                <img src={manga.images.jpg.image_url} className="w-full h-full object-cover rounded-lg shadow-2xl group-hover:scale-105 transition-transform" alt="" />
                <div className="absolute inset-0 rounded-lg ring-1 ring-inset ring-white/10 group-hover:ring-emerald-500/30 transition-all" />
              </div>

              <div className="flex flex-col justify-center min-w-0 flex-1">
                <h4 className="text-[11px] font-black uppercase tracking-tight text-gray-200 group-hover:text-emerald-400 transition-colors truncate">
                  {manga.title}
                </h4>
                <div className="flex items-center gap-3 mt-1.5">
                    <div className="flex items-center gap-1">
                      <Star size={10} className="text-emerald-500 fill-emerald-500" />
                      <span className="text-[10px] font-black text-white">{manga.score || '0.0'}</span>
                    </div>
                    <span className="text-[8px] font-black text-gray-600 uppercase tracking-widest">{manga.type} • {manga.status}</span>
                </div>
              </div>
              
              <ChevronRight size={14} className="self-center text-gray-800 group-hover:text-emerald-500 group-hover:translate-x-1 transition-all" />
            </div>
          ))
        ) : !isSearching && (
          <div className="py-12 flex flex-col items-center opacity-20">
             <FilterX size={32} className="mb-2" />
             <span className="text-[9px] font-black uppercase tracking-[0.3em]">No Data Found</span>
          </div>
        )}
      </div>

      {/* HUD Footer */}
      <button className="w-full py-4 bg-emerald-500/5 hover:bg-emerald-500/10 border-t border-white/5 transition-colors group">
        <span className="text-[9px] font-black text-emerald-500 uppercase tracking-[0.4em] group-hover:tracking-[0.5em] transition-all">
          Execute Global Search
        </span>
      </button>
    </div>
  )}
</div>

      <button 
                onClick={() => setIsSettingsOpen(true)}
                className="p-2.5 rounded-full bg-opacity-0 opacity-50 hover:opacity-100 bg-white text-gray-400 hover:bg-opacity-10 hover:border-emerald-500/30 transition-all active:scale-90"
            >
                <Settings size={20} />
            </button>
          </div>
        </div>
      </header>

      {/* --- SETTINGS MODAL FRAME --- */}
      {isSettingsOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div 
                className="absolute inset-0 bg-black/60 backdrop-blur-md animate-in fade-in duration-300" 
                onClick={() => setIsSettingsOpen(false)}
            />
            
            {/* Frame */}
<div className="relative w-full max-w-lg bg-[#050505] border border-white/10 rounded-[2.5rem] shadow-[0_0_80px_rgba(0,0,0,0.9)] overflow-hidden animate-in zoom-in duration-500">
  {/* Premium Background Accents */}
  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-1 bg-gradient-to-r from-transparent via-emerald-500 to-transparent opacity-50" />
  <div className="absolute -top-24 -right-24 w-48 h-48 bg-emerald-600/10 blur-[80px] rounded-full" />
  <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-emerald-600/5 blur-[80px] rounded-full" />

  <div className="p-10 relative z-10">
    {/* Header */}
    <div className="flex items-center justify-between mb-10">
      <div className="flex flex-col">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-500/60">Site Settings</span>
        </div>
        <h2 className="text-3xl font-[900] tracking-tighter uppercase italic leading-none text-white">
          Control PANEL
        </h2>
      </div>
      <button 
        onClick={() => setIsSettingsOpen(false)} 
        className="group p-3 bg-white/5 hover:bg-red-500/10 border border-white/5 hover:border-red-500/20 rounded-2xl transition-all duration-300"
      >
        <X size={20} className="text-gray-500 group-hover:text-red-500 group-hover:rotate-90 transition-all duration-300" />
      </button>
    </div>

    {/* Settings List */}
    <div className="space-y-4">
      {/* Setting Item: Safe Search */}
      <div className="group flex items-center justify-between p-5 bg-white/[0.03] hover:bg-white/[0.06] rounded-[1.5rem] border border-white/5 transition-all duration-300">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-black rounded-xl border border-white/5 group-hover:border-emerald-500/30 transition-colors">
            <ShieldCheck className="text-emerald-500 drop-shadow-[0_0_8px_rgba(16,185,129,0.4)]" size={20} />
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-black uppercase tracking-widest text-white">Safe Search</span>
            <span className="text-[10px] text-gray-500 font-bold uppercase tracking-tight opacity-60">Block Explicit Content</span>
          </div>
        </div>
        
        <button 
          onClick={() => setSafeSearch(!safeSearch)}
          className={`w-14 h-7 rounded-full transition-all duration-500 relative border ${
            safeSearch ? 'bg-emerald-600 border-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.4)]' : 'bg-white/5 border-white/10'
          }`}
        >
          <div className={`absolute top-1 w-[1.1rem] h-[1.1rem] rounded-full transition-all duration-500 ${
            safeSearch ? 'left-8 bg-white shadow-[0_0_10px_white]' : 'left-1 bg-gray-600'
          }`} />
        </button>
      </div>

      {/* Setting Item: Data Saver */}
      <div className="group flex items-center justify-between p-5 bg-white/[0.03] hover:bg-white/[0.06] rounded-[1.5rem] border border-white/5 transition-all duration-300">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-black rounded-xl border border-white/5 group-hover:border-emerald-500/30 transition-colors">
            <Globe className="text-emerald-500 drop-shadow-[0_0_8px_rgba(16,185,129,0.4)]" size={20} />
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-black uppercase tracking-widest text-white">Engine Optimization</span>
            <span className="text-[10px] text-gray-500 font-bold uppercase tracking-tight opacity-60">High Performance Mode</span>
          </div>
        </div>
        
        <button 
          onClick={() => setHdImages(!hdImages)}
          className={`w-14 h-7 rounded-full transition-all duration-500 relative border ${
            !hdImages ? 'bg-emerald-600 border-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.4)]' : 'bg-white/5 border-white/10'
          }`}
        >
          <div className={`absolute top-1 w-[1.1rem] h-[1.1rem] rounded-full transition-all duration-500 ${
            !hdImages ? 'left-8 bg-white shadow-[0_0_10px_white]' : 'left-1 bg-gray-600'
          }`} />
        </button>
      </div>

      {/* Action: Clear Cache */}
      <div className="pt-6">
        <button className="group w-full py-5 bg-gradient-to-b from-white/[0.05] to-transparent hover:from-red-500/10 hover:to-red-500/5 rounded-[1.5rem] border border-white/5 hover:border-red-500/20 transition-all duration-500 relative overflow-hidden">
          <div className="absolute inset-0 bg-red-500/10 opacity-0 group-hover:opacity-100 blur-2xl transition-opacity" />
          <div className="relative flex items-center justify-center gap-3">
            <RotateCcw size={16} className="text-gray-500 group-hover:text-red-500 group-hover:rotate-[-180deg] transition-all duration-700" />
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 group-hover:text-red-500 transition-colors">
              Flush System Cache
            </span>
          </div>
        </button>
      </div>
    </div>

    {/* Footer Meta */}
    <div className="mt-10 pt-8 border-t border-white/5 flex items-center justify-between">
      <div className="flex flex-col">
        <span className="text-[8px] font-black text-gray-600 uppercase tracking-widest">Protocol</span>
        <span className="text-[10px] font-bold text-gray-400 uppercase">MV-DB-SECURE</span>
      </div>
      <div className="text-right">
        <div className="flex items-center gap-2 justify-end mb-1">
          <span className="text-[10px] font-black text-white italic tracking-tighter">MANGA<span className="text-emerald-500">VEL</span></span>
          <span className="bg-emerald-500 text-[7px] font-black px-1 rounded-sm text-black">v2</span>
        </div>
        <span className="text-[8px] font-black text-gray-700 uppercase tracking-widest">Build 2.4.0-Stable</span>
      </div>
    </div>
  </div>
</div>
        </div>
      )}

      {/* RESULTS GRID */}
      <main className="container mx-auto px-4 py-12 space-y-8">
        <div className="flex items-center gap-3">
            <h2 className="text-3xl font-black italic tracking-tighter uppercase">
              {title}
            </h2>
        </div>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
          {mangaList.map((manga, idx) => (
            <div key={`${manga.mal_id}-${idx}`} onClick={() => navigate(`/read/${manga.mal_id}`)} className="group cursor-pointer hover:scale-105 transition-all duration-300">
              <div className="relative aspect-[2/3] rounded-2xl overflow-hidden bg-white/5 border border-white/10 group-hover:border-emerald-500/40 transition-all shadow-lg transform-gpu">
                <img src={manga.images.jpg.image_url} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt="" />
                <div className="absolute bottom-2 right-2 bg-black/70 backdrop-blur-md px-2 py-0.5 rounded text-[10px] font-black border border-white/10 flex items-center gap-1">
                   <Hash size={10}/> {manga.chapters || '?'}
                </div>
              </div>
              <h3 className="mt-3 text-sm font-bold truncate group-hover:text-emerald-400 transition-colors uppercase tracking-tight">{manga.title}</h3>
              <div className="flex items-center justify-between mt-1">
                <span className="text-[10px] text-gray-500 font-bold uppercase tracking-tighter">{manga.type}</span>
                <span className="text-[10px] text-emerald-500 font-black tracking-tighter">★ {manga.score || 'N/A'}</span>
              </div>
            </div>
          ))}
        </div>

        <div ref={lastElementRef} className="h-20 w-full flex items-center justify-center">
          {loading && <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />}
        </div>
      </main>
    </div>
  );
};

export default Browse;
