import React from "react";
import { useNavigate } from "react-router-dom";
import salon from "../assets/salon.jpg";
import chambre from "../assets/chambre.jpg";
 

export default function HomeRealEstate() {
  const navigate = useNavigate();
  const go = (path) => () => navigate(path);
  return (
    <section className="home-section" style={{ background: "#e5e7eb" }}>
      
      {/* TOP BAR */}
      <div className="home-topbar">
        <div className="home-topbar-content">
          <div className="home-topbar-left">
            
          </div>
        </div>
      </div>

      {/* NAVBAR */}
      <div className="home-navbar">
        <div className="home-nav-content">
          <div className="home-brand">e-construction</div>

          <div className="home-nav-links">
            <a href="#" onClick={go('/dashboard/about')}>A propos</a>
            <a href="#" onClick={go('/dashboard/service')}>Service</a>
            <a href="#" onClick={go('/dashboard/team')}>Equipe</a>
            <a href="#" onClick={go('/dashboard/contact')}>Contact</a>
          </div>

          
        </div>
      </div>

      <div className="home-hero">
        <div className="home-hero-content">
          <div>
            <h1 className="home-hero-title">
              VOTRE MAISON  <span>CONCUE </span>ET OPTMISEE PAR L'IA<br /> 
            </h1>
            <div className="home-divider" />
            <p className="home-hero-sub">
              Notre application utilise la puissance de l’IA pour interpréter les plans de maisons, détecter les erreurs, analyser les structures et générer des recommandations intelligentes. Une solution complète pour accompagner étudiants, architectes et constructeurs.
            </p>
           
          </div>

          <div className="home-hero-circles">
            

            <div className="home-circle-sm1">
              <img
                src={salon}
                alt="Salon"
                onError={(e) => { e.target.src = "https://via.placeholder.com/800x600?text=Image+Introuvable"; }}
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
              <div className="home-arc-purple" />
            </div>

            <div className="home-circle-sm2">
              <img
                src={chambre}
                alt="Chambre"
                onError={(e) => { e.target.src = "https://via.placeholder.com/800x600?text=Image+Introuvable"; }}
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            </div>

            
          </div>
        </div>
      </div>

      
    </section>
  );
}
