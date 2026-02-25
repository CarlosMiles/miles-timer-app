"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";

const STATUS_OPTIONS = [
  { value: "NON_DISPONIBLE", label: "❌ Non disponible", color: "#dc2626" }, // Rouge vif
  { value: "DISPONIBLE", label: "✅ Disponible", color: "#22c55e" }, // Vert
  { value: "DEVIS_ENVOYE", label: "📄 Devis envoyé", color: "#16a34a" }, // Vert plus foncé
  { value: "GAGNE", label: "🏆 Gagné", color: "#15803d" }, // Vert foncé
  { value: "PERDU", label: "😞 Perdu", color: "#dc2626" }, // Rouge vif
];

interface Assignment {
  id: string;
  leadId: string;
  eventName: string;
  eventDate: string;
  city: string;
  postcode: string;
  participants?: number;
  organizerName: string;
  organizerEmail: string;
  status: string;
  distanceKm?: number;
  emailSentAt?: string;
  respondedAt?: string;
}

export default function TimerPortal() {
  const params = useParams();
  const token = params.token as string;

  const [data, setData] = useState<{ timer: any; assignments: Assignment[] } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updating, setUpdating] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, [token]);

  async function fetchData() {
    try {
      const res = await fetch(`/api/chrono/${token}/leads`);
      if (!res.ok) throw new Error("Failed");
      const data = await res.json();
      setData(data);
    } catch (e) {
      setError("Erreur lors du chargement");
    } finally {
      setLoading(false);
    }
  }

  async function updateStatus(leadId: string, status: string) {
    setUpdating(leadId);
    try {
      const res = await fetch(`/api/chrono/${token}/lead/${leadId}/status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error("Failed");
      fetchData();
    } catch (e) {
      alert("Erreur lors de la mise à jour");
    } finally {
      setUpdating(null);
    }
  }

  if (loading) return <div style={styles.loading}>Chargement...</div>;
  if (error) return <div style={styles.error}>{error}</div>;
  if (!data) return null;

  const { timer, assignments } = data;

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <h1 style={styles.title}>🏃 {timer.name}</h1>
        <p style={styles.subtitle}>Portail chronométreur - Miles Republic</p>
      </header>

      {assignments.length === 0 ? (
        <div style={styles.empty}>
          <p>Aucune demande pour le moment.</p>
          <p style={styles.emptySub}>
            Vous recevrez un email dès qu&apos;une nouvelle demande sera disponible dans votre zone.
          </p>
        </div>
      ) : (
        <div style={styles.grid}>
          {assignments.map((a) => (
            <div key={a.id} style={styles.card}>
              <div style={styles.cardHeader}>
                <h3 style={styles.eventName}>{a.eventName}</h3>
                {a.distanceKm && (
                  <span style={styles.distance}>{Math.round(a.distanceKm)} km</span>
                )}
              </div>

              <div style={styles.details}>
                <div style={styles.detailRow}>
                  <span style={styles.detailLabel}>📅</span>
                  <span>{new Date(a.eventDate).toLocaleDateString("fr-FR")}</span>
                </div>
                <div style={styles.detailRow}>
                  <span style={styles.detailLabel}>📍</span>
                  <span>
                    {a.city} ({a.postcode})
                  </span>
                </div>
                <div style={styles.detailRow}>
                  <span style={styles.detailLabel}>👥</span>
                  <span>{a.participants || "Non précisé"} participants</span>
                </div>
              </div>

              <div style={styles.organizer}>
                <h4 style={styles.sectionTitle}>Organisateur</h4>
                <p style={styles.organizerName}>{a.organizerName}</p>
                <p style={styles.organizerContact}>
                  <a href={`mailto:${a.organizerEmail}`}>{a.organizerEmail}</a>
                </p>
              </div>

              {/* Quick action buttons */}
              <div style={styles.quickActions}>
                <button
                  onClick={() => updateStatus(a.leadId, "DISPONIBLE")}
                  disabled={updating === a.leadId || a.status === "DISPONIBLE"}
                  style={styles.availableButton}
                >
                  ✅ Je suis dispo. En savoir plus ici
                </button>
                <button
                  onClick={() => updateStatus(a.leadId, "NON_DISPONIBLE")}
                  disabled={updating === a.leadId || a.status === "NON_DISPONIBLE"}
                  style={styles.unavailableButton}
                >
                  ❌ Non disponible
                </button>
              </div>

              {/* Full status selector */}
              <div style={styles.statusSection}>
                <h4 style={styles.sectionTitle}>Mettre à jour le statut</h4>
                <div style={styles.statusGrid}>
                  {STATUS_OPTIONS.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => updateStatus(a.leadId, option.value)}
                      disabled={updating === a.leadId || a.status === option.value}
                      style={{
                        ...styles.statusButton,
                        backgroundColor:
                          a.status === option.value ? option.color : "#f3f4f6",
                        color: a.status === option.value ? "white" : "#374151",
                        border: a.status === option.value ? "none" : "1px solid #e5e7eb",
                      }}
                    >
                      {a.status === option.value && "✓ "}
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    fontFamily: "system-ui, -apple-system, sans-serif",
    maxWidth: "800px",
    margin: "0 auto",
    padding: "20px",
  },
  header: {
    marginBottom: "30px",
    textAlign: "center",
  },
  title: {
    fontSize: "24px",
    margin: "0 0 5px 0",
  },
  subtitle: {
    color: "#666",
    margin: 0,
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
  empty: {
    textAlign: "center",
    padding: "60px 20px",
    background: "#f9fafb",
    borderRadius: "12px",
  },
  emptySub: {
    color: "#666",
    marginTop: "10px",
  },
  grid: {
    display: "grid",
    gap: "20px",
  },
  card: {
    background: "white",
    borderRadius: "12px",
    padding: "20px",
    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
  },
  cardHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: "15px",
  },
  eventName: {
    fontSize: "18px",
    margin: 0,
    flex: 1,
  },
  distance: {
    background: "#dbeafe",
    color: "#1e40af",
    padding: "4px 10px",
    borderRadius: "12px",
    fontSize: "12px",
    fontWeight: 500,
  },
  details: {
    marginBottom: "20px",
  },
  detailRow: {
    display: "flex",
    gap: "10px",
    marginBottom: "8px",
    color: "#374151",
  },
  detailLabel: {
    width: "24px",
    textAlign: "center",
  },
  organizer: {
    background: "#f9fafb",
    padding: "15px",
    borderRadius: "8px",
    marginBottom: "15px",
  },
  sectionTitle: {
    fontSize: "12px",
    textTransform: "uppercase",
    color: "#666",
    margin: "0 0 8px 0",
  },
  organizerName: {
    fontWeight: 600,
    marginBottom: "4px",
  },
  organizerContact: {
    margin: "2px 0",
    fontSize: "14px",
  },
  quickActions: {
    display: "flex",
    gap: "10px",
    marginBottom: "20px",
    flexWrap: "wrap",
  },
  availableButton: {
    padding: "12px 20px",
    background: "#22c55e",
    color: "white",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: 500,
    flex: "1 1 auto",
  },
  unavailableButton: {
    padding: "12px 20px",
    background: "#dc2626",
    color: "white",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: 500,
    flex: "1 1 auto",
  },
  statusSection: {
    marginTop: "15px",
    paddingTop: "15px",
    borderTop: "1px solid #e5e7eb",
  },
  statusGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
    gap: "8px",
  },
  statusButton: {
    padding: "10px 12px",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "13px",
    fontWeight: 500,
    transition: "all 0.2s",
  },
};
