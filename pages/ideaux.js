import { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabaseClient';
import { generateAnchoringPlan } from '../lib/generateAnchoringPlan';

export default function IdeauxPage() {
  const [editDateId, setEditDateId] = useState(null);
  const [editDateValue, setEditDateValue] = useState('');
  // Pour la navigation et le suivi réel du plan (semaine par semaine)
  const [selectedSemaine, setSelectedSemaine] = useState(0);
  const [reel, setReel] = useState([]);
  const [ideaux, setIdeaux] = useState([]);
  const [titre, setTitre] = useState('');
  const [description, setDescription] = useState('');
  const [indicateur, setIndicateur] = useState('');
  const [dateCible, setDateCible] = useState('');
  const [imageFile, setImageFile] = useState(null);
  // Date de début du plan (par défaut 1er du mois courant)
  const defaultDebut = (() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0,10);
  })();
  const [dateDebut, setDateDebut] = useState(defaultDebut);
  const [message, setMessage] = useState('');
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef();

  useEffect(() => {
    fetchIdeaux();
  }, []);

  async function fetchIdeaux() {
    const { data, error } = await supabase
      .from('ideaux')
      .select('*')
      .order('date_cible', { ascending: true });
    if (!error) setIdeaux(data);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setMessage('');
    setUploading(true);
    let imageUrl = null;
    if (imageFile) {
      // Upload image to Supabase Storage
      const fileExt = imageFile.name.split('.').pop();
      const fileName = `${Date.now()}_${Math.random().toString(36).substr(2, 8)}.${fileExt}`;
      const { data: uploadData, error: uploadError } = await supabase.storage.from('ideaux-images').upload(fileName, imageFile);
      if (uploadError) {
        setMessage('Erreur upload image : ' + uploadError.message);
        setUploading(false);
        return;
      }
      const { data: publicUrlData } = supabase.storage.from('ideaux-images').getPublicUrl(fileName);
      imageUrl = publicUrlData?.publicUrl || null;
    }
    // Générer automatiquement le plan d'ancrage à la création
    const planParams = {
      titre,
      indicateur,
      dateCible,
      frequence: 3,
      duree: 15,
      intensite: '7,6 km/h',
      joursProposes: ['lundi', 'mercredi', 'samedi'],
      dateDebut: dateDebut ? new Date(dateDebut) : new Date()
    };
    const planData = generateAnchoringPlan(planParams);
    const { data, error } = await supabase.from('ideaux').insert([
      {
        titre,
        description_emotionnelle: description,
        indicateur_principal: indicateur,
        date_cible: dateCible,
        statut: 'en cours',
        image_url: imageUrl,
        planData,
        plan_existant: true
      },
    ]);
    setUploading(false);
    if (error) {
      setMessage('Erreur : ' + error.message);
    } else {
      setMessage('Idéal ajouté !');
      setTitre('');
      setDescription('');
      setIndicateur('');
      setDateCible('');
      setImageFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      fetchIdeaux();
    }
  }

  // Pour l'affichage du plan généré
  const [planVisible, setPlanVisible] = useState(false);
  const [planData, setPlanData] = useState(null);
  // Pour personnalisation rapide
  const [planParams, setPlanParams] = useState(null);
  const [showDetails, setShowDetails] = useState(false);

  async function handleGeneratePlan(ideal) {
    // Valeurs par défaut personnalisables
    const params = {
      titre: ideal.titre,
      indicateur: ideal.indicateur_principal,
      dateCible: ideal.date_cible,
      frequence: 3,
      duree: 15,
      intensite: '7,6 km/h',
      joursProposes: ['lundi', 'mercredi', 'samedi'],
      dateDebut: new Date()
    };
    setPlanParams(params);
    const plan = generateAnchoringPlan(params);
    setPlanData(plan);
    setShowDetails(false);
    setPlanVisible(true);
    // Initialiser le suivi réel pour le palier courant
    const nbSemaines = params.palierDuree || 4;
    let semaines = [];
    let count = 0;
    for (let m of plan.mois || []) {
      for (let s of m.semaines) {
        if (count < nbSemaines) {
          semaines.push(s);
          count++;
        }
      }
      if (count >= nbSemaines) break;
    }
    setSelectedSemaine(0);
    setReel(semaines.map(s => s.actions.map(() => false)));

    // Sauvegarder le plan dans la table ideaux (champ planData + flag plan_existant)
    if (ideal.id) {
      try {
        await supabase.from('ideaux').update({ planData: plan, plan_existant: true }).eq('id', ideal.id);
        // Optionnel : recharger la liste des idéaux pour affichage immédiat
        fetchIdeaux();
      } catch (e) {
        // noop
      }
    }
  }

  function closePlanModal() {
    setPlanVisible(false);
    setPlanData(null);
    setPlanParams(null);
    setShowDetails(false);
  }

  // Mise à jour rapide des paramètres du plan
  function updatePlanParam(key, value) {
    const newParams = { ...planParams, [key]: value };
    setPlanParams(newParams);
    setPlanData(generateAnchoringPlan(newParams));
  }

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(120deg, #e0f7fa 0%, #fff 100%)', padding: 0 }}>
      <div style={{position:'absolute', top:18, left:24}}>
        <a href="/" style={{display:'inline-block', background:'#00bcd4', color:'#fff', borderRadius:8, padding:'7px 18px', fontWeight:700, fontSize:15, textDecoration:'none', boxShadow:'0 1px 6px #00bcd422', letterSpacing:'0.5px'}}>
          ← Retour à l'accueil
        </a>
      </div>
      {/* Bannière inspirante */}
      <div style={{
        background: 'linear-gradient(90deg, #00bcd4 0%, #43a047 100%)',
        color: '#fff',
        padding: '2.2rem 0 1.2rem 0',
        textAlign: 'center',
        borderBottomLeftRadius: 40,
        borderBottomRightRadius: 40,
        boxShadow: '0 4px 24px #00bcd455',
        marginBottom: 32
      }}>
        <div style={{fontSize: '2.7rem', fontWeight: 900, letterSpacing: 1, marginBottom: 8}}>
          🌟 Mes idéaux & routines
        </div>
        <div style={{fontSize: '1.25rem', fontWeight: 400, opacity: 0.95}}>
          Visualise, clarifie et poursuis tes rêves et routines inspirantes !
        </div>
      </div>

      {/* Formulaire dans une card moderne */}
      <div style={{ maxWidth: 520, margin: '0 auto', marginTop: -48, marginBottom: 40, background: 'rgba(255,255,255,0.98)', borderRadius: 18, boxShadow: '0 4px 24px #00bcd422', padding: 28, position: 'relative', zIndex: 2 }}>
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 18 }}>
          <div style={{ marginBottom: 18 }}>
            <label style={{fontWeight:600, color:'#1976d2'}}>Date de début du plan :<br />
              <input type="date" value={dateDebut} onChange={e => setDateDebut(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: 8, border: '1.5px solid #b2ebf2', fontSize: 16, marginTop: 4 }} />
            </label>
          </div>
            <label style={{fontWeight:600, color:'#1976d2'}}>Rêve / Idéal :<br />
              <input value={titre} onChange={e => setTitre(e.target.value)} required style={{ width: '100%', padding: '10px', borderRadius: 8, border: '1.5px solid #b2ebf2', fontSize: 16, marginTop: 4 }} placeholder="Ex : Être en pleine forme" />
            </label>
          </div>
          <div style={{ marginBottom: 18 }}>
            <label style={{fontWeight:600, color:'#1976d2'}}>Description émotionnelle :<br />
              <input value={description} onChange={e => setDescription(e.target.value)} required style={{ width: '100%', padding: '10px', borderRadius: 8, border: '1.5px solid #b2ebf2', fontSize: 16, marginTop: 4 }} placeholder="Ce que tu ressens, ce que ça t'apporte..." />
            </label>
          </div>
          <div style={{ marginBottom: 18 }}>
            <label style={{fontWeight:600, color:'#1976d2'}}>Indicateur principal (mesurable) :<br />
              <input value={indicateur} onChange={e => setIndicateur(e.target.value)} required style={{ width: '100%', padding: '10px', borderRadius: 8, border: '1.5px solid #b2ebf2', fontSize: 16, marginTop: 4 }} placeholder="Ex : 10 000 pas/jour, 70kg..." />
            </label>
          </div>
          <div style={{ marginBottom: 18 }}>
            <label style={{fontWeight:600, color:'#1976d2'}}>Date cible :<br />
              <input type="date" value={dateCible} onChange={e => setDateCible(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: 8, border: '1.5px solid #b2ebf2', fontSize: 16, marginTop: 4 }} />
            </label>
          </div>
          <div style={{ marginBottom: 18 }}>
            <label style={{fontWeight:600, color:'#1976d2'}}>Image motivante (optionnelle) :<br />
              <input type="file" accept="image/*" ref={fileInputRef} onChange={e => setImageFile(e.target.files[0])} style={{ marginTop: 8 }} />
            </label>
          </div>
          <button type="submit" style={{
            background: uploading ? '#b2ebf2' : 'linear-gradient(90deg, #00bcd4 0%, #43a047 100%)',
            color: '#fff',
            border: 'none',
            borderRadius: 10,
            padding: '12px 32px',
            fontWeight: 800,
            fontSize: 18,
            cursor: uploading ? 'not-allowed' : 'pointer',
            boxShadow: '0 2px 8px #00bcd455',
            letterSpacing: '1px',
            transition: 'background 0.2s, transform 0.2s',
            opacity: uploading ? 0.7 : 1,
          }}
            disabled={uploading}
            onMouseOver={e => {if(!uploading) e.currentTarget.style.transform = 'scale(1.04)'}}
            onMouseOut={e => {if(!uploading) e.currentTarget.style.transform = 'scale(1)'}}
          >
            {uploading ? 'Ajout en cours...' : '➕ Ajouter cet idéal'}
          </button>
          {message && <div style={{ marginTop: 14, color: message.startsWith('Erreur') ? '#e53935' : '#43a047', fontWeight:600 }}>{message}</div>}
        </form>
      </div>

      {/* Séparateur */}
      <div style={{textAlign:'center', margin:'32px 0 18px 0'}}>
        <span style={{display:'inline-block', background:'#00bcd4', height:3, width:60, borderRadius:2, opacity:0.18}}></span>
      </div>

      {/* Liste des idéaux sous forme de cards */}
      <div style={{ maxWidth: 900, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2.2rem', padding: '0 18px 60px 18px' }}>
        {ideaux.length === 0 && (
          <div style={{textAlign:'center', color:'#888', fontSize:18, gridColumn:'1/-1'}}>Aucun idéal enregistré pour le moment.</div>
        )}
        {ideaux.map(ideal => {
          const handleEditDateClick = () => {
            setEditDateId(ideal.id);
            setEditDateValue(ideal.planData?.dateDebut ? ideal.planData.dateDebut.slice(0,10) : defaultDebut);
          };
          const handleEditDateCancel = () => {
            setEditDateId(null);
            setEditDateValue('');
          };
          const handleEditDateSubmit = async (e) => {
            e.preventDefault();
            // On s'assure que la date de début et la date cible sont bien des chaînes ISO yyyy-mm-dd
            let dateCibleStr = ideal.planData?.ideal?.date_cible || ideal.date_cible;
            if (dateCibleStr instanceof Date) dateCibleStr = dateCibleStr.toISOString().slice(0,10);
            const planParams = {
              ...ideal.planData,
              dateDebut: editDateValue,
              dateCible: dateCibleStr,
            };
            try {
              const newPlan = generateAnchoringPlan(planParams);
              await supabase.from('ideaux').update({
                planData: newPlan
              }).eq('id', ideal.id);
              fetchIdeaux();
              setEditDateId(null);
              setEditDateValue('');
            } catch (err) {
              setMessage('Erreur : ' + err.message);
            }
          };
          // Calcul de la progression du palier/mois courant (exemple simplifié)
          // À adapter selon la structure réelle de stockage des séances réalisées
          let progression_palier = null;
          if (ideal.plan_existant && ideal.planData && ideal.planData.mois) {
            // On prend le premier mois/palier
            const mois = ideal.planData.mois[0];
            const prevues = mois.semaines.reduce((acc, s) => acc + s.actions.length, 0);
            // On suppose que ideal.seances_reelles contient les séances faites (à adapter selon ta structure)
            const realises = ideal.seances_reelles ? ideal.seances_reelles.filter(s => s.fait && s.mois === mois.numero && s.annee === mois.annee).length : 0;
            const pourcentage = prevues > 0 ? Math.round((realises/prevues)*100) : 0;
            progression_palier = { realise: realises, prevues, pourcentage };
          }
          return (
            <div key={ideal.id} style={{
              background: '#fff',
              borderRadius: 16,
              boxShadow: '0 2px 16px #00bcd422',
              padding: '1.5rem 1.7rem 1.2rem 1.7rem',
              position: 'relative',
              transition: 'box-shadow 0.2s, transform 0.2s',
              borderLeft: `7px solid ${ideal.statut === 'en cours' ? '#00bcd4' : ideal.statut === 'atteint' ? '#43a047' : '#ffa726'}`,
              minHeight: 180,
              marginBottom: 0,
              cursor: 'pointer',
            }}
              onMouseOver={e => {e.currentTarget.style.boxShadow='0 6px 32px #00bcd433';e.currentTarget.style.transform='translateY(-3px)'}}
              onMouseOut={e => {e.currentTarget.style.boxShadow='0 2px 16px #00bcd422';e.currentTarget.style.transform='none'}}
            >
              {/* Affichage image motivante floue si présente */}
              {ideal.image_url && (
                <div style={{textAlign:'center', marginBottom:12}}>
                  <img src={ideal.image_url} alt="visuel idéal" style={{
                    width:'100%',
                    maxHeight:160,
                    objectFit:'cover',
                    borderRadius:12,
                    filter:'blur(12px)',
                    transition:'filter 0.5s',
                    boxShadow:'0 2px 8px #00bcd422',
                    margin:'0 auto',
                    display:'block',
                  }} />
                </div>
              )}
              <div style={{fontSize: '2.1rem', marginBottom: 6}}>
                {ideal.statut === 'atteint' ? '🏅' : ideal.statut === 'en cours' ? '🌱' : '🎯'}
              </div>
              <div style={{fontWeight: 800, fontSize: '1.25rem', color: '#1976d2', marginBottom: 4}}>{ideal.titre}</div>
              {/* Flou progressif sur l'image motivante selon la progression globale */}
              <div style={{color:'#888', fontSize:15, marginBottom: 8}}>{ideal.description_emotionnelle}</div>
              <div style={{fontSize:15, marginBottom: 6}}><b>Indicateur :</b> {ideal.indicateur_principal}</div>
              <div style={{fontSize:15, marginBottom: 6}}><b>Date cible :</b> {ideal.date_cible || '—'}</div>
              <div style={{position:'absolute', top:18, right:18}}>
                <span style={{
                  display:'inline-block',
                  background: ideal.statut === 'atteint' ? '#43a047' : ideal.statut === 'en cours' ? '#00bcd4' : '#ffa726',
                  color:'#fff',
                  borderRadius: 8,
                  fontWeight:700,
                  fontSize:13,
                  padding:'4px 12px',
                  letterSpacing:0.5,
                  boxShadow:'0 1px 4px #00bcd422',
                }}>{ideal.statut || 'en cours'}</span>
              </div>
              {/* Boutons plan d'action */}
              <div style={{marginTop:18, textAlign:'center', display:'flex', justifyContent:'center', gap:12}}>
                <button onClick={handleEditDateClick} style={{background:'#fff', color:'#1976d2', border:'1px solid #b2ebf2', borderRadius:8, padding:'4px 12px', fontWeight:600, cursor:'pointer'}}>Modifier date de début</button>
                {editDateId === ideal.id && (
                  <form style={{display:'inline-block', marginLeft:8}} onSubmit={handleEditDateSubmit}>
                    <input type="date" value={editDateValue} onChange={e => setEditDateValue(e.target.value)} style={{padding:'4px 8px', borderRadius:6, border:'1px solid #b2ebf2', fontWeight:600, fontSize:15, marginRight:6}} />
                    <button type="submit" style={{background:'#43a047', color:'#fff', border:'none', borderRadius:6, padding:'4px 10px', fontWeight:700, marginRight:4}}>Valider</button>
                    <button type="button" onClick={handleEditDateCancel} style={{background:'#e53935', color:'#fff', border:'none', borderRadius:6, padding:'4px 10px', fontWeight:700}}>Annuler</button>
                  </form>
                )}
                <button onClick={() => handleGeneratePlan(ideal)} style={{
                  }}>Voir mon plan</button>
              </div>
            </div>
          );
  })
  })
        {/* Modale d'affichage du plan généré */}
        {planVisible && planData && planParams && (
          <div style={{position:'fixed', top:0, left:0, width:'100vw', height:'100vh', background:'rgba(0,0,0,0.25)', zIndex:1000, display:'flex', alignItems:'center', justifyContent:'center'}}>
            <div style={{background:'#fff', borderRadius:16, boxShadow:'0 4px 24px #00bcd455', padding:'2.2rem 2.5rem', minWidth:340, maxWidth:600, maxHeight:'90vh', overflow:'auto', position:'relative'}}>
              <button onClick={closePlanModal} style={{position:'absolute', top:12, right:16, background:'none', border:'none', fontSize:22, color:'#888', cursor:'pointer'}}>×</button>
              <h2 style={{color:'#1976d2', marginTop:0, marginBottom:8}}>🚀 Proposition de plan d'action</h2>
              <div style={{background:'#e0f7fa', borderRadius:10, padding:'12px 18px', marginBottom:18}}>
                <div style={{fontWeight:700, color:'#00bcd4', fontSize:18, marginBottom:4}}>
                  {planData.ideal.titre}
                </div>
                <div style={{color:'#1976d2', fontWeight:600, marginBottom:2}}>Indicateur : {planData.ideal.indicateur}</div>
                <div style={{color:'#888', marginBottom:2}}>Date cible : {planData.ideal.date_cible}</div>
                <div style={{color:'#1976d2', fontWeight:600, marginBottom:2}}>
                  {(() => {
                    const moisLettres = ['Janvier','Février','Mars','Avril','Mai','Juin','Juillet','Août','Septembre','Octobre','Novembre','Décembre'];
                    if (planData.mois && planData.mois[0]) {
                      const m = planData.mois[0];
                      return `Palier 1 : ${moisLettres[(m.numero-1)%12]} ${m.annee}`;
                    }
                    return '';
                  })()}
                </div>
                <div style={{marginBottom:10, color:'#1976d2', fontWeight:500}}>
                  Durée du palier initial :
                  <select value={planParams.palierDuree || 4} onChange={e=>updatePlanParam('palierDuree', parseInt(e.target.value))} style={{marginLeft:8, borderRadius:6, border:'1px solid #b2ebf2', padding:'2px 8px', fontWeight:600, fontSize:15}}>
                    <option value={2}>2 semaines</option>
                    <option value={4}>4 semaines (1 mois)</option>
                    <option value={8}>8 semaines (2 mois)</option>
                  </select>
                </div>
                <div style={{color:'#43a047', fontWeight:600, marginBottom:2}}>
                  {(() => {
                    const nbSemaines = planParams.palierDuree || 4;
                    let semaines = [];
                    let count = 0;
                    for (let m of planData.mois || []) {
                      for (let s of m.semaines) {
                        if (count < nbSemaines) {
                          semaines.push(s);
                          count++;
                        }
                      }
                      if (count >= nbSemaines) break;
                    }
                    return semaines.reduce((acc, s) => acc + s.actions.length, 0);
                  })()} séances prévues ({planData.objectif.frequence_par_semaine}x/semaine)
                </div>
                <div style={{color:'#ffa726', fontWeight:600, marginBottom:2}}>
                  Jours proposés : {planParams.joursProposes.map(j => <span key={j} style={{background:'#00bcd4', color:'#fff', borderRadius:6, padding:'2px 10px', marginRight:6, fontSize:13, fontWeight:700}}>{j}</span>)}
                </div>
                <div style={{marginTop:8, color:'#1976d2', fontWeight:500}}>
                  Durée : <input type="number" min="5" max="180" value={planParams.duree} onChange={e=>updatePlanParam('duree', parseInt(e.target.value)||15)} style={{width:50, borderRadius:6, border:'1px solid #b2ebf2', padding:'2px 6px', fontWeight:600, fontSize:15, marginRight:6}} /> minutes
                  &nbsp;| Intensité : <input type="text" value={planParams.intensite} onChange={e=>updatePlanParam('intensite', e.target.value)} style={{width:80, borderRadius:6, border:'1px solid #b2ebf2', padding:'2px 6px', fontWeight:600, fontSize:15}} />
                </div>
                <div style={{marginTop:8, color:'#1976d2', fontWeight:500}}>
                  Fréquence : <input type="number" min="1" max="7" value={planParams.frequence} onChange={e=>updatePlanParam('frequence', parseInt(e.target.value)||3)} style={{width:40, borderRadius:6, border:'1px solid #b2ebf2', padding:'2px 6px', fontWeight:600, fontSize:15, marginRight:6}} /> fois/semaine
                </div>
                <div style={{marginTop:8, color:'#1976d2', fontWeight:500}}>
                  Jours : {['lundi','mardi','mercredi','jeudi','vendredi','samedi','dimanche'].map(jour => (
                    <label key={jour} style={{marginRight:8, fontWeight:600, fontSize:14}}>
                      <input type="checkbox" checked={planParams.joursProposes.includes(jour)} onChange={e => {
                        let jours = planParams.joursProposes.slice();
                        if(e.target.checked) jours.push(jour); else jours = jours.filter(j => j!==jour);
                        updatePlanParam('joursProposes', Array.from(new Set(jours)));
                      }} /> {jour}
                    </label>
                  ))}
                </div>
              </div>
              <div style={{marginBottom:18, color:'#1976d2', fontWeight:700, fontSize:16}}>
                {showDetails ? 'Détail du plan (semaine par semaine)' : 'Résumé du plan'}
              </div>
              {!showDetails && (
                <div style={{textAlign:'center', marginBottom:18}}>
                  <button onClick={()=>setShowDetails(true)} style={{background:'#00bcd4', color:'#fff', border:'none', borderRadius:8, padding:'8px 22px', fontWeight:700, fontSize:15, cursor:'pointer', boxShadow:'0 1px 6px #00bcd422', letterSpacing:'0.5px'}}>Voir le détail semaine par semaine</button>
                </div>
              )}
              {showDetails && planData.mois && (() => {
                // Navigation semaine par semaine sur la durée du palier
                const nbSemaines = planParams.palierDuree || 4;
                let semaines = [];
                let count = 0;
                for (let m of planData.mois) {
                  for (let s of m.semaines) {
                    if (count < nbSemaines) {
                      semaines.push({ ...s, mois: m.numero, annee: m.annee });
                      count++;
                    }
                  }
                  if (count >= nbSemaines) break;
                }
                // On passe de reel: boolean[][] à reel: {fait:boolean, duree:number|null, bonus?:boolean, date?:string}[][]
                const handleCheck = (semIdx, actIdx) => {
                  setReel(reel => {
                    const copy = reel.map(arr => arr.map(obj => ({...obj})));
                    copy[semIdx][actIdx].fait = !copy[semIdx][actIdx].fait;
                    if (copy[semIdx][actIdx].fait && !copy[semIdx][actIdx].duree) {
                      copy[semIdx][actIdx].duree = semaines[semIdx].actions[actIdx].duree || planParams.duree || 15;
                    }
                    return copy;
                  });
                };
                const handleDureeChange = (semIdx, actIdx, val) => {
                  setReel(reel => {
                    const copy = reel.map(arr => arr.map(obj => ({...obj})));
                    copy[semIdx][actIdx].duree = parseInt(val)||null;
                    return copy;
                  });
                };
                // Ajouter une séance bonus
                const handleAddBonus = (semIdx) => {
                  setReel(reel => {
                    const copy = reel.map(arr => arr.map(obj => ({...obj})));
                    copy[semIdx].push({ fait: true, duree: planParams.duree || 15, bonus: true, date: semaines[semIdx].debut });
                    return copy;
                  });
                };
                return (
                  <div style={{marginBottom:18, padding:'12px 16px', background:'#e0f7fa', borderRadius:10, maxHeight:400, overflowY:'auto'}}>
                    <div style={{display:'flex', gap:8, marginBottom:12, flexWrap:'wrap'}}>
                      {semaines.map((s, i) => (
                        <button key={i} onClick={()=>setSelectedSemaine(i)} style={{background: selectedSemaine===i?'#00bcd4':'#b2ebf2', color:selectedSemaine===i?'#fff':'#1976d2', border:'none', borderRadius:6, padding:'4px 14px', fontWeight:700, fontSize:15, cursor:'pointer'}}>
                          Semaine {i+1}
                        </button>
                      ))}
                    </div>
                    <div style={{fontWeight:700, color:'#00bcd4', marginBottom:6}}>
                      Semaine {selectedSemaine+1} ({semaines[selectedSemaine].debut})
                    </div>
                    <div style={{marginBottom:8, color:'#1976d2', fontWeight:600}}>
                      Prévu : {semaines[selectedSemaine].actions.length} séances / Réel : {reel[selectedSemaine]?.filter(Boolean).length || 0} séances
                    </div>
                    <ul style={{margin:'6px 0 0 18px', padding:0}}>
                      {semaines[selectedSemaine].actions.map((a, j) => (
                        <li key={j} style={{marginBottom:6, display:'flex', alignItems:'center'}}>
                          <input type="checkbox" checked={reel[selectedSemaine]?.[j]?.fait || false} onChange={()=>handleCheck(selectedSemaine, j)} style={{marginRight:8}} />
                          <span style={{background:'#00bcd4', color:'#fff', borderRadius:6, padding:'2px 10px', fontSize:13, fontWeight:700, marginRight:6}}>{a.jour}</span>
                          {a.date} — {a.action_type}, {a.moment}
                          {reel[selectedSemaine]?.[j]?.fait && (
                            <input type="number" min="1" max="300" value={reel[selectedSemaine][j].duree || ''} onChange={e=>handleDureeChange(selectedSemaine, j, e.target.value)} placeholder="Durée (min)" style={{marginLeft:10, width:60, borderRadius:6, border:'1px solid #b2ebf2', padding:'2px 6px', fontWeight:600}} />
                          )}
                        </li>
                      ))}
                      {/* Affichage des séances bonus */}
                      {reel[selectedSemaine]?.filter(obj => obj.bonus).map((b, idx) => (
                        <li key={'bonus'+idx} style={{marginBottom:6, display:'flex', alignItems:'center', background:'#ffe082', borderRadius:6, padding:'2px 8px'}}>
                          <span style={{background:'#ffa726', color:'#fff', borderRadius:6, padding:'2px 10px', fontSize:13, fontWeight:700, marginRight:6}}>Bonus</span>
                          <input type="date" value={b.date || ''} onChange={e=>{
                            const val = e.target.value;
                            setReel(reel => {
                              const copy = reel.map(arr => arr.map(obj => ({...obj})));
                              // Trouver l'index réel dans le tableau (bonus = tous les objets avec .bonus)
                              let bonusIdx = 0;
                              for(let i=0;i<copy[selectedSemaine].length;i++){
                                if(copy[selectedSemaine][i].bonus){
                                  if(bonusIdx===idx){
                                    copy[selectedSemaine][i].date = val;
                                    break;
                                  }
                                  bonusIdx++;
                                }
                              }
                              return copy;
                            });
                          }} style={{marginLeft:6, marginRight:6, borderRadius:6, border:'1px solid #b2ebf2', padding:'2px 6px', fontWeight:600}} />
                          <input type="number" min="1" max="300" value={b.duree || ''} onChange={e=>handleDureeChange(selectedSemaine, semaines[selectedSemaine].actions.length + idx, e.target.value)} placeholder="Durée (min)" style={{marginLeft:6, width:60, borderRadius:6, border:'1px solid #b2ebf2', padding:'2px 6px', fontWeight:600}} />
                        </li>
                      ))}
                    </ul>
                    <button onClick={()=>handleAddBonus(selectedSemaine)} style={{marginTop:8, background:'#ffa726', color:'#fff', border:'none', borderRadius:8, padding:'6px 18px', fontWeight:700, fontSize:15, cursor:'pointer'}}>Ajouter une séance bonus</button>
                    <div style={{marginTop:10, color: (reel[selectedSemaine]?.filter(Boolean).length || 0) === semaines[selectedSemaine].actions.length ? '#43a047' : '#ffa726', fontWeight:600}}>
                      {(reel[selectedSemaine]?.filter(Boolean).length || 0) === semaines[selectedSemaine].actions.length
                        ? '✅ Toutes les séances prévues sont réalisées !'
                        : (reel[selectedSemaine]?.filter(Boolean).length || 0) > semaines[selectedSemaine].actions.length
                          ? '🔥 Tu as dépassé l’objectif de la semaine !'
                          : 'Continue, tu peux encore valider des séances cette semaine.'}
                    </div>
                  </div>
                );
              })()}
              <div style={{marginTop:18, textAlign:'center'}}>
                <button onClick={closePlanModal} style={{background:'#43a047', color:'#fff', border:'none', borderRadius:8, padding:'10px 28px', fontWeight:700, fontSize:16, cursor:'pointer', boxShadow:'0 1px 6px #00bcd422', letterSpacing:'0.5px', marginRight:12}}>Valider ce plan</button>
                {showDetails && (
                  <button onClick={()=>setShowDetails(false)} style={{background:'#ffa726', color:'#fff', border:'none', borderRadius:8, padding:'10px 28px', fontWeight:700, fontSize:16, cursor:'pointer', boxShadow:'0 1px 6px #00bcd422', letterSpacing:'0.5px'}}>Revenir au résumé</button>
                )}
              </div>
              <div style={{marginTop:18, color:'#1976d2', fontWeight:600, textAlign:'center', fontSize:15}}>
                💡 Chaque séance réalisée te rapproche de ton idéal. Tu peux ajuster ce plan avant de le valider !
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
