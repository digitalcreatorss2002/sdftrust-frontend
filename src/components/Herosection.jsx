import { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import { API_BASE_URL, ADMIN_BASE_URL } from "../config";

const getYoutubeId = (url) => {
  try {
    const parsed = new URL(url);
    if (parsed.hostname.includes("youtube.com")) {
      return parsed.searchParams.get("v");
    }
    if (parsed.hostname.includes("youtu.be")) {
      return parsed.pathname.slice(1);
    }
    return null;
  } catch {
    return null;
  }
};

const getMediaUrl = (path) => {
  if (!path) return "https://via.placeholder.com/150x100?text=No+Image";
  if (path.startsWith('https')) return path;

  const rootDomain = ADMIN_BASE_URL.split('/backend/admin')[0].replace(/\/+$/, ""); 
  const cleanPath = path.replace(/^\/+/, '');
  
  return `${rootDomain}/backend/admin/${cleanPath}`;
};

function Herosection() {
  const [heroCards, setHeroCards] = useState([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const intervalRef = useRef(null);

  const [fundsList, setFundsList] = useState([]);
  const [fundsLoading, setFundsLoading] = useState(true);

  useEffect(() => {
    const fetchHeroCard = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/hero.php?t=${Date.now()}`);
        const result = await res.json();
        if (result.status === "success" && Array.isArray(result.data)) {
          setHeroCards(result.data);
        }
      } catch (err) {
        console.error("Hero fetch error:", err);
      }
    };

    const fetchFundsData = async () => {
      try {
        const fundRes = await fetch(`${API_BASE_URL}/funds.php?t=${Date.now()}`);
        const fundData = await fundRes.json();
        if (fundData.status === "success" && Array.isArray(fundData.data)) {
          const activeOnly = fundData.data.filter(fund => fund.status === "active");
          setFundsList(activeOnly);
        }
      } catch (error) {
        console.error("Funds fetching error:", error);
      } finally {
        setFundsLoading(false);
      }
    };

    fetchHeroCard();
    fetchFundsData();
  }, []);

  useEffect(() => {
    if (heroCards.length === 0) return;
    intervalRef.current = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % heroCards.length);
    }, 10000);
    return () => clearInterval(intervalRef.current);
  }, [heroCards]);

  const handleMouseEnter = () => clearInterval(intervalRef.current);

  const handleMouseLeave = () => {
    intervalRef.current = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % heroCards.length);
    }, 10000);
  };

  const activeVideo = getYoutubeId(heroCards[activeIndex]?.youtube_link);

  const getRepeatedFunds = (data) => {
    if (data.length === 0) return [];
    if (data.length <= 4) return data; 
    return [...data, ...data]; 
  };

  const finalFundsToShow = getRepeatedFunds(fundsList);
  const shouldScroll = fundsList.length > 4;

  return (
    <section className="relative bg-black overflow-hidden min-h-screen flex flex-col justify-between">
      
      <style>{`
        @keyframes marqueeUp {
          0% { transform: translateY(0); }
          100% { transform: translateY(-50%); }
        }
        .animate-scroll-up {
          animation: marqueeUp 25s linear infinite;
        }
        .animate-scroll-up:hover {
          animation-play-state: paused;
        }
      `}</style>

      <div className="absolute inset-0 z-0 overflow-hidden bg-black">
        {activeVideo ? (
          <>
            <iframe
              key={activeVideo}
              className="absolute top-1/2 left-1/2 w-[130%] h-[56.25vw] min-h-screen min-w-[177.77vh] -translate-x-1/2 -translate-y-1/2 pointer-events-none select-none scale-110"
              src={`https://www.youtube.com/embed/${activeVideo}?autoplay=1&mute=1&controls=0&loop=1&playlist=${activeVideo}&rel=0&modestbranding=1&showinfo=0&iv_load_policy=3&disablekb=1&fs=0&autohide=1`}
              title="Banner Video"
              frameBorder="0"
              allow="autoplay; encrypted-media"
            />
            <div className="absolute inset-0 bg-transparent z-10 pointer-events-auto"></div>
          </>
        ) : (
          <div className="absolute inset-0 bg-gray-900"></div>
        )}
      </div>

      <div className="relative z-20 w-[90%] mx-auto flex-grow flex flex-col lg:flex-row items-center justify-between pt-32 pb-48 gap-8">
        
        <div className="w-full lg:w-[63%] text-white pl-4 md:pl-12">
          <div key={activeIndex} className="animate-fadeSlide">
            <h1 className="w-full text-4xl md:text-7xl font-bold mb-6 drop-shadow-[0_4px_12px_rgba(0,0,0,0.9)] bg-[linear-gradient(to_right,#eab308,#2c8fa3)] bg-clip-text text-transparent leading-tight">
              {heroCards[activeIndex]?.title || "Loading..."}
            </h1>

            <p className="mb-10 text-white drop-shadow-[0_2px_8px_rgba(0,0,0,1)] text-lg md:text-xl leading-relaxed font-medium max-w-2xl">
              {heroCards[activeIndex]?.description || ""}
            </p>
          </div>

          <Link
            to="/about"
            className="bg-primary hover:bg-[#5a6425] transition-all hover:scale-105 px-10 py-4 rounded-full font-bold shadow-xl inline-block text-white text-lg"
          >
            Learn More →
          </Link>
        </div>

        <div className="w-full lg:w-[32%] xl:max-w-[250px] shrink-0">
          <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-4 shadow-2xl text-white overflow-hidden">
            
            <h3 className="text-base font-bold font-serif mb-3 flex items-center gap-2 text-white border-b border-white/20 pb-2 drop-shadow-sm">
              <span>🌱</span> Open Procurement (EOI/RFQ)
            </h3>

            <div className={`relative h-[360px] ${shouldScroll ? 'overflow-hidden' : 'overflow-y-auto pr-1'} rounded-xl bg-black/20`}>
              {fundsLoading ? (
                <div className="text-center py-12 text-sm text-gray-200 animate-pulse">Loading listings...</div>
              ) : finalFundsToShow.length > 0 ? (
                <div className={`flex flex-col gap-3 ${shouldScroll ? 'animate-scroll-up' : ''}`}>
                  {finalFundsToShow.map((fund, idx) => (
                    <Link
                      key={`scroll-${fund.id}-${idx}`}
                      to="/get-involved#funds"
                      className="block p-4 rounded-xl bg-white/10 hover:bg-white/20 border border-white/10 hover:border-white/30 transition-all duration-300 group shadow-md shrink-0"
                    >
                      <div className="flex flex-col gap-1">
                        <h4 className="text-xs sm:text-sm font-bold text-green-300 group-hover:text-primary transition-colors line-clamp-1 drop-shadow-sm">
                          {fund.title}
                        </h4>
                        <p className="text-[11px] sm:text-xs text-gray-100 line-clamp-2 leading-relaxed font-medium">
                          {fund.description}
                        </p>
                        <div className="flex justify-between items-center mt-1 pt-1 border-t border-white/10 text-[9px] text-gray-300">
                          <span>Procurement Update</span>
                          <span className="text-white font-semibold uppercase tracking-wider">Active</span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-xs text-gray-300 italic">
                  No active updates available.
                </div>
              )}
            </div>
          </div>
        </div>

      </div>

      <div
        className="absolute bottom-15 left-0 w-full z-30 flex justify-center items-center"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <div className="flex items-end justify-center gap-6 md:gap-16 w-full px-4 min-h-[100px]">
          {heroCards.length > 0 &&
            [-1, 0, 1].map((offset) => {
              const index =
                (activeIndex + offset + heroCards.length) % heroCards.length;
              const card = heroCards[index];

              let curveClasses = "";
              if (offset === 0) {
                curveClasses = "w-28 md:w-56 border-2 md:border-4 border-yellow-400 opacity-100 scale-110 shadow-2xl z-40 translate-y-[-12px]";
              } else if (offset === -1) {
                curveClasses = "w-24 md:w-44 opacity-60 scale-95 translate-y-[12px] -rotate-6 z-20 hover:opacity-90";
              } else if (offset === 1) {
                curveClasses = "w-24 md:w-44 opacity-60 scale-95 translate-y-[12px] rotate-6 z-20 hover:opacity-90";
              }

              return (
                <div
                  key={`${index}-${offset}`}
                  onClick={() => setActiveIndex(index)}
                  className={`cursor-pointer transition-all duration-500 ease-out rounded-xl overflow-hidden bg-black/40 backdrop-blur-sm ${curveClasses}`}
                >
                  <img
                    src={getMediaUrl(card?.image_url)}
                    alt={card?.title || "Thumbnail"}
                    className="w-full aspect-video object-cover"
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src =
                        "https://via.placeholder.com/150x100?text=No+Image";
                    }}
                  />
                </div>
              );
            })}
        </div>
      </div>

      <div className="absolute bottom-0 w-full overflow-hidden leading-none z-10 pointer-events-none">
        <svg
          className="w-full h-16 md:h-24 lg:h-28"
          viewBox="0 0 1440 320"
          preserveAspectRatio="none"
        >
          <path
            fill="#F9F6EA"
            d="M0,160 L48,176 C96,192,192,224,288,218.7C384,213,480,171,576,149.3C672,128,768,128,864,149.3C960,171,1056,213,1152,218.7C1248,224,1344,192,1392,176L1440,160L1440,320L0,320Z"
          />
        </svg>
      </div>
    </section>
  );
}

export default Herosection;