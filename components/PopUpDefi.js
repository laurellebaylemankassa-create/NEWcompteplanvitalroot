import React from 'react';

// Pop-up d'animation/message pour le défi (démarrage, étape, réussite)
export default function PopUpDefi({ type, defi, onClose }) {
  let message = '';
  if (type === 'start') message = `Défi "${defi?.nom}" démarré ! Bonne chance !`;
  else if (type === 'step') message = `Bravo pour cette étape du défi "${defi?.nom}" !`;
  else if (type === 'success') message = `Défi "${defi?.nom}" terminé ! Félicitations !`;
  return (
    <div style={{ position: 'fixed', top: 40, left: 0, right: 0, margin: 'auto', background: '#fffde7', border: '2px solid #1976d2', borderRadius: 12, padding: 24, zIndex: 1000, textAlign: 'center', boxShadow: '0 2px 12px #bbb' }}>
      <div style={{ fontSize: 22, fontWeight: 700 }}>{message}</div>
      <button onClick={onClose} style={{ marginTop: 16, padding: '6px 16px', borderRadius: 6, background: '#1976d2', color: '#fff', border: 'none', fontWeight: 700 }}>
        Fermer
      </button>
    </div>
  );
}
