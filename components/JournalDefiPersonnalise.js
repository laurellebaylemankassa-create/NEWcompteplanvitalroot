// Composant de suivi quotidien pour défis personnalisés
// Formulaire matin : déclaration engagements (1-5)
// Formulaire soir : validation engagements via checklist
// Affichage historique des jours précédents

import { useState, useEffect } from "react";
import { sauvegarderEngagements, chargerJournalDefi, validerEtapeDefi, calculerScore } from "../lib/journalDefisUtils";

export default function JournalDefiPersonnalise({ defi, jourActuel, onProgressionUpdate }) {
  // États principaux
  const [engagements, setEngagements] = useState([]);
  const [nouvelEngagement, setNouvelEngagement] = useState("");
  const [notePersonnelle, setNotePersonnelle] = useState("");
  const [journalCharge, setJournalCharge] = useState(false);
  const [etapeValidee, setEtapeValidee] = useState(false);
  const [message, setMessage] = useState("");

  // Charger le journal du jour au montage
  useEffect(() => {
    if (defi?.id && jourActuel) {
      chargerJournal();
    }
  }, [defi?.id, jourActuel]);

  const chargerJournal = async () => {
    try {
      const journal = await chargerJournalDefi(defi.id, jourActuel);
      if (journal) {
        setEngagements(journal.engagements || []);
        setNotePersonnelle(journal.note_personnelle || "");
        setEtapeValidee(journal.valide || false);
      }
      setJournalCharge(true);
    } catch (error) {
      console.error("Erreur chargement journal:", error);
      setMessage("Erreur lors du chargement");
    }
  };

  const ajouterEngagement = () => {
    if (nouvelEngagement.trim() && engagements.length < 5) {
      setEngagements([...engagements, { texte: nouvelEngagement.trim(), valide: false }]);
      setNouvelEngagement("");
    }
  };

  const supprimerEngagement = (index) => {
    setEngagements(engagements.filter((_, i) => i !== index));
  };

  const toggleEngagement = (index) => {
    const nouveauxEngagements = [...engagements];
    nouveauxEngagements[index].valide = !nouveauxEngagements[index].valide;
    setEngagements(nouveauxEngagements);
  };

  const sauvegarderDeclaration = async () => {
    if (engagements.length === 0) {
      setMessage("Ajoutez au moins 1 engagement");
      return;
    }

    try {
      await sauvegarderEngagements(defi.id, jourActuel, engagements, notePersonnelle);
      setMessage("✓ Engagements sauvegardés");
      setTimeout(() => setMessage(""), 3000);
    } catch (error) {
      console.error("Erreur sauvegarde:", error);
      setMessage("Erreur lors de la sauvegarde");
    }
  };

  const validerJournee = async () => {
    if (engagements.length === 0) {
      setMessage("Déclarez d\'abord vos engagements du matin");
      return;
    }

    try {
      const result = await validerEtapeDefi(defi.id, jourActuel, engagements);
      setEtapeValidee(true);

      if (result.progressionIncrementee) {
        setMessage(`✓ Journée validée ! Progression : ${result.newProgress}/${defi.duree}`);
        if (onProgressionUpdate) {
          onProgressionUpdate(result.newProgress);
        }
      } else {
        const score = calculerScore(engagements);
        setMessage(`Journée enregistrée (${score} validés). Minimum 2/3 requis pour progresser.`);
      }

      setTimeout(() => setMessage(""), 5000);
    } catch (error) {
      console.error("Erreur validation:", error);
      setMessage("Erreur lors de la validation");
    }
  };

  if (!journalCharge) {
    return <div className="text-center py-4">Chargement...</div>;
  }

  return (
    <div className="space-y-6 p-4 bg-white rounded-lg shadow">
      {/* En-tête */}
      <div className="border-b pb-4">
        <h2 className="text-xl font-bold text-gray-800">{defi.nom}</h2>
        <p className="text-sm text-gray-600">
          Jour {jourActuel} / {defi.duree} - Progression : {defi.progress || 0} jours validés
        </p>
      </div>

      {/* Message de feedback */}
      {message && (
        <div className={`p-3 rounded ${message.includes("✓") ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}`}>
          {message}
        </div>
      )}

      {/* SECTION MATIN : Déclaration des engagements */}
      {!etapeValidee && (
        <div className="border rounded-lg p-4 bg-blue-50">
          <h3 className="font-bold text-blue-900 mb-3">☀️ Ce matin</h3>
          <p className="text-sm text-gray-700 mb-4">
            Déclarez 1 à 5 engagements concrets pour aujourd\'hui
          </p>

          {/* Liste des engagements déclarés */}
          <div className="space-y-2 mb-4">
            {engagements.map((eng, index) => (
              <div key={index} className="flex items-center justify-between bg-white p-2 rounded border">
                <span className="text-sm">{eng.texte}</span>
                <button
                  onClick={() => supprimerEngagement(index)}
                  className="text-red-600 hover:text-red-800 text-sm"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>

          {/* Ajout nouvel engagement */}
          {engagements.length < 5 && (
            <div className="flex gap-2 mb-4">
              <input
                type="text"
                value={nouvelEngagement}
                onChange={(e) => setNouvelEngagement(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && ajouterEngagement()}
                placeholder="Ex: Boire 2L d\'eau"
                className="flex-1 px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500 text-sm"
              />
              <button
                onClick={ajouterEngagement}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
              >
                Ajouter
              </button>
            </div>
          )}

          {/* Note personnelle */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Note personnelle (optionnelle)
            </label>
            <textarea
              value={notePersonnelle}
              onChange={(e) => setNotePersonnelle(e.target.value)}
              placeholder="Contexte, motivation, objectif du jour..."
              rows={3}
              className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500 text-sm"
            />
          </div>

          {/* Bouton sauvegarde */}
          <button
            onClick={sauvegarderDeclaration}
            disabled={engagements.length === 0}
            className="w-full py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            💾 Sauvegarder mes engagements
          </button>
        </div>
      )}

      {/* SECTION SOIR : Validation des engagements */}
      {engagements.length > 0 && (
        <div className="border rounded-lg p-4 bg-purple-50">
          <h3 className="font-bold text-purple-900 mb-3">🌙 Ce soir</h3>
          <p className="text-sm text-gray-700 mb-4">
            Cochez les engagements accomplis (minimum 2/3 pour valider la journée)
          </p>

          {/* Checklist */}
          <div className="space-y-2 mb-4">
            {engagements.map((eng, index) => (
              <label
                key={index}
                className="flex items-center gap-3 p-3 bg-white rounded border cursor-pointer hover:bg-gray-50"
              >
                <input
                  type="checkbox"
                  checked={eng.valide}
                  onChange={() => toggleEngagement(index)}
                  disabled={etapeValidee}
                  className="w-5 h-5 text-purple-600 focus:ring-purple-500"
                />
                <span className={`text-sm ${eng.valide ? "line-through text-gray-500" : "text-gray-800"}`}>
                  {eng.texte}
                </span>
              </label>
            ))}
          </div>

          {/* Score actuel */}
          <div className="mb-4 p-3 bg-white rounded border">
            <span className="text-sm font-medium">Score actuel : </span>
            <span className="text-lg font-bold text-purple-700">{calculerScore(engagements)}</span>
            <span className="text-sm text-gray-600 ml-2">
              ({engagements.filter(e => e.valide).length} sur {engagements.length})
            </span>
          </div>

          {/* Bouton validation */}
          {!etapeValidee && (
            <button
              onClick={validerJournee}
              className="w-full py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
            >
              ✓ Valider la journée
            </button>
          )}

          {etapeValidee && (
            <div className="w-full py-2 bg-gray-200 text-gray-700 rounded text-center font-medium">
              ✓ Journée déjà validée
            </div>
          )}
        </div>
      )}

      {/* Aide contextuelle */}
      {engagements.length === 0 && !etapeValidee && (
        <div className="border-l-4 border-blue-500 bg-blue-50 p-4">
          <p className="text-sm text-blue-900">
            <strong>Comment ça marche ?</strong><br />
            1. Le matin : déclarez 1 à 5 engagements concrets<br />
            2. Le soir : cochez ceux que vous avez accomplis<br />
            3. Si ≥ 2/3 validés → votre progression augmente de 1 jour
          </p>
        </div>
      )}
    </div>
  );
}
