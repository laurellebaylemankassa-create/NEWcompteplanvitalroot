import BandeauDefiActif from '../components/BandeauDefiActif';
import SaisieDefisDynamiques from '../components/SaisieDefisDynamiques';

import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { defisReferentiel } from '../lib/defisReferentiel';
import { useRouter } from 'next/router';

// Composant retour en arrière
function RetourArriere() {
    return (
        <div style={{ margin: '2rem 0 1.5rem 0', textAlign: 'center' }}>
            <button onClick={() => window.history.back()} style={{
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
                ← Retour
            </button>
        </div>
    );
}

const Defis = () => {
    // Handler pour réinitialiser un défi
    const handleReinitialiserDefi = async (defi) => {
        setActionLoading(defi.id);
        const { error: updateError } = await supabase
            .from('defis')
            .update({ progress: 0, status: 'disponible' })
            .eq('id', defi.id);
        if (updateError) {
            setError('Erreur lors de la réinitialisation du défi');
            setActionLoading(false);
            return;
        }
        // Recharger la liste des défis
        const { data: updatedData, error: reloadError } = await supabase
            .from('defis')
            .select('*');
        if (reloadError) {
            setError('Erreur lors du rechargement des défis');
            setActionLoading(false);
            return;
        }
        setDefis(updatedData);
        setActionLoading(false);
    };
    // Hooks d'état
    const [defis, setDefis] = useState([]);
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [tab, setTab] = useState('disponibles'); // onglet actif
    const [actionLoading, setActionLoading] = useState(false); // Pour feedback bouton

    // Fonction de chargement des défis (réutilisable)
    const loadDefis = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('defis')
            .select('*');
        if (error) {
            setError('Erreur lors du chargement des défis');
            setLoading(false);
            return;
        }
            // Mise à jour des noms si manquants ou incorrects
            if (data && data.length > 0) {
                for (const defi of data) {
                    const ref = defisReferentiel.find(d => d.description === defi.description);
                    if (ref && defi.nom !== ref.nom) {
                        await supabase
                            .from('defis')
                            .update({ nom: ref.nom })
                            .eq('id', defi.id);
                    }
                }
                // Recharger après mise à jour
                const { data: updatedData, error: updateError } = await supabase
                    .from('defis')
                    .select('*');
                if (updateError) {
                    setError('Erreur lors du rechargement des défis');
                    setLoading(false);
                    return;
                }
                setDefis(updatedData);
                setLoading(false);
                return;
            }
            // Si aucun défi, initialiser automatiquement
            if (!data || data.length === 0) {
                const defisToInsert = defisReferentiel.map(defi => ({
                    type: defi.type,
                    theme: defi.theme,
                    nom: defi.nom,
                    description: defi.description,
                    duree: defi.duree,
                    unite: defi.unite,
                    status: defi.status,
                    progress: defi.progress
                }));
                const { error: insertError } = await supabase
                    .from('defis')
                    .insert(defisToInsert);
                if (insertError) {
                    setError('Erreur lors de l\'initialisation des défis');
                    setLoading(false);
                    return;
                }
                // Recharger les défis après insertion
                const { data: newData, error: newError } = await supabase
                    .from('defis')
                    .select('*');
                if (newError) {
                    setError('Erreur lors du rechargement des défis');
                    setLoading(false);
                    return;
                }
                setDefis(newData);
                setLoading(false);
                return;
            }
    };

    // useEffect pour charger les défis au montage
    useEffect(() => {
        loadDefis();
    }, []);

    // Handler pour supprimer un défi personnalisé
    const handleSupprimerDefi = async (defiId) => {
        if (!window.confirm('Voulez-vous vraiment supprimer ce défi personnalisé ?')) {
            return;
        }
        
        setActionLoading(defiId);
        console.log('Suppression défi ID:', defiId);
        
        const { error: deleteError } = await supabase
            .from('defis')
            .delete()
            .eq('id', defiId);
        
        if (deleteError) {
            console.error('Erreur suppression:', deleteError);
            setError('Erreur lors de la suppression du défi');
            setActionLoading(false);
            return;
        }
        
        console.log('Défi supprimé, rechargement...');
        await loadDefis();
        setActionLoading(false);
        alert('✅ Défi supprimé avec succès !');
    };

    // Handler pour démarrer un défi
    const handleCommencerDefi = async (defiId) => {
        setActionLoading(defiId); // Pour feedback visuel
        
        // Récupérer le type de défi
        const defi = defis.find(d => d.id === defiId);
        const estDefiPersonnalise = defi?.type === 'personnalise' || defi?.type === 'alimentaire' || !defisReferentiel.find(d => d.description === defi?.description);
        
        // Si défi personnalisé : passer en cours ET ouvrir le journal
        if (estDefiPersonnalise) {
            const { error: updateError } = await supabase
                .from('defis')
                .update({ progress: 0, status: 'en cours' })
                .eq('id', defiId);
            
            if (updateError) {
                setError('Erreur lors du démarrage du défi');
                setActionLoading(false);
                return;
            }
            
            // Rediriger vers le journal
            setActionLoading(false);
            router.push(`/journal-defi/${defiId}`);
            return;
        }
        
        // Défis classiques : progress = 1 et rester sur la page
        const { error: updateError } = await supabase
            .from('defis')
            .update({ progress: 1, status: 'en cours' })
            .eq('id', defiId);
        if (updateError) {
            setError('Erreur lors du démarrage du défi');
            setActionLoading(false);
            return;
        }
        // Recharger la liste des défis
        const { data: updatedData, error: reloadError } = await supabase
            .from('defis')
            .select('*');
        if (reloadError) {
            setError('Erreur lors du rechargement des défis');
            setActionLoading(false);
            return;
        }
        setDefis(updatedData);
        setActionLoading(false);
    };

    // Handler pour incrémenter la progression d'un défi en cours
    const handleAccomplirEtape = async (defi) => {
        setActionLoading(defi.id);
        const { validerEtapeDefi } = await import('../lib/defisUtils');
        const res = await validerEtapeDefi(defi);
        if (!res.success) {
            setError(res.error || 'Erreur lors de la progression du défi');
            setActionLoading(false);
            return;
        }
        // Recharger la liste des défis
        const { data: updatedData, error: reloadError } = await supabase
            .from('defis')
            .select('*');
        if (reloadError) {
            setError('Erreur lors du rechargement des défis');
            setActionLoading(false);
            return;
        }
        setDefis(updatedData);
        setActionLoading(false);
    };

    if (loading) {
        return <div>Chargement des défis...</div>;
    }
    if (error) {
        return <div style={{ color: 'red' }}>{error}</div>;
    }

    // Filtres selon l'onglet
    const defisDisponibles = defis.filter(defi => defi.progress === 0);
    const defisEnCours = defis.filter(defi => {
        const max = defi.duree || defisReferentiel.find(d => d.description === defi.description)?.duree || 1;
        return defi.progress > 0 && defi.progress < max;
    });
    const defisTermines = defis.filter(defi => {
        const max = defi.duree || defisReferentiel.find(d => d.description === defi.description)?.duree || 1;
        return defi.progress >= max;
    });

    return (
        <div>
            <BandeauDefiActif
                defi={{ nom: "Défi test", duree: 5 }}
                progression={2}
                onOpenJournal={() => {}}
            />
            <RetourArriere />
            <h1>Mes défis</h1>
            <div style={{ display: 'flex', gap: 16, marginBottom: 24 }}>
                <button
                    onClick={() => setTab('disponibles')}
                    style={{
                        padding: '8px 24px',
                        borderRadius: 8,
                        border: tab === 'disponibles' ? '2px solid #1976d2' : '1px solid #ccc',
                        background: tab === 'disponibles' ? '#e3f2fd' : '#fff',
                        fontWeight: tab === 'disponibles' ? 700 : 400,
                        cursor: 'pointer'
                    }}
                >Défis disponibles</button>
                <button
                    onClick={() => setTab('en-cours')}
                    style={{
                        padding: '8px 24px',
                        borderRadius: 8,
                        border: tab === 'en-cours' ? '2px solid #0288d1' : '1px solid #ccc',
                        background: tab === 'en-cours' ? '#e1f5fe' : '#fff',
                        fontWeight: tab === 'en-cours' ? 700 : 400,
                        cursor: 'pointer'
                    }}
                >Défis en cours</button>
                <button
                    onClick={() => setTab('termines')}
                    style={{
                        padding: '8px 24px',
                        borderRadius: 8,
                        border: tab === 'termines' ? '2px solid #388e3c' : '1px solid #ccc',
                        background: tab === 'termines' ? '#e0ffe0' : '#fff',
                        fontWeight: tab === 'termines' ? 700 : 400,
                        cursor: 'pointer'
                    }}
                >Défis terminés</button>
                <button
                    onClick={() => setTab('creer')}
                    style={{
                        padding: '8px 24px',
                        borderRadius: 8,
                        border: tab === 'creer' ? '2px solid #9c27b0' : '1px solid #ccc',
                        background: tab === 'creer' ? '#f3e5f5' : '#fff',
                        fontWeight: tab === 'creer' ? 700 : 400,
                        cursor: 'pointer'
                    }}
                >Créer un défi</button>
            </div>
            {tab === 'disponibles' && (
                <>
                    <p>Défis que tu peux commencer à tout moment.</p>
                    <ul style={{ listStyle: 'none', padding: 0 }}>
                        {defisDisponibles.length === 0 && <li>Aucun défi disponible.</li>}
                        {defisDisponibles.map(defi => {
                            const max = defi.duree || defisReferentiel.find(d => d.description === defi.description)?.duree || 1;
                            const estDefiPersonnalise = defi.type === 'personnalise' || defi.type === 'alimentaire' || !defisReferentiel.find(d => d.description === defi.description);
                            return (
                                <li key={defi.id} style={{ marginBottom: 24, border: '1px solid #eee', borderRadius: 10, padding: 20, background: '#fff' }}>
                                    <h2 style={{ margin: 0, fontSize: 22 }}>{defi.nom}</h2>
                                    <div style={{ margin: '8px 0', color: '#1976d2', fontWeight: 600 }}>Durée : {max} {defi.unite}</div>
                                    <div style={{ marginBottom: 12, color: '#555' }}>Ce qu’il faut faire : <br /><span style={{ fontWeight: 500 }}>{defi.description}</span></div>
                                    <div style={{ marginBottom: 10, color: '#ff9800', fontWeight: 500 }}>Récompense : possibilité de débloquer un badge</div>
                                    <button
                                        style={{ marginTop: 10, padding: '8px 24px', borderRadius: 8, background: '#1976d2', color: '#fff', border: 'none', cursor: actionLoading === defi.id ? 'wait' : 'pointer', fontWeight: 700, fontSize: 16, opacity: actionLoading === defi.id ? 0.7 : 1 }}
                                        onClick={() => handleCommencerDefi(defi.id)}
                                        disabled={!!actionLoading}
                                    >
                                        {actionLoading === defi.id ? 'Démarrage...' : 'Commencer ce défi'}
                                    </button>
                                    {estDefiPersonnalise && (
                                        <button
                                            style={{ marginTop: 10, marginLeft: 10, padding: '8px 20px', borderRadius: 8, background: '#d32f2f', color: '#fff', border: 'none', cursor: actionLoading === defi.id ? 'wait' : 'pointer', fontWeight: 600, fontSize: 16, opacity: actionLoading === defi.id ? 0.7 : 1 }}
                                            onClick={() => {
                                                console.log('🗑️ Clic bouton Supprimer, defiId:', defi.id);
                                                handleSupprimerDefi(defi.id);
                                            }}
                                            disabled={!!actionLoading}
                                        >
                                            🗑️ Supprimer
                                        </button>
                                    )}
                                </li>
                            );
                        })}
                    </ul>
                </>
            )}
            {tab === 'en-cours' && (
                <>
                    <p>Voici les défis que tu as commencés. Reste motivé et progresse !</p>
                    <ul style={{ listStyle: 'none', padding: 0 }}>
                        {defisEnCours.length === 0 && <li>Aucun défi en cours.</li>}
                        {defisEnCours.map(defi => {
                            const max = defisReferentiel.find(d => d.description === defi.description)?.duree || 1;
                            return (
                                <li key={defi.id} style={{ marginBottom: 20, border: '1px solid #eee', borderRadius: 8, padding: 16, background: '#f9f9f9' }}>
                                    <h2 style={{ margin: 0, fontSize: 20 }}>{defi.nom}</h2>
                                    <div style={{ marginBottom: 8, color: '#555' }}>{defi.description}</div>
                                    <div>Type : {defi.type}</div>
                                    <div>Progression : {defi.progress} / {max}</div>
                                    <div>Status : {defi.status}</div>
                                    <div style={{ fontSize: 12, color: '#888' }}>Créé le : {new Date(defi.created_at).toLocaleDateString('fr-FR')}</div>
                                    {(defi.type === 'personnalise' || defi.type === 'alimentaire' || !defisReferentiel.find(d => d.description === defi.description)) ? (
                                        <button
                                            style={{ marginTop: 10, padding: '6px 16px', borderRadius: 6, background: '#9c27b0', color: '#fff', border: 'none', cursor: 'pointer' }}
                                            onClick={() => router.push('/journal-defi/' + defi.id)}
                                        >
                                            📔 Ouvrir le journal
                                        </button>
                                    ) : (
                                        <button
                                            style={{ marginTop: 10, padding: '6px 16px', borderRadius: 6, background: '#80cbc4', color: '#fff', border: 'none', cursor: actionLoading === defi.id ? 'wait' : 'pointer', opacity: actionLoading === defi.id ? 0.7 : 1 }}
                                            onClick={() => handleAccomplirEtape(defi)}
                                            disabled={!!actionLoading}
                                        >
                                            {actionLoading === defi.id ? 'Mise à jour...' : 'J\'ai accompli une étape'}
                                        </button>
                                    )}
                                    <button
                                        style={{ marginTop: 10, marginLeft: 10, padding: '6px 16px', borderRadius: 6, background: '#e57373', color: '#fff', border: 'none', cursor: actionLoading === defi.id ? 'wait' : 'pointer', opacity: actionLoading === defi.id ? 0.7 : 1 }}
                                        onClick={() => handleReinitialiserDefi(defi)}
                                        disabled={!!actionLoading}
                                    >
                                        {actionLoading === defi.id ? 'Réinitialisation...' : 'Réinitialiser'}
                                    </button>
                                </li>
                            );
                        })}
                    </ul>
                </>
            )}
            {tab === 'termines' && (
                <>
                    <p>Bravo pour ces défis terminés ! Tu peux en recommencer ou en choisir d’autres.</p>
                    <ul style={{ listStyle: 'none', padding: 0 }}>
                        {defisTermines.length === 0 && <li>Aucun défi terminé.</li>}
                        {defisTermines.map(defi => {
                            const max = defisReferentiel.find(d => d.description === defi.description)?.duree || 1;
                            return (
                                <li key={defi.id} style={{ marginBottom: 24, border: '1px solid #eee', borderRadius: 10, padding: 20, background: '#e0ffe0' }}>
                                    <h2 style={{ margin: 0, fontSize: 22 }}>{defi.nom}</h2>
                                    <div style={{ marginBottom: 8, color: '#555' }}>{defi.description}</div>
                                    <div>Type : {defi.type}</div>
                                    <div>Progression : {defi.progress} / {max}</div>
                                    <div>Status : {defi.status}</div>
                                    <div style={{ fontSize: 12, color: '#888' }}>Créé le : {new Date(defi.created_at).toLocaleDateString('fr-FR')}</div>
                                    <div style={{ color: '#388e3c', marginTop: 10 }}>🎉 Défi complété ! Bravo !</div>
                                    <div style={{ marginTop: 10, color: '#ff9800', fontWeight: 500, display: 'flex', alignItems: 'center', gap: 8 }}>
                                        <span>Badge débloqué !</span>
                                        <span style={{ fontSize: 24 }}>🏅</span>
                                    </div>
                                    <button
                                        style={{ marginTop: 10, padding: '6px 16px', borderRadius: 6, background: '#e57373', color: '#fff', border: 'none', cursor: actionLoading === defi.id ? 'wait' : 'pointer', opacity: actionLoading === defi.id ? 0.7 : 1 }}
                                        onClick={() => handleReinitialiserDefi(defi)}
                                        disabled={!!actionLoading}
                                    >
                                        {actionLoading === defi.id ? 'Réinitialisation...' : 'Réinitialiser'}
                                    </button>
                                </li>
                            );
                        })}
                    </ul>
                </>
            )}
            {tab === 'creer' && (
                <>
                    <p>Créez vos propres défis personnalisés et suivez-les au quotidien.</p>
                    <SaisieDefisDynamiques refreshDefis={loadDefis} />
                </>
            )}
        </div>
    );
};

export default Defis;