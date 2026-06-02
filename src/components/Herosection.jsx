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
  if (path.startsWith('http')) return path;

  const rootDomain = ADMIN_BASE_URL.split('/backend/admin')[0].replace(/\/+$/, ""); 
  const cleanPath = path.replace(/^\/+/, ''); 
  
  return `${rootDomain}/backend/admin/${cleanPath}`;
};

function Herosection() {
  const [heroCards, setHeroCards] = useState([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const intervalRef = useRef(null);

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
    fetchHeroCard();
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

  return (
    <section className="relative bg-black overflow-hidden min-h-screen flex flex-col justify-between">
      
      {/* 🎥 VIDEO SECTION */}
      <div className="absolute inset-0 z-0 overflow-hidden bg-black">
        {activeVideo ? (
          <iframe
            key={activeVideo}
            className="absolute top-1/2 left-1/2 w-screen h-[56.25vw] min-h-screen min-w-[177.77vh] -translate-x-1/2 -translate-y-1/2 pointer-events-none"
            src={`https://www.youtube.com/embed/${activeVideo}?autoplay=1&mute=1&controls=0&loop=1&playlist=${activeVideo}&rel=0&modestbranding=1`}
            title="Banner Video"
            frameBorder="0"
            allow="autoplay; encrypted-media"
            allowFullScreen
          />
        ) : (
          <div className="absolute inset-0 bg-gray-900"></div>
        )}

        <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-transparent to-transparent"></div>
        <div className="absolute inset-0 bg-black/20"></div> 
      </div>

      {/* CONTENT */}
      <div className="relative z-10 w-[90%] mx-auto flex-grow flex items-center pt-32 pb-48">
        <div className="max-w-3xl text-white pl-4 md:pl-12">
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
            className="bg-[#635d0d] hover:bg-[#4e490a] transition-all hover:scale-105 px-10 py-4 rounded-full font-bold shadow-xl inline-block text-white text-lg"
          >
            Learn More →
          </Link>
        </div>
      </div>

      {/* 🔄 CAROUSEL THUMBNAILS - CURVE EFFECT FIXED */}
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

              // Curve dynamic alignment logic using Tailwind CSS classes
              let curveClasses = "";
              if (offset === 0) {
                // Center Active card: Upar utha hua, sidha aur bada border ke sath
                curveClasses = "w-28 md:w-56 border-2 md:border-4 border-yellow-400 opacity-100 scale-110 shadow-2xl z-40 translate-y-[-12px]";
              } else if (offset === -1) {
                // Left card: Thoda neeche dhasa hua aur left ki taraf tilted (-rotate)
                curveClasses = "w-24 md:w-44 opacity-60 scale-95 translate-y-[12px] -rotate-6 z-20 hover:opacity-90";
              } else if (offset === 1) {
                // Right card: Thoda neeche dhasa hua aur right ki taraf tilted (rotate)
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

      {/* WAVE SVG */}
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