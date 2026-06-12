import { useEffect, useState } from "react";
import { API_BASE_URL, ADMIN_BASE_URL } from "../config";
// Swiper Components और Modules
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";

import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

const BeforeAfterImpact = () => {
  const [impactData, setImpactData] = useState([]);
  const [loading, setLoading] = useState(true);

  // एडमिन पैनल पाथ से इमेज का फुल URL निकालने का हेल्पर फ़ंक्शन
  const getFullUrl = (path) => {
    if (!path) return "https://via.placeholder.com/600x400?text=SDF+Impact";
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
        Loading Impact Stories...
      </div>
    );
  }

  if (impactData.length === 0) return null;

  return (
    <section className="py-16 bg-[#F8F7F3] relative before-after-slider">
      <style>{`
        .before-after-slider .swiper-button-next,
        .before-after-slider .swiper-button-prev {
          color: #6a752b !important;
          background:transparent;
          width: 20px;
          height: 50px;
          border-radius: 50%;
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
          transition: all 0.3s ease;
        }
        .before-after-slider .swiper-button-next:hover,
        .before-after-slider .swiper-button-prev:hover {
        //   background: #6a752b;
          color: #ffffff !important;
        }
        .before-after-slider .swiper-button-next:after,
        .before-after-slider .swiper-button-prev:after {
          font-size: 18px !important;
          font-weight: bold;
        }
        .before-after-slider .swiper-pagination-bullet-active {
          background: #6a752b !important;
          width: 24px;
          border-radius: 4px;
        }
      `}</style>

      {/* चौड़ाई max-w-8xl पर है और एरो के लिए पर्याप्त पैडिंग दी गई है */}
      <div className="max-w-8xl mx-auto px-4 sm:px-12 md:px-16">
        {/* स्वाइपर कॉन्फ़िगरेशन */}
        <Swiper
          modules={[Navigation, Pagination, Autoplay]}
          spaceBetween={50}
          slidesPerView={1}
          loop={impactData.length > 1}
          navigation={true}
          pagination={{ clickable: true }}
          autoplay={{ delay: 6000, disableOnInteraction: false }}
          className="pb-16 rounded-3xl"
        >
          {impactData.map((item) => {
            const img1Paragraphs = [
              item.img1_p1,
              item.img1_p2,
              item.img1_p3,
              item.img1_p4,
            ].filter(Boolean);
            const img2Paragraphs = [
              item.img2_p1,
              item.img2_p2,
              item.img2_p3,
              item.img2_p4,
            ].filter(Boolean);

            return (
              <SwiperSlide key={item.id} className="p-1">
                <div className="w-full bg-white rounded-3xl overflow-hidden shadow-xl border border-gray-100 flex flex-col relative">
                  {/* TOP HEADER */}
                  <div className="bg-[#6F7C2E] text-white py-5 px-6 text-center shadow-md">
                    <h2 className="text-xl sm:text-3xl font-bold font-serif uppercase tracking-wide">
                      {item.title || "Our Transformation Project"}
                    </h2>
                  </div>

                  {/* IMAGES AREA (रो को सापेक्ष बनाकर लोगो को इमेज के निचले हिस्से पर लॉक किया गया है) */}
                  <div className="grid grid-cols-1 md:grid-cols-2 relative">
                    {/* वाम पक्ष (LEFT: BEFORE SECTION) */}
                    <div className="flex flex-col border-b md:border-b-0 md:border-r border-gray-200">
                      {/* इमेज कंटेनर */}
                      <div className="relative aspect-[4/3] w-full overflow-hidden">
                        <span className="absolute right-4 bg-[#6F7C2E] text-white text-xs sm:text-sm font-bold px-6 py-1.5 rounded-full shadow-md z-10 tracking-wider">
                          BEFORE
                        </span>
                        <img
                          src={getFullUrl(item.image_one)}
                          alt="Condition Before Intervention"
                          className="w-full h-full object-cover"
                        />
                      </div>

                      {/* पैराग्राफ्स */}
                      <div className="p-6 md:p-8 bg-[#FAFAFA] flex-grow pt-10">
                        <ul className="space-y-3">
                          {img1Paragraphs.map((p, idx) => (
                            <li
                              key={`p1-${idx}`}
                              className="flex items-start gap-2.5 text-[#6F7C2E] font-medium text-sm md:text-base"
                            >
                              <span className="text-[#6F7C2E] text-lg leading-none select-none">
                                •
                              </span>
                              <span>{p}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    <div className="flex flex-col">
                      <div className="relative aspect-[4/3] w-full overflow-hidden">
                        <span className="absolute right-4 bg-[#6F7C2E] text-white text-xs sm:text-sm font-bold px-6 py-1.5 rounded-full shadow-md z-10 tracking-wider">
                          AFTER
                        </span>
                        <img
                          src={getFullUrl(item.image_two)}
                          alt="Condition After Intervention"
                          className="w-full h-full object-cover"
                        />
                      </div>

                      {/* पैराग्राफ्स */}
                      <div className="p-6 md:p-8 bg-[#F4F9F4] flex-grow pt-10">
                        <ul className="space-y-3">
                          {img2Paragraphs.map((p, idx) => (
                            <li
                              key={`p2-${idx}`}
                              className="flex items-start gap-2.5 text-[#6F7C2E] font-medium text-sm md:text-base"
                            >
                              <span className="text-[#6F7C2E] text-lg leading-none select-none">
                                •
                              </span>
                              <span>{p}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    <div className="absolute hidden md:flex left-1/2 top-[calc(75.14%-40px)] -translate-x-1/2 -translate-y-1/2 z-20">
                      <div className="w-20 h-20 bg-white rounded-full p-2 shadow-xl border border-gray-100 flex items-center justify-center">
                        <img
                          src="logo/logo.png"
                          alt="SDF Logo"
                          className="w-full h-auto object-contain"
                          onError={(e) => {
                            e.currentTarget.src = "🌱";
                            e.currentTarget.className = "text-3xl";
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </SwiperSlide>
            );
          })}
        </Swiper>
      </div>
    </section>
  );
};

export default BeforeAfterImpact;
