import React, { useState } from 'react';
import { useDefis } from './DefisContext';
import { defisReferentiel } from '../lib/defisReferentiel';
import { supabase } from '../lib/supabaseClient';

export default function SaisieDefiAlimentaire() {
    const { defisEnCours, refreshDefis } = useDefis();
    // On cible le défi "🧀 1 portion ça suffit" pour l'exemple
    const defi = defisEnCours.find(d => d.nom === '🧀 1 portion ça suffit');
    const [aliments, setAliments] = useState([{ nom: '', portion: 1 }]);
    const [confirmation, setConfirmation] = useState(false);
    const [message, setMessage] = useState('');
    const [erreur, setErreur] = useState('');

    if (!defi) return null;

    const handleAlimentChange = (idx, field, value) => {
        const next = aliments.map((a, i) => i === idx ? { ...a, [field]: value } : a);
        setAliments(next);
    };

    const handleAddAliment = () => {
        setAliments([...aliments, { nom: '', portion: 1 }]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');
        setErreur('');
        // Vérification : chaque aliment ne doit apparaître qu'une fois et portion = 1
        const noms = aliments.map(a => a.nom.trim()).filter(Boolean);
        const unique = new Set(noms);
        if (noms.length !== unique.size) {
            setErreur('Chaque aliment ne doit être saisi qu’une seule fois.');
            return;
        }
        if (!confirmation) {
            setErreur('Merci de confirmer que tu as respecté une seule portion de chaque aliment.');
            return;
        }
        // Validation centralisée de l'étape du défi (progression + badge)
        const { validerEtapeDefi } = await import('../lib/defisUtils');
        const res = await validerEtapeDefi(defi);
        if (res.success) {
            setMessage('Bravo ! Une étape de ton défi a été validée.');
            refreshDefis();
            setAliments([{ nom: '', portion: 1 }]);
            setConfirmation(false);
        } else {
            setErreur(res.error || 'Erreur lors de la validation.');
        }
    };

    return (
        <div style={{ background: '#fffde7', border: '1px solid #ffe082', borderRadius: 10, padding: 24, margin: '24px 0' }}>
            <h3>Défi en cours : {defi.nom}</h3>
            <p>{defi.description}</p>
            <form onSubmit={handleSubmit}>
                <div>
                    <strong>Liste des aliments consommés (une seule portion chacun) :</strong>
                    {aliments.map((aliment, idx) => (
                        <div key={idx} style={{ marginBottom: 8 }}>
                            <input
                                type="text"
                                placeholder="Nom de l'aliment"
                                value={aliment.nom}
                                onChange={e => handleAlimentChange(idx, 'nom', e.target.value)}
                                required
                                style={{ marginRight: 8 }}
                            />
                            <input
                                type="number"
                                min={1}
                                max={1}
                                value={aliment.portion}
                                readOnly
                                style={{ width: 60 }}
                            /> portion
                        </div>
                    ))}
                    <button type="button" onClick={handleAddAliment} style={{ marginTop: 8 }}>Ajouter un aliment</button>
                </div>
                <div style={{ marginTop: 16 }}>
                    <label>
                        <input
                            type="checkbox"
                            checked={confirmation}
                            onChange={e => setConfirmation(e.target.checked)}
                        /> J’ai respecté une seule portion de chaque aliment pour ce repas.
                    </label>
                </div>
                {erreur && <p style={{ color: 'red' }}>{erreur}</p>}
                {message && <p style={{ color: 'green' }}>{message}</p>}
                <button type="submit" style={{ marginTop: 16 }}>Valider l’étape du défi</button>
            </form>
        </div>
    );
}
