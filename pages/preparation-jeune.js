
import Link from "next/link";
import React, { useEffect, useState } from 'react';

export default function PreparationJeune() {

  // === HOOKS & VARIABLES (ordre strict) ===
  // Date du jeûne, durée, jour courant
  const [dateJeune, setDateJeune] = useState(null);
  const [dureeJeune, setDureeJeune] = useState(null);
  const [aujourdhui, setAujourdhui] = useState(new Date());
  const [jCourant, setJCourant] = useState(null);

  // Critères de préparation (statut dynamique)
  // État de démarrage du suivi de préparation (workflow interactif)
  const [preparationActive, setPreparationActive] = useState(false);
  const criteresMetier = [
    { id: 1, label: "Respect strict des quantités à chaque repas", jalon: 30, description: "Réapprendre à ton corps ce qu'est une vraie portion" },
    { id: 2, label: "Supprimer les féculents le soir (lun-dim)", jalon: 17, description: "Alléger la digestion le soir pour préparer le jeûne" },
    { id: 3, label: "Action immédiate après le repas (marche/ménage)", jalon: 17, description: "Activer la digestion et éviter le stockage" },
    { id: 4, label: "Éliminer tous produits transformés", jalon: 14, description: "Limiter les toxines et l'inflammation" },
    { id: 5, label: "Éliminer toutes sucreries", jalon: 14, description: "Stabiliser la glycémie et l'énergie" },
    { id: 6, label: "2 jours de jeûne plein (préparation métabolique)", jalon: 12, description: "Tester la tolérance au jeûne" },
    { id: 7, label: "2 litres d’eau par jour (suivi automatique)", jalon: 7, description: "Hydratation optimale avant le jeûne" },
    { id: 8, label: "Pas de repas après 19h00", jalon: 7, description: "Préparer le système digestif au jeûne" },
    { id: 9, label: "Plage alimentaire limitée à 45 minutes par repas", jalon: 7, description: "Limiter le grignotage et améliorer la digestion" },
  ];
  const [criteres, setCriteres] = useState([]); // Liste dynamique avec statut validé
  const [progression, setProgression] = useState(0); // Nombre de critères validés
  const [messagePerso, setMessagePerso] = useState("");
  const [syntheseVisible, setSyntheseVisible] = useState(false);

  // === INITIALISATION (ordre strict) ===
  useEffect(() => {
    // Initialisation de l’état preparationActive depuis localStorage
    if (typeof window !== 'undefined') {
      const active = window.localStorage.getItem('preparationActive');
      setPreparationActive(active === 'true');
    }
    // Lecture date du jeûne et durée depuis localStorage (ou valeur par défaut)
    const dateStr = (typeof window !== 'undefined') ? window.localStorage.getItem('dateJeune') : null;
    const dureeStr = (typeof window !== 'undefined') ? window.localStorage.getItem('dureeJeune') : null;
    setDateJeune(dateStr ? new Date(dateStr) : null);
    setDureeJeune(dureeStr || 'X');
    setAujourdhui(new Date());
    // Calcul du J-XX courant
    if (dateStr) {
      const diff = Math.ceil((new Date(dateStr).setHours(0,0,0,0) - new Date().setHours(0,0,0,0)) / (1000*60*60*24));
      setJCourant(diff);
    }
    // Initialisation des critères (localStorage ou valeurs métier)
    let criteresInit = criteresMetier.map(c => ({ ...c, valide: false, dateValidation: null }));
    if (typeof window !== 'undefined') {
      const saved = window.localStorage.getItem('criteresPreparation');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length === criteresMetier.length) {
            criteresInit = parsed;
          }
        } catch {}
      }
      const msg = window.localStorage.getItem('messagePersoPreparation');
      if (msg) setMessagePerso(msg);
    }
    setCriteres(criteresInit);
  }, []);

  // Handler pour démarrer le suivi de préparation (doit être accessible dans le rendu)
  function handleStartPreparation() {
    setPreparationActive(true);
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('preparationActive', 'true');
    }
  }

  // === LOGIQUE MÉTIER ===
  // Calcul de la progression réelle
  useEffect(() => {
    const nbValid = criteres.filter(c => c.valide).length;
    setProgression(nbValid);
    // Affichage synthèse si tous les critères sont validés
    setSyntheseVisible(nbValid === criteresMetier.length);
    // Sauvegarde dans localStorage
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('criteresPreparation', JSON.stringify(criteres));
    }
  }, [criteres]);

  // Handler de validation d’un critère (manuel, à améliorer avec auto-validation plus tard)
  function validerCritere(id) {
    setCriteres(prev => prev.map(c => c.id === id ? { ...c, valide: true, dateValidation: new Date().toISOString() } : c));
  }

  // Handler de modification du message personnel
  function handleMessageChange(e) {
    setMessagePerso(e.target.value);
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('messagePersoPreparation', e.target.value);
    }
  }

  // Fonction statut dynamique
  function getStatut(jalonJ) {
    if (jCourant === null) return '[À VENIR]';
    if (jCourant === jalonJ) return '[EN COURS]';
    if (jCourant < jalonJ) return '[À VENIR]';
    if (jCourant > jalonJ) return '[VERROUILLÉ]';
    return '[À VENIR]';
  }

  // Helpers pour affichage date
  function formatDate(date) {
    if (!date) return '';
    return date.toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' });
  }

  return (
    <div style={{ maxWidth: 600, margin: "0 auto", padding: "2.5rem 1rem", fontFamily: "system-ui, Arial, sans-serif" }}>
      <h1 style={{ color: "#1976d2", fontWeight: 800, fontSize: "2.2rem", marginBottom: 18 }}>
        Préparation à mon jeûne
      </h1>
      <p style={{ fontSize: "1.15rem", color: "#444", marginBottom: 24 }}>
        Cette page te guide pas à pas pour préparer ton jeûne dans les meilleures conditions. Suis chaque étape pour maximiser tes chances de réussite et éviter les pièges classiques.
      </p>
      <div style={{ background: "#f8f8fc", borderRadius: 14, boxShadow: "0 2px 8px #0001", padding: "1.2rem 1.1rem", marginBottom: "2rem" }}>
        <h2 style={{ color: "#388e3c", fontWeight: 700, fontSize: "1.15rem", marginBottom: 8 }}>
          Démarre ta préparation
        </h2>
        {!preparationActive ? (
          <>
            <p style={{ color: "#555", fontSize: "1.05rem", marginBottom: 12 }}>
              Clique sur le bouton ci-dessous pour commencer ton suivi de préparation, valider chaque critère et suivre ta progression jour après jour.
            </p>
            <button
              onClick={handleStartPreparation}
              aria-label="Démarrer mon suivi de préparation"
              style={{
                background: "linear-gradient(90deg, #43cea2 0%, #185a9d 100%)",
                color: "#fff",
                border: "none",
                borderRadius: 8,
                padding: "12px 32px",
                fontWeight: 700,
                fontSize: 18,
                cursor: "pointer",
                marginBottom: 8
              }}
              autoFocus
            >
              Démarrer mon suivi de préparation
            </button>
            <div aria-live="polite" style={{ minHeight: 24, marginTop: 8 }}>
              {/* Zone de feedback dynamique pour lecteurs d’écran */}
            </div>
          </>
        ) : (
          <p style={{ color: "#388e3c", fontWeight: 600, fontSize: "1.08rem", marginBottom: 0 }} aria-live="polite">
            ✅ Suivi de préparation activé. Tu peux valider tes critères et suivre ta progression !
          </p>
        )}
      </div>
      {/* Timeline de préparation dynamique */}
      {preparationActive && (
        <div style={{ background: "#fff", borderRadius: 12, boxShadow: "0 1px 6px #e0e0e0", padding: "1.5rem 1.2rem", marginBottom: 18 }}>
          <h3 style={{ color: "#1976d2", fontWeight: 700, fontSize: "1.1rem", marginBottom: 10 }}>Timeline de préparation</h3>
          <div style={{ marginBottom: 12 }}>
            <strong style={{ color: '#388e3c' }}>Progression globale :</strong> <span style={{ color: '#1976d2', fontWeight: 700 }}>{progression}/{criteresMetier.length} critères validés</span>
            <div style={{ background: '#e3f2fd', borderRadius: 8, height: 12, marginTop: 6, marginBottom: 8, width: '100%' }}>
              <div style={{ background: '#1976d2', height: 12, borderRadius: 8, width: `${(progression/criteresMetier.length)*100}%`, transition: 'width 0.4s' }}></div>
            </div>
          </div>
          <ul style={{ color: "#444", fontSize: "1.05rem", lineHeight: 1.7, margin: 0, paddingLeft: 18 }}>
            {criteres.map((critere, idx) => (
              <li key={critere.id} style={{ marginBottom: 10, opacity: critere.valide ? 0.6 : 1 }}>
                <strong>J-{critere.jalon}</strong> : {critere.label}
                <span style={{ color: getStatut(critere.jalon) === '[EN COURS]' ? '#1976d2' : getStatut(critere.jalon) === '[VERROUILLÉ]' ? '#888' : '#aaa', fontWeight: 600, marginLeft: 8 }}>{getStatut(critere.jalon)}</span>
                <br />
                <span style={{ fontSize: '0.98rem', color: '#888' }}>{critere.description}</span>
                {!critere.valide && getStatut(critere.jalon) === '[EN COURS]' && (
                  <button onClick={() => validerCritere(critere.id)} style={{ marginLeft: 12, background: '#43cea2', color: '#fff', border: 'none', borderRadius: 6, padding: '4px 14px', fontWeight: 600, cursor: 'pointer', fontSize: 14 }}>Valider</button>
                )}
                {critere.valide && <span style={{ color: '#388e3c', fontWeight: 600, marginLeft: 10 }}>✅ Validé</span>}
              </li>
            ))}
          </ul>
          <div style={{ color: '#888', fontSize: '0.98rem', marginTop: 16 }}>
            <span>Légende : </span>
            <span style={{ color: '#1976d2', fontWeight: 600 }}>EN COURS</span>,
            <span style={{ color: '#aaa', fontWeight: 600, marginLeft: 8 }}>À VENIR</span>,
            <span style={{ color: '#888', fontWeight: 600, marginLeft: 8 }}>VERROUILLÉ</span>
          </div>
          <div style={{ color: '#888', fontSize: '0.98rem', marginTop: 8 }}>
            {dateJeune && (
              <span>Jeûne programmé le <strong>{formatDate(dateJeune)}</strong> ({jCourant !== null ? `J-${jCourant}` : ''})</span>
            )}
          </div>
        </div>
      )}
      {/* Message personnel */}
      <div style={{ background: '#f8f8fc', borderRadius: 12, boxShadow: '0 1px 6px #e0e0e0', padding: '1.2rem 1.1rem', marginBottom: 18 }}>
        <h3 style={{ color: '#1976d2', fontWeight: 700, fontSize: '1.1rem', marginBottom: 10 }}>📝 Mon message à moi-même pour le jour du jeûne</h3>
        <textarea
          value={messagePerso}
          onChange={handleMessageChange}
          placeholder="Je me prépare depuis 30 jours. Mon corps est prêt. Mon esprit est aligné..."
          style={{ width: '100%', minHeight: 60, borderRadius: 8, border: '1px solid #bdbdbd', padding: 10, fontSize: 15, marginBottom: 8 }}
        />
        <div style={{ color: '#888', fontSize: '0.98rem' }}>
          Ce message te sera rappelé le jour J pour renforcer ta motivation.
        </div>
      </div>
      {/* Synthèse finale (affichée si tous les critères sont validés) */}
      {syntheseVisible && (
        <div style={{ background: '#e8f5e9', borderRadius: 12, boxShadow: '0 1px 6px #c8e6c9', padding: '1.2rem 1.1rem', marginBottom: 18 }}>
          <h3 style={{ color: '#388e3c', fontWeight: 700, fontSize: '1.1rem', marginBottom: 10 }}>🎉 Préparation terminée !</h3>
          <div style={{ color: '#444', fontSize: '1.08rem', marginBottom: 8 }}>
            Bravo, tu as validé tous les critères de préparation. Tu es prêt(e) pour ton jeûne !
          </div>
          <div style={{ color: '#1976d2', fontWeight: 600, marginBottom: 6 }}>Ton message à toi-même :</div>
          <div style={{ background: '#fff', borderRadius: 8, padding: 10, color: '#333', fontStyle: 'italic', marginBottom: 8 }}>{messagePerso || <span style={{ color: '#888' }}>[Aucun message saisi]</span>}</div>
        </div>
      )}
      <div style={{ textAlign: "center", marginTop: 32 }}>
        <Link href="/">
          <button style={{
            background: "#1976d2",
            color: "#fff",
            border: "none",
            borderRadius: 8,
            padding: "10px 24px",
            fontWeight: 600,
            fontSize: 16,
            cursor: "pointer"
          }}>
            🏠 Retour à l’accueil
          </button>
        </Link>
      </div>
    </div>
  );
}
