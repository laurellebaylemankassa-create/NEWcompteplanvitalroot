import React, { useState, useEffect } from "react";
import { supabase } from "../lib/supabaseClient";
import BilanHebdoModal from "../components/BilanHebdoModal";
import { formatDate, getMonday, addDays } from "../lib/validationSemaine";

// Composant Snackbar avec auto-close
function Snackbar({ open, message, type = "info", onClose }) {
  useEffect(() => {
    if (!open) return;
    // Auto-close : 4s pour tous les messages
    const timer = setTimeout(onClose, 4000);
    return () => clearTimeout(timer);
  }, [open, onClose]);
  
  if (!open) return null;
  
  const bgColor = type === "error" ? "#f44336" : type === "warning" ? "#ff9800" : "#2563eb";
  
  return (
    <div
      style={{
        position: "fixed",
        bottom: 32,
        left: "50%",
        transform: "translateX(-50%)",
        background: bgColor,
        color: "#fff",
        padding: "12px 32px",
        borderRadius: 32,
        boxShadow: "0 2px 16px 0 rgba(0,0,0,0.15)",
        zIndex: 1000,
        fontWeight: 500,
        fontSize: 16,
        minWidth: 180,
        textAlign: "center",
        cursor: "pointer",
      }}
      onClick={onClose}
    >
      {message}
    </div>
  );
}

export default function HistoriqueBilans() {
  const [semainesValidees, setSemainesValidees] = useState([]);
  const [bilanModalOpen, setBilanModalOpen] = useState(false);
  const [bilanData, setBilanData] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', type: 'info' });
  
  // Fonction téléchargement PDF : ouvre le bilan PUIS impression après chargement complet
  const handleDownloadPDF = (bilan) => {
    // Log au début de la fonction PDF
    console.log('🖨️ [PDF] Début handleDownloadPDF');
    console.log('🖨️ [PDF] Données bilan reçues:', {
      weekStart: bilan?.weekStart,
      hasBilanABC: !!bilan?.bilan_abc,
      hasExtrasDetails: !!bilan?.extras_details
    });
    
    handleOpenBilan(bilan);
    
    // Délai de 3s pour laisser le bilan ABC complet se rendre
    setTimeout(() => {
      console.log('🖨️ [PDF] Appel window.print() après 3s - le DOM devrait être complet');
      window.print();
      console.log('🖨️ [PDF] window.print() exécuté');
    }, 3000);
  };

  useEffect(() => {
    async function fetchBilans() {
      const { data: semaines } = await supabase
        .from("semaines_validees")
        .select("*")
        .not("bilan_abc", "is", null)  // Filtrer uniquement bilans avec données ABC
        .not("weekStart", "is", null)   // Filtrer uniquement nouveau schéma
        .order("weekStart", { ascending: false });
      
      console.log('[HISTORIQUE] Semaines récupérées:', semaines?.length || 0);
      setSemainesValidees((semaines || []).filter(s => s.validee === true || s.validee === 1 || s.validee === "true"));
    }
    fetchBilans();
  }, []);

  const handleOpenBilan = (bilan) => {
    // Log au début de handleOpenBilan
    console.log('👁️ [OPEN BILAN] Début handleOpenBilan');
    console.log('👁️ [OPEN BILAN] Bilan reçu:', bilan ? 'OUI' : 'NON');
    
    if (!bilan) {
      console.error('❌ [OPEN BILAN] Bilan est null ou undefined, arrêt');
      return;
    }
    
    // Recalculer kcalExtras depuis extras_details si non présent (anciens bilans)
    let kcalExtras = bilan.kcal_extras || 0;
    let budgetExtras = bilan.budget_extras || 0;
    
    console.log('👁️ [OPEN BILAN] kcalExtras initial:', kcalExtras);
    console.log('👁️ [OPEN BILAN] budgetExtras initial:', budgetExtras);
    
    if (!kcalExtras && bilan.extras_details) {
      try {
        const details = JSON.parse(bilan.extras_details);
        kcalExtras = details.reduce((sum, extra) => sum + (Number(extra.kcal) || 0), 0);
        console.log('[HISTORIQUE] kcalExtras recalculé depuis extras_details:', kcalExtras);
      } catch (e) {
        console.warn('[HISTORIQUE] Erreur parsing extras_details:', e);
      }
    }
    
    console.log('[HISTORIQUE] Ouverture bilan:', {
      weekStart: bilan.weekStart,
      hasBilanABC: !!bilan.bilan_abc,
      extras_count: bilan.extras_count,
      kcalExtras,
      budgetExtras
    });
    
    const debut = getMonday(bilan.weekStart);
    const fin = addDays(debut, 6);
    
    console.log('👁️ [OPEN BILAN] Dates calculées:', {
      debut: debut.toISOString(),
      fin: fin.toISOString()
    });
    
    // Log avant setBilanData
    console.log('👁️ [OPEN BILAN] Appel setBilanData...');
    
    // Calcul automatique de nbJoursSaisis si absent en base (anciens bilans)
    let nbJoursSaisis = bilan.nb_jours_saisis;
    if (!nbJoursSaisis || nbJoursSaisis === 0) {
      // Recalculer à partir des jours uniques dans bilan_abc.lectureA si disponible
      if (bilan.bilan_abc?.lectureA?.detailsJours) {
        const joursAvecDonnees = bilan.bilan_abc.lectureA.detailsJours.filter(j => !j.incomplet).length;
        nbJoursSaisis = joursAvecDonnees;
        console.log('👁️ [OPEN BILAN] nb_jours_saisis recalculé à partir de lectureA:', nbJoursSaisis);
      } else {
        // Fallback : assumer 7 jours si impossible de calculer (bilan validé = semaine complète)
        nbJoursSaisis = 7;
        console.log('👁️ [OPEN BILAN] nb_jours_saisis manquant, fallback = 7');
      }
    }
    
    setBilanData({
      weekStart: bilan.weekStart,
      periode: `${formatDate(debut, 'd MMMM yyyy')} au ${formatDate(fin, 'd MMMM yyyy')}`,
      titre: "Bilan de ta semaine alimentaire",
      sousTitre: `Semaine du ${formatDate(debut, 'dd/MM/yyyy')} au ${formatDate(fin, 'dd/MM/yyyy')}`,
      apportsTotaux: bilan.apports_totaux || null,
      objectifHebdo: bilan.objectif_hebdo || null,
      kcalExtras: kcalExtras,
      budgetExtras: budgetExtras,
      extras: bilan.extras_count || 0,
      variation: bilan.variation || null,
      nbJoursSaisis: nbJoursSaisis,
      tendance_7j: bilan.tendance_7j || null,
      ecart_hebdo: bilan.ecart_hebdo || null,
      projection_poids: bilan.projection_poids || null,
      // Section 7 - Données ressenti
      satieteMoyenne: bilan.satiete_moyenne || null,
      humeurDominante: bilan.humeur_dominante || null,
      noteUtilisateur: bilan.note_utilisateur || null,
      nbRepasSatiete: bilan.nb_repas_satiete || 0,
      nbRepasRessenti: bilan.nb_repas_ressenti || 0,
      objectif_perso: bilan.objectif_perso || null,
      bilan_abc: bilan.bilan_abc || null,
      verbatim: bilan.verbatim || "Ton corps évolue dans le temps. Ce bilan te montre la trajectoire, pas un jugement.",
      message_feedback: bilan.message_feedback || null,
      motDoux: bilan.mot_doux || "Cette semaine a été riche, mais pas de panique : ton corps a besoin de temps pour intégrer de nouvelles habitudes. L'important, c'est la régularité. Tu es sur la bonne voie !",
      ...bilan
    });
    
    // Log après setBilanData
    console.log('👁️ [OPEN BILAN] setBilanData exécuté avec succès');
    console.log('👁️ [OPEN BILAN] bilanData.weekStart défini:', bilan.weekStart);
    
    // Log avant setBilanModalOpen
    console.log('👁️ [OPEN BILAN] Appel setBilanModalOpen(true)...');
    
    setBilanModalOpen(true);
    
    // Log après setBilanModalOpen
    console.log('👁️ [OPEN BILAN] setBilanModalOpen(true) exécuté');
    console.log('👁️ [OPEN BILAN] Modale devrait maintenant être visible');
  };

  return (
    <div className="historique-bilans-page" style={{maxWidth:700,margin:"0 auto",padding:"32px 8px 64px",fontFamily:"system-ui,Arial,sans-serif"}}>
      <Snackbar
        open={snackbar.open}
        message={snackbar.message}
        type={snackbar.type}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      />
      <h1 className="page-title" style={{textAlign:"center",marginBottom:24,fontWeight:800,fontSize:32,letterSpacing:"0.5px",color:"#1976d2"}}>
        🥗 Bilans hebdomadaires alimentaires
      </h1>
      <ul className="bilans-list" style={{listStyle:'none',padding:0}}>
        {semainesValidees.length === 0 && (
          <li style={{color:'#888',textAlign:'center',margin:'2rem 0'}}>Aucun bilan hebdomadaire validé pour l'instant.</li>
        )}
        {semainesValidees.map((bilan) => {
          const debut = getMonday(bilan.weekStart);
          const fin = addDays(debut, 6);
          function fmt(d) {
            const pad = n => String(n).padStart(2, '0');
            return `${pad(d.getDate())}/${pad(d.getMonth()+1)}/${d.getFullYear()}`;
          }
          return (
            <li key={bilan.weekStart} style={{marginBottom:16,background:'#f8fafc',borderRadius:8,padding:'12px 18px',boxShadow:'0 1px 4px #e0e0e0'}}>
              <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',gap:12}}>
                <span>
                  <b>Semaine du {fmt(debut)} au {fmt(fin)}</b>
                </span>
                <div style={{display:'flex',gap:8}}>
                  <button style={{background:'#1976d2',color:'#fff',border:'none',borderRadius:6,padding:'8px 16px',fontWeight:600,cursor:'pointer',fontSize:'0.95rem'}} onClick={()=>handleOpenBilan(bilan)}>
                    👁️ Voir
                  </button>
                  <button style={{background:'#2563eb',color:'#fff',border:'none',borderRadius:6,padding:'8px 16px',fontWeight:600,cursor:'pointer',fontSize:'0.95rem'}} onClick={()=>handleDownloadPDF(bilan)}>
                    📥 PDF
                  </button>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
      <div style={{textAlign:"center",marginTop:32}}>
        <a href="/tableau-de-bord" style={{color:"#1976d2",fontWeight:700,fontSize:18,textDecoration:"none"}}>← Retour au tableau de bord</a>
      </div>
      <BilanHebdoModal
        open={bilanModalOpen}
        onClose={()=>setBilanModalOpen(false)}
        bilan={bilanData}
        selectedDate={bilanData?.weekStart}
        modeValidation={false} // Mode historique : afficher uniquement VERT (lecture seule)
        onLearnMore={()=>setBilanModalOpen(false)}
      />
    </div>
  );
}
