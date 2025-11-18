  // ...existing code...

  // === PHASES MÉTIER STRICTES ===
  const phasesMetier = [
    {
      nom: "Fondations",
      debut: 30,
      fin: 18,
      explication: "Objectif : installer les bases, réapprendre les quantités, commencer à alléger la digestion.",
      criteres: [
        {
          id: "quantites",
          titre: "Respect strict des quantités à chaque repas",
          conseil: "Réapprends à ton corps ce qu'est une vraie portion. Une portion = ce qui tient dans ta main fermée.",
          jalon: 30
        },
        {
          id: "feculent_soir",
          titre: "Supprimer les féculents le soir (lun-dim)",
          conseil: "Les féculents le soir ralentissent ta digestion. Prépare tes dîners sans féculents.",
          jalon: 17
        },
        {
          id: "action_post_repas",
          titre: "Action immédiate après le repas (marche/ménage)",
          conseil: "Bouge après chaque repas pour activer la digestion.",
          jalon: 17
        },
        {
          id: "produits_transformes",
          titre: "Éliminer tous produits transformés",
          conseil: "Privilégie le fait maison, évite les plats industriels.",
          jalon: 14
        },
        {
          id: "sucreries",
          titre: "Éliminer toutes sucreries",
          conseil: "Remplace les desserts sucrés par des fruits ou yaourts nature.",
          jalon: 14
        }
      ]
    },
    {
      nom: "Intensification",
      debut: 12,
      fin: 1,
      explication: "Objectif : préparer le métabolisme, tester le jeûne, renforcer l’hydratation et la discipline horaire.",
      criteres: [
        {
          id: "jeune_plein",
          titre: "2 jours de jeûne plein (préparation métabolique)",
          conseil: "Aucun aliment solide pendant 48h. Hydratation : eau, thé, café (sans sucre). Repos si besoin.",
          jalon: 12
        },
        {
          id: "eau",
          titre: "2 litres d'eau par jour (suivi automatique)",
          conseil: "Pense à t’hydrater régulièrement, répartis sur la journée.",
          jalon: 7
        },
        {
          id: "repas_avant_19h",
          titre: "Pas de repas après 19h00",
          conseil: "Anticipe progressivement l’heure du dîner.",
          jalon: 7
        },
        {
          id: "plage_45min",
          titre: "Plage alimentaire limitée à 45 minutes par repas",
          conseil: "Prends le temps de manger, mais limite la durée pour habituer ton corps.",
          jalon: 7
        }
      ]
    },
    {
      nom: "Jour J",
      debut: 0,
      fin: 0,
      explication: "Objectif : lancer le jeûne, célébrer la préparation, se reconnecter à l’essentiel.",
      criteres: [
        {
          id: "lancement_jeune",
          titre: "Lancement de ton jeûne de 5 jours",
          conseil: "Tu as validé tous les critères, tu es prêt(e) !",
          jalon: 0
        }
      ]
    }
  ];
import Link from "next/link";
import React, { useEffect, useState } from 'react';
import StartPreparationModal from '../components/StartPreparationModal';
import TimelineProgressionPreparation from '../components/TimelineProgressionPreparation';

export default function PreparationJeune() {
  // === ÉTAT POUR L’EXPANSION/RÉDUCTION DES PHASES ===
  const [phasesOuvertes, setPhasesOuvertes] = useState(phasesMetier.map(() => false));

  // Handler pour toggler l’état d’une phase
  const togglePhase = idx => {
    setPhasesOuvertes(prev => prev.map((open, i) => i === idx ? !open : open));
  };

  // === HOOKS & VARIABLES (ordre strict) ===
  // Date du jeûne, durée, jour courant
  const [dateJeune, setDateJeune] = useState(null);
  const [dureeJeune, setDureeJeune] = useState(null);
  const [aujourdhui, setAujourdhui] = useState(new Date());
  const [jCourant, setJCourant] = useState(null);
  useEffect(() => {
    if (dateJeune) {
      const dateJeuneObj = new Date(dateJeune);
      const dateAuj = new Date();
      const diffTime = dateJeuneObj.getTime() - dateAuj.getTime();
      const diffJours = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      setJCourant(diffJours);
    }
  }, [dateJeune]);

  // Critères de préparation (statut dynamique)
  // État de démarrage du suivi de préparation (workflow interactif)
  const [preparationActive, setPreparationActive] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [preparationData, setPreparationData] = useState(null);
  const [feedbackMessage, setFeedbackMessage] = useState("");
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

  // Handler pour validation de la modale et activation complète du workflow
  function handleStartPreparationModal(data) {
    // Sauvegarde des données de préparation
    setPreparationData(data);
    if (typeof window !== 'undefined') {
      localStorage.setItem('preparationData', JSON.stringify(data));
      localStorage.setItem('preparationActive', 'true');
      localStorage.setItem('dateJeune', data.startDate);
      localStorage.setItem('dureeJeune', data.duration);
    }
    // Activation de la préparation
    setPreparationActive(true);
    // Initialisation des critères métier
    const criteresInit = criteresMetier.map(c => ({ ...c, valide: false, dateValidation: null }));
    setCriteres(criteresInit);
    if (typeof window !== 'undefined') {
      localStorage.setItem('criteresPreparation', JSON.stringify(criteresInit));
    }
    setFeedbackMessage("✅ Préparation activée ! Suivi et critères disponibles.");
    // Feedback visuel (console)
    console.log('Préparation activée, critères initialisés, timeline affichée. Source : action utilisateur, validation modale.');
  }

  // Handler pour réinitialiser toute la préparation
  function handleResetPreparation() {
    setPreparationData(null);
    setPreparationActive(false);
    setCriteres([]);
    setProgression(0);
    setMessagePerso("");
    setSyntheseVisible(false);
    setDateJeune(null);
    setDureeJeune(null);
    setJCourant(null);
    setFeedbackMessage("Préparation réinitialisée. Vous pouvez recommencer le suivi.");
    if (typeof window !== 'undefined') {
      localStorage.removeItem('preparationData');
      localStorage.removeItem('preparationActive');
      localStorage.removeItem('criteresPreparation');
      localStorage.removeItem('dateJeune');
      localStorage.removeItem('dureeJeune');
      localStorage.removeItem('messagePersoPreparation');
    }
    // Feedback visuel (console)
    console.log('Préparation réinitialisée. Source : action utilisateur, bouton réinitialisation.');
  };

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
              onClick={() => setIsModalOpen(true)}
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
          <>
            <p style={{ color: "#388e3c", fontWeight: 600, fontSize: "1.08rem", marginBottom: 0 }} aria-live="polite">
              ✅ Suivi de préparation activé. Tu peux valider tes critères et suivre ta progression !
            </p>
            {preparationActive && (
              <button onClick={handleResetPreparation} style={{ marginTop: '14px', backgroundColor: '#f44336', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '5px', cursor: 'pointer' }}>
                Réinitialiser ma préparation
              </button>
            )}
          </>
        )}
      </div>
      {/* Timeline de préparation dynamique conforme fiche métier */}
      {preparationActive && (
        <div style={{ background: '#fff', borderRadius: 14, boxShadow: '0 2px 8px #0001', padding: '1.2rem 1.1rem', marginBottom: '2rem' }}>
          <h2 style={{ color: '#1976d2', fontWeight: 800, fontSize: '1.3rem', marginBottom: 8 }}>Timeline de préparation</h2>
          <div style={{ color: '#388e3c', fontWeight: 700, fontSize: '1.08rem', marginBottom: 8 }}>
            Progression globale : {progression}/9 critères validés
          </div>
          <div style={{ height: 8, background: '#e3f2fd', borderRadius: 6, marginBottom: 18 }}>
            <div style={{ width: `${(progression/9)*100}%`, height: '100%', background: '#1976d2', borderRadius: 6 }}></div>
          </div>
          {phasesMetier.map((phase, idx) => (
            <div key={phase.nom} style={{ marginBottom: 24 }}>
              <div style={{ fontWeight: 700, color: '#1976d2', fontSize: '1.12rem', marginBottom: 4, cursor: 'pointer', userSelect: 'none' }} onClick={() => togglePhase(idx)}>
                {phasesOuvertes[idx] ? '−' : '+'} PHASE {phase.nom.toUpperCase()} ({phase.debut === phase.fin ? `J-${phase.debut}` : `J-${phase.debut} à J-${phase.fin}`})
              </div>
              {phasesOuvertes[idx] && (
                <>
                  <div style={{ color: '#444', fontSize: '1.01rem', marginBottom: 10 }}>{phase.explication}</div>
                  {phase.criteres.map(critere => {
                    const estDebloque = jCourant !== null && jCourant <= critere.jalon;
                    return (
                      <div key={critere.id} style={{ borderBottom: '1px solid #e0e0e0', paddingBottom: 12, marginBottom: 12 }}>
                        <div style={{ fontWeight: 700, color: estDebloque ? '#1976d2' : '#888', fontSize: '1.07rem' }}>{critere.titre}</div>
                        <div style={{ color: '#555', fontSize: '0.99rem', marginBottom: 4 }}>{critere.conseil}</div>
                        <div style={{ color: '#888', fontSize: '0.97rem', marginBottom: 4 }}>Jalon : J-{critere.jalon}</div>
                        {!estDebloque ? (
                          <div style={{ color: '#f44336', fontWeight: 600, fontSize: '0.98rem', display: 'flex', alignItems: 'center', gap: '0.5em' }}>
                            <span aria-hidden="true" style={{ fontSize: '1.2em' }}>🔒</span>
                            Critère verrouillé — Débloquage automatique le J-{critere.jalon}
                          </div>
                        ) : (
                          <button
                            onClick={() => validerCritere(critere.id)}
                            style={{ background: '#1976d2', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 22px', fontWeight: 700, fontSize: 16, cursor: 'pointer', marginTop: 6 }}
                            disabled={criteres.find(c => c.id === critere.id)?.valide}
                            aria-label={`Valider le critère ${critere.titre}`}
                          >
                            {criteres.find(c => c.id === critere.id)?.valide ? 'Critère validé' : 'Valider ce critère'}
                          </button>
                        )}
                      </div>
                    );
                  })}
                </>
              )}
            </div>
          ))}
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
      {/* Message de feedback */}
      {feedbackMessage && (
        <div
          className="feedback-message"
          role="status"
          aria-live="polite"
          aria-atomic="true"
          style={{ marginBottom: 12, padding: '10px 18px', borderRadius: '8px', background: '#e6f7ff', color: '#005580', fontWeight: 600, boxShadow: '0 2px 8px rgba(0,0,0,0.07)', display: 'flex', alignItems: 'center', gap: '0.7em' }}
        >
          <span style={{ fontSize: '1.3em' }} aria-hidden="true">✅</span>
          <span>{feedbackMessage}</span>
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
      <StartPreparationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleStartPreparationModal}
      />
    </div>
  );
}
