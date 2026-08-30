import './globals.css';
import { ThemeProvider } from '../components/ThemeProvider';
import Nav from '../components/Nav';
import Footer from '../components/Footer';

export const metadata = {
  metadataBase: new URL('https://giridirghraj.vercel.app'),
  title: {
    default: 'DRJ | Developer Portfolio',
    template: '%s | DRJ'
  },
  description: 'DRJ - Frontend developer and open-source enthusiast from Nepal. Interfaces with clarity, intent, and curiosity.',
  keywords: ['DRJ', 'portfolio', 'frontend developer', 'Nepal', 'Next.js', 'open source'],
  openGraph: {
    title: 'DRJ | Developer Portfolio',
    description: 'Frontend developer and open-source enthusiast from Nepal.',
    url: '/',
    siteName: 'DRJ Portfolio',
    type: 'website'
  },
  robots: { index: true, follow: true },
  icons: {
    icon: '/assets/images/logo.png',
    apple: '/assets/images/logo.png'
  }
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#f7f5f0' },
    { media: '(prefers-color-scheme: dark)', color: '#0b1220' }
  ]
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
