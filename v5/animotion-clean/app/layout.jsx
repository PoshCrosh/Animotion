import './globals.css';
import { AppProvider } from '../lib/store';

export const metadata = {
  title: 'Animotion — Learn Animation',
  description:
    'A gamified animation learning platform. Master the 12 principles through interactive lessons, an AI mentor, and a creative editor.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link
          rel="icon"
          href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🎬</text></svg>"
        />
      </head>
      <body suppressHydrationWarning>
        <AppProvider>{children}</AppProvider>
      </body>
    </html>
  );
}
