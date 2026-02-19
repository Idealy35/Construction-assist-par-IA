import React from 'react';
import { LogOut, Home, Send, User,ClipboardList, Settings } from 'lucide-react';

const Sidebar = ({ navigate, user, onLogout }) => {
  const navItems = [
    { name: 'Accueil', path: '/dashboard/home', icon: <Home className="sidebar-icon" /> },
    { name: 'Modèle de plan', path: '/dashboard/broadcast', icon: <ClipboardList className="sidebar-icon" /> },
    { name: 'Intégrations', path: '/dashboard/integrations', icon: <Settings className="sidebar-icon" /> },
   
    { name: 'Assistant IA', path: '/chat', icon: <Send className="sidebar-icon" /> },
   
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-header">e‑construction</div>

      <nav className="sidebar-nav">
        {navItems.map(({ name, path, icon }) => (
          <button key={name} onClick={() => navigate(path)} className="sidebar-link">
            {icon}
            <span>{name}</span>
          </button>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="sidebar-user">
          <User className="sidebar-icon" />
          <div>
            {(() => {
              const email = user?.email || (typeof window !== 'undefined' ? window.localStorage.getItem('current_user_email') : null);
              const name = user?.nom || (email ? (email.split('@')[0] || 'Utilisateur') : 'Utilisateur');
              return (
                <>
                  <div>{name}</div>
                  <div className="muted">{email || 'N/A'}</div>
                </>
              );
            })()}
          </div>
        </div>

        <button onClick={onLogout} className="sidebar-action danger">
          <LogOut className="sidebar-icon" />
          <span>Se déconnecter</span>
        </button>

        <button onClick={() => navigate('/signup')} className="sidebar-action">
          <User className="sidebar-icon" />
          <span>Changer de compte</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
