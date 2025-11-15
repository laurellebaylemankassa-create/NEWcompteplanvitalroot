import { useState } from 'react';
import { genererProgrammeReprise, calculerDureeReprise, decouperEnPhases } from '../lib/genererProgrammeReprise';

export default function TestReprise() {
  const [dureeJeune, setDureeJeune] = useState(7);
  const [programme, setProgramme] = useState(null);
  const [error, setError] = useState(null);

  const testerGeneration = () => {
    try {
      setError(null);
      const dateFin = new Date();
      dateFin.setDate(dateFin.getDate() + 3); // J-3 simulé

      const prog = genererProgrammeReprise({
        dureeJeune: dureeJeune,
        poidsDepart: 72,
        dateFin: dateFin.toISOString().split('T')[0],
        options: { test: true }
      });

      setProgramme(prog);
    } catch (err) {
      setError(err.message);
    }
  };

  const dureeCalculee = calculerDureeReprise(dureeJeune);
  const phases = decouperEnPhases(dureeCalculee);

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: 24, fontFamily: 'system-ui' }}>
      <h1>🧪 Test Génération Programme Reprise</h1>

      <div style={{ background: '#f5f5f5', padding: 16, borderRadius: 8, marginBottom: 24 }}>
        <h2>Paramètres</h2>
        <label>
          Durée du jeûne (jours):
          <input 
            type="number" 
            value={dureeJeune} 
            onChange={e => setDureeJeune(Number(e.target.value))}
            min={1}
            max={14}
            style={{ marginLeft: 8, width: 60, padding: 4 }}
          />
        </label>
        <div style={{ marginTop: 12 }}>
          <strong>Durée reprise calculée:</strong> {dureeCalculee} jours (jeûne × 2)
        </div>
        <div style={{ marginTop: 8 }}>
          <strong>Découpage phases:</strong>
          <ul>
            <li>Phase 1 (Liquides): J{phases.phase1.debut}-J{phases.phase1.fin} ({phases.phase1.fin - phases.phase1.debut + 1} jours)</li>
            <li>Phase 2 (Fibres): J{phases.phase2.debut}-J{phases.phase2.fin} ({phases.phase2.fin - phases.phase2.debut + 1} jours)</li>
            <li>Phase 3 (Protéines): J{phases.phase3.debut}-J{phases.phase3.fin} ({phases.phase3.fin - phases.phase3.debut + 1} jours)</li>
            <li>Phase 4 (Féculents): J{phases.phase4.debut}-J{phases.phase4.fin} ({phases.phase4.fin - phases.phase4.debut + 1} jours)</li>
          </ul>
        </div>
        <button 
          onClick={testerGeneration}
          style={{ 
            marginTop: 12, 
            background: '#1976d2', 
            color: '#fff', 
            border: 'none', 
            padding: '10px 20px', 
            borderRadius: 8, 
            cursor: 'pointer',
            fontWeight: 600
          }}
        >
          Générer le programme
        </button>
      </div>

      {error && (
        <div style={{ background: '#ffebee', border: '1px solid #f44336', padding: 16, borderRadius: 8, marginBottom: 24 }}>
          <strong>❌ Erreur:</strong> {error}
        </div>
      )}

      {programme && (
        <div style={{ background: '#e8f5e9', padding: 16, borderRadius: 8 }}>
          <h2>✅ Programme généré</h2>
          
          <div style={{ marginBottom: 16 }}>
            <strong>Jeûne:</strong> {programme.duree_jeune_jours} jours<br />
            <strong>Reprise:</strong> {programme.duree_reprise_jours} jours<br />
            <strong>Début:</strong> {programme.date_debut_reprise}<br />
            <strong>Fin:</strong> {programme.date_fin_reprise}<br />
            <strong>Statut:</strong> {programme.statut}
          </div>

          <h3>Phases</h3>
          <div style={{ background: '#fff', padding: 12, borderRadius: 6, marginBottom: 16 }}>
            {Object.entries(programme.phases).map(([key, phase]) => (
              <div key={key} style={{ marginBottom: 8 }}>
                <strong>{phase.nom}</strong> (J{phase.debut}-J{phase.fin}): {phase.objectif}
              </div>
            ))}
          </div>

          <h3>Liste de courses ({programme.liste_courses.length} articles)</h3>
          <div style={{ background: '#fff', padding: 12, borderRadius: 6, marginBottom: 16, maxHeight: 200, overflow: 'auto' }}>
            {programme.liste_courses.map((item, i) => (
              <div key={i} style={{ marginBottom: 4 }}>
                {item.priorite === 'haute' && '⚠️ '}{item.nom} - {item.quantite} ({item.categorie})
              </div>
            ))}
          </div>

          <h3>Jours générés ({programme.jours_detailles.length} jours)</h3>
          <div style={{ background: '#fff', padding: 12, borderRadius: 6, maxHeight: 300, overflow: 'auto' }}>
            {programme.jours_detailles.slice(0, 5).map((jour, i) => (
              <details key={i} style={{ marginBottom: 8, borderBottom: '1px solid #eee', paddingBottom: 8 }}>
                <summary style={{ cursor: 'pointer', fontWeight: 600 }}>
                  Jour {jour.jour_numero} - {jour.date} - Phase {jour.phase}
                </summary>
                <div style={{ marginTop: 8, paddingLeft: 16 }}>
                  <div style={{ fontStyle: 'italic', color: '#666', marginBottom: 8 }}>
                    {jour.message_contextuel}
                  </div>
                  <strong>Aliments autorisés ({jour.aliments_autorises.length}):</strong>
                  <ul>
                    {jour.aliments_autorises.slice(0, 5).map((alim, j) => (
                      <li key={j}>{alim.nom} - {alim.portion}</li>
                    ))}
                    {jour.aliments_autorises.length > 5 && <li>... et {jour.aliments_autorises.length - 5} autres</li>}
                  </ul>
                </div>
              </details>
            ))}
            {programme.jours_detailles.length > 5 && (
              <div style={{ textAlign: 'center', color: '#888', marginTop: 8 }}>
                ... et {programme.jours_detailles.length - 5} autres jours
              </div>
            )}
          </div>

          <h3>Programme complet (JSON)</h3>
          <details>
            <summary style={{ cursor: 'pointer', color: '#1976d2' }}>Voir le JSON</summary>
            <pre style={{ background: '#f5f5f5', padding: 12, borderRadius: 6, overflow: 'auto', fontSize: 12 }}>
              {JSON.stringify(programme, null, 2)}
            </pre>
          </details>
        </div>
      )}
    </div>
  );
}
