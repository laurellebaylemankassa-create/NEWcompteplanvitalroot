import React from 'react';

export default function ProgressBarPreparation({ progression, total }) {
  const percent = Math.round((progression/total)*100);
  return (
    <div style={{margin:'18px 0'}}>
      <div style={{height:10,background:'#e3f2fd',borderRadius:6}}>
        <div style={{width:`${percent}%`,height:'100%',background:'#1976d2',borderRadius:6,transition:'width 0.5s'}}></div>
      </div>
      <div style={{marginTop:6,fontWeight:600,color:'#1976d2'}}>{progression}/{total} critères validés ({percent}%)</div>
    </div>
  );
}
