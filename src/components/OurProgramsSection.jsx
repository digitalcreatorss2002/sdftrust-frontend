import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { API_BASE_URL, ADMIN_BASE_URL } from "../config";
// Swiper Components और Modules
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Autoplay } from "swiper/modules";

import "swiper/css";

const OurProgramsSection = () => {
  const [programsList, setProgramsList] = useState([]);
  const [programsLoading, setProgramsLoading] = useState(true);
  const [programsError, setProgramsError] = useState(null);

  // FETCH PROGRAMS
  useEffect(() => {
    const fetchPrograms = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/programs.php?t=${new Date().getTime()}`);
        const data = await res.json();

        if (data.status === "success") {
          const latestProgramsFirst = [...data.data].reverse();
          setProgramsList(latestProgramsFirst);
        }
      } catch (err) {
        console.error("API Error:", err);
        setProgramsError(err.message || "Failed to fetch programs");
      } finally {
        setProgramsLoading(false);
      }
    };

    fetchPrograms();
  }, []);

  const getProgramImageUrl = (path) => {
    if (!path) return "https://via.placeholder.com/800x500?text=Image+Not+Found";
    if (path.startsWith("https") || path.startsWith("http")) return path;
    const base = ADMIN_BASE_URL ? ADMIN_BASE_URL.split("/backend/admin")[0].replace(/\/+$/, "") : "https://hrntechsolutions.com";
    return `${base}/backend/admin/${path.replace(/^\/+/, "")}`;
  };

  if (programsLoading) {
    return (
      <section className="py-10 bg-bg-color text-center">
        <p className="text-primary font-semibold animate-pulse">Loading programs...</p>
      </section>
    );
  }

  if (programsError) {
    return (
      <section className="py-10 bg-bg-color text-center">
        <p className="text-red-500 font-semibold">{programsError}</p>
      </section>
    );
  }

  if (programsList.length === 0) {
    return (
      <section className="py-10 bg-bg-color text-center">
        <p className="text-gray-500">No programs found.</p>
      </section>
    );
  }

  return (
    <section className="py-16 bg-bg-color overflow-hidden" id="programs-scroll-section">
      
      {/* ओरिजिनल कंटेनर अलाइनमेंट (max-w-7xl, px-4 जैसे पहले था) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <h2 className="text-3xl font-serif text-text-primary mb-12 text-center">
          Our Programs
        </h2>

        {/* 🔴 SLIDER WRAPPER - यह कंटेनर को छेड़े बिना केवल बटन्स को बाहर पोजीशन करेगा */}
        <div className="relative px-2">
          
          {/* 🟢 कस्टम आउटवर्ड लेफ्ट बटन */}
          <button id="prog-prev-btn" className="absolute -left-4 md:-left-12 top-1/2 -translate-y-1/2 bg-white text-[#6a752b] hover:bg-[#6a752b] hover:text-white w-11 h-11 rounded-full shadow-lg border border-gray-100 flex items-center justify-center z-30 transition-all font-bold text-sm">
            ←
          </button>

          {/* 🟢 कस्टम आउटवर्ड राइट बटन */}
          <button id="prog-next-btn" className="absolute -right-4 md:-right-12 top-1/2 -translate-y-1/2 bg-white text-[#6a752b] hover:bg-[#6a752b] hover:text-white w-11 h-11 rounded-full shadow-lg border border-gray-100 flex items-center justify-center z-30 transition-all font-bold text-sm">
            →
          </button>

          {/* स्वाइपर स्लाइडर मुख्य ग्रिड */}
          <Swiper
            modules={[Navigation, Autoplay]} 
            spaceBetween={24}
            loop={programsList.length > 4} 
            // कस्टम बटन्स को स्वाइपर से लिंक किया
            navigation={{
              prevEl: "#prog-prev-btn",
              nextEl: "#prog-next-btn",
            }}
            autoplay={{ 
              delay: 3000, 
              disableOnInteraction: false 
            }}
            className="w-full"
            breakpoints={{
              0: { slidesPerView: 1 },    
              640: { slidesPerView: 2 },  
              1024: { slidesPerView: 4 }  
            }}
          >
            {programsList.map((program, idx) => (
              <SwiperSlide key={program.id || idx} className="h-auto py-2 px-1">
                <div className="bg-white rounded-xl border border-gray-100 text-left hover:shadow-lg transition-all duration-300 overflow-hidden flex flex-col h-full">
                  
                  {/* Image Container */}
                  <div className="h-48 overflow-hidden relative">
                    <img
                      src={getProgramImageUrl(program.image_url)}
                      alt={program.title}
                      className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = "https://via.placeholder.com/800x500?text=Image+Not+Found";
                      }}
                    />
                  </div>

                  {/* Content Area */}
                  <div className="p-6 grow flex flex-col justify-between">
                    <div>
                      <h3 className="text-lg font-serif font-bold text-text-primary mb-2 leading-tight line-clamp-2 min-h-[3rem]">
                        {program.title}
                      </h3>

                      <p className="text-gray-500 text-sm mb-6 line-clamp-3">
                        {program.description}
                      </p>
                    </div>

                    <Link
                      to={`/programdetails/${program.slug}`}
                      className="bg-primary hover:bg-[#5a6425] text-white px-6 py-2 rounded-full font-medium text-xs transition-colors self-start inline-block shadow-sm mt-auto"
                    >
                      Learn More
                    </Link>
                  </div>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>

        {/* Bottom Navigation Button */}
        <div className="mt-10 text-center">
          <Link
            to="/programs"
            className="inline-block border border-primary text-primary hover:bg-primary hover:text-white px-8 py-3 rounded-full font-semibold transition-colors"
          >
            View All Programs
          </Link>
        </div>
      </div>
    </section>
  );
};

export default OurProgramsSection;