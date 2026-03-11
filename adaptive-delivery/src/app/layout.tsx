import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Adaptive Delivery | Vitrine Inteligente",
  description:
    "Sistema de delivery que adapta a vitrine em tempo real com base na sua navegação.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body className="min-h-screen bg-surface-50">{children}</body>
    </html>
  );
}
