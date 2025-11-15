import { useState, useEffect } from "react";
import { supabase } from "../lib/supabaseClient";
import { genererProgrammeReprise } from "../lib/genererProgrammeReprise";
import { genererEtSauvegarderProgramme } from "../lib/jeuneUtils";

// --- Données statiques pour chaque jour de jeûne (exemple jusqu'à 10 jours, à compléter si besoin) ---
const JEUNE_DAYS_CONTENT = {
  1: {
    titre: "Jour 1 – Lancement du jeûne",
    corps: [
      "🧠 Esprit : Tu entres dans la phase de rupture. Les premières heures sont surtout mentales. Ton corps commence à utiliser ses réserves de glucose.",
      "🧬 Corps : La glycémie baisse doucement. Tu peux ressentir une légère faim ou des pensées alimentaires récurrentes.",
      "❤️ Synthèse émotionnelle : C’est le début d’un reset. Observe tes sensations sans jugement.",
      "📿 Ancrage spirituel : Prends un temps pour poser ton intention.",
      "🧰 Outil du jour : Respiration profonde, hydratation, marche douce.",
      "💡 Conseil : Prépare-toi à accueillir les premiers signaux de faim sans y répondre tout de suite."
    ],
    message: "Le plus dur, c’est de commencer. Tu viens de franchir la première porte. Tiens bon, tu es sur ton chemin."
  },
  2: {
    titre: "Jour 2 – Bascule métabolique",
    corps: [
      "🧠 Esprit : Les pensées alimentaires diminuent. Tu découvres une nouvelle forme de calme.",
      "🧬 Corps : Ton foie commence à produire des corps cétoniques. Début de la cétose.",
      "❤️ Synthèse émotionnelle : Tu peux ressentir de la fierté ou des doutes. C’est normal.",
      "📿 Ancrage spirituel : Médite sur la patience.",
      "🧰 Outil du jour : Hydratation ++, sieste courte, lecture inspirante.",
      "💡 Conseil : Écoute ton corps, repose-toi si besoin."
    ],
    message: "Tu es en pleine régénération cellulaire. Ton organisme apprend à fonctionner autrement."
  },
  3: {
    titre: "Jour 3 – Corps & Esprit en bascule profonde",
    corps: [
      "🧠 Esprit : Clarté mentale, pensées plus fluides.",
      "🧬 Corps : Cétose activée, autophagie en marche.",
      "❤️ Synthèse émotionnelle : Stabilité émotionnelle, connexion intérieure.",
      "📿 Ancrage spirituel : Silence intérieur, écoute de soi.",
      "🧰 Outil du jour : Marche, écriture, gratitude.",
      "💡 Conseil : Observe les changements subtils en toi."
    ],
    message: "Ton corps ne crie pas. Il travaille. Il se libère. Il peut enfin respirer."
  },
  4: {
    titre: "Jour 4 – Brûle le gras profond",
    corps: [
      "🧠 Esprit : Fatigue possible, résistance mentale.",
      "🧬 Corps : Cétose stabilisée, autophagie active.",
      "❤️ Synthèse émotionnelle : Détachement des réflexes alimentaires.",
      "📿 Ancrage spirituel : Reconnexion à l’essentiel.",
      "🧰 Outil du jour : Respiration, visualisation, soutien.",
      "💡 Conseil : Hydrate-toi +++, repose-toi."
    ],
    message: "Tu es dans la traversée. Ce n’est pas de la privation : c’est de la reconquête."
  },
  5: {
    titre: "Jour 5 – Détox profonde",
    corps: [
      "🧠 Esprit : Sérénité, confiance.",
      "🧬 Corps : Détox cellulaire, élimination des déchets.",
      "❤️ Synthèse émotionnelle : Gratitude, recentrage.",
      "📿 Ancrage spirituel : Prière, méditation.",
      "🧰 Outil du jour : Écriture, partage, repos.",
      "💡 Conseil : Observe la légèreté qui s’installe."
    ],
    message: "Tu élimines des déchets anciens. C’est du grand ménage intérieur."
  },
  // ... Ajoute les jours suivants selon ton cahier des charges ...
};

const SUPPORT_MESSAGES = [
  "Ce n’est pas l’absence de nourriture qui est difficile, c’est la négociation intérieure. Tu tiens ton cap.",
  "Chaque heure passée est une victoire sur tes anciens schémas.",
  "Ton corps apprend à se libérer, ton esprit à s’apaiser.",
  "Tu n’es pas en restriction. Tu es en libération.",
  "Tiens-toi droite, tu nettoies ce que ton mental ne pouvait plus porter seul."
];

const OUTILS_SUGGESTIONS = [
  "Respiration profonde",
  "Lecture inspirante",
  "Prière ou méditation",
  "Marche en nature",
  "Écriture d’un journal",
  "Musique apaisante",
  "Soutien d’un proche"
];

function analyseComportementale(repasRecents = []) {
  const extras = repasRecents.reduce((acc, r) => acc + (r.est_extra ? 1 : 0), 0);
  const categories = {};
  repasRecents.forEach(r => {
    categories[r.categorie] = (categories[r.categorie] || 0) + 1;
  });
  let dominant = Object.entries(categories).sort((a, b) => b[1] - a[1])[0]?.[0] || "équilibre";
  return {
    extras,
    dominant,
    message: `Tu avais consommé ${extras} extras sur les 3 derniers jours. Catégorie dominante : ${dominant}. Ce jeûne est une vraie rupture. Tu es en train de couper une boucle.`
  };
}

function pertePoidsEstimee(poids, duree) {
  if (!poids) return "";
  const min = (duree * 0.3).toFixed(1);
  const max = (duree * 0.45).toFixed(1);
  return `Si tu restes hydraté(e) et stable, ta perte estimée est de ${min} à ${max} kg (eau + glycogène + graisses actives).`;
}

function getRepasRecents() {
  return [
    { est_extra: true, categorie: "féculent" },
    { est_extra: false, categorie: "sucre" },
    { est_extra: true, categorie: "féculent" }
  ];
}

function getPoidsDepart() {
  return 72.4;
}

function getDernierRepas() {
  return { aliment: "Pâtes", categorie: "féculent" };
}

function loadState(key, def) {
  if (typeof window === "undefined") return def;
  try {
    const val = localStorage.getItem(key);
    return val ? JSON.parse(val) : def;
  } catch {
    return def;
  }
}
function saveState(key, val) {
  if (typeof window === "undefined") return;
  localStorage.setItem(key, JSON.stringify(val));
}

export default function Jeune() {
  // === HOOKS D'ÉTAT (INITIALISATION EN PREMIER) ===
  // Initialisation avec valeurs par défaut (pas localStorage pour éviter hydration error)
  const [dureeJeune, setDureeJeune] = useState(5);
  const [jourEnCours, setJourEnCours] = useState(1);
  const [joursValides, setJoursValides] = useState([]);
  const [poidsDepart, setPoidsDepart] = useState(0);
  const [messagePerso, setMessagePerso] = useState("");
  const [showMessagePerso, setShowMessagePerso] = useState(false);
  const [outils, setOutils] = useState({});
  const [outilInput, setOutilInput] = useState("");
  const [showInfo, setShowInfo] = useState(false);
  const [dateDebutJeune, setDateDebutJeune] = useState(null);
  const [programmeReprise, setProgrammeReprise] = useState(null);
  const [alerteJ3, setAlerteJ3] = useState(null);
  const [loadingProgramme, setLoadingProgramme] = useState(false);
  const [isClient, setIsClient] = useState(false);

  // === VARIABLES CALCULÉES ===
  const repasRecents = getRepasRecents();
  const analyse = analyseComportementale(repasRecents);
  const dernierRepas = getDernierRepas();

  // === EFFETS (APRÈS HOOKS) ===
  // Charger depuis localStorage au montage client (évite hydration error)
  useEffect(() => {
    setIsClient(true);
    setDureeJeune(loadState("dureeJeune", 5));
    setJourEnCours(loadState("jourEnCours", 1));
    setJoursValides(loadState("joursValides", []));
    setPoidsDepart(loadState("poidsDepart", getPoidsDepart()));
    setMessagePerso(loadState("messagePerso", ""));
    setOutils(loadState("outilsJeune", {}));
    setDateDebutJeune(loadState("dateDebutJeune", null));
    const savedProgramme = loadState("programmeReprise", null);
    if (savedProgramme) setProgrammeReprise(savedProgramme);
  }, []);

  // Sauvegarder dans localStorage quand les valeurs changent
  useEffect(() => { if (isClient) saveState("dureeJeune", dureeJeune); }, [dureeJeune, isClient]);
  useEffect(() => { if (isClient) saveState("jourEnCours", jourEnCours); }, [jourEnCours, isClient]);
  useEffect(() => { if (isClient) saveState("joursValides", joursValides); }, [joursValides, isClient]);
  useEffect(() => { if (isClient) saveState("poidsDepart", poidsDepart); }, [poidsDepart, isClient]);
  useEffect(() => { if (isClient) saveState("messagePerso", messagePerso); }, [messagePerso, isClient]);
  useEffect(() => { if (isClient) saveState("outilsJeune", outils); }, [outils, isClient]);
  useEffect(() => { if (isClient) saveState("dateDebutJeune", dateDebutJeune); }, [dateDebutJeune, isClient]);

  // Initialiser date de début du jeûne si pas définie
  useEffect(() => {
    if (typeof window === 'undefined') return; // SSR guard
    if (!dateDebutJeune && jourEnCours === 1) {
      const aujourdhui = new Date().toISOString().split('T')[0];
      setDateDebutJeune(aujourdhui);
    }
  }, [dateDebutJeune, jourEnCours]);

  // Vérification J-3 (détection automatique)
  useEffect(() => {
    if (typeof window === 'undefined') return; // SSR guard
    if (!dateDebutJeune || !dureeJeune) return;

    const dateFin = new Date(dateDebutJeune);
    dateFin.setDate(dateFin.getDate() + dureeJeune - 1);
    const dateFinStr = dateFin.toISOString().split('T')[0];

    const aujourdhui = new Date();
    aujourdhui.setHours(0, 0, 0, 0);
    const fin = new Date(dateFinStr);
    fin.setHours(0, 0, 0, 0);
    const diffTime = fin - aujourdhui;
    const joursRestants = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    // Détection J-3, J-2, J-1
    if (joursRestants >= 0 && joursRestants <= 3 && !programmeReprise) {
      const urgence = joursRestants < 3;
      setAlerteJ3({
        joursRestants,
        urgence,
        message: urgence 
          ? `⚠️ URGENT : J-${joursRestants} ! Génère ton programme de reprise MAINTENANT.`
          : `🎯 J-${joursRestants} ! C'est le moment de préparer ta reprise alimentaire.`
      });
    } else {
      setAlerteJ3(null);
    }
  }, [dateDebutJeune, dureeJeune, jourEnCours, programmeReprise]);

  // === FONCTIONS HANDLERS (AVANT LE RENDER) ===

  const validerJour = () => {
    if (!joursValides.includes(jourEnCours)) {
      const nv = [...joursValides, jourEnCours].sort((a, b) => a - b);
      setJoursValides(nv);
      if (jourEnCours < dureeJeune) setJourEnCours(jourEnCours + 1);
    }
  };

  const ajouterOutil = () => {
    if (!outilInput.trim()) return;
    setOutils({
      ...outils,
      [jourEnCours]: [...(outils[jourEnCours] || []), outilInput.trim()]
    });
    setOutilInput("");
  };

  const genererProgrammeRepriseManuel = async () => {
    if (!dateDebutJeune || !dureeJeune) {
      alert("Données manquantes pour générer le programme");
      return;
    }

    setLoadingProgramme(true);
    try {
      const dateFin = new Date(dateDebutJeune);
      dateFin.setDate(dateFin.getDate() + dureeJeune - 1);
      const dateFinStr = dateFin.toISOString().split('T')[0];

      // Tenter de récupérer l'utilisateur, mais ne pas bloquer si absent
      let userId;
      try {
        const { data: { user } } = await supabase.auth.getUser();
        userId = user?.id;
      } catch {}

      let programmeSauvegarde;
      if (userId) {
        // Utilisateur connecté : sauvegarde Supabase
        programmeSauvegarde = await genererEtSauvegarderProgramme(userId, {
          id: null,
          duree_jours: dureeJeune,
          date_fin: dateFinStr,
          poids_depart: poidsDepart
        });
        if (!programmeSauvegarde) throw new Error("Échec de la sauvegarde du programme");
        setProgrammeReprise(programmeSauvegarde);
        saveState("programmeReprise", programmeSauvegarde);
        setAlerteJ3(null);
        alert(`✅ Programme généré et sauvegardé ! ${programmeSauvegarde.duree_reprise_jours} jours de reprise créés.`);
      } else {
        // Génération locale strictement sans userId (comme ideaux)
        const programme = genererProgrammeReprise({
          dureeJeune,
          poidsDepart,
          dateFin: dateFinStr,
          options: {
            genere_automatiquement: true,
            genere_le: new Date().toISOString()
          }
        });
        programmeSauvegarde = {
          ...programme,
          id: null,
          statut: 'proposition',
          plan_genere_le: new Date().toISOString()
        };
        setProgrammeReprise(programmeSauvegarde);
        saveState("programmeReprise", programmeSauvegarde);
        setAlerteJ3(null);
        alert(`✅ Programme généré localement ! ${programmeSauvegarde.duree_reprise_jours} jours de reprise créés. Connecte-toi pour sauvegarder définitivement.`);
      }
    } catch (error) {
      console.error("Erreur génération:", error);
      alert(`❌ Erreur : ${error.message}`);
    } finally {
      setLoadingProgramme(false);
    }
  };

  const resetJeune = () => {
    setDureeJeune(5);
    setJourEnCours(1);
    setJoursValides([]);
    setPoidsDepart(getPoidsDepart());
    setMessagePerso("");
    setOutils({});
    setDateDebutJeune(null);
    setProgrammeReprise(null);
    setAlerteJ3(null);
    localStorage.removeItem("programmeReprise");
  };

  // === VARIABLES CALCULÉES DE RENDU (APRÈS TOUS LES HOOKS) ===

  const isFini = joursValides.length >= dureeJeune;
  // Affiche la préparation à la reprise à partir de la moitié du jeûne ou du J4
  const showReprise = !isFini && (jourEnCours >= Math.max(4, Math.ceil(dureeJeune / 2)));

  const contenuJour = JEUNE_DAYS_CONTENT[jourEnCours] || {
    titre: `Jour ${jourEnCours}`,
    corps: ["Contenu à compléter pour ce jour."],
    message: SUPPORT_MESSAGES[(jourEnCours - 1) % SUPPORT_MESSAGES.length]
  };

  const perteEstimee = pertePoidsEstimee(poidsDepart, dureeJeune);

  // Guard SSR: afficher loader jusqu'au montage client (évite hydration error)
  if (!isClient) {
    return (
      <div style={{ maxWidth: 700, margin: "0 auto", padding: 24, fontFamily: "system-ui, Arial, sans-serif", textAlign: "center" }}>
        <h1 style={{ marginBottom: 12 }}>🌙 Mon jeûne en cours</h1>
        <div style={{ padding: "3rem", color: "#666" }}>
          ⏳ Chargement...
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 700, margin: "0 auto", padding: 24, fontFamily: "system-ui, Arial, sans-serif" }}>
      <h1 style={{ textAlign: "center", marginBottom: 12 }}>🌙 Mon jeûne en cours</h1>

      {/* --- Accueil du jeûne actif --- */}
      <div style={{
        background: "#e3f2fd", borderRadius: 12, padding: 18, marginBottom: 18, boxShadow: "0 1px 6px #90caf9aa"
      }}>
        <div style={{ fontSize: 20, fontWeight: 700 }}>
          📆 Jour {jourEnCours} / {dureeJeune} – {contenuJour.titre}
        </div>
        <div style={{ marginTop: 6, color: "#1976d2" }}>
          {contenuJour.message}
        </div>
        <div style={{ marginTop: 10 }}>
          ⚖️ Poids de départ : <b>{poidsDepart ? `${poidsDepart} kg` : "Non renseigné"}</b>
        </div>
        <div style={{ marginTop: 4 }}>
          🍽️ Dernier repas analysé : <b>{dernierRepas.aliment}</b> ({dernierRepas.categorie})<br />
          <span style={{ color: "#888" }}>
            {dernierRepas.categorie === "féculent"
              ? "Ton dernier repas était riche en féculents. Ton foie est en train de basculer en mode cétose."
              : "Ton dernier repas était léger. Ton corps démarre le jeûne en douceur."}
          </span>
        </div>
      </div>

      {/* --- Alerte J-3 (détection automatique) --- */}
      {alerteJ3 && (
        <div style={{
          background: alerteJ3.urgence ? "#ffebee" : "#fff3e0",
          border: alerteJ3.urgence ? "2px solid #f44336" : "2px solid #ff9800",
          borderRadius: 12,
          padding: 18,
          marginBottom: 18,
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)"
        }}>
          <div style={{ fontWeight: 700, fontSize: 18, marginBottom: 8, color: alerteJ3.urgence ? "#c62828" : "#e65100" }}>
            {alerteJ3.message}
          </div>
          <div style={{ marginBottom: 12 }}>
            {alerteJ3.urgence 
              ? "Tu dois MAINTENANT préparer ta sortie de jeûne pour éviter le syndrome de réalimentation."
              : "Profite de ces 3 derniers jours pour préparer mentalement et logistiquement ta reprise."}
          </div>
          <button
            onClick={genererProgrammeRepriseManuel}
            disabled={loadingProgramme || programmeReprise}
            style={{
              background: programmeReprise ? "#4caf50" : (alerteJ3.urgence ? "#f44336" : "#ff9800"),
              color: "#fff",
              border: "none",
              borderRadius: 8,
              padding: "12px 24px",
              fontWeight: 700,
              fontSize: 16,
              cursor: programmeReprise ? "default" : "pointer",
              opacity: loadingProgramme ? 0.6 : 1
            }}
          >
            {loadingProgramme ? "Génération..." : (programmeReprise ? "✅ Programme généré" : "Générer mon programme de reprise")}
          </button>
          {programmeReprise && (
            <div style={{ marginTop: 12, padding: 12, background: "#fff", borderRadius: 8 }}>
              <strong>Programme créé :</strong><br />
              {programmeReprise.duree_reprise_jours} jours de reprise<br />
              Du {programmeReprise.date_debut_reprise} au {programmeReprise.date_fin_reprise}<br />
              <button
                onClick={() => {
                  console.log("Programme complet:", programmeReprise);
                  alert("Voir la console (F12) pour les détails complets du programme");
                }}
                style={{
                  marginTop: 8,
                  background: "#1976d2",
                  color: "#fff",
                  border: "none",
                  borderRadius: 6,
                  padding: "6px 12px",
                  cursor: "pointer"
                }}
              >
                Voir les détails
              </button>
            </div>
          )}
        </div>
      )}

      {/* --- Analyse comportementale pré-jeûne (Jour 1 uniquement) --- */}
      {jourEnCours === 1 && (
        <div style={{
          background: "#fffde7", border: "1px solid #ffe082", borderRadius: 12, padding: 16, marginBottom: 18
        }}>
          <div style={{ fontWeight: 600, marginBottom: 6 }}>🧾 Analyse comportementale pré-jeûne</div>
          <div>
            {analyse.message}
          </div>
          <div style={{ marginTop: 8, color: "#888" }}>
            {perteEstimee}
          </div>
        </div>
      )}

      {/* --- Message personnel (bonus) --- */}
      <div style={{ marginBottom: 18 }}>
        <button
          style={{
            background: "#ede7f6", color: "#4d148c", border: "none", borderRadius: 8,
            padding: "6px 16px", fontWeight: 600, cursor: "pointer"
          }}
          onClick={() => setShowMessagePerso(s => !s)}
        >
          {showMessagePerso ? "Masquer mon message à moi-même" : "🪞 Je me parle"}
        </button>
        {showMessagePerso && (
          <div style={{ marginTop: 8 }}>
            <textarea
              value={messagePerso}
              onChange={e => setMessagePerso(e.target.value)}
              placeholder="Écris-toi un message d’encouragement ou d’intention pour ce jeûne…"
              style={{ width: "100%", minHeight: 60, borderRadius: 8, border: "1px solid #b39ddb", padding: 8 }}
            />
            <div style={{ fontSize: 13, color: "#888", marginTop: 4 }}>
              Ce message te sera réaffiché le jour de la reprise.
            </div>
          </div>
        )}
      </div>

      {/* --- Contenu du jour --- */}
      <div style={{
        background: "#fff", borderRadius: 12, padding: 18, marginBottom: 18, boxShadow: "0 1px 6px #bdbdbd22"
      }}>
        <div style={{ fontWeight: 700, fontSize: 18, marginBottom: 8 }}>
          {contenuJour.titre}
        </div>
        <ul style={{ margin: 0, paddingLeft: 18 }}>
          {contenuJour.corps.map((bloc, i) => (
            <li key={i} style={{ marginBottom: 6 }}>{bloc}</li>
          ))}
        </ul>
        <div style={{ marginTop: 12, fontStyle: "italic", color: "#1976d2" }}>
          {SUPPORT_MESSAGES[((jourEnCours - 1 + SUPPORT_MESSAGES.length) % SUPPORT_MESSAGES.length)]}
        </div>
        <button
          style={{
            marginTop: 18, background: "#43a047", color: "#fff", border: "none",
            borderRadius: 8, padding: "10px 24px", fontWeight: 700, fontSize: 16, cursor: "pointer"
          }}
          onClick={validerJour}
          disabled={joursValides.includes(jourEnCours)}
        >
          {joursValides.includes(jourEnCours) ? "Jour validé ✅" : "Valider ce jour"}
        </button>
      </div>

      {/* --- Boîte à outils personnelle --- */}
      <div style={{
        background: "#e0f2f1", borderRadius: 12, padding: 16, marginBottom: 18
      }}>
        <div style={{ fontWeight: 600, marginBottom: 6 }}>🧰 Ma boîte à outils du jour</div>
        <div style={{ fontSize: 14, color: "#888", marginBottom: 6 }}>
          Qu’est-ce qui t’a aidé aujourd’hui à tenir ?
        </div>
        <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
          <input
            value={outilInput}
            onChange={e => setOutilInput(e.target.value)}
            placeholder="Ex : respiration, prière, marche…"
            style={{ flex: 1, borderRadius: 6, border: "1px solid #80cbc4", padding: 6 }}
          />
          <button
            onClick={ajouterOutil}
            style={{
              background: "#00897b", color: "#fff", border: "none", borderRadius: 6,
              padding: "6px 14px", fontWeight: 600, cursor: "pointer"
            }}
          >
            Ajouter
          </button>
        </div>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {OUTILS_SUGGESTIONS.map((s, i) => (
            <button
              key={i}
              onClick={() => setOutilInput(s)}
              style={{
                background: "#fff", border: "1px solid #b2dfdb", borderRadius: 6,
                padding: "4px 10px", fontSize: 13, color: "#00897b", cursor: "pointer"
              }}
              type="button"
            >
              {s}
            </button>
          ))}
        </div>
        {outils[jourEnCours]?.length > 0 && (
          <div style={{ marginTop: 10 }}>
            <div style={{ fontWeight: 500, marginBottom: 4 }}>Outils utilisés aujourd’hui :</div>
            <ul style={{ margin: 0, paddingLeft: 18 }}>
              {outils[jourEnCours].map((o, i) => (
                <li key={i}>{o}</li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* --- Bloc “En savoir plus” --- */}
      <div style={{
        background: "#f3e5f5", borderRadius: 12, padding: 16, marginBottom: 18
      }}>
        <button
          style={{
            background: "#7e57c2", color: "#fff", border: "none", borderRadius: 8,
            padding: "8px 18px", fontWeight: 600, cursor: "pointer"
          }}
          onClick={() => setShowInfo(true)}
        >
          🧬 En savoir plus sur ce qui se passe dans ton corps
        </button>
        {showInfo && (
          <div style={{
            marginTop: 12, background: "#fff", borderRadius: 8, padding: 16, boxShadow: "0 2px 8px #b39ddb33"
          }}>
            <div style={{ fontWeight: 700, fontSize: 17, marginBottom: 8 }}>
              {contenuJour.titre}
            </div>
            <ul style={{ margin: 0, paddingLeft: 18 }}>
              {contenuJour.corps.map((bloc, i) => (
                <li key={i}>{bloc}</li>
              ))}
            </ul>
            <button
              style={{
                marginTop: 12, background: "#b39ddb", color: "#fff", border: "none", borderRadius: 8,
                padding: "6px 16px", fontWeight: 600, cursor: "pointer"
              }}
              onClick={() => setShowInfo(false)}
            >
              Fermer
            </button>
          </div>
        )}
      </div>

      {/* --- Préparation à la reprise (à partir de J4 ou moitié du jeûne) --- */}
      {showReprise && (
        <div style={{
          background: "#fffde7", border: "1px solid #ffe082", borderRadius: 12, padding: 16, marginBottom: 18
        }}>
          <div style={{ fontWeight: 600, marginBottom: 6 }}>
            Préparation à la reprise alimentaire
          </div>
          <div>
            Dans {dureeJeune - jourEnCours + 1} jours, tu sortiras de ce jeûne. Ce n’est pas une fin, c’est une entrée vers une alimentation consciente.<br />
            <button
              style={{
                marginTop: 8, background: loadingProgramme ? "#90caf9" : "#1976d2", color: "#fff", border: "none", borderRadius: 8,
                padding: "6px 16px", fontWeight: 600, cursor: loadingProgramme ? "not-allowed" : "pointer", opacity: loadingProgramme ? 0.7 : 1
              }}
              disabled={loadingProgramme}
              onClick={async () => {
                setLoadingProgramme(true);
                try {
                  const dateFin = new Date(dateDebutJeune);
                  dateFin.setDate(dateFin.getDate() + dureeJeune - 1);
                  const dateFinStr = dateFin.toISOString().split('T')[0];
                  // Tenter de récupérer l'utilisateur, mais ne pas bloquer si absent
                  let userId;
                  try {
                    const { data: { user } } = await supabase.auth.getUser();
                    userId = user?.id;
                  } catch {}
                  let programmeSauvegarde;
                  if (userId) {
                    programmeSauvegarde = await genererEtSauvegarderProgramme(userId, {
                      id: null,
                      duree_jours: dureeJeune,
                      date_fin: dateFinStr,
                      poids_depart: poidsDepart
                    });
                    if (programmeSauvegarde) {
                      setProgrammeReprise(programmeSauvegarde);
                      saveState("programmeReprise", programmeSauvegarde);
                      setAlerteJ3(null);
                      alert(`✅ Programme généré et sauvegardé ! ${programmeSauvegarde.duree_reprise_jours} jours de reprise créés.\nVous allez être redirigé vers la validation.`);
                      window.location.href = "/validation-plan-reprise";
                    } else {
                      alert("❌ Erreur lors de la génération du programme");
                    }
                  } else {
                    // Génération locale strictement sans userId (comme ideaux)
                    const programme = genererProgrammeReprise({
                      dureeJeune,
                      poidsDepart,
                      dateFin: dateFinStr,
                      options: {
                        genere_automatiquement: true,
                        genere_le: new Date().toISOString()
                      }
                    });
                    programmeSauvegarde = {
                      ...programme,
                      id: null,
                      statut: 'proposition',
                      plan_genere_le: new Date().toISOString()
                    };
                    setProgrammeReprise(programmeSauvegarde);
                    saveState("programmeReprise", programmeSauvegarde);
                    setAlerteJ3(null);
                    alert(`✅ Programme généré localement ! ${programmeSauvegarde.duree_reprise_jours} jours de reprise créés. Connecte-toi pour sauvegarder définitivement.`);
                  }
                } catch (err) {
                  alert("❌ Erreur inattendue : " + err.message);
                } finally {
                  setLoadingProgramme(false);
                }
              }}
            >
              {loadingProgramme ? "Génération du plan en cours..." : "Générer mon plan de reprise"}
            </button>
          </div>
        </div>
      )}

      {/* --- Passerelle automatique vers la reprise --- */}
      {isFini && (
        <div style={{
          background: "#e8f5e9", border: "1px solid #a5d6a7", borderRadius: 12, padding: 20, marginBottom: 18
        }}>
          <div style={{ fontWeight: 700, fontSize: 18, color: "#388e3c", marginBottom: 8 }}>
            🎉 Bravo, tu as terminé ton jeûne !
          </div>
          <div>
            Demain, tu commences ta reprise guidée de {dureeJeune * 2} jours.<br />
            Les repas sont déjà préparés dans ton planning. Tu n’as plus qu’à les suivre.
          </div>
          {messagePerso && (
            <div style={{
              marginTop: 14, background: "#fff", borderRadius: 8, padding: 12, border: "1px solid #bdbdbd"
            }}>
              <b>Ton message à toi-même :</b>
              <div style={{ marginTop: 6, color: "#4d148c" }}>{messagePerso}</div>
            </div>
          )}
          {Object.keys(outils).length > 0 && (
            <div style={{ marginTop: 16 }}>
              <b>Voici les outils que tu as mobilisés pendant ton jeûne :</b>
              <ul style={{ margin: 0, paddingLeft: 18 }}>
                {Object.entries(outils).map(([jour, outs]) =>
                  outs.map((o, i) => (
                    <li key={jour + "-" + i}>
                      Jour {jour} : {o}
                    </li>
                  ))
                )}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* --- Suivi de progression --- */}
      <div style={{
        marginTop: 24, marginBottom: 18, background: "#f5f5f5", borderRadius: 8, padding: 12, textAlign: "center"
      }}>
        <div style={{ fontWeight: 600, marginBottom: 6 }}>
          Progression : {joursValides.length} / {dureeJeune} jours validés
        </div>
        <div style={{
          height: 12, background: "#e0e0e0", borderRadius: 6, overflow: "hidden", margin: "8px 0"
        }}>
          <div style={{
            width: `${(joursValides.length / dureeJeune) * 100}%`,
            background: "#1976d2", height: "100%", borderRadius: 6, transition: "width 0.4s"
          }} />
        </div>
        <div style={{ fontSize: 13, color: "#888" }}>
          {joursValides.length < dureeJeune
            ? "Valide chaque jour pour suivre ta progression."
            : "Jeûne terminé ! Prends soin de ta reprise."}
        </div>
      </div>

      {/* --- Paramètres et reset (pour tests) --- */}
      <div style={{ marginTop: 24, textAlign: "center" }}>
        <label>
          Durée du jeûne (jours) :
          <input
            type="number"
            min={1}
            max={20}
            value={dureeJeune}
            onChange={e => setDureeJeune(Math.max(1, Number(e.target.value)))}
            style={{ marginLeft: 8, width: 60 }}
            disabled={joursValides.length > 0}
          />
        </label>
        <button
          style={{
            marginLeft: 16, background: "#f44336", color: "#fff", border: "none", borderRadius: 8,
            padding: "6px 16px", fontWeight: 600, cursor: "pointer"
          }}
          onClick={resetJeune}
        >
          Réinitialiser le jeûne
        </button>
      </div>
    </div>
  );
}