import React, { useState } from 'react';
import { useDefis } from './DefisContext';
import { defisReferentiel } from '../lib/defisReferentiel';
import { supabase } from '../lib/supabaseClient';

const SaisieRepas = () => {
    const [repas, setRepas] = useState('');
    const [quantite, setQuantite] = useState('');
    const [erreur, setErreur] = useState('');
    const [message, setMessage] = useState('');
    const { defisEnCours, refreshDefis } = useDefis();

    // Détection d'un défi applicable à la saisie
    function getDefiApplicable() {
        // Ex : pour "1 portion ça suffit", on vérifie si le défi est en cours et si le repas est renseigné
        // Ici, on prend l'exemple du défi "1 portion ça suffit" (nom exact du référentiel)
        return defisEnCours.find(defi => {
            const ref = defisReferentiel.find(d => d.nom === defi.nom);
            if (!ref) return false;
            // Pour ce défi, on valide une étape à chaque repas saisi
            if (defi.nom === '🧀 1 portion ça suffit') {
                return repas && quantite;
            }
            // Ajouter d'autres règles pour d'autres défis ici si besoin
            return false;
        });
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');
        if (!repas || !quantite) {
            setErreur('Veuillez remplir tous les champs.');
            return;
        }
        setErreur('');

        // Logique d'auto-validation d'étape de défi
        const defi = getDefiApplicable();
        if (defi) {
            // On incrémente la progression
            const ref = defisReferentiel.find(d => d.nom === defi.nom);
            const max = ref?.duree || 1;
            const nouvelleProgression = Math.min(defi.progress + 1, max);
            const nouveauStatus = nouvelleProgression >= max ? 'terminé' : 'en cours';
            const { error: updateError } = await supabase
                .from('defis')
                .update({ progress: nouvelleProgression, status: nouveauStatus })
                .eq('id', defi.id);
            if (!updateError) {
                setMessage('Bravo ! Une étape de votre défi a été validée automatiquement.');
                refreshDefis();
            }
        }

        // Ici, on soumet simplement les données sans API intelligente
        setRepas('');
        setQuantite('');
    };

    return (
        <div>
            <h2>Saisie de Repas</h2>
            <form onSubmit={handleSubmit}>
                <div>
                    <label htmlFor="repas">Nom du repas:</label>
                    <input
                        type="text"
                        id="repas"
                        value={repas}
                        onChange={(e) => setRepas(e.target.value)}
                    />
                </div>
                <div>
                    <label htmlFor="quantite">Quantité:</label>
                    <input
                        type="number"
                        id="quantite"
                        value={quantite}
                        onChange={(e) => setQuantite(e.target.value)}
                    />
                </div>
                {erreur && <p style={{ color: 'red' }}>{erreur}</p>}
                {message && <p style={{ color: 'green' }}>{message}</p>}
                <button type="submit">Ajouter Repas</button>
            </form>
        </div>
    );
};

export default SaisieRepas;