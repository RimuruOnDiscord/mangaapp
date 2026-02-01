import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';

const Random: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const fetchRandom = async () => {
      try {
        const res = await fetch('https://api.jikan.moe/v4/random/manga');
        const data = await res.json();
        if (data.data?.mal_id) {
          navigate(`/read/${data.data.mal_id}`);
        }
      } catch (e) {
        navigate('/'); // Fallback to home if API fails
      }
    };
    fetchRandom();
  }, [navigate]);

  return (
    <div className="h-screen w-full flex flex-col items-center justify-center bg-[#050505]">
      <Loader2 className="animate-spin text-emerald-500 mb-4" size={48} />
      <h2 className="text-xl font-black italic tracking-tighter uppercase text-white">
        Picking <span className="text-emerald-500">Random</span> Manga...
      </h2>
    </div>
  );
};

export default Random;
