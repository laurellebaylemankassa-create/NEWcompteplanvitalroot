import React, { useState } from 'react';

const StartPreparationModal = ({ isOpen, onClose, onSave }) => {
  const [startDate, setStartDate] = useState('');
  const [duration, setDuration] = useState(30); // Valeur par défaut
  const [goal, setGoal] = useState('');

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
        <div className="modal-actions">
          <button onClick={onClose}>Annuler</button>
          <button onClick={handleSave}>Enregistrer</button>
        </div>
      </div>
    </div>
  );
};

export default StartPreparationModal;