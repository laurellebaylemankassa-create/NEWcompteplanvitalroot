import React from 'react';

export default function Moyenne14jBlock({ selectedDate, bilan }) {
  const [loading, setLoading] = React.useState(true);
  const [total14j, setTotal14j] = React.useState(null);
  const [moyenne14j, setMoyenne14j] = React.useState(null);
  const [ecartN1, setEcartN1] = React.useState(null);
  const [ecartN, setEcartN] = React.useState(null);

  React.useEffect(() => {
    async function fetchData() {
      if (!selectedDate || !bilan?.objectifHebdo) { setLoading(false); return; }
      const { supabase } = await import('../lib/supabaseClient');
      const objectifJour = Math.round(bilan.objectifHebdo/7);
      // Dates pour 14j
      const end = new Date(selectedDate);
      end.setHours(23,59,59,999);
      const start14 = new Date(end); start14.setDate(end.getDate() - 13); start14.setHours(0,0,0,0);
      const fmt = d => d.toISOString().slice(0,10);
      // Récupérer tous les repas sur 14j
      const { data, error } = await supabase
        .from('repas_reels')
        .select('kcal, date')
        .gte('date', fmt(start14))
        .lte('date', fmt(end));
      if (error) { setLoading(false); return; }
      // Grouper par jour
      const jours = {};
      (data||[]).forEach(r => {
        const d = r.date.slice(0,10);
        if (!jours[d]) jours[d] = 0;
        jours[d] += r.kcal || 0;
      });
      // Compter le nombre de jours avec données réelles
      const nbJoursAvecDonnees = Object.keys(jours).length;
      // Si moins de 10 jours avec données sur 14j → données insuffisantes
      if (nbJoursAvecDonnees < 10) {
        console.log('[Moyenne14j] Données insuffisantes:', nbJoursAvecDonnees, 'jours sur 14');
        setLoading(false);
        return;
      }
      // Calculer total 14j et moyenne 14j
      let total = 0;
      for (let i=0; i<14; ++i) {
        const d = new Date(start14); d.setDate(start14.getDate()+i);
        const key = d.toISOString().slice(0,10);
        total += jours[key] || 0;
      }
      const totalObjectif = objectifJour * 14;
      const surplus14j = total - totalObjectif;
      setTotal14j(surplus14j);
      setMoyenne14j(Math.round(surplus14j/14));

      // Récupérer les écarts hebdo N-1 et N depuis la table semaines_validees
      const { formatDate, getMonday } = await import('../lib/validationSemaine');
      const weekStartN = formatDate(getMonday(selectedDate), 'yyyy-MM-dd');
      const dateN1 = new Date(weekStartN); dateN1.setDate(dateN1.getDate() - 7);
      const weekStartN1 = formatDate(dateN1, 'yyyy-MM-dd');
      const { data: semN1, error: errN1 } = await supabase
        .from('semaines_validees')
        .select('ecart_hebdo')
        .eq('weekStart', weekStartN1)
        .single();
      const { data: semN, error: errN } = await supabase
        .from('semaines_validees')
        .select('ecart_hebdo')
        .eq('weekStart', weekStartN)
        .single();
      setEcartN1(semN1?.ecart_hebdo ?? null);
      setEcartN(semN?.ecart_hebdo ?? null);
      setLoading(false);
    }
    fetchData();
  }, [selectedDate, bilan?.objectifHebdo]);

  if (loading) return null;
  if (total14j === null || moyenne14j === null) return null;

  // Détection de la situation
  // Seuils pour variantes (ajuster si besoin)
  const seuilStabilite = 100;
  const seuilMaîtrise = -100;
  // Par défaut, on considère surplus
  let situation = 'surplus';
  if (total14j < seuilMaîtrise) situation = 'maitrise';
  else if (Math.abs(total14j) <= seuilStabilite) situation = 'stabilite';
  else if (ecartN !== null && ecartN1 !== null) {
    if (ecartN < ecartN1 && total14j > 0) situation = 'amelioration';
    if (ecartN > ecartN1 && total14j > 0) situation = 'eloignement';
  }

  // Variantes de verbatim (strictement dans l'esprit Plan Vital)
  const verbatims = {
    surplus: {
      titre: "Lecture sur 14 jours — ce qui s’accumule",
      intro: <>Sur les 14 derniers jours :<br/><span style={{fontWeight:700, color:'#e74c3c', fontSize:'1.18rem'}}>Ton corps a reçu +{total14j.toLocaleString()} kcal au-dessus de ton objectif.</span></>,
      explication: <>Pris isolément, chaque jour peut sembler anodin.<br/>Mais sur 14 jours, ces écarts s’additionnent et commencent à orienter la trajectoire.</>,
      rythme: <>Cela représente une moyenne de <b>+{moyenne14j.toLocaleString()} kcal par jour</b> au-dessus de l’objectif.</>,
      rythmeExp: <>Le corps ne réagit pas aux journées isolées,<br/>il réagit à ce rythme répété jour après jour.</>,
      semaines: <>Détail des deux semaines :<br/><span style={{display:'inline-block',marginTop:'0.2rem'}}>• Semaine N-1 : <b>+{ecartN1 !== null ? ecartN1.toLocaleString() : '—'} kcal</b><br/>• Semaine N : <b>+{ecartN !== null ? ecartN.toLocaleString() : '—'} kcal</b></span></>,
      semainesExp: <>Les deux semaines sont au-dessus de l’objectif,<br/>avec un écart très proche d’une semaine à l’autre.</>,
      conclusion: <>Cela signifie que, sur deux semaines consécutives,<br/>le corps reçoit un message de continuité plutôt que d’ajustement.</>,
      ancrage: <>Une journée ne décide rien.<br/>Une semaine oriente.<br/>Deux semaines commencent à s’imprimer.</>
    },
    maitrise: {
      titre: "Lecture sur 14 jours — ce qui s’accumule",
      intro: <>Sur les 14 derniers jours :<br/><span style={{fontWeight:700, color:'#27ae60', fontSize:'1.18rem'}}>Ton corps a reçu {total14j.toLocaleString()} kcal en dessous de ton objectif.</span></>,
      explication: <>Chaque jour pris isolément semble discret.<br/>Mais sur 14 jours, cette dynamique s’installe et oriente la trajectoire.</>,
      rythme: <>Cela représente une moyenne de <b>{moyenne14j.toLocaleString()} kcal par jour</b> sous l’objectif.</>,
      rythmeExp: <>Le corps ne réagit pas à une journée, mais à ce rythme répété jour après jour.</>,
      semaines: <>Détail des deux semaines :<br/><span style={{display:'inline-block',marginTop:'0.2rem'}}>• Semaine N-1 : <b>{ecartN1 !== null ? ecartN1.toLocaleString() : '—'} kcal</b><br/>• Semaine N : <b>{ecartN !== null ? ecartN.toLocaleString() : '—'} kcal</b></span></>,
      semainesExp: <>Les deux semaines sont sous l’objectif,<br/>avec une continuité encourageante.</>,
      conclusion: <>Deux semaines consécutives sous l’objectif : la trajectoire s’ajuste dans la bonne direction.</>,
      ancrage: <>Une journée ne décide rien.<br/>Une semaine oriente.<br/>Deux semaines commencent à s’imprimer.</>
    },
    stabilite: {
      titre: "Lecture sur 14 jours — stabilité",
      intro: <>Sur les 14 derniers jours :<br/><span style={{fontWeight:700, color:'#2563eb', fontSize:'1.18rem'}}>Les écarts restent très proches de l’objectif.</span></>,
      explication: <>Jour après jour, la trajectoire reste stable.<br/>Aucune direction nette ne s’imprime sur la période.</>,
      rythme: <>Cela représente une moyenne de <b>{moyenne14j > 0 ? '+' : ''}{moyenne14j.toLocaleString()} kcal par jour</b> par rapport à l’objectif.</>,
      rythmeExp: <>Le corps perçoit cette stabilité comme un équilibre.<br/>C’est la répétition qui compte.</>,
      semaines: <>Détail des deux semaines :<br/><span style={{display:'inline-block',marginTop:'0.2rem'}}>• Semaine N-1 : <b>{ecartN1 !== null ? (ecartN1 > 0 ? '+' : '') + ecartN1.toLocaleString() : '—'} kcal</b><br/>• Semaine N : <b>{ecartN !== null ? (ecartN > 0 ? '+' : '') + ecartN.toLocaleString() : '—'} kcal</b></span></>,
      semainesExp: <>Les deux semaines sont très proches l’une de l’autre.<br/>La trajectoire ne s’éloigne ni ne se rapproche.</>,
      conclusion: <>La stabilité s’installe sur la durée.<br/>Le corps s’ajuste à ce rythme régulier.</>,
      ancrage: <>Une journée ne décide rien.<br/>Une semaine oriente.<br/>Deux semaines commencent à s’imprimer.</>
    },
    amelioration: {
      titre: "Lecture sur 14 jours — évolution",
      intro: <>Sur les 14 derniers jours :<br/><span style={{fontWeight:700, color:'#2563eb', fontSize:'1.18rem'}}>La trajectoire commence à s’ajuster.</span></>,
      explication: <>La deuxième semaine montre un écart réduit par rapport à la première.<br/>Le corps perçoit ce changement dans la durée.</>,
      rythme: <>Cela représente une moyenne de <b>{moyenne14j > 0 ? '+' : ''}{moyenne14j.toLocaleString()} kcal par jour</b> par rapport à l’objectif.</>,
      rythmeExp: <>Le rythme s’améliore, jour après jour.<br/>C’est la continuité qui compte.</>,
      semaines: <>Détail des deux semaines :<br/><span style={{display:'inline-block',marginTop:'0.2rem'}}>• Semaine N-1 : <b>{ecartN1 !== null ? (ecartN1 > 0 ? '+' : '') + ecartN1.toLocaleString() : '—'} kcal</b><br/>• Semaine N : <b>{ecartN !== null ? (ecartN > 0 ? '+' : '') + ecartN.toLocaleString() : '—'} kcal</b></span></>,
      semainesExp: <>La deuxième semaine est plus proche de l’objectif.<br/>La trajectoire s’ajuste progressivement.</>,
      conclusion: <>Le corps reçoit un message d’ajustement.<br/>La direction s’améliore sur la durée.</>,
      ancrage: <>Une journée ne décide rien.<br/>Une semaine oriente.<br/>Deux semaines commencent à s’imprimer.</>
    },
    eloignement: {
      titre: "Lecture sur 14 jours — évolution",
      intro: <>Sur les 14 derniers jours :<br/><span style={{fontWeight:700, color:'#eab308', fontSize:'1.18rem'}}>La trajectoire s’éloigne de l’objectif.</span></>,
      explication: <>La deuxième semaine montre un écart plus important que la première.<br/>Le corps perçoit cette évolution dans la durée.</>,
      rythme: <>Cela représente une moyenne de <b>{moyenne14j > 0 ? '+' : ''}{moyenne14j.toLocaleString()} kcal par jour</b> par rapport à l’objectif.</>,
      rythmeExp: <>Le rythme s’éloigne de l’objectif, jour après jour.<br/>C’est la continuité qui compte.</>,
      semaines: <>Détail des deux semaines :<br/><span style={{display:'inline-block',marginTop:'0.2rem'}}>• Semaine N-1 : <b>{ecartN1 !== null ? (ecartN1 > 0 ? '+' : '') + ecartN1.toLocaleString() : '—'} kcal</b><br/>• Semaine N : <b>{ecartN !== null ? (ecartN > 0 ? '+' : '') + ecartN.toLocaleString() : '—'} kcal</b></span></>,
      semainesExp: <>La deuxième semaine s’éloigne davantage de l’objectif.<br/>La trajectoire s’écarte progressivement.</>,
      conclusion: <>Le corps reçoit un message de continuité dans l’éloignement.<br/>La direction s’imprime sur la durée.</>,
      ancrage: <>Une journée ne décide rien.<br/>Une semaine oriente.<br/>Deux semaines commencent à s’imprimer.</>
    }
  };


  // Variantes de positionnement de la semaine courante
  const positionnements = {
    surplus: [
      "Cette semaine prolonge la dynamique de surplus amorcée précédemment.",
      "La semaine en cours s’inscrit dans la continuité d’un apport supérieur à l’objectif.",
      "Cette semaine confirme la tendance d’accumulation observée sur la période.",
      "La trajectoire de surplus se poursuit avec la semaine actuelle."
    ],
    maitrise: [
      "Cette semaine confirme la dynamique de maîtrise installée.",
      "La semaine en cours s’inscrit dans la continuité d’un rythme maîtrisé.",
      "Cette semaine prolonge la trajectoire de régulation engagée.",
      "La dynamique de maîtrise se maintient sur la semaine actuelle."
    ],
    stabilite: [
      "La semaine reste stable, sans changement notable de trajectoire.",
      "Cette semaine s’inscrit dans la continuité d’un équilibre observé.",
      "La trajectoire demeure stable avec la semaine en cours.",
      "Aucun changement de direction n’est observé cette semaine."
    ],
    amelioration: [
      "Cette semaine marque un ajustement positif dans la trajectoire.",
      "La semaine en cours amorce une évolution vers l’objectif.",
      "Un mouvement d’ajustement se dessine cette semaine.",
      "La trajectoire commence à se rapprocher de l’objectif avec cette semaine."
    ],
    eloignement: [
      "Cette semaine accentue l’éloignement par rapport à l’objectif.",
      "La semaine en cours prolonge la dynamique d’écart observée.",
      "Un éloignement supplémentaire s’observe cette semaine.",
      "La trajectoire s’écarte davantage de l’objectif avec la semaine actuelle."
    ]
  };

  // Choix aléatoire de la variante à chaque rendu
  function pickVariante(arr) {
    if (!arr || arr.length === 0) return '';
    return arr[Math.floor(Math.random() * arr.length)];
  }

  const v = verbatims[situation];
  const phrasePositionnement = pickVariante(positionnements[situation]);

  // En-tête pédagogique (fusionné, palette cohérente)
  const headerStyle = {
    background: 'linear-gradient(90deg, #e0e7ff 0%, #f0f6ff 100%)',
    borderRadius: '10px',
    padding: '0.9rem 1.1rem',
    marginBottom: '1.1rem',
    display: 'flex',
    alignItems: 'center',
    boxShadow: '0 1px 4px #e0e7ef',
    border: '1.5px solid #dbeafe',
    gap: '1rem'
  };
  const iconStyle = {
    fontSize: '1.7rem',
    color: '#2563eb',
    flexShrink: 0
  };

  // Rappel contextuel (toujours en bas)
  const reminderStyle = {
    fontSize: '0.93rem',
    color: '#64748b',
    marginTop: '1.1rem',
    fontStyle: 'italic',
    textAlign: 'center',
    background: '#f1f5f9',
    borderRadius: '8px',
    padding: '0.6rem 0.8rem',
    border: '1px solid #e5e7eb'
  };

  // Rappel contextuel dynamique
  let rappelContextuel = '';
  if (situation === 'stabilite') {
    rappelContextuel = "La trajectoire observée sur 14 jours reflète une continuité entre les deux semaines.";
  } else if (situation === 'amelioration') {
    rappelContextuel = "La dynamique 14j intègre l’évolution positive de la semaine en cours.";
  } else if (situation === 'eloignement') {
    rappelContextuel = "La trajectoire 14j s’écarte davantage avec la semaine actuelle.";
  } else if (situation === 'surplus' || situation === 'maitrise') {
    // Si les deux semaines sont très proches
    if (ecartN !== null && ecartN1 !== null && Math.abs(ecartN - ecartN1) < 100) {
      rappelContextuel = "La dynamique observée sur 14 jours reflète une continuité entre les deux semaines.";
    } else {
      rappelContextuel = "Ce signal 14j est influencé par la semaine précédente : il ne doit pas masquer le changement observé cette semaine.";
    }
  }

  // Affichage conditionnel de la phrase signature Plan Vital
  let showSignature = false;
  if (
    situation === 'surplus' || situation === 'maitrise' ||
    situation === 'amelioration' || situation === 'eloignement'
  ) {
    showSignature = true;
  }

  return (
    <section style={{
      background: '#f8fafc',
      borderRadius: 14,
      padding: '1.5rem 1.7rem',
      marginTop: '1.3rem',
      boxShadow: '0 2px 8px #e0e7ef',
      border: '1.5px solid #dbeafe',
      maxWidth: 560,
      marginLeft: 'auto',
      marginRight: 'auto'
    }}>
      {/* En-tête pédagogique */}
      <div style={headerStyle}>
        <span style={iconStyle}>📊</span>
        <div>
          <div style={{fontWeight:700, color:'#2563eb', fontSize:'1.09rem', marginBottom:'0.15rem'}}>Schéma sur 14 jours : une tendance s’installe-t-elle ?</div>
          <div style={{fontSize:'0.99rem', color:'#334155'}}>La moyenne 14j ne juge pas la semaine, elle révèle si un schéma commence à s’imprimer dans le temps.</div>
        </div>
      </div>

      {/* Bloc dynamique métier */}
      <div>
        <div style={{fontWeight:700, color:'#2563eb', fontSize:'1.13rem', marginBottom:'0.7rem', letterSpacing:0.1}}>
          {v.titre}
        </div>
        {/* Positionnement de la semaine courante (badge/encadré) */}
        <div style={{
          background:'#e0e7ff',
          color:'#1e293b',
          borderRadius: '7px',
          padding: '0.45rem 0.9rem',
          fontWeight: 600,
          fontSize: '1.01rem',
          marginBottom: '0.7rem',
          display: 'inline-block',
          boxShadow: '0 1px 3px #e0e7ef',
          border: '1px solid #c7d2fe'
        }}>{phrasePositionnement}</div>
        <div style={{fontSize:'1.08rem', color:'#222', marginBottom:'0.3rem'}}>{v.intro}</div>
        <div style={{color:'#64748b', fontSize:'0.97rem', marginBottom:'0.7rem'}}>{v.explication}</div>
        <div style={{fontWeight:600, color:'#2563eb', fontSize:'1.07rem', marginBottom:'0.3rem'}}>Lecture du rythme réel</div>
        <div style={{fontSize:'1.05rem', color:'#222', marginBottom:'0.2rem'}}>{v.rythme}</div>
        <div style={{color:'#64748b', fontSize:'0.97rem', marginBottom:'0.7rem'}}>{v.rythmeExp}</div>
        <div style={{fontWeight:600, color:'#2563eb', fontSize:'1.07rem', marginBottom:'0.3rem'}}>Mise en perspective temporelle (semaines)</div>
        <div style={{fontSize:'1.01rem', color:'#222', marginBottom:'0.2rem'}}>{v.semaines}</div>
        <div style={{color:'#64748b', fontSize:'0.97rem', marginBottom:'0.7rem'}}>{v.semainesExp}</div>
        <div style={{fontWeight:600, color:'#2563eb', fontSize:'1.07rem', marginBottom:'0.3rem'}}>Traduction consciente</div>
        <div style={{fontSize:'1.01rem', color:'#222', marginBottom:'0.7rem'}}>{v.conclusion}</div>
        {showSignature && (
          <div style={{color:'#334155', fontSize:'1.01rem', fontStyle:'italic', borderTop:'1px solid #e5e7eb', paddingTop:'0.7rem', marginTop:'0.7rem', textAlign:'center'}}>{v.ancrage}</div>
        )}
      </div>

      {/* Rappel contextuel dynamique */}
      <div style={reminderStyle}>
        {rappelContextuel}
      </div>
    </section>
  );
}