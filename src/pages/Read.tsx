import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search, X, Home as HomeIcon, Film, Tv, Folder,
  BookOpen, TrendingUp, Settings, Sparkles, Play, Book,
  CatIcon,
  GlobeIcon
} from 'lucide-react';

interface Manga {
  mal_id: number;
  title: string;
  score?: number;
  status?: string;
  chapters?: number;
  images: { jpg: { image_url: string; large_image_url: string } };
}

const Read: React.FC = () => {
  const [recentManga, setRecentManga] = useState<Manga[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Manga[]>([]);
  const [showSearch, setShowSearch] = useState(false);
  const [searchMounted, setSearchMounted] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    fetchTopManga();
  }, []);

  const fetchTopManga = async () => {
    try {
      setLoading(true);
      const res = await fetch('https://api.jikan.moe/v4/top/manga?filter=publishing&limit=18');
      const data = await res.json();
      setRecentManga(data.data || []);
    } finally { setLoading(false); }
  };

  const searchManga = async (query: string) => {
    if (!query.trim()) return;
    try {
      const res = await fetch(`https://api.jikan.moe/v4/manga?q=${encodeURIComponent(query)}&limit=6`);
      const data = await res.json();
      setSearchResults(data.data || []);
      setShowSearch(true);
    } catch (e) { console.error(e); }
  };

  // Animation styles injection
  useEffect(() => {
    const id = 'vf-ui-animations';
    if (document.getElementById(id)) return;
    const s = document.createElement('style');
    s.id = id;
    s.innerHTML = `
      .animate-in { will-change: transform, opacity; }
      .animate-out { will-change: transform, opacity; }
      .fade-in { animation: vf-fade-in .28s cubic-bezier(.2,.9,.3,1) both; }
      .fade-out { animation: vf-fade-out .22s cubic-bezier(.4,.0,.2,1) both; }
      .zoom-in { animation: vf-zoom-in .32s cubic-bezier(.2,.9,.3,1) both; }
      .zoom-out { animation: vf-zoom-out .22s cubic-bezier(.4,.0,.2,1) both; }
      .spin-in { animation: vf-spin-in .45s cubic-bezier(.2,.9,.3,1) both; }
      .slide-in-from-bottom { animation: vf-slide-in-from-bottom .36s cubic-bezier(.2,.9,.3,1) both; }
      .slide-in-from-bottom-4 { animation: vf-slide-in-from-bottom .36s cubic-bezier(.2,.9,.3,1) both; }
      .slide-out-to-bottom-4 { animation: vf-slide-out-to-bottom .26s cubic-bezier(.4,.0,.2,1) both; }
      .slide-in-from-left { animation: vf-slide-in-from-left .36s cubic-bezier(.2,.9,.3,1) both; }
      .slide-in-from-right { animation: vf-slide-in-from-right .36s cubic-bezier(.2,.9,.3,1) both; }
      .slide-in-from-top { animation: vf-slide-in-from-top .36s cubic-bezier(.2,.9,.3,1) both; }

      @keyframes vf-fade-in { from { opacity: 0; } to { opacity: 1; } }
      @keyframes vf-fade-out { from { opacity: 1; } to { opacity: 0; } }
      @keyframes vf-zoom-in { from { opacity: 0; transform: translateY(8px) scale(.985); } to { opacity: 1; transform: translateY(0) scale(1); } }
      @keyframes vf-zoom-out { from { opacity: 1; transform: translateY(0) scale(1); } to { opacity: 0; transform: translateY(8px) scale(.985); } }
      @keyframes vf-spin-in { from { transform: rotate(-8deg) scale(.95); opacity:0 } to { transform: rotate(0deg) scale(1); opacity:1 } }
      @keyframes vf-slide-in-from-bottom { from { opacity: 0; transform: translateY(26px) scale(.995); } to { opacity: 1; transform: translateY(0) scale(1); } }
      @keyframes vf-slide-out-to-bottom { from { opacity: 1; transform: translateY(0) scale(1); } to { opacity: 0; transform: translateY(18px) scale(.995); } }
      @keyframes vf-slide-in-from-left { from { opacity: 0; transform: translateX(-18px) scale(.995); } to { opacity: 1; transform: translateX(0) scale(1); } }
      @keyframes vf-slide-in-from-right { from { opacity: 0; transform: translateX(18px) scale(.995); } to { opacity: 1; transform: translateX(0) scale(1); } }
      @keyframes vf-slide-in-from-top { from { opacity: 0; transform: translateY(-18px) scale(.995); } to { opacity: 1; transform: translateY(0) scale(1); } }
      /* Smooth transitions for drag and drop */
      .no-rise { transform: none !important; }
      /* Ripple effect - less intense */
      .vf-ripple { position: absolute; width: 50px; height: 50px; border-radius: 50%; background: radial-gradient(circle, rgba(255,255,255,0.25) 0%, rgba(255,255,255,0.10) 70%, transparent 100%); transform: translate(-50%,-50%) scale(0); pointer-events: none; box-shadow: 0 0 10px 0px rgba(255,255,255,0.17); animation: vf-ripple 380ms cubic-bezier(0.4, 0, 0.2, 1) forwards; }
      @keyframes vf-ripple {
        0% { transform: translate(-50%,-50%) scale(0); opacity: 0.9; }
        100% { transform: translate(-50%,-50%) scale(7); opacity: 0; }
      }
      button { position: relative; overflow: hidden; }
      /* Slider thumb styling */
      .slider::-webkit-slider-thumb {
        appearance: none;
        width: 20px;
        height: 20px;
        border-radius: 50%;
        background: white;
        cursor: pointer;
        border: 2px solid rgba(255,255,255,0.3);
        box-shadow: 0 0 10px rgba(0,0,0,0.2);
      }
      .slider::-moz-range-thumb {
        width: 20px;
        height: 20px;
        border-radius: 50%;
        background: white;
        cursor: pointer;
        border: 2px solid rgba(255,255,255,0.3);
        box-shadow: 0 0 10px rgba(0,0,0,0.2);
      }
    `;
    document.head.appendChild(s);
    return () => { s.remove(); };
  }, []);

  // Ripple effect handler - creates a visible ripple on button click
  const createRipple = (e: React.MouseEvent<HTMLElement>) => {
    const button = e.currentTarget;
    const rect = button.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const ripple = document.createElement('div');
    ripple.className = 'vf-ripple';
    ripple.style.left = `${x}px`;
    ripple.style.top = `${y}px`;

    button.appendChild(ripple);

    setTimeout(() => {
      ripple.remove();
    }, 600);
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans selection:bg-emerald-500/30">
      <header className="sticky top-0 z-[100] w-full bg-[#050505]/80 backdrop-blur-xl border-b border-white/5">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
               <div className="bg-emerald-600 p-1.5 rounded-lg"><BookOpen size={20} /></div>
               <span className="text-xl font-black tracking-tighter uppercase hidden sm:block">MANGAVEL</span>
            </div>
            <nav className="hidden md:flex items-center gap-2">
              <button className="flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium bg-emerald-600 text-white hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-emerald-500/25"><HomeIcon size={18}/> Home</button>
              <button className="flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium bg-white/5 hover:bg-white/10 transition-all hover:scale-105 duration-200 shadow-lg hover:shadow-emerald"><TrendingUp size={18}/> Popular</button>
            </nav>
          </div>

          <div className="relative">
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-white/5 border border-white/10 rounded-full py-2 pl-10 pr-4 text-sm w-[180px] md:w-[260px] focus:w-[320px] focus:border-emerald-500/50 outline-none transition-all duration-300"
              placeholder="Search manga..."
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
            {searchMounted && (
              <div className={`absolute top-full right-0 mt-3 w-80 bg-[#0f0f0f] border border-white/10 rounded-2xl shadow-2xl z-[110] overflow-hidden ${showSearch ? 'animate-in' : 'animate-out'}`}>
                {searchResults.map((manga) => (
                  <div key={manga.mal_id} onClick={() => navigate(`/read/${manga.mal_id}`)} className="flex gap-3 p-3 hover:bg-white/5 cursor-pointer border-b border-white/5 transition-colors">
                    <img src={manga.images.jpg.image_url} className="w-10 h-14 object-cover rounded shadow-md" alt="" />
                    <div className="min-w-0 flex flex-col justify-center">
                      <h4 className="text-xs font-bold truncate">{manga.title}</h4>
                      <span className="text-[10px] text-emerald-400 font-bold">★ {manga.score || 'N/A'}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 space-y-12">
        {/* HERO SECTION - Functional to a specific Manga (e.g., Sakamoto Days ID: 131334) */}
        <section className="relative w-full aspect-[21/9] rounded-3xl overflow-hidden group shadow-2xl border border-white/5 cursor-pointer" onClick={() => navigate('/read/131334')}>
          <img src="https://images.alphacoders.com/134/1341852.png" className="w-full h-full object-cover brightness-50 group-hover:scale-105 transition-transform duration-700" alt="" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-transparent to-transparent flex flex-col justify-end p-12">
             <span className="bg-emerald-600 w-fit px-3 py-1 rounded-full text-[10px] font-black uppercase mb-4">Spotlight</span>
             <h1 className="text-6xl font-black mb-4 uppercase italic tracking-tighter">Sakamoto Days</h1>
             <button onClick={createRipple} className="bg-emerald-600 w-fit px-8 py-3 rounded-xl font-black flex items-center gap-2">READ NOW</button>
          </div>
        </section>

        {/* RECENT GRID */}
        <section className="space-y-6">
          <h2 className="text-2xl font-bold tracking-tight">Trending Updates</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
            {recentManga.map((manga) => (
              <div key={manga.mal_id} onClick={() => navigate(`/read/${manga.mal_id}`)} className="group cursor-pointer">
                <div className="relative aspect-[2/3] rounded-2xl overflow-hidden border border-white/10 group-hover:border-emerald-500/40 transition-all">
                  <img src={manga.images.jpg.image_url} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt="" />
                  <div className="absolute bottom-2 right-2 bg-black/70 px-2 py-0.5 rounded text-[10px] font-black">CH {manga.chapters || '?'}</div>
                </div>
                <h3 className="mt-3 text-sm font-bold truncate group-hover:text-emerald-400 transition-colors">{manga.title}</h3>
                <div className="flex justify-between mt-1"><span className="text-[10px] text-gray-500 uppercase">{manga.status}</span><span className="text-[10px] text-emerald-500 font-bold">★ {manga.score}</span></div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
};

export default Read;