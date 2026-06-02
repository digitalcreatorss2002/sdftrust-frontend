import { useEffect, useRef, useState } from "react";
import { API_BASE_URL, ADMIN_BASE_URL } from "../config";

function Testimonials() {
  const [testimonials, setTestimonials] = useState([]);
  const scrollRef = useRef();

  const getImageUrl = (path) => {
    if (!path) return "https://placehold.co/150x150?text=SDF";
    if (path.startsWith("https")) return path;

    const rootDomain = ADMIN_BASE_URL.split("/backend")[0].replace(/\/+$/, "");
    
    let cleanPath = path.replace(/^\/+/, "");
    
    if (cleanPath.startsWith("admin/")) {
      cleanPath = cleanPath.replace("admin/", "");
    }

    // फ़ाइनल यूआरएल स्ट्रक्चर: https://hrntechsolutions.com/backend/uploads/testimonials/filename.ext
    return `${rootDomain}/backend/${cleanPath}`;
  };

  // 1. Fetch data from PHP
  useEffect(() => {
    fetch(`${API_BASE_URL}/testimonial.php?t=${Date.now()}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.status === "success" && Array.isArray(data.data)) {
          setTestimonials(data.data);
        } else if (Array.isArray(data)) {
          setTestimonials(data);
        }
      })
      .catch((err) => console.error("Error loading stories:", err));
  }, []);

  // 2. Auto-Scroll Animation Logic
  useEffect(() => {
    const container = scrollRef.current;
    if (!container || testimonials.length === 0) return;

    let animationFrame;
    const speed = 0.5;

    const scroll = () => {
      container.scrollLeft += speed;
      // Restart scroll when it reaches the end
      if (container.scrollLeft + container.clientWidth >= container.scrollWidth - 1) {
        container.scrollLeft = 0;
      }
      animationFrame = requestAnimationFrame(scroll);
    };

    animationFrame = requestAnimationFrame(scroll);
    return () => cancelAnimationFrame(animationFrame);
  }, [testimonials]);

  return (
    <section className="py-10 bg-white">
      <div className="max-w-7xl mx-auto px-4 text-center">
        <h2 className="text-3xl font-serif mb-10">Stories of Impact</h2>
        
        <div 
          ref={scrollRef} 
          className="flex gap-6 overflow-x-auto no-scrollbar pb-8 cursor-grab active:cursor-grabbing"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {testimonials.map((item, index) => {
            const targetPath = item.image_url || item.image || "";
            const imgSrc = getImageUrl(targetPath);
            
            const displayMessage = item.message || item.message_text || "";

            return (
              <div 
                key={item.id || index} 
                className="min-w-[300px] md:min-w-[350px] bg-gray-50 p-6 rounded-2xl flex gap-4 text-left border border-gray-100 shadow-sm hover:shadow-md transition-shadow"
              >
                <img 
                  src={imgSrc} 
                  alt={item.name}
                  className="w-16 h-16 rounded-full object-cover shrink-0 border-2 border-primary/10" 
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = "https://placehold.co/150x150?text=No+User";
                  }}
                />
                <div>
                  <p className="text-sm italic mb-2 text-gray-600 line-clamp-4">"{displayMessage}"</p>
                  <h4 className="font-bold text-sm text-text-primary">{item.name}</h4>
                  <p className="text-[10px] uppercase font-bold text-primary tracking-wider">{item.title}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default Testimonials;