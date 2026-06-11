import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

import { API_BASE_URL } from "../config";

// --- STATE NORMALIZATION UTILITY ---
const normalizeStateName = (name) => {
  if (!name) return "";
  const cleaned = name.trim().toLowerCase().replace(/\s+/g, " ");
  if (cleaned === "orissa" || cleaned === "odisha") return "Odisha";
  if (cleaned === "maharastra" || cleaned === "maharashtra") return "Maharashtra";
  if (cleaned === "uttaranchal" || cleaned === "uttarakhand") return "Uttarakhand";
  if (cleaned === "jammu & kashmir" || cleaned === "jammu and kashmir") return "Jammu and Kashmir";
  return name.trim().split(/\s+/).map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(" ");
};

// --- STATIC STATE DATA ---
const stateDataMap = {
  "Andhra Pradesh": { image: "/map/AndhraPradesh.jpg", livesImpacted: "800k+" },
  "Arunachal Pradesh": { image: "/map/ArunachalPradesh.jpg", livesImpacted: "50k+" },
  "Assam": { image: "/map/Assam.jpg", livesImpacted: "200k+" },
  "Bihar": { image: "/map/Bihar.jpg", livesImpacted: "1.5M+" },
  "Chhattisgarh": { image: "/map/Chhattisgarh.jpg", livesImpacted: "300k+" },
  "Goa": { image: "/map/Goa.jpg", livesImpacted: "20k+" },
  "Gujarat": { image: "/map/Gujarat.jpg", livesImpacted: "600k+" },
  "Haryana": { image: "/map/Haryana.jpg", livesImpacted: "400k+" },
  "Himachal Pradesh": { image: "/map/Himachal Pradesh.jpg", livesImpacted: "150k+" },
  "Jharkhand": { image: "/map/Jharkhand.jpg", livesImpacted: "500k+" },
  "Karnataka": { image: "/map/Karnataka.jpg", livesImpacted: "750k+" },
  "Kerala": { image: "/map/Kerala.jpg", livesImpacted: "300k+" },
  "Madhya Pradesh": { image: "/map/Madhya Pradesh.jpg", livesImpacted: "1.2M+" },
  "Maharashtra": { image: "/map/Maharashtra.jpg", livesImpacted: "2M+" },
  "Manipur": { image: "/map/Manipur.jpg", livesImpacted: "40k+" },
  "Meghalaya": { image: "/map/Meghalaya.jpg", livesImpacted: "60k+" },
  "Mizoram": { image: "/map/Mizoram.jpg", livesImpacted: "30k+" },
  "Nagaland": { image: "/map/Nagaland.jpg", livesImpacted: "45k+" },
  "Odisha": { image: "/map/Odisha.jpg", livesImpacted: "900k+" },
  "Punjab": { image: "/map/Punjab.jpg", livesImpacted: "400k+" },
  "Rajasthan": { image: "/map/Rajasthan.jpg", livesImpacted: "1.1M+" },
  "Sikkim": { image: "/map/Sikkim.jpg", livesImpacted: "25k+" },
  "Tamil Nadu": { image: "/map/Tamil Nadu.jpg", livesImpacted: "850k+" },
  "Telangana": { image: "/map/Telangana.jpg", livesImpacted: "600k+" },
  "Tripura": { image: "/map/Tripura.jpg", livesImpacted: "70k+" },
  "Uttar Pradesh": { image: "/map/Uttar Pradesh.jpg", livesImpacted: "2.5M+" },
  "Uttarakhand": { image: "/map/Uttarakhand.jpg", livesImpacted: "200k+" },
  "West Bengal": { image: "/map/WestBengal.jpg", livesImpacted: "1.3M+" },
  "Jammu and Kashmir": { image: "/map/Jammu and Kashmir.png", livesImpacted: "100k+" }
};

const MapSection = ({ onStateSelect, onDataLoad }) => {
  const mapRef = useRef(null);
  const geoLayerRef = useRef(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!mapRef.current) {
      mapRef.current = L.map("map", {
        zoomControl: false,
        attributionControl: false,
        dragging: false,
        scrollWheelZoom: false,
        doubleClickZoom: false,
        boxZoom: false,
        keyboard: false,
        touchZoom: false,
      }).setView([22.9734, 78.6569], 5);

      mapRef.current.setMaxBounds([
        [6, 68],
        [38, 97],
      ]);

      mapRef.current.on("click", () => {
        if (onStateSelect) onStateSelect(null);
      });
    }

    const map = mapRef.current;
    let projectData = {};

    const fetchData = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/projects.php?t=${Date.now()}`);
        const result = await res.json();
        const projects = result.data || [];

        projects.forEach((p) => {
          let stateLocations = [];
          if (p.state_locations) {
            try {
              stateLocations = JSON.parse(p.state_locations);
            } catch(e) {}
          }
          
          const benef = parseInt(p.beneficiaries) || 0;

          if (stateLocations && stateLocations.length > 0) {
            stateLocations.forEach(loc => {
              const state = loc.state ? normalizeStateName(loc.state) : null;
              if (state) {
                if (!projectData[state]) {
                  projectData[state] = {
                    list: [],
                    districtSet: new Set(),
                    blockSet: new Set(),
                    villageSet: new Set(),
                    totalBeneficiaries: 0
                  };
                }
                
                if (!projectData[state].list.find(proj => proj.id === p.id)) {
                    projectData[state].list.push(p);
                    projectData[state].totalBeneficiaries += benef;
                }
                
                if (loc.district) loc.district.split(",").forEach(d => { if (d.trim()) projectData[state].districtSet.add(d.trim().toLowerCase()); });
                if (loc.block) loc.block.split(",").forEach(b => { if (b.trim()) projectData[state].blockSet.add(b.trim().toLowerCase()); });
                if (loc.village) loc.village.split(",").forEach(v => { if (v.trim()) projectData[state].villageSet.add(v.trim().toLowerCase()); });
              }
            });
          } else {
            const states = p.location ? p.location.split(",").map((s) => normalizeStateName(s)) : [];
            const districts = p.district ? p.district.split(",").map((d) => d.trim()) : [];
            const blocks = p.block ? p.block.split(",").map((b) => b.trim()) : [];
            const villages = p.village ? p.village.split(",").map((v) => v.trim()) : [];

            states.forEach((state) => {
              if (state) {
                if (!projectData[state]) {
                  projectData[state] = {
                    list: [],
                    districtSet: new Set(),
                    blockSet: new Set(),
                    villageSet: new Set(),
                    totalBeneficiaries: 0
                  };
                }

                projectData[state].list.push(p);
                projectData[state].totalBeneficiaries += benef;

                districts.forEach(d => { if (d) projectData[state].districtSet.add(d.toLowerCase()); });
                blocks.forEach(b => { if (b) projectData[state].blockSet.add(b.toLowerCase()); });
                villages.forEach(v => { if (v) projectData[state].villageSet.add(v.toLowerCase()); });
              }
            });
          }
        });

        if (onDataLoad) {
          const totalProjects = projects.length;
          let totalBeneficiaries = 0;
          let overallDistricts = new Set();
          
          projects.forEach(p => {
             totalBeneficiaries += parseInt(p.beneficiaries) || 0;
             let stateLocations = [];
             try { stateLocations = JSON.parse(p.state_locations || "[]"); } catch(e) {}
             
             if(stateLocations.length > 0) {
                 stateLocations.forEach(loc => {
                     if (loc.district) loc.district.split(',').forEach(d => { if(d.trim()) overallDistricts.add(d.trim().toLowerCase()); });
                 });
             } else {
                 if (p.district) p.district.split(',').forEach(d => { if(d.trim()) overallDistricts.add(d.trim().toLowerCase()); });
             }
          });
          
          const activeStatesCount = Object.keys(projectData).length;
          onDataLoad({
            totalStates: activeStatesCount,
            totalDistricts: overallDistricts.size,
            totalProjects: totalProjects,
            totalBeneficiaries: totalBeneficiaries
          });
        }

        const geoRes = await fetch("/india_states.geojson");
        const geoData = await geoRes.json();

        if (geoLayerRef.current) {
          map.removeLayer(geoLayerRef.current);
        }

        geoLayerRef.current = L.geoJSON(geoData, {
          style: (feature) => {
            const stateName = normalizeStateName(feature.properties.NAME_1);
            const hasProjects = projectData[stateName]?.list.length > 0;
            return {
              color: "#ffffff",
              weight: 1.5,
              fillColor: hasProjects ? "#576123" : "#333333",
              fillOpacity: hasProjects ? 0.95 : 0.7,
              className: "state-feature transition-all duration-300",
            };
          },
          onEachFeature: (feature, layer) => {
            const stateName = normalizeStateName(feature.properties.NAME_1);
            const data = projectData[stateName] || { list: [], districtSet: new Set(), blockSet: new Set(), villageSet: new Set(), totalBeneficiaries: 0 };
            const districtCount = data.districtSet.size;
            const blockCount = data.blockSet.size;
            const villageCount = data.villageSet.size;
            const livesImpactedNum = data.totalBeneficiaries;

            const hasProjects = data.list.length > 0;

            if (hasProjects) {
              // PIN (📍) REMOVED FROM TOOLTIP
              layer.bindTooltip(`<div style="display:flex; flex-direction:column; align-items:center; line-height:1.2;"><span><b>${stateName}</b></span></div>`, {
                permanent: true,
                direction: "center",
                className: "custom-tooltip-permanent",
              });
            } else {
              layer.bindTooltip(`<b>${stateName}</b>`, {
                direction: "center",
                className: "custom-tooltip",
              });
            }

            layer.on({
              mouseover: (e) => {
                const l = e.target;
                l.setStyle({ fillColor: "#1A2718", fillOpacity: 1, weight: 2 });
                if (l._path) l._path.classList.add("state-hovered");
              },
              mouseout: (e) => {
                const l = e.target;
                geoLayerRef.current.resetStyle(l);
                if (l._path) l._path.classList.remove("state-hovered");
              },
              click: (e) => {
                L.DomEvent.stopPropagation(e);
                if (onStateSelect) {
                  const staticInfo = stateDataMap[stateName] || { 
                    image: "https://via.placeholder.com/400x250?text=SDF+Presence", 
                    livesImpacted: "0" 
                  };

                  onStateSelect({
                    name: stateName,
                    projects: data.list,
                    districtCount: districtCount,
                    blockCount: blockCount,
                    villageCount: villageCount,
                    staticImage: staticInfo.image,
                    livesImpacted: livesImpactedNum > 0 ? livesImpactedNum : staticInfo.livesImpacted
                  });
                }
              },
            });
          },
        }).addTo(map);

        map.fitBounds(geoLayerRef.current.getBounds());
        setLoading(false);
      } catch (error) {
        console.error("Map Data Error:", error);
        setLoading(false);
      }
    };

    fetchData();

    const handleResize = () => {
      if (mapRef.current && geoLayerRef.current) {
        mapRef.current.invalidateSize();
        mapRef.current.fitBounds(geoLayerRef.current.getBounds());
      }
    };
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [onStateSelect]);

  return (
    <div className="relative w-full h-full bg-transparent overflow-hidden">
      <style>{`
        .leaflet-container { background: transparent !important; }
        path.state-feature {
            transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1), fill 0.3s ease;
            cursor: pointer;
            outline: none;
        }
        path.state-hovered {
            transform: scale(1.015) translate(0, -2px);
            filter: drop-shadow(0px 8px 15px rgba(0, 0, 0, 0.5));
            z-index: 999 !important;
        }
        .custom-tooltip {
            background: white !important;
            border: none !important;
            border-radius: 8px !important;
            box-shadow: 0 10px 30px rgba(0,0,0,0.15) !important;
            padding: 8px 12px !important;
            color: #1a1a1a !important;
            font-weight: bold;
        }
        .custom-tooltip-permanent {
            background: transparent !important;
            border: none !important;
            box-shadow: none !important;
            color: white !important;
            font-weight: bold;
            font-size: 0.85rem;
            text-shadow: 1px 1px 3px rgba(0,0,0,0.8);
            pointer-events: none;
        }
        /* EXTRA SAFETY TO HIDE ANY STATIC PINS/LABELS */
        .leaflet-marker-icon, 
        .leaflet-marker-shadow {
            display: none !important;
        }
      `}</style>

      {loading && (
        <div className="map-loader absolute inset-0 flex items-center justify-center font-bold text-[#576123]">
          Loading Map Data...
        </div>
      )}

      <div id="map" style={{ height: "100%", width: "100%", zIndex: 1 }}></div>
    </div>
  );
};

export default MapSection;