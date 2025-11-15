import { useState, useEffect } from 'react'
import alimentsRepriseJeune from '../data/alimentsRepriseJeune'
import Link from 'next/link'
import { useRouter } from 'next/router'

export default function ValidationPlanReprise() {
  // ============================================
  // HOOKS D'ÉTAT (INITIALISATION EN PREMIER)
  // ============================================
  const router = useRouter()
  
  const [programme, setProgramme] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [checkboxLu, setCheckboxLu] = useState(false)
  const [checkboxEngage, setCheckboxEngage] = useState(false)
  const [validating, setValidating] = useState(false)
  const [message, setMessage] = useState('')

  // ============================================
  // USEEFFECT - CHARGEMENT PROGRAMME
  // ============================================
  useEffect(() => {
    const chargerProgramme = () => {
      try {
        setLoading(true)
        setError(null)
        // Uniquement localStorage
        const programmeLocal = localStorage.getItem('programmeReprise')
        if (programmeLocal) {
          const parsed = JSON.parse(programmeLocal)
          setProgramme(parsed)
          setLoading(false)
          return
        }
        setError('Aucun programme de reprise en attente de validation.')
        setLoading(false)
      } catch (err) {
        console.error('Erreur chargement:', err)
        setError('Erreur lors du chargement du programme.')
        setLoading(false)
      }
    }

    chargerProgramme()
  }, [])

  // ============================================
  // VARIABLES CALCULÉES
  // ============================================
  const peutValider = checkboxLu && checkboxEngage && !validating
  
  // Extraire les aliments Phase 1 et 2 pour liste courses
  const getListeCourses = () => {
    if (!programme?.liste_courses) return {}
    
    // Si liste_courses est déjà groupé par catégorie
    if (typeof programme.liste_courses === 'object' && !Array.isArray(programme.liste_courses)) {
      return programme.liste_courses
    }
    
    // Sinon, retourner vide
    return {}
  }

  const listeCoursesGroupee = getListeCourses()

  // ============================================
  // HANDLERS / FONCTIONS
  // ============================================
  const handleValider = () => {
    if (!peutValider) return;
    setValidating(true);
    // Log visuel et alerte pour debug
    console.log('[DEBUG] Bouton validation cliqué');
    alert('Validation du plan : handler appelé');
    // Vérifier que le plan existe bien
    if (!programme) {
      setError("Aucun plan à valider. Merci de régénérer le plan.");
      setValidating(false);
      return;
    }
    // DEBUG: log avant validation
    console.debug('[DEBUG] Validation plan - programme:', programme);
    try {
      localStorage.setItem('programmeRepriseValide', JSON.stringify(programme));
      const check = localStorage.getItem('programmeRepriseValide');
      console.debug('[DEBUG] programmeRepriseValide enregistré:', check);
      localStorage.removeItem('programmeReprise');
      // Afficher un message de confirmation fort
      setMessage('✅ Programme validé ! Tu t’es engagé à suivre ce plan pour fortifier ton pouvoir de volonté. Redirection en cours...');
      // Attendre 2 secondes avant de rediriger
      setTimeout(() => {
        // Vérifier que la sauvegarde a bien fonctionné avant de rediriger
        const verif = localStorage.getItem('programmeRepriseValide');
        if (verif) {
          router.push('/jeune?validation=success');
        } else {
          setError("Erreur lors de la sauvegarde du plan. Merci de réessayer.");
          setValidating(false);
        }
      }, 2000);
    } catch (e) {
      setError("Erreur lors de la sauvegarde du plan. Merci de réessayer.");
      setValidating(false);
    }
  }

  // ============================================
  // RENDU JSX
  // ============================================
  if (loading) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <h1>⏳ Chargement du programme...</h1>
      </div>
    )
  }

  if (error || !programme) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <h1>❌ {error || 'Programme introuvable'}</h1>
        <p style={{ marginTop: '1rem', color: '#666' }}>
          Aucun programme de reprise n'est actuellement en attente de validation.
        </p>
        <Link href="/jeune" style={{ 
          display: 'inline-block', 
          marginTop: '2rem',
          padding: '0.75rem 1.5rem',
          background: '#4CAF50',
          color: 'white',
          textDecoration: 'none',
          borderRadius: '8px'
        }}>
          ← Retour au jeûne
        </Link>
      </div>
    )
  }

  return (
    <div style={{ padding: '1rem', maxWidth: '900px', margin: '0 auto' }}>
      {/* HEADER */}
      <div style={{ 
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        padding: '2rem',
        borderRadius: '12px',
        color: 'white',
        marginBottom: '2rem'
      }}>
        <h1 style={{ margin: '0 0 0.5rem 0', fontSize: '1.8rem' }}>
          📋 Validation de ton plan de reprise
        </h1>
        <p style={{ margin: 0, opacity: 0.9 }}>
          Jeûne de {programme.duree_jeune_jours} jours → Reprise de {programme.duree_reprise_jours} jours
        </p>
        <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.9rem', opacity: 0.8 }}>
          Du {new Date(programme.date_debut_reprise).toLocaleDateString('fr-FR')} au {new Date(programme.date_fin_reprise).toLocaleDateString('fr-FR')}
        </p>
      </div>

      {/* PHASES EN MODE SCROLL-SNAP (REELS/SHORTS) */}
      <div
        style={{
          scrollSnapType: 'y mandatory',
          overflowY: 'auto',
          maxHeight: '80vh',
          minHeight: '400px',
          marginBottom: '2rem',
          borderRadius: '16px',
          background: '#f8f8fc',
          boxShadow: '0 2px 12px rgba(0,0,0,0.07)',
          position: 'relative',
        }}
      >
        <h2 style={{ margin: '1.2rem 0 1.2rem 0', fontSize: '1.3rem', color: '#333', textAlign:'center' }}>
          🗓️ Les 4 phases de ta reprise (scroll vertical)
        </h2>
        {programme.phases && Object.entries(programme.phases).map(([phaseKey, phase], idx) => {
          const phaseNum = parseInt(phaseKey.replace('phase', ''))
          const couleurs = ['#E3F2FD', '#F3E5F5', '#FFF3E0', '#E8F5E9']
          const couleursBordure = ['#2196F3', '#9C27B0', '#FF9800', '#4CAF50']
          const alimentsPhase = alimentsRepriseJeune
            .filter(a => a.phase === phaseNum)
            .sort((a, b) => (b.favoriseCetose ? 1 : 0) - (a.favoriseCetose ? 1 : 0))
            .slice(0, 4)
          const emojiCat = {
            liquide: '🥤',
            légume: '🥕',
            protéine: '🥚',
            lipide: '🥑',
            féculent: '🍚',
            fruit: '🍏',
            "": '🍽️'
          }
          // Exemples de menus par phase (cohérent avec la phase)
          const exemplesMenu = [
            ["Bouillon de légumes clair", "Eau citronnée", "Jus de carotte dilué"],
            ["Purée de courgette", "Compote maison", "Carottes vapeur"],
            ["Œuf mollet", "Avocat écrasé", "Légumes vapeur"],
            ["Riz complet", "Patate douce", "Flocons d’avoine", "Légumes cuits"]
          ]
          // Semaine-type par phase (rappel explicite de la phase)
          const semainesType = [
            [
              "Lundi : Bouillon de légumes, eau citronnée",
              "Mardi : Bouillon, jus de carotte dilué",
              "Mercredi : Bouillon, compote maison",
              "Jeudi : Bouillon, légumes vapeur",
              "Vendredi : Bouillon, jus de légumes",
              "Samedi : Bouillon, eau citronnée",
              "Dimanche : Bouillon, compote maison"
            ],
            [
              "Lundi : Purée de courgette, compote maison",
              "Mardi : Légumes vapeur, riz semi-complet",
              "Mercredi : Légumes + compote, bouillon",
              "Jeudi : Riz + légumes, compote",
              "Vendredi : Légumes, céréales douces, fruits cuits",
              "Samedi : Légumes, compote",
              "Dimanche : Riz, légumes, fruits cuits"
            ],
            [
              "Lundi : Légumes + œuf mollet, compote",
              "Mardi : Légumes vapeur, riz, œuf",
              "Mercredi : Légumes + avocat, bouillon",
              "Jeudi : Riz + légumes, poisson blanc vapeur",
              "Vendredi : Légumes, céréales douces, fruits cuits",
              "Samedi : Légumes, œuf, compote",
              "Dimanche : Riz, légumes, fruits cuits"
            ],
            [
              "Lundi : Riz complet, légumes cuits, fruits cuits",
              "Mardi : Patate douce, légumes vapeur, compote",
              "Mercredi : Flocons d’avoine, légumes, œuf",
              "Jeudi : Riz + légumes, poisson blanc vapeur",
              "Vendredi : Légumes, céréales douces, fruits cuits",
              "Samedi : Légumes, œuf, compote",
              "Dimanche : Riz, légumes, fruits cuits"
            ]
          ]
          return (
            <section
              key={phaseKey}
              style={{
                scrollSnapAlign: 'start',
                minHeight: 'calc(80vh - 60px)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                padding: '2.2rem 1.2rem 2.2rem 1.2rem',
                margin: '0 auto',
                background: couleurs[phaseNum-1],
                borderLeft: `6px solid ${couleursBordure[phaseNum-1]}`,
                borderRadius: '18px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.07)',
                marginBottom: '2rem',
                maxWidth: 600,
                width: '90%',
                position: 'relative',
                transition: 'box-shadow 0.2s',
              }}
            >
              <div style={{display:'flex', alignItems:'center', gap:'0.7rem', marginBottom:'0.7rem'}}>
                <div style={{
                  width:48, height:48, borderRadius:'50%', background:couleursBordure[phaseNum-1],
                  display:'flex', alignItems:'center', justifyContent:'center', color:'white', fontSize:'2rem', fontWeight:700
                }}>{['💧','🥬','🥚','🍚'][phaseNum-1]}</div>
                <div style={{fontWeight:700, fontSize:'1.2rem', color:'#222'}}>Phase {phaseNum} <span style={{fontWeight:400, fontSize:'1rem', color:'#666'}}>J{phase.debut} à J{phase.fin} ({phase.fin - phase.debut + 1} jours)</span></div>
              </div>
              <div style={{fontWeight:600, color:'#333', fontSize:'1.1rem', display:'flex', alignItems:'center', gap:'0.5rem', marginBottom:'0.5rem'}}>
                <span style={{fontSize:'1.3rem'}}>🎯</span> {phase.objectif}
              </div>
              <div style={{margin:'0.5rem 0 0.2rem 0', fontWeight:600, color:'#444'}}>Aliments principaux :</div>
              <div style={{display:'flex', flexWrap:'wrap', gap:'0.5rem 0.7rem', justifyContent:'center', marginBottom:'0.5rem'}}>
                {alimentsPhase.map((a) => (
                  <span key={a.nom} style={{
                    background:'#fff',
                    border:`1.5px solid ${couleursBordure[phaseNum-1]}`,
                    borderRadius:'20px',
                    padding:'0.25rem 0.9rem',
                    fontWeight:500,
                    fontSize:'1.05rem',
                    display:'flex', alignItems:'center', gap:'0.5rem',
                    boxShadow:'0 1px 4px rgba(0,0,0,0.04)',
                    cursor:'pointer',
                    transition:'box-shadow 0.2s',
                  }} title={a.conseil ? a.conseil : ''}>
                    <span style={{fontSize:'1.15rem'}}>{emojiCat[a.categorie] || '🍽️'}</span> {a.nom}
                  </span>
                ))}
              </div>
              <div style={{margin:'0.7rem 0 0.2rem 0', fontWeight:600, color:'#444'}}>Exemple de menu :</div>
              <ul style={{margin:0, paddingLeft:'1.2rem', color:'#333', fontSize:'1.05rem', textAlign:'left'}}>
                {exemplesMenu[phaseNum-1].map((item, idx) => (
                  <li key={idx}>{item}</li>
                ))}
              </ul>
              {/* SEMAINE-TYPE PAR PHASE */}
              <div style={{
                background: '#F3E5F5',
                padding: '1.1rem',
                borderRadius: '10px',
                margin: '1.2rem 0 0.5rem 0',
                boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                width: '100%'
              }}>
                <h3 style={{margin:'0 0 0.7rem 0', fontSize:'1.1rem', color:'#7B1FA2'}}>
                  📅 Exemple de semaine-type <span style={{fontWeight:400, fontSize:'0.98rem', color:'#333'}}>pour la phase {phaseNum}</span>
                </h3>
                <ul style={{margin:0, paddingLeft:'1.2rem', color:'#444', fontSize:'1rem'}}>
                  {semainesType[phaseNum-1].map((item, idx) => (
                    <li key={idx}>{item}</li>
                  ))}
                </ul>
                <p style={{margin:'0.7rem 0 0 0', fontSize:'0.93rem', color:'#7B1FA2', fontStyle:'italic'}}>À adapter selon ton plan et tes envies, en respectant la progression !</p>
              </div>
              {/* Indicateur de progression */}
              <div style={{position:'absolute', right:16, top:16, display:'flex', flexDirection:'column', gap:6}}>
                {Object.keys(programme.phases).map((_, i) => (
                  <span key={i} style={{
                    width:10, height:10, borderRadius:'50%',
                    background: i === idx ? couleursBordure[phaseNum-1] : '#bbb',
                    opacity: i === idx ? 1 : 0.4,
                    marginBottom:2,
                    border: i === idx ? '2px solid #fff' : 'none',
                    transition:'background 0.2s'
                  }} />
                ))}
              </div>
            </section>
          )
        })}
      </div>

      {/* SEMAINE-TYPE déplacé dans chaque phase pour cohérence */}

      {/* LISTE DE COURSES PHASES 1-2 */}
      {Object.keys(listeCoursesGroupee).length > 0 && (
        <div style={{ 
          background: 'white',
          padding: '1.5rem',
          borderRadius: '12px',
          marginBottom: '2rem',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}>
          <h2 style={{ margin: '0 0 1rem 0', fontSize: '1.3rem', color: '#333' }}>
            🛒 Liste de courses (7 premiers jours)
          </h2>
          
          {Object.entries(listeCoursesGroupee).map(([categorie, infos]) => (
            <div key={categorie} style={{ marginBottom: '1rem' }}>
              <h3 style={{ 
                margin: '0 0 0.5rem 0', 
                fontSize: '1rem', 
                color: '#667eea',
                textTransform: 'capitalize'
              }}>
                {categorie}
              </h3>
              <ul style={{ margin: 0, paddingLeft: '1.5rem' }}>
                {infos.aliments.map((aliment, idx) => (
                  <li key={idx} style={{ marginBottom: '0.25rem', fontSize: '0.95rem' }}>
                    {aliment}
                  </li>
                ))}
              </ul>
              <p style={{ 
                margin: '0.5rem 0 0 0', 
                fontSize: '0.85rem', 
                color: '#666',
                fontStyle: 'italic'
              }}>
                Quantités estimées : {infos.quantite_estimee}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* CHECKBOXES DE VALIDATION */}
      <div style={{ 
        background: '#FFF9C4',
        padding: '1.5rem',
        borderRadius: '12px',
        marginBottom: '2rem',
        border: '2px solid #FDD835'
      }}>
        <h2 style={{ margin: '0 0 1rem 0', fontSize: '1.3rem', color: '#F57F17' }}>
          ✅ Engagement
        </h2>
        
        <label style={{ 
          display: 'flex', 
          alignItems: 'flex-start', 
          marginBottom: '1rem',
          cursor: 'pointer',
          fontSize: '1rem'
        }}>
          <input 
            type="checkbox" 
            checked={checkboxLu}
            onChange={(e) => setCheckboxLu(e.target.checked)}
            style={{ 
              marginRight: '0.75rem', 
              marginTop: '0.25rem',
              width: '20px',
              height: '20px',
              cursor: 'pointer'
            }}
          />
          <span>
            J'ai lu et compris le programme de reprise alimentaire sur {programme.duree_reprise_jours} jours, 
            avec ses 4 phases progressives.
          </span>
        </label>

        <label style={{ 
          display: 'flex', 
          alignItems: 'flex-start',
          cursor: 'pointer',
          fontSize: '1rem'
        }}>
          <input 
            type="checkbox" 
            checked={checkboxEngage}
            onChange={(e) => setCheckboxEngage(e.target.checked)}
            style={{ 
              marginRight: '0.75rem', 
              marginTop: '0.25rem',
              width: '20px',
              height: '20px',
              cursor: 'pointer'
            }}
          />
          <span style={{color:'#1976d2', fontWeight:600}}>
            J’ai conscience que je dois m’engager à suivre strictement ce programme pour conserver les bienfaits de mon jeûne et fortifier mon pouvoir de volonté.
          </span>
        </label>
      </div>

      {/* BOUTONS D'ACTION */}
      <div style={{ 
        display: 'flex', 
        gap: '1rem', 
        justifyContent: 'center',
        marginBottom: '2rem'
      }}>
        <Link href="/jeune" style={{ 
          padding: '1rem 2rem',
          background: '#e0e0e0',
          color: '#333',
          textDecoration: 'none',
          borderRadius: '8px',
          fontSize: '1rem',
          fontWeight: '500',
          transition: 'background 0.2s'
        }}>
          ← Retour
        </Link>

        <button
          onClick={handleValider}
          disabled={!peutValider}
          style={{
            padding: '1rem 2rem',
            background: peutValider ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : '#ccc',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '1rem',
            fontWeight: '600',
            cursor: peutValider ? 'pointer' : 'not-allowed',
            opacity: peutValider ? 1 : 0.6,
            transition: 'all 0.2s'
          }}
        >
          {validating ? '⏳ Validation...' : '✅ Valider mon plan'}
        </button>
      </div>

      {/* MESSAGE D'INFO */}
      {(message || error) && (
        <div style={{ 
          background: error ? '#ffebee' : '#E3F2FD',
          padding: '1rem',
          borderRadius: '8px',
          fontSize: '1.05rem',
          color: error ? '#c62828' : '#1565C0',
          textAlign: 'center',
          fontWeight: 600,
          marginBottom: '1rem',
          whiteSpace: 'pre-line'
        }}>
          {error ? `❌ ${error}` : message}
        </div>
      )}
      {!message && !error && (
        <div style={{ 
          background: '#E3F2FD',
          padding: '1rem',
          borderRadius: '8px',
          fontSize: '1.05rem',
          color: '#1565C0',
          textAlign: 'center',
          fontWeight: 600
        }}>
          ✅ Programme généré ! À toi de jouer : chaque jour compte pour ancrer durablement les bienfaits de ton jeûne.<br/>
          <span style={{fontWeight:400, fontSize:'0.95rem'}}>Tu pourras retrouver ton plan validé dans l’onglet « Reprise alimentaire ».</span>
        </div>
      )}

      {/* BOUTON VOIR LE PLAN VALIDÉ */}
      <div style={{textAlign:'center', margin:'2rem 0'}}>
        <button
          onClick={() => {
            if (programme) {
              localStorage.setItem('programmeRepriseValide', JSON.stringify(programme));
            }
            window.location.href = '/reprise alimentaire après jeûne';
          }}
          style={{
            padding:'0.75rem 2rem',
            background:'linear-gradient(135deg, #43cea2 0%, #185a9d 100%)',
            color:'white',
            border:'none',
            borderRadius:'8px',
            fontSize:'1rem',
            fontWeight:'600',
            cursor:'pointer',
            boxShadow:'0 2px 8px rgba(67,206,162,0.08)'
          }}
        >
          👀 Visualiser le plan validé
        </button>
      </div>
    </div>
  )
}
