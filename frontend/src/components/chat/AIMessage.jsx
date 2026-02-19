import React from 'react';
import { Bot, Clock } from 'lucide-react';

const AIMessage = ({ message }) => {
    const formatTime = (isoString) => {
        if (!isoString) return 'Heure inconnue';
        return new Date(isoString).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    };

    const time = formatTime(message.date);
    
    return (
        <div className="ai-msg">
            <div className="ai-avatar"><Bot className="w-5 h-5" /></div>
            <div className="ai-content">
                <div className="ai-bubble">
                    <div className="msg-text">
                        {message.contenu || "Réponse en cours..."}
                    </div>
                </div>
                <div className="msg-meta"><Clock className="w-3 h-3" /><span>{time}</span></div>
            </div>
        </div>
    );
};

export default AIMessage;
