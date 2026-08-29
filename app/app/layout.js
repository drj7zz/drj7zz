import './globals.css';
import { ThemeProvider } from '../components/ThemeProvider';
import Nav from '../components/Nav';
import Footer from '../components/Footer';

export const metadata = {
  title: 'DRJ | Developer Portfolio',
  description: 'DRJ - Frontend developer and open-source enthusiast from Nepal. Interfaces with clarity, intent, and curiosity.',
  icons: {
    icon: '/assets/images/logo.png',
    apple: '/assets/images/logo.png'
  }
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=Manrope:wght@400;500;600;700;800&family=Sora:wght@500;600;700;800&family=Space+Grotesk:wght@500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <ThemeProvider>
          <div className="page-shell">
            <Nav />
            <main id="main-content">
              {children}
            </main>
            <Footer />
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
