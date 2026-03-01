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
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useRouter } from 'next/router';
import BandeauDefiActif from '../components/BandeauDefiActif';
import ModalFeedbackValidation from '../components/ModalFeedbackValidation';
import BilanHebdoModal from '../components/BilanHebdoModal';
import PopupBilanMensuel from '../components/PopupBilanMensuel';
import BilanMensuelModal from '../components/BilanMensuelModal';
import { fetchRepasPeriode } from '../lib/repasUtils';
import BudgetExtrasCard from '../components/BudgetExtrasCard';
import { supabase } from '../lib/supabaseClient';
import { calculerProfilComplet } from '../lib/routeurPoids';
import { 
  calculerExtrasSemaine, 
  genererMessageFeedback, 
  calculerVariation,
  getMonday,
  addDays,
  formatDate,
  calculerTendance7j,
  calculerRepartitionExtrasTemporelle,
  calculerRepartitionJours,
  calculerImpactJours,
  calculerEvolutionExtras,
  analyserFragilites
} from '../lib/validationSemaine';
import { estDerniereValidationDuMois, getMoisAnneeValidation } from '../lib/detectionFinMois';
import { calculerRepartitionTypes, calculerRepartitionMoments } from '../lib/repartitionExtras';
import { calculerJoursRespectes } from '../lib/joursRespectes';
import { 
  calculerJourRelatif, 
  isPeriodeActive, 
  validerCriterePreparation,
  validerCritereAuto,
  getStatutCritereAuto,
  analyserPortions,
  detecterFeculents,
  calculerHydratation,
  verifierHeureRepas,
  calculerDureeRepas,
  getCritereIdFromLabel
} from '../lib/validerCriterePreparation';
import Link from 'next/link';
import RepasBloc from "../components/RepasBloc";
import TimelineProgression from "../components/TimelineProgression";
import SaisieDefiAlimentaire from "../components/SaisieDefiAlimentaire";
import SaisieRepriseJeune from "../components/SaisieRepriseJeune";
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
  useEffect(() => {
    if (!open) return;
    // Auto-close : 3s pour success, 5s pour warning/info, jamais pour error
    if (type !== "error") {
      const delay = type === "success" ? 3000 : 5000;
      const timer = setTimeout(onClose, delay);
      return () => clearTimeout(timer);
    }
  }, [open, type, onClose]);
  
  if (!open) return null;
  
  // Couleurs selon type
  const bgColor = type === "error" ? "#f44336" : type === "warning" ? "#ff9800" : "#4caf50";
  
  return (
    <div
      style={{
        position: "fixed",
        bottom: 32,
        left: "50%",
        transform: "translateX(-50%)",
        background: bgColor,
        color: "#fff",
        padding: "12px 32px",
        borderRadius: 32,
        boxShadow: "0 2px 16px 0 rgba(0,0,0,0.15)",
        zIndex: 1000,
        fontWeight: 500,
        fontSize: 16,
        minWidth: 180,
        textAlign: "center",
        cursor: "pointer",
      }}
      onClick={onClose}
      tabIndex={0}
      aria-live="polite"
    >
      {message}
      {type !== "error" && (
        <div style={{fontSize: 11, marginTop: 4, opacity: 0.9}}>
          (se ferme automatiquement)
        </div>
      )}
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

// ═══════════════════════════════════════════════════════════
// FONCTION POUR CALCULER L'ÉTAT DES PASTILLES DE CRITÈRES
// ═══════════════════════════════════════════════════════════
function calculerEtatPastille(criteriaId, typeRepas, champsRepasEnCours) {
  if (!champsRepasEnCours || typeof champsRepasEnCours !== 'object') return 'neutral';
  
  const { aliment = '', quantite = '', heureRepas = '', categorie = '' } = champsRepasEnCours;
  
  // Récupérer les validations basées sur les critères
  switch(criteriaId) {
    case 1: // Portions: repères visuels
      // Vérifier si quantité est renseignée
      if (quantite && String(quantite).trim().length > 0) return 'ok';
      if (aliment && String(aliment).trim().length > 0) return 'warn'; // Aliment renseigné mais pas de quantité
      return 'neutral';
    
    case 2: // Dîner: sans féculents
      if (typeRepas === 'Dîner') {
        const feculents = ['pâtes', 'riz', 'pain', 'patate', 'pomme de terre', 'féculents', 'féculent'];
        const alimentLower = String(aliment).toLowerCase();
        const hasFeculents = feculents.some(f => alimentLower.includes(f));
        
        if (aliment && !hasFeculents) return 'ok'; // Aliment non-féculents OK
        if (hasFeculents) return 'warn'; // Féculents détectés
      }
      return 'neutral';
    
    case 7: // Eau: ≥ 2L/jour
      // Impossible à tracker par repas sans données externes
      return 'neutral';
    
    case 8: // Dernier repas < 19h
      if (typeRepas === 'Dîner' && heureRepas) {
        const heure = parseInt(String(heureRepas).split(':')[0]);
        if (heure < 19) return 'ok';
        if (heure >= 19) return 'warn';
      }
      return 'neutral';
    
    case 9: // Repas ≤ 45 min
      // Impossible à tracker sans données temporelles supplémentaires
      return 'neutral';
    
    default:
      return 'neutral';
  }
}

// MAIN COMPONENT
export default function Suivi() {
    // State pour gestion d'erreur validation semaine (conforme template, point de vigilance)
    const [validationError, setValidationError] = useState('');
  // ═══════════════════════════════════════════════════════════
  // RÉCUPÉRER LES PARAMÈTRES DE FILTRAGE DEPUIS L'URL
  // ═══════════════════════════════════════════════════════════
  const router = useRouter();
  const filtreFromTo = {
    from: router.query.from || null,
    to: router.query.to || null
  };
  
  // ----------- HOOKS PRINCIPAUX (ordre strict selon la checklist) -----------
  // Initialiser selectedDate AVANT tout usage dans un useEffect ou une variable calculée
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().slice(0,10));
  // Hook pour l'affichage de l'alerte calorique (DOIT ÊTRE DÉCLARÉ AVANT SON UTILISATION dans useEffect)
  const [repasSemaine, setRepasSemaine] = useState([]);
  // Hook pour userId (nécessaire pour BudgetExtrasCard)
  const [userId, setUserId] = useState(null);
  
  // ═══════════════════════════════════════════════════════════
  // NOUVEAUX HOOKS VALIDATION SEMAINE (9 janvier 2026)
  // ═══════════════════════════════════════════════════════════
  const [feedbackData, setFeedbackData] = useState(null);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [derniereSemaineValidee, setDerniereSemaineValidee] = useState(null);
  // État pour objectif personnalisé de la semaine courante
  const [objectifSemaineCourante, setObjectifSemaineCourante] = useState('');
  // Bilan hebdo : état modal et données
  const [showBilanModal, setShowBilanModal] = useState(false);
  const [bilanData, setBilanData] = useState(null);
  // Bilan mensuel : pop-up + modal
  const [showPopupBilanMensuel, setShowPopupBilanMensuel] = useState(false);
  const [showBilanMensuelModal, setShowBilanMensuelModal] = useState(false);
  const [bilanMensuelData, setBilanMensuelData] = useState(null);
  // Hook pour tracker les champs du repas en cours (portions, féculents, hydratation, etc.)
  const [champsRepasEnCours, setChampsRepasEnCours] = useState({});
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
  // Calcul cohérent du jour relatif : J-XX = dateJeune - selectedDate (en jours)
  if (dateJeune && selectedDate) {
    jRelatif = calculerJourRelatif(dateJeune, selectedDate);
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
    if (typeof window !== 'undefined' && selectedDate && critereActif) {
      // Vérification de la période active
      if (!isPeriodeActive(Math.abs(critereActif.jour), Math.abs(jRelatif))) {
        setSnackbar({ open: true, message: "⛔ Validation impossible : la période pour ce critère n'est pas encore active ou est verrouillée. Veuillez respecter le calendrier de préparation.", type: "error" });
        return;
      }
      validerCriterePreparation(critereActif.label, new Date().toISOString());
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

  // Charger l'objectif personnalisé de la semaine courante
  useEffect(() => {
    if (typeof window !== 'undefined' && selectedDate) {
      // Utiliser les mêmes fonctions que pour la validation pour garantir la cohérence
      const monday = getMonday(selectedDate);
      const weekStart = formatDate(monday, 'yyyy-MM-dd');
      
      console.log('🎯 [SUIVI] Chargement objectif pour la semaine:', weekStart);
      console.log('🎯 [SUIVI] selectedDate:', selectedDate);
      
      // Charger l'objectif depuis localStorage
      const objectif = localStorage.getItem(`objectif_semaine_${weekStart}`);
      console.log('🎯 [SUIVI] Objectif trouvé dans localStorage:', objectif);
      
      if (objectif) {
        setObjectifSemaineCourante(objectif);
        console.log('🎯 [SUIVI] Objectif mis à jour dans l\'état');
      } else {
        setObjectifSemaineCourante('');
        console.log('🎯 [SUIVI] Aucun objectif trouvé, état vidé');
      }
    }
  }, [selectedDate]);

  // ═══════════════════════════════════════════════════════════
  // NOUVEAU : VALIDATION AUTOMATIQUE DES CRITÈRES (26/12/2025)
  // ═══════════════════════════════════════════════════════════
  const [statutsValidationAuto, setStatutsValidationAuto] = useState({});
  
  // État client-only pour éviter hydration mismatch (mini-bandeau préparation)
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // ═══════════════════════════════════════════════════════════
  // DÉTECTION PHASE REPRISE ALIMENTAIRE
  // ═══════════════════════════════════════════════════════════
  
  const [repriseActive, setRepriseActive] = useState(false);
  const [phaseReprise, setPhaseReprise] = useState(null);
  const [jourReprise, setJourReprise] = useState(null);
  const [programmeReprise, setProgrammeReprise] = useState(null);
  const [alimentsAutorises, setAlimentsAutorises] = useState([]);

  // ═══════════════════════════════════════════════════════════
  // NOUVEAU : DÉTECTION PHASE CRISTALLISATION
  // ═══════════════════════════════════════════════════════════
  
  const [cristallisationActive, setCristallisationActive] = useState(false);

  // Détecter si cristallisation active
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    // Vérifier mode TEST ou PRODUCTION
    const modeTest = localStorage.getItem('TEST_context') === 'cristallisation';
    const cleProgr = modeTest ? 'TEST_programmeCristallisation' : 'programmeCristallisation';
    const programmeStr = localStorage.getItem(cleProgr);
    
    if (programmeStr) {
      console.log('[SUIVI] Cristallisation active détectée (mode:', modeTest ? 'TEST' : 'PRODUCTION', ')');
      setCristallisationActive(true);
    } else {
      setCristallisationActive(false);
    }
  }, []);

  // Charger et détecter la reprise alimentaire active
  useEffect(() => {
    async function detecterReprise() {
      try {
        // 🧪 MODE TEST CRISTALLISATION : Si actif, désactiver reprise
        const modeTestCristallisation = localStorage.getItem('TEST_context') === 'cristallisation';
        if (modeTestCristallisation) {
          console.log('[SUIVI] Mode TEST cristallisation actif - Reprise désactivée');
          setRepriseActive(false);
          setPhaseReprise(null);
          return; // Sortir immédiatement
        }

        // 🧪 MODE TEST : Vérifier si test_modeRepriseActif est activé
        const modeTestActif = localStorage.getItem('test_modeRepriseActif') === 'true';
        console.log('[REPRISE] Mode test actif:', modeTestActif);
        
        // 1. Vérifier si programme reprise validé existe
        let prog = null;
        
        // En mode test, lire depuis test_programmeRepriseValide
        if (modeTestActif) {
          const programmeTestStr = localStorage.getItem('test_programmeRepriseValide');
          console.log('[REPRISE] Programme test trouvé:', programmeTestStr ? 'OUI' : 'NON');
          if (programmeTestStr) {
            try {
              prog = JSON.parse(programmeTestStr);
              console.log('[REPRISE] Programme test parsé:', prog);
            } catch (e) {
              console.error('[TEST MODE] Erreur parse programme test:', e);
            }
          }
        }
        
        // Essayer Supabase d'abord (uniquement si pas en mode test)
        if (!modeTestActif && supabase) {
          const { data: { user } } = await supabase.auth.getUser();
          if (user) {
            const { data, error } = await supabase
              .from('reprises_alimentaires')
              .select('*, jours:reprises_jours_valides(*)')
              .eq('user_id', user.id)
              .in('statut', ['plan_valide', 'en_cours'])
              .order('created_at', { ascending: false })
              .limit(1)
              .maybeSingle();
            
            if (!error && data) {
              prog = data;
            }
          }
        }
        
        // Fallback localStorage si pas en BDD
        if (!prog && typeof window !== 'undefined') {
          // 🧪 Utiliser la bonne clé selon le mode
          const programmeKey = modeTestActif ? 'test_programmeRepriseValide' : 'programmeRepriseValide';
          const progLocal = localStorage.getItem(programmeKey);
          if (progLocal) {
            try {
              prog = JSON.parse(progLocal);
            } catch (e) {
              console.error('[REPRISE] Erreur parse programme localStorage:', e);
            }
          }
        }

        if (!prog) {
          console.log('[REPRISE] Aucun programme trouvé, repriseActive = false');
          setRepriseActive(false);
          return;
        }

        console.log('[REPRISE] Programme trouvé:', prog);

        // 2. Calculer le jour actuel de reprise
        const debut = new Date(prog.date_debut_reprise);
        debut.setHours(0, 0, 0, 0);
        const aujourdhui = new Date(selectedDate);
        aujourdhui.setHours(0, 0, 0, 0);
        let diffJours = Math.floor((aujourdhui - debut) / (1000 * 60 * 60 * 24)) + 1;

        // 🧪 MODE TEST : Forcer au minimum Jour 1 pour permettre le test
        if (modeTestActif && diffJours < 1) {
          console.log('[REPRISE] Mode test : Forçage diffJours de', diffJours, 'à 1');
          diffJours = 1;
        }

        console.log('[REPRISE] Date début:', debut, 'Aujourd\'hui:', aujourdhui, 'Diff jours:', diffJours);

        // 3. Vérifier si on est dans la période de reprise
        if (diffJours >= 1 && diffJours <= prog.duree_reprise_jours) {
          console.log('[REPRISE] ✅ Reprise ACTIVE - Jour', diffJours, '/', prog.duree_reprise_jours);
          setRepriseActive(true);
          setJourReprise(diffJours);
          setProgrammeReprise(prog);

          // 4. Déterminer la phase et les aliments autorisés
          const jourData = prog.jours_detailles 
            ? prog.jours_detailles.find(j => j.jour_numero === diffJours)
            : prog.jours?.find(j => j.jour_numero === diffJours);

          if (jourData) {
            setPhaseReprise(jourData.phase);
            setAlimentsAutorises(jourData.aliments_autorises || []);
          }
        } else {
          setRepriseActive(false);
        }
      } catch (error) {
        console.error('[REPRISE] Erreur détection:', error);
        setRepriseActive(false);
      }
    }

    detecterReprise();
  }, [selectedDate, supabase]);
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
  const [objectifCalorique, setObjectifCalorique] = useState(1800); // Valeur par défaut, sera remplacée par routeur poids
  const [caloriesDuJour, setCaloriesDuJour] = useState(0);
  const [calculsRouteur, setCalculsRouteur] = useState(null); // BMR, TDEE, budget extras
  const [showInfo, setShowInfo] = useState(false);
  const [loading, setLoading] = useState(false);
  // Hook pour afficher/masquer l’historique des repas avec note
  const [showNotesHistory, setShowNotesHistory] = useState(false);
  // Plan de repas du jour (repas planifiés)
  const [repasPlan, setRepasPlan] = useState({});

  // Chargement profil et calcul objectif calorique personnalisé (routeur poids)
  useEffect(() => {
    async function fetchProfilEtCalculs() {
      // Récupérer userId
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
      }

      const { data: profil, error } = await supabase
        .from('profil')
        .select('sexe, age, taille, poids_de_depart, niveau_activite, objectif')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (!error && profil) {
        // Si profil complet (sexe + niveau_activite renseignés) → utiliser routeur poids
        if (profil.sexe && profil.niveau_activite) {
          const objetPoids = profil.poids_de_depart > profil.objectif ? 'perte' : 
                            (profil.poids_de_depart < profil.objectif ? 'prise' : 'maintien');
          
          const profilComplet = {
            ...profil,
            objectif: objetPoids
          };

          const calculs = calculerProfilComplet(profilComplet);
          
          if (calculs) {
            setCalculsRouteur(calculs);
            setObjectifCalorique(calculs.apport_calorique_cible); // Utiliser calcul personnalisé
            console.log('[Routeur Poids] Objectif calorique personnalisé:', calculs.apport_calorique_cible, 'kcal');
          }
        } else {
          // Profil incomplet → fallback sur valeur par défaut (1800 kcal)
          console.log('[Routeur Poids] Profil incomplet (sexe ou activité manquants), utilisation valeur par défaut');
          setObjectifCalorique(1800);
        }
      } else {
        // Aucun profil → valeur par défaut
        console.log('[Routeur Poids] Aucun profil trouvé, utilisation valeur par défaut');
        setObjectifCalorique(1800);
      }
    }

    fetchProfilEtCalculs();
  }, []); // Exécuté une seule fois au chargement

  // Chargement automatique des repas et du plan depuis Supabase
  useEffect(() => {
    async function fetchRepasEtPlan() {
      let repasData = [];
      
      // 🆕 SI REPRISE ACTIVE : Charger depuis localStorage reprises_repas_consommes
      if (repriseActive) {
        console.log('[SCORES] Reprise active détectée, lecture depuis reprises_repas_consommes');
        const cleRepas = 'reprises_repas_consommes'; // Clé principale
        const repasRepriseStr = localStorage.getItem(cleRepas);
        if (repasRepriseStr) {
          try {
            const repasReprise = JSON.parse(repasRepriseStr);
            // Transformer format reprise → format classique pour scores
            repasData = repasReprise.map(r => ({
              date: r.date,
              type: r.moment, // moment → type
              aliment: r.aliment_nom,
              kcal: r.kcal || 0,
              est_extra: false, // Pas d'extras en reprise
              repas_planifie_respecte: r.conforme || false
            }));
            console.log('[SCORES] Repas reprise chargés:', repasData.length);
          } catch (e) {
            console.error('[SCORES] Erreur parse reprises_repas_consommes:', e);
          }
        }
      } else {
        // Mode normal : Charger depuis Supabase repas_reels
        const { data, error: repasError } = await supabase
          .from('repas_reels')
          .select('*')
          .order('date', { ascending: false });
        if (!repasError && Array.isArray(data)) {
          repasData = data;
        }
      }
      
      // Mettre à jour les états
      if (Array.isArray(repasData)) {
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
  }, [selectedDate, repriseActive]); // 🆕 Ajout repriseActive pour recharger quand statut change

  // ═══════════════════════════════════════════════════════════
  // VALIDATION AUTOMATIQUE DES CRITÈRES - Analyse post-chargement repas
  // ═══════════════════════════════════════════════════════════
  // Analyse automatique après chaque saisie de repas
  useEffect(() => {
    // Ne rien faire si pas en phase préparation
    if (!critereActif || !dateJeune) return;
    
    // Identifier le critère actuel
    const critereIdActuel = getCritereIdFromLabel(critereActif.label);
    
    // Analyser uniquement les critères auto-validables (1,2,7,8,9)
    const criteresAuto = [1, 2, 7, 8, 9];
    if (!criteresAuto.includes(critereIdActuel)) return;
    
    // Filtrer les repas des 7 derniers jours
    const repas7j = repasSemaine.filter(r => {
      const dateRepas = new Date(r.date);
      const dateCourante = new Date(selectedDate);
      const diff = Math.floor((dateCourante - dateRepas) / (1000*60*60*24));
      return diff >= 0 && diff < 7;
    });
    
    // Exécuter l'analyse automatique
    const statuts = {};
    const statutCritere = getStatutCritereAuto(critereIdActuel, repas7j);
    statuts[critereIdActuel] = statutCritere;
    
    // Valider automatiquement si critère respecté
    if (statutCritere.validé) {
      validerCritereAuto(critereIdActuel);
    }
    
    setStatutsValidationAuto(statuts);
    
  }, [repasSemaine, critereActif, dateJeune, selectedDate]);

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
          const validRaw = semainesValidees?.find(s => s.weekStart === week.weekStart)?.validee;
          const valid = validRaw === true || validRaw === 'true' || validRaw === 1;
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
  const currentPalier = 1; // Palier métier : 1 extra autorisé par semaine
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
  // FIX: Parser la date en local au lieu d'UTC pour éviter les décalages de timezone
  const [year, month, day] = selectedDate.split('-').map(Number);
  const selected = new Date(year, month - 1, day);
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
    // Log début de la fonction de validation de la semaine
    console.log('[LOG BILAN] Début handleValiderSemaine');
    try {
      // 1. Calcul strict du lundi et dimanche de la semaine à partir de la date sélectionnée
      // Utilisation de getMonday() pour garantir la cohérence ISO 8601
      const monday = getMonday(selectedDate);
      const sunday = addDays(monday, 6);
      sunday.setHours(23,59,59,999);
      const selectedWeekStart = formatDate(monday, 'yyyy-MM-dd');
      const selectedWeekEnd = formatDate(sunday, 'yyyy-MM-dd');
      // Log des bornes de la semaine et des dates prises en compte
      const joursSemaine = [];
      for (let i = 0; i < 7; i++) {
        joursSemaine.push(formatDate(addDays(monday, i), 'yyyy-MM-dd'));
      }
      const selectedDateObj = new Date(selectedDate + 'T12:00:00'); // Midi pour éviter les problèmes de fuseau horaire
      console.log(`[LOG BILAN] Date sélectionnée : ${selectedDate} (jour de la semaine : ${selectedDateObj.getDay()})`);
      console.log(`[LOG BILAN] Semaine du ${selectedWeekStart} au ${selectedWeekEnd}`);
      console.log(`[LOG BILAN] Jours pris en compte pour la semaine :`, joursSemaine);

      // 2. Récupérer tous les repas de la période (lundi-dimanche) via fonction utilitaire fiabilisée
      const repasData = await fetchRepasPeriode(selectedWeekStart, selectedWeekEnd);
      // Log du nombre de repas récupérés et aperçu des repas
      console.log(`[LOG BILAN] Nombre de repas récupérés : ${repasData.length}`);
      if (repasData.length > 0) {
        console.log('[LOG BILAN] Liste des repas (id, date, kcal) :', repasData.map(r => ({id: r.id, date: r.date, kcal: r.kcal})));
      } else {
        console.log('[LOG BILAN] Aucun repas trouvé pour cette période.');
        // ⚠️ Semaine vide : on permet la validation, le bilan affichera un message adapté
        setSnackbar({ 
          open: true, 
          message: "⚠️ Aucune donnée saisie. Le bilan sera enregistré comme 'indisponible' pour cette semaine.", 
          type: "warning" 
        });
      }
      // Log du total kcal calculé
      const totalKcalLog = repasData.reduce((sum, r) => sum + (Number(r.kcal) || 0), 0);
      console.log(`[LOG BILAN] Total kcal calculé sur la période : ${totalKcalLog}`);

      // 3. Récupérer le profil utilisateur pour le calcul du budget extras (logique BudgetExtrasCard)
      let budgetExtras = 0;
      let objectifType = 'perte';
      let profilComplet = null;
      let calculs = null;
      const { data: profil, error: profilError } = await supabase
        .from('profil')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();
      if (!profilError && profil && profil.sexe && profil.niveau_activite) {
        if (profil.poids_de_depart && profil.objectif) {
          if (profil.poids_de_depart > profil.objectif) {
            objectifType = 'perte';
          } else if (profil.poids_de_depart < profil.objectif) {
            objectifType = 'prise';
          } else {
            objectifType = 'maintien';
          }
        }
        profilComplet = {
          sexe: profil.sexe,
          age: profil.age,
          taille: profil.taille,
          poids_de_depart: profil.poids_de_depart,
          niveau_activite: profil.niveau_activite,
          objectif: objectifType
        };
        calculs = calculerProfilComplet(profilComplet);
        if (calculs && typeof calculs.budgetExtras === 'number' && !isNaN(calculs.budgetExtras)) {
          budgetExtras = calculs.budgetExtras;
        }
      }

      // Calcul des extras juste avant la sauvegarde
      const extrasInfo = calculerExtrasSemaine(selectedWeekStart, repasData);
      // Génération du message feedback réel (ou valeur neutre si non utilisé)
      const messageFeedback = genererMessageFeedback ? genererMessageFeedback(extrasInfo.count, 1) : '';
      
      // Calcul de la variation (extras semaine N vs N-1)
      // Récupérer la semaine précédente validée pour calculer la variation
      const { data: semainesPrecedentes } = await supabase
        .from('semaines_validees')
        .select('weekStart, extras_count')
        .lt('weekStart', selectedWeekStart)
        .order('weekStart', { ascending: false })
        .limit(1);
      const extrasN1 = semainesPrecedentes && semainesPrecedentes.length > 0 ? semainesPrecedentes[0].extras_count : null;
      const variation = (extrasN1 !== null && typeof extrasN1 === 'number') ? extrasInfo.count - extrasN1 : 0;
      
      // Calcul des données Section 1 du bilan (apports totaux, objectif, etc.)
      const apportsTotaux = repasData.reduce((sum, r) => sum + (Number(r.kcal) || 0), 0);
      const objectifJour = calculs?.apport_calorique_cible || 1730; // Objectif calorique journalier (apport cible, pas TDEE !)
      
      // ⚠️ CORRECTION STATS : Compter uniquement jours avec données réelles
      // Grouper repas par jour pour identifier jours avec saisie
      const joursAvecDonnees = new Set();
      repasData.forEach(r => {
        if (r.date && r.kcal > 0) {
          joursAvecDonnees.add(r.date);
        }
      });
      const nbJoursSaisis = joursAvecDonnees.size;
      
      // Objectif ajusté selon jours réels (évite fausser stats si semaine incomplète)
      const objectifHebdo = nbJoursSaisis > 0 ? objectifJour * nbJoursSaisis : objectifJour * 7;
      
      console.log('[LOG BILAN] Ajustement objectif:', {
        joursAvecDonnees: nbJoursSaisis,
        objectifJour,
        objectifHebdo,
        apportsTotaux
      });
      
      const kcalExtras = repasData.filter(r => r.est_extra).reduce((sum, r) => sum + (Number(r.kcal) || 0), 0);
      
      // Calcul tendance 7j et projection poids
      const tendance = calculerTendance7j(apportsTotaux, objectifHebdo);
      
      // ═══════════════════════════════════════════════════════════
      // SECTION 7 - Calcul satiété, humeur et note utilisateur
      // ═══════════════════════════════════════════════════════════
      
      // Mapping satiété texte → score numérique (1-5)
      const mapSatieteScore = (satieteTexte) => {
        if (!satieteTexte) return null;
        const map = {
          'oui': 5,                // Respecté satiété = excellent
          'non': 2,                // Dépassé = faible
          'pas de faim': 3         // Mangé sans faim = moyen
        };
        return map[satieteTexte] || null;
      };
      
      // Mapping ressenti → score émotionnel (1-5)
      const mapRessentiScore = (ressentiTexte) => {
        if (!ressentiTexte) return null;
        const map = {
          'léger': 5,              // Excellent
          'satisfait': 5,          // Excellent
          "j'assume": 4,           // Bon
          'neutre': 3,             // Moyen
          'lourd': 2,              // Faible
          'ballonné': 1,           // Très faible
          'je regrette': 1,        // Très faible
          'je culpabilise': 1      // Très faible
        };
        return map[ressentiTexte] || null;
      };
      
      // Calcul satiété moyenne (converti en score 1-5)
      const repasAvecSatiete = repasData.filter(r => r.satiete);
      console.log('[DEBUG] Repas avec satiété:', repasAvecSatiete.length, '/', repasData.length);
      console.log('[DEBUG] Exemple repas:', repasData.slice(0, 2).map(r => ({ date: r.date, satiete: r.satiete, ressenti: r.ressenti })));
      const satieteMoyenne = repasAvecSatiete.length > 0
        ? (repasAvecSatiete.reduce((sum, r) => sum + mapSatieteScore(r.satiete), 0) / repasAvecSatiete.length).toFixed(1)
        : null;
      
      // Calcul ressenti dominant (mode statistique) - utilise "ressenti" pas "humeur_associee"
      const repasAvecRessenti = repasData.filter(r => r.ressenti);
      console.log('[DEBUG] Repas avec ressenti:', repasAvecRessenti.length, '/', repasData.length);
      const ressentiCounts = {};
      repasAvecRessenti.forEach(r => {
        ressentiCounts[r.ressenti] = (ressentiCounts[r.ressenti] || 0) + 1;
      });
      const ressentiDominant = Object.keys(ressentiCounts).length > 0
        ? Object.entries(ressentiCounts).sort((a, b) => b[1] - a[1])[0][0]
        : null;
      
      // Mapping ressenti → humeur lisible
      const mapRessentiHumeur = (ressenti) => {
        if (!ressenti) return 'Non renseigné';
        const map = {
          'léger': '🌱 Léger et bien',
          'satisfait': '😊 Satisfait',
          "j'assume": "💪 J'assume",
          'neutre': '😐 Neutre',
          'lourd': '😑 Lourd',
          'ballonné': '🤢 Ballonné',
          'je regrette': '😔 Je regrette',
          'je culpabilise': '😟 Je culpabilise'
        };
        return map[ressenti] || ressenti;
      };
      
      const humeurDominante = mapRessentiHumeur(ressentiDominant);
      
      // Note utilisateur (chercher dans commentaire ou note)
      const repasAvecNote = repasData.find(r => (r.commentaire && r.commentaire.trim() !== '') || (r.note && r.note.trim() !== ''));
      const noteUtilisateur = repasAvecNote?.commentaire || repasAvecNote?.note || null;
      
      console.log('[LOG BILAN] Section 7 - Données calculées:');
      console.log('  Satiété moyenne:', satieteMoyenne, '(sur', repasAvecSatiete.length, 'repas)');
      console.log('  Ressenti dominant:', ressentiDominant, '→', humeurDominante, '(sur', repasAvecRessenti.length, 'repas)');
      console.log('  Note utilisateur:', noteUtilisateur ? noteUtilisateur.substring(0, 50) + '...' : 'Aucune');
      
      // Calcul répartition temporelle extras (basé sur type de repas)
      const extrasAvecType = repasData.filter(r => r.est_extra && r.type);
      const repartitionTemporelle = calculerRepartitionExtrasTemporelle(extrasAvecType);
      console.log('[LOG BILAN] Répartition extras temporelle:', repartitionTemporelle, '(sur', extrasAvecType.length, 'extras avec type)');
      
      // Contexte pour affichage
      const nbRepasSatiete = repasAvecSatiete.length;
      const nbRepasRessenti = repasAvecRessenti.length;
      
      // ═══════════════════════════════════════════════════════════
      // PHASE 2 - CALCULS LECTURES A, B, C + ENRICHISSEMENTS
      // ═══════════════════════════════════════════════════════════
      
      // 📊 LECTURE A : Répartition des jours + Streaks
      console.log('[BILAN ABC] Calcul Lecture A - Répartition jours...');
      const lectureA = calculerRepartitionJours(repasData, selectedWeekStart, objectifHebdo);
      console.log('[BILAN ABC] Lecture A résultat:', {
        objectifJournalier: lectureA.objectifJournalier,
        joursCategories: lectureA.joursCategories,
        joursIncomplets: lectureA.joursIncomplets,
        longestStreak: lectureA.longestStreak,
        streaks: lectureA.streaks
      });
      
      // 🎯 LECTURE B : Impact des jours sur le surplus
      console.log('[BILAN ABC] Calcul Lecture B - Impact jours...');
      const lectureB = calculerImpactJours(lectureA.detailsJours);
      console.log('[BILAN ABC] Lecture B résultat:', lectureB ? {
        surplusTotal: lectureB.surplusTotal,
        jourPlusLourd: lectureB.jourPlusLourd,
        repartition: lectureB.repartition
      } : 'null (pas de surplus - tous les jours conformes)');
      
      // 📈 LECTURE C : Évolution extras N vs N-1
      console.log('[BILAN ABC] Calcul Lecture C - Évolution extras N vs N-1...');
      // Compléter fetch N-1 pour récupérer extras_details
      let extrasKcalN1 = null;
      let extrasNbN1 = null;
      if (semainesPrecedentes && semainesPrecedentes.length > 0) {
        const weekStartN1 = semainesPrecedentes[0].weekStart;
        const { data: semaineN1Complete } = await supabase
          .from('semaines_validees')
          .select('extras_details')
          .eq('weekStart', weekStartN1)
          .single();
        
        if (semaineN1Complete && semaineN1Complete.extras_details) {
          try {
            const detailsN1 = JSON.parse(semaineN1Complete.extras_details);
            extrasKcalN1 = detailsN1.reduce((sum, extra) => sum + (Number(extra.kcal) || 0), 0);
            extrasNbN1 = detailsN1.length;
            console.log('[BILAN ABC] Semaine N-1 détectée:', { weekStartN1, extrasKcalN1, extrasNbN1 });
          } catch (parseError) {
            console.warn('[BILAN ABC] Erreur parsing extras_details N-1:', parseError);
          }
        }
      } else {
        console.log('[BILAN ABC] Aucune semaine N-1 validée trouvée');
      }
      
      const extrasKcalN = extrasInfo.details.reduce((sum, extra) => sum + (Number(extra.kcal) || 0), 0);
      const extrasNbN = extrasInfo.count;
      
      const lectureC = calculerEvolutionExtras(extrasKcalN, extrasNbN, extrasKcalN1, extrasNbN1);
      console.log('[BILAN ABC] Lecture C résultat:', lectureC);
      
      // 🔍 ENRICHISSEMENT : Analyse des fragilités
      console.log('[BILAN ABC] Calcul Fragilités...');
      const fragilites = analyserFragilites(lectureA.detailsJours, repasData);
      console.log('[BILAN ABC] Fragilités résultat:', fragilites);
      
      // ═══════════════════════════════════════════════════════════
      
      // Charger objectif personnalisé de cette semaine depuis localStorage
      const objectifPerso = localStorage.getItem(`objectif_semaine_${selectedWeekStart}`);
      console.log('[LOG BILAN] Objectif personnalisé pour cette semaine:', objectifPerso);
      
      let insertOk = false;
      const bilanToInsert = {
        weekStart: selectedWeekStart,
        // weekEnd supprimé : la colonne n'existe pas dans la table (on calcule weekEnd = weekStart + 6 jours si besoin)
        validee: true,
        date_validation: new Date().toISOString(),
        extras_count: extrasInfo.count,
        extras_details: JSON.stringify(extrasInfo.details),
        message_feedback: messageFeedback,
        variation,
        // Nouvelles colonnes Section 2
        tendance_7j: tendance.type,
        ecart_hebdo: tendance.ecart,
        apports_totaux: Math.round(apportsTotaux),
        objectif_hebdo: objectifHebdo,
        projection_poids: tendance.projection_poids,
        nb_jours_saisis: nbJoursSaisis,
        // Données extras
        kcal_extras: Math.round(kcalExtras),
        budget_extras: Math.round(budgetExtras),
        // Données ressenti (Section 7)
        satiete_moyenne: satieteMoyenne ? parseFloat(satieteMoyenne) : null,
        humeur_dominante: humeurDominante || null,
        note_utilisateur: noteUtilisateur || null,
        nb_repas_satiete: nbRepasSatiete || 0,
        nb_repas_ressenti: nbRepasRessenti || 0,
        // Objectif personnalisé utilisateur pour cette semaine
        objectif_perso: objectifPerso || null,
        // PHASE 2 - Données ABC (Lectures A, B, C + Fragilités)
        bilan_abc: {
          lectureA: lectureA || null,
          lectureB: lectureB || null,
          lectureC: lectureC || null,
          fragilites: fragilites || null
        }
      };
      
      // LOG DEBUG : Vérifier chaque valeur
      console.log('[LOG BILAN] 🔍 VALEURS DÉTAILLÉES :');
      console.log('  weekStart:', selectedWeekStart, typeof selectedWeekStart);
      console.log('  tendance.type:', tendance.type, typeof tendance.type);
      console.log('  tendance.ecart:', tendance.ecart, typeof tendance.ecart);
      console.log('  apportsTotaux:', apportsTotaux, typeof apportsTotaux);
      console.log('  objectifHebdo:', objectifHebdo, typeof objectifHebdo);
      console.log('  tendance.projection_poids:', tendance.projection_poids, typeof tendance.projection_poids);
      console.log('[LOG BILAN] Objet complet à insérer :', JSON.stringify(bilanToInsert, null, 2));
      
      try {
        const { data: insertResult, error: insertError } = await supabase
          .from('semaines_validees')
          .upsert([bilanToInsert], {
            onConflict: 'weekStart', // Utilise weekStart comme clé unique pour gérer les doublons
            ignoreDuplicates: false   // Met à jour si existe déjà
          });
        if (insertError) {
          console.error('[LOG BILAN] Erreur lors de l’enregistrement du bilan dans Supabase :', insertError);
        } else {
          console.log('[LOG BILAN] Bilan enregistré avec succès dans Supabase :', insertResult);
          insertOk = true;
        }
      } catch (err) {
        console.error('[LOG BILAN] Exception JS lors de l’insert bilan Supabase :', err);
      }
      if (insertOk) {
        // Ouverture de la modale BilanHebdoModal (Section 1 complète)
        console.log('[DEBUG setBilanData] nbRepasSatiete:', nbRepasSatiete, 'nbRepasRessenti:', nbRepasRessenti);
        setBilanData({
          weekStart: selectedWeekStart,
          apportsTotaux,
          objectifHebdo,
          kcalExtras,
          extras: extrasInfo.count,
          budgetExtras,
          variation,
          nbJoursSaisis,
          // Section 7 - Données ressenti
          satieteMoyenne,
          humeurDominante,
          noteUtilisateur,
          nbRepasSatiete,
          nbRepasRessenti,
          extrasHorsRepas: repartitionTemporelle,
          // PHASE 2 - Lectures A, B, C + Enrichissements (depuis bilan_abc)
          bilan_abc: {
            lectureA: lectureA || null,
            lectureB: lectureB || null,
            lectureC: lectureC || null,
            fragilites: fragilites || null
          }
        });
        setShowBilanModal(true);
        
        // ═══════════════════════════════════════════════════════════
        // DÉTECTION FIN DE MOIS - DÉCLENCHEMENT BILAN MENSUEL
        // ═══════════════════════════════════════════════════════════
        console.log('[BILAN MENSUEL] Vérification si dernière validation du mois...');
        const estDerniere = estDerniereValidationDuMois(selectedWeekStart);
        console.log('[BILAN MENSUEL] Résultat détection:', estDerniere);
        
        if (estDerniere) {
          const periode = getMoisAnneeValidation(selectedWeekStart);
          console.log('[BILAN MENSUEL] 🎉 Dernière validation du mois détectée !', periode);
          
          // Afficher pop-up notification
          setBilanMensuelData({ mois: periode.mois, annee: periode.annee });
          setShowPopupBilanMensuel(true);
        }
      } else {
        setSnackbar({ open: true, message: "Erreur lors de la validation de la semaine.", type: "error" });
      }
      try {
        const historyTimeline = getWeeklyExtrasHistory(repasData, selectedDate, 16);
        const { data: semainesValideesRefresh } = await supabase
          .from('semaines_validees')
          .select('weekStart, validee');
        const historyWithValidation = historyTimeline.map(week => {
          const valid = semainesValideesRefresh?.find(s => s.weekStart === week.weekStart)?.validee === true;
          return { ...week, validee: valid };
        });
        setWeeklyHistory(historyWithValidation);
      } catch (e) {
        console.error('[LOG BILAN] Erreur lors du rechargement de la timeline :', e);
      }
    } catch (e) {
      // Log d'erreur si une exception est levée
      console.error('[LOG BILAN] Erreur JS validation semaine:', e);
      setValidationError(e.message || "Erreur lors de la validation.");
      setSnackbar({ open: true, message: e.message || "Erreur lors de la validation.", type: "error" });
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

      {/* Bandeau défi actif statique pour test visuel */}
      <BandeauDefiActif
        defi={{ nom: "Défi test", duree: 5 }}
        progression={4}
        onOpenJournal={() => {}}
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
      
      {/* Bandeau objectif personnel de la semaine */}
      {objectifSemaineCourante && (
        <div style={{
          maxWidth: 650,
          margin: '0 auto 1.5rem',
          padding: '1rem 1.3rem',
          background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
          border: '2px solid #fbbf24',
          borderRadius: 10,
          boxShadow: '0 2px 8px rgba(251, 191, 36, 0.2)'
        }}>
          <div style={{display: 'flex', alignItems: 'center', gap: '0.8rem'}}>
            <div style={{fontSize: '1.5rem'}}>🎯</div>
            <div style={{flex: 1}}>
              <div style={{fontWeight: 700, color: '#92400e', marginBottom: '0.3rem', fontSize: '0.95rem'}}>
                Mon objectif pour cette semaine
              </div>
              <div style={{color: '#78716c', fontSize: '0.95rem', lineHeight: 1.5, fontStyle: 'italic'}}>
                {objectifSemaineCourante}
              </div>
            </div>
          </div>
        </div>
      )}
      
      <div style={{textAlign:'center', marginBottom:'1.5rem'}}>
        <button onClick={handleRefresh} style={{
          background:'#1976d2', color:'#fff', border:'none', borderRadius:8, padding:'8px 22px', fontWeight:600, fontSize:16, cursor:'pointer'
        }}>🔄 Rafraîchir les statistiques</button>
        
        {/* ═══════════════════════════════════════════════════════════
            BADGE "VOIR FEEDBACK DÉTAILLÉ" (9 janvier 2026)
            Visible uniquement si semaine précédente validée ET pas dimanche
            ═══════════════════════════════════════════════════════════ */}
        {derniereSemaineValidee && new Date(selectedDate).getDay() !== 0 && (
          <button 
            onClick={() => {
              setFeedbackData(derniereSemaineValidee);
              setShowFeedbackModal(true);
            }}
            style={{
              background: 'linear-gradient(135deg, #10b981 0%, #34d399 100%)',
              color: '#fff',
              border: 'none',
              borderRadius: 8,
              padding: '8px 22px',
              fontWeight: 600,
              fontSize: 15,
              cursor: 'pointer',
              marginLeft: 12,
              boxShadow: '0 2px 8px rgba(16,185,129,0.3)'
            }}
          >
            ✅ Voir feedback semaine validée
          </button>
        )}
      </div>

      {/* Mini-bandeau Préparation en cours (synthétique avec coloration contextuelle) */}
      {isMounted && (localStorage.getItem('preparationActive') === 'true') && (
        (() => {
          // Lire date jeûne depuis preparationData (source unique de vérité)
          let dateJ0 = null;
          try {
            const prepDataStr = localStorage.getItem('preparationData');
            if (prepDataStr) {
              const prepData = JSON.parse(prepDataStr);
              dateJ0 = prepData.startDate ? new Date(prepData.startDate) : null;
            }
          } catch(e) { console.warn('[Mini-bandeau] Lecture preparationData échouée:', e); }
          
          // Calculer phase active (J-30 à J-18 = Phase 1, J-17 à J-8 = Phase 2, J-7 à J-0 = Phase 3)
          let phaseActive = null;
          let nomPhase = 'Préparation du jeûne';
          if (dateJ0) {
            const today = new Date();
            today.setHours(0,0,0,0);
            const jCourant = -Math.floor((dateJ0 - today) / (1000*60*60*24));
            if (jCourant >= -30 && jCourant <= -18) { phaseActive = 1; nomPhase = 'Phase 1 : Allègement'; }
            else if (jCourant >= -17 && jCourant <= -8) { phaseActive = 2; nomPhase = 'Phase 2 : Végétalisation'; }
            else if (jCourant >= -7 && jCourant <= 0) { phaseActive = 3; nomPhase = 'Phase 3 : Pré-jeûne'; }
          }
          
          // Déterminer la période affichée (par défaut: phase active ou J-7 -> J-1)
          const periodeStart = filtreFromTo?.from ? new Date(filtreFromTo.from) : (dateJ0 ? new Date(dateJ0.getTime() - 7*24*60*60*1000) : null);
          const periodeEnd = filtreFromTo?.to ? new Date(filtreFromTo.to) : (dateJ0 ? new Date(dateJ0.getTime() - 1*24*60*60*1000) : null);
          function fmt(d){ return d ? d.toLocaleDateString('fr-FR',{ weekday:'long', day:'2-digit', month:'2-digit', year:'2-digit' }) : 'n/a'; }
          const type = selectedType; // Type de repas en cours
          // Pastilles contextuelles avec état calculé en temps réel
          const pastilles = [
            { id:1, label:'1. Portions: repères visuels', visible:true, state:calculerEtatPastille(1, type, champsRepasEnCours) },
            { id:2, label:'2. Dîner: sans féculents', visible:type === 'Dîner', state:calculerEtatPastille(2, type, champsRepasEnCours) },
            { id:7, label:'7. Eau: ≥ 2L/jour', visible:true, state:calculerEtatPastille(7, type, champsRepasEnCours) },
            { id:8, label:'8. Dernier repas < 19h', visible:type === 'Dîner', state:calculerEtatPastille(8, type, champsRepasEnCours) },
            { id:9, label:'9. Repas ≤ 45 min', visible:true, state:calculerEtatPastille(9, type, champsRepasEnCours) },
          ];
          return (
            <div style={{border:'1px solid #E3EAF2', borderRadius:12, padding:'10px 12px', background:'#fff', boxShadow:'0 1px 4px rgba(0,0,0,0.04)', marginBottom:16}}>
              <div style={{fontWeight:700, color:'#0F172A', marginBottom:6}}>
                {nomPhase} • Période: {fmt(periodeStart)} → {fmt(periodeEnd)}
              </div>
              <div style={{display:'flex', gap:8, flexWrap:'wrap', alignItems:'center'}}>
                {pastilles.filter(p=>p.visible).map(p => (
                  <span key={p.id} style={{
                    background: p.state==='ok' ? '#DCFCE7' : p.state==='warn' ? '#FEF3C7' : '#F3F4F6',
                    border: '1px solid #E5E7EB', color:'#0F172A', borderRadius:999, padding:'6px 10px', fontSize:12
                  }}>{p.label}</span>
                ))}
                <a href={`/preparation-jeune#phase-active`} style={{marginLeft:'auto', background:'#4F8FFF', color:'#fff', textDecoration:'none', padding:'6px 10px', borderRadius:8, fontSize:12, fontWeight:700}}>En savoir plus</a>
                <a href={`/suivi?from=${periodeStart ? periodeStart.toISOString().slice(0,10) : ''}&to=${periodeEnd ? periodeEnd.toISOString().slice(0,10) : ''}`} style={{ background:'#10B981', color:'#fff', textDecoration:'none', padding:'6px 10px', borderRadius:8, fontSize:12, fontWeight:700}}>Voir mes repas (semaine)</a>
              </div>
            </div>
          );
        })()
      )}

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

      {/* ═══════════════════════════════════════════════════════════
          BUDGET EXTRAS HEBDOMADAIRE (PHASE 3)
          Affichage du budget calorique extras personnalisé
          ═══════════════════════════════════════════════════════════ */}
      <div style={{padding: '1rem', background: 'rgba(100,150,255,0.1)', borderRadius: 8, margin: '1rem 0', border: '2px dashed #6496ff'}}>
        <div style={{
          fontSize: '1.05rem',
          fontWeight: 700,
          color: '#fff',
          background: 'linear-gradient(90deg, #6496ff 0%, #1976d2 100%)',
          borderRadius: '8px',
          padding: '6px 0',
          marginBottom: '0.7rem',
          textAlign: 'center',
          letterSpacing: '0.5px',
          boxShadow: '0 1px 4px rgba(100,150,255,0.10)'
        }}>
          📅 Semaine du {(() => {
            const selectedDateObj = new Date(selectedDate);
            const day = selectedDateObj.getDay();
            const monday = new Date(selectedDateObj);
            monday.setDate(selectedDateObj.getDate() - (day === 0 ? 6 : day - 1));
            const sunday = new Date(monday);
            sunday.setDate(monday.getDate() + 6);
            function fmt(d) {
              return d.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });
            }
            return `${fmt(monday)} au ${fmt(sunday)}`;
          })()}
        </div>
        <div style={{fontSize: '0.9rem', marginBottom: '0.5rem'}}>
          🔍 <strong>DEBUG Budget Extras Card:</strong>
        </div>
        <div style={{fontSize: '0.85rem', fontFamily: 'monospace'}}>
          • userId from Supabase: <strong>{userId || 'NULL (pas connecté)'}</strong><br/>
          • Mode: <strong>{userId ? 'Authentifié' : 'localStorage (sans authentification)'}</strong><br/>
          • Composant: <strong>{userId ? '✅ Mode authentifié' : '⚠️ Mode TEST (localStorage)'}</strong><br/>
          <span style={{color:'#1976d2',fontWeight:600}}>
            {calculsRouteur && calculsRouteur.budget_extras_kcal
              ? `Budget extras personnalisé : ${calculsRouteur.budget_extras_kcal} kcal/semaine`
              : 'Budget extras non disponible'}
          </span>
        </div>
      </div>
      {/* Afficher en mode localStorage (userId=null) ou authentifié */}
      <BudgetExtrasCard userId={userId} selectedDate={selectedDate} />

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
          {/* Affichage séparé : Reprise OU Défi */}
          {repriseActive ? (
            <SaisieRepriseJeune 
              phaseReprise={phaseReprise}
              jourReprise={jourReprise}
              programmeReprise={programmeReprise}
            />
          ) : defiAlimentaireActif ? (
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
                    <div style={{fontSize: 14, color: '#555', marginBottom: 10}}>J{jRelatif} — {selectedDate}</div>
                    
                    {/* ═══ NOUVEAU : Affichage validation auto si critère concerné ═══ */}
                    {(() => {
                      const critereId = getCritereIdFromLabel(critereActif.label);
                      const statutAuto = statutsValidationAuto[critereId];
                      const isAutoValidable = [1, 2, 7, 8, 9].includes(critereId);
                      
                      if (isAutoValidable && statutAuto) {
                        return statutAuto.validé ? (
                          <>
                            <div style={{color:'#43a047', fontWeight:700, margin:'8px 0'}}>
                              ✅ Critère validé automatiquement !
                            </div>
                            <div style={{fontSize: 14, color: '#555'}}>
                              📊 {statutAuto.joursRespectés}/7 jours respectés
                            </div>
                            <div style={{fontSize: 13, color: '#888', marginTop: 6}}>
                              (Détection automatique basée sur vos saisies)
                            </div>
                          </>
                        ) : (
                          <>
                            <div style={{fontSize: 14, color: '#555', margin:'8px 0'}}>
                              ⏳ Suivi automatique en cours
                            </div>
                            <div style={{fontSize: 15, fontWeight: 600}}>
                              📊 {statutAuto.joursRespectés}/7 jours respectés
                            </div>
                            <div style={{fontSize: 13, color: '#888', marginTop: 6}}>
                              Encore {(critereId === 1 ? 6 : 5) - statutAuto.joursRespectés} jour(s) pour valider
                            </div>
                          </>
                        );
                      }
                      
                      // Critères non auto-validables (3, 4, 5, 6) : validation manuelle
                      return prepValid ? (
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
                      );
                    })()}
                  </div>
                )}

                {/* ═══════════════════════════════════════════════════════════
                    BANNIÈRE REPRISE ALIMENTAIRE (si active)
                    ═══════════════════════════════════════════════════════════ */}
                {repriseActive && (
                  <div style={{
                    margin: '32px auto 0',
                    maxWidth: 520,
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    border: '2px solid #667eea',
                    borderRadius: 12,
                    padding: '20px 24px',
                    color: 'white',
                    boxShadow: '0 4px 16px rgba(102,126,234,0.25)',
                    textAlign: 'center'
                  }}>
                    <div style={{fontSize: 20, fontWeight: 800, marginBottom: 8, letterSpacing: 0.5}}>
                      🌱 Reprise alimentaire après jeûne
                    </div>
                    <div style={{fontSize: 16, fontWeight: 600, marginBottom: 8, opacity: 0.95}}>
                      Jour {jourReprise} / {programmeReprise?.duree_reprise_jours} — Phase {phaseReprise}
                    </div>
                    <div style={{
                      background: 'rgba(255,255,255,0.15)',
                      borderRadius: 8,
                      padding: '12px 16px',
                      marginBottom: 12,
                      fontSize: 15,
                      fontWeight: 600
                    }}>
                      🎯 Critère du jour : <b>Respect strict des quantités</b>
                    </div>
                    <div style={{fontSize: 14, opacity: 0.9, marginBottom: 4, fontWeight: 500}}>
                      📍 Aliments autorisés aujourd'hui :
                    </div>
                    <div style={{
                      background: 'rgba(255,255,255,0.1)',
                      borderRadius: 8,
                      padding: '10px 14px',
                      fontSize: 13,
                      fontWeight: 500,
                      lineHeight: 1.5,
                      maxHeight: 60,
                      overflow: 'auto'
                    }}>
                      {alimentsAutorises.slice(0, 8).map(a => a.nom).join(', ')}
                      {alimentsAutorises.length > 8 && ` et ${alimentsAutorises.length - 8} autres`}
                    </div>
                    <div style={{
                      marginTop: 14,
                      fontSize: 13,
                      opacity: 0.85,
                      fontStyle: 'italic'
                    }}>
                      💡 Vérifie que chaque aliment saisi est autorisé et que les quantités sont respectées
                    </div>
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
              onChangeChampsRepas={isMounted && (localStorage.getItem('preparationActive') === 'true') ? setChampsRepasEnCours : undefined}
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
                  
                  {/* 🧪 BOUTON TEST DÉTECTION FIN DE MOIS (mode dev) */}
                  {process.env.NODE_ENV === 'development' && (
                    <button
                      style={{
                        background: '#ff9800',
                        color: '#fff',
                        border: '2px dashed #f57c00',
                        borderRadius: 18,
                        padding: '8px 20px',
                        fontWeight: 600,
                        fontSize: 14,
                        cursor: 'pointer',
                        marginTop: 12,
                        display: 'block',
                        width: '100%'
                      }}
                      onClick={() => {
                        console.log('🧪 TEST DÉTECTION FIN DE MOIS');
                        console.log('Date sélectionnée:', selectedDate);
                        const estDerniere = estDerniereValidationDuMois(selectedDate);
                        console.log('Résultat détection:', estDerniere);
                        if (estDerniere) {
                          const periode = getMoisAnneeValidation(selectedDate);
                          console.log('Période détectée:', periode);
                          alert(`✅ DERNIÈRE VALIDATION DU MOIS\nMois: ${periode.mois}\nAnnée: ${periode.annee}`);
                        } else {
                          alert('❌ PAS la dernière validation du mois');
                        }
                      }}
                    >
                      🧪 Tester détection fin de mois
                    </button>
                  )}
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
        <Link href="/historique-extras">
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
            📊 Historique des bilans hebdo
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

        {/* NOUVEAU : BOUTON CRISTALLISATION (visible uniquement si phase active) */}
        {cristallisationActive && (
          <Link href="/cristallisation-quotidien">
            <button style={{
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              color: "#fff",
              border: "none",
              borderRadius: 8,
              padding: "10px 24px",
              fontWeight: 600,
              fontSize: 16,
              cursor: "pointer",
              marginTop: 16,
              boxShadow: "0 4px 12px rgba(102,126,234,0.3)"
            }}>
              🏔️ Suivi Cristallisation
            </button>
          </Link>
        )}
      </div>

      {/* ═══════════════════════════════════════════════════════════
          MODAL FEEDBACK VALIDATION (9 janvier 2026)
          Affiche feedback détaillé après validation de semaine
          ═══════════════════════════════════════════════════════════ */}
      <ModalFeedbackValidation
        isOpen={showFeedbackModal}
        onClose={() => setShowFeedbackModal(false)}
        weekStart={feedbackData?.weekStart}
        extrasCount={feedbackData?.extrasCount}
        extrasDetails={feedbackData?.extrasDetails}
        message={feedbackData?.message}
        variation={feedbackData?.variation}
        dateValidation={feedbackData?.dateValidation}
        quota={2}
      />
      
      {/* ═══════════════════════════════════════════════════════════
          POP-UP BILAN MENSUEL (22 janvier 2026)
          Notifie utilisateur qu'un bilan mensuel est disponible
          ═══════════════════════════════════════════════════════════ */}
      <PopupBilanMensuel
        isOpen={showPopupBilanMensuel}
        mois={bilanMensuelData?.mois}
        annee={bilanMensuelData?.annee}
        onClose={() => setShowPopupBilanMensuel(false)}
        onVoirBilan={() => {
          setShowPopupBilanMensuel(false);
          setShowBilanMensuelModal(true);
          console.log('[BILAN MENSUEL] Ouverture modale bilan mensuel');
        }}
      />
      
      {/* ═══════════════════════════════════════════════════════════
          MODALE BILAN MENSUEL
          Affiche le bilan mensuel détaillé avec 6 sections
          ═══════════════════════════════════════════════════════════ */}
      <BilanMensuelModal
        isOpen={showBilanMensuelModal}
        mois={bilanMensuelData?.mois}
        annee={bilanMensuelData?.annee}
        onClose={() => setShowBilanMensuelModal(false)}
      />
      
      {/* MODALE BILAN HEBDO ALIMENTAIRE */}
      <BilanHebdoModal
        open={showBilanModal}
        onClose={() => setShowBilanModal(false)}
        bilan={bilanData}
        selectedDate={selectedDate} // On transmet explicitement la date sélectionnée
        modeValidation={true} // Mode validation dimanche : afficher VERT + JAUNE
        onLearnMore={() => {
          setShowBilanModal(false);
          // TODO: ouvrir la section "en savoir plus" ou naviguer vers l’historique détaillé
        }}
      />
    </div>
  );
}