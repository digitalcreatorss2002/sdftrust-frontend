import { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { API_BASE_URL, ADMIN_BASE_URL } from "../config";

const PressCoverageDetails = () => {
  const { slug } = useParams();

  const [coverage, setCoverage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [activePreviewImage, setActivePreviewImage] = useState("");

  const [selectedImage, setSelectedImage] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  const getImageUrl = (path) => {
    if (!path) return null;
    if (path.startsWith('https') || path.startsWith('http')) return path;

    const rootDomain = ADMIN_BASE_URL.split('/backend/admin')[0].replace(/\/+$/, ""); 
    const cleanPath = path.replace(/^\/+/, ''); 
    
    return `${rootDomain}/backend/admin/${cleanPath}`;
  };

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    const fetchCoverage = async () => {
      try {
        const response = await fetch(
          `${API_BASE_URL}/press_coverage.php?t=${Date.now()}`
        );

        if (!response.ok) {
          throw new Error("Failed to fetch press coverage details");
        }

        const data = await response.json();

        if (data.status !== "success") {
          throw new Error(data.message || "Could not load coverage data");
        }

        const foundCoverage = data.data.find((item) => item.slug === slug);

        if (!foundCoverage) {
          throw new Error("Coverage not found");
        }

        let galleryImages = [];
        
        for (let i = 1; i <= 5; i++) {
          const rawPath = foundCoverage[`image${i}`];
          const validUrl = getImageUrl(rawPath);
          if (validUrl) {
            galleryImages.push(validUrl);
          }
        }

        if (galleryImages.length === 0) {
          galleryImages.push("https://via.placeholder.com/1200x800?text=No+Image");
        }

        const baseFeatureImage = galleryImages[0];

        setCoverage({
          ...foundCoverage,
          mainImage: baseFeatureImage,
          images: galleryImages,
        });

        setActivePreviewImage(baseFeatureImage);

      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCoverage();
  }, [slug]);

  const openModal = (img, index) => {
    setSelectedImage(img);
    setCurrentIndex(index);
  };

  const closeModal = () => {
    setSelectedImage(null);
  };

  const nextImage = () => {
    const nextIndex = (currentIndex + 1) % coverage.images.length;
    setSelectedImage(coverage.images[nextIndex]);
    setCurrentIndex(nextIndex);
  };

  const prevImage = () => {
    const prevIndex =
      (currentIndex - 1 + coverage.images.length) %
      coverage.images.length;
    setSelectedImage(coverage.images[prevIndex]);
    setCurrentIndex(prevIndex);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 font-bold text-primary animate-pulse">
        Loading Press Details...
      </div>
    );
  }

  if (error || !coverage) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
            <h2 className="text-2xl text-red-500 font-bold mb-4">Error loading data</h2>
            <Link to="/media" className="text-primary underline">Back to Media</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen">
      <article className="max-w-4xl mx-auto px-4 pt-16 pb-12">
        
        <div className="flex items-center gap-3 mb-4 text-sm font-bold text-primary uppercase tracking-widest">
            <span>{coverage.tag || "Press Coverage"}</span>
            <span className="text-gray-300">•</span>
            <span className="text-gray-400">{coverage.datee}</span>
        </div>

        <h1 className="text-3xl md:text-5xl font-serif font-bold mb-8 text-gray-900 leading-tight">
            {coverage.title}
        </h1>

        <div className="mb-10 flex flex-col gap-4">
            <div className="relative group overflow-hidden rounded-3xl shadow-md border border-gray-100 bg-gray-50 flex items-center justify-center">
                <img
                  src={activePreviewImage}
                  alt={coverage.title}
                  className="w-full h-[320px] md:h-[520px] object-contain cursor-pointer transition-transform duration-700 group-hover:scale-102"
                  onClick={() => openModal(activePreviewImage, coverage.images.indexOf(activePreviewImage))}
                />
            </div>

            {coverage.images && coverage.images.length > 1 && (
                <div className="flex flex-wrap gap-3 items-center justify-start p-1 overflow-x-auto no-scrollbar">
                    {coverage.images.map((img, i) => {
                        const isActive = activePreviewImage === img;
                        return (
                            <button
                                key={i}
                                onClick={() => setActivePreviewImage(img)}
                                className={`aspect-[4/3] w-20 md:w-24 rounded-xl overflow-hidden border-2 bg-white transition-all shadow-sm shrink-0 duration-200 ${isActive ? "border-[#6a752b] scale-105 shadow" : "border-gray-200 hover:border-gray-400 opacity-75 hover:opacity-100"}`}
                            >
                                <img 
                                    src={img} 
                                    alt={`Thumbnail index ${i}`} 
                                    className="w-full h-full object-cover"
                                />
                            </button>
                        );
                    })}
                </div>
            )}
        </div>

        <div className="prose prose-lg max-w-none mb-12">
            {(coverage.para || "").split("\n").map((p, i) => (
              <p key={i} className="mb-6 text-gray-700 leading-relaxed text-lg">
                {p}
              </p>
            ))}
        </div>

      </article>

      {selectedImage && (
        <div className="fixed inset-0 bg-black/95 flex items-center justify-center z-[100] backdrop-blur-md transition-opacity" onClick={closeModal}>
          
          <button className="absolute top-8 right-8 text-white/70 hover:text-white text-5xl font-light z-50 transition-colors" onClick={closeModal}>&times;</button>

          <button className="absolute left-4 md:left-8 text-white/50 hover:text-white bg-white/10 hover:bg-white/20 p-4 rounded-full z-50 transition-all" onClick={(e) => { e.stopPropagation(); prevImage(); }}>
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
          </button>

          <div className="relative max-w-5xl max-h-[85vh] px-4" onClick={(e) => e.stopPropagation()}>
              <img
                src={selectedImage}
                className="max-w-full max-h-[80vh] object-contain rounded-2xl shadow-2xl border border-white/10"
                alt="Enlarged gallery display preview layout"
              />
              <div className="text-white/40 text-center mt-4 text-sm font-medium tracking-widest">
                  {currentIndex + 1} / {coverage.images.length}
              </div>
          </div>

          <button className="absolute right-4 md:right-8 text-white/50 hover:text-white bg-white/10 hover:bg-white/20 p-4 rounded-full z-50 transition-all" onClick={(e) => { e.stopPropagation(); nextImage(); }}>
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
          </button>
        </div>
      )}

      <div className="text-center py-16 border-t border-gray-50">
        <Link to="/media" className="inline-flex items-center gap-2 text-gray-400 hover:text-primary transition-all font-black uppercase text-xs tracking-widest">
            <span className="text-xl">←</span> Back to Media & Stories
        </Link>
      </div>
    </div>
  );
};

export default PressCoverageDetails;