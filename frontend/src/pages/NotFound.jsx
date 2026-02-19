import React from 'react';

const NotFound = () => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="text-center p-8 bg-white rounded-xl shadow-2xl">
        <h1 className="text-6xl font-extrabold text-indigo-600 mb-4">404</h1>
        <p className="text-xl text-gray-700 mb-6">Page non trouvée</p>

        <a href="/" className="text-indigo-500 hover:text-indigo-700 font-medium transition duration-200">
          Retourner à l'accueil
        </a>
      </div>
    </div>
  );
};

export default NotFound;