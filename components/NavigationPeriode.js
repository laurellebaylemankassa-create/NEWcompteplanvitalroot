import React, { useState } from 'react';
import PropTypes from 'prop-types';

// Utilitaire pour formater les dates en "Mois Année"
function formatMonthYear(dateStr) {
  const date = new Date(dateStr);
  return date.toLocaleString('fr-FR', { month: 'long', year: 'numeric' });
}

// Génère la liste des mois à partir du plan (planData)
function getMonthsFromPlan(planData) {
  if (!planData || !planData.paliers) return [];
  return planData.paliers.map((palier) => ({
    label: formatMonthYear(palier.debut),
    debut: palier.debut,
    semaines: palier.semaines || [],
  }));
}

export default function NavigationPeriode({ planData, onChange }) {
  const months = getMonthsFromPlan(planData);
  const [selectedMonth, setSelectedMonth] = useState(0);
  const [selectedWeek, setSelectedWeek] = useState(0);

  // Gestion du changement de mois
  const handleMonthChange = (idx) => {
    setSelectedMonth(idx);
    setSelectedWeek(0);
    if (onChange) {
      onChange({
        monthIndex: idx,
        weekIndex: 0,
        month: months[idx],
        week: months[idx].semaines[0] || null,
      });
    }
  };

  // Gestion du changement de semaine
  const handleWeekChange = (idx) => {
    setSelectedWeek(idx);
    if (onChange) {
      onChange({
        monthIndex: selectedMonth,
        weekIndex: idx,
        month: months[selectedMonth],
        week: months[selectedMonth].semaines[idx] || null,
      });
    }
  };

  if (!months.length) return null;

  return (
    <div className="navigation-periode">
      <div className="mois-tabs" style={{ display: 'flex', overflowX: 'auto', marginBottom: 8 }}>
        {months.map((m, idx) => (
          <button
            key={m.debut}
            className={idx === selectedMonth ? 'selected' : ''}
            style={{
              flex: '0 0 auto',
              marginRight: 4,
              padding: '6px 12px',
              borderRadius: 8,
              border: idx === selectedMonth ? '2px solid #0070f3' : '1px solid #ccc',
              background: idx === selectedMonth ? '#e6f0fa' : '#fff',
              fontWeight: idx === selectedMonth ? 'bold' : 'normal',
              cursor: 'pointer',
            }}
            onClick={() => handleMonthChange(idx)}
          >
            {m.label}
          </button>
        ))}
      </div>
      <div className="semaines-tabs" style={{ display: 'flex', overflowX: 'auto', marginBottom: 8 }}>
        {months[selectedMonth].semaines.map((s, idx) => (
          <button
            key={s.debut}
            className={idx === selectedWeek ? 'selected' : ''}
            style={{
              flex: '0 0 auto',
              marginRight: 4,
              padding: '4px 10px',
              borderRadius: 6,
              border: idx === selectedWeek ? '2px solid #0070f3' : '1px solid #ccc',
              background: idx === selectedWeek ? '#f0f7ff' : '#fff',
              fontWeight: idx === selectedWeek ? 'bold' : 'normal',
              cursor: 'pointer',
            }}
            onClick={() => handleWeekChange(idx)}
          >
            Semaine {idx + 1}
          </button>
        ))}
      </div>
    </div>
  );
}

NavigationPeriode.propTypes = {
  planData: PropTypes.object.isRequired,
  onChange: PropTypes.func,
};
