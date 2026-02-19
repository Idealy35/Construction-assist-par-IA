import React from "react";

export default function Services() {
  const [hero, setHero] = React.useState(null);

  React.useEffect(() => {
    const v = localStorage.getItem("services_hero_image");
    if (v) setHero(v);
  }, []);

  

  return (
    <section className="services">
      <div className="services-hero" style={hero ? { backgroundImage: `url(${hero})` } : undefined}>
        <div className="services-hero-overlay" />
        <div className="services-hero-content">
          <h1 className="services-title">Services</h1>
         
        </div>
      </div>

      <div className="services-grid">
        <div className="services-card">
          <div className="services-card-title">Salesforce consulting</div>
          <div className="services-card-text">Spray_Info est votre Hub Numérique 3.0, un espace complet qui réunit l’essentiel pour accompagner vos besoins académiques et professionnels. Nous offrons une université privée dédiée aux études supérieures, des services numériques conçus pour développer vos projets, ainsi qu’un centre de formation capable de renforcer rapidement vos compétences. Notre objectif est simple : fournir des solutions fiables, modernes et adaptées à chaque profil.</div>
        </div>
        <div className="services-card">
          <div className="services-card-title">Salesforce implementation</div>
          <div className="services-card-text">Nous mettons à votre disposition une équipe engagée et passionnée, prête à vous guider dans vos démarches, à vous former et à vous accompagner dans la réalisation de vos ambitions.  We are Spray_Info, we are Spray_Family  : ensemble, nous construisons un environnement numérique performant, accessible et tourné vers l’avenir.</div>
        </div>
         <div className="services-card">
          <div className="services-card-title"></div>
          <div className="services-card-text">Le logiciel e-Construction est le fruit de la créativité et du travail d’un étudiant stagiaire au sein de Spray-Info. Conçu dans un environnement d’innovation, ce projet témoigne de la capacité de nos stagiaires à transformer une idée en un outil numérique concret et fonctionnel. Grâce à l’encadrement de notre équipe technique, ce logiciel a pu être structuré, amélioré et adapté aux besoins réels des professionnels du bâtiment.</div>
        </div>
        <div className="services-card">
          <div className="services-card-title"></div>
          <div className="services-card-text">e-Construction a pour objectif principal d’assister les ingénieurs et les architectes dans la conception d’une maison. Il facilite la planification, l’organisation et la visualisation d’un projet de construction, en offrant des fonctionnalités simples, pratiques et rapides d’utilisation. Ce logiciel contribue à réduire les erreurs, optimiser les choix techniques et améliorer la qualité du travail. Il s’inscrit pleinement dans notre vision : mettre le numérique au service du génie civil et ouvrir la voie à des solutions modernes et efficaces.</div>
        </div>

      </div>
    </section>
  );
}
