import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';

const DefisContext = createContext();

export function useDefis() {
    return useContext(DefisContext);
}

export function DefisProvider({ children }) {
    const [defis, setDefis] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        async function fetchDefis() {
            setLoading(true);
            const { data, error } = await supabase
                .from('defis')
                .select('*');
            if (error) {
                setError('Erreur lors du chargement des défis');
                setLoading(false);
                return;
            }
            setDefis(data || []);
            setLoading(false);
        }
        fetchDefis();
    }, []);

    // Pour forcer le rafraîchissement depuis n'importe où
    const refreshDefis = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('defis')
            .select('*');
        if (error) {
            setError('Erreur lors du chargement des défis');
            setLoading(false);
            return;
        }
        setDefis(data || []);
        setLoading(false);
    };

    // Défis en cours (status = 'en cours')
    const defisEnCours = defis.filter(defi => defi.status === 'en cours');

    return (
        <DefisContext.Provider value={{ defis, defisEnCours, loading, error, refreshDefis }}>
            {children}
        </DefisContext.Provider>
    );
}
