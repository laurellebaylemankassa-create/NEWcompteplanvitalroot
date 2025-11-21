import React from 'react';

export default function PhaseCard({ phase, children }) {
  return (
    <section style={{background:'#f9fbe7',borderRadius:10,padding:'16px',marginBottom:18}}>
      <h2 style={{color:'#388e3c',fontWeight:700,fontSize:'1.15rem'}}>{phase.nom}</h2>
      <div style={{color:'#444',marginBottom:8}}>{phase.explication}</div>
      <div style={{color:'#1976d2',fontWeight:500}}>Période : {phase.periode}</div>
      {children}
    </section>
  );
}
