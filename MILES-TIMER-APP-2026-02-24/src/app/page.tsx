export default function Home() {
  return (
    <div
      style={{
        fontFamily: "system-ui, -apple-system, sans-serif",
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        padding: "20px",
      }}
    >
      <div
        style={{
          background: "white",
          borderRadius: "16px",
          padding: "50px",
          maxWidth: "500px",
          width: "100%",
          textAlign: "center",
          boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
        }}
      >
        <h1 style={{ fontSize: "32px", margin: "0 0 10px 0" }}>🏃 Miles Republic</h1>
        <p style={{ color: "#666", margin: "0 0 40px 0" }}>
          Système de gestion des devis chronométrage
        </p>

        <div style={{ display: "grid", gap: "15px" }}>
          <a
            href="/admin"
            style={{
              display: "block",
              padding: "20px",
              background: "#f5f5f5",
              borderRadius: "10px",
              textDecoration: "none",
              color: "#333",
            }}
          >
            <h3 style={{ margin: "0 0 5px 0" }}>📊 Espace Admin</h3>
            <p style={{ margin: 0, fontSize: "14px", color: "#666" }}>
              Gérer les leads et les chronométreurs
            </p>
          </a>

          <div
            style={{
              padding: "20px",
              background: "#f9fafb",
              borderRadius: "10px",
            }}
          >
            <h3 style={{ margin: "0 0 5px 0" }}>🔧 Espace Chronométreur</h3>
            <p style={{ margin: 0, fontSize: "14px", color: "#666" }}>
              Accédez via le lien reçu par email
            </p>
          </div>
        </div>

        <p style={{ marginTop: "30px", fontSize: "12px", color: "#999" }}>
          Système interne Miles Republic
        </p>
      </div>
    </div>
  );
}
