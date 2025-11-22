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
import { getCriteresPreparation, isPeriodeActive, validerCriterePreparation, calculerJourRelatif } from "../lib/validerCriterePreparation";
import HeaderPreparation from '../components/HeaderPreparation';
import TimelinePreparation from '../components/TimelinePreparation';
import ProgressBar from '../components/ProgressBar';
import PhaseCard from '../components/PhaseCard';
import Feedback from '../components/Feedback';
import Navigation from '../components/Navigation';
import StartPreparationModal from '../components/StartPreparationModal';
import { useSupabase } from '../lib/supabaseClient';
// ...existing code...

export default function PreparationJeune() {
  // Récupération du userId via Supabase
  const supabase = useSupabase();
  const [userId, setUserId] = useState(null);
  const [authError, setAuthError] = useState(null);
  useEffect(() => {
    let ignore = false;
    async function fetchUser() {
      const { data, error } = await supabase.auth.getUser();
      if (!ignore) {
        if (error || !data?.user) {
          setUserId(null);
          setAuthError("Vous devez être connecté pour démarrer la préparation et voir l'analyse des repas.");
        } else {
          setUserId(data.user.id);
          setAuthError(null);
        }
      }
    }
    fetchUser();
    return () => { ignore = true; };
  }, [supabase]);
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
      const diffJours = calculerJourRelatif(dateJeune, new Date());
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
      const diff = calculerJourRelatif(dateStr, new Date());
      setJCourant(diff);
      // Déclenchement automatique de la modale de validation métier si la date change
      setIsModalOpen(true);
    } else {
      setFeedbackMessage("⛔ Veuillez renseigner la date de début de jeûne pour activer le suivi et la progression.");
      setPreparationActive(false);
    }
    // Initialisation des critères (localStorage ou valeurs métier)
    let criteresInit = criteresMetier.map(c => ({ ...c, valide: false, dateValidation: null }));
    if (typeof window !== 'undefined') {
      const saved = getCriteresPreparation();
      if (saved && Object.keys(saved).length === criteresMetier.length) {
        criteresInit = criteresMetier.map(c => {
          const crit = saved[c.id];
          return crit ? { ...c, valide: !!crit.validé, dateValidation: crit.dateValidation } : { ...c, valide: false, dateValidation: null };
        });
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
    const critere = criteresMetier.find(c => c.id === id);
    if (!critere) {
      setFeedbackMessage("❌ Critère introuvable.");
      return;
    }
    // Vérification de la période active
    if (!isPeriodeActive(critere.jalon, jCourant)) {
      setFeedbackMessage("⛔ Validation impossible : la période pour ce critère n'est pas encore active ou est verrouillée. Veuillez respecter le calendrier de préparation.");
      return;
    }
    const dateValidation = new Date().toISOString();
    validerCriterePreparation(id, dateValidation);
    setCriteres(prev => prev.map(c => c.id === id ? { ...c, valide: true, dateValidation } : c));
    setFeedbackMessage("✅ Critère validé avec succès.");
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
  // === FIN DEBUG PANEL ===
  // Ajoute ceci dans le corps du composant PreparationJeune (avant le return)
React.useEffect(() => {
  console.log('[DEBUG] Date lue (state):', dateJeune);
  if (typeof window !== 'undefined') {
    console.log('[DEBUG] Date lue (localStorage):', window.localStorage.getItem('dateJeune'));
  }
  console.log('[DEBUG] Jour courant (jCourant):', jCourant);
  console.log('[DEBUG] Progression:', progression);
  console.log('[DEBUG] preparationActive:', preparationActive);
  console.log('[DEBUG] Feedback:', feedbackMessage);
  console.log('[DEBUG] Critères:', criteres);
}, [dateJeune, jCourant, progression, preparationActive, feedbackMessage, criteres]);

const DebugPanel = () => (
  <div style={{background:'#ffe',border:'2px solid #fc0',padding:'12px',marginBottom:'18px',fontSize:'15px'}}>
    <strong>DEBUG PANEL</strong><br/>
    Date lue (state): {dateJeune ? dateJeune.toString() : 'null'}<br/>
    Date lue (localStorage): {typeof window !== 'undefined' ? window.localStorage.getItem('dateJeune') : 'n/a'}<br/>
    Jour courant (jCourant): {jCourant !== null ? jCourant : 'null'}<br/>
    Progression: {progression}<br/>
    preparationActive: {preparationActive ? 'true' : 'false'}<br/>
    Feedback: {feedbackMessage}<br/>
    Critères: <pre style={{fontSize:'13px',background:'#fff',padding:'6px',border:'1px solid #ccc'}}>{JSON.stringify(criteres, null, 2)}</pre>
  </div>
);

  // Fonction utilitaire pour calculer la date réelle d'un jalon
  function getDateFromJalon(jalon) {
    if (!dateJeune) return null;
    const d = new Date(dateJeune);
    d.setDate(d.getDate() - (jCourant - jalon));
    return d;
  }

  // Fonction pour formater une date
  function formatDateAffichage(date) {
    if (!date) return '';
    return date.toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' });
  }

  return (
    <div style={{ background: '#F5F8FA', minHeight: '100vh', paddingBottom: 40 }}>
      <Navigation />
      <HeaderPreparation />
      <div style={{ maxWidth: 900, margin: '0 auto', padding: '0 12px' }}>
        {/* Feedback global */}
        {feedbackMessage && (
          <Feedback type={feedbackMessage.startsWith('✅') ? 'success' : feedbackMessage.startsWith('⛔') || feedbackMessage.startsWith('❌') ? 'error' : 'info'}>
            {feedbackMessage}
          </Feedback>
        )}
        {/* Date de début de jeûne */}
        <div style={{ background: '#fff', borderRadius: 12, padding: '14px 22px', marginBottom: 24, fontWeight: 600, fontSize: '1.08em', color: '#4F8FFF', boxShadow: '0 2px 8px 0 rgba(79,143,255,0.07)', border: '1px solid #E3EAF2', maxWidth: 420, marginLeft: 'auto', marginRight: 'auto' }}>
          Date de début de jeûne : {dateJeune ? formatDateAffichage(dateJeune) : <span style={{ color: '#FF6B6B' }}>Non renseignée</span>}
        </div>
        {/* Timeline moderne */}
        <TimelinePreparation
          phases={phasesMetier.map(phase => ({
            nom: phase.nom,
            debut: phase.debut,
            fin: phase.fin,
            icone: phase.nom === 'Fondations' ? '🧱' : phase.nom === 'Intensification' ? '⚡' : '🚀',
            couleur: phase.nom === 'Fondations' ? '#FFD166' : phase.nom === 'Intensification' ? '#4F8FFF' : '#43D9A3',
          }))}
          currentDay={jCourant}
        />
        {/* Progression globale */}
        <ProgressBar value={progression} max={criteresMetier.length} />
        {/* Phases et critères */}
        {phasesMetier.map((phase, idx) => (
          <PhaseCard
            key={phase.nom}
            phase={{
              nom: phase.nom,
              explication: phase.explication,
              periode: `${getDateFromJalon(phase.debut) ? formatDateAffichage(getDateFromJalon(phase.debut)) : '...'} à ${getDateFromJalon(phase.fin) ? formatDateAffichage(getDateFromJalon(phase.fin)) : '...'}`
            }}
            criteres={criteres.filter(c => c.jalon === phase.debut || c.jalon === phase.fin || (c.jalon <= phase.debut && c.jalon >= phase.fin))}
            onValider={preparationActive ? validerCritere : undefined}
          />
        ))}
        {/* Message personnel */}
        <section style={{ background: '#fff', borderRadius: 12, boxShadow: '0 2px 8px 0 rgba(79,143,255,0.07)', border: '1px solid #E3EAF2', padding: '18px 22px', margin: '32px 0', maxWidth: 600, marginLeft: 'auto', marginRight: 'auto' }}>
          <h3 style={{ color: '#4F8FFF', fontWeight: 700, fontSize: '1.13rem', marginBottom: 8 }}>📝 Mon message à moi-même pour le jour du jeûne</h3>
          <textarea
            value={messagePerso}
            onChange={handleMessageChange}
            placeholder="Écris-toi un message de motivation pour le jour J..."
            style={{ width: '100%', minHeight: 60, borderRadius: 8, border: '1.5px solid #E3EAF2', padding: 10, fontSize: '1.05em', fontFamily: 'Inter, Roboto, Arial, sans-serif', marginBottom: 6 }}
          />
          <div style={{ color: '#6B778C', fontSize: '0.98em' }}>Ce message te sera rappelé le jour J pour renforcer ta motivation.</div>
        </section>
        {/* Bloc de démarrage ou de réinitialisation de la préparation */}
        <div style={{ textAlign: 'center', margin: '32px 0' }}>
          {!preparationActive ? (
            <>
              <button
                onClick={() => setIsModalOpen(true)}
                aria-label="Démarrer mon suivi de préparation"
                style={{
                  background: 'linear-gradient(90deg, #4F8FFF 0%, #43D9A3 100%)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 8,
                  padding: '14px 36px',
                  fontWeight: 800,
                  fontSize: 18,
                  cursor: 'pointer',
                  marginBottom: 8,
                  boxShadow: '0 2px 8px 0 rgba(79,143,255,0.10)',
                  fontFamily: 'Inter, Roboto, Arial, sans-serif',
                  letterSpacing: 0.5
                }}
                autoFocus
                type="button"
              >
                Démarrer mon suivi de préparation
              </button>
              <StartPreparationModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleStartPreparationModal}
                userId={userId}
              />
              {authError && (
                <div style={{color:'#FF6B6B',fontWeight:700,marginTop:12}}>{authError}</div>
              )}
              <div aria-live="polite" style={{ minHeight: 24, marginTop: 8 }}>
                {/* Zone de feedback dynamique pour lecteurs d’écran */}
              </div>
            </>
          ) : (
            <>
              <p style={{ color: '#43D9A3', fontWeight: 700, fontSize: '1.08rem', marginBottom: 0 }} aria-live="polite">
                ✅ Suivi de préparation activé. Tu peux valider tes critères et suivre ta progression !
              </p>
              <button onClick={handleResetPreparation} style={{ marginTop: '14px', backgroundColor: '#FF6B6B', color: '#fff', border: 'none', padding: '12px 28px', borderRadius: '8px', cursor: 'pointer', fontWeight: 700, fontSize: 16, fontFamily: 'Inter, Roboto, Arial, sans-serif' }}>
                Réinitialiser ma préparation
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
