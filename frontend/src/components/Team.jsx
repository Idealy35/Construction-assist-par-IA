import React from "react";
// 1. Importer les images locales en haut du fichier
import idealyImg from "../assets/ideal.jpg";
import teamImg2 from "../assets/wbs.jpg"; 
import teamImg3 from "../assets/boy.jpg"; 
export default function Team() {
  const [imgs, setImgs] = React.useState([null, null, null]);

  React.useEffect(() => {
    const safe = (k) => {
      const v = localStorage.getItem(k);
      return v && /^data:image\//.test(v) ? v : null;
    };
    setImgs([safe("team_img_0"), safe("team_img_1"), safe("team_img_2")]);
  }, []);

  const cards = [
    { name: "Idealy RHI", role: "leader créatif", bio: "Développeur full-stack en IA avec une passion pour la création d'expériences utilisateur intuitives et engageantes." },
    { name: "WBS Heriniaina", role: "directeur", bio: "Ingenieure en informatique spécialisée dans le développement d'applications web et mobiles et Administrateur de réseau et de système et doctorant en Informatique et CEO Spray-info." },
    { name: "Norbert ", role: "Assistant de dévellopement", bio: "devellopeur senior en IA avec une expérience de 5 ans dans le domaine." },
  ];

  // 2. Utiliser les variables d'importation dans le tableau fallbacks
  const fallbacks = [
    idealyImg, // Premier élément : idealy.png
    teamImg2,  // Deuxième élément : image2.png
    teamImg3,  // Troisième élément : image3.png
  ];

  return (
    <section className="team-section">
      <div className="team-container">
        <h2 className="team-title">Notre équipe</h2>
        <p className="team-sub">La réalisation de notre application repose sur la collaboration de cette équipe talentueuse que nous avons le plaisir de vous présenter.</p>

        <div className="team-grid">
          {cards.map((c, i) => (
            <div key={c.name} className="team-card">
              <div className="team-photo">
                {/* L'image affichée sera soit celle de localStorage, soit l'image locale importée */}
                <img src={imgs[i] || fallbacks[i]} alt={c.name} onError={(e)=>{ e.target.src = fallbacks[i]; }} />
              </div>
              <div className="team-name">{c.name}</div>
              <div className="team-role">{c.role}</div>
              <p className="team-bio">{c.bio}</p>
              
             
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
