import React from "react";

const ClockIcon = (props) => (
  <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
);
const MapPinIcon = (props) => (
  <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
);

const DesignCard = (props) => {
  const IconCmp = props.icon;
  return (
    <div className="design-card">
      <div className="design-card-body">
        <div className="design-card-left">
          <div className="design-image">
            <img src={props.image} alt={props.altImage} />
          </div>
        </div>
        <div className="design-card-right">
          <div>
            <h2 className="design-title">{props.title}</h2>
            <div className="design-details">
              <p className="design-score" style={{ color: props.accent }}>{props.score}<span className="design-score-label"> Score d'Optimisation</span></p>
              <p className="design-detail"><IconCmp className="design-icon" /><span className="design-detail-label">Détail :</span> {props.detail}</p>
            </div>
          </div>
          <div className="design-actions">
            <button className="design-btn primary">Voir le détail et les coûts</button>
            <button className="design-btn secondary">Visualiser en 3D</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function DesignProposals() {
  const propositions = [
    { id: 1, title: "Proposition A : Isolation Renforcée", score: "89%", detail: "15% Économie Énergétique", icon: ClockIcon, image: "https://placehold.co/300x300/e0f2f1/047857?text=Plan+A", altImage: "Rendu 3D Isolation Renforcée", accent: "#10b981" },
    { id: 2, title: "Proposition B : Matériaux Locaux", score: "75%", detail: "-8% Coût Initial", icon: MapPinIcon, image: "https://placehold.co/300x300/ffe4e6/be123c?text=Plan+B", altImage: "Rendu 3D Matériaux Locaux", accent: "#ef4444" },
    { id: 3, title: "Proposition C : Orientation Optimale", score: "94%", detail: "Conformité RT 2020", icon: ClockIcon, image: "https://placehold.co/300x300/e0f7fa/00bcd4?text=Plan+C", altImage: "Rendu 3D Orientation Optimale", accent: "#3b82f6" },
  ];

  return (
    <section className="design-section">
      <div className="design-container">
        <h1 className="design-header">Propositions d'Optimisation (Moteur IA)</h1>
        <div className="design-grid">
          {propositions.map((p) => (
            <DesignCard key={p.id} {...p} />
          ))}
        </div>
      </div>
    </section>
  );
}
