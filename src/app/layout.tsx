import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Alumni UCR Foundation',
  description: 'Plataforma para egresados de la UCR',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
