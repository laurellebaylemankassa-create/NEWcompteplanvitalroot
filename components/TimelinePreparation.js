import React from 'react';

/**
 * TimelinePreparation — Composant dynamique
 * Affiche la frise des phases/jalons de préparation.
 * Props :
 *   - phases (array) : liste des phases [{ nom, debut, fin, icone, couleur }]
 *   - currentDay (number) : jour courant (pour surligner la phase active)
 */
export default function TimelinePreparation({ phases = [], currentDay = null }) {
  return (
    <nav
      aria-label="Frise des phases de préparation"
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'flex-end',
        gap: '36px',
        margin: '32px 0 36px 0',
        flexWrap: 'wrap',
        background: '#fff',
        borderRadius: 16,
        boxShadow: '0 2px 16px 0 rgba(79,143,255,0.07)',
        border: '1px solid #E3EAF2',
        padding: '24px 18px',
        maxWidth: 900,
        marginLeft: 'auto',
        marginRight: 'auto',
      }}
    >
      {phases.map((phase, idx) => {
        const isActive = currentDay !== null && currentDay <= phase.debut && currentDay >= phase.fin;
        return (
          <div
            key={phase.nom}
            style={{
              textAlign: 'center',
              opacity: isActive ? 1 : 0.55,
              borderBottom: isActive ? '4px solid #4F8FFF' : '4px solid transparent',
              paddingBottom: 10,
              minWidth: 110,
              transition: 'all 0.2s',
              background: isActive ? '#F5F8FA' : 'transparent',
              borderRadius: 10,
              boxShadow: isActive ? '0 2px 8px 0 rgba(79,143,255,0.10)' : 'none',
            }}
            aria-current={isActive ? 'step' : undefined}
          >
            <div style={{ fontSize: '2.2em', marginBottom: 4 }}>{phase.icone || '⏳'}</div>
            <div style={{
              fontWeight: 700,
              color: isActive ? '#4F8FFF' : '#6B778C',
              fontFamily: 'Inter, Roboto, Arial, sans-serif',
              fontSize: '1.08em',
              marginBottom: 2,
            }}>
              {phase.nom}
            </div>
            <div style={{ fontSize: '0.98em', color: '#A0AEC0', fontFamily: 'Inter, Roboto, Arial, sans-serif' }}>
              J-{phase.debut} à J-{phase.fin}
            </div>
          </div>
        );
      })}
    </nav>
  );
}
