


import React, { useState, useEffect } from 'react';
import { getAnalyse3DerniersJoursRepas } from '../lib/analyseRepas3Jours';
import { genererAnalyseSynthétiqueRepas } from '../lib/analyseRepasSynthétique';
import styles from './StartPreparationModal.module.css';


const StartPreparationModal = ({ isOpen, onClose, onSave, analyseComportement = [], userId }) => {
  // Date de début de préparation (doit être déclarée AVANT tout usage)
  const [startDate, setStartDate] = useState('');
  // Durée du jeûne souhaitée (en jours)
  const [dureeJeune, setDureeJeune] = useState('');
  // Analyse automatique des 3 derniers jours de repas
  const [analyse3Jours, setAnalyse3Jours] = useState([]);
  // Analyse synthétique métier (extras, repas tardifs, conseils...)
  const [analyseSynth, setAnalyseSynth] = useState([]);
  // Affichage/masquage du détail des repas ("En savoir plus")
  const [showRepasDetail, setShowRepasDetail] = useState(false);
  // L'analyse comportementale doit toujours être basée sur la date du jour (création du plan), pas sur startDate !
  // Mode démo : forcer l'utilisation de Supabase même sans userId (pour tests locaux)
  useEffect(() => {
    if (isOpen) {
      const todayStr = new Date().toISOString().slice(0,10);
      // Utiliser un userId de démo si non fourni
      const demoUserId = userId || '00000000-0000-0000-0000-000000000000';
      getAnalyse3DerniersJoursRepas(demoUserId, todayStr).then(res => {
        setAnalyse3Jours(res);
        setAnalyseSynth(genererAnalyseSynthétiqueRepas(res));
      });
    }
  }, [userId, isOpen]);
  // Date et heure du jour (affichage en haut de la modale, côté client uniquement)
  const [dateHeure, setDateHeure] = useState({ date: '', heure: '' });
  useEffect(() => {
    const now = new Date();
    setDateHeure({
      date: now.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' }),
      heure: now.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
    });
  }, []);
  // La durée recommandée est 30 jours (métier)
  const dureeRecommandee = 30;
  // Durée réelle calculée automatiquement (date du jour -> date de début du jeûne)
  const [dureeReelle, setDureeReelle] = useState(null);
  const [goal, setGoal] = useState('');
  // Message personnel (texte ou audio/vidéo)
  const [msgType, setMsgType] = useState('texte');
  const [msgTexte, setMsgTexte] = useState('');
  const [msgAudio, setMsgAudio] = useState(null); // à brancher sur un composant d’enregistrement
  // Projection réussite (texte ou audio/vidéo)
  const [projType, setProjType] = useState('texte');
  const [projTexte, setProjTexte] = useState('');
  const [projAudio, setProjAudio] = useState(null);

  const criteresMetier = [
    { id: 1, label: "Respect strict des quantités à chaque repas", jalon: 30, phase: "Fondations", conseil: "Prends le temps de peser tes portions." },
    { id: 2, label: "Supprimer les féculents le soir (lun-dim)", jalon: 17, phase: "Palier 1", conseil: "Privilégie les légumes et protéines le soir." },
    { id: 3, label: "Action immédiate après le repas (marche/ménage)", jalon: 17, phase: "Palier 1", conseil: "Bouge dès la fin du repas pour activer la digestion." },
    { id: 4, label: "Éliminer tous produits transformés", jalon: 14, phase: "Palier 2", conseil: "Lis les étiquettes, vise le naturel !" },
    { id: 5, label: "Éliminer toutes sucreries", jalon: 14, phase: "Palier 2", conseil: "Remplace par un fruit ou une tisane." },
    { id: 6, label: "2 jours de jeûne plein (préparation métabolique)", jalon: 12, phase: "Palier 3", conseil: "Prévois des boissons chaudes, repose-toi." },
    { id: 7, label: "2 litres d’eau par jour (suivi automatique)", jalon: 7, phase: "Palier 4", conseil: "Garde une gourde à portée de main." },
    { id: 8, label: "Pas de repas après 19h00", jalon: 7, phase: "Palier 4", conseil: "Anticipe tes repas, prépare à l’avance." },
    { id: 9, label: "Plage alimentaire limitée à 45 minutes par repas", jalon: 7, phase: "Palier 4", conseil: "Mange lentement, savoure chaque bouchée." },
  ];

  // Calcul dynamique des phases et critères réalisables
  function addDays(date, days) {
    const d = new Date(date);
    d.setDate(d.getDate() + days);
    return d;
  }

  // Définition des phases métier avec bornes dynamiques
  const phasesMetier = [
    {
      key: 'fondations',
      label: 'J-30 à J-18 : FONDATIONS',
      objectif: "Stabiliser les quantités et installer une base alimentaire saine pour la suite.",
      debut: 30,
      fin: 18,
      criteres: [criteresMetier[0]],
    },
    {
      key: 'palier1',
      label: 'J-17 : Palier 1',
      objectif: "Réduire les glucides le soir et activer la digestion après chaque repas.",
      debut: 17,
      fin: 15,
      criteres: [criteresMetier[1], criteresMetier[2]],
    },
    {
      key: 'palier2',
      label: 'J-14 : Palier 2',
      objectif: "Éliminer les produits transformés et sucrés pour alléger la charge métabolique.",
      debut: 14,
      fin: 13,
      criteres: [criteresMetier[3], criteresMetier[4]],
    },
    {
      key: 'palier3',
      label: 'J-12 : Palier 3',
      objectif: "Préparer le corps à la cétose par 2 jours de jeûne plein.",
      debut: 12,
      fin: 8,
      criteres: [criteresMetier[5]],
    },
    {
      key: 'palier4',
      label: 'J-7 : Palier 4',
      objectif: "Optimiser l’hydratation, limiter la fenêtre alimentaire et avancer l’heure du dernier repas.",
      debut: 7,
      fin: 1,
      criteres: [criteresMetier[6], criteresMetier[7], criteresMetier[8]],
    },
    {
      key: 'lancement',
      label: 'J-0 : Lancement du jeûne',
      objectif: "Entrer dans la phase de jeûne avec un corps prêt et sécurisé.",
      debut: 0,
      fin: 0,
      criteres: [],
    },
  ];

  // Calcul des bornes réelles de chaque phase (dates)
  let phasesAffichees = [];
  let jalonActuel = null;
  let jourCourant = null;
  useEffect(() => {
    if (startDate) {
      const dateFin = new Date(startDate);
      const today = new Date();
      today.setHours(0,0,0,0);
      // Calcul de la durée réelle (en jours)
      const diff = Math.max(0, Math.round((dateFin - today) / (1000 * 60 * 60 * 24)));
      setDureeReelle(diff);
    } else {
      setDureeReelle(null);
    }
  }, [startDate]);

  if (startDate && dureeReelle !== null) {
    const dateFin = new Date(startDate);
    const today = new Date();
    today.setHours(0,0,0,0);
    jourCourant = dureeReelle;
    phasesAffichees = phasesMetier.map(phase => {
      // Calcul des bornes réelles
      const datePhaseDebut = addDays(dateFin, -phase.debut);
      const datePhaseFin = addDays(dateFin, -phase.fin);
      // Phase réalisable ?
      const phaseRealisable = dureeReelle >= phase.debut;
      // Critères réalisables ?
      const criteres = phase.criteres.map(critere => {
        const critereRealisable = dureeReelle >= critere.jalon;
        // Critère actif du jour ?
        const isActif = !jalonActuel && jourCourant === critere.jalon;
        if (isActif) jalonActuel = critere;
        return {
          ...critere,
          realisable: critereRealisable,
          isActif,
          dateDebut: datePhaseDebut,
          dateFin: datePhaseFin,
        };
      });
      return {
        ...phase,
        dateDebut: datePhaseDebut,
        dateFin: datePhaseFin,
        realisable: phaseRealisable,
        criteres,
      };
    });
    // Si aucun critère actif trouvé, prendre le plus proche à venir
    if (!jalonActuel) {
      for (const phase of phasesAffichees) {
        for (const critere of phase.criteres) {
          if (critere.realisable && jourCourant > critere.jalon) {
            jalonActuel = critere;
            break;
          }
        }
        if (jalonActuel) break;
      }
    }
  }

  const handleSave = () => {
    if (!startDate || !goal || !dureeJeune) {
      alert('Veuillez remplir tous les champs obligatoires (date, durée du jeûne, objectif).');
      return;
    }
    onSave({ startDate, duration: dureeJeune, goal, msgType, msgTexte, msgAudio, projType, projTexte, projAudio });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className={styles.modal} role="dialog" aria-modal="true" aria-labelledby="modal-title" aria-live="polite">
      <div className={styles['modal-content']} style={{border: '2.5px solid #334155', boxShadow: '0 0 0 4px #e0e7ef'}}>
        {/* Cadre général et header immersif */}
        <div style={{borderBottom:'2px solid #e0e7ef', paddingBottom:'0.5rem', marginBottom:'1.2rem', display:'flex', alignItems:'center', justifyContent:'space-between'}}>
          <h2 id="modal-title" style={{margin:0, fontWeight:700, fontSize:'1.35rem', color:'#0f172a', letterSpacing:'-0.5px'}}>🌙 Démarrer ma préparation au jeûne</h2>
          {dateHeure.date && dateHeure.heure && (
            <span style={{fontSize:'0.98rem', color:'#64748b', fontWeight:500}}>{`Aujourd’hui : ${dateHeure.date} — ${dateHeure.heure}`}</span>
          )}
        </div>
        {/* Résumé période et objectif */}
        <div className={styles['modal-info']} style={{borderBottom:'1.5px solid #e0e7ef', paddingBottom:'0.7rem', marginBottom:'1.1rem'}}>
          <div><b>📅 Date de début choisie :</b> <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} /></div>
          <div style={{marginTop:4}}>
            <b>⏳ Durée de préparation :</b> {dureeReelle !== null ? `${dureeReelle} jours` : '—'}
            <span style={{marginLeft:8, color:'#64748b', fontSize:'0.95em'}}>
              (du {dureeReelle !== null && startDate ? (new Date(new Date(startDate).getTime() - dureeReelle*24*60*60*1000)).toLocaleDateString('fr-FR') : '—'} au {startDate ? new Date(startDate).toLocaleDateString('fr-FR') : '—'})
            </span>
          </div>
          <div style={{marginTop:4}}>
            <b>🥕 Durée du jeûne souhaitée :</b> <input type="number" min="1" max="21" value={dureeJeune} onChange={e => setDureeJeune(e.target.value)} placeholder="Ex : 5" style={{width:60,marginLeft:6,marginRight:6}} /> jours
            <span style={{marginLeft:8, color:'#64748b', fontSize:'0.95em'}}>(généralement 5 à 10 jours)</span>
          </div>
          <div><b>🎯 Objectif :</b> <input type="text" value={goal} onChange={e => setGoal(e.target.value)} placeholder="Ex : Jeûne de 5 jours le 15/12/2025" /></div>
        </div>
        {/* Feedback métier si durée réelle < recommandée */}
        {dureeReelle !== null && dureeReelle < dureeRecommandee && (
          <div style={{background:'#fef3c7',color:'#92400e',padding:'8px 12px',borderRadius:8,margin:'10px 0',fontWeight:500, border:'1.5px solid #fde68a'}}>
            ⚠️ Le temps de préparation recommandé est de {dureeRecommandee} jours.<br/>
            Il vous reste seulement {dureeReelle} jours avant le jeûne.<br/>
            Pensez à mieux organiser la prochaine fois pour bénéficier de toutes les phases de préparation !
          </div>
        )}
        {/* Séparateur visuel */}
        <hr style={{border:'none', borderTop:'2px dashed #cbd5e1', margin:'1.2rem 0 1.1rem 0'}} />
        {/* Phases de préparation */}
        <section className={styles['modal-phases']}>
          <h3 style={{marginBottom:'0.7rem'}}>🗓️ Phases de préparation</h3>
          <ul style={{paddingLeft:0}}>
            {phasesAffichees.length > 0 ?
              [...phasesAffichees].sort((a, b) => {
                if (a.realisable === b.realisable) return 0;
                return a.realisable ? -1 : 1;
              }).map(phase => (
                <li key={phase.label} style={{
                  opacity: phase.realisable ? 1 : 0.5,
                  listStyle: 'none',
                  marginBottom: 8,
                  background: phase.realisable ? '#f1f5f9' : '#e2e8f0',
                  borderRadius: 8,
                  padding: '8px 12px',
                  border: phase.realisable ? '2px solid #38bdf8' : '1px dashed #94a3b8',
                  position: 'relative',
                  boxShadow: phase.realisable ? '0 2px 8px 0 rgba(56,189,248,0.07)' : 'none',
                }}>
                  <b>{phase.label}</b>
                  <span style={{fontSize:'0.92em',marginLeft:8,color:'#64748b'}}>
                    {phase.dateDebut && phase.dateFin ?
                      `(${phase.dateDebut.toLocaleDateString('fr-FR')} au ${phase.dateFin.toLocaleDateString('fr-FR')})`
                      : ''}
                  </span>
                  {phase.objectif && (
                    <div style={{fontStyle:'italic',color:'#0e7490',margin:'4px 0 4px 0',fontSize:'0.98em',background:'#e0f2fe',padding:'4px 8px',borderRadius:6}}>
                      🎯 Objectif : {phase.objectif}
                    </div>
                  )}
                  <ul style={{marginTop:4,marginBottom:0,paddingLeft:18}}>
                    {phase.criteres.map(critere => (
                      <li key={critere.label} style={{
                        color: critere.isActif ? '#0ea5e9' : critere.realisable ? '#334155' : '#94a3b8',
                        fontWeight: critere.isActif ? 700 : 400,
                        textDecoration: critere.realisable ? 'none' : 'line-through',
                        display: 'flex',
                        alignItems: 'center',
                        opacity: critere.realisable ? 1 : 0.7,
                        background: critere.isActif ? '#e0f2fe' : 'none',
                        borderRadius: critere.isActif ? '6px' : '0',
                        padding: critere.isActif ? '2px 6px' : '0',
                        marginBottom: critere.isActif ? '2px' : '0',
                      }}>
                        {!critere.realisable && <span title="Critère non réalisable" style={{marginRight:4}}>🔒</span>}
                        {critere.label}
                        {critere.isActif && <span style={{marginLeft:6,fontSize:'0.95em'}}>⬅️</span>}
                        {!critere.realisable && (
                          <span style={{marginLeft:8, fontSize:'0.88em', color:'#64748b'}}>
                            (Débloqué à J-{critere.jalon})
                          </span>
                        )}
                      </li>
                    ))}
                  </ul>
                </li>
              ))
              : <li style={{color:'#64748b'}}>Veuillez saisir une date et une durée pour voir les phases.</li>}
          </ul>
        </section>
        {/* Bloc jalon/conseil du jour */}
        {jalonActuel && (
          <section className={styles['modal-jalon']} aria-live="polite">
            <div className={styles['jalon-today']}>
              <span>📍 Aujourd’hui tu es à : <b>J-{jalonActuel.jalon}</b></span>
              <div className={styles['jalon-critere']}>
                ➡️ Première étape : <b>{jalonActuel.label}</b>
                <div className={styles['jalon-conseil']}>💡 {jalonActuel.conseil}</div>
              </div>
            </div>
          </section>
        )}
        {/* Séparateur visuel */}
        <hr style={{border:'none', borderTop:'2px dashed #cbd5e1', margin:'1.2rem 0 1.1rem 0'}} />
        {/* DEBUG: Affichage des états pour diagnostic + contenu brut localStorage.repas + bouton de rafraîchissement */}
        <div style={{background:'#fef9c3',color:'#b45309',fontSize:'0.95em',padding:'4px 8px',borderRadius:6,margin:'8px 0'}}>
          <b>DEBUG</b> userId: {userId ? userId : <span style={{color:'#c00'}}>non défini</span>} | analyse3Jours: {analyse3Jours.length} | isOpen: {isOpen ? 'oui' : 'non'}<br/>
          startDate (date métier): <span style={{color:'#0ea5e9'}}>{startDate ? (new Date(startDate)).toLocaleDateString('fr-FR') : <span style={{color:'#c00'}}>non défini</span>}</span><br/>
          date système: <span style={{color:'#64748b'}}>{(new Date()).toLocaleDateString('fr-FR')}</span><br/>
          date de référence utilisée pour l'analyse: <span style={{color:'#0ea5e9'}}>{isOpen ? (new Date()).toLocaleDateString('fr-FR') : <span style={{color:'#c00'}}>non analysé</span>}</span>
          <details style={{marginTop:'6px'}}>
            <summary style={{cursor:'pointer'}}>Voir contenu brut localStorage.repas</summary>
            <pre style={{maxHeight:180,overflow:'auto',background:'#fff7ed',color:'#92400e',fontSize:'0.93em',padding:'6px',borderRadius:'4px',marginTop:'4px'}}>
              {typeof window !== 'undefined' && window.localStorage.getItem('repas') ? window.localStorage.getItem('repas') : 'Aucune entrée "repas" dans localStorage'}
            </pre>
          </details>
          <button type="button" style={{marginTop:8,background:'#fde68a',color:'#92400e',border:'1px solid #fbbf24',borderRadius:4,padding:'2px 10px',fontSize:'0.97em',cursor:'pointer'}}
            onClick={async () => {
              if (typeof window !== 'undefined') {
                // Forcer la resynchronisation depuis Supabase (sans userId)
                const todayStr = new Date().toISOString().slice(0,10);
                const repas = await getAnalyse3DerniersJoursRepas(undefined, todayStr);
                window.localStorage.setItem('repas', JSON.stringify(repas.flatMap(j => j.repas)));
                // Rafraîchir l'analyse
                setAnalyse3Jours(await getAnalyse3DerniersJoursRepas(undefined, todayStr));
              }
            }}>
            🔄 Rafraîchir les repas (forcer synchro Supabase → localStorage)
          </button>
        </div>
        {/* Zone message personnel (texte OU audio/vidéo) */}
        <section className={styles['modal-message']}>
          <h4>📝 Message à toi-même (optionnel)</h4>
          <div style={{color:'#64748b',fontSize:'0.97em',marginBottom:4}}>
            <b>À quoi ça sert ?</b> Ce message est pour toi, il t’aide à garder ta motivation et à te rappeler pourquoi tu fais cette démarche. Il sera visible uniquement par toi.
          </div>
          <div>
            <label><input type="radio" name="msgType" checked={msgType === 'texte'} onChange={() => setMsgType('texte')} /> Texte</label>
            <label style={{marginLeft: '1em'}}><input type="radio" name="msgType" checked={msgType === 'audio'} onChange={() => setMsgType('audio')} /> Audio/vidéo</label>
          </div>
          {msgType === 'texte' ? (
            <textarea value={msgTexte} onChange={e => setMsgTexte(e.target.value)} placeholder="Ex : Je me prépare depuis 30 jours. Mon corps est prêt..." style={{width:'100%',marginTop:4}} />
          ) : (
            <button type="button" style={{marginTop:4}} onClick={() => alert('Fonction d’enregistrement audio/vidéo à venir (conforme fiche métier)')}>🎤 Enregistrer un message vocal/vidéo</button>
          )}
        </section>
        {/* Zone projection sur la réussite (texte OU audio/vidéo) */}
        <section className={styles['modal-projection']}>
          <h4>🌟 Projection sur la réussite (optionnel)</h4>
          <div style={{color:'#64748b',fontSize:'0.97em',marginBottom:4}}>
            <b>À quoi ça sert ?</b> Ici, tu imagines comment tu te sentiras après le jeûne. C’est une projection positive pour renforcer ta confiance et visualiser ta réussite. Ce message t’aidera à garder le cap dans les moments difficiles.
          </div>
          <div>
            <label><input type="radio" name="projType" checked={projType === 'texte'} onChange={() => setProjType('texte')} /> Texte</label>
            <label style={{marginLeft: '1em'}}><input type="radio" name="projType" checked={projType === 'audio'} onChange={() => setProjType('audio')} /> Audio/vidéo</label>
          </div>
          {projType === 'texte' ? (
            <textarea value={projTexte} onChange={e => setProjTexte(e.target.value)} placeholder="Ex : Après ce jeûne, je me sentirai..." style={{width:'100%',marginTop:4}} />
          ) : (
            <button type="button" style={{marginTop:4}} onClick={() => alert('Fonction d’enregistrement audio/vidéo à venir (conforme fiche métier)')}>🎤 Enregistrer un message vocal/vidéo</button>
          )}
        </section>
        {/* Encadré analyse comportementale enrichi */}
        <section className={styles['modal-analyse']}>
          <h4>⚠️ Analyse rapide de ton comportement alimentaire</h4>
          <ul style={{marginBottom:8}}>
            {analyseSynth?.map((item, i) => <li key={i}>{item}</li>)}
          </ul>
          <div style={{marginTop:8}}>
            <b>🗓️ 3 derniers jours analysés :</b>
            <span style={{marginLeft:8, color:'#64748b', fontSize:'0.97em'}}>
              {analyse3Jours && analyse3Jours.length > 0 &&
                analyse3Jours.map((jour, idx) =>
                  `J-${idx+1} (${jour.date})${idx < analyse3Jours.length-1 ? ' | ' : ''}`
                )
              }
            </span>
            <button type="button" style={{marginLeft:16, fontSize:'0.97em', color:'#0ea5e9', background:'none', border:'none', cursor:'pointer', textDecoration:'underline'}}
              onClick={() => setShowRepasDetail(v => !v)}>
              {showRepasDetail ? 'Masquer le détail' : 'En savoir plus'}
            </button>
            {showRepasDetail && (
              <ul style={{marginTop:8}}>
                {analyse3Jours.length > 0 && analyse3Jours.some(j => j.repas && j.repas.length > 0) ? (
                  analyse3Jours.map((jour, idx) => (
                    <li key={jour.date} style={{marginBottom:4}}>
                      <span style={{fontWeight:600, color:'#0ea5e9'}}>{`J-${idx+1} (${jour.date})`}</span>
                      <ul style={{marginLeft:12}}>
                        {jour.repas.length > 0 ? jour.repas.map((r, i) => (
                          <li key={r.id || i} style={{color:'#334155'}}>
                            {r.type ? r.type+': ' : ''}{r.aliment} <span style={{color:'#64748b',fontSize:'0.95em'}}>({r.quantite} - {r.kcal} kcal)</span>
                          </li>
                        )) : <li style={{color:'#b91c1c'}}>Aucun repas ce jour</li>}
                      </ul>
                    </li>
                  ))
                ) : (
                  <li style={{color:'#b91c1c'}}>Aucun repas trouvé sur les 3 derniers jours.</li>
                )}
              </ul>
            )}
          </div>
        </section>
          // Affichage/masquage du détail des repas ("En savoir plus")
          const [showRepasDetail, setShowRepasDetail] = useState(false);
        {/* Séparateur visuel */}
        <hr style={{border:'none', borderTop:'2px dashed #cbd5e1', margin:'1.2rem 0 1.1rem 0'}} />
        {/* Actions alignées strictement à droite */}
        <div className={styles['modal-actions']}>
          <button onClick={onClose} style={{background:'#e2e8f0',color:'#334155',fontWeight:600}}>Annuler</button>
          <button onClick={handleSave} autoFocus style={{background:'linear-gradient(90deg,#38bdf8 60%,#0ea5e9 100%)',color:'#fff',fontWeight:700}}>Démarrer ma préparation</button>
        </div>
      </div>
    </div>
  );
};

export default StartPreparationModal;