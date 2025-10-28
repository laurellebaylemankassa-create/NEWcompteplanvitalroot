import React from 'react';
import SaisieDefiAlimentaire from '../components/SaisieDefiAlimentaire';
import SaisieDefisDynamiques from '../components/SaisieDefisDynamiques';
import { useDefis } from '../components/DefisContext';

export default function DebugDefis() {
  const { defisEnCours } = useDefis();
  const defiAlimentaireActif = defisEnCours && defisEnCours.some(d => d.nom === '🧀 1 portion ça suffit');
  return (
    <div style={{ padding: 32 }}>
      <h2>Debug interface défis</h2>
      <div>
        <b>Défis en cours :</b> {defisEnCours.map(d => d.nom).join(', ') || 'Aucun'}
      </div>
      <div style={{ marginTop: 24 }}>
        {defiAlimentaireActif ? (
          <SaisieDefiAlimentaire />
        ) : (
          <SaisieDefisDynamiques />
        )}
      </div>
    </div>
  );
}
