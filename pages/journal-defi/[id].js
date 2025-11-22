// Page dynamique pour le suivi quotidien d'un défi personnalisé
// Route : /journal-defi/[id] où id = defi.id
// Charge le défi depuis Supabase et affiche JournalDefiPersonnalise

import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { supabase } from "../../lib/supabaseClient";
import JournalDefiPersonnalise from "../../components/JournalDefiPersonnalise";
import Navigation from "../../components/Navigation";

export default function PageJournalDefi() {
  const router = useRouter();
  const { id } = router.query;

  const [defi, setDefi] = useState(null);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState(null);
  const [jourActuel, setJourActuel] = useState(1);

  useEffect(() => {
    if (router.isReady && id) {
      chargerDefi();
    }
  }, [router.isReady, id]);

  const chargerDefi = async () => {
    try {
      setChargement(true);
      setErreur(null);

      const { data, error } = await supabase
        .from("defis")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;

      if (!data) {
        setErreur("Défi introuvable");
        return;
      }

      setDefi(data);
      // Calculer le jour actuel en fonction du temps écoulé depuis created_at
      const joursEcoules = Math.floor(
        (Date.now() - new Date(data.created_at).getTime()) / (1000 * 60 * 60 * 24)
      );
      setJourActuel(Math.min(joursEcoules + 1, data.duree));
    } catch (err) {
      console.error("Erreur chargement défi:", err);
      setErreur("Erreur lors du chargement du défi");
    } finally {
      setChargement(false);
    }
  };

  const handleProgressionUpdate = async (nouvelleProgression) => {
    // Mettre à jour l'état local du défi
    setDefi((prev) => ({ ...prev, progress: nouvelleProgression }));

    // Recharger le défi depuis Supabase pour synchroniser
    try {
      const { data } = await supabase
        .from("defis")
        .select("*")
        .eq("id", id)
        .single();

      if (data) {
        setDefi(data);
      }
    } catch (err) {
      console.error("Erreur rechargement défi:", err);
    }
  };

  const retourDefis = () => {
    router.push("/defis");
  };

  if (chargement) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-2xl mb-2">⏳</div>
          <div className="text-gray-600">Chargement du défi...</div>
        </div>
      </div>
    );
  }

  if (erreur) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center px-4">
        <div className="bg-white border-2 border-red-200 rounded-2xl shadow-xl p-8 max-w-md w-full">
          <div className="text-5xl text-center mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-red-800 mb-3 text-center">Oups !</h2>
          <p className="text-red-700 mb-6 text-center">{erreur}</p>
          <button
            onClick={retourDefis}
            className="w-full py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 font-semibold transition-colors"
          >
            ← Retour aux défis
          </button>
        </div>
      </div>
    );
  }

  if (!defi) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="text-5xl mb-3">🔍</div>
          <div className="text-gray-600 text-lg">Aucun défi trouvé</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50">
      <div className="container mx-auto px-4 py-6 max-w-5xl">
        {/* En-tête avec bouton retour */}
        <div className="mb-8">
          <button
            onClick={retourDefis}
            className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow text-gray-700 hover:text-gray-900 font-medium mb-6"
          >
            <span className="text-xl">←</span>
            <span>Retour aux défis</span>
          </button>
          <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-purple-500">
            <div className="flex items-center gap-3">
              <span className="text-4xl">📔</span>
              <div>
                <h1 className="text-3xl font-bold text-gray-800">Journal quotidien</h1>
                <p className="text-gray-600 mt-1">{defi.nom}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Composant principal */}
        <JournalDefiPersonnalise
          defi={defi}
          jourActuel={jourActuel}
          onProgressionUpdate={handleProgressionUpdate}
        />

        {/* Navigation entre les jours */}
        <div className="mt-8 flex flex-wrap justify-center items-center gap-4">
          <button
            onClick={() => setJourActuel(Math.max(1, jourActuel - 1))}
            disabled={jourActuel <= 1}
            className="px-6 py-3 bg-white shadow-md text-gray-700 rounded-lg hover:shadow-lg hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed font-medium transition-all"
          >
            ← Jour précédent
          </button>
          <div className="px-8 py-3 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-lg font-bold text-lg shadow-lg">
            Jour {jourActuel} / {defi.duree}
          </div>
          <button
            onClick={() => setJourActuel(Math.min(defi.duree, jourActuel + 1))}
            disabled={jourActuel >= defi.duree}
            className="px-6 py-3 bg-white shadow-md text-gray-700 rounded-lg hover:shadow-lg hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed font-medium transition-all"
          >
            Jour suivant →
          </button>
        </div>

        {/* Indicateur de progression */}
        <div className="mt-8 bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
          <div className="flex justify-between items-center mb-3">
            <span className="text-base font-semibold text-gray-800 flex items-center gap-2">
              <span>📊</span> Progression globale
            </span>
            <span className="text-sm font-bold text-purple-600 bg-purple-50 px-3 py-1 rounded-full">
              {defi.progress || 0} / {defi.duree} jours
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-4 shadow-inner">
            <div
              className="bg-gradient-to-r from-green-400 to-green-600 h-4 rounded-full transition-all duration-500 shadow-sm"
              style={{ width: `${((defi.progress || 0) / defi.duree) * 100}%` }}
            ></div>
          </div>
          {defi.progress >= defi.duree && (
            <div className="mt-4 p-4 bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-300 rounded-xl text-center shadow-sm">
              <span className="text-green-800 font-bold text-lg">🎉 Félicitations ! Défi terminé !</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
