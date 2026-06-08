import "./globals.css";
import "../styles/layout.css";

export const metadata = {
  title: 'Fundación Exalumnos UCR',
  description: 'Directorio Estudiantil',
}

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
