export const metadata = {
  title: "Miles Republic - Devis Chrono",
  description: "Gestion des devis chronométrage",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body style={{ margin: 0, background: "#f5f5f5" }}>{children}</body>
    </html>
  );
}
