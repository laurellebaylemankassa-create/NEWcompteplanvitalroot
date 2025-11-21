import BandeauDefiActif from '../components/BandeauDefiActif';
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

function RepasForm({ initial, onCancel, onSave }) {
  const [form, setForm] = useState(
    initial || {
      date: "",
      type: "",
      aliment: "",
      categorie: "",
      quantite: "",
      kcal: "",
    }
  );
  const [isFastFood, setIsFastFood] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    onSave(form);
    if (isFastFood) {
      const { supabase } = await import('../lib/supabaseClient');
      const { data: userData } = await supabase.auth.getUser();
      const user_id = userData?.user?.id || null;
      const { error } = await supabase.from('fast_food_history').insert([
        {
          user_id,
          date: form.date,
          restaurant: 'Manuel (édition)',
          aliments: [{ nom: form.aliment, quantite: form.quantite }]
        }
      ]);
      if (error) {
        alert('Erreur lors de l’enregistrement du fast food : ' + error.message);
      }
    }
  };

  return (
    <>
      <BandeauDefiActif
        defi={{ nom: "Défi test", duree: 5 }}
        progression={3}
        onOpenJournal={() => {}}
      />
      <form onSubmit={handleSubmit} style={{ marginBottom: 24, background: "#f9f9f9", padding: 16, borderRadius: 10 }}>
        <h2>{initial?.id ? "Modifier le repas" : "Ajouter un repas"}</h2>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 16 }}>
          <input name="date" type="date" value={form.date || ""} onChange={handleChange} required style={{ flex: 1, minWidth: 120 }} />
          <input name="type" placeholder="Type (petit-déj, déjeuner, etc.)" value={form.type || ""} onChange={handleChange} required style={{ flex: 1, minWidth: 120 }} />
          <input name="aliment" placeholder="Aliment" value={form.aliment || ""} onChange={handleChange} required style={{ flex: 1, minWidth: 120 }} />
          <input name="categorie" placeholder="Catégorie" value={form.categorie || ""} onChange={handleChange} required style={{ flex: 1, minWidth: 120 }} />
          <input name="quantite" placeholder="Quantité" value={form.quantite || ""} onChange={handleChange} required style={{ flex: 1, minWidth: 80 }} />
          <input name="kcal" placeholder="Kcal" type="number" value={form.kcal || ""} onChange={handleChange} required style={{ flex: 1, minWidth: 80 }} />
        </div>
        <div style={{ marginTop: 16 }}>
          <label style={{ marginRight: 16 }}>
            <input type="checkbox" checked={isFastFood} onChange={e => setIsFastFood(e.target.checked)} /> Fast food ?
          </label>
          <button type="submit" style={{ marginRight: 8, background: "#4caf50", color: "#fff", border: "none", borderRadius: 6, padding: "6px 16px", cursor: "pointer" }}>
            {initial?.id ? "Enregistrer" : "Ajouter"}
          </button>
          <button type="button" onClick={onCancel} style={{ background: "#ccc", border: "none", borderRadius: 6, padding: "6px 16px", cursor: "pointer" }}>
            Annuler
          </button>
        </div>
      </form>
    </>
  );
}

export default function Repas() {
  const [repas, setRepas] = useState([]);
  const [fastFoodRepas, setFastFoodRepas] = useState([]);
  const [repasDebug, setRepasDebug] = useState([]);
  const [objectifCalorique, setObjectifCalorique] = useState(null);
  const [caloriesDuJour, setCaloriesDuJour] = useState(0);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().slice(0,10));
  const [loading, setLoading] = useState(true);
  const [editRepas, setEditRepas] = useState(null);

  useEffect(() => {
    setObjectifCalorique(1800);
  }, []);

  useEffect(() => {
    async function fetchCaloriesForDay(dateRef) {
      const { data, error } = await supabase
        .from("repas_reels")
        .select("kcal, date, type, aliment")
        .eq("date", dateRef);
      if (!error && Array.isArray(data)) {
        setRepasDebug(data);
        const total = data.reduce((sum, r) => sum + (parseInt(r.kcal, 10) || 0), 0);
        setCaloriesDuJour(total);
      } else {
        setRepasDebug([]);
        setCaloriesDuJour(0);
      }
    }
    fetchCaloriesForDay(selectedDate);
  }, [selectedDate, repas]);

  async function handleValiderSemaine(r) {
    setRepas(repas.map(rep =>
      rep.date === r.date && rep.type === "Dîner"
        ? { ...rep, validee: true }
        : rep
    ));
  }

  async function handleDevaliderSemaine(r) {
    setRepas(repas.map(rep =>
      rep.date === r.date && rep.type === "Dîner"
        ? { ...rep, validee: false }
        : rep
    ));
  }

  useEffect(() => {
    fetchRepas();
    fetchFastFoodRepas();
  }, []);

  const fetchRepas = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("repas_reels")
      .select("*")
      .order("date", { ascending: false })
      .order("id", { ascending: false });
    if (!error) setRepas(data || []);
    setLoading(false);
  };

  const fetchFastFoodRepas = async () => {
    const { data, error } = await supabase
      .from('fast_food_history')
      .select('*');
    if (!error) setFastFoodRepas(data || []);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Supprimer ce repas ?")) return;
    await supabase.from("repas_reels").delete().eq("id", id);
    fetchRepas();
  };

  const handleEdit = (repasToEdit) => {
    setEditRepas(repasToEdit);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleFormSave = async (form) => {
    if (editRepas?.id) {
      await supabase
        .from("repas_reels")
        .update({
          date: form.date,
          type: form.type,
          aliment: form.aliment,
          categorie: form.categorie,
          quantite: form.quantite,
          kcal: form.kcal,
        })
        .eq("id", editRepas.id);
    }
    setEditRepas(null);
    await fetchRepas();
    await fetchFastFoodRepas();
  };

  return (
    <div style={{ maxWidth: 700, margin: "0 auto", padding: 24 }}>
      {/* Suivi calorique du jour dynamique avec date de référence bien visible */}
      <div style={{ background: "#fff", borderRadius: 16, boxShadow: "0 2px 12px #1976d211", padding: 18, marginBottom: 12 }}>
        <div style={{ fontWeight: 600, fontSize: 22, marginBottom: 10, display: 'flex', alignItems: 'center', gap: 16 }}>
          <span role="img" aria-label="bol">🥗</span> Suivi alimentaire du jour
          <span style={{ fontWeight: 700, color: "#1976d2", fontSize: 18, background: '#e3f2fd', borderRadius: 8, padding: '4px 12px', marginLeft: 12 }}>
            {selectedDate}
          </span>
        </div>
        <div>
          <span style={{ fontWeight: 600, color: "#888" }}>Objectif calorique du jour : </span>
          <span style={{ fontWeight: 700, color: "#ff9800", fontSize: 18 }}>
            {(objectifCalorique !== null && objectifCalorique !== undefined) ? `${objectifCalorique} kcal` : "…"}
          </span>
        </div>
        <div>
          <span style={{ fontWeight: 600, color: "#888" }}>Consommé ce jour : </span>
          <span style={{ fontWeight: 700, color: "#1976d2", fontSize: 18 }}>
            {caloriesDuJour} kcal
          </span>
        </div>
        <div>
          <span style={{ fontWeight: 600, color: "#888" }}>Reste à consommer : </span>
          <span style={{
            fontWeight: 700,
            color: caloriesDuJour > objectifCalorique ? "#e53935" : "#43a047",
            fontSize: 18
          }}>
            {(objectifCalorique !== null && objectifCalorique !== undefined && caloriesDuJour !== null)
              ? (objectifCalorique - caloriesDuJour) + " kcal"
              : "..."}
          </span>
        </div>
      </div>
      {/* Debug : liste des repas du jour et leurs calories (toujours visible) */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
        <button
          onClick={() => window.history.back()}
          style={{ background: "#1976d2", color: "#fff", border: "none", borderRadius: 6, padding: "8px 20px", cursor: "pointer", fontWeight: 600 }}
        >
          ← Retour
        </button>
        <a href="/tableau-de-bord" style={{ textDecoration: 'none' }}>
          <button
            style={{ background: "#43a047", color: "#fff", border: "none", borderRadius: 6, padding: "8px 20px", cursor: "pointer", fontWeight: 600 }}
          >
            🏠 Voir mon tableau de bord
          </button>
        </a>
      </div>
      <h1 style={{ textAlign: "center", marginBottom: 24 }}>🗑️ Gérer mes repas</h1>
      {/* Formulaire d'édition (s'affiche uniquement si on est en mode édition) */}
      {editRepas && (
        <RepasForm
          initial={editRepas}
          onCancel={() => setEditRepas(null)}
          onSave={handleFormSave}
        />
      )}
      {loading ? (
        <div>Chargement…</div>
      ) : repas.length === 0 ? (
        <div>Aucun repas enregistré.</div>
      ) : (
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "#f5f5f5" }}>
              <th style={{ padding: 8, border: "1px solid #ddd" }}>Date</th>
              <th style={{ padding: 8, border: "1px solid #ddd" }}>Type</th>
              <th style={{ padding: 8, border: "1px solid #ddd" }}>Aliment</th>
              <th style={{ padding: 8, border: "1px solid #ddd" }}>Catégorie</th>
              <th style={{ padding: 8, border: "1px solid #ddd" }}>Quantité</th>
              <th style={{ padding: 8, border: "1px solid #ddd" }}>Kcal</th>
              <th style={{ padding: 8, border: "1px solid #ddd" }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {repas.map((r) => (
              <tr key={r.id}>
                <td style={{ padding: 8, border: "1px solid #ddd", position: 'relative' }}>
                  {r.date || <span style={{ color: '#bbb' }}>—</span>}
                  {/* Validation semaine (dîner du dimanche) */}
                  {(() => {
                    const d = new Date(r.date);
                    if (d.getDay() === 0 && r.type === "Dîner") {
                      return (
                        <span style={{
                          marginLeft: 8,
                          fontWeight: 700,
                          color: r.validee ? '#43a047' : '#e53935',
                          fontSize: 13,
                          background: r.validee ? '#e8f5e9' : '#fffbe6',
                          borderRadius: 6,
                          padding: '2px 8px',
                          border: r.validee ? '1px solid #43a047' : '1px solid #e53935',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 8
                        }}>
                          {r.validee ? 'Semaine validée' : 'Non validée'}
                          {r.validee ? (
                            <button type="button" style={{ background: "#b71c1c", color: "#fff", border: "none", borderRadius: 8, padding: "2px 10px", fontWeight: 600, fontSize: 14, cursor: "pointer", marginLeft: 8 }} onClick={() => handleDevaliderSemaine(r)} title="Dévalider la semaine">❌</button>
                          ) : (
                            <button type="button" style={{ background: "#43a047", color: "#fff", border: "none", borderRadius: 8, padding: "2px 10px", fontWeight: 600, fontSize: 14, cursor: "pointer", marginLeft: 8 }} onClick={() => handleValiderSemaine(r)} title="Valider la semaine">✓</button>
                          )}
                        </span>
                      );
                    }
                    return null;
                  })()}
                </td>
                <td style={{ padding: 8, border: "1px solid #ddd" }}>{r.type || <span style={{ color: '#bbb' }}>—</span>}</td>
                <td style={{ padding: 8, border: "1px solid #ddd" }}>
                  {r.aliment ? (
                    <span>
                      {r.aliment}
                      {r.planifie && (
                        <span style={{ marginLeft: 6, color: '#1976d2', fontWeight: 600, fontSize: '0.95em', background: '#e3f2fd', borderRadius: 4, padding: '2px 6px' }} title="Repas planifié">Planifié</span>
                      )}
                    </span>
                  ) : <span style={{ color: '#bbb' }}>—</span>}
                </td>
                <td style={{ padding: 8, border: "1px solid #ddd" }}>
                  {r.categorie ? r.categorie : <span style={{ color: '#bbb' }}>—</span>}
                  {fastFoodRepas.some(ff =>
                    ff.date === r.date &&
                    ff.aliments?.some(a =>
                      a.nom?.trim().toLowerCase() === r.aliment?.trim().toLowerCase()
                    )
                  ) && (
                    <span style={{ marginLeft: 6, fontSize: '1.3em' }} title="Fast food">🍔</span>
                  )}
                </td>
                <td style={{ padding: 8, border: "1px solid #ddd" }}>{r.quantite ? r.quantite : <span style={{ color: '#bbb' }}>—</span>}</td>
                <td style={{ padding: 8, border: "1px solid #ddd" }}>{r.kcal ? r.kcal : <span style={{ color: '#bbb' }}>—</span>}</td>
                <td style={{ padding: 8, border: "1px solid #ddd" }}>
                  <button style={{ background: "#1976d2", color: "#fff", border: "none", borderRadius: 6, padding: "4px 12px", cursor: "pointer", marginRight: 8 }} onClick={() => handleEdit(r)}>Modifier</button>
                  <button style={{ background: "#f44336", color: "#fff", border: "none", borderRadius: 6, padding: "4px 12px", cursor: "pointer" }} onClick={() => handleDelete(r.id)}>Supprimer</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}