import { useEffect, useState } from "react";
import { API_BASE_URL, ADMIN_BASE_URL } from "../config";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";

import "swiper/css";
import "swiper/css/pagination";

const BeforeAfterImpact = () => {
  const [impactData, setImpactData] = useState([]);
  const [loading, setLoading] = useState(true);

  const getFullUrl = (path) => {
    if (!path) return "https://via.placeholder.com/1200x600?text=SDF+Impact";
    if (path.startsWith("https") || path.startsWith("http")) return path;
    const rootDomain = ADMIN_BASE_URL.split("/backend/admin")[0].replace(
      /\/+$/,
      "",
    );
    return `${rootDomain}/backend/admin/${path.replace(/^\/+/, "")}`;
  };

  useEffect(() => {
    const fetchImpactData = async () => {
      try {
        const response = await fetch(
          `${API_BASE_URL}/get_dual_images.php?t=${Date.now()}`,
        );
        const result = await response.json();
        if (result.status === "success") {
          setImpactData(result.data || []);
        }
      } catch (error) {
        console.error("Error loading impact sections:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchImpactData();
  }, []);

  if (loading) {
    return (
      <div className="py-20 text-center text-[#6a752b] font-bold animate-pulse">
        Loading Impact Gallery...
      </div>
    );
  }

  if (impactData.length === 0) return null;

  return (
    <section className="py-12 bg-[#F8F7F3] relative overflow-hidden">
      
      <style>{`
        .before-after-slider-wrapper .swiper-pagination-bullet-active {
          background: #6a752b !important;
          width: 24px;
          border-radius: 4px;
        }
        .before-after-slider-wrapper .swiper-pagination {
          bottom: 20px !important;
        }
      `}</style>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative before-after-slider-wrapper">
        
        <div className="relative px-2">
          
          <button id="impact-prev-btn" className="absolute -left-4 md:-left-12 top-1/2 -translate-y-1/2 bg-white text-[#6a752b] hover:bg-[#6a752b] hover:text-white w-11 h-11 rounded-full shadow-lg border border-gray-100 flex items-center justify-center z-30 transition-all font-bold text-sm">
            ←
          </button>

          <button id="impact-next-btn" className="absolute -right-4 md:-right-12 top-1/2 -translate-y-1/2 bg-white text-[#6a752b] hover:bg-[#6a752b] hover:text-white w-11 h-11 rounded-full shadow-lg border border-gray-100 flex items-center justify-center z-30 transition-all font-bold text-sm">
            →
          </button>

          <Swiper
            modules={[Navigation, Pagination, Autoplay]}
            spaceBetween={30}
            slidesPerView={1}
            loop={impactData.length > 1}
            navigation={{
              prevEl: "#impact-prev-btn",
              nextEl: "#impact-next-btn",
            }}
            pagination={{ clickable: true }}
            autoplay={{ delay: 5000, disableOnInteraction: false }}
            className="pb-4 rounded-3xl w-full"
          >
            {impactData.map((item) => (
              <SwiperSlide key={item.id} className="p-1">
                <div className="w-full bg-white rounded-3xl overflow-hidden shadow-lg border border-gray-100 relative">
                  <img
                    src={getFullUrl(item.image_path)}
                    alt="SDF Impact Gallery"
                    className="w-full h-auto block object-contain"
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = "https://via.placeholder.com/1200x600?text=Image+Not+Found";
                    }}
                  />
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>

      </div>
    </section>
  );
};

export default BeforeAfterImpact;