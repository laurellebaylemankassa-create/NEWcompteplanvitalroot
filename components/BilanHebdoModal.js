import React, { useRef, useEffect, useState } from 'react';
import Moyenne14jBlock from './Moyenne14jBlock';
import styles from './BilanHebdoModal.module.css';
import { calculerTendance7j } from '../lib/validationSemaine';

// Squelette minimal pour repartir étape par étape selon le plan métier
export default function BilanHebdoModal({ open, onClose, bilan, onLearnMore, selectedDate, modeValidation = false }) {
    // Log des props reçues
    console.log('📊 [BILAN MODAL] Composant rendu avec props:', {
      open,
      hasBilan: !!bilan,
      bilanWeekStart: bilan?.weekStart,
      hasBilanABC: !!bilan?.bilan_abc,
      selectedDate
    });
    
    // Charger l'objectif personnalisé de cette semaine depuis localStorage
    const [objectifPersoSemaine, setObjectifPersoSemaine] = React.useState('');
    
    React.useEffect(() => {
      // Prioriser l'objectif déjà sauvegardé en base
      if (bilan?.objectif_perso) {
        console.log('🎯 [BILAN MODAL] Objectif personnalisé chargé depuis la base:', bilan.objectif_perso);
        setObjectifPersoSemaine(bilan.objectif_perso);
      } else if (bilan?.weekStart) {
        // Fallback : charger depuis localStorage si pas en base
        const objectifSauvegarde = localStorage.getItem(`objectif_semaine_${bilan.weekStart}`);
        if (objectifSauvegarde) {
          console.log('🎯 [BILAN MODAL] Objectif personnalisé chargé depuis localStorage:', objectifSauvegarde);
          setObjectifPersoSemaine(objectifSauvegarde);
        }
      }
    }, [bilan?.weekStart, bilan?.objectif_perso]);
    
    // Fonction téléchargement PDF (print)
    const handleDownloadPDF = () => {
      console.log('📊 [BILAN MODAL] Bouton PDF cliqué dans la modale');
      console.log('📊 [BILAN MODAL] Appel window.print()');
      window.print();
      console.log('📊 [BILAN MODAL] window.print() exécuté');
    };
    
    // 📱 Détection responsive dynamique (se met à jour au resize)
    const [isMobile, setIsMobile] = React.useState(
      typeof window !== 'undefined' && window.innerWidth < 768
    );
    
    React.useEffect(() => {
      const handleResize = () => {
        setIsMobile(window.innerWidth < 768);
      };
      
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }, []);
    
    // Styles responsive basés sur isMobile
    const modalWidth = isMobile ? '95%' : '95%';
    const modalMaxWidth = isMobile ? '100vw' : '1400px';  // Élargi pour PC
    const modalPadding = isMobile ? '4rem 0.8rem 1.5rem 0.8rem' : '3rem 3rem 2rem 3rem';
    const fontSize = isMobile ? '0.88rem' : '1rem';
    const titleFontSize = isMobile ? '1.3rem' : '1.8rem';
    const titleMarginBottom = isMobile ? '0.5rem' : '0.7rem';
    const periodFontSize = isMobile ? '0.85rem' : '1.08rem';
    
    // Helpers pour les blocs d'analyse textuelle métier
    function isEcartSignificatif(apportsTotaux, objectifHebdo) {
      if (typeof apportsTotaux !== 'number' || typeof objectifHebdo !== 'number') return false;
      return Math.abs(apportsTotaux - objectifHebdo) > 200; // Seuil à ajuster selon métier
    }
    function isExtrasResponsables(apportsTotaux, kcalExtras, objectifHebdo) {
      if (typeof apportsTotaux !== 'number' || typeof kcalExtras !== 'number' || typeof objectifHebdo !== 'number') return false;
      // Si hors extras, on est proche de l'objectif, mais l'écart total est dû aux extras
      const horsExtras = apportsTotaux - kcalExtras;
      return Math.abs(horsExtras - objectifHebdo) < 150 && Math.abs(apportsTotaux - objectifHebdo) > 200;
    }
    function isExtrasHorsBudget(extras, kcalExtras, budgetExtras) {
      if (typeof extras !== 'number' || typeof kcalExtras !== 'number' || typeof budgetExtras !== 'number') return false;
      return extras > 0 && kcalExtras > budgetExtras * 1.2; // Dépassement net du budget
    }
    // Bloc "En savoir plus" (toujours après les blocs chiffrés)
    // Fonction de réduction/extension pour la section "En savoir plus"
    const [showSavoirPlus, setShowSavoirPlus] = React.useState(false);
    function BlocEnSavoirPlus() {
      if (typeof bilan?.apportsTotaux !== 'number' || typeof bilan?.kcalExtras !== 'number' || typeof bilan?.objectifHebdo !== 'number') return null;
      const horsExtras = bilan.apportsTotaux - bilan.kcalExtras;
      const ecart = bilan.apportsTotaux - bilan.objectifHebdo;
      const ecartStr = ecart > 0 ? `+${ecart}` : ecart;
      // Détection dynamique des alertes et encouragements
      const ecartSignificatif = Math.abs(ecart) > 200;
      const extrasHorsBudget = bilan.extras > 0 && bilan.kcalExtras > bilan.budgetExtras * 1.2;
      const extrasConformes = bilan.extras > 0 && bilan.kcalExtras <= bilan.budgetExtras;
      // Couleur de fond dynamique
      let bgColor = '#f9fafb';
      let borderColor = undefined;
      let icon = null;
      let messageAlerte = null;
      if (ecartSignificatif && ecart > 0) {
        bgColor = '#fff7f7';
        borderColor = '#e53935';
        icon = <span style={{fontSize:'1.2em', color:'#e53935', marginRight:6}}>⚠️</span>;
        messageAlerte = <span style={{color:'#e53935', fontWeight:600}}>Point de vigilance : la semaine dépasse nettement l’objectif.</span>;
      } else if (extrasHorsBudget) {
        bgColor = '#fffbe6';
        borderColor = '#eab308';
        icon = <span style={{fontSize:'1.2em', color:'#eab308', marginRight:6}}>⚠️</span>;
        messageAlerte = <span style={{color:'#eab308', fontWeight:600}}>Attention : les extras dépassent largement le budget prévu.</span>;
      } else if (extrasConformes && !ecartSignificatif) {
        bgColor = '#f0fdf4';
        borderColor = '#22c55e';
        icon = <span style={{fontSize:'1.2em', color:'#22c55e', marginRight:6}}>✅</span>;
        messageAlerte = <span style={{color:'#22c55e', fontWeight:600}}>Bravo, extras maîtrisés et semaine dans le cadre !</span>;
      }
      return (
        <section style={{marginBottom: '2rem', background: bgColor, borderRadius: 10, padding: '1.1rem 1.3rem', boxShadow: '0 1px 4px #e5e7eb', border: borderColor ? `2px solid ${borderColor}` : undefined}}>
          <h4 style={{color: '#334155', marginBottom: '0.7rem', fontSize: '1.08rem', cursor:'pointer'}} onClick={() => setShowSavoirPlus(v => !v)}>
            {showSavoirPlus ? '▼' : '►'} En savoir plus
          </h4>
          {showSavoirPlus && (
            <>
              {icon && messageAlerte && (
                <div style={{marginBottom:'0.7rem', display:'flex', alignItems:'center'}}>{icon}{messageAlerte}</div>
              )}
              <div style={{marginBottom: '0.6rem'}}>
                <b>Lecture “repas vs extras”</b><br/>
                Sans extras, ta semaine est à <b>{horsExtras}</b> kcal.<br/>
                Avec extras, elle monte à <b>{bilan.apportsTotaux}</b> kcal.<br/>
                <span style={{color:'#64748b'}}>→ Ça signifie que la différence se joue majoritairement sur les extras, pas sur les repas.</span>
              </div>
              <div style={{marginBottom: '0.6rem'}}>
                <b>Lecture “écart expliqué”</b><br/>
                Objectif : <b>{bilan.objectifHebdo}</b> kcal<br/>
                Réalisé : <b>{bilan.apportsTotaux}</b> kcal<br/>
                <span style={{color:'#64748b'}}>→ {ecartStr} kcal : c’est le signal principal de la semaine.</span>
              </div>
              <div style={{marginBottom: '0.6rem'}}>
                <b>Lecture “fréquence vs intensité”</b><br/>
                Extras : <b>{bilan.extras}</b><br/>
                Poids calorique extras : <b>{bilan.kcalExtras}</b> kcal<br/>
                Budget extras : <b>{bilan.budgetExtras}</b> kcal<br/>
                <span style={{color:'#64748b'}}>→ {bilan.nbJoursSaisis < 2 ? (
                  'Analyse non disponible : données insuffisantes.'
                ) : bilan.extras === 0 ? (
                  'Aucun extra cette semaine, l\'impact est nul.'
                ) : bilan.kcalExtras > bilan.budgetExtras ? (
                  'Cette semaine, les extras sont à la fois présents (fréquence) et très lourds (intensité).'
                ) : (
                  'Cette semaine, les extras sont présents mais leur intensité reste modérée.'
                )}</span>
              </div>
            </>
          )}
        </section>
      );
    }
    // Bloc "Lecture de la semaine" (diagnostic global)
    function BlocLectureSemaine() {
      const { apportsTotaux, objectifHebdo, kcalExtras, extras, budgetExtras, nbJoursSaisis } = bilan || {};
      // Log au début de la fonction
      console.log('[LectureSemaine] Début BlocLectureSemaine');
      // Log des valeurs d'entrée
      console.log('[LectureSemaine] apportsTotaux:', apportsTotaux, 'objectifHebdo:', objectifHebdo, 'kcalExtras:', kcalExtras, 'extras:', extras, 'budgetExtras:', budgetExtras, 'nbJoursSaisis:', nbJoursSaisis);
      
      // Si données insuffisantes (< 2 jours), afficher message adapté
      if (nbJoursSaisis < 2) {
        return (
          <section style={{marginBottom: '2rem', background: '#f8fafc', borderRadius: 10, padding: '1.1rem 1.3rem', boxShadow: '0 1px 4px #cbd5e1', border: '2px dashed #cbd5e1'}}>
            <h4 style={{color: '#64748b', marginBottom: '0.7rem', fontSize: '1.08rem'}}>Lecture de la semaine</h4>
            <div style={{fontStyle: 'italic', color: '#94a3b8', fontSize: '0.98rem'}}>
              📊 Données insuffisantes pour générer une lecture fiable (seulement {nbJoursSaisis} jour avec saisie).
            </div>
          </section>
        );
      }
      
      if (
        typeof apportsTotaux !== 'number' ||
        typeof objectifHebdo !== 'number' ||
        typeof kcalExtras !== 'number' ||
        typeof extras !== 'number' ||
        typeof budgetExtras !== 'number'
      ) {
        console.log('[LectureSemaine] Données manquantes, bloc non affiché');
        return null;
      }

      // Génération séquentielle des phrases métier validées
      const phrases = [];
      const horsExtras = apportsTotaux - kcalExtras;
      const ecartSignificatif = Math.abs(apportsTotaux - objectifHebdo) > 200;
      const extrasResponsables = Math.abs(horsExtras - objectifHebdo) < 150 && ecartSignificatif;
      const extrasHorsBudget = extras > 0 && kcalExtras > budgetExtras * 1.2;
      const causeUniqueExtras = extrasResponsables && extrasHorsBudget;
      const causesMultiples = Math.abs(horsExtras - objectifHebdo) > 200 && extrasHorsBudget;
      // Log des conditions métier
      console.log('[LectureSemaine] horsExtras:', horsExtras);
      console.log('[LectureSemaine] ecartSignificatif:', ecartSignificatif);
      console.log('[LectureSemaine] extrasResponsables:', extrasResponsables);
      console.log('[LectureSemaine] extrasHorsBudget:', extrasHorsBudget);
      console.log('[LectureSemaine] causeUniqueExtras:', causeUniqueExtras);
      console.log('[LectureSemaine] causesMultiples:', causesMultiples);

      // Bloc complet strict métier (4 phrases) si cause unique extras
      if (causeUniqueExtras) {
        console.log('[LectureSemaine] Cas causeUniqueExtras (séquence complète)');
        phrases.push('Cette semaine, la trajectoire globale s’éloigne de l’objectif hebdomadaire.');
        phrases.push('L’écart constaté ne s’explique pas par les repas hors extras, qui restent proches du cadre prévu, mais par le poids cumulé des extras sur la semaine.');
        phrases.push('Le nombre d’extras consommés, combiné à leur charge calorique totale, place cette semaine hors zone d’équilibre par rapport au budget fixé.');
      }
      // Sinon, séquence dynamique selon la réalité
      else {
        if (ecartSignificatif) {
          console.log('[LectureSemaine] Cas ecartSignificatif');
          phrases.push('Cette semaine, la trajectoire globale s’éloigne de l’objectif hebdomadaire.');
        } else {
          console.log('[LectureSemaine] Cas conformité');
          phrases.push('Cette semaine reste proche de l’objectif, bravo, continue sur cette lancée.');
        }
        if (extrasResponsables) {
          console.log('[LectureSemaine] Cas extrasResponsables');
          phrases.push('L’écart constaté ne s’explique pas par les repas hors extras, qui restent proches du cadre prévu, mais par le poids cumulé des extras sur la semaine.');
        } else if (Math.abs(horsExtras - objectifHebdo) > 200) {
          console.log('[LectureSemaine] Cas repas hors cadre');
          phrases.push('Les repas principaux de la semaine dépassent le cadre prévu : il est important de retrouver une structure plus régulière pour revenir à l’équilibre.');
        }
        if (extrasHorsBudget) {
          console.log('[LectureSemaine] Cas extrasHorsBudget');
          phrases.push('Le nombre d’extras consommés, combiné à leur charge calorique totale, place cette semaine hors zone d’équilibre par rapport au budget fixé.');
        }
      }
      // Phrase d’observation fine (lecture claire/cause unique extras)
      let phraseClair = null;
      if (causeUniqueExtras) {
        console.log('[LectureSemaine] Affichage phraseClair causeUniqueExtras');
        phraseClair = <div style={{marginBottom:'0.6rem', fontWeight:600, color:'#0f172a'}}>👉 La lecture est claire : ce ne sont pas les repas qui déséquilibrent la semaine, mais la manière dont les extras se sont exprimés.</div>;
      } else if (causesMultiples) {
        console.log('[LectureSemaine] Affichage phraseClair causesMultiples');
        phraseClair = <div style={{marginBottom:'0.6rem', fontWeight:600, color:'#0f172a'}}>👉 Plusieurs facteurs expliquent l’écart cette semaine : repas et extras contribuent tous deux à la situation observée.</div>;
      }
      // Log des phrases générées
      console.log('[LectureSemaine] Phrases générées:', phrases);
      return (
        <section style={{marginBottom: '2rem', background: '#f1f5f9', borderRadius: 10, padding: '1.1rem 1.3rem', boxShadow: '0 1px 4px #cbd5e1'}}>
          <h4 style={{color: '#0f172a', marginBottom: '0.7rem', fontSize: '1.08rem'}}>Lecture de la semaine</h4>
          {phrases.map((p, i) => (
            <div key={i} style={{marginBottom: '0.6rem'}}>{p}</div>
          ))}
          {phraseClair}
        </section>
      );
    }
    
    // ═══════════════════════════════════════════════════════════════
    // PHASE 3 - BLOCS ABC (Lectures A, B, C + Fragilités)
    // ═══════════════════════════════════════════════════════════════
    
    // LECTURE A - Répartition des jours + Valorisation streaks
    function BlocRepartitionJours() {
      const lectureA = bilan?.bilan_abc?.lectureA;
      if (!lectureA) return null;
      
      const { joursCategories, longestStreak, joursIncomplets } = lectureA;
      const totalJours = (joursCategories?.sous || 0) + (joursCategories?.proches || 0) + 
                         (joursCategories?.legerDepassement || 0) + (joursCategories?.debordement || 0);
      
      if (totalJours === 0) return null;
      
      const joursConformes = (joursCategories?.sous || 0) + (joursCategories?.proches || 0);
      const tauxConformite = Math.round((joursConformes / totalJours) * 100);
      
      // Verbatim selon profil
      let verbatim = '';
      let bgColor = '#f9fafb';
      let borderColor = '#cbd5e1';
      
      if (joursConformes >= 6) {
        verbatim = "La direction globale est restée stable sur la plupart des jours. Un moment précis a pesé plus lourd dans le bilan.";
        bgColor = '#f0fdf4';
        borderColor = '#22c55e';
      } else if (joursConformes >= 4) {
        verbatim = "La semaine montre une alternance entre jours alignés et jours de débordement. La régularité est à consolider.";
        bgColor = '#fffbeb';
        borderColor = '#f59e0b';
      } else {
        verbatim = "La semaine manque de continuité. Concentre-toi sur enchaîner 2-3 jours alignés d'affilée.";
        bgColor = '#fff7f7';
        borderColor = '#e53935';
      }
      
      return (
        <section style={{
          marginTop: '1.5rem',
          padding: '1.2rem',
          background: bgColor,
          borderRadius: 10,
          border: `2px solid ${borderColor}`,
          boxShadow: '0 1px 4px rgba(0,0,0,0.08)'
        }}>
          <h4 style={{color: '#0f172a', fontSize: '1.1rem', marginBottom: '0.7rem'}}>
            📊 Répartition des jours
          </h4>
          
          {/* Phrase synthèse */}
          <div style={{marginBottom: '0.8rem', fontSize: '0.97rem', lineHeight: 1.6}}>
            Sur <b>{totalJours} jours</b> : 
            {joursCategories.sous > 0 && <span> <b>{joursCategories.sous}</b> jour{joursCategories.sous > 1 ? 's' : ''} sous l'objectif,</span>}
            {joursCategories.proches > 0 && <span> <b>{joursCategories.proches}</b> jour{joursCategories.proches > 1 ? 's' : ''} proche{joursCategories.proches > 1 ? 's' : ''} de l'objectif,</span>}
            {joursCategories.legerDepassement > 0 && <span> <b>{joursCategories.legerDepassement}</b> jour{joursCategories.legerDepassement > 1 ? 's' : ''} légèrement au-dessus,</span>}
            {joursCategories.debordement > 0 && <span> <b>{joursCategories.debordement}</b> jour{joursCategories.debordement > 1 ? 's' : ''} de débordement marqué.</span>}
          </div>
          
          {/* Valorisation streak */}
          {longestStreak >= 3 && (
            <div style={{
              marginTop: '0.7rem',
              padding: '0.7rem 1rem',
              background: '#f0fdf4',
              borderLeft: '4px solid #22c55e',
              borderRadius: 6
            }}>
              <span style={{fontSize: '1.1rem'}}>✅</span>
              <span style={{marginLeft: '0.5rem', color: '#15803d', fontWeight: 600}}>
                {longestStreak} jour{longestStreak > 1 ? 's' : ''} consécutif{longestStreak > 1 ? 's' : ''} aligné{longestStreak > 1 ? 's' : ''} avec ton objectif.{' '}
                {longestStreak >= 5 && "Cette régularité montre que tu maîtrises la base. La trajectoire est là."}
                {longestStreak >= 3 && longestStreak < 5 && "Cette continuité est ta vraie force cette semaine."}
              </span>
            </div>
          )}
          
          {/* Verbatim Plan Vital */}
          <div style={{marginTop: '0.7rem', fontStyle: 'italic', color: '#64748b', fontSize: '0.95rem'}}>
            {verbatim}
          </div>
          
          {/* Info jours incomplets */}
          {joursIncomplets > 0 && (
            <div style={{marginTop: '0.6rem', fontSize: '0.9rem', color: '#f59e0b'}}>
              ⚠️ {joursIncomplets} jour{joursIncomplets > 1 ? 's' : ''} incomplet{joursIncomplets > 1 ? 's' : ''} (moins de 3 repas déclarés)
            </div>
          )}
        </section>
      );
    }
    
    // LECTURE B - Impact des jours (concentration du surplus)
    function BlocImpactJours() {
      const lectureB = bilan?.bilan_abc?.lectureB;
      if (!lectureB || !lectureB.jourPlusLourd) return null;
      
      const { surplusTotal, jourPlusLourd, repartition } = lectureB;
      
      // Si pas de surplus, on n'affiche pas
      if (surplusTotal <= 0) return null;
      
      const { date, ecart, part } = jourPlusLourd;
      const partPourcent = Math.round(part * 100);
      
      // Verbatim selon répartition
      let verbatim = '';
      let titre = '';
      
      if (repartition === 'concentre') {
        titre = `1 journée explique ~${partPourcent}% de l'excédent hebdomadaire.`;
        verbatim = "La semaine a été globalement tenue. Une journée a déplacé la trajectoire. Ce n'est pas une semaine \"ratée\". C'est un point à sécuriser.";
      } else if (repartition === 'fort') {
        const dateFormatee = new Date(date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' });
        titre = `Le ${dateFormatee} pèse fortement dans l'excédent (~${partPourcent}%).`;
        verbatim = "Quelques jours ont pesé plus lourd. La vigilance doit rester constante sur plusieurs moments de la semaine.";
      } else {
        titre = "L'écart s'est construit progressivement sur plusieurs jours.";
        verbatim = "La semaine manque de jours conformes. L'écart n'est pas concentré sur un moment précis, mais diffus. C'est la régularité qui manque.";
      }
      
      return (
        <section style={{
          marginTop: '1.5rem',
          padding: '1.2rem',
          background: '#fffbeb',
          borderRadius: 10,
          border: '2px solid #f59e0b',
          boxShadow: '0 1px 4px rgba(0,0,0,0.08)'
        }}>
          <h4 style={{color: '#d97706', fontSize: '1.1rem', marginBottom: '0.7rem'}}>
            🎯 Jour(s) qui pèsent dans l'écart
          </h4>
          
          <div style={{marginBottom: '0.7rem', fontSize: '0.97rem', fontWeight: 600, color: '#92400e'}}>
            {titre}
          </div>
          
          <div style={{marginBottom: '0.6rem', fontSize: '0.95rem', color: '#78716c'}}>
            Surplus total hebdomadaire : <b>{surplusTotal} kcal</b>
          </div>
          
          <div style={{marginTop: '0.7rem', fontStyle: 'italic', color: '#92400e', fontSize: '0.95rem'}}>
            {verbatim}
          </div>
        </section>
      );
    }
    
    // LECTURE C - Évolution extras (N vs N-1)
    function BlocEvolutionExtras() {
      const lectureC = bilan?.bilan_abc?.lectureC;
      if (!lectureC) return null;
      
      const { deltaKcal, deltaNb, tendanceExtras } = lectureC;
      
      // Si pas de données N-1, on n'affiche rien
      if (tendanceExtras === null || tendanceExtras === undefined) return null;
      
      let verbatim = '';
      let bgColor = '#f9fafb';
      let borderColor = '#cbd5e1';
      let icon = '📈';
      
      if (tendanceExtras === 'progres') {
        verbatim = "Les extras sont mieux maîtrisés que la semaine précédente. Une régulation est déjà en place.";
        bgColor = '#f0fdf4';
        borderColor = '#22c55e';
        icon = '✅';
      } else if (tendanceExtras === 'stable') {
        verbatim = "Les extras sont stables par rapport à la semaine précédente. La fréquence ne progresse pas, mais ne régresse pas non plus.";
        bgColor = '#f0f9ff';
        borderColor = '#3b82f6';
        icon = '⚖️';
      } else {
        verbatim = "Les extras ont été plus présents cette semaine. Sur la durée, cela pèse dans la trajectoire.";
        bgColor = '#fff7f7';
        borderColor = '#e53935';
        icon = '⚠️';
      }
      
      return (
        <section style={{
          marginTop: '1.5rem',
          padding: '1.2rem',
          background: bgColor,
          borderRadius: 10,
          border: `2px solid ${borderColor}`,
          boxShadow: '0 1px 4px rgba(0,0,0,0.08)'
        }}>
          <h4 style={{color: '#0f172a', fontSize: '1.1rem', marginBottom: '0.7rem'}}>
            {icon} Évolution extras (semaine précédente)
          </h4>
          
          <div style={{marginBottom: '0.6rem', fontSize: '0.95rem'}}>
            {deltaNb !== 0 && (
              <div style={{marginBottom: '0.4rem'}}>
                <b>{deltaNb > 0 ? '+' : ''}{deltaNb}</b> extra{Math.abs(deltaNb) > 1 ? 's' : ''} par rapport à la semaine précédente
              </div>
            )}
            {deltaKcal !== 0 && (
              <div>
                <b>{deltaKcal > 0 ? '+' : ''}{deltaKcal} kcal</b> d'extras par rapport à la semaine précédente
              </div>
            )}
            {deltaNb === 0 && deltaKcal === 0 && (
              <div>Extras identiques à la semaine précédente (même nombre, même charge calorique)</div>
            )}
          </div>
          
          <div style={{marginTop: '0.7rem', fontStyle: 'italic', color: '#64748b', fontSize: '0.95rem'}}>
            {verbatim}
          </div>
        </section>
      );
    }
    
    // SECTION D - Analyse des fragilités
    function BlocAnalyseFragilites() {
      const fragilites = bilan?.bilan_abc?.fragilites;
      if (!fragilites || !fragilites.joursDebordement || fragilites.joursDebordement.length === 0) {
        return null; // Pas de fragilité détectée
      }
      
      const { joursDebordement, typologieProblematique, momentFragile } = fragilites;
      const [showDetails, setShowDetails] = useState(false);
      
      // Verbatim selon typologie
      let verbatimTypologie = '';
      if (typologieProblematique === 'cumul_repas_extras') {
        verbatimTypologie = "Sur les journées de débordement, c'est le cumul de repas lourds ET d'extras qui a déplacé la trajectoire. La vigilance doit porter sur les deux.";
      } else if (typologieProblematique === 'extras_nombreux') {
        verbatimTypologie = `Les extras se sont concentrés${momentFragile ? ` le ${momentFragile}` : ''}, créant une charge difficile à absorber. C'est le point à sécuriser.`;
      } else if (typologieProblematique === 'repas_trop_lourds') {
        verbatimTypologie = "Certains repas principaux dépassent largement le cadre prévu. Même sans extras, cela suffit à créer un excédent.";
      }
      
      return (
        <section style={{
          marginTop: '1.5rem',
          padding: '1.2rem',
          background: '#fffbeb',
          borderRadius: 10,
          border: '2px solid #f59e0b',
          boxShadow: '0 1px 4px rgba(0,0,0,0.08)'
        }}>
          <h4 style={{color: '#d97706', fontSize: '1.1rem', marginBottom: '0.7rem'}}>
            🔍 Zones de vigilance
          </h4>
          
          <div style={{marginBottom: '0.8rem', fontSize: '0.95rem', lineHeight: 1.6}}>
            {verbatimTypologie}
          </div>
          
          {/* Détails jours débordement (rétractable) */}
          {joursDebordement.length > 0 && (
            <details style={{marginTop: '0.7rem'}} open={showDetails} onToggle={(e) => setShowDetails(e.target.open)}>
              <summary style={{cursor: 'pointer', fontWeight: 600, color: '#d97706', fontSize: '0.95rem'}}>
                Voir le détail des journées ({joursDebordement.length})
              </summary>
              <div style={{marginTop: '0.7rem', fontSize: '0.9rem', paddingLeft: '1rem'}}>
                {joursDebordement.map((jour, idx) => (
                  <div key={idx} style={{marginBottom: '0.8rem', borderLeft: '3px solid #fbbf24', paddingLeft: '0.7rem'}}>
                    <div style={{fontWeight: 600, color: '#92400e', marginBottom: '0.3rem'}}>
                      {new Date(jour.date).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}
                    </div>
                    <div style={{color: '#78716c', fontSize: '0.85rem', marginBottom: '0.5rem'}}>
                      {jour.kcal_total} kcal (écart : +{jour.ecart} kcal)
                    </div>
                    {jour.repasProblematiques && jour.repasProblematiques.length > 0 && (
                      <div style={{marginTop: '0.5rem'}}>
                        <div style={{fontSize: '0.8rem', color: '#92400e', fontWeight: 600, marginBottom: '0.3rem'}}>
                          📋 Repas qui ont pesé :
                        </div>
                        <ul style={{marginTop: '0.3rem', paddingLeft: '1.5rem', color: '#78716c', fontSize: '0.85rem', listStyle: 'disc'}}>
                          {jour.repasProblematiques.slice(0, 3).map((repas, i) => (
                            <li key={i} style={{marginBottom: '0.2rem'}}>
                              <strong>{repas.type}</strong> : {repas.aliment} ({repas.kcal} kcal)
                              {repas.est_extra && <span style={{color: '#f59e0b', marginLeft: '0.3rem', fontSize: '0.8rem'}}>⚠️ Extra</span>}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </details>
          )}
          
          <div style={{marginTop: '1rem', fontStyle: 'italic', color: '#92400e', fontSize: '0.92rem'}}>
            C'est identifié. La semaine prochaine, tu sais où porter ton attention.
          </div>
        </section>
      );
    }
    
    // Bloc rétractable/accordion pour la Section 2 — Tendance & Trajectoire
  
    function AccordionTendance() {
      const [open, setOpen] = useState(false);
      
      return (
        <div style={{marginTop: '0.5rem'}}>
          <button
            aria-expanded={open}
            aria-controls="tendance-details"
            onClick={() => setOpen(o => !o)}
            style={{
              background: '#2a4d8f', color: '#fff', border: 'none', borderRadius: 8,
              padding: '0.5rem 1.1rem', fontWeight: 600, fontSize: '1rem', cursor: 'pointer', marginBottom: open ? 10 : 0
            }}
          >
            {open ? 'Masquer le détail ▲' : 'Voir le détail ▼'}
          </button>
          <div id="tendance-details" className="print-expand" style={{display: open ? 'block' : 'none', marginTop: '0.7rem', background: '#f0f6ff', borderRadius: 8, padding: '1rem 1.2rem', boxShadow: '0 1px 4px #b3d8f7'}}>
              {/* Section 2.1 - Tendance 7j (semaine courante) */}
              {(() => {
                const { apportsTotaux, objectifHebdo } = bilan || {};
                if (!apportsTotaux || !objectifHebdo) {
                  return <div style={{color: '#666', fontSize: '0.95rem'}}>Données insuffisantes pour calculer la tendance</div>;
                }
                
                const tendance = calculerTendance7j(apportsTotaux, objectifHebdo);
                
                return (
                  <div style={{marginBottom: '1.2rem'}}>
                    <div style={{
                      display: 'inline-block',
                      background: tendance.couleur,
                      color: '#fff',
                      padding: '0.4rem 0.9rem',
                      borderRadius: 6,
                      fontWeight: 600,
                      fontSize: '0.95rem',
                      marginBottom: '0.6rem'
                    }}>
                      {tendance.label}
                    </div>
                    <div style={{fontSize: '0.95rem', color: '#2a4d8f', lineHeight: 1.5}}>
                      {tendance.verbatim}
                    </div>
                    <div style={{fontSize: '0.85rem', color: '#666', marginTop: '0.4rem', fontStyle: 'italic'}}>
                      Écart hebdomadaire : {tendance.ecart >= 0 ? '+' : ''}{tendance.ecart} kcal
                    </div>
                    <div style={{fontSize: '0.9rem', color: tendance.type === 'perte' ? '#27ae60' : tendance.type === 'surplus' ? '#e74c3c' : '#666', marginTop: '0.5rem', fontWeight: 500}}>
                      {tendance.projection}
                    </div>
                  </div>
                );
              })()}
              
              {/* Step 2 - Comparaison N/N-1 */}
              <ComparaisonN1Block />
              
              {/* Step 3 - Moyenne 14j */}
              <Moyenne14jBlock selectedDate={selectedDate} bilan={bilan} />
          </div>
        </div>
      );
    }
    
    // Composant Comparaison N/N-1
    function ComparaisonN1Block() {
      const { apportsTotaux, objectifHebdo } = bilan || {};
      const [comparaison, setComparaison] = React.useState(null);
      const [loading, setLoading] = React.useState(true);
      
      React.useEffect(() => {
        async function fetchComparaison() {
          if (!selectedDate || !apportsTotaux || !objectifHebdo) {
            setLoading(false);
            return;
          }
          
          try {
            const { calculerTendance7j, calculerComparaisonN1, getMonday, formatDate } = await import('../lib/validationSemaine');
            const { supabase } = await import('../lib/supabaseClient');
            
            const selectedWeekStart = formatDate(getMonday(selectedDate), 'yyyy-MM-dd');
            const tendanceN = calculerTendance7j(apportsTotaux, objectifHebdo);
            const ecartN = tendanceN.ecart;
            
            // Fetch semaine N-1
            const dateN1 = new Date(selectedWeekStart);
            dateN1.setDate(dateN1.getDate() - 7);
            const weekStartN1 = formatDate(dateN1, 'yyyy-MM-dd');
            
            const { data, error } = await supabase
              .from('semaines_validees')
              .select('ecart_hebdo, objectif_hebdo, apports_totaux')
              .eq('weekStart', weekStartN1)
              .single();
            
            if (error || !data || data.ecart_hebdo === null) {
              console.log('[Comparaison N/N-1] Pas de semaine N-1 avec données complètes');
              setLoading(false);
              setComparaison(null); // Pas de semaine précédente
              return;
            }
            
            const ecartN1 = data.ecart_hebdo;
            const apportsTotauxN1 = data.apports_totaux;
            const objectifN1 = data.objectif_hebdo;
            const comp = await calculerComparaisonN1(ecartN, ecartN1, tendanceN.type, selectedWeekStart, supabase);
            // Ajouter les données N-1 pour affichage Option 2
            comp.apportsTotauxN1 = apportsTotauxN1;
            comp.objectifN1 = objectifN1;
            comp.apportsTotauxN = apportsTotaux;
            comp.objectifN = objectifHebdo;
            
            // Calculer dates formatées pour affichage
            const dateDebN1 = new Date(weekStartN1);
            const dateFinN1 = new Date(weekStartN1);
            dateFinN1.setDate(dateFinN1.getDate() + 6);
            const dateDebN = new Date(selectedWeekStart);
            const dateFinN = new Date(selectedWeekStart);
            dateFinN.setDate(dateFinN.getDate() + 6);
            
            comp.periodeN1 = `${dateDebN1.getDate().toString().padStart(2, '0')}→${dateFinN1.getDate().toString().padStart(2, '0')} ${dateFinN1.toLocaleDateString('fr-FR', {month: 'short'})}`;
            comp.periodeN = `${dateDebN.getDate().toString().padStart(2, '0')}→${dateFinN.getDate().toString().padStart(2, '0')} ${dateFinN.toLocaleDateString('fr-FR', {month: 'short'})}`;
            
            setComparaison(comp);
          } catch (err) {
            console.error('[Comparaison N/N-1] Erreur:', err);
          } finally {
            setLoading(false);
          }
        }
        
        fetchComparaison();
      }, [selectedDate, apportsTotaux, objectifHebdo]);
      
      if (loading) return null;
      if (!comparaison) return null;
      
      return (
        <div style={{marginTop: '1.2rem', borderTop: '1px solid #e5e7eb', paddingTop: '1rem'}}>
          <div style={{fontSize: '0.9rem', fontWeight: 600, color: '#1f2937', marginBottom: '0.6rem'}}>
            📊 Comparaison avec la semaine dernière
          </div>
          
          {/* Badge */}
          <div style={{
            display: 'inline-block',
            background: comparaison.couleur,
            color: '#fff',
            padding: '0.3rem 0.7rem',
            borderRadius: 6,
            fontSize: '0.8rem',
            fontWeight: 600,
            marginBottom: '0.6rem'
          }}>
            {comparaison.badge}
          </div>
          
          {/* Verbatim principal */}
          <div style={{fontSize: '0.95rem', color: '#2a4d8f', lineHeight: 1.5, marginBottom: '0.6rem'}}
               dangerouslySetInnerHTML={{__html: comparaison.verbatim.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')}} />
          
          {/* Verbatim renforcé (3 semaines) */}
          {comparaison.renforcementVerbatim && (
            <div style={{
              background: '#fff3cd',
              border: '1px solid #ffc107',
              borderRadius: 6,
              padding: '0.7rem',
              marginTop: '0.8rem',
              fontSize: '0.9rem',
              color: '#856404',
              lineHeight: 1.5
            }}
                 dangerouslySetInnerHTML={{__html: comparaison.renforcementVerbatim.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')}} />
          )}
          
          {/* Analyse comparative détaillée (Option 2 - Format calcul visuel pédagogique) */}
          <div style={{
            fontSize: '0.85rem',
            color: '#555',
            marginTop: '0.8rem',
            background: '#f8f9fa',
            padding: '0.8rem',
            borderRadius: 6,
            borderLeft: '3px solid ' + comparaison.couleur
          }}>
            <div style={{fontWeight: 600, marginBottom: '0.7rem'}}>📊 Analyse comparative :</div>
            
            {/* Semaine N-1 */}
            <div style={{marginBottom: '0.8rem'}}>
              <div style={{fontWeight: 600, fontSize: '0.9rem', color: '#2c3e50', marginBottom: '0.3rem'}}>
                Semaine N-1 ({comparaison.periodeN1})
              </div>
              <div style={{paddingLeft: '1rem', lineHeight: 1.6}}>
                <div style={{color: '#333'}}>Total consommé : <strong>{comparaison.apportsTotauxN1?.toLocaleString()} kcal</strong></div>
                <div style={{color: '#666'}}>- Objectif : {comparaison.objectifN1?.toLocaleString()} kcal</div>
                <div style={{color: comparaison.ecartN1 > 0 ? '#e74c3c' : '#27ae60', fontWeight: 600, marginTop: '0.2rem'}}>
                  = Écart : {comparaison.ecartN1 >= 0 ? '+' : ''}{comparaison.ecartN1} kcal {comparaison.ecartN1 > 0 ? '📈' : '📉'}
                </div>
              </div>
            </div>
            
            {/* Semaine N */}
            <div style={{marginBottom: '0.8rem'}}>
              <div style={{fontWeight: 600, fontSize: '0.9rem', color: '#2c3e50', marginBottom: '0.3rem'}}>
                Semaine N ({comparaison.periodeN})
              </div>
              <div style={{paddingLeft: '1rem', lineHeight: 1.6}}>
                <div style={{color: '#333'}}>Total consommé : <strong>{comparaison.apportsTotauxN?.toLocaleString()} kcal</strong></div>
                <div style={{color: '#666'}}>- Objectif : {comparaison.objectifN?.toLocaleString()} kcal</div>
                  {/* Step 3 - Moyenne 14j */}
                  <Moyenne14jBlock />
                <div style={{color: comparaison.ecartN > 0 ? '#e74c3c' : '#27ae60', fontWeight: 600, marginTop: '0.2rem'}}>
                  = Écart : {comparaison.ecartN >= 0 ? '+' : ''}{comparaison.ecartN} kcal {comparaison.ecartN > 0 ? '📈' : '📉'}
                </div>
              </div>
            </div>
            
            {/* Évolution texte adaptatif avec symbole → */}
            <div style={{
              marginTop: '0.7rem',

        // Bloc Moyenne 14j

              paddingTop: '0.7rem',
              borderTop: '2px solid #ddd',
              fontSize: '0.9rem',
              fontWeight: 600,
              color: comparaison.couleur
            }}>
              → {comparaison.evolutionTexte}
            </div>
          </div>
        </div>
      );
    }
    // Blocs approfondis (affichage conditionnel)
    function BlocApprofondi() {
      const { apportsTotaux, objectifHebdo, kcalExtras, extras, budgetExtras } = bilan || {};
      const horsExtras = apportsTotaux - kcalExtras;
      // Répartition de l’écart
      const showRepartition = isExtrasResponsables(apportsTotaux, kcalExtras, objectifHebdo);
      // Fréquence vs charge
      const showFreqCharge = extras > 0 && kcalExtras > budgetExtras * 1.2;
      // Lecture de trajectoire (toujours affiché)
      return (
        <section style={{marginBottom: '2rem', background: '#f8fafc', borderRadius: 10, padding: '1.1rem 1.3rem', boxShadow: '0 1px 4px #e0e7ef'}}>
          {showRepartition && (
            <div style={{marginBottom: '0.6rem'}}>
              <b>🔍 Répartition de l’écart</b><br/>
              Sans extras, la semaine reste proche de la trajectoire cible.<br/>
              L’ajout des extras fait basculer l’équilibre hebdomadaire au-delà de l’objectif.
            </div>
          )}
          {showFreqCharge && (
            <div style={{marginBottom: '0.6rem'}}>
              <b>🔍 Fréquence vs charge</b><br/>
              Le nombre d’extras consommés et leur poids calorique total indiquent une concentration des écarts sur peu d’événements, mais à fort impact.
            </div>
          )}
          <div style={{marginBottom: '0.6rem'}}>
            <b>🔍 Lecture de trajectoire</b><br/>
            Si ce type de semaine se répète, la trajectoire hebdomadaire ne pourra pas se rééquilibrer uniquement par les repas.
          </div>
        </section>
      );
    }
  const modalRef = useRef(null);

  useEffect(() => {
    if (open && modalRef.current) {
      modalRef.current.focus();
    }
  }, [open]);

  if (!open) return null;

  // ...existing code...
  // Génération du verbatim automatique métier pour la lecture des extras (strictement conforme aux 4 cas métier)
  function getVerbatimLectureExtras(extras, kcalExtras, budgetExtras) {
    if (typeof extras !== 'number' || typeof kcalExtras !== 'number' || typeof budgetExtras !== 'number') return '';
    // Cas 1 : Peu d’extras, mais très caloriques (1–2 extras, kcal extras > budget)
    if (extras >= 1 && extras <= 2 && kcalExtras > budgetExtras) {
      return 'Cette semaine, les extras ont été peu nombreux mais très chargés. Leur impact vient surtout de leur intensité.';
    }
    // Cas 2 : Plusieurs extras, charge modérée (3–6 extras, kcal extras <= budget)
    if (extras >= 3 && extras <= 6 && kcalExtras <= budgetExtras) {
      return 'Cette semaine, les extras ont été fréquents mais répartis en petites quantités. Leur impact vient de l’accumulation.';
    }
    // Cas 3 : Plusieurs extras, charge élevée (5+ extras, kcal extras > budget)
    if (extras >= 5 && kcalExtras > budgetExtras) {
      return 'Cette semaine, les extras ont été à la fois fréquents et chargés. La répétition et l’intensité se sont additionnées.';
    }
    // Cas 4 : Extras maîtrisés (3 extras, kcal extras <= budget)
    if (extras === 3 && kcalExtras <= budgetExtras) {
      return 'Cette semaine, le nombre et la charge des extras sont restés dans le budget prévu.';
    }
    // Cas générique : si aucun cas strict ne correspond, phrase douce
    if (extras === 0 || kcalExtras === 0) {
      return 'Les extras ont été très limités cette semaine, leur impact est marginal.';
    }
    // Cas de dépassement modéré (autres situations)
    if (kcalExtras > budgetExtras) {
      return 'Cette semaine, les extras ont dépassé le budget prévu. À surveiller pour retrouver l’équilibre.';
    }
    // Cas de maintien modéré
    if (kcalExtras <= budgetExtras) {
      return 'Les extras sont restés dans une zone raisonnable cette semaine.';
    }
    return '';
  }

  return (
    <>
    {/* Overlay cliquable pour fermer */}
    <div 
      onClick={onClose}
      className="bilan-modal-backdrop"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0,0,0,0.6)',
        display: 'flex',
        alignItems: isMobile ? 'flex-start' : 'center',
        justifyContent: 'center',
        zIndex: 9999,
        overflowY: 'auto',
        padding: isMobile ? '0' : '2rem',
        WebkitOverflowScrolling: 'touch'
      }}
    >
    {/* Modale - clic ne ferme pas */}
    <div
      onClick={(e) => e.stopPropagation()}
      className={styles.overlay}
      tabIndex={-1}
      aria-modal="true"
      role="dialog"
      ref={modalRef}
      onKeyDown={(e) => {
        if (e.key === 'Escape') {
          onClose();
        }
      }}
      style={{
        position: 'relative',
        width: isMobile ? '100%' : '90%',
        maxWidth: modalMaxWidth,
        margin: isMobile ? '0' : '0 auto',
        minHeight: isMobile ? '100vh' : 'auto'
      }}
    >
      {/* Bouton télécharger PDF fixe en haut à gauche */}
      <button
        onClick={handleDownloadPDF}
        style={{
          position: 'absolute',
          top: isMobile ? '0.5rem' : '1rem',
          left: isMobile ? '0.5rem' : '1rem',
          background: '#2563eb',
          border: 'none',
          borderRadius: '8px',
          padding: isMobile ? '0.5rem 0.8rem' : '0.6rem 1rem',
          fontSize: isMobile ? '0.85rem' : '0.95rem',
          cursor: 'pointer',
          color: '#ffffff',
          fontWeight: 600,
          display: 'flex',
          alignItems: 'center',
          gap: '0.4rem',
          zIndex: 10001,
          boxShadow: '0 2px 8px rgba(37, 99, 235, 0.3)'
        }}
      >
        <span>📥</span>
        {!isMobile && <span>PDF</span>}
      </button>
      
      {/* Bouton fermeture fixe en haut à droite - HORS de la div scrollable */}
      <button
        onClick={onClose}
        style={{
          position: 'absolute',
          top: isMobile ? '0.5rem' : '1rem',
          right: isMobile ? '0.5rem' : '1rem',
          background: '#ffffff',
          border: '2px solid #e2e8f0',
          borderRadius: '50%',
          width: isMobile ? '36px' : '40px',
          height: isMobile ? '36px' : '40px',
          fontSize: isMobile ? '1.5rem' : '1.8rem',
          cursor: 'pointer',
          color: '#64748b',
          lineHeight: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          transition: 'all 0.2s',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = '#f1f5f9';
          e.currentTarget.style.color = '#1976d2';
          e.currentTarget.style.borderColor = '#1976d2';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = '#ffffff';
          e.currentTarget.style.color = '#64748b';
          e.currentTarget.style.borderColor = '#e2e8f0';
        }}
        aria-label="Fermer le bilan"
      >
        ×
      </button>
      
      <div className={styles.modal} style={{ padding: modalPadding, fontSize: fontSize }}>
        {/* Titre, période, phrase pédagogique */}
        <h2 style={{
          marginTop: '0',
          marginBottom: titleMarginBottom,
          color: '#1976d2',
          paddingRight: isMobile ? '3rem' : '3.5rem',
          fontSize: titleFontSize,
          lineHeight: isMobile ? '1.3' : '1.2',
          wordWrap: 'break-word'
        }}>
          Bilan de ta semaine alimentaire
        </h2>
        <div style={{
          fontWeight: 500,
          color: '#444',
          marginBottom: '0.5rem',
          fontSize: periodFontSize,
          lineHeight: isMobile ? '1.4' : '1.2'
        }}>
          {selectedDate ? (() => {
            const refDate = new Date(selectedDate);
            const day = refDate.getDay();
            const monday = new Date(refDate);
            monday.setDate(refDate.getDate() - ((day + 6) % 7));
            monday.setHours(0,0,0,0);
            const sunday = new Date(monday);
            sunday.setDate(monday.getDate() + 6);
            sunday.setHours(23,59,59,999);
            const fmt = d => d.toLocaleDateString('fr-FR', { weekday: 'long', day: '2-digit', month: '2-digit', year: '2-digit' });
            return `Semaine du lundi ${fmt(monday)} au dimanche ${fmt(sunday)}`;
          })() : ''}
        </div>
        <div style={{fontStyle: 'italic', color: '#1976d2', marginBottom: '1.2rem', fontSize: '1.01rem'}}>
          Ton corps évolue dans le temps. Ce bilan te montre la trajectoire, pas un jugement.
        </div>
        
        {/* Bandeau avertissement si semaine partiellement documentée (1-4 jours) */}
        {bilan?.nbJoursSaisis >= 1 && bilan?.nbJoursSaisis < 5 && (
          <div style={{
            marginBottom: '1.5rem',
            padding: '1rem 1.2rem',
            background: 'linear-gradient(135deg, #fff3cd 0%, #ffe69c 100%)',
            border: '2px solid #ffc107',
            borderRadius: 10,
            display: 'flex',
            alignItems: 'center',
            gap: '0.8rem',
            boxShadow: '0 2px 8px rgba(255, 193, 7, 0.2)'
          }}>
            <div style={{fontSize: '1.8rem', flexShrink: 0}}>⚠️</div>
            <div style={{flex: 1}}>
              <div style={{fontWeight: 700, color: '#856404', marginBottom: '0.5rem', fontSize: '1.05rem'}}>
                Semaine partiellement documentée : {bilan.nbJoursSaisis} jour{bilan.nbJoursSaisis > 1 ? 's' : ''} sur 7
              </div>
              <div style={{color: '#856404', fontSize: '0.93rem', lineHeight: 1.6}}>
                <div style={{marginBottom: '0.4rem'}}>
                  <strong>Important :</strong> L'objectif affiché ({typeof bilan.objectifHebdo === 'number' ? bilan.objectifHebdo.toLocaleString() : '—'} kcal) est calculé sur{' '}
                  <strong>{bilan.nbJoursSaisis} jour{bilan.nbJoursSaisis > 1 ? 's' : ''} uniquement</strong>, pas sur la semaine complète.
                </div>
                {bilan.nbJoursSaisis < 4 && (
                  <div style={{marginTop: '0.5rem', fontStyle: 'italic', fontSize: '0.88rem', opacity: 0.9}}>
                    Ce bilan ne peut pas déterminer si les jours non documentés correspondent à un jeûne ou à des oublis de saisie. Interprète ces statistiques avec prudence.
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
        
        {/* Si vraiment AUCUNE donnée saisie (0 kcal total), afficher message 'Bilan indisponible' */}
        {(bilan?.apportsTotaux === 0 || !bilan?.apportsTotaux) && (bilan?.extras === 0 || !bilan?.extras) ? (
          <section style={{
            marginTop: '2rem',
            marginBottom: '2rem',
            padding: '3rem 2rem',
            background: '#f8fafc',
            borderRadius: 12,
            textAlign: 'center',
            border: '2px dashed #cbd5e1',
            boxShadow: '0 1px 4px rgba(0,0,0,0.05)'
          }}>
            <div style={{fontSize: '3rem', marginBottom: '1rem'}}>📭</div>
            <h3 style={{color: '#64748b', fontSize: '1.3rem', marginBottom: '0.7rem', fontWeight: 600}}>
              Bilan indisponible
            </h3>
            <p style={{color: '#94a3b8', fontSize: '1.05rem', maxWidth: '500px', margin: '0 auto', lineHeight: 1.5}}>
              Aucune donnée n'a été saisie pour cette semaine. Le bilan ne peut pas être généré.
            </p>
          </section>
        ) : (
          <>
        {/* Bloc diagnostic dynamique métier (Lecture de la semaine) */}
        {BlocLectureSemaine()}
        {/* Résumé des données principales */}
        <section style={{marginBottom: '2rem', background: '#f4f8ff', borderRadius: 12, padding: '1.2rem 1.5rem', boxShadow: '0 1px 6px #dbeafe'}}>
          <h3 style={{marginBottom: '1rem', color: '#1976d2', fontSize: '1.15rem'}}>Résumé des données principales</h3>
          <ul style={{listStyle: 'none', padding: 0, margin: 0, fontSize: '1.08rem'}}>
            {/* Calories totales consommées (avec et hors extras) */}
            <li style={{marginBottom: 8}}>
              <span style={{fontWeight:600}}>Calories consommées (hors extras)&nbsp;:</span> <span style={{fontWeight:700, color:'#1976d2'}}>{
                typeof bilan?.apportsTotaux === 'number' && typeof bilan?.kcalExtras === 'number'
                  ? (bilan.apportsTotaux - bilan.kcalExtras)
                  : '—'
              }</span> kcal
            </li>
            <li style={{marginBottom: 8}}>
              <span style={{fontWeight:600}}>Calories consommées (total avec extras)&nbsp;:</span> <span style={{fontWeight:700, color:'#1976d2'}}>{
                typeof bilan?.apportsTotaux === 'number' ? bilan.apportsTotaux : '—'
              }</span> kcal
            </li>
            {/* Objectif hebdomadaire (incluant extras) - Libellé adapté selon contexte */}
            <li style={{marginBottom: 8}}>
              <span style={{fontWeight:600}}>
                {bilan?.nbJoursSaisis >= 5 
                  ? 'Objectif hebdomadaire (incluant extras)' 
                  : `Objectif sur ${bilan?.nbJoursSaisis || '—'} jour${bilan?.nbJoursSaisis > 1 ? 's' : ''} (incluant extras)`
                }&nbsp;:
              </span> <span style={{fontWeight:700}}>{
                typeof bilan?.objectifHebdo === 'number' ? bilan.objectifHebdo : '—'
              }</span> kcal
            </li>
            {/* Écart hebdomadaire - Libellé adapté selon contexte */}
            <li style={{marginBottom: 8}}>
              <span style={{fontWeight:600}}>
                {bilan?.nbJoursSaisis >= 5 ? 'Écart hebdomadaire' : `Écart sur ${bilan?.nbJoursSaisis || '—'} jour${bilan?.nbJoursSaisis > 1 ? 's' : ''}`}&nbsp;:
              </span> <span style={{fontWeight:700, color:'#e53935'}}>{
                typeof bilan?.apportsTotaux === 'number' && typeof bilan?.objectifHebdo === 'number'
                  ? ((bilan.apportsTotaux - bilan.objectifHebdo) > 0 ? '+' : '') + (bilan.apportsTotaux - bilan.objectifHebdo) + ' kcal'
                  : '—'
              }</span>
            </li>
          </ul>
          {/* Phrase de lecture automatique selon l'écart - Adaptée selon contexte */}
          <div style={{marginTop: '0.7rem', fontStyle: 'italic', color: '#1976d2', fontSize: '1.04rem'}}>
            {(() => {
              if (typeof bilan?.apportsTotaux === 'number' && typeof bilan?.objectifHebdo === 'number') {
                const ecart = bilan.apportsTotaux - bilan.objectifHebdo;
                const nbJours = bilan?.nbJoursSaisis || 7;
                
                // Message adapté si données partielles
                if (nbJours < 5) {
                  if (ecart < -100) {
                    return `Sur les ${nbJours} jour${nbJours > 1 ? 's' : ''} saisi${nbJours > 1 ? 's' : ''}, un déficit énergétique est observé.`;
                  } else if (ecart > 100) {
                    return `Sur les ${nbJours} jour${nbJours > 1 ? 's' : ''} saisi${nbJours > 1 ? 's' : ''}, un surplus énergétique est observé.`;
                  } else {
                    return `Sur les ${nbJours} jour${nbJours > 1 ? 's' : ''} saisi${nbJours > 1 ? 's' : ''}, l'apport est proche de l'objectif.`;
                  }
                }
                
                // Message normal si semaine complète (5+ jours)
                if (ecart < -100) {
                  return "Cette semaine crée un déficit énergétique. Elle va dans le sens de la perte de poids.";
                } else if (ecart > 100) {
                  return "Cette semaine est plus riche en énergie. Le corps aura besoin de temps pour s’ajuster.";
                } else {
                  return "Cette semaine est globalement en maintien. La trajectoire est stable.";
                }
              }
              return null;
            })()}
          </div>
        </section>
          {/* Section 2 — Tendance & Trajectoire (bloc rétractable) */}
          <div style={{marginBottom: '2rem', background: '#eaf6ff', borderRadius: 12, padding: '1.2rem 1.5rem', boxShadow: '0 1px 6px #b3d8f7'}}>
            <h2 style={{fontWeight: 'bold', fontSize: '1.15rem', color: '#2a4d8f', marginBottom: 4}}>Ta dynamique dans le temps — trajectoire sur 14J</h2>
            <p style={{fontStyle: 'italic', color: '#555', marginBottom: 12}}>Ce qui se construit semaine après semaine</p>
            {/* Bloc rétractable/accordion */}
            <AccordionTendance />
          </div>
        {/* Lecture des extras de la semaine */}
        <section style={{marginBottom: '2rem', background: '#fffef6', borderRadius: 10, padding: '1.1rem 1.3rem', boxShadow: '0 1px 4px #fde68a'}}>
          <h3 style={{color: '#b45309', marginBottom: '0.7rem', fontSize: '1.13rem'}}>Lecture des extras de la semaine</h3>
          <div style={{fontStyle: 'italic', color: '#444', marginBottom: '0.7rem', fontSize: '1.01rem'}}>
            Ici, on regarde comment les extras se sont exprimés cette semaine : par leur nombre et par leur poids calorique total.
          </div>
          <ul style={{listStyle: 'none', padding: 0, margin: 0, fontSize: '1.07rem'}}>
            <li style={{marginBottom: 7}}>
              <span style={{fontWeight:600}}>Nombre d’extras consommés&nbsp;:</span> <span style={{fontWeight:700, color:'#b45309'}}>{typeof bilan?.extras === 'number' ? bilan.extras : '—'}</span>
            </li>
            <li style={{marginBottom: 7}}>
              <span style={{fontWeight:600}}>Total kcal consommées via extras&nbsp;:</span> <span style={{fontWeight:700, color:'#eab308'}}>{typeof bilan?.kcalExtras === 'number' ? bilan.kcalExtras : '—'}</span> kcal
            </li>
            <li style={{marginBottom: 7}}>
              <span style={{fontWeight:600}}>Budget extras hebdo&nbsp;:</span> <span style={{fontWeight:700, color:'#2563eb'}}>{typeof bilan?.budgetExtras === 'number' ? bilan.budgetExtras : '—'}</span> kcal
            </li>
          </ul>
          <div style={{marginTop: '0.7rem', fontStyle: 'italic', color: '#2563eb', fontSize: '1.04rem'}}>
            {getVerbatimLectureExtras(bilan?.extras, bilan?.kcalExtras, bilan?.budgetExtras)}
          </div>
        </section>
        {/* Bloc En savoir plus (analyse croisée) */}
        {BlocEnSavoirPlus()}
        {/* Plus de bloc approfondi en bas : tout est fusionné dans la lecture principale */}
        
        {/* ═══════════════════════════════════════════════════════════════ */}
        {/* PHASE 3 - BLOCS ABC (Lectures A, B, C + Fragilités)            */}
        {/* ═══════════════════════════════════════════════════════════════ */}
        <BlocRepartitionJours />
        <BlocImpactJours />
        <BlocEvolutionExtras />
        <BlocAnalyseFragilites />
        

        {/* Section 7 — Comment j’ai mangé (bloc rétractable) */}
        <SectionCommentMange bilan={bilan} selectedDate={selectedDate} />
        
        {/* PHASE 3 - Bloc Objectif Personnalisé Semaine Prochaine */}
        <BlocObjectifSemaineProchaine bilanArchive={!!bilan?.objectif_perso} objectifArchive={objectifPersoSemaine} />
        </>
        )}
      </div>
    </div>
    </div>
    </>
  );
}

// Bloc Section 7 — Comment j’ai mangé
function SectionCommentMange({ bilan, selectedDate }) {
  const [open, setOpen] = React.useState(false);
  
  // Données dynamiques depuis bilan
  const satieteMoyenne = bilan?.satieteMoyenne;
  const humeurDominante = bilan?.humeurDominante;
  const noteUtilisateur = bilan?.noteUtilisateur;  const nbRepasSatiete = bilan?.nbRepasSatiete || 0;
  const nbRepasRessenti = bilan?.nbRepasRessenti || 0;  const extrasHorsRepas = bilan?.extrasHorsRepas || { matin: 0, apresmidi: 0, soir: 0, nuit: 0 };
  
  // Cas aucune donnée de ressenti
  const aucuneDonnee = !satieteMoyenne && !humeurDominante && !noteUtilisateur;

  // Bloc visuel
  return (
    <div style={{marginBottom: '2rem'}}>
      <button
        aria-expanded={open}
        aria-controls="comment-mange-details"
        onClick={() => setOpen(o => !o)}
        style={{
          background: '#1976d2', color: '#fff', border: 'none', borderRadius: 8,
          padding: '0.5rem 1.1rem', fontWeight: 600, fontSize: '1rem', cursor: 'pointer', marginBottom: open ? 10 : 0
        }}
      >
        {open ? 'Masquer le détail ▲' : 'Comment j’ai mangé cette semaine ▼'}
      </button>
      <div id="comment-mange-details" className="print-expand" style={{display: open ? 'block' : 'none', marginTop: '0.7rem', background: '#f7faff', borderRadius: 10, padding: '1.1rem 1.3rem', boxShadow: '0 1px 4px #b3d8f7'}}>
        {aucuneDonnee ? (
            <div style={{fontStyle: 'italic', color: '#64748b', padding: '1rem', textAlign: 'center'}}>
              Aucune donnée de ressenti saisie cette semaine.<br/>
              Pense à compléter ton journal pour un suivi plus précis ! 📝
            </div>
          ) : (
            <>
              <h3 style={{color: '#1976d2', marginBottom: '0.7rem', fontSize: '1.13rem'}}>Ressenti global de la semaine</h3>
              <ul style={{listStyle: 'none', padding: 0, margin: 0, fontSize: '1.07rem'}}>
                <li style={{marginBottom: 7}}>
                  <span style={{fontWeight:600}}>Satiété&nbsp;:</span> 
                  <span>
                    {satieteMoyenne ? (
                      <>
                        {satieteMoyenne} / 5 
                        <span style={{color: '#64748b', fontSize: '0.9rem', marginLeft: '0.3rem'}}>
                          (moyenne sur {nbRepasSatiete} repas)
                        </span>
                      </>
                    ) : 'Non renseigné'}
                  </span>
                </li>
                <li style={{marginBottom: 7}}>
                  <span style={{fontWeight:600}}>Humeur&nbsp;:</span> 
                  <span>
                    {humeurDominante ? (
                      <>
                        {humeurDominante}
                        <span style={{color: '#64748b', fontSize: '0.9rem', marginLeft: '0.3rem'}}>
                          ({nbRepasRessenti} repas)
                        </span>
                      </>
                    ) : 'Non renseigné'}
                  </span>
                </li>
                {noteUtilisateur && (
                  <li style={{marginBottom: 7}}>
                    <span style={{fontWeight:600}}>Note&nbsp;:</span> 
                    <span style={{fontStyle: 'italic', color: '#1976d2'}}>"{noteUtilisateur}"</span>
                  </li>
                )}
              </ul>
              
              <h4 style={{color: '#1976d2', margin: '1.1rem 0 0.5rem 0', fontSize: '1.07rem'}}>Répartition des extras hors repas</h4>
              {(() => {
                const totalExtras = (extrasHorsRepas.matin || 0) + (extrasHorsRepas.apresmidi || 0) + (extrasHorsRepas.soir || 0) + (extrasHorsRepas.nuit || 0);
                if (totalExtras === 0) {
                  return (
                    <div style={{fontStyle: 'italic', color: '#64748b', marginBottom: '1rem'}}>
                      Aucun extra hors repas cette semaine. Bravo pour ta régularité ! ✨
                    </div>
                  );
                }
                return (
                  <div style={{display: 'flex', gap: '1.2rem', marginBottom: '1rem', flexWrap: 'wrap'}}>
                    <span>Matin&nbsp;: <b>{extrasHorsRepas.matin || 0}</b></span>
                    <span>Après-midi&nbsp;: <b>{extrasHorsRepas.apresmidi || 0}</b></span>
                    <span>Soir&nbsp;: <b>{extrasHorsRepas.soir || 0}</b></span>
                    <span>Nuit&nbsp;: <b>{extrasHorsRepas.nuit || 0}</b></span>
                  </div>
                );
              })()}
              
              <div style={{marginTop: '0.7rem', fontStyle: 'italic', color: '#1976d2', fontSize: '1.04rem'}}>
                Ce que tu ressens aujourd'hui n'est qu'une étape : c'est la continuité qui façonne ton chemin.
              </div>
            </>
          )}
        </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// BLOC OBJECTIF PERSONNALISÉ SEMAINE PROCHAINE (hors modal principal)
function BlocObjectifSemaineProchaine({ modeValidation, objectifArchive }) {
  const [objectifPerso, setObjectifPerso] = useState('');
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // Calculer le lundi de la semaine prochaine
  const getNextWeekStart = () => {
    const today = new Date();
    const currentDay = today.getDay();
    const daysUntilNextMonday = currentDay === 0 ? 1 : (8 - currentDay);
    const nextMonday = new Date(today);
    nextMonday.setDate(today.getDate() + daysUntilNextMonday);
    return nextMonday.toISOString().split('T')[0];
  };
  
  // Charger objectif existant depuis localStorage
  useEffect(() => {
    const nextWeekStart = getNextWeekStart();
    const saved = localStorage.getItem(`objectif_semaine_${nextWeekStart}`);
    if (saved) {
      setObjectifPerso(saved);
    }
    setLoading(false);
  }, []);
  
  const handleSave = () => {
    const nextWeekStart = getNextWeekStart();
    localStorage.setItem(`objectif_semaine_${nextWeekStart}`, objectifPerso);
    
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };
  
  if (loading) return null;
  
  // MODE HISTORIQUE : Afficher uniquement le BLOC VERT en lecture seule
  if (!modeValidation) {
    return (
      <section style={{
        marginTop: '2rem',
        padding: '1.5rem',
        background: '#e8f5e9',
        borderRadius: 10,
        border: '2px solid #4caf50',
        boxShadow: '0 2px 8px rgba(76, 175, 80, 0.2)'
      }}>
        <h4 style={{color: '#2e7d32', fontSize: '1.15rem', marginBottom: '0.5rem'}}>
          🎯 Mon objectif pour cette semaine
        </h4>
        <p style={{fontSize: '1.05rem', color: '#1b5e20', marginBottom: '0.5rem', lineHeight: 1.6, fontStyle: 'italic'}}>
          {objectifArchive || 'Aucun objectif défini'}
        </p>
        <div style={{marginTop: '0.7rem', fontSize: '0.88rem', color: '#558b2f'}}>
          ✅ Cet objectif avait été défini lors de la validation de la semaine précédente.
        </div>
      </section>
    );
  }
  
  // MODE VALIDATION (DIMANCHE) : Afficher BLOC VERT (si objectifArchive) + BLOC JAUNE
  return (
    <>
      {/* Bloc 1 : Objectif de la semaine QUI SE TERMINE (défini semaine N-1) */}
      {objectifArchive && (
        <section style={{
          marginTop: '2rem',
          padding: '1.5rem',
          background: '#e8f5e9',
          borderRadius: 10,
          border: '2px solid #4caf50',
          boxShadow: '0 2px 8px rgba(76, 175, 80, 0.2)'
        }}>
          <h4 style={{color: '#2e7d32', fontSize: '1.15rem', marginBottom: '0.5rem'}}>
            🎯 Mon objectif pour cette semaine
          </h4>
          <p style={{fontSize: '1.05rem', color: '#1b5e20', marginBottom: '0.5rem', lineHeight: 1.6, fontStyle: 'italic'}}>
            {objectifArchive}
          </p>
          <div style={{marginTop: '0.7rem', fontSize: '0.88rem', color: '#558b2f'}}>
            ✅ Cet objectif avait été défini lors de la validation de la semaine précédente.
          </div>
        </section>
      )}
      
      {/* Bloc 2 : Textarea pour définir l'objectif de la semaine PROCHAINE */}
      <section style={{
        marginTop: '2rem',
        padding: '1.5rem',
        background: '#fef3c7',
        borderRadius: 10,
        border: '2px solid #fbbf24',
        boxShadow: '0 2px 8px rgba(251, 191, 36, 0.2)'
      }}>
        <h4 style={{color: '#d97706', fontSize: '1.15rem', marginBottom: '0.5rem'}}>
          🎯 Mon objectif pour la semaine prochaine
        </h4>
        <p style={{fontSize: '0.95rem', color: '#78716c', marginBottom: '1rem'}}>
          Prends un moment pour noter ce que tu veux améliorer. C'est ton engagement, pas une consigne.
        </p>
        
        <textarea
          value={objectifPerso}
          onChange={(e) => setObjectifPerso(e.target.value)}
          placeholder="Ex : Continuer les bonnes choses et rectifier les écarts identifiés. Plus de journée comme dimanche 25 janvier !"
          rows={4}
          style={{
            width: '100%',
            padding: '0.8rem',
            borderRadius: 8,
            border: '2px solid #fbbf24',
            fontSize: '1rem',
            fontFamily: 'inherit',
            resize: 'vertical',
            boxSizing: 'border-box'
          }}
        />
        
        <button
          onClick={handleSave}
          style={{
            marginTop: '0.7rem',
            background: saved ? '#22c55e' : '#d97706',
            color: '#fff',
            border: 'none',
            borderRadius: 8,
            padding: '0.6rem 1.2rem',
            fontWeight: 600,
            cursor: 'pointer',
            fontSize: '1rem',
            transition: 'background 0.3s'
          }}
        >
          {saved ? '✅ Enregistré !' : 'Enregistrer mon objectif'}
        </button>
        
        <div style={{marginTop: '1rem', fontSize: '0.9rem', color: '#78716c', fontStyle: 'italic'}}>
          💡 Cet objectif sera affiché en début de semaine prochaine pour te rappeler ta direction.
        </div>
      </section>
    </>
  );
}
