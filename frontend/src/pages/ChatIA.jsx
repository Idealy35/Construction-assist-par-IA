import React, { useState, useEffect, useRef } from 'react';
import { Upload, PlusCircle, MessageSquare, Loader2, Trash2, Mic, Volume2, StopCircle } from 'lucide-react';
// CORRECTION DES IMPORTS: Ajout des extensions de fichiers (.js, .jsx) pour résoudre les problèmes d'esbuild.
import axiosInstance from '../api/axiosConfig.js'; 
import { useAuth } from '../context/AuthContext.jsx';
import UserMessage from '../components/chat/UserMessage.jsx'; 
import AIMessage from '../components/chat/AIMessage.jsx'; 

const ChatIA = () => {
  const [prompt, setPrompt] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState(null);
  const [messages, setMessages] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [activeSessionId, setActiveSessionId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [recording, setRecording] = useState(false);
  const recognitionRef = useRef(null);
  const requestControllerRef = useRef(null);
  const [autoSpeak, setAutoSpeak] = useState(false);
  
  const [modePhase, setModePhase] = useState('await_plan');
  const [planSummary, setPlanSummary] = useState('');
  

  const messagesEndRef = useRef(null); // Pour scroller vers le bas des messages
  const cleanText = (t) => {
    if (!t) return '';
    let s = t;
    s = s.replace(/```[\s\S]*?```/g, '');
    s = s.replace(/[*_]{1,3}/g, '');
    s = s.replace(/\s{2,}/g, ' ');
    return s.trim();
  };

  const simplifyText = (t) => {
    const src = (t || '').replace(/\s{2,}/g, ' ').trim();
    if (!src) return src;
    const sentences = src.split(/(?<=[.!?])\s+/);
    if (sentences.length <= 2) return src;
    const bullets = sentences.map((x) => `- ${x.trim()}`);
    return bullets.join('\n');
  };

  const detectLanguage = (t) => {
    const s = (t || '').toLowerCase();
    const mgWords = /(manahoana|ahoana|misaotra|azafady|salama|tsara|firy|fiangonana|trano|firenena|malagasy|ny\s|sy\s|ao\s|amin)/;
    const frWords = /(bonjour|salut|merci|s'il vous plaît|svp|bonjour|comment|maison|pièce|surface|analyse|plan)/;
    const enWords = /(hello|hi|please|thanks|house|room|surface|analyze|plan)/;
    if (mgWords.test(s)) return 'mg';
    if (frWords.test(s)) return 'fr';
    if (enWords.test(s)) return 'en';
    return null;
  };

  const enforceIdentity = (t) => {
    if (!t) return t;
    const identity = 'Je suis e‑construction AI Assistant, créé par Ingénierie IA Idealy.';
    const ban = /(google|openai|anthropic|meta|microsoft|mod[èe]le\s+linguistique|grand\s+mod[èe]le)/i;
    const lines = String(t).split(/\n+/);
    const cleaned = lines.filter((line) => !ban.test(line) && line.trim() !== identity).join('\n').trim();
    if (lastIsIdentityRef.current) {
      return identity;
    }
    return cleaned || '';
  };

  const lastPromptRef = useRef('');
  const lastIsIdentityRef = useRef(false);

  const speakText = (text) => {
    try {
      const s = window.speechSynthesis;
      if (!s || !text) return;
      const u = new SpeechSynthesisUtterance(text);
      const lang = detectLanguage(lastPromptRef.current) || 'fr';
      u.lang = lang === 'en' ? 'en-US' : 'fr-FR';
      u.rate = 1;
      u.pitch = 1;
      s.cancel();
      s.speak(u);
    } catch { /* noop */ }
  };

  const toggleMic = () => {
    try {
      const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (!SR) { setError('Micro non supporté sur ce navigateur.'); return; }
      if (recording) {
        setRecording(false);
        if (recognitionRef.current) recognitionRef.current.stop();
        return;
      }
      const recog = new SR();
      recognitionRef.current = recog;
      recog.lang = 'fr-FR';
      recog.continuous = false;
      recog.interimResults = false;
      recog.onresult = (e) => {
        const transcript = e?.results?.[0]?.[0]?.transcript || '';
        if (transcript) setPrompt((prev) => (prev ? `${prev} ${transcript}` : transcript));
      };
      recog.onerror = () => { setRecording(false); };
      recog.onend = () => { setRecording(false); };
      setRecording(true);
      recog.start();
    } catch {
      setRecording(false);
      setError('Erreur micro. Vérifiez les permissions.');
    }
  };

  

  // Scroll vers le bas quand de nouveaux messages arrivent
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const { user } = useAuth();
  const storageKey = `chat_sessions_${user?.email || localStorage.getItem('current_user_email') || 'guest'}`;

  useEffect(() => {
    const raw = localStorage.getItem(storageKey);
    if (raw) {
      const parsed = JSON.parse(raw);
      setSessions(parsed);
      if (parsed.length > 0) {
        setActiveSessionId(parsed[0].id);
        setMessages(parsed[0].messages || []);
      }
    }
  }, [storageKey]);

  const persistSessions = (next) => {
    setSessions(next);
    localStorage.setItem(storageKey, JSON.stringify(next));
  };

  const buildFallback = (text, intent) => {
    if (intent === 'training') {
      return [
      'Prérequis pour aborder l’architecture et l’ingénierie de maison:',
      '',
      '- Mathématiques appliquées: géométrie, statique, notions de charges',
      '- Lecture de plans: conventions, cotations, échelles, coupes',
      '- Matériaux: béton, bois, acier, isolation (RT/RE actuelles)',
      '- Normes et réglementation: urbanisme, sécurité, thermique',
      '- Outils: CAO/DAO (AutoCAD, FreeCAD), modélisation 3D (Sweet Home 3D)',
      '- Méthodologie: programme, esquisse, APS/APD, planning, budget',
      '',
      'Conseil: commence par des projets simples (plain‑pied), lis des plans existants et reproduis‑les en CAO pour t’entraîner.',
      ].join('\n');
    }
    if (intent === 'greeting') {
      const echo = (text || '').trim();
      return echo || 'Bonjour !';
    }
    if (intent === 'image') {
      return [
      'Analyse générale du plan (fallback):',
      '',
      '- Vérifie la circulation (entrée → séjour → nuit) et la compacité',
      '- Contrôle dimensions des pièces, ouvertures et orientations',
      '- Identifie rangements, points d’eau, et accès/garage',
      '',
      'Recommandation: améliore l’isolation, optimise l’orientation des pièces de vie, et rationalise les circulations pour réduire les m² perdus.',
      ].join('\n');
    }
    return 'Je n’ai pas pu joindre le moteur IA. Voici une réponse utile: détaille ton besoin (objectif, surface, pièces) et je proposerai un plan type avec points forts/faibles.';
  };

  const classifyIntent = (text, hasImage) => {
    if (hasImage) return 'image';
    const s = (text || '').trim().toLowerCase();
    const simpleGreeting = /^(bonjour|salut|hello|bonsoir|hi|hey|hola|ciao|salama|salam|مرحبا|السلام عليكم)[!.?\s]*$/i;
    if (simpleGreeting.test(s)) return 'greeting';
    
    if (/(pr[ée]requis|prerequis|bases|apprendre|formation|d[ée]buter).*(architecture|ing[ée]nierie)/.test(s)) return 'training';
    return 'general';
  };

  // Utilitaire: compresse une image en WebP pour réduire la taille avant upload
  const compressImage = (file, maxDim = 1600, quality = 0.8) => {
    return new Promise((resolve, reject) => {
      try {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let { width, height } = img;
          if (width > height) {
            if (width > maxDim) {
              height = Math.round((maxDim / width) * height);
              width = maxDim;
            }
          } else {
            if (height > maxDim) {
              width = Math.round((maxDim / height) * width);
              height = maxDim;
            }
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);
          canvas.toBlob(
            (blob) => {
              if (!blob) {
                resolve(file); // fallback: retourne le fichier original
                return;
              }
              const compressedFile = new File([blob], (file.name.split('.')[0] || 'image') + '.webp', {
                type: 'image/webp',
                lastModified: Date.now(),
              });
              resolve(compressedFile);
            },
            'image/webp',
            quality
          );
        };
        img.onerror = () => resolve(file); // fallback si erreur de lecture
        const objUrl = URL.createObjectURL(file);
        img.src = objUrl;
      } catch (e) {
        resolve(file);
      }
    });
  };

  const handleImageChange = async (event) => {
    const file = event.target.files[0];
    if (file && file.type.startsWith('image/')) {
      // Révoque l'aperçu précédent si présent
      if (imagePreviewUrl) {
        try { URL.revokeObjectURL(imagePreviewUrl); } catch { /* noop */ }
        setImagePreviewUrl(null);
      }
      // Compression client pour accélérer l'upload
      const compressed = await compressImage(file, 1600, 0.8);
      setSelectedImage(compressed);
      const url = URL.createObjectURL(compressed);
      setImagePreviewUrl(url);
      setError(null);
    } else if (file) {
      setSelectedImage(null);
      if (imagePreviewUrl) {
        try { URL.revokeObjectURL(imagePreviewUrl); } catch { /* noop */ }
        setImagePreviewUrl(null);
      }
      setError('Veuillez sélectionner un fichier image valide.');
    }
  };

  const handleNewDiscussion = () => {
    const id = Date.now();
    const newSession = {
      id,
      title: 'Nouvelle discussion',
      createdAt: new Date().toISOString(),
      messages: [],
    };
    const next = [newSession, ...sessions];
    persistSessions(next);
    setActiveSessionId(id);
    setMessages([]);
    setPrompt('');
    setSelectedImage(null);
    if (imagePreviewUrl) { URL.revokeObjectURL(imagePreviewUrl); setImagePreviewUrl(null); }
    setError(null);
    setModePhase('await_plan');
    setPlanSummary('');
    
  };

  const handleClearHistory = () => {
    const ok = window.confirm('Supprimer tout l\'historique des discussions ?');
    if (!ok) return;
    localStorage.removeItem(storageKey);
    setSessions([]);
    setActiveSessionId(null);
    setMessages([]);
    setPrompt('');
    setSelectedImage(null);
    if (imagePreviewUrl) { URL.revokeObjectURL(imagePreviewUrl); setImagePreviewUrl(null); }
    setError(null);
    setModePhase('await_plan');
    setPlanSummary('');
  };

  const handleDeleteSession = (id) => {
    let next = sessions.filter((s) => s.id !== id);
    persistSessions(next);
    if (activeSessionId === id) {
      setActiveSessionId(null);
      setMessages([]);
      setPrompt('');
      setSelectedImage(null);
      setError(null);
    }
    setSessions(next);
  };

  const handleSubmit = async () => {
    if (modePhase === 'await_plan' && !selectedImage) {
      setError('Veuillez importer l\'image du plan de maison à traiter.');
      const aiMessage = {
        id: Date.now() + 1,
        contenu: 'Étape 1 — Importez l\'image du plan de maison à traiter (bouton Importer), puis cliquez sur Envoyer.',
        isUser: false,
        date: new Date().toISOString(),
      };
      setMessages((prev) => {
        const next = [...prev, aiMessage];
        let nextSessions = sessions.map((s) => {
          if (s.id === activeSessionId) {
            const newTitle = s.messages.length === 0 ? 'Discussion' : s.title;
            return { ...s, title: newTitle, messages: next };
          }
          return s;
        });
        if (!activeSessionId) {
          const id = Date.now() + 2;
          const newSession = {
            id,
            title: 'Discussion',
            createdAt: new Date().toISOString(),
            messages: next,
          };
          nextSessions = [newSession, ...sessions];
          setActiveSessionId(id);
        }
        persistSessions(nextSessions);
        return next;
      });
      return;
    }
    if (modePhase === 'await_photo' && !selectedImage) {
      setError('Veuillez importer la photo de la maison (en cours de construction ou finie).');
      const aiMessage = {
        id: Date.now() + 1,
        contenu: 'Étape 2 — Importez une photo de la maison (en cours de construction ou finie) ici, puis cliquez sur Envoyer pour que l\'IA compare au plan initial.',
        isUser: false,
        date: new Date().toISOString(),
      };
      setMessages((prev) => {
        const next = [...prev, aiMessage];
        let nextSessions = sessions.map((s) => {
          if (s.id === activeSessionId) {
            const newTitle = s.messages.length === 0 ? 'Discussion' : s.title;
            return { ...s, title: newTitle, messages: next };
          }
          return s;
        });
        if (!activeSessionId) {
          const id = Date.now() + 2;
          const newSession = {
            id,
            title: 'Discussion',
            createdAt: new Date().toISOString(),
            messages: next,
          };
          nextSessions = [newSession, ...sessions];
          setActiveSessionId(id);
        }
        persistSessions(nextSessions);
        return next;
      });
      return;
    }

    if (!prompt.trim() && !selectedImage) {
      setError('Veuillez entrer un prompt ou importer une image.');
      return;
    }

    setLoading(true);
    setError(null);
    

    const currentPrompt = prompt;
    const currentImage = selectedImage;

    // Détecte un tableau JSON de messages {role, content}
    let messagesJson = null;
    let derivedPrompt = currentPrompt.trim();
    const defaultSystem = `Tu es e‑construction AI Assistant, créé par Ingénierie IA Idealy. Tu es spécialisé en analyse de plans, architecture et construction. Réponds de façon concise et utile, avec des étapes claires si nécessaire. Donne des recommandations pratiques, cite 3 points forts et 3 points faibles quand on fournit un plan.
       CONSIGNES DE MISE EN FORME :
       - Utilise un ton professionnel et chaleureux avec des emojis (ex: 🏗️, 📏, ✅, 🏠).
       - Sépare tes idées en paragraphes distincts avec des doubles sauts de ligne.
       - Utilise des listes à puces pour les détails techniques.
       - Ne fais pas de blocs de texte trop compacts.
       - Réponds de façon concise et utile.
        N'indique jamais de fournisseur de modèle.`;
    try {
      const parsed = JSON.parse(currentPrompt);
      if (Array.isArray(parsed) && parsed.every(m => m && typeof m.role === 'string' && typeof m.content === 'string')) {
        messagesJson = JSON.stringify(parsed);
        const lastUser = [...parsed].reverse().find(m => m.role === 'user');
        if (lastUser?.content) derivedPrompt = String(lastUser.content);
      }
    } catch { /* ignore parse errors */ }

    const intent = classifyIntent(derivedPrompt, !!currentImage);
    if (intent === 'image') {
      const extra = `Analyse l'image du plan fournie. Structure la réponse en 3 sections: Recommandation, Points forts, Points faibles. Donne des éléments concrets et mesurables si possible.`;
      derivedPrompt = derivedPrompt ? `${derivedPrompt}\n\n${extra}` : extra;
    } else if (intent === 'training') {
      const extra = `Structure la réponse en 3 sections: Prérequis, Outils, Méthodologie. Fais une liste concise et pratique.`;
      derivedPrompt = derivedPrompt ? `${derivedPrompt}\n\n${extra}` : extra;
    }
    const userLang = detectLanguage(derivedPrompt);
    const langHint = userLang ? `Réponds strictement dans la même langue que l’utilisateur (langue détectée: ${userLang}). N’effectue aucune traduction sauf demande explicite.` : `Réponds strictement dans la même langue que l’utilisateur. N’effectue aucune traduction sauf demande explicite.`;
    const systemContent = `${defaultSystem}\n\n${langHint}`;
    if (!messagesJson) {
      messagesJson = JSON.stringify([
        { role: 'system', content: systemContent },
        { role: 'user', content: derivedPrompt }
      ]);
    }

    const identityQ = /\b(qui\s*(es[-\s]?tu|est[-\s]?tu)|qui\s*(t('|’)?a|t('|’)?as|t('|’)?es)\s*cr[ée]?[e]?|\bcr[ée]ateur\b|\bqui\s+te\s+a\b)/i.test(derivedPrompt);
    lastPromptRef.current = derivedPrompt;
    lastIsIdentityRef.current = identityQ;
    const userMessageContent = (currentPrompt.trim()) || (currentImage ? `Analyse de l'image...` : '');
    const tempUserMessage = {
      id: Date.now(),
      contenu: userMessageContent,
      isUser: true,
      date: new Date().toISOString(),
      imageFilename: currentImage ? URL.createObjectURL(currentImage) : null,
    };
    setMessages((prevMessages) => [...prevMessages, tempUserMessage]);

    setPrompt('');
    setSelectedImage(null);

    if (modePhase === 'await_plan' && currentImage) {
      try {
        const controller = new AbortController();
        requestControllerRef.current = controller;
        const fd = new FormData();
        fd.append('image', currentImage);
        const lang = userLang || 'fr';
        fd.append('language', lang);
        const resp = await axiosInstance.post('/ia/describe-plan', fd, { signal: controller.signal });
        const payload = resp?.data;
        const summary = enforceIdentity(cleanText(payload?.description || buildFallback(currentPrompt, 'image')));
        setPlanSummary(summary);
        const aiMessage = {
          id: Date.now() + 1,
          contenu: `Plan reçu ✅\n\nRésumé du plan:\n${summary}\n\nÉtape 2 — Importez maintenant une photo de la maison (en cours de construction ou finie) pour comparaison.`,
          isUser: false,
          date: new Date().toISOString(),
        };
        setMessages((prev) => {
          const next = [...prev, aiMessage];
          let nextSessions = sessions.map((s) => {
            if (s.id === activeSessionId) {
              const newTitle = s.messages.length === 0 ? 'Analyse de plan' : s.title;
              return { ...s, title: newTitle, messages: next };
            }
            return s;
          });
          if (!activeSessionId) {
            const id = Date.now() + 2;
            const newSession = {
              id,
              title: 'Analyse de plan',
              createdAt: new Date().toISOString(),
              messages: next,
            };
            nextSessions = [newSession, ...sessions];
            setActiveSessionId(id);
          }
          persistSessions(nextSessions);
          return next;
        });
        setModePhase('await_photo');
        if (imagePreviewUrl) { try { URL.revokeObjectURL(imagePreviewUrl); } catch { /* noop */ } setImagePreviewUrl(null); }
      } catch (err) {
        const backendMsg = err?.response?.data?.error;
        setError(backendMsg || 'Erreur lors de l\'analyse du plan.');
      } finally {
        setLoading(false);
        requestControllerRef.current = null;
      }
      return;
    }

    if (modePhase === 'await_photo' && currentImage) {
      try {
        const controller = new AbortController();
        requestControllerRef.current = controller;
        const formData = new FormData();
        const comparePrompt = [
          `Voici le résumé du plan initial:\n${planSummary}`,
          'Compare cette PHOTO importée au plan. Indique précisément :',
          '- Les défauts visibles par rapport au plan (ex: mur non plan, bombé, mauvais alignement, ouverture non conforme).',
          '- Les recommandations correctives concrètes.',
          '- 3 points forts et 3 points faibles.',
          'Structure la réponse en: Erreurs, Recommandations, Points forts, Points faibles.'
        ].join('\n');
        formData.append('prompt', comparePrompt);
        formData.append('messages', JSON.stringify([
          { role: 'system', content: systemContent },
          { role: 'user', content: comparePrompt }
        ]));
        formData.append('image', currentImage);
        const response = await axiosInstance.post('/ia/chat', formData, { signal: controller.signal });
        const payload = response?.data;
        const aiText = enforceIdentity(cleanText(payload?.response || buildFallback('Comparaison', 'image')));
        const aiMessage = {
          id: Date.now() + 1,
          contenu: aiText,
          isUser: false,
          date: new Date().toISOString(),
        };
        setMessages((prev) => {
          const next = [...prev, aiMessage];
          let nextSessions = sessions.map((s) => {
            if (s.id === activeSessionId) {
              const newTitle = s.messages.length === 0 ? 'Comparaison photo/plan' : s.title;
              return { ...s, title: newTitle, messages: next };
            }
            return s;
          });
        
          if (!activeSessionId) {
            const id = Date.now() + 2;
            const newSession = {
              id,
              title: 'Comparaison photo/plan',
              createdAt: new Date().toISOString(),
              messages: next,
            };
            nextSessions = [newSession, ...sessions];
            setActiveSessionId(id);
          }
          persistSessions(nextSessions);
          return next;
        });
        if (autoSpeak) speakText(aiText);
      } catch (err) {
        if (err?.code === 'ERR_CANCELED' || err?.name === 'CanceledError' || err?.message?.includes('aborted')) {
          return;
        }
        console.error('Erreur comparaison photo/plan :', err);
        const backendMsg = err?.response?.data?.error;
        setError(backendMsg || 'Erreur lors de la comparaison photo/plan. Vérifiez le Backend.');
      } finally {
        setLoading(false);
        requestControllerRef.current = null;
      }
      return;
    }

    // [DE-DUP] Bloc dupliqué supprimé pour éviter les redéclarations et l'ajout double du message utilisateur.

    

    try {
      const controller = new AbortController();
      requestControllerRef.current = controller;
      let aiText = '';
      if (intent === 'image' && currentImage) {
        const fd = new FormData();
        fd.append('image', currentImage);
        const lang = userLang || 'fr';
        fd.append('language', lang);
        const resp = await axiosInstance.post('/ia/describe-plan', fd, { signal: controller.signal });
        const payload = resp?.data;
        aiText = enforceIdentity(cleanText(payload?.description || buildFallback(currentPrompt, intent)));
      } else {
        const formData = new FormData();
        if (derivedPrompt) formData.append('prompt', derivedPrompt);
        if (messagesJson) formData.append('messages', messagesJson);
        if (currentImage) formData.append('image', currentImage);
        const response = await axiosInstance.post('/ia/chat', formData, { signal: controller.signal });
        const payload = response?.data;
        if (payload?.status === 'fallback') {
          const fromBackend = enforceIdentity(cleanText(payload?.response || ""));
          aiText = fromBackend || buildFallback(currentPrompt, intent);
        } else {
          aiText = enforceIdentity(cleanText(payload?.response || ""));
        }
      }
      const aiMessage = {
        id: Date.now() + 1,
        contenu: aiText,
        isUser: false,
        date: new Date().toISOString(),
      };
      setMessages((prev) => {
        const next = [...prev, aiMessage];
        
        let nextSessions = sessions.map((s) => {
          if (s.id === activeSessionId) {
            const newTitle = s.messages.length === 0 ? (currentPrompt.trim() || 'Discussion') : s.title;
            return { ...s, title: newTitle, messages: next };
          }
          return s;
        });
        if (!activeSessionId) {
          const id = Date.now() + 2;
          const newSession = {
            id,
            title: currentPrompt.trim() || 'Discussion',
            createdAt: new Date().toISOString(),
            messages: next,
          };
          nextSessions = [newSession, ...sessions];
          setActiveSessionId(id);
        }
        persistSessions(nextSessions);
        return next;
      });
      if (autoSpeak) speakText(aiText);
      
      
    } catch (err) {
      if (err?.code === 'ERR_CANCELED' || err?.name === 'CanceledError' || err?.message?.includes('aborted')) {
        return;
      }
      console.error('Erreur lors de l\'envoi au Backend IA :', err);
      const backendMsg = err?.response?.data?.error;
      setError(backendMsg || 'Erreur lors de la communication avec l\'IA. Vérifiez que le Backend est lancé et la clé e‑Construction est configurée.');
      const intent = classifyIntent(derivedPrompt, !!currentImage);
      const fallbackText = buildFallback(currentPrompt, intent);
      const aiMessage = {
        id: Date.now() + 1,
        contenu: fallbackText,
        isUser: false,
        date: new Date().toISOString(),
      };
      setMessages((prev) => {
        const next = [...prev, aiMessage];
        let nextSessions = sessions.map((s) => {
          if (s.id === activeSessionId) {
            const newTitle = s.messages.length === 0 ? (currentPrompt.trim() || 'Discussion') : s.title;
            return { ...s, title: newTitle, messages: next };
          }
          return s;
        });
        if (!activeSessionId) {
          const id = Date.now() + 2;
          const newSession = {
            id,
            title: currentPrompt.trim() || 'Discussion',
            createdAt: new Date().toISOString(),
            messages: next,
          };
          nextSessions = [newSession, ...sessions];
          setActiveSessionId(id);
        }
        persistSessions(nextSessions);
        return next;
      });
      
      
      

    } finally {
      setLoading(false);
      requestControllerRef.current = null;
    }
  };
  
  // Fonction pour gérer la touche Entrée dans la zone de texte
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault(); // Empêche le saut de ligne par défaut
      handleSubmit();
    }
  };

  const findLastUserImageMessage = () => {
    for (let i = messages.length - 1; i >= 0; i -= 1) {
      const m = messages[i];
      const isUser = m.isUser || m.is_user;
      if (isUser && m.imageFilename) return m;
    }
    return null;
  };

  const findLastAiMessage = () => {
    for (let i = messages.length - 1; i >= 0; i -= 1) {
      const m = messages[i];
      const isUser = m.isUser || m.is_user;
      if (!isUser) return m;
    }
    return null;
  };

  const downloadImage = () => {
    const lastImgMsg = findLastUserImageMessage();
    if (!lastImgMsg) return;
    const a = document.createElement('a');
    a.href = lastImgMsg.imageFilename;
    a.download = `image_${new Date().toISOString().replace(/[:.]/g, '-')}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const exportPdf = async () => {
    const lastImgMsg = findLastUserImageMessage();
    const lastAiMsg = findLastAiMessage();
    const aiText = lastAiMsg?.contenu || '';
    let imgDataUrl = '';
    if (lastImgMsg?.imageFilename) {
      try {
        const blob = await fetch(lastImgMsg.imageFilename).then(r => r.blob());
        imgDataUrl = await new Promise((resolve) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result);
          reader.readAsDataURL(blob);
        });
      } catch { void 0; }
    }

    const html = `<!doctype html><html><head><meta charset="utf-8"><title>Rapport IA</title>
      <style>body{font-family:Arial, sans-serif; padding:24px;}h1{font-size:18px;margin:0 0 12px}img{max-width:100%;border:1px solid #ddd;border-radius:8px;margin:12px 0}pre{white-space:pre-wrap;line-height:1.5;border:1px solid #eee;padding:12px;border-radius:8px;background:#fafafa}</style>
      </head><body>
      <h1>Rapport d'analyse</h1>
      ${imgDataUrl ? `<img src="${imgDataUrl}" alt="Image importée"/>` : ''}
      <pre>${aiText.replace(/[&<>]/g,(c)=>({"&":"&amp;","<":"&lt;",">":"&gt;"}[c]))}</pre>
      <script>window.onload = () => {window.print(); setTimeout(() => window.close(), 3000);};</script>
      </body></html>`;
    const w = window.open('', '_blank');
    if (!w) return;
    w.document.open();
    w.document.write(html);
    w.document.close();
  };

  const handleStop = () => {
    const controller = requestControllerRef.current;
    if (controller) {
      try { controller.abort(); } catch { /* noop */ }
      requestControllerRef.current = null;
    }
    try { window.speechSynthesis?.cancel?.(); } catch { /* noop */ }
    setLoading(false);
    //setError('Traitement interrompu par l’utilisateur.');
  };

  return (
    <div className="chat-layout">
      <aside className="chat-sidebar">
        <div className="chat-sidebar-header">
          <h3>Discussions</h3>
          <div style={{display:'flex',gap:8}}>
            <button className="chat-new" onClick={handleNewDiscussion} disabled={loading}>
              <PlusCircle className="icon" /> Nouvelle
            </button>
            <button className="chat-clear" onClick={handleClearHistory} disabled={loading} title="Supprimer l'historique">
              <Trash2 className="icon" />
            </button>
          </div>
        </div>
        <div className="chat-sessions">
          {sessions.length === 0 && (
            <div className="chat-empty">Aucune discussion pour l'instant</div>
          )}
          {sessions.map((s) => (
            <div key={s.id} className="chat-session-row">
              <button
                className={`chat-session-item ${activeSessionId === s.id ? 'active' : ''}`}
                onClick={() => { setActiveSessionId(s.id); setMessages(s.messages || []); setPrompt(''); setSelectedImage(null); setError(null); setModePhase('await_plan'); setPlanSummary(''); }}
              >
                <MessageSquare className="icon" />
                <span>{s.title}</span>
              </button>
              <button className="chat-delete" title="Supprimer" onClick={(e) => { e.stopPropagation(); handleDeleteSession(s.id); }}>
                <Trash2 className="icon" />
              </button>
            </div>
          ))}
        </div>
      </aside>

      <main className="chat-content">
        <div className="chat-header">
          <h1><MessageSquare className="icon" /> Assistant e‑Construction</h1>
        </div>

        <div className="chat-messages">
          
          {messages.length === 0 && !loading && (
            <div className="chat-welcome">
              <MessageSquare className="icon" />
              <p>Mode d’emploi du Chat IA</p>
              <small>Étape 1: Importez l’image du plan de maison à traiter. Étape 2: Importez une photo de la maison (en cours de construction ou finie) pour comparaison. L’IA détectera les erreurs (ex: mur non plan, bombé) et donnera des recommandations avec points forts/faibles.</small>
            </div>
          )}

          {messages.map((message) => {
            const isUser = message.isUser || message.is_user;
            if (isUser) return <UserMessage key={message.id} message={message} />;
            return <AIMessage key={message.id} message={message} />;
          })}

          {loading && (
            <div className="typing-bubble">
              <span></span>
              <div className="typing-dots"><span></span><span></span><span></span></div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        <div className="chat-input">
          {findLastUserImageMessage() && findLastAiMessage() && (
            <div style={{display:'flex',gap:8, marginBottom:10}}>
              <button className="chat-send" onClick={downloadImage}>Télécharger l'image</button>
              <button className="chat-send" onClick={exportPdf}>Exporter en PDF</button>
              <button className="chat-send" title="Simplifier le dernier message IA" onClick={() => {
                const last = findLastAiMessage();
                if (!last?.contenu) return;
                const simple = simplifyText(last.contenu);
                setMessages((prev) => ([...prev, { id: Date.now()+3, contenu: simple, isUser: false, date: new Date().toISOString() }]));
              }}>Simplifier la réponse</button>
            </div>
          )}
          {error && <div className="chat-error">{error}</div>}
          

          {selectedImage && (
            <div className="chat-preview">
              <img
                src={imagePreviewUrl}
                alt="Aperçu"
                onLoad={() => { void 0; }}
              />
              <span>{selectedImage.name}</span>
              <button className="chat-remove" onClick={() => { setSelectedImage(null); if (imagePreviewUrl) { URL.revokeObjectURL(imagePreviewUrl); setImagePreviewUrl(null); } }}>Retirer</button>
            </div>
          )}

          <div className="chat-input-row">
            <textarea
              placeholder="Décrivez votre besoin (Entrée pour envoyer)…"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={handleKeyDown}
              rows={1}
            />

            {loading && (
              <button className="chat-stop" title="Arrêter le traitement" onClick={handleStop}>
                <StopCircle className="icon" />
              </button>
            )}

            <button className="chat-send" title={recording ? 'Arrêter micro' : 'Activer micro'} onClick={toggleMic} disabled={loading}>
              <Mic className="icon" style={{ color: recording ? '#ef4444' : undefined }} />
            </button>
            <button className="chat-send" title={autoSpeak ? 'Voix activée' : 'Activer voix'} onClick={() => {
              const next = !autoSpeak;
              setAutoSpeak(next);
              if (next) {
                const last = (messages || []).slice().reverse().find(m => !m.isUser && !m.is_user);
                if (last?.contenu) speakText(last.contenu);
              } else {
                try { window.speechSynthesis?.cancel?.(); } catch { /* noop */ }
              }
            }}>
              <Volume2 className="icon" />
            </button>
            <label className="chat-upload">
              <Upload className="icon" />
              <input type="file" accept="image/*" onChange={handleImageChange} disabled={loading} />
            </label>

            <button className="chat-send" onClick={handleSubmit} disabled={loading || (!prompt.trim() && !selectedImage)}>
              {loading ? <Loader2 className="icon spin" /> : 'Envoyer'}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ChatIA;

