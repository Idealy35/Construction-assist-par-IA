import React from 'react';
//import './index.css';
import '../style/Style.css'
import profileImage from '../assets/sprayinfo.jpg'
const About = () => {
  return (
    <div className="about-container">
      <div className="about-content">
        <div className="image-section">
          <div className="profile-image-wrapper">
            <img
              className="profile-photo"
              src={profileImage}
              alt="Portrait"
              onError={(e) => { e.target.src = "https://via.placeholder.com/800x600?text=Image+Introuvable"; }}
            />
            
          </div>
        </div>

        <div className="text-section">
          <h2 className="title">À propos de nous</h2>
          <p className="subtitle">Qui sommes-nous?</p>
          <div className="body-text">
            <p>
             Spray info est un centre de formation en technologie, en développement personnel et en communication
            </p>
          </div>
        </div>
      </div>
      
      <div className="bottom-text">
        <p>
          Le mot Spray_info vient de l’assemblage des deux mots : « Spray » + « Info ». Spray est un mot d’origine anglaise qui signifie branche, et info est l’abréviation du mot informatique. C’est ainsi que naît le nom Spray_info ou « Si », qui signifie branche en informatique.
        </p>
      </div>
    </div>
  );
};

export default About;
