import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'
import { validerProgrammeReprise } from '../lib/jeuneUtils'
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

  // ============================================
  // USEEFFECT - CHARGEMENT PROGRAMME
  // ============================================
  useEffect(() => {
    const chargerProgramme = async () => {
      try {
        setLoading(true)
        setError(null)

        // 1. Essayer de récupérer depuis Supabase (statut proposition)
        const { data: { user } } = await supabase.auth.getUser()
        
        if (user) {
          const { data, error: fetchError } = await supabase
            .from('reprises_alimentaires')
            .select('*')
            .eq('user_id', user.id)
            .eq('statut', 'proposition')
            .order('created_at', { ascending: false })
            .limit(1)

          if (fetchError) {
            console.error('Erreur Supabase:', fetchError)
          }

          if (data && data.length > 0) {
            setProgramme(data[0])
            setLoading(false)
            return
          }
        }

        // 2. Fallback: récupérer depuis localStorage
        const programmeLocal = localStorage.getItem('programmeReprise')
        if (programmeLocal) {
          const parsed = JSON.parse(programmeLocal)
          setProgramme(parsed)
          setLoading(false)
          return
        }

        // 3. Aucun programme trouvé
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
  const handleValider = async () => {
    if (!peutValider) return

    try {
      setValidating(true)

      // Si programme vient de Supabase, mettre à jour le statut
      if (programme.id) {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
          alert('❌ Utilisateur non connecté')
          setValidating(false)
          return
        }

        const success = await validerProgrammeReprise(programme.id, user.id)
        
        if (success) {
          // Nettoyer localStorage
          localStorage.removeItem('programmeReprise')
          
          // Rediriger vers jeune avec message succès
          router.push('/jeune?validation=success')
        } else {
          alert('❌ Erreur lors de la validation du programme')
          setValidating(false)
        }
      } else {
        // Programme seulement en localStorage, pas encore sauvegardé
        alert('⚠️ Ce programme n\'a pas encore été sauvegardé dans la base de données. Retourne à la page du jeûne pour le sauvegarder d\'abord.')
        setValidating(false)
      }
    } catch (err) {
      console.error('Erreur validation:', err)
      alert('❌ Erreur lors de la validation')
      setValidating(false)
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

      {/* RÉSUMÉ DES 4 PHASES */}
      <div style={{ 
        background: 'white',
        padding: '1.5rem',
        borderRadius: '12px',
        marginBottom: '2rem',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
      }}>
        <h2 style={{ margin: '0 0 1rem 0', fontSize: '1.3rem', color: '#333' }}>
          🗓️ Les 4 phases de ta reprise
        </h2>
        
        {programme.phases && Object.entries(programme.phases).map(([phaseKey, phase]) => {
          const phaseNum = parseInt(phaseKey.replace('phase', ''))
          const couleurs = {
            1: '#E3F2FD',
            2: '#F3E5F5',
            3: '#FFF3E0',
            4: '#E8F5E9'
          }
          const icones = {
            1: '💧',
            2: '🥬',
            3: '🥚',
            4: '🍚'
          }
          
          return (
            <div key={phaseKey} style={{
              background: couleurs[phaseNum] || '#f5f5f5',
              padding: '1rem',
              borderRadius: '8px',
              marginBottom: '0.75rem',
              borderLeft: `4px solid ${['#2196F3', '#9C27B0', '#FF9800', '#4CAF50'][phaseNum - 1]}`
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <strong style={{ fontSize: '1.1rem' }}>
                    {icones[phaseNum]} Phase {phaseNum}
                  </strong>
                  <span style={{ marginLeft: '0.5rem', fontSize: '0.9rem', color: '#666' }}>
                    J{phase.debut} à J{phase.fin} ({phase.fin - phase.debut + 1} jours)
                  </span>
                </div>
              </div>
              <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.95rem', color: '#555' }}>
                {phase.objectif}
              </p>
            </div>
          )
        })}
      </div>

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
          <span>
            Je m'engage à suivre ce protocole médical avec rigueur pour éviter tout choc digestif 
            et préserver les bénéfices du jeûne.
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
      <div style={{ 
        background: '#E3F2FD',
        padding: '1rem',
        borderRadius: '8px',
        fontSize: '0.9rem',
        color: '#1565C0',
        textAlign: 'center'
      }}>
        💡 Une fois validé, ton plan sera activé et tu pourras commencer ta reprise dès la fin de ton jeûne.
      </div>
    </div>
  )
}
