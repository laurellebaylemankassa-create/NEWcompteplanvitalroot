


import React, { useState } from 'react';
import styles from './StartPreparationModal.module.css';


const StartPreparationModal = ({ isOpen, onClose, onSave, analyseComportement = [] }) => {
  const [startDate, setStartDate] = useState('');
  const [duration, setDuration] = useState(30); // Valeur par défaut
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

  // Calcul date de début de préparation
  const dateDebutPrep = startDate && duration ? new Date(new Date(startDate).getTime() - (duration * 24 * 60 * 60 * 1000)) : null;
  // Critères non réalisables
  const criteresNonReal = startDate && duration ? criteresMetier.filter(c => {
    const dateJalon = new Date(new Date(startDate).getTime() - (c.jalon * 24 * 60 * 60 * 1000));
    return dateDebutPrep > dateJalon;
  }) : [];

  // Détermination du jalon actuel (premier critère à réaliser)
  const jalonActuel = criteresMetier.reduce((acc, c) => {
    if (!acc && duration >= c.jalon) return c;
    return acc;
  }, null);

  // Récap phases (groupées)
  const phases = [
    { label: "J-30 à J-18 : FONDATIONS", criteres: [criteresMetier[0].label] },
    { label: "J-17 : Palier 1", criteres: [criteresMetier[1].label, criteresMetier[2].label] },
    { label: "J-14 : Palier 2", criteres: [criteresMetier[3].label, criteresMetier[4].label] },
    { label: "J-12 : Palier 3", criteres: [criteresMetier[5].label] },
    { label: "J-7 : Palier 4", criteres: [criteresMetier[6].label, criteresMetier[7].label, criteresMetier[8].label] },
    { label: "J-0 : Lancement du jeûne", criteres: [] },
  ];

  const handleSave = () => {
    if (!startDate || !goal) {
      alert('Veuillez remplir tous les champs obligatoires.');
      return;
    }
    onSave({ startDate, duration, goal, msgType, msgTexte, msgAudio, projType, projTexte, projAudio });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className={styles.modal}>
      <div className={styles['modal-content']}>
        <h2>🌙 Démarrer ma préparation au jeûne</h2>
        <div className={styles['modal-info']}>
          <div><b>📅 Date de début choisie :</b> <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} /></div>
          <div><b>⏳ Durée de préparation :</b> <input type="number" min="1" value={duration} onChange={e => setDuration(e.target.value)} /> jours</div>
          <div><b>🎯 Objectif :</b> <input type="text" value={goal} onChange={e => setGoal(e.target.value)} placeholder="Ex : Jeûne de 5 jours le 15/12/2025" /></div>
        </div>
        <section className={styles['modal-phases']}>
          <h3>🗓️ Phases de préparation</h3>
          <ul>
            {phases.map(phase => (
              <li key={phase.label}><b>{phase.label}</b> : {phase.criteres.join(", ")}</li>
            ))}
          </ul>
        </section>
        {jalonActuel && (
          <section className={styles['modal-jalon']}>
            <div className={styles['jalon-today']}>
              <span>📍 Aujourd’hui tu es à : <b>J-{jalonActuel.jalon}</b></span>
              <div className={styles['jalon-critere']}>
                ➡️ Première étape : <b>{jalonActuel.label}</b>
                <div className={styles['jalon-conseil']}>💡 {jalonActuel.conseil}</div>
              </div>
            </div>
          </section>
        )}
        {/* Zone message personnel (texte OU audio/vidéo) */}
        <section className={styles['modal-message']}>
          <h4>📝 Message à toi-même (optionnel)</h4>
          <div>
            <label><input type="radio" name="msgType" checked={msgType === 'texte'} onChange={() => setMsgType('texte')} /> Texte</label>
            <label style={{marginLeft: '1em'}}><input type="radio" name="msgType" checked={msgType === 'audio'} onChange={() => setMsgType('audio')} /> Audio/vidéo</label>
          </div>
          {msgType === 'texte' ? (
            <textarea value={msgTexte} onChange={e => setMsgTexte(e.target.value)} placeholder="Ex : Je me prépare depuis 30 jours. Mon corps est prêt..." style={{width:'100%',marginTop:4}} />
          ) : (
            <button type="button" style={{marginTop:4}}>🎤 Enregistrer un message vocal/vidéo</button>
          )}
        </section>
        {/* Zone projection sur la réussite (texte OU audio/vidéo) */}
        <section className={styles['modal-projection']}>
          <h4>🌟 Projection sur la réussite (optionnel)</h4>
          <div>
            <label><input type="radio" name="projType" checked={projType === 'texte'} onChange={() => setProjType('texte')} /> Texte</label>
            <label style={{marginLeft: '1em'}}><input type="radio" name="projType" checked={projType === 'audio'} onChange={() => setProjType('audio')} /> Audio/vidéo</label>
          </div>
          {projType === 'texte' ? (
            <textarea value={projTexte} onChange={e => setProjTexte(e.target.value)} placeholder="Ex : Après ce jeûne, je me sentirai..." style={{width:'100%',marginTop:4}} />
          ) : (
            <button type="button" style={{marginTop:4}}>🎤 Enregistrer un message vocal/vidéo</button>
          )}
        </section>
        {/* Feedback comportemental enrichi */}
        {analyseComportement && analyseComportement.length > 0 && (
          <section className={styles['modal-analyse']}>
            <h4>⚠️ Analyse rapide de ton comportement alimentaire</h4>
            <ul>
              {analyseComportement.map((item, i) => <li key={i}>{item}</li>)}
            </ul>
          </section>
        )}
        {/* Critères non réalisables */}
        {criteresNonReal.length > 0 && (
          <div style={{ background: '#fffbe6', border: '1px solid #ffe082', borderRadius: 8, padding: '10px 14px', margin: '12px 0' }}>
            <strong style={{ color: '#e65100' }}>Attention : certains critères ne pourront pas être validés avec cette durée de préparation :</strong>
            <ul style={{ margin: '8px 0 0 16px', color: '#e65100', fontSize: '0.98rem' }}>
              {criteresNonReal.map(c => (
                <li key={c.id}>{c.label} (J-{c.jalon})</li>
              ))}
            </ul>
            <div style={{ marginTop: 8, color: '#388e3c', fontWeight: 600 }}>
              Bravo pour ton engagement ! Un jeûne mieux préparé apporte plus de bénéfices. Pour la prochaine fois, commence ta préparation plus tôt pour maximiser tes résultats et ton confort.
            </div>
          </div>
        )}
        <div className={styles['modal-actions']}>
          <button onClick={onClose}>Annuler</button>
          <button onClick={handleSave}>Démarrer ma préparation</button>
        </div>
      </div>
    </div>
  );
};

export default StartPreparationModal;