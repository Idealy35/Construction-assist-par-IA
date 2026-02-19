// Fichier : src/pages/Dashboard.jsx (ou votre emplacement actuel)

import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import Sidebar from '../components/Sidebar.jsx';
 
import HomeRealEstate from '../components/HomeRealEstate.jsx';
import About from '../components/About.jsx';
import Contact from '../components/Contact.jsx';
import Services from '../components/Services.jsx';
import DesignProposals from '../components/DesignProposals.jsx';
//import planPlain from '../assets/salon.jpg';

import planPlain from '../assets/moderne.webp';
import planT from '../assets/Gemeaux.jpg';
import plan from '../assets/etage.jpg';
import Team from '../components/Team.jsx';
import planT4 from '../assets/plan-pied.png';
import planT5 from '../assets/maisonL.jpg';
import planT6 from '../assets/ecologique.jpg';
import planT7 from '../assets/tinny.jpg';
const Dashboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const location = useLocation();

  const section = React.useMemo(() => {
    const p = location.pathname.toLowerCase();
    if (p.includes('/dashboard/about')) return 'about';
    
    
    if (p.includes('/dashboard/broadcast')) return 'broadcast';
    if (p.includes('/dashboard/integrations')) return 'integrations';
    if (p.includes('/dashboard/service')) return 'service';
    if (p.includes('/dashboard/team')) return 'team';
    if (p.includes('/dashboard/contact')) return 'contact';
    return 'home';
  }, [location.pathname]);

  
  const [broadcasts, setBroadcasts] = React.useState([]);
  const [integrations, setIntegrations] = React.useState({ crm: false, storage: false, email: false });
  const parseSafe = (s, fallback) => { try { return JSON.parse(s); } catch { return fallback; } };
  React.useEffect(() => {
    const b = parseSafe(localStorage.getItem('dashboard_broadcasts') || '[]', []);
    if (Array.isArray(b)) setBroadcasts(b);
    const i = parseSafe(localStorage.getItem('dashboard_integrations') || '{}', {});
    if (i && typeof i === 'object') setIntegrations({ crm: !!i.crm, storage: !!i.storage, email: !!i.email });
  }, []);
  React.useEffect(() => { localStorage.setItem('dashboard_broadcasts', JSON.stringify(broadcasts)); }, [broadcasts]);
  React.useEffect(() => { localStorage.setItem('dashboard_integrations', JSON.stringify(integrations)); }, [integrations]);

  

  

  
  React.useEffect(() => {
    // Suppression de l’ouverture auto dans un nouvel onglet pour afficher l’intégration inline
    // if (section === 'integrations') {
    //   window.open('https://www.sweethome3d.com/SweetHome3DJSOnline.jsp', '_blank', 'noopener,noreferrer');
    //   navigate('/dashboard/home');
    // }
  }, [section, navigate]);

  return (
    <div className="dash-layout">
      <Sidebar navigate={navigate} user={user} onLogout={logout} />
      <main className="dash-content" style={section === 'integrations' || section === 'home' ? { padding: 0 } : undefined}>
        {section === 'home' && (<HomeRealEstate />)}
        {section === 'about' && (<About />)}
        {section === 'contact' && (<Contact />)}
        {section === 'service' && (<Services />)}
        {section === 'team' && (<Team />)}
        {section === 'integrations' && (
          <section className="integrations-section" style={{ display: 'flex', flexDirection: 'column', height: '100vh', margin: 0, padding: 0 }}>
            <div className="iframe-wrapper" style={{ position: 'relative', flex: '1 1 auto', height: '100%', width: '100%' }}>
              <iframe
                title="Sweet Home 3D"
                src="https://www.sweethome3d.com/SweetHome3DJSOnline.jsp"
                style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 0 }}
                sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
                allow="fullscreen"
              />
              
            </div>
          </section>
        )}
        {section === 'broadcast' && (
          <section className="model-section">
            <h2 className="model-title">Voici un type de modele</h2>
            <div className="model-card">
              <div className="model-card-body">
                <div className="model-card-left">
                  <h3 className="model-card-title">1. Maison Moderne</h3>
                  <p className="model-card-text">Le modèle présente une architecture épurée, avec toit plat, grandes vitrines et lignes minimalistes.C’est typique des maisons :</p>
                  <ul className="model-list">
                    <li>Familiales en zone urbaine</li>
                    <li>Projets contemporains</li>
                    <li>Constructions haut standing</li>
                  </ul>
                  
                </div>
                <div className="model-card-right">
                  <div className="model-image"><img src={planPlain} alt="Plan Plain‑Pied" /></div>
                </div>
              </div>
            </div>

            <div className="model-card">
              <div className="model-card-body">
                <div className="model-card-left">
                  <h3 className="model-card-title">2. Maison Traditionnelle</h3>
                  <p className="model-card-text">Le modèle présente un toit en pente, une façade classique et une répartition simple des pièces.C’est typique des maisons :</p>
                  <ul className="model-list">
                    <li>Familiales rurales</li>
                    <li>Maisons de village</li>
                    <li>Constructions économiques</li>
                  </ul>
                  
                </div>
                <div className="model-card-right">
                  <div className="model-image"><img src={planT} alt="Plan T" /></div>
                </div>
              </div>
            </div>

            <div className="model-card">
              <div className="model-card-body">
                <div className="model-card-left">
                  <h3 className="model-card-title">3. Maison à Étage</h3>
                  <p className="model-card-text">Le modèle présente deux niveaux séparés : espace jour en bas, espace nuit en haut.C’est typique des maisons :</p>
                  <ul className="model-list">
                    <li>Familles avec enfants</li>
                    <li>Terrains de petite taille</li>
                    <li>Projets de lotissement</li>
                  </ul>
                  
                </div>
                <div className="model-card-right">
                  <div className="model-image"><img src={plan} alt="Plan 3" /></div>
                </div>
              </div>
            </div>
            <div className="model-card">
              <div className="model-card-body">
                <div className="model-card-left">
                  <h3 className="model-card-title">4. Maison de Plain-pied</h3>
                  <p className="model-card-text">Le modèle présente toutes les pièces au même niveau pour un accès facile.C’est typique des maisons :</p>
                  <ul className="model-list">
                    <li>Personnes âgées</li>
                    <li>Familles avec enfants en bas âge</li>
                    <li>Constructions rapides et économiques</li>
                  </ul>
                  
                </div>
                <div className="model-card-right">
                  <div className="model-image"><img src={planT4} alt="Plan T4" /></div>
                </div>
              </div>
            </div>
            <div className="model-card">
              <div className="model-card-body">
                <div className="model-card-left">
                  <h3 className="model-card-title">5.Maison en L </h3>
                  <p className="model-card-text">Le modèle présente une forme en L permettant une cour intérieure ou un jardin protégé.C’est typique des maisons :</p>
                  <ul className="model-list">
                    <li>Familiales modernes</li>
                    <li>Constructions semi-luxueuses</li>
                    <li>Maisons avec espace extérieur intime</li>
                  </ul>
                  
                </div>
                <div className="model-card-right">
                  <div className="model-image"><img src={planT5} alt="Plan T5" /></div>
                </div>
              </div>
            </div>
            <div className="model-card">
              <div className="model-card-body">
                <div className="model-card-left">
                  <h3 className="model-card-title">6. Maison Écologique</h3>
                  <p className="model-card-text">Le modèle présente une orientation solaire optimale, matériaux naturels et faible consommation énergétique.C’est typique des maisons :</p>
                  <ul className="model-list">
                    <li>Propriétaires soucieux de l’environnement</li>
                    <li>Projets durables</li>
                    <li>Zones climatiques variées</li>
                  </ul>
                  
                </div>
                <div className="model-card-right">
                  <div className="model-image"><img src={planT6} alt="Plan T6" /></div>
                </div>
              </div>
            </div>
            <div className="model-card">
              <div className="model-card-body">
                <div className="model-card-left">
                  <h3 className="model-card-title">7. Tiny House</h3>
                  <p className="model-card-text">Le modèle présente une petite surface mais une optimisation maximale de l’espace intérieur.C’est typique des maisons :</p>
                  <ul className="model-list">
                    <li>Etudiants ou jeunes couples</li>
                    <li>Projets mobiles</li>
                    <li>Logements Airbnb minimalistes</li>
                  </ul>
                  
                </div>
                <div className="model-card-right">
                  <div className="model-image"><img src={planT7} alt="Plan T7" /></div>
                </div>
              </div>
            </div>

             
          </section>
        )}
      
       
        
        
       
         
       
       
      </main>
    </div>
  );
};

export default Dashboard;
