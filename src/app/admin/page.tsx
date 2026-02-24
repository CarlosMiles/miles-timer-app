"use client";

import { useState, useEffect } from "react";

// French labels for statuses
const STATUS_LABELS: Record<string, string> = {
  NOUVEAU: "Nouveau",
  TIMERS_CONTACTES: "Timers contactés",
  EN_ATTENTE: "En attente",
  DEVIS_ENVOYE: "Devis envoyé",
  GAGNE: "Gagné",
  PERDU: "Perdu",
  PAS_DISPONIBLE: "Pas disponible",
  A_CONTACTER: "À contacter",
};

// Colors for statuses
const STATUS_COLORS: Record<string, string> = {
  NOUVEAU: "#6b7280",
  TIMERS_CONTACTES: "#3b82f6",
  EN_ATTENTE: "#f59e0b",
  DEVIS_ENVOYE: "#8b5cf6",
  GAGNE: "#22c55e",
  PERDU: "#ef4444",
  PAS_DISPONIBLE: "#9ca3af",
  A_CONTACTER: "#6b7280",
};

interface Lead {
  id: string;
  createdAt: string;
  eventName: string;
  eventDate: string;
  city: string;
  postcode: string;
  participants?: number;
  organizerName: string;
  organizerEmail: string;
  organizerPhone?: string;
  status: string;
  notes?: string;
  assignments: {
    id: string;
    timer: {
      id: string;
      name: string;
      companyName?: string;
      email: string;
    };
    status: string;
    distanceKm?: number;
    emailSentAt?: string;
  }[];
}

export default function AdminPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [researching, setResearching] = useState<string | null>(null);
  const [adminToken, setAdminToken] = useState("");

  // Get admin token from URL
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const token = params.get("token") || "";
      setAdminToken(token);
      if (token) {
        fetchLeads(token);
      } else {
        setLoading(false);
        setError("Veuillez ajouter ?token=VOTRE_TOKEN à l'URL");
      }
    }
  }, []);

  async function fetchLeads(token: string) {
    try {
      const res = await fetch("/api/leads", {
        headers: { authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setLeads(data.leads);
    } catch (e) {
      setError("Erreur lors du chargement des leads");
    } finally {
      setLoading(false);
    }
  }

  async function launchResearch(leadId: string) {
    if (!adminToken) return;
    setResearching(leadId);
    try {
      const res = await fetch(`/api/leads/${leadId}/research`, {
        method: "POST",
        headers: { authorization: `Bearer ${adminToken}` },
      });
      if (!res.ok) throw new Error("Failed");
      const data = await res.json();
      alert(`${data.timersContacted} chronométreurs contactés !`);
      fetchLeads(adminToken);
    } catch (e) {
      alert("Erreur lors du lancement de la recherche");
    } finally {
      setResearching(null);
    }
  }

  if (loading) return <div style={styles.loading}>Chargement...</div>;
  if (error) return <div style={styles.error}>{error}</div>;

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <h1 style={styles.title}>📊 Devis Chrono - Admin</h1>
        <p style={styles.subtitle}>Gestion des demandes de devis chronométrage</p>
      </header>

      <div style={styles.stats}>
        <div style={styles.statCard}>
          <div style={styles.statValue}>{leads.length}</div>
          <div style={styles.statLabel}>Total leads</div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statValue}>
            {leads.filter((l) => l.status === "NOUVEAU").length}
          </div>
          <div style={styles.statLabel}>Nouveaux</div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statValue}>
            {leads.filter((l) => l.status === "EN_ATTENTE").length}
          </div>
          <div style={styles.statLabel}>En attente</div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statValue}>
            {leads.filter((l) => l.status === "GAGNE").length}
          </div>
          <div style={styles.statLabel}>Gagnés</div>
        </div>
      </div>

      <div style={styles.tableContainer}>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Date événement</th>
              <th style={styles.th}>Événement</th>
              <th style={styles.th}>Lieu</th>
              <th style={styles.th}>Participants</th>
              <th style={styles.th}>Organisateur</th>
              <th style={styles.th}>Statut</th>
              <th style={styles.th}>Timers</th>
              <th style={styles.th}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {leads.map((lead) => (
              <tr key={lead.id} style={styles.tr}>
                <td style={styles.td}>
                  {new Date(lead.eventDate).toLocaleDateString("fr-FR")}
                </td>
                <td style={styles.td}>
                  <strong>{lead.eventName}</strong>
                </td>
                <td style={styles.td}>
                  {lead.city} ({lead.postcode})
                </td>
                <td style={styles.td}>{lead.participants || "-"}</td>
                <td style={styles.td}>
                  {lead.organizerName}
                  <br />
                  <small style={styles.small}>{lead.organizerEmail}</small>
                </td>
                <td style={styles.td}>
                  <span
                    style={{
                      ...styles.badge,
                      backgroundColor: STATUS_COLORS[lead.status] || "#6b7280",
                    }}
                  >
                    {STATUS_LABELS[lead.status] || lead.status}
                  </span>
                </td>
                <td style={styles.td}>
                  {lead.assignments.length > 0 ? (
                    <div>
                      {lead.assignments.map((a) => (
                        <div key={a.id} style={styles.timerRow}>
                          {a.timer.name}
                          <span
                            style={{
                              ...styles.timerBadge,
                              backgroundColor: STATUS_COLORS[a.status] || "#6b7280",
                            }}
                          >
                            {STATUS_LABELS[a.status] || a.status}
                          </span>
                          {a.distanceKm && (
                            <span style={styles.distance}>{Math.round(a.distanceKm)}km</span>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <span style={styles.noTimers}>Aucun</span>
                  )}
                </td>
                <td style={styles.td}>
                  {lead.status === "NOUVEAU" && (
                    <button
                      onClick={() => launchResearch(lead.id)}
                      disabled={researching === lead.id}
                      style={styles.button}
                    >
                      {researching === lead.id
                        ? "Recherche..."
                        : "🔍 Lancer recherche"}
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    fontFamily: "system-ui, -apple-system, sans-serif",
    maxWidth: "1400px",
    margin: "0 auto",
    padding: "20px",
  },
  header: {
    marginBottom: "30px",
  },
  title: {
    fontSize: "28px",
    margin: "0 0 5px 0",
  },
  subtitle: {
    color: "#666",
    margin: 0,
  },
  stats: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))",
    gap: "15px",
    marginBottom: "30px",
  },
  statCard: {
    background: "white",
    padding: "20px",
    borderRadius: "8px",
    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
    textAlign: "center",
  },
  statValue: {
    fontSize: "32px",
    fontWeight: "bold",
    color: "#111",
  },
  statLabel: {
    fontSize: "12px",
    color: "#666",
    textTransform: "uppercase",
  },
  tableContainer: {
    background: "white",
    borderRadius: "8px",
    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
    overflow: "auto",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    fontSize: "14px",
  },
  th: {
    padding: "12px",
    textAlign: "left",
    background: "#f9fafb",
    fontWeight: 600,
    color: "#666",
    fontSize: "12px",
    textTransform: "uppercase",
    borderBottom: "1px solid #e5e7eb",
  },
  tr: {
    borderBottom: "1px solid #e5e7eb",
  },
  td: {
    padding: "12px",
    verticalAlign: "top",
  },
  badge: {
    display: "inline-block",
    padding: "4px 10px",
    borderRadius: "12px",
    fontSize: "12px",
    fontWeight: 500,
    color: "white",
  },
  timerRow: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    marginBottom: "4px",
    flexWrap: "wrap",
  },
  timerBadge: {
    padding: "2px 6px",
    borderRadius: "4px",
    fontSize: "10px",
    color: "white",
  },
  distance: {
    fontSize: "11px",
    color: "#666",
  },
  noTimers: {
    color: "#9ca3af",
    fontStyle: "italic",
  },
  button: {
    padding: "8px 16px",
    background: "#3b82f6",
    color: "white",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "13px",
  },
  small: {
    color: "#666",
  },
  loading: {
    padding: "60px",
    textAlign: "center",
    color: "#666",
  },
  error: {
    padding: "60px",
    textAlign: "center",
    color: "#ef4444",
  },
};
