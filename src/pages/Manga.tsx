import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ChevronLeft, Star, Tag, Loader2, Play
} from 'lucide-react';

const Manga: React.FC = () => {
  const { mangaId } = useParams<{ mangaId: string }>();
  const navigate = useNavigate();
  const [data, setData] = useState<any>(null); // Jikan Data
  const [gomangaData, setGomangaData] = useState<any>(null); // Gomanga API Data
  const [loading, setLoading] = useState(true);
  const [isLinking, setIsLinking] = useState(false);

  const GOMANGA_BASE = "https://gomanga-api.vercel.app/api";

  useEffect(() => {
// Inside Manga.tsx
const fetchMangaDetails = async () => {
  try {
    setLoading(true);
    
    // 1. Jikan API usually allows CORS, so keep it as is
    const res = await fetch(`https://api.jikan.moe/v4/manga/${mangaId}/full`);
    const json = await res.json();
    setData(json.data);

    // 2. USE THE VITE PROXY FOR GOMANGA
    // We fetch from "/gomanga-api" which Vite redirects to the real server
    if (json.data) {
      const searchRes = await fetch(`/gomanga-api/api/search/${encodeURIComponent(json.data.title)}`);
      const searchData = await searchRes.json();
      
      if (searchData.manga && searchData.manga.length > 0) {
        const match = searchData.manga[0];
        const detailRes = await fetch(`/gomanga-api/api/manga/${match.id}`);
        const detailData = await detailRes.json();
        setGomangaData(detailData);
      }
    }
  } catch (err) {
    console.error("Error fetching manga:", err);
  } finally {
    setLoading(false);
  }
};

    fetchMangaDetails();
    window.scrollTo(0, 0);
  }, [mangaId]);

const handleStartReading = async () => {
  setIsLinking(true);
  try {
    const proxyBase = "/gomanga-api/api";
    
    // Search using the proxy
    const searchRes = await fetch(`${proxyBase}/search/${encodeURIComponent(data.title)}`);
    const searchData = await searchRes.json();
    
    if (searchData.manga && searchData.manga.length > 0) {
      const bestMatch = searchData.manga[0];
      // Navigate to reader using the ID found in Gomanga
      // This ensures the reader gets the correct ID for the URL
      navigate(`/read/${bestMatch.id}/chapter/1`); 
    }
  } catch (err) {
    console.error(err);
  } finally {
    setIsLinking(false);
  }
};

  if (loading) return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center">
      <div className="w-10 h-10 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (!data) return <div className="min-h-screen bg-[#050505] flex items-center justify-center text-white">Manga not found.</div>;

  return (
    <div className="relative min-h-screen bg-[#050505] text-white pb-20">
      {/* BACKGROUND BLUR */}
      <div className="absolute top-0 left-0 w-full h-[70vh] overflow-hidden pointer-events-none">
        <img 
          src={data.images.jpg.large_image_url} 
          className="w-full h-full object-cover blur-3xl opacity-20 scale-110"
          alt="" 
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/80 to-transparent" />
      </div>

      <div className="relative z-10 container mx-auto px-4 pt-8">
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 rounded-full transition-all border border-white/5 mb-8 group"
        >
          <ChevronLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
          <span className="text-sm font-bold uppercase tracking-widest">Back</span>
        </button>

        <div className="flex flex-col lg:flex-row gap-12">
          
          <div className="w-full lg:w-80 flex-shrink-0">
            <div className="sticky top-24 space-y-6">
              <div className="aspect-[2/3] rounded-3xl overflow-hidden shadow-2xl border border-white/10 ring-1 ring-emerald-500/20">
                <img 
                  src={data.images.jpg.large_image_url} 
                  className="w-full h-full object-cover" 
                  alt={data.title} 
                />
              </div>
              
              <button 
                onClick={handleStartReading}
                disabled={isLinking}
                className={`w-full py-4 rounded-2xl font-black transition-all flex items-center justify-center gap-2 shadow-lg ${
                  isLinking ? 'bg-gray-700 cursor-not-allowed' : 'bg-emerald-600 hover:bg-emerald-500'
                }`}
              >
                {isLinking ? (
                  <Loader2 className="animate-spin" size={20} />
                ) : (
                  <><Play size={20} fill="currentColor" /> START READING</>
                )}
              </button>
            </div>
          </div>

          <div className="flex-grow pt-4">
            <div className="space-y-6">
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-1 bg-yellow-500/10 text-yellow-500 px-3 py-1 rounded-lg border border-yellow-500/20">
                   <Star size={16} fill="currentColor" />
                   <span className="font-black">{data.score || 'N/A'}</span>
                </div>
                <span className="text-gray-500 font-bold uppercase text-sm">{data.type}</span>
                <span className="text-emerald-500 font-bold uppercase text-sm">{data.status}</span>
              </div>

              <h1 className="text-5xl md:text-7xl font-black uppercase italic tracking-tighter leading-[0.9] text-transparent bg-clip-text bg-gradient-to-b from-white to-gray-400">
                {data.title}
              </h1>

              <div className="flex items-center gap-2 text-gray-400">
                <Tag size={16} className="text-emerald-500" />
                <span className="font-bold uppercase tracking-widest text-xs">
                  {data.authors?.map((a: any) => a.name).join(', ')}
                </span>
              </div>

              <div className="max-w-3xl">
                <p className="text-gray-400 leading-relaxed text-lg font-medium italic mb-4">
                    {gomangaData ? `Last Updated: ${gomangaData.lastUpdated}` : 'Searching Gomanga...'}
                </p>
                <h3 className="text-emerald-500 font-black uppercase tracking-widest text-xs mb-3">Synopsis</h3>
                <p className="text-gray-400 leading-relaxed text-lg font-medium line-clamp-6 hover:line-clamp-none transition-all">
                  {data.synopsis}
                </p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-8 bg-white/5 border border-white/5 rounded-[2rem] backdrop-blur-md">
                <div className="space-y-1 text-center md:text-left">
                  <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Chapters</p>
                  {/* USE GOMANGA DATA LENGTH HERE */}
                  <p className="text-2xl font-black text-emerald-500">
                    {gomangaData ? gomangaData.chapters.length : (data.chapters || '??')}
                  </p>
                </div>
                <div className="space-y-1 text-center md:text-left border-l border-white/10 md:pl-6">
                  <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Views (API)</p>
                  <p className="text-2xl font-black">{gomangaData ? gomangaData.views : 'N/A'}</p>
                </div>
                <div className="space-y-1 text-center md:text-left border-l border-white/10 md:pl-6">
                  <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Popularity</p>
                  <p className="text-2xl font-black">#{data.popularity}</p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                {data.genres?.map((genre: any) => (
                  <span key={genre.mal_id} className="px-5 py-2 bg-white/5 border border-white/10 rounded-full text-sm font-bold transition-all">
                    {genre.name}
                  </span>
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