import { useEffect, useState } from "react";
import { API_BASE_URL, ADMIN_BASE_URL } from "../config";

const PublicPartnersSection = () => {
  const [publicPartners, setPublicPartners] = useState([]);
  const [loading, setLoading] = useState(true);

  // ✅ FIXED: ब्लूहोस्ट लाइव सर्वर के सटीक 'backend/uploads/' पाथ स्ट्रक्चर के लिए परफेक्ट हेल्पर फ़ंक्शन
  const getImageUrl = (path) => {
    if (!path) return "https://placehold.co/150x150?text=No+Logo";
    if (path.startsWith("http")) return path;

    // ADMIN_BASE_URL (https://hrntechsolutions.com/backend/admin) से '/backend' तक का रूट निकालना
    const rootDomain = ADMIN_BASE_URL.split("/backend")[0].replace(/\/+$/, "");
    
    // पाथ के शुरुआत के स्लैश को साफ करना
    let cleanPath = path.replace(/^\/+/, "");
    
    // अगर बैकएंड पाथ में 'admin/' लगा हुआ आ रहा है, तो उसे हटाएं क्योंकि फ़ाइलें सीधे backend/uploads/ में हैं
    if (cleanPath.startsWith("admin/")) {
      cleanPath = cleanPath.replace("admin/", "");
    }

    // फ़ाइनल यूआरएल स्ट्रक्चर: https://hrntechsolutions.com/backend/uploads/public_partners/filename.ext
    return `${rootDomain}/backend/${cleanPath}`;
  };

  // Fetch only public partners matching your exact database schema
  useEffect(() => {
    fetch(`${API_BASE_URL}/public_partners.php?t=${Date.now()}`)
      .then((res) => {
        if (!res.ok) throw new Error("Network response was not ok");
        return res.json();
      })
      .then((resData) => {
        // Handles both structured formats safely
        if (resData.status === "success" && Array.isArray(resData.data)) {
          setPublicPartners(resData.data);
        } else if (Array.isArray(resData)) {
          setPublicPartners(resData);
        }
      })
      .catch((err) => console.error("Error loading public partners:", err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="py-12 text-center text-gray-500 bg-gray-50 font-serif">
        Loading supporters data...
      </div>
    );
  }

  // Hide container natively if database collection contains no objects
  if (publicPartners.length === 0) return null;

  return (
    <section className="py-20 bg-gray-50" id="public-partners">
      <div className="max-w-7xl mx-auto px-6 text-center">
        {/* Main Reference Standard Header Section */}
        <h2 className="text-4xl font-serif mb-16 text-gray-900 tracking-wide font-medium">
          Our Public Partners & Supporters
        </h2>

        {/* PREMIUM DESIGN GRID: Aligned layout structure */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
          {publicPartners.map((partner, index) => {
            // Dynamic Key Check: Checks for both 'image_url' and alternative 'img' columns
            const targetPath = partner.image_url || partner.img || "";
            const imgSrc = getImageUrl(targetPath);

            return (
              <a
                key={partner.id || index}
                href={partner.link && partner.link !== "#" ? partner.link : undefined}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-white rounded-3xl p-6 shadow-[0_4px_25px_rgba(0,0,0,0.03)] hover:shadow-[0_10px_30px_rgba(0,0,0,0.08)] border border-gray-100 flex flex-col items-center justify-between transition-all duration-300 ease-in-out hover:-translate-y-1.5 group aspect-[4/5.2]"
              >
                {/* Image Container Wrapper ensuring square ratio scale box with increased min-height */}
                <div className="w-full flex-1 flex items-center justify-center min-h-[120px] mb-4">
                  <img
                    src={imgSrc}
                    alt={partner.title || "Public Partner"}
                    className="max-w-full max-h-[95px] object-contain transition-transform duration-500 group-hover:scale-105"
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = "https://placehold.co/150x150?text=No+Logo";
                    }}
                  />
                </div>
                
                {/* Title Text Area matching clean grey typography */}
                <p className="text-sm font-serif font-semibold text-gray-700 text-center leading-snug tracking-tight group-hover:text-primary transition-colors line-clamp-3 w-full px-1">
                  {partner.title}
                </p>
              </a>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default PublicPartnersSection;