import { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
// eslint-disable-next-line no-unused-vars
import {
  motion,
  useScroll,
  useTransform,
  useMotionTemplate,
} from "framer-motion";
import { API_BASE_URL, ADMIN_BASE_URL } from "../config";
import Herosection from "../components/Herosection";
import Testimonials from "./Testimonials";
import MapSection from "../components/MapSection";
import ProjectSlider from "../components/ProjectSlider";
import OurProgramsSection from "../components/OurProgramsSection";
import BeforeAfterImpact from "../components/BeforeAfterImpact";
import PartnersOpportunities from "../components/PartnersOpportunities";

const PROGRAMS_API_URL = `${API_BASE_URL}/programs.php?t=` + Date.now();
const SUBSCRIBE_API_URL = `${API_BASE_URL}/subscribe.php`;

// Video Checker Helper
const isVideoFile = (url) => {
  if (!url) return false;
  return /\.(mp4|webm|ogg)$/i.test(url);
};

// प्रोजेक्ट्स के लिए इमेज URL फ़ंक्शन
const getImageUrl = (path) => {
  if (!path) return "https://via.placeholder.com/800x500?text=No+Image";
  if (path.startsWith("https")) return path;

  const rootDomain = ADMIN_BASE_URL.split("/backend/admin")[0].replace(
    /\/+$/,
    "",
  );
  const cleanPath = path.replace(/^\/+/, "");
  return `${rootDomain}/backend/admin/${cleanPath}`;
};

// पार्टनर्स के लिए सटीक इमेज URL फ़ंक्शन
const getPartnerImageUrl = (path) => {
  if (!path) return "https://via.placeholder.com/150x150?text=No+Logo";
  if (path.startsWith("https")) return path;

  const rootDomain = ADMIN_BASE_URL.split("/backend")[0].replace(/\/+$/, "");
  let cleanPath = path.replace(/^\/+/, "");

  if (cleanPath.startsWith("admin/uploads/")) {
    cleanPath = cleanPath.replace("admin/uploads/", "uploads/");
  }
  return `${rootDomain}/backend/${cleanPath}`;
};

const createSlug = (text) => {
  if (!text) return "";
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/&/g, "and")
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
};

const Home = () => {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });

  const [programsList, setProgramsList] = useState([]);
  const [programsLoading, setProgramsLoading] = useState(true);
  const [programsError, setProgramsError] = useState("");

  const [focusAreas, setFocusAreas] = useState([]);
  const [selectedMapState, setSelectedMapState] = useState(null);
  const [mapTotals, setMapTotals] = useState({
    totalStates: 12,
    totalDistricts: "45+",
    totalProjects: "15+",
    totalBeneficiaries: "2M+",
  });

  const [aboutData, setAboutData] = useState(null);
  const [allProjects, setAllProjects] = useState([]);
  const [recentProjects, setRecentProjects] = useState([]);
  const [allPartnersData, setAllPartnersData] = useState([]);

  // Map Animation hooks
  const mapRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: mapRef,
    offset: ["start 90%", "center center"],
  });

  const mapScale = useTransform(scrollYProgress, [0, 0.7, 1], [0.6, 0.85, 1]);
  const mapClipPercentage = useTransform(scrollYProgress, [0, 0.7, 1], [40, 60, 150]);
  const mapClipPath = useMotionTemplate`circle(${mapClipPercentage}% at 50% 50%)`;

  useEffect(() => {
    const fetchPrograms = async () => {
      try {
        const response = await fetch(PROGRAMS_API_URL);
        if (!response.ok) throw new Error("Failed to fetch programs");
        const data = await response.json();

        const rawPrograms = Array.isArray(data)
          ? data
          : Array.isArray(data.data)
            ? data.data
            : [];

        const normalizedPrograms = rawPrograms
          .slice(0, 4)
          .map((program, index) => ({
            ...program,
            id: program.id || index + 1,
            title: program.title || "Untitled Program",
            description: program.description || "No description available.",
            image_url: program.image_url,
            slug: program.slug || createSlug(program.title) || `program-${index + 1}`,
          }));

        setProgramsList(normalizedPrograms);
      } catch (error) {
        console.error("Programs fetch error:", error);
        setProgramsError(error.message || "Failed to load programs");
      } finally {
        setProgramsLoading(false);
      }
    };

    const fetchFocusAreas = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/focus_areas.php?t=${Date.now()}`);
        const data = await response.json();
        if (data.status === "success") setFocusAreas(data.data);
      } catch (error) {
        console.error("Focus areas fetch error:", error);
      }
    };

    const fetchAboutData = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/about_who_we_are.php?t=${Date.now()}`);
        const data = await response.json();
        if (data.status === "success" && data.data) setAboutData(data.data);
      } catch (err) {
        console.error("Failed to fetch about data:", err);
      }
    };

    const fetchRecentProjects = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/projects.php?t=${Date.now()}`);
        const data = await response.json();
        if (data.status === "success" && Array.isArray(data.data)) {
          setAllProjects(data.data);
          setRecentProjects(data.data); // ✅ पूरा डेटा स्टोर किया, ग्रिड के अंदर स्लाइस करेंगे
        }
      } catch (err) {
        console.error("Failed to fetch recent projects:", err);
      }
    };

    const fetchPartnersDataDirectly = async () => {
      try {
        const [res1, res2, res3] = await Promise.all([
          fetch(`${API_BASE_URL}/partners.php?t=${Date.now()}`).then((res) => res.json()),
          fetch(`${API_BASE_URL}/public_partners.php?t=${Date.now()}`).then((res) => res.json()),
          fetch(`${API_BASE_URL}/society_partners.php?t=${Date.now()}`).then((res) => res.json()),
        ]);

        let combined = [];
        if (res1.status === "success" && Array.isArray(res1.data)) combined = [...combined, ...res1.data];
        if (res2.status === "success" && Array.isArray(res2.data)) combined = [...combined, ...res2.data];
        if (res3.status === "success" && Array.isArray(res3.data)) combined = [...combined, ...res3.data];

        setAllPartnersData(combined);
      } catch (err) {
        console.error("Failed to fetch partners row data:", err);
      }
    };

    fetchPrograms();
    fetchFocusAreas();
    fetchAboutData();
    fetchRecentProjects();
    fetchPartnersDataDirectly();
  }, []);

  const formatCompact = (num) => {
    if (!num) return "0";
    if (typeof num === "string" && num.includes("+")) return num;
    return new Intl.NumberFormat("en-US", {
      notation: "compact",
      maximumFractionDigits: 1,
    }).format(num);
  };

  const handleSubscribe = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage({ text: "", type: "" });

    try {
      const response = await fetch(SUBSCRIBE_API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await response.json();

      if (data.status === "success") {
        setMessage({ text: data.message || "Subscribed successfully.", type: "success" });
        setEmail("");
      } else {
        setMessage({ text: data.message || "Subscription failed.", type: "error" });
      }
    } catch (error) {
      console.error("Subscription error:", error);
      setMessage({
        text: "Failed to connect to the server. Please check your network.",
        type: "error",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const globalCompletedCount = allProjects.filter((p) => p.status?.toLowerCase() === "completed").length;

  const globalLivesImpactedSum = allProjects.reduce((acc, curr) => {
    if (!curr.beneficiaries) return acc;
    const parsed = parseInt(curr.beneficiaries.toString().replace(/[^0-9]/g, ""), 10);
    return isNaN(acc) ? acc : acc + parsed;
  }, 0);

  const normalizeStateName = (name) => {
    if (!name) return "";
    const cleaned = name.trim().toLowerCase().replace(/\s+/g, " ");
    if (cleaned === "orissa" || cleaned === "odisha") return "Odisha";
    if (cleaned === "maharastra" || cleaned === "maharashtra") return "Maharashtra";
    if (cleaned === "uttaranchal" || cleaned === "uttarakhand") return "Uttarakhand";
    if (cleaned === "jammu & kashmir" || cleaned === "jammu and kashmir") return "Jammu and Kashmir";
    return name
      .trim()
      .split(/\s+/)
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
      .join(" ");
  };

  const stateStaticData = {
    "Andhra Pradesh": { image: "/map/AndhraPradesh.jpg", livesImpacted: "800k+" },
    "Arunachal Pradesh": { image: "/map/ArunachalPradesh.jpg", livesImpacted: "50k+" },
    Assam: { image: "/map/Assam.jpg", livesImpacted: "200k+" },
    Bihar: { image: "/map/Bihar.jpg", livesImpacted: "1M+" },
    Chhattisgarh: { image: "/map/Chhattisgarh.jpg", livesImpacted: "300k+" },
    Goa: { image: "/map/Goa.jpg", livesImpacted: "20k+" },
    Gujarat: { image: "/map/Gujarat.jpg", livesImpacted: "600k+" },
    Haryana: { image: "/map/Haryana.jpg", livesImpacted: "400k+" },
    "Himachal Pradesh": { image: "/map/Himachal Pradesh.jpg", livesImpacted: "150k+" },
    Jharkhand: { image: "/map/Jharkhand.jpg", livesImpacted: "500k+" },
    Karnataka: { image: "/map/Karnataka.jpg", livesImpacted: "750k+" },
    Kerala: { image: "/map/Kerala.jpg", livesImpacted: "300k+" },
    "Madhya Pradesh": { image: "/map/Madhya Pradesh.jpg", livesImpacted: "1.2M+" },
    Maharashtra: { image: "/map/Maharashtra.jpg", livesImpacted: "2M+" },
    Manipur: { image: "/map/Manipur.jpg", livesImpacted: "40k+" },
    Meghalaya: { image: "/map/Meghalaya.jpg", livesImpacted: "60k+" },
    Mizoram: { image: "/map/Mizoram.jpg", livesImpacted: "30k+" },
    Nagaland: { image: "/map/Nagaland.jpg", livesImpacted: "45k+" },
    Odisha: { image: "/map/Odisha.jpg", livesImpacted: "900k+" },
    Punjab: { image: "/map/Punjab.jpg", livesImpacted: "400k+" },
    Rajasthan: { image: "/map/Rajasthan.jpg", livesImpacted: "1.1M+" },
    Sikkim: { image: "/map/Sikkim.jpg", livesImpacted: "25k+" },
    "Tamil Nadu": { image: "/map/Tamil Nadu.jpg", livesImpacted: "850k+" },
    Telangana: { image: "/map/Telangana.jpg", livesImpacted: "600k+" },
    Tripura: { image: "/map/Tripura.jpg", livesImpacted: "70k+" },
    "Uttar Pradesh": { image: "/map/Uttar Pradesh.jpg", livesImpacted: "2.5M+" },
    Uttarakhand: { image: "/map/Uttarakhand.jpg", livesImpacted: "200k+" },
    "West Bengal": { image: "/map/WestBengal.jpg", livesImpacted: "1.3M+" },
    "Jammu and Kashmir": { image: "/map/Jammu and Kashmir.png", livesImpacted: "100k+" },
  };

  const getStateLivesImpactedCount = (stateName) => {
    const normalizedTarget = normalizeStateName(stateName);
    const stateProjects = allProjects.filter((p) => {
      let states = [];
      try {
        const locs = JSON.parse(p.state_locations || "[]");
        states = locs.map((l) => normalizeStateName(l.state));
      } catch (e) {}
      if (states.length === 0 && p.location) {
        states = p.location.split(",").map((s) => normalizeStateName(s));
      }
      return states.includes(normalizedTarget);
    });

    const sum = stateProjects.reduce((acc, curr) => {
      if (!curr.beneficiaries) return acc;
      const parsed = parseInt(curr.beneficiaries.toString().replace(/[^0-9]/g, ""), 10);
      return isNaN(parsed) ? acc : acc + parsed;
    }, 0);

    return sum > 0 ? formatCompact(sum) : stateStaticData[normalizedTarget]?.livesImpacted || "0";
  };

  const halfLength = Math.ceil(allPartnersData.length / 2);
  const row1Data = allPartnersData.slice(0, halfLength);
  const row2Data = allPartnersData.slice(halfLength);
  const getRepeatedData = (data) => [...data, ...data, ...data, ...data];

  return (
    <div>
      <Herosection />

      {/* 🔴 GRID SECTION: WHY SDF BLOCK & 4 PROJECT CARDS & IMPACT STATISTICS */}
      <section className="py-12 relative bg-bg-color">
        <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row xl:items-start gap-8 justify-between">
            
            {/* 🟢 1. Left Block: Info Content (Why SDF?) */}
            <div className="w-full lg:w-[22%] xl:max-w-[320px] shrink-0">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-2xl shadow-sm animate-float shrink-0">
                  🌱
                </div>
                <h2 className="text-2xl md:text-3xl font-serif text-text-primary leading-tight">
                  Why Sustainable
                  <br />
                  Development Foundation ?
                </h2>
              </div>

              <p className="text-gray-600 text-justify mb-6 leading-relaxed line-clamp-10 text-sm md:text-base">
                {aboutData && aboutData.who_we_are_text
                  ? aboutData.who_we_are_text
                  : "Established in 2014 by a dedicated group of professional social workers, the Sustainable Development Foundation (SDF) is a distinguished autonomous and 'not-for-profit' organization in India..."}
              </p>

              <Link to="/about">
                <button className="bg-primary hover:bg-[#5a6425] text-white px-8 py-2.5 rounded-full font-medium transition-colors">
                  View More
                </button>
              </Link>
            </div>

            {/* 🔴 Right Container: चौड़ाई lg:w-[75%] की गई ताकि पूरे 4 कार्ड्स ग्रिड में समानांतर आ सकें */}
            <div className="w-full lg:w-[75%] flex flex-col gap-6">
              
              {/* TOP ROW: 4 Project Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 w-full">
                {(() => {
                  if (!recentProjects || !Array.isArray(recentProjects)) {
                    return (
                      <div className="col-span-1 sm:col-span-2 xl:col-span-4 text-center text-gray-500 py-10 bg-white/50 rounded-2xl border border-dashed">
                        <p className="font-medium">Loading projects...</p>
                      </div>
                    );
                  }

                  const completedProjects = recentProjects
                    .filter((project) => project && project.status === "completed")
                    .slice(0, 4);

                  if (completedProjects.length > 0) {
                    return completedProjects.map((project, idx) => {
                      const finalMediaUrl = getImageUrl(project.image_url);
                      return (
                        <div
                          key={project.id || idx}
                          className="bg-white rounded-2xl shadow-sm text-left border border-gray-100 pb-6 flex flex-col h-full hover:shadow-md transition-shadow overflow-hidden"
                        >
                          <div className="p-4 h-44">
                            {isVideoFile(project.image_url) ? (
                              <video
                                src={finalMediaUrl}
                                className="w-full h-full object-cover rounded-xl shadow-sm"
                                autoPlay
                                loop
                                muted
                                playsInline
                              />
                            ) : (
                              <img
                                src={finalMediaUrl}
                                alt={project.title}
                                className="w-full h-full object-cover rounded-xl shadow-sm"
                                onError={(e) => {
                                  e.currentTarget.src =
                                    "https://via.placeholder.com/500x300?text=Image+Not+Found";
                                }}
                              />
                            )}
                          </div>

                          <div className="px-5 pb-2 pt-1 grow flex flex-col justify-between">
                            <div>
                              <h3 className="text-base font-serif font-bold text-text-primary mb-2 line-clamp-4 min-h-[2.5rem] leading-tight">
                                {project.title}
                              </h3>
                              {/* <p className="text-gray-500 text-xs mb-4 line-clamp-3 leading-relaxed">
                                {project.description}
                              </p> */}
                            </div>

                            {/* <Link
                              to={`/projectdetails/${project.slug}`}
                              className="text-primary font-bold text-xs hover:underline mt-auto inline-block"
                            >
                              View Project →
                            </Link> */}
                          </div>
                        </div>
                      );
                    });
                  } else {
                    return (
                      <div className="col-span-1 sm:col-span-2 xl:col-span-4 text-center text-gray-500 py-10 bg-white/50 rounded-2xl border border-dashed">
                        <p className="font-medium">No completed projects found.</p>
                      </div>
                    );
                  }
                })()}
              </div>

              {/* BOTTOM ROW: Our Impact Statistics (बिना किसी हेडिंग के, ठीक 4 प्रोजेक्ट कार्ड्स के नीचे) */}
              <div className="w-full">
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 w-full">
                  {focusAreas && focusAreas.length > 0 ? (
                    focusAreas.map((area, index) => (
                      <motion.div
                        key={area.id}
                        initial={{ y: 30, opacity: 0 }}
                        whileInView={{ y: 0, opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{
                          duration: 0.5,
                          delay: index * 0.1,
                        }}
                        className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4 hover:-translate-y-1 hover:shadow-md transition-all duration-300"
                      >
                        <div className={`w-11 h-11 rounded-full flex items-center justify-center text-2xl bg-gray-50 shadow-sm shrink-0 ${area.color_class} ${area.animation_class}`}>
                          {area.icon}
                        </div>

                        <div className="flex flex-col">
                          <span className="text-lg font-extrabold text-gray-900 leading-none mb-1">
                            {area.number_text}
                          </span>
                          <span className="text-xs font-bold text-gray-400 uppercase tracking-wide leading-tight">
                            {area.title}
                          </span>
                        </div>
                      </motion.div>
                    ))
                  ) : (
                    <p className="col-span-1 sm:col-span-2 xl:col-span-4 text-center text-gray-400 italic py-4">
                      Loading Statistics...
                    </p>
                  )}
                </div>
              </div>

            </div> {/* Right Container Ends */}
          </div>
        </div>
      </section>

      <PartnersOpportunities/>

      <BeforeAfterImpact />

      <OurProgramsSection />

      <Testimonials />

      {/* Map Section Grassroots Presence */}
      <section className="py-16 bg-bg-color">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-4xl font-serif text-text-primary mb-10 text-center">
            Our Presence
          </h2>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            <div
              key="map-container"
              ref={mapRef}
              className="lg:col-span-2 relative h-[350px] sm:h-[500px] lg:h-[600px] xl:h-[800px] flex items-center justify-center bg-transparent"
            >
              <motion.div
                style={{
                  scale: mapScale,
                  clipPath: mapClipPath,
                  WebkitClipPath: mapClipPath,
                  transformOrigin: "center center",
                  backfaceVisibility: "hidden",
                  width: "100%",
                  height: "100%",
                  position: "relative",
                  zIndex: 10,
                }}
                className="bg-accent rounded-xl overflow-hidden shadow-lg"
              >
                <MapSection
                  onStateSelect={setSelectedMapState}
                  onDataLoad={(totals) =>
                    setMapTotals({
                      totalStates: totals.totalStates,
                      totalDistricts: totals.totalDistricts,
                      totalProjects: totals.totalProjects,
                      totalBeneficiaries: totals.totalBeneficiaries
                        ? formatCompact(totals.totalBeneficiaries)
                        : mapTotals.totalBeneficiaries,
                    })
                  }
                />
              </motion.div>
            </div>

            <div
              id="impact"
              className="bg-white sticky top-24 rounded-xl shadow-sm border border-gray-100 p-8 min-h-112.5"
            >
              {selectedMapState ? (
                <div className="animate-in fade-in duration-500">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-serif font-bold text-text-primary flex items-center gap-2">
                      <span className="text-2xl">📊</span> Impact Snapshot
                    </h3>
                    <button
                      onClick={() => setSelectedMapState(null)}
                      className="text-gray-400 hover:text-red-500 text-3xl font-light transition-colors p-1"
                    >
                      &times;
                    </button>
                  </div>

                  <div className="mb-4">
                    <p className="text-[10px] text-primary font-bold uppercase tracking-widest mb-1">
                      Currently Viewing
                    </p>
                    <h4 className="text-2xl font-serif font-bold text-text-primary">
                      📍 {selectedMapState.name}
                    </h4>
                  </div>

                  <div className="mb-8 rounded-xl overflow-hidden h-54 bg-gray-100 border border-gray-100 shadow-inner">
                    <img
                      src={
                        stateStaticData[selectedMapState.name]?.image ||
                        "https://via.placeholder.com/400x250?text=SDF+Impact"
                      }
                      alt={selectedMapState.name}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <ul className="space-y-6">
                    <li className="flex items-center gap-4 group">
                      <div className="w-12 h-12 rounded-2xl bg-[#576123]/10 text-[#576123] flex items-center justify-center text-xl font-bold transition-transform group-hover:scale-105">
                        {selectedMapState.districtCount || 0}
                      </div>
                      <div>
                        <div className="text-sm font-bold text-gray-800 uppercase tracking-tight">
                          Districts Operated
                        </div>
                        <div className="text-[11px] text-gray-400 uppercase font-bold tracking-tighter">
                          Local Intervention
                        </div>
                      </div>
                    </li>

                    <li className="flex items-center gap-4 group">
                      <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center text-xl font-bold transition-transform group-hover:scale-105">
                        {selectedMapState.blockCount || 0}
                      </div>
                      <div>
                        <div className="text-sm font-bold text-gray-800 uppercase tracking-tight">
                          Blocks Covered
                        </div>
                        <div className="text-[11px] text-gray-400 uppercase font-bold tracking-tighter">
                          Block Intervention
                        </div>
                      </div>
                    </li>

                    <li className="flex items-center gap-4 group">
                      <div className="w-12 h-12 rounded-2xl bg-green-50 text-green-600 flex items-center justify-center text-xl font-bold transition-transform group-hover:scale-105">
                        {selectedMapState.villageCount || 0}
                      </div>
                      <div>
                        <div className="text-sm font-bold text-gray-800 uppercase tracking-tight">
                          Villages Covered
                        </div>
                        <div className="text-[11px] text-gray-400 uppercase font-bold tracking-tighter">
                          Village Level
                        </div>
                      </div>
                    </li>

                    <li className="flex items-center gap-4 group">
                      <div className="w-12 h-12 rounded-2xl bg-cyan-50 text-cyan-600 flex items-center justify-center text-xl font-bold transition-transform group-hover:scale-105">
                        {selectedMapState.projects?.length || 0}
                      </div>
                      <div>
                        <div className="text-sm font-bold text-gray-800 uppercase tracking-tight">
                          Major Projects
                        </div>
                        <div className="text-[11px] text-gray-400 uppercase font-bold tracking-tighter">
                          Active Currently
                        </div>
                      </div>
                    </li>

                    <li className="flex items-center gap-4 group">
                      <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-xl font-bold transition-transform group-hover:scale-105">
                        {selectedMapState.projects?.filter(
                          (p) => p.status?.toLowerCase() === "completed" || p.is_completed,
                        ).length || 0}
                      </div>
                      <div>
                        <div className="text-sm font-bold text-gray-800 uppercase tracking-tight">
                          Total Complete Projects
                        </div>
                        <div className="text-[11px] text-gray-400 uppercase font-bold tracking-tighter">
                          Successfully Delivered
                        </div>
                      </div>
                    </li>

                    <li className="flex items-center gap-4 group">
                      <div className="w-12 h-12 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center text-xl font-bold transition-transform group-hover:scale-105">
                        {getStateLivesImpactedCount(selectedMapState.name)}
                      </div>
                      <div>
                        <div className="text-sm font-bold text-gray-800 uppercase tracking-tight">
                          Lives Impacted
                        </div>
                        <div className="text-[11px] text-gray-400 uppercase font-bold tracking-tighter">
                          Total Beneficiaries
                        </div>
                      </div>
                    </li>
                  </ul>

                  <div className="mt-8 pt-4 border-t border-gray-50 text-center">
                    <p className="text-[10px] text-gray-400 italic">
                      Regional statistics for {selectedMapState.name}
                    </p>
                  </div>
                </div>
              ) : (
                <div>
                  <h3 className="text-xl font-serif font-bold text-text-primary mb-8 flex items-center gap-2">
                    <span className="text-2xl mr-2">📊</span> Impact Snapshot
                  </h3>
                  <ul className="space-y-7">
                    <li className="flex items-center gap-4 group">
                      <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center text-xl font-bold transition-transform group-hover:scale-110">
                        {mapTotals.totalStates}
                      </div>
                      <div>
                        <div className="text-sm font-bold text-gray-800">
                          States Covered
                        </div>
                        <div className="text-[11px] text-gray-500 uppercase tracking-tighter">
                          Across India
                        </div>
                      </div>
                    </li>
                    <li className="flex items-center gap-4 group">
                      <div className="w-12 h-12 rounded-2xl bg-secondary/10 text-secondary flex items-center justify-center text-xl font-bold transition-transform group-hover:scale-110">
                        {mapTotals.totalDistricts}
                      </div>
                      <div>
                        <div className="text-sm font-bold text-gray-800">
                          Districts Covered
                        </div>
                        <div className="text-[11px] text-gray-500 uppercase tracking-tighter">
                          Local Intervention
                        </div>
                      </div>
                    </li>
                    <li className="flex items-center gap-4 group">
                      <div className="w-12 h-12 rounded-2xl bg-accent/10 text-accent flex items-center justify-center text-xl font-bold transition-transform group-hover:scale-110">
                        {mapTotals.totalProjects}
                      </div>
                      <div>
                        <div className="text-sm font-bold text-gray-800">
                          Major Projects
                        </div>
                        <div className="text-[11px] text-gray-500 uppercase tracking-tighter">
                          Active Currently
                        </div>
                      </div>
                    </li>

                    <li className="flex items-center gap-4 group">
                      <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center text-xl font-bold transition-transform group-hover:scale-110">
                        {globalCompletedCount > 0 ? globalCompletedCount : "45+"}
                      </div>
                      <div>
                        <div className="text-sm font-bold text-gray-800">
                          Total Complete Projects
                        </div>
                        <div className="text-[11px] text-gray-500 uppercase tracking-tighter">
                          Successfully Delivered
                        </div>
                      </div>
                    </li>

                    <li className="flex items-center gap-4 group">
                      <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center text-xl font-bold transition-transform group-hover:scale-110">
                        {globalLivesImpactedSum > 0 ? formatCompact(globalLivesImpactedSum) : mapTotals.totalBeneficiaries}
                      </div>
                      <div>
                        <div className="text-sm font-bold text-gray-800">
                          Lives Impacted
                        </div>
                        <div className="text-[11px] text-gray-500 uppercase tracking-tighter">
                          Total Beneficiaries
                        </div>
                      </div>
                    </li>
                  </ul>
                  <div className="mt-10 pt-6 border-t border-gray-100 text-center">
                    <div className="inline-block animate-bounce mb-2">👆</div>
                    <p className="text-xs text-gray-400 italic px-4">
                      Click any highlighted state on the map to view local project details.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* --- Partners Marquee Section --- */}
      <section className="py-20 bg-[#F3EFE4] overflow-hidden" id="partners">
        <style>{`
          @keyframes marqueeLeft {
            0% { transform: translateX(0); }
            100% { transform: translateX(-50%); }
          }
          @keyframes marqueeRight {
            0% { transform: translateX(-50%); }
            100% { transform: translateX(0); }
          }
          .animate-scroll-left {
            animation: marqueeLeft 50s linear infinite;
          }
          .animate-scroll-right {
            animation: marqueeRight 50s linear infinite;
          }
          .animate-scroll-left:hover, .animate-scroll-right:hover {
            animation-play-state: paused;
          }
        `}</style>

        <div className="w-full mx-auto text-center relative">
          <h2 className="text-4xl font-serif mb-16 text-[#233520]">
            Our Partners & Supporters
          </h2>

          <div className="absolute left-0 top-20 bottom-0 w-28 bg-gradient-to-r from-[#F3EFE4] to-transparent z-10 pointer-events-none"></div>
          <div className="absolute right-0 top-20 bottom-0 w-28 bg-gradient-to-l from-[#F3EFE4] to-transparent z-10 pointer-events-none"></div>

          <div className="flex flex-col gap-6 w-full">
            {row1Data.length > 0 && (
              <div className="overflow-hidden w-full">
                <div className="flex w-max gap-6 animate-scroll-left">
                  {getRepeatedData(row1Data).map((partner, idx) => (
                    <a
                      key={`row1-${partner.id || idx}-${idx}`}
                      href={partner.link || "#"}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-48 sm:w-56 bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col items-center justify-center transition-all duration-300 hover:scale-105 hover:shadow-lg group shrink-0"
                    >
                      <img
                        src={getPartnerImageUrl(partner.img || partner.image_url)}
                        alt={partner.title || "partner"}
                        className="w-[80%] h-auto max-h-16 object-contain mb-4 transition-transform duration-300 group-hover:scale-110"
                        onError={(e) => {
                          e.currentTarget.onerror = null;
                          e.currentTarget.src = "https://via.placeholder.com/150x150?text=No+Logo";
                        }}
                      />
                      <p className="text-xs font-bold text-gray-600 text-center leading-snug truncate w-full">
                        {partner.title}
                      </p>
                    </a>
                  ))}
                </div>
              </div>
            )}

            {row2Data.length > 0 && (
              <div className="overflow-hidden w-full">
                <div className="flex w-max gap-6 animate-scroll-right">
                  {getRepeatedData(row2Data).map((partner, idx) => (
                    <a
                      key={`row2-${partner.id || idx}-${idx}`}
                      href={partner.link || "#"}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-48 sm:w-56 bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col items-center justify-center transition-all duration-300 hover:scale-105 hover:shadow-lg group shrink-0"
                    >
                      <img
                        src={getPartnerImageUrl(partner.img || partner.image_url)}
                        alt={partner.title || "partner"}
                        className="w-[80%] h-auto max-h-16 object-contain mb-4 transition-transform duration-300 group-hover:scale-110"
                        onError={(e) => {
                          e.currentTarget.onerror = null;
                          e.currentTarget.src = "https://via.placeholder.com/150x150?text=No+Logo";
                        }}
                      />
                      <p className="text-xs font-bold text-gray-600 text-center leading-snug truncate w-full">
                        {partner.title}
                      </p>
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* --- Subscribe Newsletter --- */}
      <section className="py-10 bg-primary/10 border-t border-primary/20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="text-4xl mb-4 block animate-float">✉️</span>
          <h2 className="text-3xl font-serif text-text-primary mb-4">
            Subscribe to Our Newsletter
          </h2>
          <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
            Stay updated with our latest projects, success stories, and ways you can help.
          </p>

          <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-3 max-w-lg mx-auto">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email address"
              className="grow px-6 py-4 rounded-full border border-gray-300 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 bg-white shadow-sm"
              required
              disabled={isSubmitting}
            />
            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-primary hover:bg-[#5a6425] text-white px-8 py-4 rounded-full font-bold transition-all shadow-md hover:-translate-y-1 hover:shadow-lg whitespace-nowrap disabled:opacity-70"
            >
              {isSubmitting ? "Subscribing..." : "Subscribe"}
            </button>
          </form>

          {message.text && (
            <div className={`max-w-lg mx-auto mt-4 p-3 rounded-lg text-sm font-medium ${message.type === "success" ? "bg-green-100 text-green-800 border border-green-200" : "bg-red-100 text-red-800 border border-red-200"}`}>
              {message.text}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Home;