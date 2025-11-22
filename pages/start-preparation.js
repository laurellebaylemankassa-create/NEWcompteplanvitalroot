import { useRouter } from 'next/router';
import { useState } from 'react';
import StartPreparationModal from '../components/StartPreparationModal';

export default function StartPreparationPage() {
  const [showModal, setShowModal] = useState(true);
  const router = useRouter();

  const handleStartPreparation = (data) => {
    // Redirection vers la page de préparation avec les infos saisies
    const params = new URLSearchParams({
      startDate: data.startDate,
      duration: data.duration,
      goal: data.goal,
    });
    window.opener && window.opener.postMessage({ type: 'preparationStarted', data }, '*');
    window.location.href = `/preparation-jeune?${params.toString()}`;
  };

  // Si la modale est fermée sans validation, fermer la fenêtre pop-up
  const handleClose = () => {
    setShowModal(false);
    setTimeout(() => {
      window.close();
    }, 200);
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f7fafd', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <StartPreparationModal isOpen={showModal} onClose={handleClose} onSave={handleStartPreparation} />
    </div>
  );
}
