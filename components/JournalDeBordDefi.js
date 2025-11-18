import React from 'react';

// Journal de bord pour saisir une note et afficher l'historique
export default function JournalDeBordDefi({ defi, journal, onAddNote }) {
  const [note, setNote] = React.useState('');
  return (
    <div style={{ background: '#f9fbe7', padding: 16, borderRadius: 10, marginBottom: 16 }}>
      <h3>Journal de bord du défi</h3>
      <div style={{ marginBottom: 8 }}>
        <textarea
          value={note}
          onChange={e => setNote(e.target.value)}
          placeholder="Note ton ressenti, une difficulté, un succès..."
          rows={3}
          style={{ width: '100%', borderRadius: 6, padding: 8 }}
        />
      </div>
      <button onClick={() => { onAddNote(note); setNote(''); }} style={{ padding: '6px 16px', borderRadius: 6, background: '#388e3c', color: '#fff', border: 'none', fontWeight: 700 }}>
        Ajouter la note
      </button>
      <div style={{ marginTop: 16 }}>
        <h4>Historique des notes</h4>
        <ul style={{ paddingLeft: 20 }}>
          {(journal && journal[defi?.id]) ? journal[defi.id].map((n, i) => (
            <li key={i}>{n}</li>
          )) : <li>Aucune note pour ce défi.</li>}
        </ul>
      </div>
    </div>
  );
}
