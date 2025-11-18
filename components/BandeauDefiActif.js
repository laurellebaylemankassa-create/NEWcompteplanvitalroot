import React from 'react';

// Bandeau affichant le défi actif, la progression, un message et un bouton pour le journal de bord
export default function BandeauDefiActif({ defi, progression, onOpenJournal }) {
  return (
    <div style={{ background: '#e3f2fd', padding: 16, borderRadius: 10, marginBottom: 16 }}>
      <h2 style={{ margin: 0 }}>{defi ? defi.nom : 'Défi en cours'}</h2>
      <div>Progression : {progression || 0} / {defi ? defi.duree : '?'}</div>
      <div style={{ margin: '8px 0', color: '#1976d2' }}>Reste motivé, tu es sur la bonne voie !</div>
      <button onClick={onOpenJournal} style={{ padding: '6px 16px', borderRadius: 6, background: '#1976d2', color: '#fff', border: 'none', fontWeight: 700 }}>
        Ouvrir le journal de bord
      </button>
    </div>
  );
}
