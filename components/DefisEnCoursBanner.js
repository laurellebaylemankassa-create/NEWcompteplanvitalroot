import React from 'react';
import { useDefis } from './DefisContext';

export default function DefisEnCoursBanner() {
    const { defisEnCours, loading } = useDefis();
    if (loading || !defisEnCours.length) return null;
    return (
        <div style={{ background: '#e3f2fd', padding: '10px 20px', borderRadius: 8, margin: '16px 0', boxShadow: '0 1px 4px #e0e0e0' }}>
            <strong>Défis en cours :</strong>
            <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'inline' }}>
                {defisEnCours.map(defi => (
                    <li key={defi.id} style={{ display: 'inline', marginRight: 24 }}>
                        <span style={{ fontWeight: 600 }}>{defi.nom}</span> :
                        <span style={{ marginLeft: 6 }}>{defi.progress} / {defi.duree || '?'} {defi.unite || ''}</span>
                    </li>
                ))}
            </ul>
        </div>
    );
}
