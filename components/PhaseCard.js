import React from 'react';

/**
 * PhaseCard — Composant dynamique
 * Affiche une phase de préparation, son titre, sa période, et ses critères.
 * Props :
 *   - phase (object) : { nom, explication, periode, criteres }
 *   - criteres (array) : [{ id, titre, conseil, jalon, valide, dateValidation }]
 *   - onValider (function) : callback pour valider un critère (optionnel)
 */
export default function PhaseCard({ phase, criteres = [], onValider }) {
  return (
    <section
      style={{
        background: '#fff',
        borderRadius: 16,
        padding: '28px 24px 18px 24px',
        marginBottom: 28,
        boxShadow: '0 2px 16px 0 rgba(79,143,255,0.07)',
        border: '1px solid #E3EAF2',
        maxWidth: 700,
        marginLeft: 'auto',
        marginRight: 'auto',
      }}
    >
      <h2
        style={{
          color: '#4F8FFF',
          fontWeight: 800,
          fontSize: '1.35rem',
          fontFamily: 'Inter, Roboto, Arial, sans-serif',
          marginBottom: 6,
        }}
      >
        {phase.nom}
      </h2>
      <div style={{ color: '#6B778C', marginBottom: 10, fontSize: '1.04em', fontFamily: 'Inter, Roboto, Arial, sans-serif' }}>{phase.explication}</div>
      <div style={{ color: '#FFD166', fontWeight: 600, marginBottom: 12, fontSize: '1.01em' }}>Période : {phase.periode}</div>
      <ul style={{ paddingLeft: 0, margin: 0, listStyle: 'none' }}>
        {criteres.map(critere => (
          <li
            key={critere.id}
            style={{
              marginBottom: 16,
              background: critere.valide ? '#F5F8FA' : '#fff',
              borderRadius: 10,
              boxShadow: critere.valide ? '0 1px 6px 0 rgba(67,217,163,0.08)' : 'none',
              padding: '12px 16px',
              border: critere.valide ? '1px solid #43D9A3' : '1px solid #E3EAF2',
              transition: 'all 0.2s',
            }}
          >
            <div style={{ fontWeight: 700, color: '#4F8FFF', fontSize: '1.07em', marginBottom: 2 }}>{critere.titre}</div>
            <div style={{ color: '#6B778C', fontSize: '0.99em', marginBottom: 2 }}>{critere.conseil}</div>
            <div style={{ color: '#A0AEC0', fontSize: '0.97em', marginBottom: 2 }}>Jalon : J-{critere.jalon}</div>
            {critere.valide ? (
              <span style={{ color: '#43D9A3', fontWeight: 700, fontSize: '0.99em' }}>✅ Validé le {critere.dateValidation ? new Date(critere.dateValidation).toLocaleDateString('fr-FR') : ''}</span>
            ) : (
              onValider && (
                <button
                  onClick={() => onValider(critere.id)}
                  style={{
                    background: '#4F8FFF',
                    color: '#fff',
                    border: 'none',
                    borderRadius: 8,
                    padding: '7px 22px',
                    fontWeight: 700,
                    fontSize: 15,
                    cursor: 'pointer',
                    marginTop: 6,
                    boxShadow: '0 2px 8px 0 rgba(79,143,255,0.10)',
                    fontFamily: 'Inter, Roboto, Arial, sans-serif',
                    transition: 'background 0.2s',
                  }}
                  aria-label={`Valider le critère ${critere.titre}`}
                >
                  Valider ce critère
                </button>
              )
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}
