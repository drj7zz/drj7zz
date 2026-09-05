import './globals.css';
import { ThemeProvider } from '../components/ThemeProvider';
import Nav from '../components/Nav';
import Footer from '../components/Footer';

export const metadata = {
  metadataBase: new URL('https://giridirghraj.vercel.app'),
  title: {
    default: 'DRJ7ZZ | Dirghraj Giri - Frontend Developer',
    template: '%s | DRJ7ZZ'
  },
  description: 'DRJ7ZZ is the portfolio of Dirghraj Giri (Dirghraj), a frontend developer from Nepal building responsive, accessible web experiences with JavaScript and Next.js.',
  keywords: ['DRJ7ZZ', 'DRJ', 'Dirghraj Giri', 'Dirghraj', 'Giridirghraj', 'frontend developer', 'frontend developer Nepal', 'JavaScript developer', 'Next.js developer', 'responsive web development', 'accessible web development', 'developer portfolio Nepal'],
  authors: [{ name: 'Dirghraj Giri', url: 'https://github.com/drj7zz' }],
  creator: 'Dirghraj Giri',
  publisher: 'DRJ7ZZ',
  alternates: { canonical: '/' },
  openGraph: {
    title: 'DRJ7ZZ | Dirghraj Giri - Frontend Developer',
    description: 'Portfolio of Dirghraj Giri (DRJ7ZZ), a frontend developer from Nepal.',
    url: '/',
    siteName: 'DRJ7ZZ Portfolio',
    type: 'website',
    locale: 'en_US',
    images: [{ url: '/assets/images/profile.jpg', width: 800, height: 1000, alt: 'Dirghraj Giri, also known as DRJ7ZZ' }]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'DRJ7ZZ | Dirghraj Giri - Frontend Developer',
    description: 'Portfolio of Dirghraj Giri (DRJ7ZZ), frontend developer from Nepal.',
    images: ['/assets/images/profile.jpg']
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1, 'max-video-preview': -1 }
  },
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
  const websiteSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'DRJ7ZZ Portfolio',
    url: 'https://giridirghraj.vercel.app',
    description: 'Official portfolio of Dirghraj Giri (DRJ7ZZ), frontend developer from Nepal.',
    author: {
      '@type': 'Person',
      name: 'Dirghraj Giri',
      url: 'https://giridirghraj.vercel.app'
    }
  };

  const personSchema = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: 'Dirghraj Giri',
    alternateName: ['DRJ7ZZ', 'DRJ', 'Dirghraj', 'Giridirghraj'],
    url: 'https://giridirghraj.vercel.app',
    image: 'https://giridirghraj.vercel.app/assets/images/profile.jpg',
    jobTitle: 'Frontend Developer',
    description: 'Frontend developer and software engineer from Nepal crafting high-performance, accessible web interfaces.',
    address: { '@type': 'PostalAddress', addressCountry: 'NP', addressLocality: 'Parsa, Madhesh' },
    sameAs: [
      'https://github.com/drj7zz',
      'https://www.linkedin.com/in/dirghraj-giri',
      'https://www.instagram.com/drj1zz',
      'https://x.com/drj7zz',
      'https://www.reddit.com/user/Ok-Fox-4670'
    ],
    knowsAbout: ['Frontend Engineering', 'JavaScript', 'TypeScript', 'Next.js', 'React', 'CSS Architecture', 'Web Accessibility (WCAG)', 'Git', 'Open Source']
  };

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
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(personSchema) }} />
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
