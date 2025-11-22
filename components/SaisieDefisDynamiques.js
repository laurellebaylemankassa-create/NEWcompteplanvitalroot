// Défi 2 : Je suis plus fort·e que mes excuses (validation par repas, confirmation résistance à la compensation)
function DefiExcuses({ defi, refreshDefis }) {
    const [confirmation, setConfirmation] = useState(false);
    const [message, setMessage] = useState('');
    const [erreur, setErreur] = useState('');
    const [typeRepas, setTypeRepas] = useState('Déjeuner');
    const getDefaultHeure = () => {
        const now = new Date();
        return now.toTimeString().slice(0,5);
    };
    const [heureRepas, setHeureRepas] = useState(getDefaultHeure());
    if (!defi) return null;
    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage(''); setErreur('');
        if (!confirmation) {
            setErreur('Merci de confirmer que tu as résisté à l’envie de compenser.');
            return;
        }
        const { validerEtapeDefi } = await import('../lib/defisUtils');
        const res = await validerEtapeDefi(defi);
        if (res.success) {
            setMessage('Bravo ! Étape validée.');
            refreshDefis();
            setConfirmation(false);
        } else {
            setErreur(res.error || 'Erreur lors de la validation.');
        }
    };
    return (
        <form onSubmit={handleSubmit} style={{marginBottom:24, background:'#f3e5f5', borderRadius:10, padding:18}}>
            <h3>{defi.nom}</h3>
            <p>{defi.description}</p>
            <div>
                <label>Type de repas :
                    <select value={typeRepas} onChange={e => setTypeRepas(e.target.value)} style={{marginLeft:8}}>
                        <option>Petit-déjeuner</option>
                        <option>Déjeuner</option>
                        <option>Collation</option>
                        <option>Dîner</option>
                        <option>Autre</option>
                    </select>
                </label>
            </div>
            <div style={{ margin: '8px 0' }}>
                Heure de prise du repas (optionnel) :
                <input
                    type="time"
                    value={heureRepas}
                    onChange={e => setHeureRepas(e.target.value)}
                    style={{ marginLeft: 8, width: 110 }}
                />
                <span style={{ color: '#888', fontSize: 13, marginLeft: 8 }}>(pré-rempli à l'heure actuelle, modifiable)</span>
            </div>
            <div style={{marginTop:8}}>
                <label>
                    <input type="checkbox" checked={confirmation} onChange={e => setConfirmation(e.target.checked)} />
                    J’ai résisté à l’envie de compenser à ce repas
                </label>
            </div>
            {erreur && <p style={{color:'red'}}>{erreur}</p>}
            {message && <p style={{color:'green'}}>{message}</p>}
            <button type="submit">Valider l’étape</button>
        </form>
    );
}

// Défi 5 : Le faux allié (validation par jour, confirmation aucune compensation par aliment gras)
function DefiFauxAllie({ defi, refreshDefis }) {
    const [confirmation, setConfirmation] = useState(false);
    const [message, setMessage] = useState('');
    const [erreur, setErreur] = useState('');
    const [date, setDate] = useState(new Date().toISOString().slice(0,10));
    const getDefaultHeure = () => {
        const now = new Date();
        return now.toTimeString().slice(0,5);
    };
    const [heureRepas, setHeureRepas] = useState(getDefaultHeure());
    const [aliment, setAliment] = useState('');
    const [categorie, setCategorie] = useState('');
    const [kcal, setKcal] = useState('');
    // Import du référentiel alimentaire
    const referentielAliments = require('../data/referentiel.js').default || [];
    // Suggestions d’aliments
    const alimentsFromReferentiel = Array.from(new Set(referentielAliments.map(a => a.nom).filter(Boolean)));
    // Auto-remplissage catégorie/kcal/portion
    React.useEffect(() => {
        if (!aliment || aliment.trim() === '') return;
        const found = referentielAliments.find(a => a.nom.toLowerCase() === aliment.trim().toLowerCase());
        if (found) {
            if (found.categorie) setCategorie(found.categorie);
            if (found.kcal !== undefined && found.kcal !== null) setKcal(String(found.kcal));
            if (found.portionDefaut) setQuantite(found.portionDefaut);
        }
    }, [aliment]);
    if (!defi) return null;
    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage(''); setErreur('');
        if (!aliment.trim()) {
            setErreur('Merci de saisir un aliment.');
            return;
        }
        if (!confirmation) {
            setErreur('Merci de confirmer qu’aucun aliment gras n’a été pris pour compenser un extra.');
            return;
        }
        const { validerEtapeDefi } = await import('../lib/defisUtils');
        const res = await validerEtapeDefi(defi);
        if (res.success) {
            setMessage('Bravo ! Étape validée.');
            refreshDefis();
            setConfirmation(false);
            setAliment('');
            setCategorie('');
            setKcal('');
        } else {
            setErreur(res.error || 'Erreur lors de la validation.');
        }
    };
    return (
        <form onSubmit={handleSubmit} style={{marginBottom:24, background:'#ffebee', borderRadius:10, padding:18}}>
            <h3>{defi.nom}</h3>
            <p>{defi.description}</p>
            <div style={{ marginBottom: 10 }}>
                <label>Aliment :
                    <input list="alimentOptions" type="text" value={aliment} onChange={e => setAliment(e.target.value)} style={{ marginLeft: 8 }} />
                    <datalist id="alimentOptions">
                        {alimentsFromReferentiel.map(opt => <option key={opt} value={opt} />)}
                    </datalist>
                </label>
            </div>
            <div style={{ marginBottom: 10 }}>
                <label>Catégorie :
                    <input type="text" value={categorie} onChange={e => setCategorie(e.target.value)} style={{ marginLeft: 8 }} />
                </label>
            </div>
            <div style={{ marginBottom: 10 }}>
                <label>Kcal :
                    <input type="number" value={kcal} onChange={e => setKcal(e.target.value)} style={{ marginLeft: 8, width: 80 }} />
                </label>
            </div>
            <div style={{ margin: '8px 0' }}>
                Heure de prise du repas (optionnel) :
                <input
                    type="time"
                    value={heureRepas}
                    onChange={e => setHeureRepas(e.target.value)}
                    style={{ marginLeft: 8, width: 110 }}
                />
                <span style={{ color: '#888', fontSize: 13, marginLeft: 8 }}>(pré-rempli à l'heure actuelle, modifiable)</span>
            </div>
            <div style={{marginTop:8}}>
                <label>
                    <input type="checkbox" checked={confirmation} onChange={e => setConfirmation(e.target.checked)} />
                    Aucun aliment gras n’a été pris pour compenser un extra aujourd’hui
                </label>
            </div>
            {erreur && <p style={{color:'red'}}>{erreur}</p>}
            {message && <p style={{color:'green'}}>{message}</p>}
            <button type="submit">Valider l’étape</button>
        </form>
    );
}

// Défi 7 : Je brise la chaîne (validation par jour, confirmation pas d’enchaînement sucre-gras)
function DefiBriseChaine({ defi, refreshDefis }) {
    const [confirmation, setConfirmation] = useState(false);
    const [message, setMessage] = useState('');
    const [erreur, setErreur] = useState('');
    const [date, setDate] = useState(new Date().toISOString().slice(0,10));
    const getDefaultHeure = () => {
        const now = new Date();
        return now.toTimeString().slice(0,5);
    };
    const [heureRepas, setHeureRepas] = useState(getDefaultHeure());
    const [aliment, setAliment] = useState('');
    const [categorie, setCategorie] = useState('');
    const [kcal, setKcal] = useState('');
    // Import du référentiel alimentaire
    const referentielAliments = require('../data/referentiel.js').default || [];
    const alimentsFromReferentiel = Array.from(new Set(referentielAliments.map(a => a.nom).filter(Boolean)));
    React.useEffect(() => {
        if (!aliment || aliment.trim() === '') return;
        const found = referentielAliments.find(a => a.nom.toLowerCase() === aliment.trim().toLowerCase());
        if (found) {
            if (found.categorie) setCategorie(found.categorie);
            if (found.kcal !== undefined && found.kcal !== null) setKcal(String(found.kcal));
            if (found.portionDefaut) setQuantite(found.portionDefaut);
        }
    }, [aliment]);
    if (!defi) return null;
    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage(''); setErreur('');
        if (!aliment.trim()) {
            setErreur('Merci de saisir un aliment.');
            return;
        }
        if (!confirmation) {
            setErreur('Merci de confirmer qu’aucun enchaînement sucre-gras n’a eu lieu aujourd’hui.');
            return;
        }
        const { validerEtapeDefi } = await import('../lib/defisUtils');
        const res = await validerEtapeDefi(defi);
        if (res.success) {
            setMessage('Bravo ! Étape validée.');
            refreshDefis();
            setConfirmation(false);
            setAliment('');
            setCategorie('');
            setKcal('');
        } else {
            setErreur(res.error || 'Erreur lors de la validation.');
        }
    };
    return (
        <form onSubmit={handleSubmit} style={{marginBottom:24, background:'#e1f5fe', borderRadius:10, padding:18}}>
            <h3>{defi.nom}</h3>
            <p>{defi.description}</p>
            <div style={{ marginBottom: 10 }}>
                <label>Aliment :
                    <input list="alimentOptionsChaine" type="text" value={aliment} onChange={e => setAliment(e.target.value)} style={{ marginLeft: 8 }} />
                    <datalist id="alimentOptionsChaine">
                        {alimentsFromReferentiel.map(opt => <option key={opt} value={opt} />)}
                    </datalist>
                </label>
            </div>
            <div style={{ marginBottom: 10 }}>
                <label>Catégorie :
                    <input type="text" value={categorie} onChange={e => setCategorie(e.target.value)} style={{ marginLeft: 8 }} />
                </label>
            </div>
            <div style={{ marginBottom: 10 }}>
                <label>Kcal :
                    <input type="number" value={kcal} onChange={e => setKcal(e.target.value)} style={{ marginLeft: 8, width: 80 }} />
                </label>
            </div>
            <div>
                <label>
                    <input type="checkbox" checked={confirmation} onChange={e => setConfirmation(e.target.checked)} />
                    Aucun enchaînement sucre-gras aujourd’hui
                </label>
            </div>
            <div style={{ margin: '8px 0' }}>
                Heure de prise du repas (optionnel) :
                <input
                    type="time"
                    value={heureRepas}
                    onChange={e => setHeureRepas(e.target.value)}
                    style={{ marginLeft: 8, width: 110 }}
                />
                <span style={{ color: '#888', fontSize: 13, marginLeft: 8 }}>(pré-rempli à l'heure actuelle, modifiable)</span>
            </div>
            {erreur && <p style={{color:'red'}}>{erreur}</p>}
            {message && <p style={{color:'green'}}>{message}</p>}
            <button type="submit">Valider l’étape</button>
        </form>
    );
}

// Défi 8 : 1 vraie faim = 1 vrai repas (validation par envie, confirmation vérification de la faim)
function DefiVraieFaim({ defi, refreshDefis }) {
    const [confirmation, setConfirmation] = useState(false);
    const [message, setMessage] = useState('');
    const [erreur, setErreur] = useState('');
    if (!defi) return null;
    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage(''); setErreur('');
        if (!confirmation) {
            setErreur('Merci de confirmer que tu as vérifié la vraie faim.');
            return;
        }
        const { validerEtapeDefi } = await import('../lib/defisUtils');
        const res = await validerEtapeDefi(defi);
        if (res.success) {
            setMessage('Bravo ! Étape validée.');
            refreshDefis();
            setConfirmation(false);
        } else {
            setErreur(res.error || 'Erreur lors de la validation.');
        }
    };
    return (
        <form onSubmit={handleSubmit} style={{marginBottom:24, background:'#fff3e0', borderRadius:10, padding:18}}>
            <h3>{defi.nom}</h3>
            <p>{defi.description}</p>
            <div>
                <label>
                    <input type="checkbox" checked={confirmation} onChange={e => setConfirmation(e.target.checked)} />
                    J’ai vérifié que la faim était réelle avant de manger
                </label>
            </div>
            {erreur && <p style={{color:'red'}}>{erreur}</p>}
            {message && <p style={{color:'green'}}>{message}</p>}
            <button type="submit">Valider l’étape</button>
        </form>
    );
}

// Défi 9 : Je me programme du plaisir (validation unique, confirmation extra planifié)
function DefiPlaisir({ defi, refreshDefis }) {
    const [confirmation, setConfirmation] = useState(false);
    const [message, setMessage] = useState('');
    const [erreur, setErreur] = useState('');
    if (!defi) return null;
    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage(''); setErreur('');
        if (!confirmation) {
            setErreur('Merci de confirmer que tu as planifié et profité de ton extra.');
            return;
        }
        const { validerEtapeDefi } = await import('../lib/defisUtils');
        const res = await validerEtapeDefi(defi);
        if (res.success) {
            setMessage('Bravo ! Étape validée.');
            refreshDefis();
            setConfirmation(false);
        } else {
            setErreur(res.error || 'Erreur lors de la validation.');
        }
    };
    return (
        <form onSubmit={handleSubmit} style={{marginBottom:24, background:'#fce4ec', borderRadius:10, padding:18}}>
            <h3>{defi.nom}</h3>
            <p>{defi.description}</p>
            <div>
                <label>
                    <input type="checkbox" checked={confirmation} onChange={e => setConfirmation(e.target.checked)} />
                    J’ai planifié et profité de mon extra sans culpabilité
                </label>
            </div>
            {erreur && <p style={{color:'red'}}>{erreur}</p>}
            {message && <p style={{color:'green'}}>{message}</p>}
            <button type="submit">Valider l’étape</button>
        </form>
    );
}

// Défi 10 : 1 cru par jour (validation par jour, confirmation aliment cru ajouté)
function DefiUnCru({ defi, refreshDefis }) {
    const [confirmation, setConfirmation] = useState(false);
    const [message, setMessage] = useState('');
    const [erreur, setErreur] = useState('');
    const [aliment, setAliment] = useState('');
    const [categorie, setCategorie] = useState('');
    const [kcal, setKcal] = useState('');
    // Import du référentiel alimentaire
    const referentielAliments = require('../data/referentiel.js').default || [];
    const alimentsFromReferentiel = Array.from(new Set(referentielAliments.map(a => a.nom).filter(Boolean)));
    React.useEffect(() => {
        if (!aliment || aliment.trim() === '') return;
        const found = referentielAliments.find(a => a.nom.toLowerCase() === aliment.trim().toLowerCase());
        if (found) {
            if (found.categorie) setCategorie(found.categorie);
            if (found.kcal !== undefined && found.kcal !== null) setKcal(String(found.kcal));
            if (found.portionDefaut) setQuantite(found.portionDefaut);
        }
    }, [aliment]);
    if (!defi) return null;
    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage(''); setErreur('');
        if (!aliment) {
            setErreur('Merci de préciser l’aliment cru ajouté.');
            return;
        }
        if (!confirmation) {
            setErreur('Merci de confirmer que l’aliment était cru et non sucré.');
            return;
        }
        const { validerEtapeDefi } = await import('../lib/defisUtils');
        const res = await validerEtapeDefi(defi);
        if (res.success) {
            setMessage('Bravo ! Étape validée.');
            refreshDefis();
            setConfirmation(false);
            setAliment('');
            setCategorie('');
            setKcal('');
        } else {
            setErreur(res.error || 'Erreur lors de la validation.');
        }
    };
    return (
        <form onSubmit={handleSubmit} style={{marginBottom:24, background:'#e0f7fa', borderRadius:10, padding:18}}>
            <h3>{defi.nom}</h3>
            <p>{defi.description}</p>
            <div style={{ marginBottom: 10 }}>
                <label>Aliment :
                    <input list="alimentOptionsCru" type="text" value={aliment} onChange={e => setAliment(e.target.value)} style={{marginRight:8}} />
                    <datalist id="alimentOptionsCru">
                        {alimentsFromReferentiel.map(opt => <option key={opt} value={opt} />)}
                    </datalist>
                </label>
            </div>
            <div style={{ marginBottom: 10 }}>
                <label>Catégorie :
                    <input type="text" value={categorie} onChange={e => setCategorie(e.target.value)} style={{ marginLeft: 8 }} />
                </label>
            </div>
            <div style={{ marginBottom: 10 }}>
                <label>Kcal :
                    <input type="number" value={kcal} onChange={e => setKcal(e.target.value)} style={{ marginLeft: 8, width: 80 }} />
                </label>
            </div>
            <div>
                <label>
                    <input type="checkbox" checked={confirmation} onChange={e => setConfirmation(e.target.checked)} />
                    Aliment cru et non sucré ajouté aujourd’hui
                </label>
            </div>
            {erreur && <p style={{color:'red'}}>{erreur}</p>}
            {message && <p style={{color:'green'}}>{message}</p>}
            <button type="submit">Valider l’étape</button>
        </form>
    );
}
import React, { useState } from 'react';
import { useDefis } from './DefisContext';
import { defisReferentiel } from '../lib/defisReferentiel';
import { supabase } from '../lib/supabaseClient';

// Note : supabase importé pour l'enregistrement des défis personnalisés

// Sous-formulaires pour chaque défi (logique spécifique)
function DefiPasDeDessert({ defi, refreshDefis }) {
    const [confirmation, setConfirmation] = useState(false);
    const [message, setMessage] = useState('');
    const [erreur, setErreur] = useState('');
    const [date, setDate] = useState(new Date().toISOString().slice(0,10));
    if (!defi) return null;
    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage(''); setErreur('');
        if (!confirmation) {
            setErreur('Merci de confirmer que tu as terminé ton déjeuner sans dessert.');
            return;
        }
        const { validerEtapeDefi } = await import('../lib/defisUtils');
        const res = await validerEtapeDefi(defi);
        if (res.success) {
            setMessage('Bravo ! Étape validée.');
            refreshDefis();
            setConfirmation(false);
        } else {
            setErreur(res.error || 'Erreur lors de la validation.');
        }
    };
    return (
        <form onSubmit={handleSubmit} style={{marginBottom:24, background:'#e3f2fd', borderRadius:10, padding:18}}>
            <h3>{defi.nom}</h3>
            <p>{defi.description}</p>
            <div>
                <label>
                    <input type="checkbox" checked={confirmation} onChange={e => setConfirmation(e.target.checked)} />
                    J’ai terminé mon déjeuner sans dessert aujourd’hui
                </label>
            </div>
            {erreur && <p style={{color:'red'}}>{erreur}</p>}
            {message && <p style={{color:'green'}}>{message}</p>}
            <button type="submit">Valider l’étape</button>
        </form>
    );
}


// Défi 4 : J’écoute mon ventre (validation par repas, confirmation satiété)
function DefiEcouteVentre({ defi, refreshDefis }) {
    const [confirmation, setConfirmation] = useState(false);
    const [message, setMessage] = useState('');
    const [erreur, setErreur] = useState('');
    const [typeRepas, setTypeRepas] = useState('Déjeuner');
    const getDefaultHeure = () => {
        const now = new Date();
        return now.toTimeString().slice(0,5);
    };
    const [heureRepas, setHeureRepas] = useState(getDefaultHeure());
    if (!defi) return null;
    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage(''); setErreur('');
        if (!confirmation) {
            setErreur('Merci de confirmer que tu t’es arrêté dès la satiété.');
            return;
        }
        const { validerEtapeDefi } = await import('../lib/defisUtils');
        const res = await validerEtapeDefi(defi);
        if (res.success) {
            setMessage('Bravo ! Étape validée.');
            refreshDefis();
            setConfirmation(false);
        } else {
            setErreur(res.error || 'Erreur lors de la validation.');
        }
    };
    return (
        <form onSubmit={handleSubmit} style={{marginBottom:24, background:'#e8f5e9', borderRadius:10, padding:18}}>
            <h3>{defi.nom}</h3>
            <p>{defi.description}</p>
            <div>
                <label>Type de repas :
                    <select value={typeRepas} onChange={e => setTypeRepas(e.target.value)} style={{marginLeft:8}}>
                        <option>Petit-déjeuner</option>
                        <option>Déjeuner</option>
                        <option>Collation</option>
                        <option>Dîner</option>
                        <option>Autre</option>
                    </select>
                </label>
            </div>
            <div style={{ margin: '8px 0' }}>
                Heure de prise du repas (optionnel) :
                <input
                    type="time"
                    value={heureRepas}
                    onChange={e => setHeureRepas(e.target.value)}
                    style={{ marginLeft: 8, width: 110 }}
                />
                <span style={{ color: '#888', fontSize: 13, marginLeft: 8 }}>(pré-rempli à l'heure actuelle, modifiable)</span>
            </div>
            <div style={{marginTop:8}}>
                <label>
                    <input type="checkbox" checked={confirmation} onChange={e => setConfirmation(e.target.checked)} />
                    Je me suis arrêté dès la satiété à ce repas
                </label>
            </div>
            {erreur && <p style={{color:'red'}}>{erreur}</p>}
            {message && <p style={{color:'green'}}>{message}</p>}
            <button type="submit">Valider l’étape</button>
        </form>
    );
}

// Défi 6 : Chaud devant… mais doux ! (validation par dîner, choix cuisson)
function DefiChaudDoux({ defi, refreshDefis }) {
    const [cuisson, setCuisson] = useState('vapeur');
    const [confirmation, setConfirmation] = useState(false);
    const [message, setMessage] = useState('');
    const [erreur, setErreur] = useState('');
    const getDefaultHeure = () => {
        const now = new Date();
        return now.toTimeString().slice(0,5);
    };
    const [heureRepas, setHeureRepas] = useState(getDefaultHeure());
    if (!defi) return null;
    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage(''); setErreur('');
        if (!confirmation) {
            setErreur('Merci de confirmer que tu as choisi une cuisson douce.');
            return;
        }
        const { validerEtapeDefi } = await import('../lib/defisUtils');
        const res = await validerEtapeDefi(defi);
        if (res.success) {
            setMessage('Bravo ! Étape validée.');
            refreshDefis();
            setConfirmation(false);
        } else {
            setErreur(res.error || 'Erreur lors de la validation.');
        }
    };
    return (
        <form onSubmit={handleSubmit} style={{marginBottom:24, background:'#fffde7', borderRadius:10, padding:18}}>
            <h3>{defi.nom}</h3>
            <p>{defi.description}</p>
            <div>
                <label>Mode de cuisson :
                    <select value={cuisson} onChange={e => setCuisson(e.target.value)} style={{marginLeft:8}}>
                        <option value="vapeur">Vapeur</option>
                        <option value="mijoté">Mijoté</option>
                        <option value="cru">Cru</option>
                        <option value="autre">Autre</option>
                    </select>
                </label>
            </div>
            <div style={{ margin: '8px 0' }}>
                Heure de prise du repas (optionnel) :
                <input
                    type="time"
                    value={heureRepas}
                    onChange={e => setHeureRepas(e.target.value)}
                    style={{ marginLeft: 8, width: 110 }}
                />
                <span style={{ color: '#888', fontSize: 13, marginLeft: 8 }}>(pré-rempli à l'heure actuelle, modifiable)</span>
            </div>
            <div style={{marginTop:8}}>
                <label>
                    <input type="checkbox" checked={confirmation} onChange={e => setConfirmation(e.target.checked)} />
                    J’ai choisi une cuisson douce pour ce dîner
                </label>
            </div>
            {erreur && <p style={{color:'red'}}>{erreur}</p>}
            {message && <p style={{color:'green'}}>{message}</p>}
            <button type="submit">Valider l’étape</button>
        </form>
    );
}

export default function SaisieDefisDynamiques() {
    const { defisEnCours, refreshDefis } = useDefis();
    // Hooks pour le formulaire personnalisé
    const [showForm, setShowForm] = useState(false);
    const [nom, setNom] = useState('');
    const [description, setDescription] = useState('');
    const [type, setType] = useState('alimentaire');
    const [theme, setTheme] = useState('');
    const [duree, setDuree] = useState('');
    const [unite, setUnite] = useState('jour');
    const [criteres, setCriteres] = useState('');
    const [recurrence, setRecurrence] = useState('unique');
    const [erreur, setErreur] = useState('');
    const [message, setMessage] = useState('');

    // Validation simple
    const isValid = nom.trim() && description.trim() && duree.trim();

    // Handler d'enregistrement avec insertion Supabase
    const handleSave = async (e) => {
        e.preventDefault();
        setErreur(''); setMessage('');
        if (!isValid) {
            setErreur('Merci de remplir tous les champs obligatoires.');
            return;
        }

        // Insertion dans Supabase
        const { data, error: insertError } = await supabase
            .from('defis')
            .insert([{
                type: type || 'personnalise',
                theme: theme || 'Défi perso',
                nom,
                description,
                duree: parseInt(duree, 10),
                unite: unite || 'jour',
                status: 'disponible',
                progress: 0
            }]);

        if (insertError) {
            console.error('Erreur insertion défi :', insertError.message);
            setErreur(`❌ Erreur : ${insertError.message}`);
            return;
        }

        setMessage('✅ Défi personnalisé créé avec succès !');
        await refreshDefis();

        // Réinitialisation après 2 secondes
        setTimeout(() => {
            setNom('');
            setDescription('');
            setType('alimentaire');
            setTheme('');
            setDuree('');
            setUnite('jour');
            setCriteres('');
            setRecurrence('unique');
            setMessage('');
            setShowForm(false);
        }, 2000);
    };

    return (
        <div style={{margin:'24px 0'}}>
            <button onClick={() => setShowForm(v => !v)} style={{marginBottom:16, background:'#1976d2', color:'#fff', border:'none', borderRadius:6, padding:'8px 18px', fontWeight:600}}>
                {showForm ? 'Annuler' : 'Créer un défi personnalisé'}
            </button>
            {showForm && (
                <form onSubmit={handleSave} style={{background:'#f5f5f5', borderRadius:10, padding:18, marginBottom:24, boxShadow:'0 2px 8px #0001'}}>
                    <h3>Créer un défi personnalisé</h3>
                    <div style={{marginBottom:10}}>
                        <label>Nom du défi* :
                            <input type="text" value={nom} onChange={e => setNom(e.target.value)} style={{marginLeft:8, width:220}} required />
                        </label>
                    </div>
                    <div style={{marginBottom:10}}>
                        <label>Description* :<br/>
                            <textarea value={description} onChange={e => setDescription(e.target.value)} style={{marginTop:4, width:320, minHeight:60}} required />
                        </label>
                    </div>
                    <div style={{marginBottom:10}}>
                        <label>Type :
                            <select value={type} onChange={e => setType(e.target.value)} style={{marginLeft:8}}>
                                <option value="alimentaire">Alimentaire</option>
                                <option value="activité">Activité</option>
                                <option value="autre">Autre</option>
                            </select>
                        </label>
                    </div>
                    <div style={{marginBottom:10}}>
                        <label>Thème :
                            <input type="text" value={theme} onChange={e => setTheme(e.target.value)} style={{marginLeft:8, width:180}} />
                        </label>
                    </div>
                    <div style={{marginBottom:10}}>
                        <label>Durée :
                            <input type="number" value={duree} onChange={e => setDuree(e.target.value)} style={{marginLeft:8, width:80}} min={0} />
                        </label>
                        <label style={{marginLeft:16}}>Unité :
                            <select value={unite} onChange={e => setUnite(e.target.value)} style={{marginLeft:8}}>
                                <option value="jour">Jour</option>
                                <option value="semaine">Semaine</option>
                                <option value="portion">Portion</option>
                                <option value="minute">Minute</option>
                                <option value="autre">Autre</option>
                            </select>
                        </label>
                    </div>
                    <div style={{marginBottom:10}}>
                        <label>Critères de validation :
                            <input type="text" value={criteres} onChange={e => setCriteres(e.target.value)} style={{marginLeft:8, width:220}} placeholder="aliment, catégorie, kcal, portion…" />
                        </label>
                    </div>
                    <div style={{marginBottom:10}}>
                        <label>Récurrence :
                            <select value={recurrence} onChange={e => setRecurrence(e.target.value)} style={{marginLeft:8}}>
                                <option value="unique">Unique</option>
                                <option value="quotidien">Quotidien</option>
                                <option value="hebdomadaire">Hebdomadaire</option>
                            </select>
                        </label>
                    </div>
                    {erreur && <p style={{color:'red'}}>{erreur}</p>}
                    {message && <p style={{color:'green'}}>{message}</p>}
                    <button type="submit" style={{background:'#388e3c', color:'#fff', border:'none', borderRadius:6, padding:'8px 18px', fontWeight:600, marginTop:8}}>
                        Enregistrer le défi
                    </button>
                </form>
            )}
        </div>
    );
}