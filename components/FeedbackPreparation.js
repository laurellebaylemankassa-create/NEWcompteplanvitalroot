import React from 'react';

export default function FeedbackPreparation({ message, type }) {
  const color = type==='success' ? '#388e3c' : type==='error' ? '#f44336' : '#1976d2';
  return (
    <div style={{background:'#e6f7ff',color:color,padding:'12px 18px',borderRadius:8,marginBottom:12,fontWeight:600}} role="status" aria-live="polite">
      {message}
    </div>
  );
}
