// Composant de suivi quotidien pour défis personnalisés
// Formulaire matin : déclaration engagements (1-5)
// Formulaire soir : validation engagements via checklist
// Affichage historique des jours précédents

import { useState, useEffect } from "react";
import { sauvegarderEngagements, chargerJournalDefi, validerEtapeDefi, calculerScore } from "../lib/journalDefisUtils";

export default function JournalDefiPersonnalise({ defi, jourActuel, onProgressionUpdate }) {
  // États principaux
  const [engagements, setEngagements] = useState([]);
  const [nouvelEngagement, setNouvelEngagement] = useState("");
  const [notePersonnelle, setNotePersonnelle] = useState("");
  const [journalCharge, setJournalCharge] = useState(false);
  const [etapeValidee, setEtapeValidee] = useState(false);
  const [message, setMessage] = useState("");

  // Charger le journal du jour au montage
  useEffect(() => {
    if (defi?.id && jourActuel) {
      chargerJournal();
    }
  }, [defi?.id, jourActuel]);

  const chargerJournal = async () => {
    try {
      const journal = await chargerJournalDefi(defi.id, jourActuel);
      if (journal) {
        setEngagements(journal.engagements || []);
        setNotePersonnelle(journal.note_personnelle || "");
        setEtapeValidee(journal.valide || false);
      }
      setJournalCharge(true);
    } catch (error) {
      console.error("Erreur chargement journal:", error);
      setMessage("Erreur lors du chargement");
    }
  };

  const ajouterEngagement = () => {
    if (nouvelEngagement.trim() && engagements.length < 5) {
      setEngagements([...engagements, { texte: nouvelEngagement.trim(), valide: false }]);
      setNouvelEngagement("");
    }
  };

  const supprimerEngagement = (index) => {
    setEngagements(engagements.filter((_, i) => i !== index));
  };

  const toggleEngagement = (index) => {
    const nouveauxEngagements = [...engagements];
    nouveauxEngagements[index].valide = !nouveauxEngagements[index].valide;
    setEngagements(nouveauxEngagements);
  };

  const sauvegarderDeclaration = async () => {
    if (engagements.length === 0) {
      setMessage("Ajoutez au moins 1 engagement");
      return;
    }

    try {
      await sauvegarderEngagements(defi.id, jourActuel, engagements, notePersonnelle);
      setMessage("✓ Engagements sauvegardés");
      setTimeout(() => setMessage(""), 3000);
    } catch (error) {
      console.error("Erreur sauvegarde:", error);
      setMessage("Erreur lors de la sauvegarde");
    }
  };

  const validerJournee = async () => {
    if (engagements.length === 0) {
      setMessage("Déclarez d\'abord vos engagements du matin");
      return;
    }

    try {
      const result = await validerEtapeDefi(defi.id, jourActuel, engagements);
      setEtapeValidee(true);

      if (result.progressionIncrementee) {
        setMessage(`✓ Journée validée ! Progression : ${result.newProgress}/${defi.duree}`);
        if (onProgressionUpdate) {
          onProgressionUpdate(result.newProgress);
        }
      } else {
        const score = calculerScore(engagements);
        setMessage(`Journée enregistrée (${score} validés). Minimum 2/3 requis pour progresser.`);
      }

      setTimeout(() => setMessage(""), 5000);
    } catch (error) {
      console.error("Erreur validation:", error);
      setMessage("Erreur lors de la validation");
    }
  };

  if (!journalCharge) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '48px 0' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '12px' }}>⏳</div>
          <div style={{ color: '#6B7280', fontWeight: '500' }}>Chargement...</div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* En-tête stylé */}
      <div style={{ 
        background: 'linear-gradient(to right, #8B5CF6, #4F46E5)', 
        borderRadius: '16px', 
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)', 
        padding: '24px',
        color: 'white'
      }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '8px' }}>{defi.nom}</h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '0.875rem', opacity: 0.9 }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            📅 Jour {jourActuel} / {defi.duree}
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            ✅ {defi.progress || 0} jours validés
          </span>
        </div>
      </div>

      {/* Message de feedback */}
      {message && (
        <div style={{
          padding: '16px',
          borderRadius: '12px',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
          background: message.includes("✓") 
            ? 'linear-gradient(to right, #ECFDF5, #D1FAE5)' 
            : 'linear-gradient(to right, #FEF3C7, #FED7AA)',
          border: message.includes("✓") ? '2px solid #86EFAC' : '2px solid #FCD34D',
          color: message.includes("✓") ? '#065F46' : '#92400E'
        }}>
          <div style={{ fontWeight: '600' }}>{message}</div>
        </div>
      )}

      {/* SECTION MATIN : Déclaration des engagements */}
      {!etapeValidee && (
        <div style={{
          background: 'linear-gradient(to bottom right, #EFF6FF, #ECFEFF)',
          borderRadius: '16px',
          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
          padding: '24px',
          border: '2px solid #BFDBFE'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            <div style={{ fontSize: '2.5rem' }}>☀️</div>
            <div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#1E3A8A', marginBottom: '4px' }}>Ce matin</h3>
              <p style={{ fontSize: '0.875rem', color: '#1D4ED8' }}>Déclarez 1 à 5 engagements concrets pour aujourd\'hui</p>
            </div>
          </div>

          {/* Liste des engagements déclarés */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' }}>
            {engagements.map((eng, index) => (
              <div key={index} style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                background: 'white',
                padding: '16px',
                borderRadius: '12px',
                boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
                border: '2px solid #DBEAFE'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
                  <span style={{ color: '#2563EB', fontWeight: 'bold', fontSize: '1.125rem' }}>{index + 1}</span>
                  <span style={{ color: '#1F2937', fontWeight: '500' }}>{eng.texte}</span>
                </div>
                <button
                  onClick={() => supprimerEngagement(index)}
                  style={{
                    marginLeft: '12px',
                    width: '32px',
                    height: '32px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: '#FEE2E2',
                    color: '#DC2626',
                    borderRadius: '50%',
                    border: 'none',
                    cursor: 'pointer'
                  }}
                  onMouseOver={(e) => e.target.style.background = '#FECACA'}
                  onMouseOut={(e) => e.target.style.background = '#FEE2E2'}
                >
                  ✕
                </button>
              </div>
            ))}
          </div>

          {/* Ajout nouvel engagement */}
          {engagements.length < 5 && (
            <div style={{ marginBottom: '20px' }}>
              <div style={{ display: 'flex', gap: '12px' }}>
                <input
                  type="text"
                  value={nouvelEngagement}
                  onChange={(e) => setNouvelEngagement(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && ajouterEngagement()}
                  placeholder="Ex: Boire 2L d\'eau, Marcher 30min..."
                  style={{
                    flex: 1,
                    padding: '12px 16px',
                    border: '2px solid #BFDBFE',
                    borderRadius: '12px',
                    fontSize: '1rem',
                    outline: 'none'
                  }}
                />
                <button
                  onClick={ajouterEngagement}
                  style={{
                    padding: '12px 24px',
                    background: '#2563EB',
                    color: 'white',
                    borderRadius: '12px',
                    fontWeight: '600',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                    border: 'none',
                    cursor: 'pointer'
                  }}
                  onMouseOver={(e) => e.target.style.background = '#1D4ED8'}
                  onMouseOut={(e) => e.target.style.background = '#2563EB'}
                >
                  + Ajouter
                </button>
              </div>
              <p style={{ fontSize: '0.75rem', color: '#2563EB', marginTop: '8px', marginLeft: '4px' }}>
                {engagements.length}/5 engagements • Appuyez sur Entrée pour ajouter
              </p>
            </div>
          )}

          {/* Note personnelle */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '0.875rem',
              fontWeight: '600',
              color: '#374151',
              marginBottom: '8px'
            }}>
              <span>📝</span> Note personnelle (optionnelle)
            </label>
            <textarea
              value={notePersonnelle}
              onChange={(e) => setNotePersonnelle(e.target.value)}
              placeholder="Contexte, motivation, objectif du jour..."
              rows={3}
              style={{
                width: '100%',
                padding: '12px 16px',
                border: '2px solid #BFDBFE',
                borderRadius: '12px',
                fontSize: '1rem',
                outline: 'none',
                resize: 'vertical'
              }}
            />
          </div>

          {/* Bouton sauvegarde */}
          <button
            onClick={sauvegarderDeclaration}
            disabled={engagements.length === 0}
            style={{
              width: '100%',
              padding: '16px',
              background: engagements.length === 0 
                ? 'linear-gradient(to right, #D1D5DB, #9CA3AF)' 
                : 'linear-gradient(to right, #10B981, #059669)',
              color: 'white',
              borderRadius: '12px',
              fontWeight: 'bold',
              fontSize: '1.125rem',
              boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
              border: 'none',
              cursor: engagements.length === 0 ? 'not-allowed' : 'pointer'
            }}
            onMouseOver={(e) => {
              if (engagements.length > 0) {
                e.target.style.background = 'linear-gradient(to right, #059669, #047857)';
              }
            }}
            onMouseOut={(e) => {
              if (engagements.length > 0) {
                e.target.style.background = 'linear-gradient(to right, #10B981, #059669)';
              }
            }}
          >
            💾 Sauvegarder mes engagements
          </button>
        </div>
      )}

      {/* SECTION SOIR : Validation des engagements */}
      {engagements.length > 0 && (
        <div style={{
          background: 'linear-gradient(to bottom right, #FAF5FF, #FCE7F3)',
          borderRadius: '16px',
          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
          padding: '24px',
          border: '2px solid #E9D5FF'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            <div style={{ fontSize: '2.5rem' }}>🌙</div>
            <div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#581C87', marginBottom: '4px' }}>Ce soir</h3>
              <p style={{ fontSize: '0.875rem', color: '#7E22CE' }}>Cochez les engagements accomplis (minimum 2/3 pour valider la journée)</p>
            </div>
          </div>

          {/* Checklist */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' }}>
            {engagements.map((eng, index) => (
              <label
                key={index}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '16px',
                  padding: '16px',
                  background: 'white',
                  borderRadius: '12px',
                  boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
                  border: '2px solid #F3E8FF',
                  cursor: 'pointer'
                }}
              >
                <input
                  type="checkbox"
                  checked={eng.valide}
                  onChange={() => toggleEngagement(index)}
                  disabled={etapeValidee}
                  style={{
                    width: '24px',
                    height: '24px',
                    accentColor: '#9333EA',
                    cursor: etapeValidee ? 'not-allowed' : 'pointer'
                  }}
                />
                <span style={{
                  fontSize: '1rem',
                  fontWeight: '500',
                  flex: 1,
                  textDecoration: eng.valide ? 'line-through' : 'none',
                  color: eng.valide ? '#6B7280' : '#1F2937'
                }}>
                  {eng.texte}
                </span>
                {eng.valide && <span style={{ color: '#10B981', fontSize: '1.25rem' }}>✓</span>}
              </label>
            ))}
          </div>

          {/* Score actuel */}
          <div style={{
            marginBottom: '20px',
            padding: '20px',
            background: 'linear-gradient(to right, #FFFFFF, #FAF5FF)',
            borderRadius: '12px',
            boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
            border: '2px solid #E9D5FF'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <span style={{ fontSize: '0.875rem', fontWeight: '500', color: '#374151', display: 'block', marginBottom: '4px' }}>Score actuel</span>
                <span style={{
                  fontSize: '1.875rem',
                  fontWeight: 'bold',
                  background: 'linear-gradient(to right, #9333EA, #DB2777)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text'
                }}>
                  {calculerScore(engagements)}
                </span>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div>
                  <span style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#9333EA' }}>
                    {engagements.filter(e => e.valide).length}
                  </span>
                  <span style={{ color: '#6B7280', fontSize: '1.25rem' }}> / {engagements.length}</span>
                </div>
                <p style={{ fontSize: '0.75rem', color: '#4B5563', marginTop: '4px' }}>engagements validés</p>
              </div>
            </div>
          </div>

          {/* Bouton validation */}
          {!etapeValidee && (
            <button
              onClick={validerJournee}
              style={{
                width: '100%',
                padding: '16px',
                background: 'linear-gradient(to right, #9333EA, #DB2777)',
                color: 'white',
                borderRadius: '12px',
                fontWeight: 'bold',
                fontSize: '1.125rem',
                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                border: 'none',
                cursor: 'pointer'
              }}
              onMouseOver={(e) => e.target.style.background = 'linear-gradient(to right, #7E22CE, #BE185D)'}
              onMouseOut={(e) => e.target.style.background = 'linear-gradient(to right, #9333EA, #DB2777)'}
            >
              ✓ Valider la journée
            </button>
          )}

          {etapeValidee && (
            <div style={{
              width: '100%',
              padding: '16px',
              background: 'linear-gradient(to right, #D1FAE5, #A7F3D0)',
              color: '#065F46',
              borderRadius: '12px',
              textAlign: 'center',
              fontWeight: 'bold',
              fontSize: '1.125rem',
              border: '2px solid #86EFAC'
            }}>
              ✓ Journée déjà validée
            </div>
          )}
        </div>
      )}

      {/* Aide contextuelle */}
      {engagements.length === 0 && !etapeValidee && (
        <div style={{
          background: 'linear-gradient(to right, #FFFBEB, #FED7AA)',
          borderLeft: '4px solid #FBBF24',
          borderRadius: '0 12px 12px 0',
          padding: '20px',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
        }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
            <span style={{ fontSize: '1.5rem' }}>💡</span>
            <div>
              <p style={{ fontSize: '1rem', fontWeight: 'bold', color: '#1F2937', marginBottom: '12px' }}>Comment ça marche ?</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.875rem', color: '#374151' }}>
                <p style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                  <span style={{ fontWeight: 'bold', color: '#2563EB' }}>1.</span>
                  <span><strong style={{ color: '#1D4ED8' }}>Le matin ☀️</strong> : déclarez 1 à 5 engagements concrets</span>
                </p>
                <p style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                  <span style={{ fontWeight: 'bold', color: '#9333EA' }}>2.</span>
                  <span><strong style={{ color: '#7E22CE' }}>Le soir 🌙</strong> : cochez ceux que vous avez accomplis</span>
                </p>
                <p style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                  <span style={{ fontWeight: 'bold', color: '#10B981' }}>3.</span>
                  <span><strong style={{ color: '#059669' }}>Si ≥ 2/3 validés</strong> → votre progression augmente de 1 jour 🎯</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
