import React, { useState, useEffect } from 'react';
import { useDefis } from './DefisContext';
import { supabase } from '../lib/supabaseClient';

export default function SaisieDefiAlimentaire() {
    const { defisEnCours, refreshDefis } = useDefis();
    const defi = defisEnCours.find(d => d.nom === '🧀 1 portion ça suffit');
    const repasTypes = ["Petit-déjeuner", "Déjeuner", "Collation", "Dîner", "Autre"];
    // Catégories de repas, inclut 'Jeûne' pour la logique métier
    const categorieOptions = [
        "féculent", "protéines", "légumes", "fruit", "extra", "poisson", "volaille", "viande", "autres", "fromage", "boisson", "produit laitier", "Jeûne"
    ];
    const getDefaultHeure = () => {
        const now = new Date();
        return now.toTimeString().slice(0,5);
    };
    // Champs principaux
    const [type, setType] = useState('Déjeuner');
    const [date, setDate] = useState(new Date().toISOString().slice(0,10));
    const [heure, setHeure] = useState(getDefaultHeure());
    const [aliment, setAliment] = useState('');
    const [categorie, setCategorie] = useState('');
    const [quantite, setQuantite] = useState('1');
    const [kcal, setKcal] = useState('');
    const [note, setNote] = useState('');
    const [ressenti, setRessenti] = useState('');
    const [confirmation, setConfirmation] = useState(false);
    const [message, setMessage] = useState('');
    const [erreur, setErreur] = useState('');

    if (!defi) return null;

    // Remise à zéro automatique des champs non requis si catégorie = Jeûne
    useEffect(() => {
        if (categorie === "Jeûne") {
            setAliment('');
            setQuantite('');
            setKcal('');
        }
    }, [categorie]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');
        setErreur('');
        // Si catégorie = Jeûne, on n'exige pas les champs aliments/quantité/kcal
        const isJeune = categorie === "Jeûne";
        if (!isJeune && !aliment.trim()) {
            setErreur('Merci de saisir un aliment.');
            return;
        }
        if (!confirmation) {
            setErreur('Merci de confirmer que tu as respecté une seule portion de chaque aliment.');
            return;
        }
        // Correction : envoyer null pour quantite et kcal si Jeûne
        const quantiteToSend = isJeune ? null : (quantite === '' ? null : isNaN(Number(quantite)) ? quantite : Number(quantite));
        const kcalToSend = isJeune ? null : (kcal === '' ? null : isNaN(Number(kcal)) ? kcal : Number(kcal));
        const alimentToSend = isJeune ? '' : aliment;
        const categorieToSend = isJeune ? 'Jeûne' : categorie;
        const { data, error } = await supabase
            .from("repas_reels")
            .insert([{
                type,
                date,
                heure,
                aliment: alimentToSend,
                categorie: categorieToSend,
                quantite: quantiteToSend,
                kcal: kcalToSend,
                est_extra: false,
                note,
                ressenti,
                planifie: false,
                fastFood: false,
                satiete: '',
            }]);
        if (error) {
            setErreur("Erreur Supabase : " + error.message);
            return;
        }
        // 2. Valider l’étape du défi (progression + badge)
        const { validerEtapeDefi } = await import('../lib/defisUtils');
        const res = await validerEtapeDefi(defi);
        if (res.success) {
            setMessage('Bravo ! Repas enregistré et étape du défi validée.');
            refreshDefis();
            setAliment('');
            setCategorie('');
            setQuantite('1');
            setKcal('');
            setNote('');
            setRessenti('');
            setConfirmation(false);
        } else {
            setErreur(res.error || 'Erreur lors de la validation du défi.');
        }
    };

    return (
        <div style={{ background: '#fffde7', border: '1px solid #ffe082', borderRadius: 10, padding: 24, margin: '24px 0' }}>
            <h3>Défi en cours : {defi.nom}</h3>
            <p>{defi.description}</p>
            <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: 10 }}>
                    <label>Type de repas :
                        <select value={type} onChange={e => setType(e.target.value)} style={{ marginLeft: 8 }}>
                            {repasTypes.map(rt => <option key={rt}>{rt}</option>)}
                        </select>
                    </label>
                </div>
                <div style={{ marginBottom: 10 }}>
                    <label>Date :
                        <input type="date" value={date} onChange={e => setDate(e.target.value)} style={{ marginLeft: 8 }} />
                    </label>
                </div>
                <div style={{ marginBottom: 10 }}>
                    <label>Heure de prise du repas (optionnel) :
                        <input type="time" value={heure} onChange={e => setHeure(e.target.value)} style={{ marginLeft: 8, width: 110 }} />
                        <span style={{ color: '#888', fontSize: 13, marginLeft: 8 }}>(pré-rempli à l'heure actuelle, modifiable)</span>
                    </label>
                </div>
                <div style={{ marginBottom: 10 }}>
                    <label>Aliment mangé :
                        <input type="text" value={aliment} onChange={e => setAliment(e.target.value)} placeholder="Saisissez un aliment" style={{ marginLeft: 8 }} required={categorie !== "Jeûne"} />
                    </label>
                </div>
                <div style={{ marginBottom: 10 }}>
                    <label>Catégorie :
                        <input list="categorieOptions" type="text" value={categorie} onChange={e => setCategorie(e.target.value)} style={{ marginLeft: 8 }} />
                        <datalist id="categorieOptions">
                            {categorieOptions.map(opt => <option key={opt} value={opt} />)}
                        </datalist>
                    </label>
                </div>
                <div style={{ marginBottom: 10 }}>
                    <label>Quantité :
                        <input type="text" value={quantite} onChange={e => setQuantite(e.target.value)} style={{ marginLeft: 8, width: 60 }} required={categorie !== "Jeûne"} />
                    </label>
                </div>
                <div style={{ marginBottom: 10 }}>
                    <label>Kcal :
                        <input type="number" value={kcal} onChange={e => setKcal(e.target.value)} style={{ marginLeft: 8, width: 80 }} required={categorie !== "Jeûne"} />
                    </label>
                </div>
                <div style={{ marginBottom: 10 }}>
                    <label>Note (contexte, réflexion, etc.) :
                        <input type="text" value={note} onChange={e => setNote(e.target.value)} style={{ marginLeft: 8, width: 220 }} />
                    </label>
                </div>
                <div style={{ marginBottom: 10 }}>
                    <label>Ressenti physique après le repas :
                        <input type="text" value={ressenti} onChange={e => setRessenti(e.target.value)} style={{ marginLeft: 8, width: 180 }} />
                    </label>
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
                <button type="submit" style={{ marginTop: 16 }}>Valider l’étape du défi et enregistrer le repas</button>
            </form>
        </div>
    );
}
