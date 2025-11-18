import React, { useState } from 'react';

const StartPreparationModal = ({ isOpen, onClose, onSave }) => {
  const [startDate, setStartDate] = useState('');
  const [duration, setDuration] = useState(30); // Valeur par défaut
  const [goal, setGoal] = useState('');
  const criteresMetier = [
    { id: 1, label: "Respect strict des quantités à chaque repas", jalon: 30 },
    { id: 2, label: "Supprimer les féculents le soir (lun-dim)", jalon: 17 },
    { id: 3, label: "Action immédiate après le repas (marche/ménage)", jalon: 17 },
    { id: 4, label: "Éliminer tous produits transformés", jalon: 14 },
    { id: 5, label: "Éliminer toutes sucreries", jalon: 14 },
    { id: 6, label: "2 jours de jeûne plein (préparation métabolique)", jalon: 12 },
    { id: 7, label: "2 litres d’eau par jour (suivi automatique)", jalon: 7 },
    { id: 8, label: "Pas de repas après 19h00", jalon: 7 },
    { id: 9, label: "Plage alimentaire limitée à 45 minutes par repas", jalon: 7 },
  ];
  // Calcul date de début de préparation
  const dateDebutPrep = startDate && duration ? new Date(new Date(startDate).getTime() - (duration * 24 * 60 * 60 * 1000)) : null;
  // Critères non réalisables
  const criteresNonReal = startDate && duration ? criteresMetier.filter(c => {
    const dateJalon = new Date(new Date(startDate).getTime() - (c.jalon * 24 * 60 * 60 * 1000));
    return dateDebutPrep > dateJalon;
  }) : [];

  const handleSave = () => {
    if (!startDate || !goal) {
      alert('Veuillez remplir tous les champs.');
      return;
    }

    // Appeler la fonction de sauvegarde avec les données
    onSave({ startDate, duration, goal });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal">
      <div className="modal-content">
        <h2>Commencer ma préparation</h2>
        <label>
          Date prévue du jeûne :
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </label>
        <label>
          Durée de la préparation (jours) :
          <input
            type="number"
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            min="1"
          />
        </label>
        <label>
          Objectif personnel :
          <textarea
            value={goal}
            onChange={(e) => setGoal(e.target.value)}
            placeholder="Décrivez votre objectif..."
          />
        </label>
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
        <div className="modal-actions">
          <button onClick={onClose}>Annuler</button>
          <button onClick={handleSave}>Enregistrer</button>
        </div>
      </div>
    </div>
  );
};

export default StartPreparationModal;