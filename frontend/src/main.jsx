// frontend/src/main.jsx (Modification)

import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx';
import { AuthProvider } from './context/AuthContext.jsx'; // <-- Importer AuthProvider
import './index.css';
import './style/Style.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider> {/* <-- Envelopper l'application ici */}
        <App />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>,
);
