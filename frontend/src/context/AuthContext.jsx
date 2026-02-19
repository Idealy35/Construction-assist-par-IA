// frontend/src/context/AuthContext.jsx
import React, { createContext, useState, useContext, useEffect } from 'react';
import axiosInstance from '../api/axiosConfig.js';

const AuthContext = createContext();

// Fonction utilitaire pour décoder le token (rudimentaire pour l'exemple)
const decodeToken = (token) => {
    try {
        const payload = token.split('.')[1];
        return JSON.parse(atob(payload)); 
    } catch {
        return null;
    }
};

export const AuthProvider = ({ children }) => {
    // État initial : lit le token et les infos utilisateur depuis le stockage local
    const [token, setToken] = useState(localStorage.getItem('jwt_token'));
    const [user, setUser] = useState(token ? decodeToken(token) : null);

    useEffect(() => {
        const init = async () => {
            try {
                const t = localStorage.getItem('jwt_token');
                if (t) {
                    const me = await axiosInstance.get('/user/me');
                    setUser(me.data);
                }
            } catch {
                // ignore, stay unauthenticated display
            }
        };
        init();
    }, []);
    
    // Fonction de connexion qui appelle l'API Symfony
    const login = async (email, password) => {
        try {
            const response = await axiosInstance.post('/login_check', {
                email,
                password,
            });
            
            const newToken = response.data.token;
            
            // Stockage du token
            localStorage.setItem('jwt_token', newToken);
            localStorage.setItem('current_user_email', email);
            setToken(newToken);
            try {
                const me = await axiosInstance.get('/user/me');
                setUser(me.data);
            } catch {
                const decoded = decodeToken(newToken);
                setUser(decoded || { email });
            }

            return true;
        } catch (error) {
            console.error('Échec de la connexion:', error);
            // Nettoyage en cas d'échec
            logout(); 
            throw error; // Renvoyer l'erreur pour affichage dans le composant
        }
    };

    const logout = () => {
        localStorage.removeItem('jwt_token');
        localStorage.removeItem('current_user_email');
        setToken(null);
        setUser(null);
        delete axiosInstance.defaults.headers.common['Authorization'];
    };

    return (
        <AuthContext.Provider value={{ token, user, login, logout, isAuthenticated: !!token }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
