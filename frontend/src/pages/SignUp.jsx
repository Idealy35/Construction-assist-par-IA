import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const SignUp = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    // 1. NOUVEL ÉTAT pour gérer l'affichage du mot de passe
    const [showPassword, setShowPassword] = useState(false); 
    const navigate = useNavigate();
    const [locked, setLocked] = useState(true);

    useEffect(() => {
        setName('');
        setEmail('');
        setPassword('');
        const t = setTimeout(() => setLocked(false), 60);
        return () => clearTimeout(t);
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setSuccess(null);
        setIsSubmitting(true);
        try {
            const res = await (await import('../api/axiosConfig.js')).default.post('/dev_signup', {
                name,
                email,
                password,
            });
            if (res.data?.status === 'created') {
                setSuccess("Compte créé. Vous pouvez vous connecter.");
                setTimeout(() => navigate('/login'), 1000);
            } else if (res.data?.error) {
                setError(res.data.error);
            } else {
                setError("Échec de l'inscription.");
            }
        } catch {
            setError("Échec de l'inscription.");
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
                        <p className="login-subtext">Accédez à e‑Construction pour concevoir et discuter de vos plans.</p>
                    </section>

                    <section className="login-right">
                        <h2 className="login-form-title">Page d'inscription</h2>
                        <form className="login-form" onSubmit={handleSubmit} autoComplete="off">
                            <input type="text" name="username" style={{display:'none'}} />
                            <input type="password" name="password" style={{display:'none'}} />
                            {/* Input Nom */}
                            <label className="login-label" htmlFor="name">Nom</label>
                            <input
                                id="name"
                                name="no_autofill_name"
                                type="text"
                                className="login-input"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                                disabled={isSubmitting}
                                readOnly={locked}
                                onFocus={() => setLocked(false)}
                            />

                            {/* Input Email */}
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

                            {/* Input Mot de passe */}
                            <label className="login-label" htmlFor="password">Mot de passe</label>
                            <input
                                id="password"
                                name="no_autofill_password"
                                // 2. MODIFICATION : Changer le type en fonction de l'état showPassword
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

                            {/* 3. NOUVELLE SECTION : Checkbox pour afficher le mot de passe */}
                            <div className="login-row">
                                <label className="login-remember">
                                    <input 
                                        type="checkbox" 
                                        checked={showPassword} 
                                        onChange={(e) => setShowPassword(e.target.checked)} 
                                    />
                                    <span>Afficher le mot de passe</span>
                                </label>
                            </div>
                            {/* FIN NOUVELLE SECTION */}

                            {error && <div className="login-error">{error}</div>}
                            {success && <div className="login-error" style={{background:'rgba(0,255,0,0.18)',border:'1px solid rgba(0,255,0,0.4)'}}>{success}</div>}

                            <button type="submit" className="login-button" disabled={isSubmitting}>
                                {isSubmitting ? 'Creating…' : 'S\'inscrire'}
                            </button>

                            <div className="login-links">
                                <p>Vous avez déjà un compte ? <a href="/login">Se connecter</a></p>
                            </div>
                        </form>
                    </section>
                </div>
            </div>
        </div>
    );
};

export default SignUp;
