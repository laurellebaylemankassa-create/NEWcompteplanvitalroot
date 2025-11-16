// Bouton retour à l’accueil
function RetourAccueil() {
  return (
    <div style={{ margin: '2rem 0 1.5rem 0', textAlign: 'center' }}>
      <Link href="/">
        <button style={{
          background: '#1976d2',
          color: '#fff',
          border: 'none',
          borderRadius: 8,
          padding: '10px 28px',
          fontWeight: 700,
          fontSize: 17,
          cursor: 'pointer',
          boxShadow: '0 1px 6px #e0e0e0',
        }}>
          🏠 Retour à l’accueil
        </button>
      </Link>
    </div>
  );
}
// ...existing code...
// ----------- HANDLER POUR LA SAUVEGARDE D'UN REPAS -----------
// La fonction handleSaveRepas est définie plus bas dans le composant principal, après l’import unique de Supabase.
import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabaseClient';
import Link from 'next/link';
import RepasBloc from "../components/RepasBloc";
import TimelineProgression from "../components/TimelineProgression";
import SaisieDefiAlimentaire from "../components/SaisieDefiAlimentaire";
import { useDefis } from "../components/DefisContext";

// Utilitaire message cyclique
function pickMessage(array, key) {
  if (!array || array.length === 0) return "";
  let idx = 0;
  if (typeof window !== "undefined" && window.localStorage) {
    idx = Number(localStorage.getItem(key) || 0);
    localStorage.setItem(key, (idx + 1) % array.length);
  }
  const msg = array[idx % array.length];
  return msg;
}

// Utilitaires de date
function isInLast7Days(dateString, refDateString) {
  const now = new Date(refDateString);
  const sevenDaysAgo = new Date(now);
  sevenDaysAgo.setDate(now.getDate() - 6);
  const target = new Date(dateString);
  return target >= sevenDaysAgo && target <= now;
}

function Snackbar({ open, message, type = "info", onClose }) {
  if (!open) return null;
  return (
    <div
      style={{
        position: "fixed",
        bottom: 32,
        left: "50%",
        transform: "translateX(-50%)",
        background: type === "error" ? "#f44336" : "#4caf50",
        color: "#fff",
        padding: "12px 32px",
        borderRadius: 32,
        boxShadow: "0 2px 16px 0 rgba(0,0,0,0.15)",
        zIndex: 1000,
        fontWeight: 500,
        fontSize: 16,
        minWidth: 180,
        textAlign: "center",
      }}
      onClick={onClose}
      tabIndex={0}
      aria-live="polite"
    >
      {message}
    </div>
  );
}

function ProgressBar({ value, max = 100, color = "#4caf50" }) {
  return (
    <div style={{ background: "#e0e0e0", borderRadius: 8, height: 16, width: "100%" }}>
      <div
        style={{
          width: `${Math.min(value, max)}%`,
          height: "100%",
          background: color,
          borderRadius: 8,
          transition: "width 0.5s",
        }}
      ></div>
    </div>
  );
}

const repasIcons = {
  "Petit-déjeuner": "🥐",
  "Déjeuner": "🍽️",
  "Collation": "🍏",
  "Dîner": "🍲",
  "Autre": "🍴",
};

// BADGES / PROGRESSION (Zone 2 - affiché uniquement palier===1)
const PROGRESSION_MILESTONES = [
  { streak: 12, message: "3 mois sans dépasser 1 extra/semaine : Ta gestion des extras est exemplaire. C’est un nouveau mode de vie que tu installes, bravo ! Ne relâche pas tes efforts : évite la zone de satisfaction et continue à prendre soin de tes habitudes !" },
  { streak: 8, message: "8 semaines de maîtrise des extras ! Tu prouves que tu peux tenir sur la durée. C’est la marque des personnes déterminées : tu peux être fier(e) de toi." },
  { streak: 4, message: "4 semaines d’affilée, c’est impressionnant ! Tu installes une vraie discipline sur les extras. Ta persévérance va bientôt devenir une habitude solide." },
  { streak: 2, message: "Bravo, deux semaines de suite ! Ta régularité paie : tu maîtrises de mieux en mieux tes envies d’extras. Garde ce cap, chaque semaine compte !" },
  { streak: 1, message: "Félicitations ! Tu as réussi à limiter tes extras à 1 cette semaine. Tu fais un grand pas vers l’équilibre, continue ainsi !" },
];
const INTERRUPTION_VERBATIM = "Pas grave, chaque semaine est une nouvelle chance ! Tu as dépassé ton quota d’extras cette fois-ci, mais ce n’est qu’une étape. Reprends ta série, tu sais que tu peux y arriver !";
const REGULAR_MOTIVATION = "Limiter ses extras, c’est se rapprocher de ses objectifs semaine après semaine. Garde le rythme !";

function getWeeklyExtrasHistory(repasSemaine, selectedDate, nbWeeks = 16) {
  let today = new Date(selectedDate);
  let weeks = [];
  let calcMonday = (d) => {
    let date = new Date(d);
    let day = date.getDay();
    let monday = new Date(date);
    monday.setDate(date.getDate() - (day === 0 ? 6 : day - 1));
    monday.setHours(0,0,0,0);
    return monday;
  };
  let monday = calcMonday(today);
  for(let i=0; i<nbWeeks; i++) {
    let weekStart = new Date(monday);
    weekStart.setDate(monday.getDate() - (i*7));
    weekStart.setHours(0,0,0,0);
    let weekEnd = new Date(weekStart); weekEnd.setDate(weekStart.getDate() + 6);
    let count = repasSemaine.filter(r => {
      let d = new Date(r.date);
      d.setHours(0,0,0,0);
      return d >= weekStart && d <= weekEnd && r.est_extra;
    }).length;
    weeks.push({
      weekStart: weekStart.toISOString().slice(0,10),
      count,
      isCurrent: (i === 0),
    });
  }
  return weeks;
}

function getWeeklyPalier(history) {
  // Correction : le palier est toujours inférieur à la consommation max observée
  let maxExtras = 0;
  for (let i = history.length - 1; i >= 0; i--) {
    if (history[i].count > maxExtras) {
      maxExtras = history[i].count;
    }
  }
  let palier = Math.max(1, maxExtras - 1);
  // On descend le palier d'un cran si la semaine actuelle respecte le palier
  if (history[0] && history[0].count <= palier && palier > 1) {
    palier = palier - 1;
  }
  return palier;
}

function getProgressionMessage(history, palier) {
  if (palier > 1) {
    return { badgeMessage: null, milestone: null, interruption: false, nextMilestone: null, weeksToNext: 0, streak: 0, allMilestones: [] };
  }
  let streak = 0, maxStreak = 0, interruption = false, milestone = 0;
  let lastWasStreak = false;
  let milestonesUnlocked = [];
  for(let i = 0; i < history.length; i++) {
    if(history[i].count <= 1) {
      streak++;
      if(streak > maxStreak) maxStreak = streak;
      lastWasStreak = true;
      if(history[i].isCurrent) {
        for (let m of PROGRESSION_MILESTONES) {
          if (streak === m.streak) {
            milestonesUnlocked.push({week: i, msg: m.message, streak: m.streak});
          }
        }
      }
    } else {
      if(history[i].isCurrent && streak > 0 && !lastWasStreak) interruption = true;
      streak = 0;
      lastWasStreak = false;
    }
  }
  const lastMilestone = milestonesUnlocked.length > 0 ? milestonesUnlocked[milestonesUnlocked.length-1] : null;
  const currentStreak = history[0]?.count <= 1 ? streak : 0;
  const nextMilestoneObj = PROGRESSION_MILESTONES.find(m => m.streak > currentStreak);
  return (
    <div style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
      {/* ...existing code... */}
      <div style={{textAlign:'center', marginTop:'3.5rem', display:'flex', flexWrap:'wrap', justifyContent:'center', gap:'1.2rem'}}>
        <Link href="/tableau-de-bord">
          <button style={{background:'#43a047', color:'#fff', border:'none', borderRadius:8, padding:'10px 28px', fontWeight:700, fontSize:17, cursor:'pointer', boxShadow:'0 1px 6px #e0e0e0'}}>🏠 Retour au tableau de bord</button>
        </Link>
        <Link href="/defis">
          <button style={{background:'#ff9800', color:'#fff', border:'none', borderRadius:8, padding:'10px 28px', fontWeight:700, fontSize:17, cursor:'pointer', boxShadow:'0 1px 6px #e0e0e0'}}>🎯 Voir mes défis</button>
        </Link>
        <Link href="/plan">
          <button style={{background:'#1976d2', color:'#fff', border:'none', borderRadius:8, padding:'10px 28px', fontWeight:700, fontSize:17, cursor:'pointer', boxShadow:'0 1px 6px #e0e0e0'}}>📅 Planifier mes repas</button>
        </Link>
        <Link href="/">
          <button style={{background:'#e53935', color:'#fff', border:'none', borderRadius:8, padding:'10px 28px', fontWeight:700, fontSize:17, cursor:'pointer', boxShadow:'0 1px 6px #e0e0e0'}}>🏠 Accueil</button>
        </Link>
      </div>
    </div>
  );
}

function ProgressionHistory({ history }) {
  const [showAll, setShowAll] = useState(false);
  // Affichage semaine actuelle et précédente pour comparaison
  const current = history[0];
  const previous = history[1];
  return (
    <div>
      <div style={{marginBottom:8}}>
        <b>Semaine actuelle :</b> {current ? `${current.weekStart} — ${current.count} extra${current.count>1?'s':''}` : '—'}
        {current && current.count<=1 && <span style={{color:"#43a047"}}> (dans l’objectif)</span>}
      </div>
      <div style={{marginBottom:8}}>
        <b>Semaine précédente :</b> {previous ? `${previous.weekStart} — ${previous.count} extra${previous.count>1?'s':''}` : '—'}
        {previous && previous.count<=1 && <span style={{color:"#43a047"}}> (dans l’objectif)</span>}
      </div>
      <div style={{marginBottom:8, color:'#1976d2'}}>
        {current && previous ? `Évolution : ${current.count - previous.count > 0 ? '+' : ''}${current.count - previous.count} extra(s)` : ''}
      </div>
      <button
        style={{
          background: "#eee", color: "#1976d2", border: "none", borderRadius: 6,
          fontWeight: 600, cursor: "pointer", fontSize: 14, marginTop: 8, marginBottom: 6, padding: "4px 14px"
        }}
        onClick={() => setShowAll(s => !s)}
        aria-expanded={showAll}
      >
        {showAll ? "Masquer l’historique" : "Voir l’historique des badges"}
      </button>
      {showAll && (
        <ul style={{ fontSize: 14, color: "#888", margin: 0, padding: "0 0 0 14px" }}>
          {history.map((w, i) => (
            <li key={i}>
              <span style={{fontWeight: w.isCurrent ? 700 : 400}}>
                Semaine du {w.weekStart} : {w.count} extra{w.count>1?'s':''}
                {w.count<=1 && <span style={{color:"#43a047"}}> (dans l’objectif)</span>}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

// ZONE 1 : Feedback immédiat (toujours affiché)
function ZoneFeedbackHebdo({
  extrasThisWeek,
  extrasLastWeek,
  palier,
  objectifFinal = 1,
  onInfoClick,
  variation
}) {
  let message, color;
  if (extrasThisWeek <= palier) {
    message = `Bravo, tu as limité tes extras à ${extrasThisWeek} cette semaine${extrasThisWeek <= 1 ? " !" : ""}`;
    color = "#43a047";
  } else {
    message = `Tu as dépassé ton quota cette semaine (${extrasThisWeek}/${palier}). Tu peux faire mieux, penses à planifier tes extras pour t'aider à progresser !`;
    color = "#f57c00";
  }

  const showLastWeek =
    typeof extrasLastWeek === "number" &&
    extrasLastWeek > 0 &&
    typeof variation === "number" &&
    variation < 0;

  return (
    <div
      style={{
        border: "2px solid #1976d2",
        borderRadius: 12,
        background: "#f0f6ff",
        margin: "18px 0 12px",
        padding: "16px 20px",
        fontWeight: 600,
        fontSize: 17,
        color,
        display: "flex",
        flexDirection: "column",
        alignItems: "center"
      }}
      aria-live="polite"
    >
      <div style={{marginBottom: 4}}>{message}</div>
      {showLastWeek && (
        <div style={{fontSize: 14, color: "#1976d2", fontWeight: 500, margin: "4px 0"}}>
          Semaine dernière : {extrasLastWeek} extra{extrasLastWeek > 1 ? "s" : ""}
          <span style={{ marginLeft: 10 }}>
            ({variation < 0 ? `-${Math.abs(variation)} extra${variation <= -2 ? "s" : ""}` : ""})
          </span>
        </div>
      )}
      <div style={{fontSize: 14, color: "#888"}}>
        Palier actuel&nbsp;: <b>{palier}</b> extra{palier>1?"s":""}&nbsp;/ semaine&nbsp;&nbsp;|&nbsp;&nbsp;Objectif final&nbsp;: <b>{objectifFinal}</b> extra/semaine
      </div>
      <button
        style={{marginTop: 8, background: "#1976d2", color:"#fff", border: "none", borderRadius: 6, fontWeight: 600, cursor:"pointer", fontSize: 13, padding: "6px 14px"}}
        onClick={onInfoClick}
      >
        Consulter la règle des extras
      </button>
    </div>
  );
}

// ZONE 2 : Progression / badges (affiché SEULEMENT si palier===1)
function ZoneBadgesProgression({ progression, history, palier }) {
  if (palier > 1) {
    return null;
  }
  let content;
  if (progression.badgeMessage) {
    content = <div style={{color:"#4d148c", fontWeight:800, fontSize:16, marginBottom:6}}>{progression.badgeMessage}</div>;
  } else if (progression.interruption) {
    content = <div style={{color:"#e53935", fontWeight:700}}>{INTERRUPTION_VERBATIM}</div>;
  } else if (progression.nextMilestone) {
    content = (
      <div style={{color:"#1976d2", fontWeight:600}}>
        Encore {progression.weeksToNext} semaine{progression.weeksToNext>1?"s":""} à 1 extra ou moins pour débloquer le prochain badge ! Tu es sur la bonne voie, continue ainsi pour franchir un nouveau cap.
      </div>
    );
  } else {
    content = <div style={{color:"#888", fontWeight:600}}>{REGULAR_MOTIVATION}</div>;
  }
  return (
    <div
      style={{
        border: "2px dashed #4d148c",
        borderRadius: 12,
        background: "#faf7ff",
        padding: "14px 18px",
        margin: "12px 0 22px",
        textAlign: "center",
      }}
      aria-live="polite"
    >
      <div style={{fontSize: 17, marginBottom: 2, fontWeight:700, color:"#4d148c"}}>Progression & badges</div>
      {content}
      <ProgressionHistory history={history} />
    </div>
  );
}

// MAIN COMPONENT
export default function Suivi() {
  // ----------- HOOKS PRINCIPAUX (ordre strict selon la checklist) -----------
  // Initialiser selectedDate AVANT tout usage dans un useEffect ou une variable calculée
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().slice(0,10));
  // Récupérer la date du jeûne programmé (stockée en localStorage ou BDD)
  const [dateJeune, setDateJeune] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('dateJeunePrevu') || null;
    }
    return null;
  });
  // Liste des critères par jalon (doit matcher la timeline métier)
  const criteresPreparation = [
    { jour: -30, label: "Respect strict des quantités à chaque repas" },
    { jour: -17, label: "Pas de féculents le soir (lun-dim) + action après repas" },
    { jour: -14, label: "Éliminer tous produits transformés et sucreries" },
    { jour: -12, label: "2 jours de jeûne plein" },
    { jour: -7, label: "2L d’eau/jour, pas de repas après 19h, plage 45min" },
    { jour: 0, label: "Lancement du jeûne" },
  ];
  // Calcul du critère actif du jour (en phase préparation)
  let critereActif = null;
  let jRelatif = null;
  if (dateJeune && selectedDate) {
    const dJeune = new Date(dateJeune);
    const dSel = new Date(selectedDate);
    jRelatif = Math.floor((dJeune - dSel) / (1000*60*60*24));
    // Trouver le critère actif (le plus proche <= jRelatif)
    critereActif = criteresPreparation.find((c, idx) => {
      const next = criteresPreparation[idx+1];
      return jRelatif <= c.jour && (!next || jRelatif > next.jour);
    }) || null;
  }
  // Stockage des validations locales (clé: "prep_valid_{date}")
  const [prepValid, setPrepValid] = useState(() => {
    if (typeof window !== 'undefined' && selectedDate) {
      return localStorage.getItem('prep_valid_' + selectedDate) === '1';
    }
    return false;
  });
  // Handler validation manuelle
  const handleValiderCriterePrep = () => {
    if (typeof window !== 'undefined' && selectedDate) {
      localStorage.setItem('prep_valid_' + selectedDate, '1');
      setPrepValid(true);
      setSnackbar({ open: true, message: "Critère de préparation validé pour aujourd'hui !", type: "success" });
    }
  };
  // Sync hook si date change
  useEffect(() => {
    if (typeof window !== 'undefined' && selectedDate) {
      setPrepValid(localStorage.getItem('prep_valid_' + selectedDate) === '1');
    }
  }, [selectedDate]);
  // Import du contexte défis pour savoir si un défi alimentaire est en cours
  // Respecte la checklist : hooks, logique, handlers déclarés avant le rendu
  // Utilisation du hook useDefis pour la réactivité
  // Utilisation standard du hook useDefis pour la réactivité du contexte
  const { defisEnCours, refreshDefis, loading: loadingDefis, error: errorDefis } = useDefis ? useDefis() : { defisEnCours: [], refreshDefis: () => {}, loading: false, error: null };
  const defiAlimentaireActif = defisEnCours && defisEnCours.some(d => d.nom === '🧀 1 portion ça suffit');
  // (déplacé ci-dessus)
  // Affichage de la saisie dédiée au défi alimentaire en cours (ex : 1 portion ça suffit)
  // Respecte la checklist : hooks, logique, handlers déclarés avant le rendu
  // Affiche le composant avant la sélection du type de repas
  const handleSaveRepas = async (repasData) => {
    try {
      // Enregistrement du repas dans Supabase
      const { data, error } = await supabase
        .from("repas_reels")
        .insert([repasData]);
      if (error) {
        setSnackbar({ open: true, message: "Erreur Supabase : " + error.message, type: "error" });
        return;
      }
      setSnackbar({ open: true, message: "Repas enregistré !", type: "success" });
    } catch (error) {
      setSnackbar({ open: true, message: "Erreur lors de l'enregistrement du repas.", type: "error" });
    }
  };
  // ...tous les hooks, useEffect et logique métier ici...
  // ...calculs et logique...
  // ...handlers et fonctions utilitaires...
  // ----------- AUTRES HOOKS PRINCIPAUX -----------
  const [selectedType, setSelectedType] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', type: 'info' });
  // Objectif calorique et calories du jour
  const [objectifCalorique, setObjectifCalorique] = useState(1800); // Valeur par défaut, à personnaliser
  const [caloriesDuJour, setCaloriesDuJour] = useState(0);
  const [showInfo, setShowInfo] = useState(false);
  const [loading, setLoading] = useState(false);
  // Hook pour afficher/masquer l’historique des repas avec note
  const [showNotesHistory, setShowNotesHistory] = useState(false);
  // Plan de repas du jour (repas planifiés)
  const [repasPlan, setRepasPlan] = useState({});
  // Hook pour l'affichage de l'alerte calorique
  const [repasSemaine, setRepasSemaine] = useState([]);

  // Chargement automatique des repas et du plan depuis Supabase
  useEffect(() => {
    async function fetchRepasEtPlan() {
      // Repas réels
      const { data: repasData, error: repasError } = await supabase
        .from('repas_reels')
        .select('*')
        .order('date', { ascending: false });
      if (!repasError && Array.isArray(repasData)) {
        setRepasSemaine(repasData);
        // Calculer les calories du jour à partir des repas du jour
        const repasDuJour = repasData.filter(r => r.date === selectedDate);
        const totalCalories = repasDuJour.reduce((sum, r) => sum + (r.kcal ? Number(r.kcal) : 0), 0);
        setCaloriesDuJour(totalCalories);
      }
      // Repas planifiés
      const { data: planData, error: planError } = await supabase
        .from('repas_planifies')
        .select('*')
        .eq('date', selectedDate);
      if (!planError && Array.isArray(planData)) {
        // Construire un objet { type: { aliment, categorie } }
        const planObj = {};
        planData.forEach(r => {
          planObj[r.type] = { aliment: r.aliment, categorie: r.categorie };
        });
        setRepasPlan(planObj);
      } else {
        setRepasPlan({});
      }
    }
    fetchRepasEtPlan();
  }, [selectedDate]);
  // Calcul de l'historique hebdomadaire (client only pour éviter hydration error)
  const [weeklyHistory, setWeeklyHistory] = useState([]);
  useEffect(() => {
    async function fetchHistory() {
      const history = getWeeklyExtrasHistory(repasSemaine, selectedDate, 16);
      // Récupérer les semaines validées depuis Supabase
      const { data: semainesValidees } = await supabase
  .from('semaines_validees')
        .select('weekStart, validee');
      // Fusionner le flag de validation
      const historyWithValidation = history.map(week => {
        const valid = semainesValidees?.find(s => s.weekStart === week.weekStart)?.validee === true;
        return { ...week, validee: valid };
      });
      setWeeklyHistory(historyWithValidation);
    }
    fetchHistory();
  }, [repasSemaine, selectedDate]);
  // Définition de extrasThisWeek à partir de l'historique
  const extrasThisWeek = weeklyHistory[0]?.count ?? 0;
  // Définition de extrasLastWeek et variation pour le feedback
  const extrasLastWeek = weeklyHistory[1]?.count ?? 0;
  const variation = typeof weeklyHistory[0]?.count === 'number' && typeof weeklyHistory[1]?.count === 'number'
    ? weeklyHistory[0].count - weeklyHistory[1].count
    : 0;

  // Calcul du palier et de l'objectif final
  const currentPalier = getWeeklyPalier(weeklyHistory);
  const objectifFinal = 1;

  // ----------- CALCUL DES EXTRAS HORS QUOTA -----------
  // On considère hors quota si le nombre d'extras dépasse le palier
  const extrasHorsQuota = repasSemaine.filter((r) => r.est_extra && extrasThisWeek > currentPalier);

  // Calcul du score calorique du jour (en pourcentage)
  const scoreCalorique = (objectifCalorique && caloriesDuJour)
    ? Math.round((caloriesDuJour / objectifCalorique) * 100)
    : 0;
  // Calcul du score discipline journalier (repas alignés)
  // Score de régularité de saisie (motivation à la saisie)
  const repasTypes = ["Petit-déjeuner", "Déjeuner", "Collation", "Dîner"];
  const repasDuJourRegularite = repasSemaine.filter(r => r.date === selectedDate);
  const nbRepasSaisis = repasTypes.reduce((acc, type) => acc + (repasDuJourRegularite.some(r => r.type === type) ? 1 : 0), 0);
  const scoreRegularite = Math.round((nbRepasSaisis / repasTypes.length) * 100);
  // Fonction utilitaire pour score discipline
  function isRepasAligne(r, plan) {
    // Repas conforme au planning
    if (r.repas_planifie_respecte) return true;
    // Si extra ou fast food, non aligné
    if (r.est_extra || r.isFastFood || r.fastFoodType) return false;
    // Si aliment modifié
    if (plan && plan.aliment && r.aliment && plan.aliment.trim().toLowerCase() === r.aliment.trim().toLowerCase()) {
      return true;
    }
    return false;
  }
  const repasDuJour = repasSemaine.filter(r => r.date === selectedDate);
  let nbAlignes = 0;
  repasDuJour.forEach(r => {
    const plan = repasPlan[r.type];
    if (isRepasAligne(r, plan)) nbAlignes++;
  });
  const scoreJournalier = repasDuJour.length > 0 ? Math.round((nbAlignes / repasDuJour.length) * 100) : 0;
  // Score hebdomadaire (repas alignés sur la semaine)
  const semaineDates = repasSemaine.filter(r => {
    const d = new Date(r.date);
    const s = new Date(selectedDate);
    const monday = new Date(s); monday.setDate(s.getDate() - (s.getDay() === 0 ? 6 : s.getDay() - 1));
    const sunday = new Date(monday); sunday.setDate(monday.getDate() + 6);
    return d >= monday && d <= sunday;
  });
  let nbAlignesHebdo = 0;
  semaineDates.forEach(r => {
    const plan = repasPlan[r.type];
    if (isRepasAligne(r, plan)) nbAlignesHebdo++;
  });
  const scoreHebdomadaire = semaineDates.length > 0 ? Math.round((nbAlignesHebdo / semaineDates.length) * 100) : 0;
  // Progression pour les badges
  const progression = getProgressionMessage(weeklyHistory, currentPalier);

  // ----------- MESSAGE OBJECTIF INTERMÉDIAIRE PALIER -----------
  // S’affiche si palier > 1 et progression.nextMilestone existe
  const objectifIntermediaire = (currentPalier > 1 && progression.nextMilestone)
    ? {
        weeksToNext: progression.weeksToNext,
        streak: progression.streak,
        milestone: progression.nextMilestone.streak,
        message: `Encore ${progression.weeksToNext} semaine${progression.weeksToNext>1?'s':''} à ${currentPalier} extra${currentPalier>1?'s':''} ou moins pour descendre au palier suivant ! 💪\nObjectif : tenir ${progression.nextMilestone.streak} semaine${progression.nextMilestone.streak>1?'s':''} consécutive${progression.nextMilestone.streak>1?'s':''}.`,
      }
    : null;

  // ----------- HOOK POUR L'ALERTE CALORIQUE -----------
  const [showAlerteCalorique, setShowAlerteCalorique] = useState(false);
  useEffect(() => {
    setShowAlerteCalorique(
      objectifCalorique !== null && caloriesDuJour !== null && caloriesDuJour > objectifCalorique
    );
  }, [objectifCalorique, caloriesDuJour]);
  // ...autres hooks et logique métier...

  // ----------- LOGIQUE D'AFFICHAGE DYNAMIQUE MOTIVATION -----------
  const today = new Date();
  const selected = new Date(selectedDate);
  const dayOfWeek = today.getDay();
  const selectedDayOfWeek = selected.getDay();
  const extrasEnCours = extrasThisWeek;
  let messageMotivation = null;
  let showComparatif = false;
  let showValidation = false;
  // Motivation selon le jour réel
  if (dayOfWeek >= 1 && dayOfWeek <= 3) {
    messageMotivation = `Nouvelle semaine, nouveaux objectifs ! Palier actuel : ${currentPalier} extras/semaine.`;
    showComparatif = false;
  }
  if (dayOfWeek >= 4 && dayOfWeek <= 6) {
    if (extrasEnCours <= currentPalier) {
      messageMotivation = `Bravo, garde le cap, tu es sur la bonne voie ! (${extrasEnCours}/${currentPalier} extras)`;
    } else {
      messageMotivation = `Ce n’est pas trop tard, tu peux encore limiter les extras, rien n’est perdu ! (${extrasEnCours}/${currentPalier} extras)`;
    }
    showComparatif = false;
  }
  if (dayOfWeek === 0) {
    showComparatif = true;
    messageMotivation = null;
  }
  // Affichage du bouton validation si la date sélectionnée est un dimanche
  if (selectedDayOfWeek === 0) {
    showValidation = true;
  }

  // ----------- HANDLER DE RAFRAÎCHISSEMENT -----------
  const handleRefresh = () => {
    // Ici, on peut recharger les données ou forcer un re-render
    // Si vous avez une fonction fetchData, appelez-la ici
    if (typeof window !== 'undefined') {
      window.location.reload(); // Solution simple pour recharger la page
    }
  };
  // ----------- HANDLER DE VALIDATION DE LA SEMAINE -----------
  const handleValiderSemaine = async () => {
    try {
      // Calculer la date de début de la semaine sélectionnée
      const selectedWeekStart = (() => {
        const selectedDateObj = new Date(selectedDate);
        const day = selectedDateObj.getDay();
        const monday = new Date(selectedDateObj);
        monday.setDate(selectedDateObj.getDate() - (day === 0 ? 6 : day - 1));
        monday.setHours(0,0,0,0);
        return monday.toISOString().slice(0,10);
      })();
      // Persister la validation dans Supabase
      const { error } = await supabase.from('semaines_validees').upsert([{ weekStart: selectedWeekStart, validee: true }]);
      if (error) {
        setSnackbar({ open: true, message: error.message || "Erreur lors de la validation.", type: "error" });
        return;
      }
      setSnackbar({ open: true, message: "Semaine validée avec succès !", type: "info" });
      // Recharger l’historique pour mettre à jour la timeline
      const history = getWeeklyExtrasHistory(repasSemaine, selectedDate, 16);
      const { data: semainesValidees } = await supabase
  .from('semaines_validees')
        .select('weekStart, validee');
      const historyWithValidation = history.map(week => {
        const valid = semainesValidees?.find(s => s.weekStart === week.weekStart)?.validee === true;
        return { ...week, validee: valid };
      });
      setWeeklyHistory(historyWithValidation);
    } catch (e) {
      setSnackbar({ open: true, message: "Erreur lors de la validation.", type: "error" });
    }
  };
  // ----------- AFFICHAGE -----------
  return (
    <div style={{
      maxWidth: 700,
      margin: "0 auto",
      padding: "24px 8px 64px",
      fontFamily: "system-ui, Arial, sans-serif"
    }}>
      <Snackbar
        open={snackbar.open}
        message={snackbar.message}
        type={snackbar.type}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      />

      <h1 style={{
        textAlign: "center",
        marginBottom: 8,
        fontWeight: 800,
        fontSize: 32,
        letterSpacing: "0.5px"
      }}>
        🥗 Suivi alimentaire du jour
      </h1>
      <div style={{textAlign:'center', marginBottom:'1.5rem'}}>
        <button onClick={handleRefresh} style={{
          background:'#1976d2', color:'#fff', border:'none', borderRadius:8, padding:'8px 22px', fontWeight:600, fontSize:16, cursor:'pointer'
        }}>🔄 Rafraîchir les statistiques</button>
      </div>

      {/* ----------- INFOS CALORIQUES JOURNALIÈRES ----------- */}
      <div style={{
        marginBottom: 16,
        background: "#fff",
        borderRadius: 12,
        padding: "18px 18px 10px 18px",
        boxShadow: "0 1px 5px rgba(0,0,0,0.06)",
        borderLeft: "6px solid #ff9800",
        textAlign: "center"
      }}>
        <div>
          <span style={{ fontWeight: 600, color: "#888" }}>Objectif calorique du jour : </span>
          <span style={{ fontWeight: 700, color: "#ff9800", fontSize: 18 }}>
            {(objectifCalorique !== null && objectifCalorique !== undefined) ? `${objectifCalorique} kcal` : "…"}
          </span>
        </div>
        <div>
          <span style={{ fontWeight: 600, color: "#888" }}>Consommé aujourd’hui : </span>
          <span style={{ fontWeight: 700, color: "#1976d2", fontSize: 18 }}>
            {caloriesDuJour} kcal
          </span>
        </div>
        <div>
          <span style={{ fontWeight: 600, color: "#888" }}>Reste à consommer : </span>
          <span style={{
            fontWeight: 700,
            color: caloriesDuJour > objectifCalorique ? "#e53935" : "#43a047",
            fontSize: 18
          }}>
            {(objectifCalorique !== null && objectifCalorique !== undefined && caloriesDuJour !== null)
              ? (objectifCalorique - caloriesDuJour) + " kcal"
              : "..."}
          </span>
        </div>
      </div>


      {/* --------- ZONE 1 : Feedback immédiat --------- */}
      <ZoneFeedbackHebdo
        extrasThisWeek={extrasThisWeek}
        extrasLastWeek={extrasLastWeek}
        palier={currentPalier}
        objectifFinal={objectifFinal}
        onInfoClick={() => setShowInfo(true)}
        variation={variation}
      />

      {/* --------- Message objectif intermédiaire palier --------- */}
      {objectifIntermediaire && (
        <div style={{
          background: '#e8f5e9',
          border: '2px solid #43a047',
          borderRadius: 14,
          padding: '16px 22px',
          margin: '18px 0',
          boxShadow: '0 2px 8px #43a04733',
          textAlign: 'center',
          fontWeight: 700,
          fontSize: 18,
          color: '#43a047',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 16,
          animation: 'fadeIn 0.7s',
        }}>
          <span style={{fontSize:32}}>➡️</span>
          <span>{objectifIntermediaire.message}</span>
        </div>
      )}

      {/* --------- Mini-badge et message de baisse de palier --------- */}
      {typeof weeklyHistory[0]?.count === 'number' && typeof weeklyHistory[1]?.count === 'number' && currentPalier < weeklyHistory[1].count && (
        <div style={{
          background: '#fffde7',
          border: '2px solid #ffd600',
          borderRadius: 14,
          padding: '16px 22px',
          margin: '18px 0',
          boxShadow: '0 2px 8px #ffd60033',
          textAlign: 'center',
          fontWeight: 700,
          fontSize: 18,
          color: '#fbc02d',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 16
        }}>
          <span style={{fontSize:32}}>🏅</span>
          <span>Bravo ! Tu passes à <b>{currentPalier}</b> extras/semaine. Garde le cap pour descendre encore !</span>
        </div>
      )}

      {/* --------- Bloc motivation dynamique --------- */}
      {messageMotivation && (
        <div style={{
          background: '#e3f2fd',
          borderRadius: 10,
          padding: '14px 18px',
          margin: '12px 0 18px',
          boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
          fontSize: 17,
          color: '#1976d2',
          fontWeight: 600,
          textAlign: 'center',
        }}>
          {messageMotivation}
        </div>
      )}

      {/* --------- Comparaison hebdomadaire (uniquement le dernier jour) --------- */}
      {showComparatif && Array.isArray(weeklyHistory) && weeklyHistory.length > 0 && (
        <div style={{
          background: '#e3f2fd',
          borderRadius: 10,
          padding: '14px 18px',
          margin: '12px 0 18px',
          boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
          fontSize: 16,
          color: '#1976d2',
          fontWeight: 500
        }}>
          {(() => {
            function formatDateFr(dateStr) {
              const d = new Date(dateStr);
              return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' });
            }
            function getWeekRange(weekStartStr) {
              const start = new Date(weekStartStr);
              const end = new Date(start);
              end.setDate(start.getDate() + 6);
              return `du ${formatDateFr(start.toISOString())} au ${formatDateFr(end.toISOString())}`;
            }
            return (
              <>
                <div>
                  <b>Semaine écoulée :</b> {weeklyHistory[0] ? `${getWeekRange(weeklyHistory[0].weekStart)} — ${weeklyHistory[0].count} extra${weeklyHistory[0].count>1?'s':''}` : '—'}
                </div>
                <div>
                  <b>Semaine précédente :</b> {weeklyHistory[1] ? `${getWeekRange(weeklyHistory[1].weekStart)} — ${weeklyHistory[1].count} extra${weeklyHistory[1].count>1?'s':''}` : '—'}
                </div>
                <div style={{marginTop:6}}>
                  {typeof weeklyHistory[0]?.count === 'number' && typeof weeklyHistory[1]?.count === 'number' ? (
                    <span>
                      <b>Évolution :</b> {weeklyHistory[0].count - weeklyHistory[1].count > 0 ? '+' : ''}{weeklyHistory[0].count - weeklyHistory[1].count} extra(s)
                      {weeklyHistory[0].count < weeklyHistory[1].count ? <span style={{color:'#43a047', marginLeft:8}}>Bravo, tu progresses !</span> : weeklyHistory[0].count > weeklyHistory[1].count ? <span style={{color:'#e53935', marginLeft:8}}>Tu peux faire mieux la semaine prochaine !</span> : <span style={{color:'#888', marginLeft:8}}>Stable</span>}
                    </span>
                  ) : ''}
                </div>
              </>
            );
          })()}
        </div>
      )}


  {/* --------- ZONE 2 : Progression / badges --------- */}
  <ZoneBadgesProgression progression={progression} history={weeklyHistory} palier={currentPalier} />

  {/* --------- Timeline visuelle façon Instagram/TikTok --------- */}
  <TimelineProgression history={weeklyHistory} />

      {/* Modal info règle des extras */}
      {showInfo && (
        <div
          style={{
            position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.12)", zIndex: 2000,
            display: "flex", alignItems: "center", justifyContent: "center"
          }}
          onClick={() => setShowInfo(false)}
        >
          <div
            style={{
              background: "#fff", borderRadius: 12, padding: 24, maxWidth: 400, boxShadow: "0 4px 24px rgba(0,0,0,0.12)"
            }}
            onClick={e => e.stopPropagation()}
          >
            <h2 style={{fontWeight:700, fontSize:18, marginBottom:8}}>Règle des extras</h2>
            <div style={{fontSize:15, color:"#333"}}>
              <ul>
                <li>Les extras sont limités à un quota hebdomadaire personnalisé.</li>
                <li>Le quota est ajusté chaque semaine selon ta progression : plus tu progresses, plus il se rapproche de l’objectif final (1 extra/semaine).</li>
                <li>Les extras au-delà du quota sont marqués <b>hors quota</b> et visibles.</li>
                <li>Ta progression est récompensée par des badges et messages de félicitations à chaque jalon.</li>
                <li>L’historique complet de tes semaines reste accessible.</li>
              </ul>
              <button style={{
                marginTop:12, background:"#1976d2", color:"#fff", border:"none", borderRadius:8, fontWeight:600, fontSize:14, padding:"6px 16px"
              }} onClick={() => setShowInfo(false)}>Fermer</button>
            </div>
          </div>
        </div>
      )}

      {/* -------- Sélecteur de date -------- */}
      <div style={{ textAlign: "center", marginBottom: 24 }}>
        <label htmlFor="date-select" style={{ fontWeight: 600, marginRight: 8 }}>Sélectionnez une date :</label>
        <input
          id="date-select"
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          style={{
            padding: "8px",
            borderRadius: "4px",
            border: "1px solid #ccc",
            fontSize: "14px",
          }}
        />
      </div>

      {loading ? (
        <div style={{ textAlign: "center", margin: "48px 0" }}>
          <span style={{ fontSize: 24 }}>⏳</span>
          <div>Chargement en cours…</div>
        </div>
      ) : (
        <>
          {/* Affichage conditionnel strict selon la checklist */}
          {defiAlimentaireActif ? (
            <SaisieDefiAlimentaire />
          ) : (
            !selectedType ? (
              <div style={{ textAlign: "center", margin: "2rem 0" }}>
                <h2>Quel repas veux-tu consigner ?</h2>
                <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
                  <button onClick={() => setSelectedType("Petit-déjeuner")}>🥐 Petit-déjeuner</button>
                  <button onClick={() => setSelectedType("Déjeuner")}>🍽️ Déjeuner</button>
                  <button onClick={() => setSelectedType("Collation")}>🍏 Collation</button>
                  <button onClick={() => setSelectedType("Dîner")}>🍲 Dîner</button>
                  <button onClick={() => setSelectedType("Autre")}>🍴 Autre</button>
                </div>
                {/* Bannière critère préparation si phase préparation */}
                {critereActif && (
                  <div style={{
                    margin: '32px auto 0',
                    maxWidth: 480,
                    background: '#e3f2fd',
                    border: '2px solid #1976d2',
                    borderRadius: 12,
                    padding: '18px 20px',
                    fontWeight: 600,
                    fontSize: 17,
                    color: '#1976d2',
                    boxShadow: '0 2px 12px #1976d233',
                    textAlign: 'center'
                  }}>
                    <div style={{fontSize: 18, fontWeight: 700, marginBottom: 6}}>🌙 Préparation au jeûne — Critère du jour</div>
                    <div style={{marginBottom: 8}}>{critereActif.label}</div>
                    <div style={{fontSize: 14, color: '#555', marginBottom: 10}}>J-{jRelatif} — {selectedDate}</div>
                    {prepValid ? (
                      <div style={{color:'#43a047', fontWeight:700, margin:'8px 0'}}>✅ Critère validé pour aujourd'hui !</div>
                    ) : (
                      <button
                        style={{
                          background: '#43a047', color: '#fff', border: 'none', borderRadius: 18,
                          padding: '10px 28px', fontWeight: 700, fontSize: 17, cursor: 'pointer',
                          boxShadow: '0 2px 8px #43a04733', transition: 'background 0.2s', marginTop: 8
                        }}
                        onClick={handleValiderCriterePrep}
                      >
                        ✅ Valider le critère du jour
                      </button>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div
                style={{
                  background: "#fff",
                  borderRadius: 16,
                  boxShadow: "0 2px 8px rgba(0,0,0,0.07)",
                  padding: 20,
                  marginBottom: 24,
                  borderLeft: `6px solid ${{
                    "Petit-déjeuner": "#ffa726",
                    "Déjeuner": "#29b6f6",
                    "Collation": "#66bb6a",
                    "Dîner": "#ab47bc",
                    "Autre": "#ff7043",
                  }[selectedType]}`,
                  transition: "box-shadow 0.2s"
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
                  <span style={{ fontSize: 24 }}>{repasIcons[selectedType]}</span>
                  <span style={{ fontWeight: 600, fontSize: 18 }}>{selectedType}</span>
                </div>
                <div
                  style={{
                    background: "#f5f5f5",
                    borderRadius: 8,
                    padding: "8px 12px",
                    marginBottom: 6,
                    color: "#333",
                    fontSize: 15,
                  }}
                >
              <strong>Repas prévu :</strong>{" "}
              {repasPlan[selectedType]?.aliment ? (
                <>
                  {repasPlan[selectedType]?.aliment}{" "}
                  <span style={{
                    background: "#eee", borderRadius: 8, padding: "2px 8px", marginLeft: 4,
                    fontSize: 13, color: "#888"
                  }}>
                    {repasPlan[selectedType]?.categorie}
                  </span>
                </>
              ) : (
                <span style={{ color: "#bbb" }}>Non défini</span>
              )}
            </div>
            <RepasBloc
              repasPrevu={typeof repasPlan[selectedType]?.aliment === 'string' ? repasPlan[selectedType].aliment : ''}
              categoriePrevu={typeof repasPlan[selectedType]?.categorie === 'string' ? repasPlan[selectedType].categorie : ''}
              quantitePrevu={typeof repasPlan[selectedType]?.quantite === 'string' || typeof repasPlan[selectedType]?.quantite === 'number' ? String(repasPlan[selectedType].quantite) : ''}
              kcalPrevu={typeof repasPlan[selectedType]?.kcal === 'string' || typeof repasPlan[selectedType]?.kcal === 'number' ? String(repasPlan[selectedType].kcal) : ''}
              type={selectedType}
              date={selectedDate}
              planCategorie={repasPlan[selectedType]?.categorie}
              extrasRestants={typeof extrasRestants === 'number' && !isNaN(extrasRestants) ? extrasRestants : 0}
              onSave={handleSaveRepas}
              setSnackbar={setSnackbar}
              repasSemaine={repasSemaine}
            />
            {/* Bouton de validation de la semaine, affiché uniquement si showValidation est vrai */}
            {showValidation && (
              (selectedType === "Dîner" && new Date(selectedDate).getDay() === 0) && (
                <div style={{ textAlign: 'center', marginTop: 18 }}>
                  <button
                    style={{
                      background: '#43a047',
                      color: '#fff',
                      border: 'none',
                      borderRadius: 18,
                      padding: '10px 28px',
                      fontWeight: 700,
                      fontSize: 17,
                      cursor: 'pointer',
                      boxShadow: '0 2px 8px #43a04733',
                      transition: 'background 0.2s',
                      marginTop: 8
                    }}
                    onClick={handleValiderSemaine}
                    aria-label="Valider la semaine"
                  >
                    ✅ Valider ma semaine
                  </button>
                </div>
              )
            )}
            <div style={{ textAlign: 'center', marginTop: 16 }}>
              <button
                style={{
                  background: "#e0e0e0",
                  color: "#333",
                  border: "none",
                  borderRadius: 18,
                  padding: "8px 22px",
                  fontWeight: 600,
                  fontSize: 15,
                  marginTop: 8,
                  cursor: "pointer"
                }}
                onClick={() => setSelectedType(null)}
              >
                ⬅️ Changer de type de repas
              </button>
            </div>
          </div>
          ))}
        </>
      )}

  {/* ----------- SCORE CALORIQUE, DISCIPLINE ET RÉGULARITÉ ----------- */}
      <div style={{
        marginTop: 24,
        background: "#fafafa",
        borderRadius: 12,
        padding: "20px 16px",
        boxShadow: "0 1px 5px rgba(0,0,0,0.03)"
      }}>
        <h2 style={{ margin: "0 0 16px 0" }}>Mes scores</h2>
        <div style={{ marginBottom: 12 }}>
          <span style={{ fontWeight: 500 }}>Score de régularité de saisie : </span>
          <span style={{ fontWeight: 700, color: "#8e24aa", fontSize: 18 }}>{scoreRegularite}%</span>
          <ProgressBar value={scoreRegularite} color="#8e24aa" />
          <div style={{ fontSize: 13, color: scoreRegularite === 100 ? '#43a047' : '#888', marginTop: 4 }}>
            {scoreRegularite === 100
              ? "Bravo, tu as saisi tous tes repas principaux aujourd’hui !"
              : `Repas saisis aujourd’hui : ${nbRepasSaisis} / ${repasTypes.length}`}
          </div>
        </div>
        <div style={{ marginBottom: 12 }}>
          <span style={{ fontWeight: 500 }}>Score calorique du jour : </span>
          <span style={{ fontWeight: 700, color: "#ff9800", fontSize: 18 }}>
            {scoreCalorique}%
          </span>
          <div>
            <span style={{ fontSize: 14, color: "#888" }}>
              Objectif : {(objectifCalorique !== null && objectifCalorique !== undefined) ? `${objectifCalorique} kcal` : "…"} — Consommé : {caloriesDuJour} kcal
            </span>
          </div>
          <div>
            <span style={{ fontSize: 14, color: "#888" }}>
              Calories restantes : {(objectifCalorique !== null && objectifCalorique !== undefined && caloriesDuJour !== null)
                ? (objectifCalorique - caloriesDuJour) + " kcal"
                : "..."}
            </span>
          </div>
          <ProgressBar value={scoreCalorique} color="#ff9800" />
        </div>
        <div>
          <span style={{ fontWeight: 500 }}>Score discipline (repas alignés) : </span>
          <span style={{ fontWeight: 700, color: "#1976d2", fontSize: 18 }}>{scoreJournalier}%</span>
          <ProgressBar value={scoreJournalier} color="#1976d2" />
        </div>
        <div style={{ marginTop: 8 }}>
          <span style={{ fontWeight: 500 }}>Score hebdomadaire : </span>
          <span style={{ fontWeight: 700, color: "#43a047", fontSize: 18 }}>{scoreHebdomadaire}%</span>
          <ProgressBar value={scoreHebdomadaire} color="#43a047" />
        </div>
      </div>

      {/* ----------- AVERTISSEMENT DÉPASSEMENT CALORIQUE ----------- */}
      {showAlerteCalorique && (
        <div style={{
          marginTop: 24,
          background: "#fffbe6",
          border: "1px solid #ffe082",
          borderRadius: 12,
          padding: 20,
          color: "#b26a00",
          boxShadow: "0 1px 6px #ffd60022"
        }}>
          <b>⚠️ Attention : tu dépasses ton objectif calorique !</b>
          <div style={{marginTop:8}}>
            Si tu continues ainsi, tu risques de t’éloigner de ton objectif et de prendre du poids.<br />
            Adapte tes repas pour revenir dans ta zone d’objectif.
          </div>
        </div>
      )}

      {/* Hors quota – affichage léger */}
      {extrasHorsQuota.length > 0 && (
        <div style={{
          marginTop: 18,
          borderRadius: 8,
          padding: "8px 12px",
          background: "#fffbe6",
          border: "1px solid #ffe082",
          color: "#ffa000"
        }}>
          <div style={{ fontWeight: 600 }}>
            🟡 Extras hors quota cette semaine
          </div>
          <ul>
            {extrasHorsQuota.map((extra, i) => (
              <li key={i}>
                ↗ {extra.nom || "Extra"} —{" "}
                <span style={{ color: "#aaa" }}>{extra.date?.slice(5, 10)}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div style={{
        marginTop: 36,
        fontSize: 13,
        color: "#888",
        textAlign: "center"
      }}>
        <span>Astuce : Cliquez sur un repas pour saisir ce que vous avez mangé.<br />Les extras sont limités à un quota dynamique par semaine, utilisez-les à bon escient !</span>
      </div>

      <div style={{
        textAlign: "center",
        marginTop: 32
      }}>
        <Link href="/repas">
          <button style={{
            background: "#f44336",
            color: "#fff",
            border: "none",
            borderRadius: 8,
            padding: "10px 24px",
            fontWeight: 600,
            fontSize: 16,
            cursor: "pointer"
          }}>
            🗑️ Gérer/Supprimer mes repas
          </button>
        </Link>
        <Link href="/plan">
          <button style={{
            background: "#1976d2",
            color: "#fff",
            border: "none",
            borderRadius: 8,
            padding: "10px 24px",
            fontWeight: 600,
            fontSize: 16,
            cursor: "pointer",
            marginTop: 16
          }}>
            📅 Planifier mes repas
          </button>
        </Link>
          <Link href="/tableau-de-bord">
            <button style={{
              background: "#43a047",
              color: "#fff",
              border: "none",
              borderRadius: 8,
              padding: "10px 24px",
              fontWeight: 600,
              fontSize: 16,
              cursor: "pointer",
              marginTop: 16
            }}>
              🏠 Retour au tableau de bord
            </button>
          </Link>
      </div>
    </div>
  );
}