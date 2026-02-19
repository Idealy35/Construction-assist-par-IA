import React, { useState } from "react";

export default function Contact() {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [status, setStatus] = useState("");

  const submit = (e) => {
    e.preventDefault();
    const ok = email.trim() && name.trim();
    if (!ok) {
      setStatus("Veuillez renseigner votre email et votre nom.");
      return;
    }
    const msg = { email, name, date: new Date().toISOString() };
    const raw = localStorage.getItem("contact_messages") || "[]";
    const list = (() => { try { return JSON.parse(raw) } catch { return [] } })();
    localStorage.setItem("contact_messages", JSON.stringify([msg, ...list]));
    setStatus("Merci, votre message a été envoyé.");
    setEmail("");
    setName("");
  };

  return (
    <section className="contact-section">
      <div className="contact-container">
        <h2 className="contact-title">Contactez‑nous</h2>
        <p className="contact-sub">Des questions ou des remarques ? Écrivez‑nous simplement un message !</p>

        <form className="contact-form" onSubmit={submit}>
          <input
            className="contact-input"
            type="email"
            placeholder="Enter a valid email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            className="contact-input"
            type="text"
            placeholder="Enter your Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <button className="contact-submit" type="submit">SOUMETTRE</button>
          {status && <div className="contact-status">{status}</div>}
        </form>

        <div className="contact-info-grid">
          <div className="contact-card">
            <div className="contact-icon">🏃</div>
            <div>
              <div className="contact-card-title">À PROPOS DU SPRAY-INFO</div>
            
              <div className="contact-card-text">Services numériques </div>
              <div className="contact-card-text">Centre de formation</div>
            </div>
          </div>
          <div className="contact-card">
            <div className="contact-icon">☎</div>
            <div>
              <div className="contact-card-title">TÉLÉPHONE ET MAIL</div>
              <div className="contact-card-text">+261 38 37 930 53</div>
              <div className="contact-card-text">www.sprayinfo@siwbs.com</div>
            </div>
          </div>
          <div className="contact-card">
            <div className="contact-icon">📍</div>
            <div>
              <div className="contact-card-title">LOCALISATION</div>
              <div className="contact-card-text">Imandry,Fianarantsoa,Madagascar</div>
              <div className="contact-card-text">Fianarantsoa,301,Madagascar</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
