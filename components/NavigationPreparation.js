import React from 'react';
import Link from 'next/link';

export default function NavigationPreparation() {
  return (
    <nav style={{display:'flex',gap:'18px',margin:'18px 0',justifyContent:'center'}}>
      <Link href="/preparation-jeune"><button style={{background:'#1976d2',color:'#fff',border:'none',borderRadius:8,padding:'10px 24px',fontWeight:600,fontSize:16,cursor:'pointer'}}>Préparation</button></Link>
      <Link href="/suivi"><button style={{background:'#388e3c',color:'#fff',border:'none',borderRadius:8,padding:'10px 24px',fontWeight:600,fontSize:16,cursor:'pointer'}}>Suivi</button></Link>
      <Link href="/"><button style={{background:'#fbc02d',color:'#fff',border:'none',borderRadius:8,padding:'10px 24px',fontWeight:600,fontSize:16,cursor:'pointer'}}>Tableau de bord</button></Link>
    </nav>
  );
}
