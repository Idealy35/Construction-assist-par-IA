import React from 'react';
import { User, Clock } from 'lucide-react';

const UserMessage = ({ message }) => {
    const formatTime = (isoString) => {
        if (!isoString) return 'Heure inconnue';
        return new Date(isoString).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    };

    const time = formatTime(message.date);
    const imageUrl = message.imageFilename || message.image_url;

    return (
        <div className="user-msg">
            <div className="user-content">
                <div className="user-bubble">
                    {imageUrl && (
                        <div className="msg-image">
                            <img src={imageUrl} alt="Image utilisateur" />
                        </div>
                    )}
                    <div className="msg-text">{message.contenu || "Requête sans texte"}</div>
                </div>
                <div className="msg-meta"><span>{time}</span><Clock className="w-3 h-3" /></div>
            </div>
            <div className="user-avatar"><User className="w-5 h-5" /></div>
        </div>
    );
};

export default UserMessage;
