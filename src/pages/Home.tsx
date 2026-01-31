import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search, Home as HomeIcon, Folder,
  Book, BookOpen, Star, TrendingUp,
  Clock, Hash, ChevronRight
} from 'lucide-react';

interface Manga {
  mal_id: number;
  title: string;
  title_english?: string;
  synopsis?: string;
  chapters?: number;
  volumes?: number;
  score?: number;
  status?: string;
  images: {
    jpg: {
      image_url: string;
      large_image_url: string;
    };
  };
}

const Home: React.FC = () => {
  const [topManga, setTopManga] = useState<Manga[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Manga[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Animation States
  const [showSearch, setShowSearch] = useState(false);
  const [searchMounted, setSearchMounted] = useState(false);

  const navigate = useNavigate();

  // Animation styles injection (Emerald Themed)
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

  // Fetch Trending Manga
  useEffect(() => {
    const fetchTopManga = async () => {
      try {
        setLoading(true);
        const res = await fetch('https://api.jikan.moe/v4/top/manga?filter=publishing&limit=24');
        const data = await res.json();
        setTopManga(data.data || []);
      } finally { setLoading(false); }
    };
    fetchTopManga();
  }, []);

  // Search Logic
  useEffect(() => {
    const searchManga = async (query: string) => {
      if (!query.trim()) return;
      setIsSearching(true);
      try {
        const res = await fetch(`https://api.jikan.moe/v4/manga?q=${encodeURIComponent(query)}&limit=6`);
        const data = await res.json();
        setSearchResults(data.data || []);
        setShowSearch(true);
      } finally { setIsSearching(false); }
    };

    const timer = setTimeout(() => {
      if (searchQuery) searchManga(searchQuery);
      else setShowSearch(false);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    if (showSearch) setSearchMounted(true);
    else if (searchMounted) {
      const t = setTimeout(() => setSearchMounted(false), 350);
      return () => clearTimeout(t);
    }
  }, [showSearch]);

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans selection:bg-emerald-500/30">
      
      {/* HEADER */}
      <header className="sticky top-0 z-[100] w-full bg-[#050505]/80 backdrop-blur-xl border-b border-white/5 transition-all">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          
          <div className="flex items-center gap-8">
            {/* Logo */}
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
               <div className="bg-emerald-600 p-1.5 rounded-lg">
                  <BookOpen size={20} className="text-white" />
               </div>
               <span className="text-xl font-black tracking-tighter uppercase hidden sm:block">
                 MANGA<span className="text-emerald-500">VEL</span>
               </span>
            </div>

            {/* Nav Links */}
            <nav className="hidden md:flex items-center gap-2">
              <button onClick={createRipple} className="flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium bg-emerald-600 text-white hover:bg-emerald-500 hover:scale-105 transition-all duration-200 shadow-lg shadow-emerald-500/25">
                <HomeIcon size={18}/> Home
              </button>
              <button onClick={(e) => { createRipple(e); navigate('/browse'); }} className="flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium bg-white/5 text-white hover:bg-white/10 hover:scale-105 transition-all duration-200">
                <Folder size={18}/> Browse
              </button>
            </nav>
          </div>

          <div className="flex items-center gap-4">
            {/* SEARCH BAR */}
            <div className="relative group">
              <div className="relative">
                <input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => searchQuery && setShowSearch(true)}
                  onBlur={() => setTimeout(() => setShowSearch(false), 200)}
                  className="bg-black border border-white/10 rounded-full py-2 pl-10 pr-4 text-sm w-[180px] md:w-[260px] focus:w-[320px] focus:border-emerald-500/50 outline-none transition-all duration-300"
                  placeholder="Search manga..."
                />
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
              </div>

              {/* DROPDOWN */}
              {searchMounted && (
                <div className={`absolute top-full right-0 mt-3 w-80 bg-[#0f0f0f] border border-white/10 rounded-2xl shadow-2xl z-[110] overflow-hidden ${showSearch ? 'animate-in' : 'animate-out'}`}>
                  {searchResults.map((manga) => (
                    <div
                      key={manga.mal_id}
                      onClick={() => navigate(`/read/${manga.mal_id}`)}
                      className="flex gap-3 p-3 hover:bg-white/5 cursor-pointer border-b border-white/5 last:border-b-0 transition-colors"
                    >
                      <img src={manga.images.jpg.image_url} className="w-10 h-14 object-cover rounded shadow-md" alt="" />
                      <div className="min-w-0 flex flex-col justify-center">
                        <h4 className="text-xs font-bold truncate text-gray-100">{manga.title}</h4>
                        <p className="text-[10px] text-emerald-400 font-bold mt-1 uppercase">★ {manga.score || 'N/A'}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* MAIN LAYOUT */}
      <main className="container mx-auto px-4 py-8 space-y-12">
        
        {/* HERO BANNER SECTION (21/9 Aspect) */}
        <section className="relative w-full aspect-[21/9] rounded-3xl overflow-hidden group shadow-2xl border border-white/5">
          {topManga[1] && (
            <>
          <img 
            src="https://preview.redd.it/sakamoto-days-key-visual-anime-banner-redraw-clean-and-edit-v0-5cp1y1x3ry2d1.png?auto=webp&s=7deec80001cc43a0a737bbdce0f7d84cec5d7c75" 
            className="w-full h-full object-cover brightness-[0.4] group-hover:scale-105 transition-transform duration-[2s]" 
            alt="hero" 
          />
              <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-transparent to-transparent flex flex-col justify-end p-8 md:p-12">
                 <div className="flex items-center gap-2 mb-4">
                    <span className="bg-emerald-600 px-3 py-1 rounded-full text-[10px] font-black tracking-widest uppercase italic">Trending Now</span>
                    <span className="text-sm font-bold text-yellow-500">★ 9.1</span>
                 </div>
                 <h1 className="text-4xl md:text-7xl font-black mb-6 max-w-2xl leading-none uppercase italic tracking-tighter">Sakamoto Days</h1>
                 <div className="flex gap-4">
                     <button onClick={() => navigate('/read/131334')} className="bg-emerald-600 hover:bg-emerald-500 px-10 py-4 rounded-2xl font-black transition-all shadow-xl shadow-emerald-600/20">
                      READ NOW
                    </button>
                 </div>
              </div>
            </>
          )}
        </section>

        {/* RECENTLY UPDATED GRID */}
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
              <TrendingUp className="text-emerald-500" /> Top Publishing
            </h2>
            <button className="text-xs font-bold text-emerald-500 hover:underline">VIEW ALL</button>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
            {topManga.map((manga) => (
              <div
                key={manga.mal_id}
                onClick={() => navigate(`/read/${manga.mal_id}`)}
                className="group cursor-pointer hover:scale-105 transition-all duration-300"
              >
                <div className="relative aspect-[2/3] rounded-2xl overflow-hidden bg-white/5 border border-white/10 group-hover:border-emerald-500/40 transition-all shadow-lg transform-gpu">
                  <img
                    src={manga.images.jpg.image_url}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    alt=""
                  />
                  <div className="absolute top-2 left-2 bg-emerald-600/90 backdrop-blur-md px-2 py-0.5 rounded text-[10px] font-black border border-white/10">
                    HOT
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60 group-hover:opacity-100 transition-opacity" />
                  
                  <div className="absolute bottom-2 right-2 bg-black/60 backdrop-blur-md px-2 py-0.5 rounded text-[10px] font-black border border-white/10">
                    CH {manga.chapters || '?'}
                  </div>
                </div>
                
                <h3 className="mt-3 text-sm font-bold truncate text-gray-200 group-hover:text-emerald-400 transition-colors">
                  {manga.title}
                </h3>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-[10px] text-gray-500 font-bold uppercase tracking-tighter">{manga.status}</span>
                  <span className="text-[10px] text-emerald-500 font-bold tracking-tighter">★ {manga.score}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

      </main>

    </div>
  );
};

export default Home;