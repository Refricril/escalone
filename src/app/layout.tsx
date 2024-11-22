// src/app/layout.tsx
import './globals.css';

export const metadata = {
  title: 'Escalone',
  description: 'Aplicação de gerenciamento',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>
        <main>{children}</main>
      </body>
    </html>
  );
}
