import React, { useEffect, useState } from "react";
import { API_BASE_URL, ADMIN_BASE_URL } from "../config";
// Swiper Components और Modules
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Autoplay } from "swiper/modules";

import "swiper/css";
import "swiper/css/navigation";

const PartnersOpportunitiesSlider = () => {
  const [fundsList, setFundsList] = useState([]);
  const [fundsLoading, setFundsLoading] = useState(true);

  // Fetch Data from API
  useEffect(() => {
    const fetchFundsData = async () => {
      try {
        const fundRes = await fetch(`${API_BASE_URL}/funds.php?t=${Date.now()}`);
        const fundData = await fundRes.json();
        if (fundData.status === "success") {
          setFundsList(fundData.data || []);
        }
      } catch (error) {
        console.error("Funds fetching error:", error);
      } finally {
        setFundsLoading(false);
      }
    };

    fetchFundsData();
  }, []);

  // HELPER FUNCTION: पीडीएफ फाइल का यूआरएल बनाने के लिए
  const getBackendFileUrl = (path) => {
    if (!path) return "";
    if (path.startsWith("https") || path.startsWith("http")) return path;
    
    const rootDomain = ADMIN_BASE_URL.split("/backend/admin")[0].replace(/\/+$/, "");
    const cleanPath = path.replace(/^\/+/, "");

    if (cleanPath.startsWith("backend/admin/")) {
      return `${rootDomain}/${cleanPath}`;
    }
    
    return `${rootDomain}/backend/admin/${cleanPath}`;
  };

  // केवल 'active' स्टेटस वाले फंड्स फ़िल्टर करें
  const activeFunds = fundsList.filter((fund) => fund.status === "active");

  if (fundsLoading) {
    return (
      <div className="py-16 text-center text-primary font-bold animate-pulse">
        Loading Opportunities...
      </div>
    );
  }

  if (activeFunds.length === 0) return null;

  return (
    <section className="py-12 bg-bg-color partners-funds-slider overflow-hidden">
      
      {/* स्वाइपर नेविगेशन बटन्स के लिए CSS */}
      <style>{`
        .partners-funds-slider .swiper-button-next,
        .partners-funds-slider .swiper-button-prev {
          color: #6a752b !important;
          background: rgba(255, 255, 255, 0.95);
          width: 40px;
          height: 40px;
          border-radius: 50%;
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
          top: 50%;
          transform: translateY(-50%);
          transition: all 0.3s ease;
        }
        
        .partners-funds-slider .swiper-button-prev {
          left: -20px !important; 
        }
        
        .partners-funds-slider .swiper-button-next {
          right: -20px !important;
        }

        @media (min-width: 1280px) {
          .partners-funds-slider .swiper-button-prev { left: -30px !important; }
          .partners-funds-slider .swiper-button-next { right: -30px !important; }
        }

        .partners-funds-slider .swiper-button-next:hover,
        .partners-funds-slider .swiper-button-prev:hover {
          background: #6a752b;
          color: #ffffff !important;
        }
        
        .partners-funds-slider .swiper-button-next:after,
        .partners-funds-slider .swiper-button-prev:after {
          font-size: 14px !important;
          font-weight: bold;
        }
        
        /* कम कार्ड होने पर सेंटर अलाइनमेंट के लिए फ़िक्स */
        .partners-funds-slider .swiper-wrapper {
          justify-content: ${activeFunds.length < 4 ? "center" : "flex-start"} !important;
        }
        
        .partners-funds-slider .swiper {
          overflow: visible !important;
        }
      `}</style>

      {/* 🔴 FIXED: साइज को max-w-8xl से कम करके max-w-7xl किया ताकि ये प्रेजेंस मैप और बाकी वेबसाइट की चौड़ाई से परफेक्ट मैच हो जाए */}
      <div className="max-w-7xl mx-auto px-10 sm:px-12 md:px-16 relative">
        
        {/* Header Section */}
        <div className="text-center mb-8">
          <span className="text-3xl mb-3 block animate-float">🌱</span>
          <h2 className="text-3xl font-serif text-text-primary mb-3">Partners (EOI/RFQ)</h2>
          <p className="text-gray-500 max-w-2xl mx-auto text-sm">
            Explore open procurement requests, expressions of interest, and call for proposals.
          </p>
        </div>

        {/* स्वाइपर स्लाइडर */}
        <Swiper
          modules={[Navigation, Autoplay]}
          spaceBetween={16} 
          loop={activeFunds.length > 4}
          navigation={activeFunds.length > 4} // अगर 4 से कम कार्ड हैं तो एरो बटन्स हाइड रहेंगे क्योंकि वे पहले से सेंटर में दिखेंगे
          autoplay={activeFunds.length > 4 ? { delay: 5000, disableOnInteraction: false } : false}
          className="w-full pb-2"
          breakpoints={{
            0: { slidesPerView: 1 },    
            640: { slidesPerView: 2 },  
            1024: { slidesPerView: 3 }, 
            1280: { slidesPerView: 4 }  
          }}
        >
          {activeFunds.map((fund, idx) => (
            // 🔴 FIXED: कम कार्ड्स होने पर चौड़ाई बिगड़ने से रोकने के लिए max-w सेट किया गया है
            <SwiperSlide key={fund.id || idx} className="h-auto p-1" style={{ maxWidth: activeFunds.length < 4 ? '300px' : '100%' }}>
              <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col h-full justify-between text-left">
                
                {/* शीर्ष भाग: टाइटल और पैराग्राफ */}
                <div className="flex flex-col gap-2 mb-4">
                  {/* Title */}
                  <h3 className="text-base font-bold text-primary font-serif leading-snug line-clamp-2 min-h-[1rem]">
                    {fund.title}
                  </h3>
                  
                  {/* Paragraph Description */}
                  <p className="text-gray-600 text-xs sm:text-sm leading-relaxed line-clamp-3 min-h-[2rem] whitespace-pre-line">
                    {fund.description}
                  </p>
                </div>

                {/* निचला भाग: एक्शन बटन */}
                <div className="mt-auto pt-1">
                  {fund.file_url ? (
                    <a
                      href={getBackendFileUrl(fund.file_url)}
                      target="_blank"
                      rel="noreferrer"
                      className="w-full bg-primary hover:bg-[#5a6425] text-white py-2 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all shadow-sm hover:shadow flex items-center justify-center gap-2"
                    >
                      <span>📄</span> View Document {fund.file_size && <span className="text-xs font-normal opacity-85">({fund.file_size})</span>}
                    </a>
                  ) : (
                    <div className="w-full bg-gray-50 border border-gray-100 text-gray-400 py-2 rounded-xl text-xs sm:text-sm font-medium text-center italic">
                      No Document Attached
                    </div>
                  )}
                </div>

              </div>
            </SwiperSlide>
          ))}
        </Swiper>

      </div>
    </section>
  );
};

export default PartnersOpportunitiesSlider;