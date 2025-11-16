import Link from "next/link";

export default function Home() {
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
        <Link href="/preparation-jeune"
          style={{ 
            display: 'inline-block',
            padding: '0.75rem 1.5rem',
            backgroundColor: '#1976d2',
            color: '#fff',
            borderRadius: '5px',
            textDecoration: 'none',
            fontWeight: 'bold'
          }}>
          🧘‍♂️ Me préparer à jeûner
        </Link>
      </p>
    </div>
  );
}