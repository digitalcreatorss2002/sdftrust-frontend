import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { API_BASE_URL, ADMIN_BASE_URL } from "../config";

const BASE_URL = ADMIN_BASE_URL;

const makeImageUrl = (path) => {
  if (!path) return "https://placehold.co/150x150?text=No+Photo";
  if (path.startsWith("http://") || path.startsWith("https://")) return path;

  const rootDomain = BASE_URL.split("/backend/admin")[0].replace(/\/+$/, "");
  const cleanPath = path.replace(/^\/+/, "");

  if (cleanPath.startsWith("uploads/team/")) {
    return `${rootDomain}/backend/admin/${cleanPath}`;
  }
  if (cleanPath.startsWith("backend/admin/")) {
    return `${rootDomain}/${cleanPath}`;
  }
  if (cleanPath.startsWith("uploads/")) {
    return `${rootDomain}/${cleanPath}`;
  }
  return `${rootDomain}/${cleanPath}`;
};

const getPartnerImageUrl = (path) => {
  if (!path) return "https://placehold.co/150x150?text=No+Logo";
  if (path.startsWith("http://") || path.startsWith("https://")) return path;

  const rootDomain = BASE_URL.split("/backend")[0].replace(/\/+$/, "");
  let cleanPath = path.replace(/^\/+/, "");

  if (cleanPath.startsWith("admin/uploads/")) {
    cleanPath = cleanPath.replace("admin/uploads/", "uploads/");
  }
  return `${rootDomain}/backend/${cleanPath}`;
};

const About = () => {
  const [openFaq, setOpenFaq] = useState(null);
  const location = useLocation();

  const [activeTab, setActiveTab] = useState("who-we-are");
  const [selectedLeader, setSelectedLeader] = useState(null);

  const [partnerTab, setPartnerTab] = useState("corporate");

  const [aboutData, setAboutData] = useState(null);
  const [leadershipData, setLeadershipData] = useState([]);

  const [partners, setPartners] = useState([]);
  const [publicPartners, setPublicPartners] = useState([]);
  const [societyPartners, setSocietyPartners] = useState([]);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [aboutRes, leadRes, partnersRes, publicRes, societyRes] =
          await Promise.all([
            fetch(`${API_BASE_URL}/about_who_we_are.php?t=${Date.now()}`).then(
              (res) => res.json(),
            ),
            fetch(`${API_BASE_URL}/leadership.php?t=${Date.now()}`).then(
              (res) => res.json(),
            ),
            fetch(`${API_BASE_URL}/partners.php?t=${Date.now()}`).then((res) =>
              res.json(),
            ),
            fetch(`${API_BASE_URL}/public_partners.php?t=${Date.now()}`).then(
              (res) => res.json(),
            ),
            fetch(`${API_BASE_URL}/society_partners.php?t=${Date.now()}`).then(
              (res) => res.json(),
            ),
          ]);

        if (aboutRes.status === "success") setAboutData(aboutRes.data);
        if (leadRes.status === "success") setLeadershipData(leadRes.data);
        if (partnersRes.status === "success") setPartners(partnersRes.data);
        if (publicRes.status === "success") setPublicPartners(publicRes.data);
        if (societyRes.status === "success")
          setSocietyPartners(societyRes.data);
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

  const renderPartnerGrid = (title, data) => {
    if (!data || data.length === 0) {
      return (
        <div className="text-gray-500 py-6 italic">
          No active partners found.
        </div>
      );
    }
    return (
      <div className="text-left">
        {title && (
          <h3 className="text-xl font-serif mb-6 text-[#4a5840] font-bold">
            {title}
          </h3>
        )}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {data.map((partner, index) => {
            const imgSrc = getPartnerImageUrl(partner.img || partner.image_url);
            return (
              <a
                key={partner.id || index}
                href={partner.link || "#"}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex flex-col items-center justify-center transition-all duration-300 ease-in-out hover:scale-105 hover:shadow-md group"
              >
                <img
                  src={imgSrc}
                  alt={partner.title || "partner"}
                  className="w-[85%] h-auto max-h-16 object-contain mb-3 transition-transform duration-300 group-hover:scale-105"
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src =
                      "https://placehold.co/150x150?text=No+Logo";
                  }}
                />
                <p className="text-xs font-bold text-gray-600 text-center leading-snug">
                  {partner.title}
                </p>
              </a>
            );
          })}
        </div>
      </div>
    );
  };

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
    <div className="bg-bg-color min-h-screen pb-10">
      <section className="bg-primary text-white py-35 relative overflow-hidden">
        {/* Background Image Layer */}
        <div
          className="absolute inset-0 z-0 bg-[url('/header/about.webp.jpeg')] bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url('header/about.webp.jpeg')` }} // Aap apna sahi image path yahan daal sakte hain
        />

        {/* Dark Overlay Filter (Text ko acche se read karne ke liye) */}
        <div className="absolute inset-0 bg-black/30 z-10" />

        {/* Content Container */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-20">
          <h1 className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-serif font-bold mb-4 drop-shadow-sm">
            About Us
          </h1>
          <p className="text-xl lg:text-2xl max-w-2xl mx-auto text-white opacity-95 drop-shadow-sm">
            Discover our journey, our vision, and the people behind our mission
            to empower communities.
          </p>
        </div>
      </section>

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

      <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        {activeTab === "who-we-are" && (
          <div className="animate-fade-in">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-serif text-text-primary mb-4">
                Who We Are
              </h2>
              <div className="w-24 h-1 bg-accent mx-auto"></div>
              <p className="mt-6 text-gray-600 text-lg leading-relaxed text-justify max-w-5xl mx-auto whitespace-pre-line">
                {aboutData?.who_we_are_text || "Content loading..."}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
              {[
                {
                  text: aboutData?.vision_text,
                  img: aboutData?.vision_image || "/about/5.png",
                },
                {
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
                              {lvl === "General"
                                ? "Board & Advisory Team"
                                : `${lvl} Level Team`}
                            </h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
                              {filteredMembers.map((m, i) => (
                                <div
                                  key={i}
                                  className="bg-white rounded-2xl overflow-hidden shadow-md border border-gray-100 flex flex-col h-full group"
                                >
                                  <div className="w-full h-64 bg-gray-50 overflow-hidden">
                                    <img
                                      src={makeImageUrl(m.image_url)}
                                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                      alt={m.name}
                                    />
                                  </div>
                                  <div className="p-5 text-center flex flex-col flex-grow justify-between">
                                    <div>
                                      <h4 className="text-[#6a752b] font-bold text-lg">
                                        {m.name}
                                      </h4>
                                      <p className="text-gray-500 text-sm mt-1 font-medium">
                                        {m.role}
                                      </p>
                                    </div>
                                    {m.content && (
                                      <div className="mt-2 border-t border-gray-50 text-left">
                                        <p className="text-gray-600 text-xs leading-relaxed italic whitespace-pre-line line-clamp-4 hover:line-clamp-none transition-all duration-300">
                                          "{m.content}"
                                        </p>
                                      </div>
                                    )}
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

        {activeTab === "partners" && (
          <div className="max-w-6xl mx-auto animate-fade-in">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-serif text-text-primary mb-4">
                Our Partners & Affiliations
              </h2>
              <div className="w-24 h-1 bg-primary mx-auto"></div>
              <p className="mt-4 text-gray-500 max-w-xl mx-auto">
                We are proud to collaborate with organizations across sectors to
                drive sustainable and impactful development.
              </p>
            </div>

            <div className="space-y-16 p-6 md:p-10 bg-[#F8F6F0] rounded-3xl border border-gray-100 shadow-inner">
              {partners.length > 0 && (
                <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm flex flex-col w-full border border-primary">
                  {renderPartnerGrid("Corporate & CSR Partners 🏢", partners)}
                </div>
              )}

              {publicPartners.length > 0 && (
                <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm flex flex-col w-full border border-primary">
                  {renderPartnerGrid(
                    "Government & Institutional Partners 🏛️",
                    publicPartners,
                  )}
                </div>
              )}

              {societyPartners.length > 0 && (
                <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm flex flex-col w-full border border-primary">
                  {renderPartnerGrid(
                    "Civil Society & NGO Partners 🤝",
                    societyPartners,
                  )}
                </div>
              )}

              {partners.length === 0 &&
                publicPartners.length === 0 &&
                societyPartners.length === 0 && (
                  <div className="text-center text-gray-500 py-12 italic bg-white rounded-2xl">
                    No active partners found at the moment.
                  </div>
                )}
            </div>
          </div>
        )}

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
