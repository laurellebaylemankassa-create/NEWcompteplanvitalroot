import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';

export default function RepriseAlimentaireApresJeune() {
  const router = useRouter();
  const [programme, setProgramme] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [jours, setJours] = useState([]);
  const [dateAuj, setDateAuj] = useState(null);
  const [listeCourses, setListeCourses] = useState([]);

  // Permettre un mode test/forçage via ?test=1 dans l'URL
  const [forceSuivi, setForceSuivi] = useState(false);

  useEffect(() => {
    if (router && router.query && router.query.test === '1') {
      setForceSuivi(true);
    }
  }, [router.query]);

  useEffect(() => {
    setLoading(true);
    setError(null);
    try {
      const prog = localStorage.getItem('programmeRepriseValide');
      if (!prog) {
        // Log du localStorage pour debug
        console.warn('[DEBUG] programmeRepriseValide absent. localStorage complet :', JSON.stringify(localStorage));
        setError("Aucun plan de reprise validé trouvé.\n\n➡️ Pour accéder à ton plan validé, valide-le d'abord dans l'étape précédente.\n\nSi tu viens de valider, vérifie que tu n'as pas vidé le stockage local ou changé d'appareil/navigateur.\n\nTu peux retourner à la validation pour recommencer.");
        setLoading(false);
        return;
      }
      const parsed = JSON.parse(prog);
      // Debug log pour vérifier le contenu du plan
      console.debug('[DEBUG] Chargement programmeRepriseValide:', parsed);
      setProgramme(parsed);
      setJours(parsed.jours_detailles || []);
      setDateAuj(new Date().toISOString().split('T')[0]);
      // Générer la liste de courses pour les 2 premiers jours (Phase 1-2)
      if (parsed.jours_detailles && parsed.jours_detailles.length > 0) {
        const premiersJours = parsed.jours_detailles.slice(0, 2); // J+1 et J+2
        const alimentsUniques = {};
        premiersJours.forEach(jour => {
          if (jour.aliments_autorises) {
            jour.aliments_autorises.forEach(alim => {
              if (alim && alim.nom) {
                const key = alim.nom.toLowerCase();
                if (!alimentsUniques[key]) {
                  alimentsUniques[key] = { nom: alim.nom, portion: alim.portion };
                }
              }
            });
          }
        });
        setListeCourses(Object.values(alimentsUniques));
      }
      setLoading(false);
    } catch (e) {
      setError("Erreur lors du chargement du plan de reprise.\nFormat du plan invalide ou corrompu.");
      setLoading(false);
    }
  }, []);


  // Calcul du jour de reprise courant
  let jourReprise = null;
  if (programme && programme.date_debut_reprise) {
    const debut = new Date(programme.date_debut_reprise);
    const auj = new Date();
    const diff = Math.floor((auj - debut) / (1000 * 60 * 60 * 24));
    jourReprise = diff + 1;
  }

  let joursAAfficher = [];
  let isPreview = false;
  if (jours.length > 0) {
    // Mode test/forçage : on affiche tout le suivi réel
    if (forceSuivi) {
      joursAAfficher = jours;
      isPreview = false;
    } else if (jourReprise < 1) {
      joursAAfficher = jours.slice(0, 2);
      isPreview = true;
    } else {
      // Dès le J1 de la reprise, affichage du vrai suivi quotidien (tous les jours jusqu'au jour courant)
      joursAAfficher = jours.slice(0, jourReprise);
      isPreview = false;
    }
  }

  // Calcul de la progression globale
  const totalJours = jours.length;
  const currentJour = jourReprise && jourReprise > 0 ? Math.min(jourReprise, totalJours) : 0;

  return (
    <div style={{padding:'2rem', maxWidth:'800px', margin:'0 auto', fontFamily:'Arial, sans-serif'}}>
      {/* Bouton retour au jeûne */}
      <div style={{marginBottom:'1.2rem'}}>
        <Link href="/jeune" legacyBehavior>
          <a style={{display:'inline-flex',alignItems:'center',background:'#f5f5f5',border:'1px solid #bdbdbd',borderRadius:8,padding:'0.5rem 1.1rem',color:'#1976d2',fontWeight:700,textDecoration:'none',fontSize:'1.05rem',boxShadow:'0 1px 3px #0001'}}>
            <span style={{fontSize:'1.3em',marginRight:8}}>←</span> Retour au jeûne
          </a>
        </Link>
      </div>
      {/* Barre de progression globale */}
      {totalJours > 0 && (
        <div style={{
          marginBottom: '1.2rem',
          background: '#e8f5e9',
          borderRadius: 8,
          padding: '0.7rem 1.2rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontWeight: 700,
          color: '#388e3c',
          fontSize: '1.13rem',
          boxShadow: '0 1px 3px #0001'
        }}>
          <span>Progression : Jour {currentJour}/{totalJours}</span>
          <div style={{flex:1, marginLeft:16, marginRight:8, height:10, background:'#c8e6c9', borderRadius:5, overflow:'hidden'}}>
            <div style={{width: `${(currentJour/totalJours)*100}%`, height:'100%', background:'#43a047', borderRadius:5, transition:'width 0.3s'}}></div>
          </div>
        </div>
      )}
      <h1 style={{color:'#1976d2', fontWeight:800, fontSize:'2.2rem', marginBottom:'1.5rem'}}>Reprise alimentaire après jeûne</h1>
      {/* Message explicite si prévisualisation */}
      {isPreview && programme && (
        <div style={{background:'#fff3cd', color:'#856404', border:'1px solid #ffeeba', borderRadius:8, padding:'1rem 1.2rem', marginBottom:'1.5rem', fontWeight:600, fontSize:'1.08rem'}}>
          <span role="img" aria-label="info">ℹ️</span> La reprise alimentaire commencera le <b>{new Date(programme.date_debut_reprise).toLocaleDateString('fr-FR')}</b>.<br/>
          Tu peux prévisualiser les 2 premiers jours, mais tu ne pourras suivre le programme au quotidien qu'à partir de cette date.<br/>
          <span style={{fontWeight:400, fontSize:'0.98rem', color:'#888'}}>Pour tester le suivi réel sans attendre, ajoute <code>?test=1</code> à l'URL.</span>
        </div>
      )}
      {loading ? (
        <div style={{textAlign:'center', color:'#888', fontSize:'1.2rem'}}>Chargement du plan...</div>
      ) : error ? (
        <div style={{color:'#c62828', fontWeight:600, margin:'2rem 0', whiteSpace:'pre-line'}}>
          {error}
          <div style={{marginTop:'2rem'}}>
            <Link href="/validation-plan-reprise">
              <a style={{
                display:'inline-block',
                background:'#1976d2',
                color:'#fff',
                padding:'0.7rem 1.5rem',
                borderRadius:8,
                fontWeight:700,
                textDecoration:'none',
                fontSize:'1.08rem',
                boxShadow:'0 1px 3px #0001',
                marginTop:'1rem'
              }}>
                ↩️ Retour à la validation du plan
              </a>
            </Link>
          </div>
        </div>
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
                : "Ta reprise a commencé ! Suis chaque jour le programme pour consolider les bienfaits de ton jeûne. Valide chaque jour pour suivre ta progression."}
            </div>
          </div>

          {/* Liste de courses pour les 2 premiers jours */}
          {listeCourses.length > 0 && (
            <div style={{background:'#fffde7', border:'1px solid #ffe082', borderRadius:10, padding:'1.1rem 1.3rem', marginBottom:'2rem'}}>
              <div style={{display:'flex',alignItems:'center',marginBottom:6}}>
                <span role="img" aria-label="courses" style={{fontSize:'1.3em',marginRight:8}}>🛒</span>
                <span style={{color:'#f57c00',fontWeight:700,fontSize:'1.08rem'}}>Liste de courses pour démarrer la reprise (J+1 et J+2)</span>
              </div>
              <ul style={{margin:'0.5rem 0 0 1.2rem', color:'#333', fontSize:'1.05rem',columns:2}}>
                {listeCourses.map((alim, i) => (
                  <li key={i}>{alim.nom}{alim.portion ? ` (${alim.portion})` : ''}</li>
                ))}
              </ul>
              <div style={{color:'#888',fontSize:'0.98rem',marginTop:8}}>
                (Anticipe tes achats pour ne manquer de rien le jour J !)
              </div>
            </div>
          )}

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
