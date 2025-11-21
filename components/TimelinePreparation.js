import React from 'react';

export default function TimelinePreparation({ jalons }) {
  return (
    <div style={{display:'flex',justifyContent:'center',alignItems:'center',gap:'32px',margin:'24px 0'}}>
      {jalons.map(jalon => (
        <div key={jalon.label} style={{textAlign:'center'}}>
          <div style={{fontSize:'2em'}}>{jalon.icon}</div>
          <div style={{fontWeight:700,color:'#1976d2'}}>J-{jalon.day}</div>
          <div style={{fontSize:'0.98em',color:'#444'}}>{jalon.label}</div>
        </div>
      ))}
    </div>
  );
}
