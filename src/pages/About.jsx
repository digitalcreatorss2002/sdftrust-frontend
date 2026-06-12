import { useState, useEffect } from "react";
import { useLocation, Link } from "react-router-dom";
import { API_BASE_URL, ADMIN_BASE_URL } from "../config";

const BASE_URL = ADMIN_BASE_URL;

const makeImageUrl = (path) => {
  if (!path) return "https://placehold.co/150x150?text=No+Photo";
  if (path.startsWith("http://") || path.startsWith("https://")) return path;

  const rootDomain = BASE_URL.split("/backend/admin")[0].replace(/\/+$/, "");
  const cleanPath = path.replace(/^\/+/, "");

  if (cleanPath.startsWith("backend/admin/")) {
    return `${rootDomain}/${cleanPath}`;
  }

  if (cleanPath.startsWith("uploads/")) {
    return `${rootDomain}/${cleanPath}`;
  }

  return `${rootDomain}/${cleanPath}`;
};

const About = () => {
  const [openFaq, setOpenFaq] = useState(null);
  const location = useLocation();

  // STATES
  const [activeTab, setActiveTab] = useState("who-we-are");
  const [selectedLeader, setSelectedLeader] = useState(null);
  const [selectedPartner, setSelectedPartner] = useState(null);

  const [aboutData, setAboutData] = useState(null);
  const [leadershipData, setLeadershipData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const aboutRes = await fetch(
          `${API_BASE_URL}/about_who_we_are.php?t=${Date.now()}`,
        );
        const aboutJson = await aboutRes.json();
        if (aboutJson.status === "success") setAboutData(aboutJson.data);

        const leadRes = await fetch(
          `${API_BASE_URL}/leadership.php?t=${Date.now()}`,
        );
        const leadJson = await leadRes.json();
        if (leadJson.status === "success") setLeadershipData(leadJson.data);
      } catch (err) {
        console.error("Data fetching error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const toggleFaq = (index) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  useEffect(() => {
    if (location.hash) {
      const tab = location.hash.replace("#", "");
      const validTabs = [
        "who-we-are",
        "leadership",
        "approach",
        "partners",
        "faq",
      ];
      if (validTabs.includes(tab)) {
        setActiveTab(tab);
      }
    } else {
      setActiveTab("who-we-are");
    }
  }, [location]);

  const faqs = [
    {
      question: "How is the Sustainable Development Foundation funded?",
      answer:
        "We are funded primarily through grants, corporate partnerships (CSR), and individual donations.",
    },
    {
      question: "Can I volunteer if I don't live in a project area?",
      answer:
        "Absolutely! We offer remote volunteering opportunities in various fields.",
    },
    {
      question: "How do you measure the impact of your programs?",
      answer:
        "We employ rigorous monitoring and evaluation frameworks with regular data collection.",
    },
    {
      question: "Are my donations tax-deductible?",
      answer:
        "Yes, all donations are eligible for 50% tax exemption under Section 80G.",
    },
  ];

  const tabs = [
    { id: "who-we-are", label: "Who We Are 💡" },
    { id: "leadership", label: "Leadership 👥" },
    { id: "approach", label: "Our Approach 🎯" },
    { id: "partners", label: "Partners 🤝" },
    { id: "faq", label: "FAQ 🙋" },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg-color">
        <div className="text-primary font-bold animate-pulse text-xl">
          Loading About Us...
        </div>
      </div>
    );
  }

  return (
    <div className="bg-bg-color min-h-screen pb-20">
      {/* Hero Section */}
      <section className="bg-primary text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-serif font-bold mb-4">
            About Us
          </h1>
          <p className="text-xl lg:text-2xl max-w-2xl mx-auto text-white opacity-90">
            Discover our journey, our vision, and the people behind our mission
            to empower communities.
          </p>
        </div>
      </section>

      {/* TABS BAR */}
      <section className="border-b sticky top-20 bg-white z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-start md:justify-center space-x-8 overflow-x-auto no-scrollbar px-4 md:px-0">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  window.history.replaceState(null, "", `#${tab.id}`);
                }}
                className={`py-4 border-b-2 font-bold whitespace-nowrap transition-colors ${activeTab === tab.id ? "border-primary text-primary" : "border-transparent text-gray-500 hover:text-primary"}`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* CONTENT AREA */}
      <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        {/* 1. WHO WE ARE */}
        {activeTab === "who-we-are" && (
          <div className="animate-fade-in">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-serif text-text-primary mb-4">
                Who We Are
              </h2>
              <div className="w-24 h-1 bg-accent mx-auto"></div>
              
              {/* ✅ FIXED: यहाँ whitespace-pre-line क्लास जोड़ी गई है ताकि डेटाबेस के लाइन ब्रेक्स काम करें */}
              <p className="mt-6 text-gray-600 text-lg leading-relaxed text-justify max-w-5xl mx-auto whitespace-pre-line">
                {aboutData?.who_we_are_text || "Content loading..."}
              </p>
            </div>

            {/* VISION & MISSION BLOCKS */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
              {[
                {
                  title: "Our Vision",
                  text: aboutData?.vision_text,
                  img: aboutData?.vision_image || "/about/5.png",
                },
                {
                  title: "Our Mission",
                  text: aboutData?.mission_text,
                  img: aboutData?.mission_image || "/about/3.png",
                },
              ].map((box, i) => (
                <div
                  key={i}
                  className="relative rounded-2xl overflow-hidden shadow-lg flex flex-col justify-between text-left bg-gray-900 group min-h-[500px]"
                  style={{
                    backgroundImage: `url('${makeImageUrl(box.img)}')`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                  }}
                >
                  <div className="absolute inset-0 bg-black/10 group-hover:bg-black/30 transition-all duration-500 z-0"></div>

                  <div className="relative z-10 p-8 md:p-10 flex flex-col h-full justify-center">
                    <h3 className="text-2xl md:text-3xl font-serif text-white font-bold mb-4 border-b border-white/20 pb-2 inline-block max-w-max">
                      {box.title}
                    </h3>
                    <div
                      className="text-gray-100 leading-relaxed text-base md:text-lg space-y-2 prose-invert tags-fix-styles whitespace-pre-line"
                      dangerouslySetInnerHTML={{ __html: box.text }}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="w-full max-w-7xl mx-auto rounded-2xl overflow-hidden shadow-lg bg-white group">
              <img
                src="/about/organitation.png"
                alt="Our Working Approach"
                className="w-full h-auto block object-contain"
              />
            </div>
          </div>
        )}

        {/* 2. LEADERSHIP */}
        {activeTab === "leadership" && (
          <div className="animate-fade-in">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-serif text-text-primary mb-4">
                Leadership & Governance
              </h2>
              <div className="w-24 h-1 bg-primary mx-auto"></div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {leadershipData.map((item, idx) => (
                <div
                  key={idx}
                  onClick={() => setSelectedLeader(item)}
                  className="cursor-pointer bg-white p-8 rounded-2xl shadow-sm border border-gray-100 text-center hover:-translate-y-2 hover:shadow-xl transition-all duration-300"
                >
                  <div className="mb-4 text-4xl">{item.icon}</div>
                  <h3 className="font-serif text-lg font-bold mb-2">
                    {item.title}
                  </h3>
                  <p className="text-sm text-gray-500 line-clamp-2">
                    {item.description}
                  </p>
                </div>
              ))}
            </div>

            {/* Leadership Modal */}
            {selectedLeader && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in">
                <div
                  className={`max-w-6xl w-full rounded-3xl p-6 md:p-10 overflow-y-auto max-h-[90vh] relative shadow-2xl transition-all ${selectedLeader.title.includes("Founder") ? "bg-[#6f7c2e] text-white" : "bg-white text-gray-800"}`}
                >
                  <button
                    onClick={() => setSelectedLeader(null)}
                    className="absolute top-6 right-6 w-12 h-12 rounded-full font-bold shadow-lg transition-all flex items-center justify-center bg-gray-100 hover:bg-gray-200 text-black"
                  >
                    ✕
                  </button>
                  <h2
                    className={`text-3xl md:text-5xl font-bold text-center mb-10 italic ${selectedLeader.title.includes("Founder") ? "text-white" : "text-[#6a752b]"}`}
                  >
                    {selectedLeader.title}
                  </h2>

                  {selectedLeader.title.includes("Founder") ? (
                    <div className="max-w-4xl mx-auto space-y-6 text-lg leading-relaxed text-justify px-4 whitespace-pre-line">
                      {selectedLeader.members[0]?.content
                        ?.split("\n")
                        .map((p, i) => (
                          <p key={i}>{p}</p>
                        ))}
                    </div>
                  ) : (
                    <div className="space-y-12">
                      {selectedLeader.intro_text && (
                        <p className="text-center text-lg max-w-3xl mx-auto opacity-90 mb-10 whitespace-pre-line">
                          {selectedLeader.intro_text}
                        </p>
                      )}
                      {["General", "M1", "M2", "M3"].map((lvl) => {
                        const filteredMembers = selectedLeader.members.filter(
                          (m) => m.staff_level === lvl,
                        );
                        if (filteredMembers.length === 0) return null;
                        return (
                          <div key={lvl}>
                            <h3 className="text-xl font-bold mb-8 border-b border-gray-100 pb-2 inline-block uppercase tracking-widest text-[#6a752b]">
                              {lvl} Level Team
                            </h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
                              {filteredMembers.map((m, i) => (
                                <div
                                  key={i}
                                  className="bg-white rounded-2xl overflow-hidden shadow-md border border-gray-100 group"
                                >
                                  <div className="w-full h-64 bg-gray-50 overflow-hidden">
                                    <img
                                      src={makeImageUrl(m.image_url)}
                                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                      alt={m.name}
                                    />
                                  </div>
                                  <div className="p-5 text-center">
                                    <h4 className="text-[#6a752b] font-bold text-lg">
                                      {m.name}
                                    </h4>
                                    <p className="text-gray-500 text-sm mt-1">
                                      {m.role}
                                    </p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* 3. APPROACH */}
        {activeTab === "approach" && (
          <div className="max-w-4xl mx-auto animate-fade-in">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-serif text-text-primary mb-4">
                Our Approach
              </h2>
              <div className="w-24 h-1 bg-primary mx-auto"></div>
            </div>
            <div className="w-full max-w-4xl mx-auto rounded-2xl overflow-hidden shadow-lg bg-white group">
              <img
                src="/about/Approch.jpeg"
                alt="Our Working Approach"
                className="w-full h-auto block object-contain"
              />
            </div>
          </div>
        )}

        {/* 4. PARTNERS */}
        {activeTab === "partners" && (
          <div className="max-w-4xl mx-auto animate-fade-in text-center">
            <div className="mb-12">
              <h2 className="text-3xl font-serif text-text-primary mb-4">
                Partners & Affiliations
              </h2>
              <div className="w-24 h-1 bg-primary mx-auto"></div>
            </div>

            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 md:p-16">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <Link
                  to="/partners"
                  className="p-8 bg-gray-100 rounded-2xl hover:shadow-lg transition-all group cursor-pointer border border-transparent hover:border-primary/20"
                >
                  <div className="font-bold text-primary text-xl mb-2 group-hover:scale-105 transition-transform">
                    Corporate
                  </div>
                  <div className="text-gray-500">CSR Partners</div>
                </Link>

                <Link
                  to="/public-partners"
                  className="p-8 bg-gray-100 rounded-2xl hover:shadow-lg transition-all group cursor-pointer border border-transparent hover:border-primary/20"
                >
                  <div className="font-bold text-primary text-xl mb-2 group-hover:scale-105 transition-transform">
                    Government and Institutional Partners
                  </div>
                  <div className="text-gray-500">Government Alliances</div>
                </Link>

                <Link
                  to="/society-partners"
                  className="p-8 bg-gray-100 rounded-2xl hover:shadow-lg transition-all group cursor-pointer border border-transparent hover:border-primary/20"
                >
                  <div className="font-bold text-primary text-xl mb-2 group-hover:scale-105 transition-transform">
                    Civil Society
                  </div>
                  <div className="text-gray-500">NGO Partners</div>
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* 5. FAQ */}
        {activeTab === "faq" && (
          <div className="max-w-3xl mx-auto animate-fade-in">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-serif text-text-primary mb-4">
                Frequently Asked Questions
              </h2>
              <div className="w-24 h-1 bg-primary mx-auto mb-6"></div>
            </div>
            <div className="space-y-4">
              {faqs.map((faq, index) => (
                <div
                  key={index}
                  className={`border rounded-2xl overflow-hidden transition-all duration-300 ${openFaq === index ? "border-primary shadow-lg bg-white" : "border-gray-100 bg-white"}`}
                >
                  <button
                    className="w-full text-left px-6 py-5 flex justify-between items-center"
                    onClick={() => toggleFaq(index)}
                  >
                    <span className="font-bold text-text-primary">
                      {faq.question}
                    </span>
                    <span
                      className={`transition-transform duration-300 ${openFaq === index ? "rotate-180 text-primary" : "text-gray-300"}`}
                    >
                      ▼
                    </span>
                  </button>
                  <div
                    className={`px-6 overflow-hidden transition-all duration-500 ${openFaq === index ? "max-h-96 opacity-100 pb-6" : "max-h-0 opacity-0"}`}
                  >
                    <div className="pt-2 border-t border-gray-50 text-gray-600 leading-relaxed whitespace-pre-line">
                      {faq.answer}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default About;