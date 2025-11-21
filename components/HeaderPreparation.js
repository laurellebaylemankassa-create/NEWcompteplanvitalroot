import React from 'react';

export default function HeaderPreparation() {
  return (
    <header style={{background:'#e3f2fd',padding:'24px 0',textAlign:'center',borderRadius:12,marginBottom:24}}>
      <img src="/images/sunrise.svg" alt="Lever de soleil" style={{height:48,marginBottom:12}}/>
      <h1 style={{color:'#1976d2',fontWeight:800,fontSize:'2.2rem'}}>🌙 Ma préparation au jeûne</h1>
    </header>
  );
}
