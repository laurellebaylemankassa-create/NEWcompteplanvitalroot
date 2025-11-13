import React, { useState } from 'react';
import NavigationPeriode from './NavigationPeriode';

export default function SaisieSeancesPlan({ planData, onRetour }) {
  const [periode, setPeriode] = useState({ monthIndex: 0, weekIndex: 0, month: null, week: null });
  const semaines = planData?.mois?.[periode.monthIndex]?.semaines || [];
  // Pour la saisie réelle, on peut initialiser un état local ou utiliser un callback parent
  // Ici, on simule juste la structure
  const [reel, setReel] = useState(
    semaines.map(s => s.actions.map(() => ({ fait: false, duree: planData.objectif?.duree_unite || 15 })))
  );

  const handleCheck = (semIdx, actIdx) => {
    setReel(reel => {
      const copy = reel.map(arr => arr.map(obj => ({ ...obj })));
      copy[semIdx][actIdx].fait = !copy[semIdx][actIdx].fait;
      return copy;
    });
  };

  return (
    <div style={{ maxWidth: 600, margin: '0 auto', background: '#fff', borderRadius: 16, boxShadow: '0 2px 16px #00bcd422', padding: '2rem 2.5rem', marginTop: 40 }}>
      <h2 style={{ color: '#1976d2', marginTop: 0, marginBottom: 18 }}>Suivi réel de mon plan</h2>
      <NavigationPeriode planData={planData} onChange={setPeriode} />
      <div style={{ fontWeight: 700, color: '#00bcd4', marginBottom: 6 }}>
        Semaine {periode.weekIndex + 1} ({semaines[periode.weekIndex]?.debut})
      </div>
      <ul style={{ margin: '6px 0 0 18px', padding: 0 }}>
        {semaines[periode.weekIndex]?.actions.map((a, j) => (
          <li key={j} style={{ marginBottom: 6, display: 'flex', alignItems: 'center' }}>
            <input type="checkbox" checked={reel[periode.weekIndex]?.[j]?.fait || false} onChange={() => handleCheck(periode.weekIndex, j)} style={{ marginRight: 8 }} />
            <span style={{ background: '#00bcd4', color: '#fff', borderRadius: 6, padding: '2px 10px', fontSize: 13, fontWeight: 700, marginRight: 6 }}>{a.jour}</span>
            {a.date} — {a.action_type}, {a.moment}
          </li>
        ))}
      </ul>
      <div style={{ marginTop: 18, textAlign: 'center' }}>
        <button onClick={onRetour} style={{ background: '#ffa726', color: '#fff', border: 'none', borderRadius: 8, padding: '10px 28px', fontWeight: 700, fontSize: 16, cursor: 'pointer', boxShadow: '0 1px 6px #00bcd422', letterSpacing: '0.5px' }}>Retour</button>
      </div>
    </div>
  );
}
