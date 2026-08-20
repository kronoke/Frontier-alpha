import './globals.css';

export const metadata = {
  title: 'Frontier — Make the impossible buildable',
  description: 'An ambition-to-reality engine that works backward from what you want to exist and maps a path toward building it.',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
