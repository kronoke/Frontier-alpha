import './globals.css';

export const metadata = {
  title: 'Frontier Alpha',
  description: 'AI-assisted scientific discovery engine',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
