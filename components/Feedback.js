import React from "react";

/**
 * Feedback — Squelette visuel
 * Affiche un message de feedback utilisateur (succès, erreur, info).
 * À compléter avec props et logique métier après validation du squelette.
 */
export default function Feedback({ type = "info", children }) {
  // Palette feedback
  const palette = {
    info:   { bg: "#F5F8FA", color: "#4F8FFF", icon: "ℹ️" },
    success:{ bg: "#E6FBF3", color: "#43D9A3", icon: "✅" },
    error:  { bg: "#FFF0F0", color: "#FF6B6B", icon: "⛔" },
    warning:{ bg: "#FFF8E1", color: "#FFD166", icon: "⚠️" },
  };
  const { bg, color, icon } = palette[type] || palette.info;
  return (
    <div style={{
      background: bg,
      color: color,
      borderRadius: 12,
      padding: '14px 22px',
      fontWeight: 700,
      margin: '18px 0',
      boxShadow: '0 2px 8px 0 rgba(79,143,255,0.07)',
      display: 'flex',
      alignItems: 'center',
      gap: '0.9em',
      fontFamily: 'Inter, Roboto, Arial, sans-serif',
      fontSize: '1.08em',
      border: `1.5px solid ${color}22`,
      maxWidth: 600,
      marginLeft: 'auto',
      marginRight: 'auto',
    }}>
      <span style={{ fontSize: '1.4em' }} aria-hidden="true">{icon}</span>
      <span>{children || "Message de feedback à afficher ici"}</span>
    </div>
  );
}
