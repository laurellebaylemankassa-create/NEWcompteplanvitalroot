import React from 'react';

const TimelineProgressionPreparation = ({ criteres, progression, onValider }) => {
  return (
    <div style={{ background: '#fff', borderRadius: 12, boxShadow: '0 1px 6px #e0e0e0', padding: '1.5rem 1.2rem', marginBottom: 18 }}>
      <h3 style={{ color: '#1976d2', fontWeight: 700, fontSize: '1.1rem', marginBottom: 10 }}>Timeline de préparation</h3>
      <div style={{ marginBottom: 12 }}>
        <strong style={{ color: '#388e3c' }}>Progression globale :</strong> <span style={{ color: '#1976d2', fontWeight: 700 }}>{progression}/{criteres.length} critères validés</span>
        <div style={{ background: '#e3f2fd', borderRadius: 8, height: 12, marginTop: 6, marginBottom: 8, width: '100%' }}>
          <div style={{ background: '#1976d2', height: 12, borderRadius: 8, width: `${(progression/criteres.length)*100}%`, transition: 'width 0.4s' }}></div>
        </div>
      </div>
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {criteres.map((critere) => (
          <li key={critere.id} style={{ marginBottom: 16, borderBottom: '1px solid #eee', paddingBottom: 8 }}>
            <div style={{ fontWeight: 600, color: '#1976d2' }}>{critere.label}</div>
            <div style={{ fontSize: '0.98rem', color: '#444', marginBottom: 4 }}>{critere.description}</div>
            <div style={{ fontSize: '0.95rem', color: '#888' }}>Jalon : J-{critere.jalon}</div>
            <div style={{ marginTop: 6 }}>
              {critere.valide ? (
                <span style={{ color: '#388e3c', fontWeight: 700 }}>✅ Validé</span>
              ) : (
                <button onClick={() => onValider(critere.id)} style={{ background: '#1976d2', color: '#fff', border: 'none', borderRadius: 6, padding: '6px 18px', fontWeight: 600, cursor: 'pointer' }}>
                  Valider ce critère
                </button>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default TimelineProgressionPreparation;
