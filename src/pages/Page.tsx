import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ChevronLeft, Layout, Columns, Loader2, Play, 
  Check, Globe, Info, BookOpen, AlertCircle, ChevronDown,
  ChevronRight 
} from 'lucide-react';

const Page: React.FC = () => {
  const { mangaId, chapterId } = useParams();
  const navigate = useNavigate();
  
  const [apiChapters, setApiChapters] = useState<any[]>([]); // Actual chapters from API
  const [pages, setPages] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [mangaTitle, setMangaTitle] = useState("Loading...");
  const [currentChapterName, setCurrentChapterName] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [readingMode, setReadingMode] = useState<'long-strip' | 'single-page'>('long-strip');
  const [openDropdown, setOpenDropdown] = useState<'chapter' | null>(null);

  const scrollRef = useRef<HTMLDivElement>(null);
  const pageRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const fetchReaderData = async () => {
      if (!mangaId || !chapterId) return;
      setLoading(true);
      try {
        const proxyBase = "/gomanga-api/api";
        const res = await fetch(`${proxyBase}/manga/${mangaId}/${chapterId}`);
        const data = await res.json();
        
        const infoRes = await fetch(`${proxyBase}/manga/${mangaId}`);
        const infoData = await infoRes.json();

        setPages(data.imageUrls || []);
        setApiChapters(infoData.chapters || []); 
        setMangaTitle(infoData.title || "Manga Online");
        setCurrentChapterName(data.title || `Chapter ${chapterId}`);
        
        setCurrentPage(1);
        if (scrollRef.current) scrollRef.current.scrollTop = 0;
      } catch (e) {
        console.error("Reader Error:", e);
        setPages([]); // Show error state
      } finally {
        setLoading(false);
      }
    };
    fetchReaderData();
  }, [mangaId, chapterId]);

  // --- GENERATE SEQUENTIAL CHAPTER LIST ---
  // 1. Find the highest chapter number in the API list
  const maxChapter = apiChapters.length > 0 
    ? Math.max(...apiChapters.map(c => parseFloat(c.chapterId) || 0)) 
    : parseFloat(chapterId || "0");

  // 2. Create an array from Max down to 1
  const fullChapterList = [];
  for (let i = Math.floor(maxChapter); i >= 1; i--) {
    // Check if we have real API data for this number
    const realData = apiChapters.find(c => parseFloat(c.chapterId) === i);
    fullChapterList.push(realData || { chapterId: i.toString(), isMissing: true });
  }

  // --- NAVIGATION & PROGRESS ---
  const currentNum = parseFloat(chapterId || "1");
  
  const nextChapterId = (currentNum + 1) <= maxChapter ? (currentNum + 1).toString() : null;
  const prevChapterId = (currentNum - 1) >= 1 ? (currentNum - 1).toString() : null;

  // Fix Progress: (Current Chapter / Total Chapters)
  const progressPercent = (currentNum / maxChapter) * 100;

  const navigateToChapter = (id: string) => {
    setOpenDropdown(null);
    navigate(`/read/${mangaId}/chapter/${id}`);
  };

  return (
    <div className="flex h-screen w-full bg-[#050506] text-white overflow-hidden font-sans">
      
      <main className="flex-1 flex flex-col relative overflow-hidden bg-black">
        <header className="h-14 border-b border-white/5 bg-[#0a0a0b]/90 backdrop-blur-md flex items-center justify-between px-6 z-50">
           <button onClick={() => navigate(`/`)} className="text-gray-400 hover:text-emerald-500 transition-colors">
             <ChevronLeft size={20}/>
           </button>
           <div className="flex items-center gap-2">
               <span className="text-[14px] font-black tracking-tighter uppercase hidden sm:block">
                 MANGA<span className="text-emerald-500">VEL</span>
               </span>
           </div>
           <button onClick={() => setReadingMode(readingMode === 'long-strip' ? 'single-page' : 'long-strip')} className="text-gray-400 hover:text-white p-2 bg-white/5 rounded-lg">
             {readingMode === 'long-strip' ? <Layout size={18}/> : <Columns size={18}/>}
           </button>
        </header>

        <div ref={scrollRef} className="flex-1 overflow-y-auto thin-scroll scroll-smooth bg-black">
          {loading ? (
            <div className="h-full flex flex-col items-center justify-center gap-4">
               <Loader2 className="animate-spin text-emerald-500" size={32}/>
               <span className="text-[10px] font-black uppercase tracking-widest text-gray-500 italic">Downloading...</span>
            </div>
          ) : (
            <div className={`mx-auto ${readingMode === 'long-strip' ? 'max-w-3xl' : 'h-[90%] flex items-center justify-center'}`}>
               {pages.length > 0 ? (
                 pages.map((url, i) => (
                    <img key={i} src={url} className="w-full h-auto block" alt="" loading="lazy" />
                 ))
               ) : (
                 <div className="text-center p-20">
                   <AlertCircle className="mx-auto text-red-500 mb-4" size={48} />
                   <p className="text-gray-400 font-bold uppercase tracking-widest">
                     Chapter {chapterId} is currently unavailable on this source.
                   </p>
                 </div>
               )}
            </div>
          )}
        </div>

        {/* PROGRESS BAR FIXED */}
        <footer className="h-16 bg-[#0a0a0b] border-t border-white/5 flex items-center px-8 gap-8">
           <div className="min-w-[140px] flex flex-col">
              <span className="text-[8px] font-black text-gray-500 uppercase tracking-widest">Manga Progress</span>
              <span className="text-sm font-black italic text-emerald-500 tracking-tighter">
                CH {currentNum} / {Math.floor(maxChapter)}
              </span>
           </div>
           <div className="flex-grow h-1.5 bg-white/5 rounded-full overflow-hidden">
              <div 
                className="h-full bg-emerald-500 transition-all duration-700 shadow-[0_0_10px_#10b981]" 
                style={{ width: `${progressPercent}%` }} 
              />
           </div>
        </footer>
      </main>

      <aside className="w-80 h-full bg-[#0a0a0b] border-l border-white/5 flex flex-col p-6 shadow-2xl z-[60]">
        <div className="mb-8 text-center">
          <h2 className="text-[10px] font-black uppercase text-gray-600 mb-1 italic tracking-widest">Now Reading</h2>
          <h1 className="text-lg font-bold leading-tight line-clamp-2">{mangaTitle}</h1>
        </div>

        <div className="space-y-4 flex-grow overflow-y-auto thin-scroll pr-2">
          <div className="space-y-2 relative">
             <label className="text-[10px] font-black uppercase text-gray-600 tracking-widest">Select Chapter</label>
             
             <button 
               onClick={() => setOpenDropdown(openDropdown === 'chapter' ? null : 'chapter')}
               className="w-full flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/10"
             >
                <span className="text-sm font-bold truncate">Chapter {chapterId}</span>
                <ChevronDown size={18} />
             </button>

             {/* NAVIGATION BUTTONS */}
             <div className="grid grid-cols-2 gap-2">
                <button 
                  disabled={!prevChapterId}
                  onClick={() => prevChapterId && navigateToChapter(prevChapterId)}
                  className="flex items-center justify-center gap-2 p-3 bg-white/5 rounded-xl border border-white/5 text-[10px] font-black uppercase hover:bg-emerald-500/10 disabled:opacity-10 transition-all"
                >
                  <ChevronLeft size={14}/> Prev
                </button>
                <button 
                  disabled={!nextChapterId}
                  onClick={() => nextChapterId && navigateToChapter(nextChapterId)}
                  className="flex items-center justify-center gap-2 p-3 bg-white/5 rounded-xl border border-white/5 text-[10px] font-black uppercase hover:bg-emerald-500/10 disabled:opacity-10 transition-all"
                >
                  Next <ChevronRight size={14}/>
                </button>
             </div>

             {/* COMPLETE SEQUENTIAL DROPDOWN */}
             {openDropdown === 'chapter' && (
               <div className="absolute top-full left-0 w-full mt-2 bg-[#121214] border border-white/10 rounded-2xl shadow-2xl z-[100] max-h-80 overflow-y-auto thin-scroll">
                  {fullChapterList.map((ch, index) => (
                    <button 
                      key={index}
                      onClick={() => navigateToChapter(ch.chapterId)}
                      className={`w-full text-left p-4 text-xs font-bold hover:bg-emerald-600/10 flex items-center justify-between ${chapterId === ch.chapterId ? 'text-emerald-400 bg-emerald-600/5' : 'text-gray-400'}`}
                    >
                      <span className={ch.isMissing ? 'opacity-30' : ''}>
                        Chapter {ch.chapterId} {ch.isMissing && '(N/A)'}
                      </span>
                      {chapterId === ch.chapterId && <Check size={14}/>}
                    </button>
                  ))}
               </div>
             )}
          </div>

          <div className="p-4 bg-white/5 rounded-2xl border border-white/10 flex items-center justify-between">
             <div className="flex items-center gap-3">
               <BookOpen size={16} className="text-emerald-500"/>
               <span className="text-xs font-bold">Page {currentPage} / {pages.length}</span>
             </div>
          </div>
          
          <button onClick={() => navigate(`/manga/${mangaId}`)} className="w-full flex items-center gap-3 p-4 bg-white/5 rounded-2xl text-xs font-bold text-gray-400 hover:text-emerald-500 transition-colors">
            <Info size={16}/> Manga Detail
          </button>
        </div>
      </aside>

      <style>{`
        .thin-scroll::-webkit-scrollbar { width: 4px; }
        .thin-scroll::-webkit-scrollbar-thumb { background: #10b981; border-radius: 10px; }
      `}</style>
    </div>
  );
};

export default Page;