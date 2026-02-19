import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // **MODIFICATION 1 : Utiliser un état clair pour afficher/masquer**
  const [showPassword, setShowPassword] = useState(false); 
  
  const navigate = useNavigate();
  const [locked, setLocked] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => {
      setEmail('');
      setPassword('');
      setLocked(false);
    }, 60);
    return () => clearTimeout(t);
  }, []);

  React.useEffect(() => {
    setEmail('');
    setPassword('');
  }, []);
  const { login } = useAuth();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      if (err.response && err.response.status === 401) {
        setError('Email ou mot de passe incorrect.');
      } else {
        setError('Erreur de connexion. Vérifiez le backend.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-overlay">
        <div className="login-grid">
          <section className="login-left">
            <h1 className="login-title">Bienvenue<br/>à e-construction</h1>
            <p className="login-subtext">Votre maison, repensée par l'intelligence artificielle.</p>
          </section>

          <section className="login-right">
            <h2 className="login-form-title">Page de connexion</h2>
            <form className="login-form" onSubmit={handleLogin} autoComplete="off">
              <input type="text" name="username" style={{display:'none'}} />
              <input type="password" name="password" style={{display:'none'}} />
              <label className="login-label" htmlFor="email">Email</label>
              <input
                id="email"
                name="no_autofill_email"
                type="email"
                className="login-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isSubmitting}
                autoComplete="off"
                readOnly={locked}
                onFocus={() => setLocked(false)}
              />

              <label className="login-label" htmlFor="password">Mot de passe</label>
              <input
                id="password"
                name="no_autofill_password"
                // **MODIFICATION 2 : Changement du type selon l'état showPassword**
                type={showPassword ? 'text' : 'password'}
                className="login-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isSubmitting}
                autoComplete="new-password"
                readOnly={locked}
                onFocus={() => setLocked(false)}
              />

              <div className="login-row">
                <label className="login-remember">
                  <input 
                    type="checkbox" 
                    checked={showPassword} 
                    // **MODIFICATION 3 : Mettre à jour l'état showPassword**
                    onChange={(e) => setShowPassword(e.target.checked)} 
                  />
                  <span>Afficher le mot de passe</span>
                </label>
              </div>

              {error && <div className="login-error">{error}</div>}

              <button type="submit" className="login-button" disabled={isSubmitting}>
                {isSubmitting ? 'Signing in…' : 'Se connecter'}
              </button>

              <div className="login-links">
                <p>Pas de compte ? <a href="/signup">Inscrivez-vous</a></p>
              </div>
            </form>
          </section>
        </div>
      </div>
    </div>
  );
};

export default Login;
