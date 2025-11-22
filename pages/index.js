
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/router";
import StartPreparationModal from "../components/StartPreparationModal";

export default function Home() {
  const [showModal, setShowModal] = useState(false);
  const router = useRouter();

  // Handler pour la validation de la modale

  const handleStartPreparation = (data) => {
    // Construction de l'URL avec les paramètres
    const params = new URLSearchParams({
      startDate: data.startDate,
      duration: data.duration,
      goal: data.goal,
    });
    const url = `/preparation-jeune?${params.toString()}`;
    window.open(url, '_blank');
    setShowModal(false);
  };

  return (
    <div style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
      <h1 style={{ color: '#2c3e50' }}>Bienvenue sur Mon Plan Vital</h1>
      <p style={{ marginTop: '1rem' }}>
        Votre application pour suivre votre santé et votre bien-être au quotidien.
      </p>
      <div>
        <p>Explorez les différentes sections pour :</p>
        <ul>
          <li>Gérer votre profil utilisateur</li>
          <li>Suivre vos repas et vos signaux de satiété</li>
          <li>Analyser vos données comportementales</li>
          <li>Définir et suivre vos idéaux/routines de vie</li>
        </ul>
      </div>
      <p style={{ marginTop: '2rem' }}>
        <Link href="/profil"
          style={{ 
            display: 'inline-block',
            padding: '0.75rem 1.5rem',
            backgroundColor: '#3498db',
            color: '#fff',
            borderRadius: '5px',
            textDecoration: 'none',
            fontWeight: 'bold',
            marginRight: '1rem'
          }}>
          → Accéder à mon profil
        </Link>
        <Link href="/ideaux"
          style={{ 
            display: 'inline-block',
            padding: '0.75rem 1.5rem',
            backgroundColor: '#8e24aa',
            color: '#fff',
            borderRadius: '5px',
            textDecoration: 'none',
            fontWeight: 'bold',
            marginRight: '1rem'
          }}>
          🌟 Mes idéaux / routines
        </Link>
        <a
          href="/start-preparation"
          style={{
            display: 'inline-block',
            padding: '0.75rem 1.5rem',
            backgroundColor: '#1976d2',
            color: '#fff',
            borderRadius: '5px',
            textDecoration: 'none',
            fontWeight: 'bold',
            border: 'none',
            cursor: 'pointer'
          }}
        >
          🧘‍♂️ Me préparer à jeûner
        </a>
      </p>
    </div>
  );
}