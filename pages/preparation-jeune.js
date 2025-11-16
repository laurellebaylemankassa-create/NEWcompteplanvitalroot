import Link from "next/link";
import React, { useEffect, useState } from 'react';

export default function PreparationJeune() {
  // Récupération de la date du jeûne et calcul du J-XX
  const [dateJeune, setDateJeune] = useState(null);
  const [dureeJeune, setDureeJeune] = useState(null);
  const [aujourdhui, setAujourdhui] = useState(new Date());
  const [jCourant, setJCourant] = useState(null);

  useEffect(() => {
    // Lecture date du jeûne et durée depuis localStorage (ou valeur par défaut)
    const dateStr = (typeof window !== 'undefined') ? window.localStorage.getItem('dateJeune') : null;
    const dureeStr = (typeof window !== 'undefined') ? window.localStorage.getItem('dureeJeune') : null;
    setDateJeune(dateStr ? new Date(dateStr) : null);
    setDureeJeune(dureeStr || 'X');
    setAujourdhui(new Date());
    // Calcul du J-XX courant
    if (dateStr) {
      const diff = Math.ceil((new Date(dateStr).setHours(0,0,0,0) - new Date().setHours(0,0,0,0)) / (1000*60*60*24));
      setJCourant(diff);
    }
  }, []);

  // Fonction statut dynamique
  function getStatut(jalonJ) {
    if (jCourant === null) return '[À VENIR]';
    if (jCourant === jalonJ) return '[EN COURS]';
    if (jCourant < jalonJ) return '[À VENIR]';
    if (jCourant > jalonJ) return '[VERROUILLÉ]';
    return '[À VENIR]';
  }

  // Helpers pour affichage date
  function formatDate(date) {
    if (!date) return '';
    return date.toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' });
  }

  return (
    <div style={{ maxWidth: 600, margin: "0 auto", padding: "2.5rem 1rem", fontFamily: "system-ui, Arial, sans-serif" }}>
      <h1 style={{ color: "#1976d2", fontWeight: 800, fontSize: "2.2rem", marginBottom: 18 }}>
        Préparation à mon jeûne
      </h1>
      <p style={{ fontSize: "1.15rem", color: "#444", marginBottom: 24 }}>
        Cette page te guide pas à pas pour préparer ton jeûne dans les meilleures conditions. Suis chaque étape pour maximiser tes chances de réussite et éviter les pièges classiques.
      </p>
      <div style={{ background: "#f8f8fc", borderRadius: 14, boxShadow: "0 2px 8px #0001", padding: "1.2rem 1.1rem", marginBottom: "2rem" }}>
        <h2 style={{ color: "#388e3c", fontWeight: 700, fontSize: "1.15rem", marginBottom: 8 }}>
          Démarre ta préparation
        </h2>
        <p style={{ color: "#555", fontSize: "1.05rem", marginBottom: 12 }}>
          Clique sur le bouton ci-dessous pour commencer ton suivi de préparation, valider chaque critère et suivre ta progression jour après jour.
        </p>
        <button style={{
          background: "linear-gradient(90deg, #43cea2 0%, #185a9d 100%)",
          color: "#fff",
          border: "none",
          borderRadius: 8,
          padding: "12px 32px",
          fontWeight: 700,
          fontSize: 18,
          cursor: "pointer",
          marginBottom: 8
        }}>
          Démarrer mon suivi de préparation
        </button>
      </div>
      {/* Timeline de préparation dynamique */}
      <div style={{ background: "#fff", borderRadius: 12, boxShadow: "0 1px 6px #e0e0e0", padding: "1.5rem 1.2rem", marginBottom: 18 }}>
        <h3 style={{ color: "#1976d2", fontWeight: 700, fontSize: "1.1rem", marginBottom: 10 }}>Timeline de préparation</h3>
        {/* PHASE 1 : Fondations */}
        <div style={{ marginBottom: 18 }}>
          <strong style={{ color: '#388e3c' }}>Phase 1 : Fondations</strong> <span style={{ color: '#888' }}>(J-30 à J-18)</span>
          <ul style={{ color: "#444", fontSize: "1.05rem", lineHeight: 1.7, margin: 0, paddingLeft: 18 }}>
            <li>
              <strong>J-30</strong> : Respect strict des quantités à chaque repas <span style={{ color: getStatut(30) === '[EN COURS]' ? '#1976d2' : getStatut(30) === '[VERROUILLÉ]' ? '#888' : '#aaa', fontWeight: 600 }}>{getStatut(30)}</span>
            </li>
            <li>
              <strong>J-17</strong> :
              <ul style={{ marginTop: 4, marginBottom: 4 }}>
                <li>Supprimer les féculents le soir (lundi au dimanche)</li>
                <li>Action immédiate après le repas (marche ou ménage)</li>
              </ul>
              <span style={{ color: getStatut(17) === '[EN COURS]' ? '#1976d2' : getStatut(17) === '[VERROUILLÉ]' ? '#888' : '#aaa', fontWeight: 600 }}>{getStatut(17)}</span>
            </li>
            <li>
              <strong>J-14</strong> :
              <ul style={{ marginTop: 4, marginBottom: 4 }}>
                <li>Éliminer tous produits transformés</li>
                <li>Éliminer toutes sucreries</li>
              </ul>
              <span style={{ color: getStatut(14) === '[EN COURS]' ? '#1976d2' : getStatut(14) === '[VERROUILLÉ]' ? '#888' : '#aaa', fontWeight: 600 }}>{getStatut(14)}</span>
            </li>
          </ul>
        </div>
        {/* PHASE 2 : Intensification */}
        <div>
          <strong style={{ color: '#1976d2' }}>Phase 2 : Intensification</strong> <span style={{ color: '#888' }}>(J-12 à J-1)</span>
          <ul style={{ color: "#444", fontSize: "1.05rem", lineHeight: 1.7, margin: 0, paddingLeft: 18 }}>
            <li>
              <strong>J-12</strong> : 2 jours de jeûne plein (préparation métabolique) <span style={{ color: getStatut(12) === '[EN COURS]' ? '#1976d2' : getStatut(12) === '[VERROUILLÉ]' ? '#888' : '#aaa', fontWeight: 600 }}>{getStatut(12)}</span>
            </li>
            <li>
              <strong>J-7</strong> :
              <ul style={{ marginTop: 4, marginBottom: 4 }}>
                <li>2 litres d’eau par jour (suivi automatique)</li>
                <li>Pas de repas après 19h00</li>
                <li>Plage alimentaire limitée à 45 minutes par repas</li>
              </ul>
              <span style={{ color: getStatut(7) === '[EN COURS]' ? '#1976d2' : getStatut(7) === '[VERROUILLÉ]' ? '#888' : '#aaa', fontWeight: 600 }}>{getStatut(7)}</span>
            </li>
            <li>
              <strong>J-0</strong> : {`Lancement de ton jeûne de ${dureeJeune} jours`} <span style={{ color: getStatut(0) === '[EN COURS]' ? '#1976d2' : getStatut(0) === '[VERROUILLÉ]' ? '#888' : '#aaa', fontWeight: 600 }}>{getStatut(0)}</span>
            </li>
          </ul>
        </div>
        <div style={{ color: '#888', fontSize: '0.98rem', marginTop: 16 }}>
          <span>Légende : </span>
          <span style={{ color: '#1976d2', fontWeight: 600 }}>EN COURS</span>,
          <span style={{ color: '#aaa', fontWeight: 600, marginLeft: 8 }}>À VENIR</span>,
          <span style={{ color: '#888', fontWeight: 600, marginLeft: 8 }}>VERROUILLÉ</span>
        </div>
        <div style={{ color: '#888', fontSize: '0.98rem', marginTop: 8 }}>
          {dateJeune && (
            <span>Jeûne programmé le <strong>{formatDate(dateJeune)}</strong> ({jCourant !== null ? `J-${jCourant}` : ''})</span>
          )}
        </div>
      </div>
      <div style={{ textAlign: "center", marginTop: 32 }}>
        <Link href="/">
          <button style={{
            background: "#1976d2",
            color: "#fff",
            border: "none",
            borderRadius: 8,
            padding: "10px 24px",
            fontWeight: 600,
            fontSize: 16,
            cursor: "pointer"
          }}>
            🏠 Retour à l’accueil
          </button>
        </Link>
      </div>
    </div>
  );
}
