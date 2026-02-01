import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ChevronLeft, Layout, Columns, Loader2, 
  Check, BookOpen, AlertCircle, ChevronDown,
  ChevronRight, EyeOff, ArrowLeftRight, ArrowUp, Settings, X, RotateCcw
} from 'lucide-react';

// --- Premium Logo ---
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

const Page: React.FC = () => {
  const { mangaId, chapterId } = useParams();
  const navigate = useNavigate();
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const [apiChapters, setApiChapters] = useState<any[]>([]);
  const [pages, setPages] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [mangaTitle, setMangaTitle] = useState("Loading...");
  const [readingMode, setReadingMode] = useState<'long-strip' | 'single-page'>('long-strip');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<'chapter' | null>(null);
  const [fitWidth, setFitWidth] = useState(true);
  const [totalChapters, setTotalChapters] = useState<number>(0);

  // Injected Styles for Dropdown & Gap Fix
  useEffect(() => {
    const id = 'reader-core-styles';
    if (document.getElementById(id)) return;
    const s = document.createElement('style');
    s.id = id;
    s.innerHTML = `
      .animate-in { animation: zoomIn 0.25s cubic-bezier(.2,.9,.3,1) both; }
      @keyframes zoomIn {
        from { opacity: 0; transform: translateY(10px) scale(0.95); }
        to { opacity: 1; transform: translateY(0) scale(1); }
      }
      .thin-scroll::-webkit-scrollbar { width: 2px; }
      .thin-scroll::-webkit-scrollbar-thumb { background: #10b981; border-radius: 10px; }
      img { -webkit-backface-visibility: hidden; backface-visibility: hidden; }
    `;
    document.head.appendChild(s);
  }, []);

  useEffect(() => {
    const fetchReaderData = async () => {
      if (!mangaId || !chapterId) return;
      setLoading(true);
      try {
        const proxyBase = "/gomanga-api/api";
        const res = await fetch(`${proxyBase}/manga/${mangaId}/${chapterId}`);
        const data = await res.json();
        setPages(data.imageUrls || []);

        const infoRes = await fetch(`${proxyBase}/manga/${mangaId}`);
        const infoData = await infoRes.json();
        const chList = infoData.chapters || [];
        setApiChapters(chList);
        setMangaTitle(infoData.title || "Manga Online");

        // Determine True Max Chapter
        const apiMax = chList.length > 0 
          ? Math.max(...chList.map((c: any) => parseFloat(c.chapterId) || 0)) 
          : 0;
        setTotalChapters(Math.max(apiMax, parseFloat(chapterId)));

        if (scrollRef.current) scrollRef.current.scrollTop = 0;
      } catch (e) { console.error(e); } finally { setLoading(false); }
    };
    fetchReaderData();
  }, [mangaId, chapterId]);

  // Generate Chapter List (Forced Logic)
  const fullChapterList = [];
  const startNum = Math.floor(totalChapters || parseFloat(chapterId || "1"));
  for (let i = startNum; i >= 1; i--) {
    const realData = apiChapters.find(c => parseFloat(c.chapterId) === i);
    fullChapterList.push(realData || { chapterId: i.toString(), isMissing: true });
  }

  const currentNum = parseFloat(chapterId || "1");
  const nextId = (currentNum + 1) <= totalChapters ? (currentNum + 1).toString() : null;
  const prevId = (currentNum - 1) >= 1 ? (currentNum - 1).toString() : null;
  const progressPercent = (currentNum / totalChapters) * 100;

  return (
    <div className="flex h-screen w-full bg-[#050506] text-white overflow-hidden font-sans select-none">

      <CustomCursor />
      
      {/* MAIN VIEW */}
      <main className="flex-grow flex flex-col relative overflow-hidden bg-black">
        <header className="h-16 border-b border-white/5 bg-[#050505]/95 backdrop-blur-xl flex items-center justify-between px-6 z-50">
           <div className="flex items-center gap-6">
             <button onClick={() => navigate('/')} className="p-2 -ml-2 text-gray-400 hover:text-emerald-500 transition-colors">
               <ChevronLeft size={24}/>
             </button>
             <div onClick={() => navigate('/')} className="flex items-center gap-3 cursor-pointer group">
                <Logo className="w-8 h-8" />
                <div className="flex flex-col leading-none">
                  <div className="flex items-center gap-1.5">
                      <span className="text-xl font-[900] tracking-tighter">MANGA</span>
                      <span className="text-xl font-[900] tracking-tighter text-emerald-500">VEL</span>
                      <span className="bg-emerald-500 text-[9px] font-black px-1.5 py-0.5 rounded-sm italic text-black -translate-y-1">v2</span>
                  </div>
                  <span className="text-[10px] font-bold text-gray-500 tracking-[0.2em] uppercase opacity-60">FAST • FREE • ONLINE</span>
                </div>
             </div>
           </div>

           <button onClick={() => setSidebarOpen(!sidebarOpen)} className="flex items-center gap-4 group active:scale-95 transition-all">
             <div className="flex flex-col items-end leading-none">
                <span className="text-[10px] font-black uppercase text-gray-500 tracking-widest mb-1">Sidebar</span>
                <span className="text-[11px] font-bold text-emerald-500 uppercase">Menu</span>
             </div>
             <div className={`p-2.5 rounded-xl border transition-all ${sidebarOpen ? 'bg-emerald-500 border-emerald-400 text-black' : 'bg-emerald-500/5 border-emerald-500/20 text-emerald-500'}`}>
               <Layout size={20} />
             </div>
           </button>
        </header>

        {/* IMAGE RENDERER - GAP FIX APPLIED HERE */}
<div ref={scrollRef} className="flex-1 overflow-y-auto thin-scroll scroll-smooth bg-black">
  {loading ? (
    <div className="h-full flex flex-col items-center justify-center">
      <Loader2 className="animate-spin text-emerald-500 mb-4" size={40}/>
    </div>
  ) : (
    /* 
       THE FIX: Added 'gap-killer' class 
       and removed any padding/gap from the flex container 
    */
    <div className={`mx-auto gap-killer bg-black ${
      readingMode === 'long-strip' ? (fitWidth ? 'max-w-3xl' : 'w-full') : 'h-full justify-center'
    }`}>
      {pages.map((url, i) => (
          <img 
            key={i} 
            src={url} 
            className="manga-image w-full h-auto" 
            alt={`Page ${i}`}
            loading="lazy"
            style={{ 
              /* 
                 The "Negative overlap" hack: 
                 Using -1px margin-top is the industry standard 
                 to hide browser sub-pixel rendering gaps.
              */
              marginTop: i === 0 ? '0' : '-1px' 
            }}
          />
      ))}
    </div>
  )}
</div>

        <footer className="h-1 bg-white/5 w-full">
          <div className="h-full bg-emerald-500 transition-all duration-1000 shadow-[0_0_15px_#10b981]" style={{ width: `${progressPercent}%` }} />
        </footer>
      </main>

      {/* SIDEBAR */}
      <aside className={`fixed top-0 right-0 h-full bg-[#080809] border-l border-white/5 transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] z-[100] shadow-[100px_0_100px_rgba(0,0,0,0.9)] ${sidebarOpen ? 'w-80 translate-x-0' : 'w-80 translate-x-full'}`}>
        <div className="h-full flex flex-col p-6">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-[10px] font-black uppercase text-gray-500 tracking-widest">Interface</h2>
            <button onClick={() => setSidebarOpen(false)} className="text-gray-500 hover:text-white transition-colors"><X size={20}/></button>
          </div>

          <div className="mb-8">
            <span className="text-[8px] font-black text-emerald-500 uppercase tracking-widest block mb-2">Reading Now</span>
            <h1 className="text-sm font-black uppercase italic tracking-tighter text-white/90 line-clamp-2">{mangaTitle}</h1>
          </div>

          <div className="space-y-6 flex-grow overflow-y-auto thin-scroll pr-2">
            
            {/* Chapter Selection */}
            <div className="space-y-3">
              <div className="relative">
                <button 
                  onClick={() => setOpenDropdown(openDropdown === 'chapter' ? null : 'chapter')}
                  className="w-full flex items-center justify-between p-4 bg-white/[0.03] rounded-2xl border border-white/5 hover:border-emerald-500/40 transition-all"
                >
                    <div className="flex flex-col items-start">
                      <span className="text-[8px] font-black text-gray-600 uppercase mb-0.5">Selection</span>
                      <span className="text-xs font-black text-white uppercase tracking-wider">Chapter {chapterId}</span>
                    </div>
                    <ChevronDown size={18} className={`transition-transform duration-500 ${openDropdown === 'chapter' ? 'rotate-180 text-emerald-400' : 'text-gray-600'}`} />
                </button>

                {openDropdown === 'chapter' && (
                  <div className="absolute top-full left-0 w-full mt-2 bg-[#121214] border border-white/10 rounded-2xl overflow-hidden shadow-2xl z-[110] animate-in">
                      <div className="max-h-60 overflow-y-auto thin-scroll p-2">
                        {fullChapterList.map((ch: any) => (
                          <button 
                              key={ch.chapterId}
                              onClick={() => { navigate(`/read/${mangaId}/chapter/${ch.chapterId}`); setOpenDropdown(null); }}
                              className={`w-full text-left px-4 py-3 rounded-xl text-[10px] font-black uppercase transition-all mb-1 flex items-center justify-between ${chapterId === ch.chapterId ? 'text-emerald-400 bg-emerald-500/10' : 'text-gray-500 hover:bg-white/5 hover:text-white'}`}
                          >
                            CH {ch.chapterId} {ch.isMissing}
                            {chapterId === ch.chapterId && <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981]" />}
                          </button>
                        ))}
                      </div>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button 
                  disabled={!prevId}
                  onClick={() => prevId && navigate(`/read/${mangaId}/chapter/${prevId}`)}
                  className="flex items-center justify-center gap-2 py-4 bg-white/5 rounded-2xl border border-white/5 text-[9px] font-black uppercase tracking-widest hover:bg-emerald-500 hover:text-black transition-all disabled:opacity-10"
                >
                  <ChevronLeft size={16}/> PREV
                </button>
                <button 
                  disabled={!nextId}
                  onClick={() => nextId && navigate(`/read/${mangaId}/chapter/${nextId}`)}
                  className="flex items-center justify-center gap-2 py-4 bg-white/5 rounded-2xl border border-white/5 text-[9px] font-black uppercase tracking-widest hover:bg-emerald-500 hover:text-black transition-all disabled:opacity-10"
                >
                  NEXT <ChevronRight size={16}/>
                </button>
              </div>
            </div>

            {/* View Settings */}
            <div className="space-y-3 pt-6 border-t border-white/5">
              <SidebarOption icon={Layout} label="Long Strip" active={readingMode === 'long-strip'} onClick={() => setReadingMode('long-strip')} />
              <SidebarOption icon={Columns} label="Single Page" active={readingMode === 'single-page'} onClick={() => setReadingMode('single-page')} />
              <SidebarOption icon={ArrowLeftRight} label="Fit Width" active={fitWidth} onClick={() => setFitWidth(!fitWidth)} />
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
};

const SidebarOption = ({ icon: Icon, label, active, onClick }: any) => (
  <button 
    onClick={onClick} 
    className={`w-full flex items-center justify-between px-5 py-4 bg-white/[0.02] rounded-2xl border transition-all duration-300 ${active ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.1)]' : 'border-white/5 text-gray-500 hover:text-white hover:bg-white/5'}`}
  >
    <span className="text-[10px] font-black uppercase tracking-widest">{label}</span>
    <Icon size={16} className={active ? 'text-emerald-500' : 'text-gray-600'} />
  </button>
);

export default Page;
