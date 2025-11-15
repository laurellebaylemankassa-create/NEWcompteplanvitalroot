import { useEffect, useState } from 'react';

export default function RepriseAlimentaireApresJeune() {
  const [programme, setProgramme] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [jours, setJours] = useState([]);
  const [dateAuj, setDateAuj] = useState(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    try {
      const prog = localStorage.getItem('programmeRepriseValide');
      if (!prog) {
        setError("Aucun plan de reprise validé trouvé.\nValide ton plan dans l'étape précédente pour le retrouver ici.");
        setLoading(false);
        return;
      }
      const parsed = JSON.parse(prog);
      setProgramme(parsed);
      setJours(parsed.jours_detailles || []);
      setDateAuj(new Date().toISOString().split('T')[0]);
      setLoading(false);
    } catch (e) {
      setError("Erreur lors du chargement du plan de reprise.\nFormat du plan invalide ou corrompu.");
      setLoading(false);
    }
  }, []);

  let jourReprise = null;
  if (programme && programme.date_debut_reprise) {
    const debut = new Date(programme.date_debut_reprise);
    const auj = new Date();
    const diff = Math.floor((auj - debut) / (1000 * 60 * 60 * 24));
    jourReprise = diff + 1;
  }

  let joursAAfficher = [];
  if (jours.length > 0) {
    if (jourReprise < 1) {
      joursAAfficher = jours.slice(0, 2);
    } else {
      joursAAfficher = jours.slice(0, jourReprise);
    }
  }

  return (
    <div style={{padding:'2rem', maxWidth:'800px', margin:'0 auto', fontFamily:'Arial, sans-serif'}}>
      <h1 style={{color:'#1976d2', fontWeight:800, fontSize:'2.2rem', marginBottom:'1.5rem'}}>Reprise alimentaire après jeûne</h1>
      {loading ? (
        <div style={{textAlign:'center', color:'#888', fontSize:'1.2rem'}}>Chargement du plan...</div>
      ) : error ? (
        <div style={{color:'#c62828', fontWeight:600, margin:'2rem 0', whiteSpace:'pre-line'}}>{error}</div>
      ) : !programme ? (
        <div style={{color:'#888', fontWeight:600, margin:'2rem 0'}}>Aucun plan de reprise validé à afficher.<br/>Valide ton plan dans l’étape précédente.</div>
      ) : (
        <>
          <div style={{background:'#e3f2fd', borderRadius:12, padding:'1.2rem 1.5rem', marginBottom:'1.5rem'}}>
            <div style={{fontSize:'1.15rem', color:'#1976d2', fontWeight:700, marginBottom:6}}>
              {jourReprise < 1 ? 'Prévisualisation du plan validé' : 'Suivi de ta reprise alimentaire'}
            </div>
            <div style={{color:'#444', fontSize:'1.05rem'}}>
              {jourReprise < 1
                ? "Tu as validé ton plan. La reprise commencera le " + new Date(programme.date_debut_reprise).toLocaleDateString('fr-FR') + ".\nTu peux prévisualiser les 2 premiers jours, mais tu ne pourras agir qu'à partir du jour J1."
                : "Ta reprise a commencé ! Suis chaque jour le programme pour consolider les bienfaits de ton jeûne."}
            </div>
          </div>

          <div style={{marginBottom:'2rem'}}>
            <h2 style={{color:'#1976d2', fontSize:'1.3rem', fontWeight:700, marginBottom:'1rem'}}>Jours accessibles</h2>
            {joursAAfficher.length === 0 && (
              <div style={{color:'#888'}}>Aucun jour à afficher pour l’instant.</div>
            )}
            {joursAAfficher.map((jour, idx) => (
              <div key={idx} style={{background:'#fff', border:'1px solid #b3e5fc', borderRadius:10, marginBottom:18, padding:'1.1rem 1.2rem'}}>
                <div style={{fontWeight:700, color:'#1976d2', fontSize:'1.1rem', marginBottom:4}}>
                  Jour {jour.jour_numero} – {jour.date}
                </div>
                <div style={{color:'#444', marginBottom:6}}>
                  <b>Phase {jour.phase}</b>
                </div>
                <div style={{color:'#388e3c', marginBottom:6, fontWeight:500}}>
                  {jour.message_contextuel}
                </div>
                <div style={{marginBottom:4}}>
                  <b>Aliments autorisés :</b>
                  <ul style={{margin:'0.3rem 0 0 1.2rem', color:'#333', fontSize:'1rem'}}>
                    {jour.aliments_autorises && jour.aliments_autorises.slice(0, 6).map((alim, i) => (
                      <li key={i}>{alim.nom} {alim.portion ? `(${alim.portion})` : ''}</li>
                    ))}
                    {jour.aliments_autorises && jour.aliments_autorises.length > 6 && (
                      <li>...et {jour.aliments_autorises.length - 6} autres</li>
                    )}
                  </ul>
                </div>
                <div style={{color:'#888', fontSize:'0.98rem'}}>
                  (Lecture seule, tu ne peux pas valider ce jour tant que la date n’est pas atteinte)
                </div>
              </div>
            ))}
          </div>

          <div style={{background:'#fffde7', border:'1px solid #ffe082', borderRadius:10, padding:'1rem 1.2rem', color:'#f57c00', fontWeight:600}}>
            <span role="img" aria-label="info">ℹ️</span> La validation quotidienne de la reprise sera possible uniquement à partir du jour J1. Reviens ici chaque jour pour valider ta progression.
          </div>
        </>
      )}
    </div>
  );
}
