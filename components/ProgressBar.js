import React from "react";

/**
 * ProgressBar — Composant dynamique
 * Affiche la progression globale de la préparation (ex : nombre de critères validés).
 * Props :
 *   - value (number) : nombre de critères validés
 *   - max (number) : nombre total de critères
 */
export default function ProgressBar({ value = 0, max = 9 }) {
  const percent = Math.max(0, Math.min(100, (value / max) * 100));
  return (
    <div
      style={{
        background: '#F5F8FA',
        borderRadius: 12,
        height: 20,
        width: '100%',
        margin: '18px 0 22px 0',
        boxShadow: '0 2px 8px 0 rgba(79,143,255,0.07)',
        overflow: 'hidden',
        position: 'relative',
        border: '1px solid #E3EAF2',
        maxWidth: 420,
        marginLeft: 'auto',
        marginRight: 'auto',
      }}
      aria-label="Progression de la préparation"
      role="progressbar"
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={max}
      tabIndex={0}
    >
      <div
        style={{
          width: percent + '%',
          height: '100%',
          background: 'linear-gradient(90deg, #4F8FFF 0%, #43D9A3 100%)',
          transition: 'width 0.4s',
          borderRadius: 12,
          boxShadow: '0 1px 6px 0 rgba(67,217,163,0.08)',
        }}
      />
      <span style={{
        position: 'absolute',
        left: '50%',
        top: '50%',
        transform: 'translate(-50%, -50%)',
        color: '#4F8FFF',
        fontWeight: 800,
        fontSize: 15,
        userSelect: 'none',
        letterSpacing: 0.5,
        fontFamily: 'Inter, Roboto, Arial, sans-serif',
      }}>
        {value} / {max}
      </span>
    </div>
  );
}
