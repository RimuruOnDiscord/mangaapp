import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, NavLink } from 'react-router-dom';
import { 
  ChevronLeft, Star, Tag, Loader2, Play, LucideIcon, Search, Folder, 
  Zap, Layers, Clock, Dices, Settings, X, ShieldCheck, Globe, 
  RotateCcw, FilterX, ChevronRight, Hash, BookOpen
} from 'lucide-react';

// --- Interfaces ---
interface MangaData {
  mal_id: number;
  title: string;
  title_english?: string;
  synopsis?: string;
  chapters?: number;
  volumes?: number;
  score?: number;
  status?: string;
  type?: string; 
  rank?: number;
  popularity?: number;
  authors?: { name: string }[];
  genres?: { mal_id: number; name: string }[];
  images: {
    jpg: {
      image_url: string;
      large_image_url: string;
    };
  };
}

// --- Premium Logo Component ---
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



// --- Nav Link ---
const CustomNavLink: React.FC<{ icon: LucideIcon; label: string; to: string }> = ({ icon: Icon, label, to }) => (
  <NavLink to={to} className={({ isActive }) => `flex items-center gap-2 px-3 py-2 rounded-lg font-bold text-sm transition-colors ${isActive ? 'bg-emerald-600 text-black shadow-lg shadow-emerald-500/20' : 'text-gray-300 hover:bg-white/10'}`}>
    <Icon className="w-4 h-4" />{label}
  </NavLink>
);

const Manga: React.FC = () => {
  const { mangaId } = useParams<{ mangaId: string }>();
  const navigate = useNavigate();

  // Content States
  const [data, setData] = useState<MangaData | null>(null);
  const [gomangaData, setGomangaData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isLinking, setIsLinking] = useState(false);

  // Search States
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchMounted, setSearchMounted] = useState(false);

  const sanitize = (str: string) => str.toLowerCase().replace(/[^a-z0-9]/g, '');

  // Animations CSS Injection
  useEffect(() => {
    const id = 'vf-ui-animations';
    if (document.getElementById(id)) return;
    const s = document.createElement('style');
    s.id = id;
    s.innerHTML = `
      .animate-in { will-change: transform, opacity; }
      .fade-in { animation: vf-fade-in .3s both; }
      .zoom-in { animation: vf-zoom-in .3s cubic-bezier(.2,.9,.3,1) both; }
      .zoom-out { animation: vf-zoom-out .2s cubic-bezier(.4,0,.2,1) both; }
      @keyframes vf-fade-in { from { opacity: 0; } to { opacity: 1; } }
      @keyframes vf-zoom-in { from { opacity: 0; transform: translateY(10px) scale(.95); } to { opacity: 1; transform: translateY(0) scale(1); } }
      @keyframes vf-zoom-out { from { opacity: 1; transform: translateY(0) scale(1); } to { opacity: 0; transform: translateY(10px) scale(.95); } }
      @keyframes bounceCustom { 0%, 100% { transform: scaleY(0.5); } 50% { transform: scaleY(1.2); } }
      .animate-bounce-bar { animation: bounceCustom 0.8s infinite ease-in-out; }
    `;
    document.head.appendChild(s);
  }, []);

  // Search Effect
  useEffect(() => {
    const search = async () => {
      if (!searchQuery.trim()) return;
      setIsSearching(true);
      try {
        const res = await fetch(`https://api.jikan.moe/v4/manga?q=${encodeURIComponent(searchQuery)}&limit=5`);
        const result = await res.json();
        setSearchResults(result.data || []);
        setShowSearch(true);
      } finally { setIsSearching(false); }
    };
    const t = setTimeout(() => { if (searchQuery) search(); else setShowSearch(false); }, 500);
    return () => clearTimeout(t);
  }, [searchQuery]);

  useEffect(() => {
    if (showSearch) setSearchMounted(true);
    else if (searchMounted) { const t = setTimeout(() => setSearchMounted(false), 300); return () => clearTimeout(t); }
  }, [showSearch, searchMounted]);

  // Main Detail Fetch
  useEffect(() => {
    const fetchAll = async () => {
      try {
        setLoading(true);
        const res = await fetch(`https://api.jikan.moe/v4/manga/${mangaId}/full`);
        const json = await res.json();
        setData(json.data);

        if (json.data) {
          // 1. Search for the manga
          const searchRes = await fetch(`/gomanga-api/api/search/${encodeURIComponent(json.data.title)}`);
          const searchData = await searchRes.json();
          
          if (searchData.manga?.length > 0) {
            // 2. SMART MATCHING: Find the result that best matches the MAL title
            // This prevents picking "Blue Lock One-shot" instead of "Blue Lock"
            const targetTitle = sanitize(json.data.title);
            let bestMatch = searchData.manga[0];

            for (const m of searchData.manga) {
                if (sanitize(m.title) === targetTitle) {
                    bestMatch = m;
                    break;
                }
            }

            // 3. Fetch specific details for that match
            const detailRes = await fetch(`/gomanga-api/api/manga/${bestMatch.id}`);
            const detailData = await detailRes.json();
            setGomangaData(detailData);
          }
        }
      } catch (e) { 
        console.error("Fetch Error:", e); 
      } finally { 
        setLoading(false); 
      }
    };
    fetchAll();
    window.scrollTo(0, 0);
  }, [mangaId]);

 const handleStartReading = async () => {
    // If we already have the chapter data, use it immediately
    if (gomangaData?.chapters?.length > 0) {
      setIsLinking(true);
      // Sort chapters to find the first one (usually at the end of the array or index 0)
      // We look for the chapter with the lowest number or the last one in the list
      const chapters = gomangaData.chapters;
      const firstChapter = chapters[chapters.length - 1]; // Usually APIs list newest first
      
      navigate(`/read/${gomangaData.id}/chapter/1/`);
      setIsLinking(false);
      return;
    }
  };

  if (loading) return <div className="min-h-screen bg-[#050505] flex items-center justify-center"><div className="w-10 h-10 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" /></div>;
  if (!data) return <div className="min-h-screen bg-[#050505] flex items-center justify-center font-black uppercase text-white">System Error: Index Null</div>;

  return (
    <div className="relative min-h-screen bg-[#050505] text-white pb-20 selection:bg-emerald-500/30">
      

      {/* --- HEADER --- */}
      <header className="sticky top-0 z-[100] w-full bg-[#050505]/80 backdrop-blur-xl border-b border-white/5 transition-all">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <div 
              onClick={() => navigate('/')}
              className="flex items-center gap-3 group transition-transform active:scale-95 cursor-pointer"
            >
              <Logo className="w-10 h-10" /> 
              <div className="flex flex-col leading-none">
                <div className="flex items-center gap-1.5">
                    <span className="text-xl font-[900] tracking-tighter text-white">MANGA</span><span className="text-xl font-[900] tracking-tighter text-emerald-500">VEL</span>
                    <span className="bg-emerald-500 bg-opacity-10 text-[11px] font-black px-1.5 py-0.5 rounded-sm italic text-emerald-400 -translate-y-1">v2</span>
                </div>
            <span className="text-[9.7px] font-bold text-gray-500 tracking-[0.2em] uppercase opacity-60">
              FAST • FREE • ONLINE
            </span>
              </div>
            </div>

            {/* Nav Links */}
            <nav className="hidden md:flex items-center gap-2">
              <div className="hidden lg:flex items-center gap-6">
                <CustomNavLink icon={Folder} label="Browse" to="/browse" />
                <CustomNavLink icon={Zap} label="Newest" to="/newest" />
                <CustomNavLink icon={Clock} label="Updated" to="/updated" />
                <CustomNavLink icon={Layers} label="Added" to="/added" />
                <CustomNavLink icon={Dices} label="Random" to="/random" />
              </div>
            </nav>
          </div>

          <div className="flex items-center gap-3">
            {/* IMPROVED SEARCH */}
            <div className="relative group hidden sm:block">
              {/* Outer Glow Effect on Focus */}
              <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500/20 to-transparent blur-lg opacity-0 group-focus-within:opacity-100 transition-opacity duration-500" />
              
              <div className="relative flex items-center">
                <input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => searchQuery && setShowSearch(true)}
                  onBlur={() => setTimeout(() => setShowSearch(false), 200)} // Keep dropdown open briefly
                  className="bg-[#080809] border border-white/10 rounded-xl py-2.5 pl-11 pr-12 text-[11px] font-black tracking-widest w-[240px] md:w-[280px] focus:w-[360px] focus:border-emerald-500/50 focus:ring-4 focus:ring-emerald-500/5 outline-none transition-all duration-500 text-gray-200 focus:text-white placeholder:text-gray-600 uppercase"
                  placeholder="Search..."
                />
                
                {/* Icon with focus glow */}
                <Search 
                  className={`absolute left-4 transition-all duration-500 ${
                    searchQuery ? 'text-emerald-500 drop-shadow-[0_0_8px_rgba(16,185,129,0.6)]' : 'text-gray-600'
                  }`} 
                  size={14} 
                />

                {/* Dynamic Status (Loading Spinner or Clear X) */}
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

              {/* --- HIGH-END RESULTS HUD --- */}
              {searchMounted && (
                <div className={`absolute top-full right-0 mt-4 w-[420px] bg-[#050505]/95 backdrop-blur-2xl border border-white/10 rounded-[2rem] shadow-[0_40px_80px_rgba(0,0,0,0.9)] z-[110] overflow-hidden ${showSearch ? 'animate-in zoom-in slide-in-from-top-4' : 'animate-out zoom-out'} duration-300`}>
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
                          onClick={() => { navigate(`/read/${manga.mal_id}`); setShowSearch(false); setSearchQuery(''); }}
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
                                <span className="text-[8px] font-black text-gray-600 uppercase tracking-widest">{manga.type || 'Manga'} • {manga.status}</span>
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
                  <button onClick={() => { navigate(`/browse?q=${encodeURIComponent(searchQuery)}`); setShowSearch(false); setSearchQuery(''); }} className="w-full py-4 bg-emerald-500/5 hover:bg-emerald-500/10 border-t border-white/5 transition-colors group">
                    <span className="text-[9px] font-black text-emerald-500 uppercase tracking-[0.4em] group-hover:tracking-[0.5em] transition-all">
                      VIEW MORE
                    </span>
                  </button>
                </div>
              )}
            </div>

          </div>
        </div>
      </header>

      {/* --- CONTENT --- */}
      <div className="absolute top-0 left-0 w-full h-[70vh] overflow-hidden pointer-events-none">
        <img src={data.images.jpg.large_image_url} className="w-full h-full object-cover blur-3xl opacity-20 scale-110" alt="" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/80 to-transparent" />
      </div>

      <div className="relative z-10 container mx-auto px-4 pt-8">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 rounded-full transition-all border border-white/5 mb-8 group">
          <ChevronLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
          <span className="text-sm font-black uppercase tracking-widest">BACK</span>
        </button>

        <div className="flex flex-col lg:flex-row gap-12">
          {/* POSTER */}
          <div className="w-full lg:w-80 flex-shrink-0">
            <div className="sticky top-24 space-y-6">
              <div className="relative aspect-[2/3] rounded-3xl overflow-hidden shadow-2xl border border-white/10 ring-1 ring-emerald-500/20 group">
                <img src={data.images.jpg.large_image_url} className="w-full h-full object-cover" alt={data.title} />
                <div className="absolute top-4 left-4 bg-emerald-500 text-black px-2 py-1 rounded text-[10px] font-black tracking-widest shadow-xl shadow-emerald-500/20 animate-in zoom-in">
                  RANK #{data.rank || 'N/A'}
                </div>
              </div>
              <button onClick={handleStartReading} disabled={isLinking} className={`w-full py-4 rounded-2xl font-black transition-all flex items-center justify-center gap-2 shadow-lg ${isLinking ? 'bg-gray-700' : 'bg-emerald-500 border border-emerald-600 border-opacity-20 bg-opacity-25 hover:bg-opacity-75 hover:border-opacity-50 hover:scale-105 active:scale-95 shadow-emerald-600/20'}`}>
                {isLinking ? <Loader2 className="animate-spin" size={20} /> : <><Play size={20} fill="currentColor" /> START READING</>}
              </button>
            </div>
          </div>

          {/* DETAILS */}
          <div className="flex-grow pt-2">
            <div className="space-y-8">
              <h1 className="text-5xl md:text-8xl font-black uppercase italic tracking-tighter leading-[0.85] text-transparent bg-clip-text bg-gradient-to-b from-white to-gray-500">
                {data.title}
              </h1>

              <div className="flex items-center gap-2 text-gray-500">
                <Tag size={16} className="text-emerald-500" />
                <span className="font-black uppercase tracking-[0.2em] text-[10px]">{data.authors?.map(a => a.name).join(', ') || 'Unknown Author'}</span>
              </div>

              <div className="max-w-4xl">
                <p className="text-gray-400 leading-relaxed text-lg font-medium italic mb-6 opacity-60">
                    {gomangaData ? `Last Updated: ${gomangaData.lastUpdated}` : 'Searching Database Node...'}
                </p>
                <div className="flex items-center gap-3 mb-4">
                </div>
                <div className="text-gray-300 leading-relaxed text-lg font-medium line-clamp-6 hover:line-clamp-none transition-all duration-700 bg-white/[0.02] p-6 rounded-3xl border border-white/5">
                  <h3 className="text-white font-black uppercase tracking-widest text-[11px] mb-2 text-opacity-50">Details</h3>
                  <p>{data.synopsis}</p>
                </div>
              </div>

              {/* STATS HUD */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-8 bg-[#070708] border border-white/5 rounded-[2.5rem] shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-emerald-500/20" />
                <div className="space-y-1">
                  <p className="text-[9px] font-black text-gray-600 uppercase tracking-widest">Chapters</p>
                  <p className="text-3xl font-black text-emerald-500">{gomangaData ? gomangaData.chapters.length : (data.chapters || '??')}</p>
                </div>
                <div className="space-y-1 border-l border-white/5 pl-6">
                  <p className="text-[9px] font-black text-gray-600 uppercase tracking-widest">DB Index</p>
                  <p className="text-3xl font-black text-white">#{data.mal_id}</p>
                </div>
                <div className="space-y-1 border-l border-white/5 pl-6">
                  <p className="text-[9px] font-black text-gray-600 uppercase tracking-widest">Popularity</p>
                  <p className="text-3xl font-black text-white">#{data.popularity}</p>
                </div>
                <div className="space-y-1 border-l border-white/5 pl-6">
                  <p className="text-[9px] font-black text-gray-600 uppercase tracking-widest">Views</p>
                  <p className="text-3xl font-black text-emerald-500/40 uppercase tracking-tighter">{gomangaData ? gomangaData.views : 'N/A'}</p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 pt-4">
                {data.genres?.map((genre) => (
                  <button key={genre.mal_id} onClick={() => navigate(`/browse?q=${genre.name}`)} className="px-6 py-2.5 bg-white/5 border border-white/5 rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-emerald-600 hover:text-black hover:border-emerald-400 transition-all">{genre.name}</button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Manga;
